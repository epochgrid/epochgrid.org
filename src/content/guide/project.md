---
title: "The project"
description: "A development prototype exploring how a shared messaging fabric can carry conversations whose content is protected at the endpoints."
eyebrow: "01 / Project"
sources:
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

The identity service handles public metadata. It has no backend message-decryption path. That separation defines which components need access to conversation content and which can operate on ciphertext.

## Design goals

- **Keep application content at the endpoints.** Devices encrypt before publishing and authenticate messages before accepting plaintext.
- **Use existing protocol implementations.** OpenMLS implements MLS group cryptography; NATS provides transport and durable streams.
- **Make device identity explicit.** NATS authentication keys and MLS signing keys are independently generated. Signed registration binds the public identities.
- **Make restarts routine within the tested scope.** Persistent group state, transactional local storage and a ciphertext outbox let clients resume with their existing identity.

These goals do not establish that every failure mode or deployment environment has been validated.

## Current status

**Unaudited development alpha.** The source marks Milestones 0–16 complete. The scoped two-device MVP has acceptance tests for discovery, invitation, encrypted chat, offline catch-up and process restart. The persistent terminal client adds channels, composition, local history, unread counts and reconnect.

**Experimental: multi-device alpha.** The current source adds independent device leaves for one logical user, operator enrollment, per-device invitations and coordinator-serialized membership changes. New devices receive future messages, not previous history. Queued messages from an earlier epoch can become unreadable after membership changes.

**Implemented: device verification and registration transparency.** Milestone 13 adds independent fingerprint comparison, persistent warnings when an observed device identity changes, and a service-signed Merkle registration log. Clients retain a signer pin and checkpoint to detect rollback or changes to previously observed log history. First-contact trust, isolated split views and freshness remain limitations; this is not a global transparency network.

<table tabindex="0" aria-label="Completed milestones">
  <thead><tr><th scope="col">Milestone</th><th scope="col">Status</th><th scope="col">Capability</th></tr></thead>
  <tbody>
    <tr><td>0–10</td><td>Complete</td><td>Scoped two-device MVP: encrypted messaging, durable history, offline catch-up and restart acceptance</td></tr>
    <tr><td>11</td><td>Complete</td><td>Persistent terminal client</td></tr>
    <tr><td>12</td><td>Complete</td><td>Independent devices per user and ordered membership catch-up</td></tr>
    <tr><td>13</td><td>Complete</td><td>Manual verification, persistent key-change warnings and a signed registration log</td></tr>
    <tr><td>14</td><td>Complete</td><td>Signed device revocation, NATS credential exclusion and coordinated MLS removal/rekeying</td></tr>
    <tr><td>15</td><td>Complete</td><td>Client-encrypted control-credential and trust recovery; fresh enrollment for messaging</td></tr>
    <tr><td>16</td><td>Complete</td><td>Encrypted attachments through NATS Object Store, protected metadata and explicit save</td></tr>
  </tbody>
</table>

Recovery restores identity administration, not MLS keys or message history. Attachments default to an 8 MiB file limit and seven-day object retention; expiration cannot erase saved copies or keys already known to recipients. Completed milestones remain unaudited alpha capabilities.

The workspace declares version `0.1.0`. At this site's source review, GitHub had no published releases. Package version metadata is not a production release or stability commitment.

## Scope and non-goals

The executable scope is a Rust library, a command-line and terminal client, a NATS-only identity service, and local development infrastructure. Attachments use NATS Object Store; there is no HTTP application API or external storage service. CHANNELS KV is provisioned but unused; it does not define cryptographic membership.

This is not currently a complete consumer messaging product, a Matrix homeserver or a general interoperability gateway. The repository does not establish a federation protocol or compatibility with Signal.

## Known gaps and planned work

Repository documentation identifies exact membership-aware broker permissions, KeyPackage replenishment, general key rotation and endpoint storage hardening as unfinished. Local transcript retention quotas and hardware power-loss testing also remain pending. Revocation manages a single broker/service, and offline MLS groups wait for their coordinator before rekeying.

Manual verification, signed registration/revocation histories, credential exclusion and MLS removal are implemented. Automatic identity replacement, global split-view detection and freshness guarantees are not.

## Toward the MVP/production alpha

The Milestones 0–10 MVP is complete for its tested two-device slice. The current alpha extends that baseline through Milestone 16 with a terminal client, independent devices, verification, revocation/rekeying, encrypted identity-administration recovery and attachments. The broader development direction still has these **planned targets**:

- **Ephemeral encrypted events** — Milestone 17, the next documented step. Remote presence is not currently implemented.
- **Receipts and message relationships** — planned within Milestones 18–20. Current unread indicators remain local UI state.
- **Secure service participants** — planned within Milestones 18–20; the current identity service does not hold an MLS conversation leaf.

The repository does not define a fixed MVP/production-alpha release cutoff, date or production acceptance criteria, and there is no published release at this review. Milestone completion does not establish production readiness. TLS, exact group authorization, endpoint storage and remaining lifecycle gaps still need attention before a production-readiness assessment. Consult the current README and security policy for changes to scope.

## Compared with a centralized application

In a conventional service that processes readable messages on the backend, application servers participate in the plaintext boundary. EpochGrid's implemented service only processes public identity metadata; the broker carries encrypted application messages.

That does not remove infrastructure trust. The operator still controls enrollment, transport permissions, sequencing and availability. Metadata remains visible, and compromised endpoints expose their own keys and retained history. The useful distinction is where responsibilities and secrets reside, rather than a blanket claim of decentralization or security superiority.
