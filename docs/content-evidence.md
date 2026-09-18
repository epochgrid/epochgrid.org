# Content evidence and review ledger

Reviewed 2026-09-18 against public core main at `d398b353d3ac3480297408847990b9eca2ac9f33`, using a clean temporary clone. The adjacent development repository was not modified. No applicable AGENTS.md was found. Source links are pinned centrally in `src/site.ts`.

The website repository is https://github.com/epochgrid/epochgrid.org; its canonical domain is https://epochgrid.org. Updates use a feature branch and pull request against protected main.

## Current publication baseline

The README marks Milestones 0–16 and 18–20 complete. Milestone 17 is partial: encrypted ephemeral transport exists, but live typing UI is unreliable and deferred under TD-001. Milestone 21 dynamic admission is implemented. Milestone 22 has signed coordinator policies, exact group grants and transactional revocation; normal dynamic CLI/TUI messaging is explicitly unsupported pending integration.

GitHub's public releases API returned no releases at review. Workspace version 0.1.0 is package metadata, not a release. The three crates remain epochgrid-core, epochgrid-client (epochgrid binary), and epochgrid-service. The pinned toolchain is Rust 1.98.1; Cargo's minimum Rust version is a separate constraint. The MIT license remains unchanged. The core workflow validates rather than publishes packages; a local GHCR-shaped development image tag is not a published artifact.

## Evidence map

| Website subject                                                     | Repository evidence                                                                                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Milestone status, alpha direction and runnable static fixture       | README.md; SECURITY.md; docs/mvp-acceptance.md                                                                                                                            |
| Device verification, revocation, recovery and attachments           | docs/device-verification.md; docs/device-revocation.md; docs/encrypted-recovery.md; docs/attachments.md                                                                   |
| Ephemeral transport and deferred typing                             | docs/ephemeral-events.md; docs/technical-debt.md; crates/epochgrid-core/src/ephemeral.rs                                                                                  |
| Device receipt semantics and persistence                            | docs/receipts.md; crates/epochgrid-core/src/receipts.rs                                                                                                                   |
| Stable IDs, immutable relationship events and author restrictions   | docs/message-relations.md; crates/epochgrid-core/src/relationships.rs                                                                                                     |
| Explicit participant plaintext boundary and restart-safe processing | docs/service-participants.md; crates/epochgrid-core/src/participants.rs; crates/epochgrid-client/src/participant.rs                                                       |
| Canonical identity and dynamic admission                            | docs/architecture/auth-migration.md; docs/operator/auth-callout.md; crates/epochgrid-core/src/identity_model.rs; auth_callout.rs; crates/epochgrid-service/src/dynamic.rs |
| Partial dynamic authorization and remaining integration             | docs/architecture/dynamic-authorization.md; crates/epochgrid-core/src/authorization.rs; auth_callout.rs                                                                   |
| Storage, metadata and security layers                               | docs/architecture.md; docs/protocol.md; docs/threat-model.md; SECURITY.md                                                                                                 |
| Dependencies and executable setup                                   | Cargo.toml; Cargo.lock; crates/*/Cargo.toml; rust-toolchain.toml; README.md; docs/development.md; scripts/dev/; .github/workflows/ci.yaml                                 |

The reviewed code includes policy signature/generation/coordinator validation and transactional updates, callout freshness/identity/nonce/TLS checks, receipt persistence, relationship author validation, and participant processing. Repository test coverage is evidence of implementation, not a security audit. This website task runs the website suite; it does not rerun the Rust/NATS infrastructure suite or touch existing development state.

## Material uncertainties and editorial decisions

- Older README prose says typing indicators are automatic, while the current status table and TD-001 explicitly report unreliable UI and disabled default live assertions. The website follows the current limitation; a passing smoke test does not certify typing.
- Earlier architecture and revocation sections describe static per-device enrollment and broker reload. The newer migration/operator documents explicitly restrict that path to `--dev-static`. The website keeps it as the runnable full-message fixture and does not represent dynamic messaging as finished.
- The backend now owns a SQLite authorization registry. Older wording that SQLite belongs only to clients was removed. The metadata backend remains outside chat plaintext; explicitly invited service participants are intentional plaintext endpoints.
- Milestone 22 policy/grant implementation does not establish filtered consumer or Welcome-relay convergence. The site identifies these as remaining work and avoids a misleading contiguous “all milestones complete” label.
- Auth Callout enforces TLS in its normal service profile, but integration tests can opt into development plaintext. Operator/JWT mode, clustered BYO-NATS, protected local secrets, operational qualification and release artifacts remain gates. No release date or completed production-alpha qualification is asserted.
- Matrix and Signal remain conceptual comparisons, not documented historical influences or interoperability commitments. Technology rationale is editorial analysis where no selection ADR exists. Maintainers should review those interpretations.
- Commands were checked against the source README, feature guides and service argument parsing. Static setup now requires `epochgrid-service --dev-static`. Canonical identity migration requires fresh enrollment and re-invitation, not renaming existing MLS credentials.

Refresh this ledger, source revision and page claims together. GitHub remains authoritative for subsequent changes.

## Website validation for this review

`npm run validate` passed formatting, ESLint, Astro/TypeScript (zero diagnostics), the seven-route production build, nine static tests, 144 internal links/assets and 17 Playwright tests. Browser checks cover every route in both themes at 320, 375, 768, 1024, 1440 and 1920 pixels. Axe checks at 375 and 1440 found no violations; screenshots were generated and reviewed as an overview. All 26 unique pinned source-document paths exist in the reviewed checkout. `git diff --check` passed.

The portable output totals approximately 210 KiB, including about 149 KiB of HTML and 11 KiB of CSS. Existing inline controls remain the only executable client JavaScript; this content update adds none.
