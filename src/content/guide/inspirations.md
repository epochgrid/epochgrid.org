---
title: "Inspirations and related work"
description: "Technical context for the design: actual dependencies, relevant comparisons, and the boundary between shared ideas and protocol compatibility."
eyebrow: "04 / Related work"
sources:
  - label: "Device revocation and MLS rekeying"
    path: "docs/device-revocation.md"
  - label: "Encrypted identity-administration recovery"
    path: "docs/encrypted-recovery.md"
  - label: "Encrypted attachments"
    path: "docs/attachments.md"
  - label: "Device verification and registration transparency"
    path: "docs/device-verification.md"
  - label: "Implemented architecture"
    path: "docs/architecture.md"
  - label: "Actual dependencies"
    path: "Cargo.toml"
  - label: "Protocol and selected MLS suite"
    path: "docs/protocol.md"
  - label: "Security goals and gaps"
    path: "docs/threat-model.md"
---

## Ideas are not interoperability

NATS and MLS directly shape EpochGrid because they are implemented dependencies. The inspected repository does not document a historical design influence from Matrix or Signal. Those projects are included below as useful conceptual reference points, not as attributed origin stories.

No Matrix or Signal compatibility is established. Use of MLS likewise does not imply that an arbitrary MLS application can join an EpochGrid group.

## Matrix: open messaging across servers

[Matrix's architecture](https://matrix.org/docs/matrix-concepts/elements-of-matrix/) separates clients, homeservers and a server-to-server federation API. Its open, versioned specification is a useful example of making protocol behavior inspectable across implementations.

For readers of EpochGrid, the relevant comparison is how conversation state and infrastructure responsibilities are divided. EpochGrid currently routes through NATS and uses OpenMLS group state on devices. It does not implement Matrix's client-server API, room-event model, federation API or bridges. Matrix is a conceptual comparison here; a documented implementation influence has not been established.

## NATS: messaging infrastructure as a building block

[NATS and JetStream](https://docs.nats.io/concepts/jetstream) provide subject-based messaging and persistent streams with consumers. That separation between communication and retained delivery is directly reflected in EpochGrid's request/reply identity service, durable mailbox and CHAT path.

**Implemented integration:** EpochGrid uses the NATS protocol through `async-nats` and provisions JetStream resources. A generic NATS client is not therefore an EpochGrid client: it would still need the application's identity binding, MLS processing and local state rules.

## MLS: group state advances through epochs

[Messaging Layer Security, RFC 9420](https://www.rfc-editor.org/rfc/rfc9420.html), specifies group key establishment and encrypted messaging with evolving group state. EpochGrid delegates that cryptography to [OpenMLS](https://openmls.tech/), rather than defining its own group-encryption primitive.

**Implemented protocol:** MLS Welcomes, encrypted application messages and Commits. EpochGrid adds its own enrollment, directory, routing and persistence conventions. Interoperability with unrelated MLS applications has not been established by an integration test or commitment. Coordinated removal and rekeying are implemented, while general key rotation and comprehensive lifecycle guarantees remain incomplete in EpochGrid.

## Signal: key lifecycle is part of the system

[Signal's technical documentation](https://signal.org/docs/) describes key-agreement and ratcheting protocols, including multi-device session management. It is a useful reminder that message encryption, identity assurance and device lifecycle need to be considered together.

EpochGrid uses OpenMLS group state and independent device leaves, not Signal's protocol stack. Milestone 13 implements manual device verification and a bounded signed registration log; Milestone 14 adds revocation and coordinated removal, and Milestone 15 recovers identity administration without old messaging keys. First-contact trust and general key rotation remain limitations. Signal is related work, not a documented source influence or an interoperability target. No security ranking between the projects is implied.

## Reading the boundaries together

Open protocols, durable brokers and group encryption address different problems. EpochGrid currently combines a subset of these ideas through specific dependencies. Evaluations should follow the actual code and threat model, rather than infer compatibility or inherited guarantees from a list of related projects.
