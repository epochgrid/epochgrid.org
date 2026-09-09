---
title: "Inspirations and related work"
description: "Technical context for the design: actual dependencies, relevant comparisons, and the boundary between shared ideas and protocol compatibility."
eyebrow: "04 / Related work"
sources:
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

NATS and MLS directly shape EpochGrid because they are implemented dependencies. The inspected repository does not document a historical design influence from Matrix, Signal or SCION. Those projects are included below as useful conceptual reference points, not as attributed origin stories.

No Matrix, Signal or SCION compatibility is established. Use of MLS likewise does not imply that an arbitrary MLS application can join an EpochGrid group.

## Matrix: open messaging across servers

[Matrix's architecture](https://matrix.org/docs/matrix-concepts/elements-of-matrix/) separates clients, homeservers and a server-to-server federation API. Its open, versioned specification is a useful example of making protocol behavior inspectable across implementations.

For readers of EpochGrid, the relevant comparison is how conversation state and infrastructure responsibilities are divided. EpochGrid currently routes through NATS and uses OpenMLS group state on devices. It does not implement Matrix's client-server API, room-event model, federation API or bridges. Matrix is a conceptual comparison here; a documented implementation influence has not been established.

## NATS: messaging infrastructure as a building block

[NATS and JetStream](https://docs.nats.io/concepts/jetstream) provide subject-based messaging and persistent streams with consumers. That separation between communication and retained delivery is directly reflected in EpochGrid's request/reply identity service, durable mailbox and CHAT path.

**Implemented integration:** EpochGrid uses the NATS protocol through `async-nats` and provisions JetStream resources. A generic NATS client is not therefore an EpochGrid client: it would still need the application's identity binding, MLS processing and local state rules.

## MLS: group state advances through epochs

[Messaging Layer Security, RFC 9420](https://www.rfc-editor.org/rfc/rfc9420.html), specifies group key establishment and encrypted messaging with evolving group state. EpochGrid delegates that cryptography to [OpenMLS](https://openmls.tech/), rather than defining its own group-encryption primitive.

**Implemented protocol:** MLS Welcomes, encrypted application messages and Commits. EpochGrid adds its own enrollment, directory, routing and persistence conventions. Interoperability with unrelated MLS applications has not been established by an integration test or commitment. Membership removal, key updates and their lifecycle guarantees remain incomplete in EpochGrid.

## Signal: key lifecycle is part of the system

[Signal's technical documentation](https://signal.org/docs/) describes key-agreement and ratcheting protocols, including multi-device session management. It is a useful reminder that message encryption, identity assurance and device lifecycle need to be considered together.

EpochGrid uses OpenMLS group state and independent device leaves, not Signal's protocol stack. Its threat model still identifies verification, rotation and revocation gaps. Signal is related work, not a documented source influence or an interoperability target. No security ranking between the projects is implied.

## SCION: routing trust is a different layer

[SCION](https://scion.org/) studies Internet architecture with explicit path control and trust domains. It is relevant context for distinguishing network-path properties from application-content protection.

EpochGrid's NATS subjects and application routing do not implement SCION path selection. No SCION transport integration is present in the inspected workspace, and no historical influence is documented. The comparison highlights a boundary: protecting message content at endpoints does not provide network-path control or hide traffic metadata.

## Reading the boundaries together

An open protocol, a durable broker, group encryption and path-aware networking address different problems. EpochGrid currently combines a subset of these ideas through specific dependencies. Evaluations should follow the actual code and threat model, rather than infer compatibility or inherited guarantees from a list of related projects.
