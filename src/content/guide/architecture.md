---
title: "Architecture and security"
description: "Follow a message from local encryption to durable delivery, and examine what each component can see, authorize and retain."
eyebrow: "02 / Architecture"
sources:
  - label: "Device revocation and MLS rekeying"
    path: "docs/device-revocation.md"
  - label: "Encrypted identity-administration recovery"
    path: "docs/encrypted-recovery.md"
  - label: "Encrypted attachments"
    path: "docs/attachments.md"
  - label: "Device verification and registration transparency"
    path: "docs/device-verification.md"
  - label: "Architecture and trust boundaries"
    path: "docs/architecture.md"
  - label: "Wire protocol"
    path: "docs/protocol.md"
  - label: "Threat model"
    path: "docs/threat-model.md"
  - label: "Restart and recovery"
    path: "docs/recovery.md"
  - label: "Multi-device constraints"
    path: "docs/multi-device.md"
---

## Components and responsibilities

`epochgrid-core` contains identity, wire types, OpenMLS state, local SQLite storage and NATS operations. The `epochgrid` binary supplies scripting commands and a Ratatui terminal interface. `epochgrid-service` is a NATS-only identity service.

The service validates public registrations, checks explicit enrollment, signs the registration log, serves audited discovery and reserves one-use KeyPackages. It provisions JetStream streams, key-value buckets and durable consumers. SQLite belongs to the client, not the service. There is no HTTP API or server-side transcript store.

## Identity and joining

A device has an NKey for NATS authentication and an independently generated MLS Ed25519 signing key. Registration signs the binding between user, device, NATS public key, MLS credential and KeyPackage. The service validates the signature, package lifetime and operator enrollment. Clients revalidate directory records on lookup.

A signature demonstrates possession of a key; it does not verify a human identity. The operator remains trusted for initial enrollment. Milestone 13 adds manual verification and an authenticated registration history; Milestone 14 adds separately authorized device revocation.

The creator makes a local MLS group with an authenticated name and random routing identifier, reserves the invited device's initial KeyPackage, and queues the encrypted Commit and Welcome. The joining device explicitly selects an inviter and checks the authenticated Welcome signer against that inviter's verified directory identity before committing the join.

## Device verification and registration transparency

Each installation retains observed identity fingerprints, manual verification state and a signed Merkle checkpoint. Verification requires comparing the complete fingerprint through an independent channel. Copying the directory's own value back into the client is not independent verification.

An observed identity change is persistently marked `changed`, even for a previously unverified device. It blocks audited discovery, invitation and joining, and remains blocked if the old identity returns. The TUI surfaces trust failures; there is no automatic replacement or warning-reset workflow.

The service signs a checkpoint over a bounded public registration log using its NKey. Clients validate signatures and the Merkle root, pin the signer, and require later snapshots to reproduce the previously retained prefix. TRANSPARENCY KV stores the snapshot atomically; IDENTITIES is its public directory projection. Full snapshots are limited to 256 registrations or 65,536 encoded bytes, whichever is reached first, with transport overhead potentially lowering the practical limit.

First contact trusts the first validated signer unless its public key was independently pinned beforehand. An unchanged old checkpoint can be replayed. There is no freshness proof, gossip or witness network, or detection of isolated split views between installations. A compromised signer can append dishonest new identities; deleting local trust state loses observed evidence.

Audits protect discovery and group admission without proving human identity or retroactively verifying every existing MLS leaf. TUI and line-chat polling, and scripting send/sync/history, also audit revocations and reconcile removals. TUI polling stops on audit failures, while existing local history remains readable. These controls leave endpoint plaintext and transport metadata exposure unchanged.

## Four separate security layers

### Transport

NATS carries connections and traffic. **The loopback development configuration has no TLS.** NKeys authenticate a connection but do not encrypt it. Remote transport would require TLS and configured trust roots; application encryption does not hide all transport metadata.

### Broker authorization

Static NKey permissions limit request subjects and access to each device's provisioned consumers. Clients cannot create arbitrary consumers or read another device's mailbox. Current group wildcards cover the shared Alice/Bob development namespace, so enrolled devices can observe unrelated ciphertext or inject invalid traffic.

Exact membership-aware group permissions are unfinished. MLS validation does not prevent traffic flooding, mailbox blocking or exhaustion of a peer's initial KeyPackage reservation.

### Application envelopes

CHAT carries raw TLS-serialized MLS PrivateMessages for applications and encrypted Commits. Here “TLS serialization” is a binary encoding, not TLS transport. MAILBOX carries an EpochGrid envelope around an MLS Welcome. Registration and identity request/reply use versioned postcard envelopes.

The implementation selects `MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519` through OpenMLS. Receiver checks bind framing and the expected group; sender labels come from authenticated MLS credentials, not broker headers. The maximum application plaintext is 16 KiB.

### Endpoints

Devices decrypt and retain their own transcripts. OpenMLS state, outbox records and application tables share a SQLite connection so related local changes can commit atomically. An OS file lock prevents concurrent clients from advancing one device's state.

**Local SQLite databases and journals are unencrypted development storage.** Endpoint compromise can expose private state and previously retained plaintext. Ratchet key erasure does not erase a separate transcript.

## Direct and group messaging

The baseline Alice/Bob conversation uses an MLS group; there is no separate Signal-style direct-message protocol. Multi-device alpha permits multiple independent device leaves, including several for the same user. A logical user label does not merge those keys.

