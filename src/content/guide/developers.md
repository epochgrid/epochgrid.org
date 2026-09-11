---
title: "Developer guide"
description: "A short path from source checkout to the local messaging flow, with the repository as the authoritative guide."
eyebrow: "05 / Developers"
sources:
  - label: "Device revocation and MLS rekeying"
    path: "docs/device-revocation.md"
  - label: "Encrypted identity-administration recovery"
    path: "docs/encrypted-recovery.md"
  - label: "Encrypted attachments"
    path: "docs/attachments.md"
  - label: "Device verification and registration transparency"
    path: "docs/device-verification.md"
  - label: "Canonical setup and examples"
    path: "README.md"
  - label: "Pinned Rust toolchain"
    path: "rust-toolchain.toml"
  - label: "Complete verification gate"
    path: "scripts/dev/verify.sh"
  - label: "Contributor workflow"
    path: "CONTRIBUTING.md"
  - label: "Multi-device enrollment"
    path: "docs/multi-device.md"
  - label: "Recovery guide"
    path: "docs/recovery.md"
---

## Start with the repository

The project lives in **epochgrid/epochgrid**. Use the resource links below for current source, issues, releases and contribution instructions. GitHub Discussions was disabled at review time; use an issue for scope discussion. There were no published releases, and core CI did not publish packages.

The commands below were checked against the pinned source README and scripts. They are development instructions, not a production deployment recipe. Consult the current README if the main branch has moved.

## Prerequisites

Install Git, rustup, a C toolchain for bundled SQLite, Docker Engine with Compose v2, Bash, Python 3, curl, tar and sha256sum. The core repository pins Rust `1.98.1`. Development images support Linux amd64 and arm64, including Linux Docker on macOS. Host integration tests require Linux or a native NATS binary selected through `NATS_SERVER`.

Node is needed to edit this website, not to build the Rust project.

## Clone, build and test

```bash
git clone https://github.com/epochgrid/epochgrid.git
cd epochgrid
cargo build --locked --workspace
cargo test --locked --workspace
cargo fmt --check
cargo clippy --locked --workspace --all-targets --all-features -- -D warnings
```

Ordinary Cargo tests do not require a running NATS server. The complete repository gate also downloads pinned NATS, runs live integration cases and exercises Compose and terminal clients:

```bash
./scripts/dev/verify.sh
```

Close active development clients and the host service before running the full gate; its Compose smoke test uses the development stack. Passing this gate is not a security audit.

## Run the local flow

Bootstrap builds the binaries, prepares Alice/Bob/service identities and starts loopback NATS with JetStream. It retains existing device identities and persistent data.

```bash
./scripts/dev/bootstrap-nats.sh
```

Start the service in another terminal and leave it running:

```bash
./target/debug/epochgrid-service
```

Back in your setup terminal, register the prepared devices:

```bash
./scripts/dev/create-alice.sh
./scripts/dev/create-bob.sh
```

Before first discovery, consider independently obtaining and pinning the service's public NKey. Otherwise the first validated log checkpoint establishes trust on first use. See “Verify device identity” below and the pinned verification guide for the exact trust model.

For a fresh group, create and invite as Alice, then join as Bob:

```bash
./target/debug/epochgrid --home .dev/alice identity lookup bob
./target/debug/epochgrid --home .dev/alice channel create engineering
./target/debug/epochgrid --home .dev/alice channel invite engineering bob
./target/debug/epochgrid --home .dev/bob channel join --from alice
```

Skip creation and joining when resuming an existing group. Run one terminal client per device, in separate terminals:

```bash
./target/debug/epochgrid --home .dev/alice tui
./target/debug/epochgrid --home .dev/bob tui
```

One process may use a device directory at a time. The TUI's `/quit` exits. `docker compose down` stops the infrastructure while retaining data. Reopen using the same device directory to resume; do not reinitialize identities as a recovery step.

> This setup has no TLS and stores local private state and transcripts unencrypted. Use disposable development conversations and trusted private directories. The source threat model documents these boundaries in detail.

## Verify device identity

Milestone 13 adds manual fingerprint verification and audited discovery. For an existing installation, stop clients and the service, preserve device databases and NATS data, rerun bootstrap, then restart the upgraded service. Upgrade every client; new clients require the updated audit API. Do not reopen migrated databases with older binaries.

