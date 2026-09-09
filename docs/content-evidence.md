# Content evidence and review ledger

Reviewed 2026-09-09 for the Milestone 13 content update. No applicable AGENTS.md found in the workspace or ancestor directories. The adjacent core repository was inspected and left untouched. Public source: https://github.com/epochgrid/epochgrid.

## Publication baseline

Pinned commit: `d6acbb0b127a6fb343569459a8ab4f2efa1266c5`, public main after the Milestone 13 merge. README marks Milestones 0–13 complete: manual device verification, persistent key-change warnings and a signed Merkle registration log are implemented. The implementation commit `b0fbde6165288d509a8c0f4b0f7cd133e7c99390` passed public core CI; the merge commit also passed its public CI run. A clean temporary checkout of public main was used alongside the adjacent repository, which was left untouched.

The site incorporates the published Milestone 13 changes. No later uncommitted core work is represented as published. Source URLs are pinned centrally in `src/site.ts`.

Public GitHub had no releases and Discussions was disabled at review. Cargo workspace version 0.1.0 is metadata, not a published release. The core license is MIT, copyright 2026 EpochGrid contributors; the website uses that established notice. No separate ADR directory, official logo, examples directory or package publishing workflow was found. Runnable examples are in README and scripts/dev.

The user-created website repository is https://github.com/epochgrid/epochgrid.org. Website changes use feature branches and pull requests; main is protected. The canonical domain is https://epochgrid.org with no repository base path.

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

### Milestone 13 evidence

- `docs/device-verification.md`, `docs/architecture.md`, `docs/protocol.md`, `SECURITY.md` and `docs/threat-model.md` establish manual full-fingerprint comparison, persistent changed-device state, signer pinning, checkpoint/prefix validation, the log's limits and unchanged endpoint/metadata exposure.
- `crates/epochgrid-core/src/trust.rs` implements fingerprints, local trust states, manual verification, signer pins and SQLite migration 2. `transparency.rs` validates snapshots, signed checkpoints, prefix history and atomic KV appends. Client commands and service integration cases are present in the same snapshot.
- The updated developer commands match README and the verification guide. They were inspected, not executed against the user's development infrastructure.

### MVP/production-alpha target scope

README names Milestone 14 (revocation and MLS rekeying) as next, and Milestones 15–20 (encrypted recovery, attachments, ephemeral events, receipts, message relationships and secure service participants) as planned. No public GitHub milestones, open issues or releases supplied a narrower release cutoff at review. The site presents these as the documented development direction toward the requested MVP/production alpha, explicitly without inventing a release boundary, date or production acceptance criteria. The completed two-device MVP remains distinct from this broader target.

## Maintainer review and material limitations

- Matrix and Signal are requested related-work topics; historical influence is not documented in source. The website explicitly presents conceptual comparisons, not attributed influences or interoperability commitments. NATS and MLS are actual dependencies.
- Technology tradeoffs are editorial analysis of implemented roles, not maintainer quotations or recorded selection ADRs. Maintainers should review this interpretation.
- No production audit, benchmark, adoption evidence, release schedule or cross-application interoperability test suite is established. The website makes no such claims.
- Development commands were checked against committed README/scripts. The website task did not rerun the Rust/infrastructure suite or touch existing .dev state; the public core CI results are distinct evidence.
- Milestones 12 and 13 are implemented alpha code. Its experimental label describes maturity, not an unmerged branch. Future roadmap entries remain explicitly planned.

Long-form pages carry source notes. Refresh this ledger, source revision and claims together when core behavior changes.
