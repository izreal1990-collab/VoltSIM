# VoltSim Unity package

Copy `Assets/VoltSim` into a Unity 2023 LTS or Unity 6 URP Android project.

## Scene setup

1. Create `CircuitRuntime` and add `CircuitGraph`. Create the four nodes in a bootstrap script or serialize them through a scenario builder, then call `SetRoots(phaseA, phaseB, neutral, ground)` and `Evaluate()` whenever a connection or breaker changes.
2. Put a trigger collider and `TerminalAnchor` on every screw, bus, chassis, and conductor touch point. Its node ID must match the graph node.
3. Add `ProbeTip` to each probe tip with a trigger collider and Rigidbody (kinematic). Assign the graph. Add `InteractiveMultimeter` to the meter body and assign both probes, optional TextMeshPro fields, and optional looping buzzer.
4. Add `VerletWireSpline`, `MeshFilter`, and `MeshRenderer` to each wire. Assign anchors and use a URP Lit material with GPU instancing enabled. Use 12-16 particles.
5. Add `NECComplianceEngine` to an inspector manager and call `Audit` after each wiring/torque action. Present its `Violations` to UI and feed them to the mentor.
6. Add `GeminiInstructorManager` to an AI manager. Assign graph, meter, and compliance engine. For development, enter an API key in the Inspector. For shipping Android builds, populate the serialized field from an authenticated backend or platform secret at runtime; do not ship an unrestricted Gemini key in the APK.

`CircuitGraph.Evaluate`, multimeter refresh, and wire mesh updates reuse fixed buffers. Gemini calls allocate only outside the per-frame runtime loop.
