---
title: "Architecture and security"
description: "Follow a message from local encryption to durable delivery, and examine what each component can see, authorize and retain."
eyebrow: "02 / Architecture"
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

`epochgrid-core` contains identity, wire types, OpenMLS state, local SQLite storage and NATS operations. The `epochgrid` binary supplies scripting commands and a Ratatui terminal interface. `epochgrid-service` is a NATS-only metadata and admission backend. The reference status participant runs through `epochgrid participant run`; it is a separate enrolled endpoint, not a backend decryption path.

The service validates public registrations, checks the applicable enrollment authority, signs the registration log, serves audited discovery and reserves one-use KeyPackages. It provisions JetStream streams, key-value buckets and durable consumers. Dynamic admission also uses a service-host SQLite registry, `auth.sqlite`, for canonical identities, enrollment tokens and authorization policies. It holds no chat transcript or MLS group secrets. There is no HTTP API or server-side transcript store.

## Identity and joining

A device has an NKey for NATS authentication and an independently generated MLS Ed25519 signing key. Registration signs the binding between user, device, NATS public key, MLS credential and KeyPackage. The service validates the signature, package lifetime and enrollment binding. Static fixtures use operator enrollment; dynamic admission uses a provider-neutral canonical UserId and separately enrolled device keys. Clients revalidate directory records on lookup.

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

NATS carries connections and traffic. **The loopback development configuration has no TLS.** NKeys authenticate a connection but do not encrypt it. The dynamic service normally requires a TLS URL and callout evidence of client TLS; its explicit plaintext exception is development-only. TLS protects the connection, while MLS protects conversation content. Neither hides all transport metadata.

### Broker authorization

The static fixture uses NKey permissions and provisioned per-device consumers, but broad group wildcards and shared CHAT access expose unrelated ciphertext to enrolled devices. That fixture is not the alpha deployment contract.

Dynamic admission verifies encrypted, signed NATS Auth Callout requests and device nonce possession against the canonical registry. Restricted, single-use enrollment tokens bind a new device to a user; they grant no chat access. Only a local identity provider exists. Device NKeys, temporary connection keys, backend directory signing keys and the callout issuer have distinct roles.

Milestone 22 adds coordinator-signed public group policies, exact `.message`, `.handshake` and `.ephemeral` subject grants, and transactional membership revocation. These are a non-secret authorization projection, separate from MLS membership. A transport grant cannot create an MLS leaf or decrypt messages.

**Dynamic CLI/TUI messaging is not yet supported.** Client policy/outbox synchronization, filtered durable consumers and Welcome relay remain unfinished. Admission alone does not fix shared CHAT exposure. The operator owns NATS configuration; dynamic enrollment/revocation does not rewrite device-user files or reload NATS.

### Application envelopes

CHAT carries raw TLS-serialized MLS PrivateMessages for applications and encrypted Commits. Here “TLS serialization” is a binary encoding, not TLS transport. MAILBOX carries an EpochGrid envelope around an MLS Welcome. Registration and identity request/reply use versioned postcard envelopes.

The implementation selects `MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519` through OpenMLS. Receiver checks bind framing and the expected group; sender labels come from authenticated MLS credentials, not broker headers. Text messages retain a 16 KiB limit. The protected application envelope now carries stable IDs and typed reply, replacement and reaction relations. Ephemeral events use a different protection path described below.

### Endpoints

Devices decrypt and retain their own transcripts. OpenMLS state, outbox records and application tables share a SQLite connection so related local changes can commit atomically. An OS file lock prevents concurrent clients from advancing one device's state.

**Local SQLite databases and journals are unencrypted development storage.** Endpoint compromise can expose private state and previously retained plaintext. Ratchet key erasure does not erase a separate transcript.

## Direct and group messaging

The baseline Alice/Bob conversation uses an MLS group; there is no separate Signal-style direct-message protocol. Multi-device alpha permits multiple independent device leaves, including several for the same user. A logical user label does not merge those keys.

