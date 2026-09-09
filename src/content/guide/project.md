---
title: "The project"
description: "A development prototype exploring how a shared messaging fabric can carry conversations whose content is protected at the endpoints."
eyebrow: "01 / Project"
sources:
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

**Unaudited development alpha.** The source marks Milestones 0–13 complete. The scoped two-device MVP has acceptance tests for discovery, invitation, encrypted chat, offline catch-up and process restart. The persistent terminal client adds channels, composition, local history, unread counts and reconnect.

**Experimental: multi-device alpha.** The current source adds independent device leaves for one logical user, operator enrollment, per-device invitations and creator-serialized membership additions. New devices receive future messages, not previous history. Queued messages from an earlier epoch can become unreadable after membership changes.

**Implemented: device verification and registration transparency.** Milestone 13 adds independent fingerprint comparison, persistent warnings when an observed device identity changes, and a service-signed Merkle registration log. Clients retain a signer pin and checkpoint to detect rollback or changes to previously observed log history. First-contact trust, isolated split views and freshness remain limitations; this is not a global transparency network.

The workspace declares version `0.1.0`. At this site's source review, GitHub had no published releases. Package version metadata is not a production release or stability commitment.

## Scope and non-goals

The executable scope is a Rust library, a command-line and terminal client, a NATS-only identity service, and local development infrastructure. There is no HTTP application API or attachments implementation. CHANNELS KV is provisioned but unused; it does not define cryptographic membership.

This is not currently a complete consumer messaging product, a Matrix homeserver or a general interoperability gateway. The repository does not establish a federation protocol or compatibility with Signal.

## Known gaps and planned work

Repository documentation identifies exact membership-aware broker permissions, key rotation and revocation, member removal, KeyPackage replenishment and storage hardening as unfinished. Retention quotas and hardware power-loss testing also remain pending.

The next documented milestone is **device revocation and MLS rekeying (14)**. Manual verification and the bounded registration log are already implemented; automatic identity replacement, global split-view detection and freshness guarantees are not.

## Toward the MVP/production alpha

The completed Milestones 0–10 MVP is a tested two-device messaging slice. The broader MVP/production-alpha direction builds on that foundation, the terminal client, independent devices and Milestone 13 verification. The core README records the following **planned targets**:

- **Device revocation and MLS rekeying** — Milestone 14, the next documented step.
- **Encrypted recovery and attachments** — part of the planned Milestones 15–20 scope.
- **Ephemeral events, receipts and message relationships** — also planned, rather than current messaging capabilities.
- **Secure service participants** — planned within Milestones 15–20; the current identity service is not an MLS conversation participant.

The repository does not yet define which of these milestones is the release cutoff, a release date, or production acceptance criteria. These are development targets, not a shipped release or a production-readiness claim. TLS, exact group authorization, endpoint storage and the remaining identity-lifecycle gaps still need attention before a production-readiness assessment. Consult the current README and security policy for changes to scope.

## Compared with a centralized application

In a conventional service that processes readable messages on the backend, application servers participate in the plaintext boundary. EpochGrid's implemented service only processes public identity metadata; the broker carries encrypted application messages.

That does not remove infrastructure trust. The operator still controls enrollment, transport permissions, sequencing and availability. Metadata remains visible, and compromised endpoints expose their own keys and retained history. The useful distinction is where responsibilities and secrets reside, rather than a blanket claim of decentralization or security superiority.
