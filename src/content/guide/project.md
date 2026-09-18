---
title: "The project"
description: "An unaudited messaging system exploring how a shared messaging fabric can carry conversations whose content is protected at the endpoints."
eyebrow: "01 / Project"
sources:
  - label: "Authentication migration"
    path: "docs/architecture/auth-migration.md"
  - label: "Dynamic authorization: implemented and remaining work"
    path: "docs/architecture/dynamic-authorization.md"
  - label: "Dynamic admission operator contract"
    path: "docs/operator/auth-callout.md"
  - label: "Deferred typing UI"
    path: "docs/technical-debt.md"
  - label: "Encrypted receipts"
    path: "docs/receipts.md"
  - label: "Message relationships"
    path: "docs/message-relations.md"
  - label: "Explicit service participants"
    path: "docs/service-participants.md"
  - label: "Ephemeral encryption boundaries"
    path: "docs/ephemeral-events.md"
  - label: "Device revocation and MLS rekeying"
    path: "docs/device-revocation.md"
  - label: "Encrypted identity-administration recovery"
    path: "docs/encrypted-recovery.md"
  - label: "Encrypted attachments"
    path: "docs/attachments.md"
  - label: "Device verification and registration transparency"
    path: "docs/device-verification.md"
  - label: "Project scope and runnable workflow"
    path: "README.md"
  - label: "Security status"
    path: "SECURITY.md"
  - label: "MVP acceptance matrix"
    path: "docs/mvp-acceptance.md"
  - label: "Multi-device alpha"
    path: "docs/multi-device.md"
---

## The problem

A messaging system needs routing, identity, persistence and recovery as well as cryptography. EpochGrid explores a separation of these responsibilities: NATS supplies the infrastructure, while OpenMLS supplies group encryption and cryptographic membership on each device.

The metadata backend handles public identity and authorization state. It has no backend message-decryption path. That separation defines which components need access to conversation content and which can operate on ciphertext.

## Design goals

- **Keep application content at the endpoints.** Devices encrypt before publishing and authenticate messages before accepting plaintext.
- **Use existing protocol implementations.** OpenMLS implements MLS group cryptography; NATS provides transport and durable streams.
- **Make device identity explicit.** NATS authentication keys and MLS signing keys are independently generated. Signed registration binds the public identities.
- **Make restarts routine within the tested scope.** Persistent group state, transactional local storage and a ciphertext outbox let clients resume with their existing identity.

These goals do not establish that every failure mode or deployment environment has been validated.

## Current status

**MVP and initial alpha features implemented; production-shaped alpha preparation in progress.** Milestones 0–16 and 18–20 are complete. Milestone 17 has working encrypted ephemeral transport but unreliable typing UI, deferred as TD-001. Milestone 21 dynamic admission is implemented. Milestone 22 authorization is partly implemented; normal dynamic CLI/TUI messaging is not yet supported.

The scoped two-device MVP covers discovery, invitation, encrypted chat, offline catch-up and process restart. Later work adds a persistent terminal client, independent devices, manual verification, revocation/rekeying, encrypted identity-administration recovery and attachments. Receipts, append-only message relationships and explicitly invited service participants extend that working development flow.