The group coordinator serializes membership changes, initially the creator. If revoked, the lowest-index non-revoked leaf succeeds it; the coordinator signing key is pinned to prevent authority transfer through a reused leaf index. Receivers process encrypted membership Commits and applications in stream order. A newly invited device receives no earlier history. Initial KeyPackages remain reserved for one group; replenishment and general signing-key rotation are pending.

## Device revocation and rekeying

An active same-user device or the operator can submit an irreversible, signed revocation for an exact registered device and NKey. Authorization, local verification state, connectivity and MLS membership are separate states. A verified fingerprint does not override revocation, and an active device is not necessarily online.

The service first persists intent in a separate signed Merkle revocation journal. In the static development fixture, it rewrites public authorization files, requests native NATS reload through a restricted system NKey, and deletes the device's CHAT and MAILBOX consumers. Removing the NKey disconnects existing sessions and prevents reconnect. Failed enforcement retains intent for retry and startup reconciliation. This currently manages one broker/service, not a cluster.

In dynamic mode, revocation denies fresh admission and transactionally removes registry memberships. Existing grants last until their signed expiry: 30 seconds by default, at most 60. A registry generation does not retrospectively invalidate an issued JWT. Startup reconciles revocation history before device admission, and unavailable authorization fails closed. This single-host registry is not a validated replicated deployment.

Broker enforcement does not mean offline groups have rekeyed. The coordinator processes history, removes known revoked leaves and publishes the removal Commit transactionally with local MLS state. New encryption is blocked while a known revoked leaf remains; offline groups wait for the coordinator. Old-epoch queued ciphertext is retained with a warning and must be resent explicitly after rekeying, rather than silently re-encrypted.

Revocation cannot recall published plaintext, erase old keys or override a malicious broker administrator restoring credentials. MLS removal defines future-epoch content exclusion after rekeying; suppression, stale checkpoints and isolated split views remain limitations.

## Encrypted identity-administration recovery

Client-side AES-256-GCM protects an exported NATS control credential and retained public identity/trust evidence with a fresh 256-bit secret stored separately. The service receives neither secret nor decrypted package. Restore authenticates the package into an empty home and marks it recovery-only.

A recovered home can audit and authorize same-user revocations while its NKey remains active. It cannot chat, join or create groups: MLS private keys, ratchets, pending deliveries, transcripts and attachment manifests are excluded. Messaging resumes through independent keys, operator enrollment and a fresh invitation from a surviving coordinator. Recovery cannot reactivate revoked credentials or recover a group with no surviving members. Evidence is only as recent as the export; an older valid package cannot be recognized as stale offline.

## Encrypted attachments

Each file is encrypted with a fresh AES-256-GCM key before upload to the ATTACHMENTS Object Store. Random object IDs identify broker ciphertext; filenames, MIME types, keys, nonces and content hashes travel in an MLS-protected manifest. Associated data binds the object and group routing IDs.

Downloads require an authenticated local manifest, bounded reads, AEAD and hash verification before opening the user-selected output path. Saves refuse overwrite; received filenames do not select paths, and files are never downloaded or executed automatically. Transfers require connectivity and buffer the file within a configurable limit, 8 MiB by default. Object retention defaults to seven days.

Attachment manifests and data-encryption keys are plaintext in local SQLite; explicitly saved files are plaintext too. Shared lab permissions let malicious enrolled devices corrupt objects or deny availability. Revocation excludes the old NKey from broker access, but retention and revocation cannot erase copies or keys already held by recipients.

## Ephemeral events and receipts

Core NATS carries transient events outside JetStream and the durable outbox. EpochGrid derives per-event AES-256-GCM keys from the current MLS exporter and signs each protected event with the sender's MLS credential. Current-epoch membership, freshness and replay checks apply without advancing the durable chat ratchet.

This is an exporter-protected application envelope, not MLS PrivateMessage framing. It lacks per-event forward secrecy: compromise of an epoch exporter secret can expose recorded ephemeral traffic from that epoch. Loss is expected; timing and sizes remain visible. **Live typing UI is unreliable and deferred (TD-001)** even though transport security tests remain enabled.

