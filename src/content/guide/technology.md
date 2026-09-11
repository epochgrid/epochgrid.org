---
title: "Technology choices"
description: "The implemented stack, its responsibilities and its costs. These tradeoffs explain the architecture without treating every dependency as a permanent commitment."
eyebrow: "03 / Technology"
sources:
  - label: "Device revocation and MLS rekeying"
    path: "docs/device-revocation.md"
  - label: "Encrypted identity-administration recovery"
    path: "docs/encrypted-recovery.md"
  - label: "Encrypted attachments"
    path: "docs/attachments.md"
  - label: "Device verification and registration transparency"
    path: "docs/device-verification.md"
  - label: "Workspace dependencies and package metadata"
    path: "Cargo.toml"
  - label: "Compatibility and storage decisions"
    path: "docs/architecture.md"
  - label: "Protocol formats"
    path: "docs/protocol.md"
  - label: "Terminal client design"
    path: "docs/tui.md"
  - label: "Development infrastructure"
    path: "docs/development.md"
  - label: "Publishing status"
    path: "CONTRIBUTING.md"
---

## How to read these choices

The roles below come from repository code and documentation. Where there is no selection ADR, the rationale is architectural analysis of that role, rather than an attributed maintainer decision. “Foundational” describes the current design, not a promise that a technology can never change.

## Rust and Tokio

**Role: foundational implementation.** Rust spans the reusable core, client and identity service. Tokio supplies the asynchronous execution used by the NATS client and binaries.

A shared language lets wire types and state-handling code be reused across endpoints and the service. The tradeoff is a systems-language toolchain and dependency compatibility constraints. The workspace uses edition 2024; the development toolchain is pinned separately from the minimum Rust version in Cargo metadata.

## NATS and JetStream

**Role: foundational messaging infrastructure.** NATS supplies authentication, authorization and request/reply. JetStream adds retained CHAT and MAILBOX traffic, durable consumers and public identity KV records. EpochGrid uses `async-nats` to access them.

This reuses an existing transport and persistence system while keeping message decryption in clients. It also makes subject permissions, stream lifecycle, acknowledgments and broker operation part of the application's correctness story. Durable storage does not remove retention gaps or produce a distributed transaction with local SQLite.

## NKeys and enrollment

**Role: foundational current authentication model.** Devices authenticate to NATS using user NKeys. Signed registrations bind those public keys to independent MLS identities, and the service checks explicit operator enrollment.

The development configuration is straightforward to inspect, but static enrollment requires configuration management and restart. JWT/account authorization is discussed as an option for future policy; JWT authentication callouts are not the implemented authentication path.

## Fingerprints and the signed Merkle log

**Role: implemented device-trust evidence.** SHA-256 fingerprints identify a device's bound public identity. A service-NKey-signed checkpoint commits to the registration log. Clients retain the signer, root and size and compare later snapshots with that history.

The Merkle construction follows RFC 6962, as documented in the verification guide; this does not implement the Certificate Transparency protocol. A full snapshot provides inclusion and prefix evidence without a compact-proof API. One NATS KV compare-and-swap publishes the log and checkpoint atomically, and SQLite retains each device's observed trust state.

This is deliberately bounded alpha infrastructure: at most 256 entries or 65,536 encoded bytes, subject to transport overhead. It has no pagination, witness network, freshness proof or signer rotation. First-contact trust still requires an independent service-key pin or trust on first use. Replacing this storage or proof representation would require compatibility and trust-state migration work.

## Native NATS revocation enforcement

**Role: current single-broker authorization implementation.** A signed revocation journal records durable intent. The service updates a public authorization include, uses a restricted system-account NKey to request native reload, and removes revoked-device consumers. This disconnects the device and excludes reconnect without giving ordinary clients system permissions.

The actuator needs local file access and broker control, and currently manages one broker/service. Its successful acknowledgment covers network enforcement, not completion of offline MLS removal. Coordinator-driven rekeying supplies the separate group-content boundary.

## AES-GCM recovery and Object Store attachments

**Role: implemented client encryption and storage integration.** Recovery and file encryption use the existing OpenMLS RustCrypto AES-256-GCM implementation with fresh random secrets. Recovery uses an independently versioned encrypted file, not a password-derived key or an MLS database backup. Owned secret buffers use `zeroize`; this does not guarantee removal of swap, crash dumps or library copies.

Attachments enable `async-nats` Object Store support. Encrypted file bytes use standard object chunks while sensitive metadata and keys travel inside MLS. Reusing NATS avoids a separate HTTP storage service but inherits the shared lab's authorization and availability limits. The client verifies bounded reads before saving; files are held in bounded memory, with an 8 MiB default and connectivity required. Native stream retention bounds orphan uploads but does not erase recipient copies.

## OpenMLS and RustCrypto

**Role: foundational cryptographic protocol, replaceable library in principle.** OpenMLS implements RFC 9420 group encryption. The workspace uses its RustCrypto provider, basic credentials and SQLite storage provider.

Using an existing MLS implementation avoids inventing a group-encryption protocol. The integration still has to correctly bind identity, enforce framing, persist ratchets and manage membership. Replacing the library would require compatibility and persistent-state migration work, not just a dependency swap. Library support for MLS does not by itself make EpochGrid interoperable with another messaging application.

## SQLite

**Role: local persistence implementation.** OpenMLS storage and application tables share a SQLite connection. Transactions couple ratchet updates, ciphertext outbox writes, transcript entries and deduplication state.

This gives the device a concrete local commit boundary and supports restart recovery. It does not coordinate atomically with NATS or a terminal. SQLite and journals retain unencrypted private state and plaintext history; a production keystore and retention policy remain separate work.

## Postcard, MLS encoding and JSON

**Role: wire contract and storage details.** Versioned postcard encodes EpochGrid identity request/reply and Welcome envelopes. MLS messages use the protocol's TLS encoding. JSON is used inside the OpenMLS SQLite storage codec and configuration/public data paths.

Binary formats keep wire representations explicit. Postcard declaration order is part of the protocol ABI, so casually reordering fields or variants breaks compatibility. Internal storage formats also matter when upgrading persisted device state.

## Ratatui and Crossterm

**Role: replaceable presentation layer.** The terminal UI sits on the same core operations as the scripting CLI. A dedicated worker owns SQLite/OpenMLS and supplies snapshots to the rendering loop.

This keeps network waits out of terminal input handling. The tradeoff is terminal-specific behavior and platform testing. Changing the frontend would not require inventing a new encryption or delivery path.

## Containers, GitHub Actions and GHCR

**Role: development and validation infrastructure.** Bootstrap verifies the checksum of a pinned official NATS release, builds a local scratch OCI image and runs it through Compose. Core CI runs the repository's verification script.

The local image has a `ghcr.io/epochgrid/nats-dev` tag, but that name does not mean it has been published. The inspected core repository has no package publishing workflow. GHCR is identified for future OCI artifacts; no downloadable release or image is promised here.