For an independent service-key pin, obtain the service's public NKey from the operator through a trusted channel and run `transparency pin` before first discovery. Without it, the first successfully validated checkpoint pins the signer by trust on first use. The verification guide below documents this setup and the refusal to replace existing pins.

Close each device's TUI before using CLI commands on its home directory. Bob displays his own fingerprint locally:

```bash
./target/debug/epochgrid --home .dev/bob device fingerprint
```

Alice obtains Bob's complete fingerprint through an independent channel, compares it with her observed value, and supplies the independently received value:

```bash
./target/debug/epochgrid --home .dev/alice device fingerprint bob laptop
./target/debug/epochgrid --home .dev/alice device verify bob laptop --fingerprint 'FULL FINGERPRINT FROM BOB'
./target/debug/epochgrid --home .dev/alice transparency audit
./target/debug/epochgrid --home .dev/alice transparency status
```

Replace the placeholder with all 64 hexadecimal digits. Each device requires separate verification. An observed identity change persists and blocks audited discovery, invitation and joining; inspect retained evidence with `device fingerprint bob laptop --offline`. Do not delete the database to suppress a warning. The signed log detects changes against retained history, not all malicious first views or isolated split views.

## Revocation, recovery and attachments

Milestones 14–16 require updated clients, service and bootstrap configuration. Stop clients and the service, preserve device directories and the NATS volume, rerun bootstrap, then restart. Do not mix old and new clients or downgrade migrated databases. Upgrade every member before sending attachments: old clients cannot safely render manifests containing file keys.

**Device revocation (14).** An active same-user installation or the operator can revoke an exact device. `device revoke USER DEVICE` is irreversible; read the pinned revocation guide before using it. Success excludes its NKey from the managed broker, while offline groups still await coordinator rekeying. Known revoked-epoch queued sends remain blocked for explicit resend.

**Encrypted identity-administration recovery (15).** `recovery export --output PACKAGE --secret-file SECRET` creates separate new files; protect the secret separately. `recovery restore --input PACKAGE --secret-file SECRET` requires an empty home. The restored home can administer identity while authorized, but has no MLS keys, history or attachment manifests and cannot chat. Follow the recovery guide for fresh device enrollment, lost-device revocation and re-invitation. Do not delete a working home to test restoration.

**Encrypted attachments (16).** After both devices have joined, send a local file and explicitly save it on the receiving device:

```bash
./target/debug/epochgrid --home .dev/alice attachment send engineering ./report.pdf --mime application/pdf
./target/debug/epochgrid --home .dev/bob channel sync engineering
./target/debug/epochgrid --home .dev/bob attachment list engineering
./target/debug/epochgrid --home .dev/bob attachment save engineering ATTACHMENT_ID ./saved-report.pdf
```

Use the ID printed by send/list/history and a new output path. The TUI also supports `/attach PATH` and `/save ID OUTPUT_PATH`. Transfers need connectivity; defaults are 8 MiB per file and seven-day object retention. Downloads authenticate before writing and refuse overwrite. Saved files are plaintext, are not opened automatically and are not part of recovery exports. The source guides below document configuration, migration and failure handling.

## Repository map

- **`crates/epochgrid-core/`** — wire protocol, identities, trust and revocation, encrypted recovery and attachments, groups, durable delivery and SQLite/OpenMLS storage.
- **`crates/epochgrid-client/`** — the `epochgrid` CLI, chat mode and Ratatui frontend.
- **`crates/epochgrid-service/`** — the `epochgrid-service` identity service and live integration tests.
- **`docs/`** — architecture, protocol, threat model, recovery, acceptance, TUI, multi-device and device-verification notes.
- **`scripts/dev/`** — bootstrap, identity helpers, verification and smoke tests.
- **`config/` and `compose.yaml`** — the locally built NATS development image and Compose stack.

## Contribute and go deeper

Keep changes within the executable milestone and discuss broader scope in an issue first. Wire changes need compatibility review; authentication and storage changes need negative and restart tests. Never commit `.dev/`, credentials, private keys or databases.

The footer links to the current source, issue tracker and release location. The pinned source notes below provide the exact setup and contributor documentation behind this page. For website-only changes, follow the website repository's README and CONTRIBUTING guide.