Receipts reuse this encrypted transient path. Submitted means locally committed; server accepted means JetStream acknowledged ciphertext; delivered means a peer claims authenticated local persistence; read means local presentation. Read is not proof of human attention. Device claims are retained in local SQLite, while receipt traffic itself is not durable. Missing receipts mean unknown, and recovery requires peers to overlap online again within the supported request window.

## Replies, edits and reactions

Stable application IDs commit to the canonical event, group and authenticated sending device. Replies, replacements and reactions are new encrypted events; they do not rewrite JetStream messages or erase original plaintext. Only the original sending device may edit its text message. Authenticated per-device counters order competing updates independently of transport arrival for the same known events.

Clients retain an immutable local event log and derive the displayed conversation from it. Missing targets remain unresolved until available. That log is unencrypted and excluded from recovery packages; it is required state, not a disposable cache. Message deletion and cross-device editing are outside this milestone.

## Explicit service participants

An invited participant has independent NATS/MLS keys, a group leaf and local SQLite history. It is intentionally inside the plaintext boundary for its joined conversation, unlike the metadata backend. The authenticated `service` device label does not attest its code or prove other members are human.

The reference status runner handles one explicitly joined channel, returns encrypted replies, and records processing together with its response/outbox transaction to suppress duplicate work after restart. It does not execute shell commands, auto-join channels, fetch attachments or assert human read receipts. Its status describes its own operation, not fabric-wide health.

Coordinator-issued MLS removal advances the epoch and excludes future decryption. It preserves old history and does not revoke the participant's NATS identity. In the static fixture, broad transport grants may still expose ciphertext; account-wide device revocation is a separate operation. Rejoining a removed local group and coordinator self-removal are not implemented.

## Persistence and delivery

JetStream's CHAT stream retains encrypted group traffic; MAILBOX retains Welcomes for offline invitees. TRANSPARENCY KV stores separate signed registration and revocation histories, with IDENTITIES as the registration projection. ATTACHMENTS Object Store holds encrypted files. CHANNELS KV is provisioned but unused.

A sender commits its new ratchet state, ciphertext outbox entry and outgoing local transcript together, then waits for a JetStream publish acknowledgment. Retrying reuses the stored ciphertext and stable message identifier.

A receiver stages the raw delivery locally before a confirmed broker acknowledgment. Authentication, ratchet advancement, transcript insertion and processing markers commit in a local transaction. Exact ciphertext duplicates do not produce duplicate transcript entries. Invalid packets are quarantined; storage failures remain pending.

These are not distributed transactions. JetStream deduplication is time-bounded, and a late retry can store another copy. A crash around terminal output can repeat display. No exactly-once delivery or display guarantee is claimed.

## Metadata and infrastructure trust

Infrastructure can observe subjects, timing, sizes, connection metadata and public identity records. The threat model does not claim to hide usernames, credentials, KeyPackages, group names in MLS group identifiers or traffic relationships.

The broker is trusted for availability and sequencing, not application plaintext. The dynamic registry additionally sees canonical users, device bindings and public group authorization state. Invited participants see the plaintext of their joined conversations. It can suppress or reorder traffic. A plaintext-marker scan in the acceptance suite is useful regression evidence for the tested path, not proof against all leakage, side channels or compromised endpoints.

## Failure assumptions and current limits

Process termination, lost acknowledgments and interrupted SQLite transactions have targeted recovery tests. Hardware power loss, arbitrary disk corruption and safe restoration of old ratchet-state backups are not established. Keep the same device directory and server data when resuming; deleting either independently is not a recovery procedure.

Membership changes can make queued ciphertext from an older epoch unreadable. Retention or deletion can also remove needed ciphertext. Local transcripts and staged packets have no retention quotas yet.

MLS removal/rekeying and future-ciphertext exclusion have targeted tests. General signing-key rotation and comprehensive lifecycle assurances remain incomplete; this is not a blanket forward-secrecy or post-compromise-security guarantee. Read the pinned threat model before evaluating a remote or sensitive deployment.