The group coordinator serializes membership changes, initially the creator. If revoked, the lowest-index non-revoked leaf succeeds it; the coordinator signing key is pinned to prevent authority transfer through a reused leaf index. Receivers process encrypted membership Commits and applications in stream order. A newly invited device receives no earlier history. Initial KeyPackages remain reserved for one group; replenishment and general signing-key rotation are pending.

## Device revocation and rekeying

An active same-user device or the operator can submit an irreversible, signed revocation for an exact registered device and NKey. Authorization, local verification state, connectivity and MLS membership are separate states. A verified fingerprint does not override revocation, and an active device is not necessarily online.

The service first persists intent in a separate signed Merkle revocation journal. It rewrites public authorization files, requests native NATS reload through a restricted system NKey, and deletes the device's CHAT and MAILBOX consumers. Removing the NKey disconnects existing sessions and prevents reconnect. Failed enforcement retains intent for retry and startup reconciliation. This currently manages one broker/service, not a cluster.

Broker enforcement does not mean offline groups have rekeyed. The coordinator processes history, removes known revoked leaves and publishes the removal Commit transactionally with local MLS state. New encryption is blocked while a known revoked leaf remains; offline groups wait for the coordinator. Old-epoch queued ciphertext is retained with a warning and must be resent explicitly after rekeying, rather than silently re-encrypted.

Revocation cannot recall published plaintext, erase old keys or override a malicious broker administrator restoring credentials. MLS removal defines future-epoch content exclusion after rekeying; suppression, stale checkpoints and isolated split views remain limitations.

## Encrypted identity-administration recovery

Client-side AES-256-GCM protects an exported NATS control credential and retained public identity/trust evidence with a fresh 256-bit secret stored separately. The service receives neither secret nor decrypted package. Restore authenticates the package into an empty home and marks it recovery-only.

A recovered home can audit and authorize same-user revocations while its NKey remains active. It cannot chat, join or create groups: MLS private keys, ratchets, pending deliveries, transcripts and attachment manifests are excluded. Messaging resumes through independent keys, operator enrollment and a fresh invitation from a surviving coordinator. Recovery cannot reactivate revoked credentials or recover a group with no surviving members. Evidence is only as recent as the export; an older valid package cannot be recognized as stale offline.

## Encrypted attachments

Each file is encrypted with a fresh AES-256-GCM key before upload to the ATTACHMENTS Object Store. Random object IDs identify broker ciphertext; filenames, MIME types, keys, nonces and content hashes travel in an MLS-protected manifest. Associated data binds the object and group routing IDs.

Downloads require an authenticated local manifest, bounded reads, AEAD and hash verification before opening the user-selected output path. Saves refuse overwrite; received filenames do not select paths, and files are never downloaded or executed automatically. Transfers require connectivity and buffer the file within a configurable limit, 8 MiB by default. Object retention defaults to seven days.

Attachment manifests and data-encryption keys are plaintext in local SQLite; explicitly saved files are plaintext too. Shared lab permissions let malicious enrolled devices corrupt objects or deny availability. Revocation excludes the old NKey from broker access, but retention and revocation cannot erase copies or keys already held by recipients.

## Persistence and delivery

JetStream's CHAT stream retains encrypted group traffic; MAILBOX retains Welcomes for offline invitees. TRANSPARENCY KV stores separate signed registration and revocation histories, with IDENTITIES as the registration projection. ATTACHMENTS Object Store holds encrypted files. CHANNELS KV is provisioned but unused.

A sender commits its new ratchet state, ciphertext outbox entry and outgoing local transcript together, then waits for a JetStream publish acknowledgment. Retrying reuses the stored ciphertext and stable message identifier.

A receiver stages the raw delivery locally before a confirmed broker acknowledgment. Authentication, ratchet advancement, transcript insertion and processing markers commit in a local transaction. Exact ciphertext duplicates do not produce duplicate transcript entries. Invalid packets are quarantined; storage failures remain pending.

These are not distributed transactions. JetStream deduplication is time-bounded, and a late retry can store another copy. A crash around terminal output can repeat display. No exactly-once delivery or display guarantee is claimed.

## Metadata and infrastructure trust

Infrastructure can observe subjects, timing, sizes, connection metadata and public identity records. The threat model does not claim to hide usernames, credentials, KeyPackages, group names in MLS group identifiers or traffic relationships.

The broker is trusted for availability and sequencing, not application plaintext. It can suppress or reorder traffic. A plaintext-marker scan in the acceptance suite is useful regression evidence for the tested path, not proof against all leakage, side channels or compromised endpoints.

## Failure assumptions and current limits

Process termination, lost acknowledgments and interrupted SQLite transactions have targeted recovery tests. Hardware power loss, arbitrary disk corruption and safe restoration of old ratchet-state backups are not established. Keep the same device directory and server data when resuming; deleting either independently is not a recovery procedure.

Membership changes can make queued ciphertext from an older epoch unreadable. Retention or deletion can also remove needed ciphertext. Local transcripts and staged packets have no retention quotas yet.

MLS removal/rekeying and future-ciphertext exclusion have targeted tests. General signing-key rotation and comprehensive lifecycle assurances remain incomplete; this is not a blanket forward-secrecy or post-compromise-security guarantee. Read the pinned threat model before evaluating a remote or sensitive deployment.
