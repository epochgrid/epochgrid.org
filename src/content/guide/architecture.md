---
title: "Architecture and security"
description: "Follow a message from local encryption to durable delivery, and examine what each component can see, authorize and retain."
eyebrow: "02 / Architecture"
sources:
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

A signature demonstrates possession of a key; it does not verify a human identity. The operator remains trusted for initial enrollment. Milestone 13 adds manual verification and an authenticated registration history; revocation remains unimplemented.

The creator makes a local MLS group with an authenticated name and random routing identifier, reserves the invited device's initial KeyPackage, and queues the encrypted Commit and Welcome. The joining device explicitly selects an inviter and checks the authenticated Welcome signer against that inviter's verified directory identity before committing the join.

## Device verification and registration transparency

Each installation retains observed identity fingerprints, manual verification state and a signed Merkle checkpoint. Verification requires comparing the complete fingerprint through an independent channel. Copying the directory's own value back into the client is not independent verification.

An observed identity change is persistently marked `changed`, even for a previously unverified device. It blocks audited discovery, invitation and joining, and remains blocked if the old identity returns. The TUI surfaces trust failures; there is no automatic replacement or warning-reset workflow.

The service signs a checkpoint over a bounded public registration log using its NKey. Clients validate signatures and the Merkle root, pin the signer, and require later snapshots to reproduce the previously retained prefix. TRANSPARENCY KV stores the snapshot atomically; IDENTITIES is its public directory projection. Full snapshots are limited to 256 registrations or 65,536 encoded bytes, whichever is reached first, with transport overhead potentially lowering the practical limit.

First contact trusts the first validated signer unless its public key was independently pinned beforehand. An unchanged old checkpoint can be replayed. There is no freshness proof, gossip or witness network, or detection of isolated split views between installations. A compromised signer can append dishonest new identities; deleting local trust state loses observed evidence.

Audits protect discovery and new group admission. They do not retroactively verify every existing MLS leaf or re-authorize the scripting message path for every message. TUI polling stops on audit failures, while existing local history remains readable. These controls leave the endpoint plaintext and transport metadata boundaries unchanged.

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

Only the creator device serializes additions. Receivers process encrypted membership Commits and applications in stream order. A newly invited device starts at its join epoch and receives no earlier history. Initial KeyPackages are reserved for one group; replenishment, removal and revocation remain absent.

## Persistence and delivery

JetStream's CHAT stream retains encrypted group traffic; MAILBOX retains Welcomes for offline invitees. TRANSPARENCY KV stores the signed public registration snapshot, with IDENTITIES as its directory projection. CHANNELS KV is provisioned but unused.

A sender commits its new ratchet state, ciphertext outbox entry and outgoing local transcript together, then waits for a JetStream publish acknowledgment. Retrying reuses the stored ciphertext and stable message identifier.

A receiver stages the raw delivery locally before a confirmed broker acknowledgment. Authentication, ratchet advancement, transcript insertion and processing markers commit in a local transaction. Exact ciphertext duplicates do not produce duplicate transcript entries. Invalid packets are quarantined; storage failures remain pending.

These are not distributed transactions. JetStream deduplication is time-bounded, and a late retry can store another copy. A crash around terminal output can repeat display. No exactly-once delivery or display guarantee is claimed.

## Metadata and infrastructure trust

Infrastructure can observe subjects, timing, sizes, connection metadata and public identity records. The threat model does not claim to hide usernames, credentials, KeyPackages, group names in MLS group identifiers or traffic relationships.

The broker is trusted for availability and sequencing, not application plaintext. It can suppress or reorder traffic. A plaintext-marker scan in the acceptance suite is useful regression evidence for the tested path, not proof against all leakage, side channels or compromised endpoints.

## Failure assumptions and current limits

Process termination, lost acknowledgments and interrupted SQLite transactions have targeted recovery tests. Hardware power loss, arbitrary disk corruption and safe restoration of old ratchet-state backups are not established. Keep the same device directory and server data when resuming; deleting either independently is not a recovery procedure.

Membership changes can make queued ciphertext from an older epoch unreadable. Retention or deletion can also remove needed ciphertext. Local transcripts and staged packets have no retention quotas yet.

MLS forward secrecy and post-compromise security are protocol goals, not completed lifecycle assurances for this prototype. Removal, explicit key updates and the corresponding lifecycle security tests remain unimplemented. Read the pinned threat model before evaluating a remote or sensitive deployment.
