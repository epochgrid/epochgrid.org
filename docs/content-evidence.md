# Content evidence and review ledger

Reviewed 2026-09-10 for the Milestone 16 content update. No applicable AGENTS.md found in the workspace or ancestor directories. The adjacent core repository was inspected and left untouched. Public source: https://github.com/epochgrid/epochgrid.

## Publication baseline

Pinned commit: `fac33578ef393954f24295fd891f0190fc3a8cd7`, public main after Milestone 16. README marks Milestones 0–16 complete. The attachment implementation commit `174369e8d15bd7194ebcd492b1a6bc6699cfe05b` and the public merge commit both passed core CI. A clean temporary checkout of public main was inspected; the adjacent core working tree was left untouched.

The site incorporates the published Milestones 14–16 changes. No later uncommitted core work is represented as published. Source URLs are pinned centrally in `src/site.ts`.

Public GitHub had no releases and Discussions was disabled at review. Cargo workspace version 0.1.0 is metadata, not a published release. The core license is MIT, copyright 2026 EpochGrid contributors; the website uses that established notice. No separate ADR directory, official logo, examples directory or package publishing workflow was found. Runnable examples are in README and scripts/dev.

The user-created website repository is https://github.com/epochgrid/epochgrid.org. Website changes use feature branches and pull requests; main is protected. The canonical domain is https://epochgrid.org with no repository base path.

## Evidence map

| Claim                                                                 | Core repository evidence                                                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Unaudited development alpha; milestone status and plans               | README.md, SECURITY.md, docs/mvp-acceptance.md                                                                      |
| NATS transport, NKey auth, service enrollment, verified identity      | docs/architecture.md, docs/protocol.md, crates/epochgrid-core/src/identity.rs, crates/epochgrid-service/src/main.rs |
| MLS PrivateMessages and authenticated Welcome                         | crates/epochgrid-core/src/messaging.rs, groups.rs; docs/protocol.md                                                 |
| Durable mailbox, CHAT, offline history, outbox, local transactions    | docs/architecture.md, recovery.md; delivery.rs, history.rs                                                          |
| TUI and reconnect                                                     | docs/tui.md, crates/epochgrid-client/src/tui/                                                                       |
| Multi-device alpha, coordinator-managed membership, epoch limitations | docs/multi-device.md, devices.rs, epochs.rs, groups.rs, service integration tests                                   |
| Security gaps and metadata exposure                                   | SECURITY.md, docs/threat-model.md                                                                                   |
| Dependencies, binaries, supported toolchain                           | Cargo.toml, crates/*/Cargo.toml, Cargo.lock, rust-toolchain.toml                                                    |
| Development commands and local OCI build, no publishing               | README.md, scripts/dev/*, config/nats.Dockerfile, compose.yaml, .github/workflows/ci.yml, CONTRIBUTING.md           |

### Milestone 13 evidence

- `docs/device-verification.md`, `docs/architecture.md`, `docs/protocol.md`, `SECURITY.md` and `docs/threat-model.md` establish manual full-fingerprint comparison, persistent changed-device state, signer pinning, checkpoint/prefix validation, the log's limits and unchanged endpoint/metadata exposure.
- `crates/epochgrid-core/src/trust.rs` implements fingerprints, local trust states, manual verification, signer pins and SQLite migration 2. `transparency.rs` validates snapshots, signed checkpoints, prefix history and atomic KV appends. Client commands and service integration cases are present in the same snapshot.
- The updated developer commands match README and the verification guide. They were inspected, not executed against the user's development infrastructure.

### MVP/production-alpha target scope

README names Milestone 17 (ephemeral encrypted events) as next, with Milestones 18–20 (receipts, message relationships and secure service participants) planned. Revocation/rekeying, identity-administration recovery and encrypted attachments are now completed milestones, not future targets. No public release or GitHub milestone defines a fixed release cutoff at this review. The completed two-device MVP remains distinct from the broader alpha and any future production-readiness assessment.

### Milestones 14–16 evidence

- `docs/device-revocation.md`, `revocation.rs` and the service enforcement path establish irreversible signed requests, separate revocation checkpoints, durable enforcement intent, single-broker NATS reload/consumer deletion, coordinator succession and MLS removal. Offline completion and stale-checkpoint limitations remain explicit.
- `docs/encrypted-recovery.md` and `recovery.rs` establish AES-256-GCM control-credential/trust exports, separately held random secrets, authenticated empty-home restore and recovery-only restrictions. No MLS private state, transcript or attachment manifests are exported; a fresh messaging device and surviving coordinator are required.
- `docs/attachments.md`, `attachments.rs`, README and Cargo workspace establish Object Store integration, MLS-protected manifests, bounded authenticated downloads, explicit output paths, defaults and retention limits. Local DEKs/saved plaintext and shared-bucket availability limitations are documented.
- `docs/architecture.md`, `docs/protocol.md`, README, Cargo.toml and SECURITY.md were checked for cross-page consistency. The commands were inspected against source rather than executed against the user's infrastructure.

## Maintainer review and material limitations

- Matrix and Signal are requested related-work topics; historical influence is not documented in source. The website explicitly presents conceptual comparisons, not attributed influences or interoperability commitments. NATS and MLS are actual dependencies.
- Technology tradeoffs are editorial analysis of implemented roles, not maintainer quotations or recorded selection ADRs. Maintainers should review this interpretation.
- No production audit, benchmark, adoption evidence, release schedule or cross-application interoperability test suite is established. The website makes no such claims.
- Development commands were checked against committed README/scripts. The website task did not rerun the Rust/infrastructure suite or touch existing .dev state; the public core CI results are distinct evidence.
- Milestones 12–16 are implemented alpha code. The experimental label describes maturity, not an unmerged branch. Future roadmap entries remain explicitly planned.

Long-form pages carry source notes. Refresh this ledger, source revision and claims together when core behavior changes.
