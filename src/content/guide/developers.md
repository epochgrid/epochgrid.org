---
title: "Developer guide"
description: "A short path from source checkout to the local messaging flow, with the repository as the authoritative guide."
eyebrow: "05 / Developers"
sources:
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

## Repository map

- **`crates/epochgrid-core/`** — wire protocol, identities, groups, messages, durable delivery and SQLite/OpenMLS storage.
- **`crates/epochgrid-client/`** — the `epochgrid` CLI, chat mode and Ratatui frontend.
- **`crates/epochgrid-service/`** — the `epochgrid-service` identity service and live integration tests.
- **`docs/`** — architecture, protocol, threat model, recovery, acceptance, TUI and multi-device notes.
- **`scripts/dev/`** — bootstrap, identity helpers, verification and smoke tests.
- **`config/` and `compose.yaml`** — the locally built NATS development image and Compose stack.

## Contribute and go deeper

Keep changes within the executable milestone and discuss broader scope in an issue first. Wire changes need compatibility review; authentication and storage changes need negative and restart tests. Never commit `.dev/`, credentials, private keys or databases.

The footer links to the current source, issue tracker and release location. The pinned source notes below provide the exact setup and contributor documentation behind this page. For website-only changes, follow the website repository's README and CONTRIBUTING guide.
