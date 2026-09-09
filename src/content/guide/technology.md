---
title: "Technology choices"
description: "The implemented stack, its responsibilities and its costs. These tradeoffs explain the architecture without treating every dependency as a permanent commitment."
eyebrow: "03 / Technology"
sources:
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