<table tabindex="0" aria-label="Milestone implementation status">
  <thead><tr><th scope="col">Milestone</th><th scope="col">Status</th><th scope="col">Capability</th></tr></thead>
  <tbody>
    <tr><td>0–10</td><td>Complete</td><td>Scoped two-device MVP: encrypted messaging, durable history, offline catch-up and restart acceptance</td></tr>
    <tr><td>11</td><td>Complete</td><td>Persistent terminal client</td></tr>
    <tr><td>12</td><td>Complete</td><td>Independent devices per user and ordered membership catch-up</td></tr>
    <tr><td>13</td><td>Complete</td><td>Manual verification, persistent key-change warnings and a signed registration log</td></tr>
    <tr><td>14</td><td>Complete</td><td>Signed device revocation, NATS credential exclusion and coordinated MLS removal/rekeying</td></tr>
    <tr><td>15</td><td>Complete</td><td>Client-encrypted control-credential and trust recovery; fresh enrollment for messaging</td></tr>
    <tr><td>16</td><td>Complete</td><td>Encrypted attachments through NATS Object Store, protected metadata and explicit save</td></tr>
    <tr><td>17</td><td>Partial · UI deferred</td><td>Encrypted ephemeral transport implemented; live typing remains unreliable (TD-001)</td></tr>
    <tr><td>18</td><td>Complete</td><td>Encrypted device delivery/read receipts and visible-message read tracking</td></tr>
    <tr><td>19</td><td>Complete</td><td>Stable application IDs, replies, edits and reactions with retained original events</td></tr>
    <tr><td>20</td><td>Complete</td><td>Explicit MLS service participants, encrypted status replies and coordinator removal</td></tr>
    <tr><td>21</td><td>Admission implemented</td><td>Canonical identity registry, enrollment tokens and expiring NATS Auth Callout grants</td></tr>
    <tr><td>22</td><td>In progress</td><td>Signed policies, exact group grants and transactional revocation; messaging integration remains</td></tr>
  </tbody>
</table>

Recovery restores identity administration, not MLS keys or message history. Attachments default to an 8 MiB file limit and seven-day object retention; expiration cannot erase saved copies or keys already known to recipients. Completed milestones remain unaudited alpha capabilities.

The workspace declares version `0.1.0`. At this site's source review, GitHub had no published releases. Package version metadata is not a production release or stability commitment.

## Scope and non-goals

The executable scope is a Rust library, a command-line and terminal client, a NATS-only metadata backend with dynamic admission, and local development infrastructure. Attachments use NATS Object Store; there is no HTTP application API or external storage service. CHANNELS KV is provisioned but unused; it does not define cryptographic membership.

This is not currently a complete consumer messaging product, a Matrix homeserver or a general interoperability gateway. The repository does not establish a federation protocol or compatibility with Signal.

## Known gaps and planned work

The complete messaging walkthrough still uses an explicit static development fixture. Its broad group permissions and shared CHAT consumers are not the alpha deployment model. Dynamic admission must not be described as fixing that exposure by itself.

Local databases retain unencrypted private state, message history and attachment keys. KeyPackage replenishment, general signing-key rotation, transcript retention quotas and hardware power-loss validation remain unfinished. Manual verification and signed histories do not provide global split-view detection or freshness guarantees. Offline groups still need a coordinator to rekey after revocation.

## Toward the MVP/production alpha

The next documented integration work is **Milestone 22**: synchronize signed policies with client MLS/outbox transactions, reconcile per-device filtered CHAT consumers, relay authenticated opaque Welcomes, and validate messaging, isolation, revocation and restart together. Policy validation, exact group subject grants and transactional membership revocation already exist; the complete dynamic messaging path does not.

The intended alpha admission model uses NATS Auth Callout and a canonical identity registry without rewriting per-device NATS configuration or reloading the broker. Only the local identity provider is implemented. Operator/JWT mode and clustered bring-your-own-NATS operation still need validation. TLS is required by the dynamic service's normal configuration, but the development tests' plaintext exception is not a supported alpha transport profile.

Protected local secrets, operational hardening and release artifacts remain release gates. No alpha release is tagged at this review, and these targets establish neither a release date nor production readiness. Live typing UI is explicitly deferred until after the alpha milestones; passing default TUI smoke tests does not validate it.

## Compared with a centralized application

In a conventional service that processes readable messages on the backend, application servers participate in the plaintext boundary. EpochGrid's metadata backend processes public identity and authorization state; the broker carries encrypted application messages. Explicitly invited service participants are ordinary MLS endpoints and intentionally receive plaintext for their joined channels. Their service label is disclosure, not code attestation.

That does not remove infrastructure trust. The operator still controls enrollment, transport permissions, sequencing and availability. Metadata remains visible, and compromised endpoints expose their own keys and retained history. The useful distinction is where responsibilities and secrets reside, rather than a blanket claim of decentralization or security superiority.
