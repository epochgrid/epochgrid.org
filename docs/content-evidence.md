# Content evidence and review ledger

Reviewed 2026-09-08 before and during implementation. No applicable AGENTS.md found in the workspace or ancestor directories. The adjacent core repository was inspected and left untouched. Public source: https://github.com/epochgrid/epochgrid.

## Publication baseline

Pinned commit: `0012ec15ba02c8e82e769a37b8f5f4014aa0e559`. This documents the completed Milestones 0–12 alpha and the planned next milestones. Its parent `426a9f127e3418818dff2ef52b39114d053e3d8e` implements independent user devices and ordered membership catch-up. Both commits' public core CI runs completed successfully during this task.

The core repository was independently updated during site work; the site incorporates the published changes. No later uncommitted core work is represented as published. Source URLs are pinned centrally in `src/site.ts`.

Public GitHub had no releases and Discussions was disabled at review. Cargo workspace version 0.1.0 is metadata, not a published release. The core license is MIT, copyright 2026 EpochGrid contributors; the website uses that established notice. No separate ADR directory, official logo, examples directory or package publishing workflow was found. Runnable examples are in README and scripts/dev.

The user-created website repository is https://github.com/epochgrid/epochgrid.org. It was public and empty at inspection. The canonical domain is https://epochgrid.org with no repository base path.

## Evidence map

| Claim                                                              | Core repository evidence                                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Unaudited development alpha; milestone status and plans            | README.md, SECURITY.md, docs/mvp-acceptance.md                                                                      |
| NATS transport, NKey auth, service enrollment, verified identity   | docs/architecture.md, docs/protocol.md, crates/epochgrid-core/src/identity.rs, crates/epochgrid-service/src/main.rs |
| MLS PrivateMessages and authenticated Welcome                      | crates/epochgrid-core/src/messaging.rs, groups.rs; docs/protocol.md                                                 |
| Durable mailbox, CHAT, offline history, outbox, local transactions | docs/architecture.md, recovery.md; delivery.rs, history.rs                                                          |
| TUI and reconnect                                                  | docs/tui.md, crates/epochgrid-client/src/tui/                                                                       |
| Multi-device alpha, creator-only additions, epoch limitations      | docs/multi-device.md, devices.rs, epochs.rs, groups.rs, service integration tests                                   |
| Security gaps and metadata exposure                                | SECURITY.md, docs/threat-model.md                                                                                   |
| Dependencies, binaries, supported toolchain                        | Cargo.toml, crates/*/Cargo.toml, Cargo.lock, rust-toolchain.toml                                                    |
| Development commands and local OCI build, no publishing            | README.md, scripts/dev/*, config/nats.Dockerfile, compose.yaml, .github/workflows/ci.yml, CONTRIBUTING.md           |

## Maintainer review and material limitations

- Matrix, Signal and SCION are requested related-work topics; historical influence is not documented in source. The website explicitly presents conceptual comparisons, not attributed influences or interoperability commitments. NATS and MLS are actual dependencies.
- Technology tradeoffs are editorial analysis of implemented roles, not maintainer quotations or recorded selection ADRs. Maintainers should review this interpretation.
- No production audit, benchmark, adoption evidence, release schedule or cross-application interoperability test suite is established. The website makes no such claims.
- Development commands were checked against committed README/scripts. The website task did not rerun the Rust/infrastructure suite or touch existing .dev state; the public core CI results are distinct evidence.
- Milestone 12 is implemented alpha code. Its experimental label describes maturity, not an unmerged branch. Future roadmap entries remain explicitly planned.

Long-form pages carry source notes. Refresh this ledger, source revision and claims together when core behavior changes.
