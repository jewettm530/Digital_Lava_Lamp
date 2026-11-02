# Phase 5 — Smooth transitions and softer wax color

- Merging now occurs through a multi-second radius/position transition, instead of instantly deleting one blob.
- Splitting gradually creates and expands the child blob rather than producing an abrupt size jump.
- Transitioning blobs are excluded from additional merge/split events.
- Lava now uses its own subdued wax pigments (`LAVA_COLORS`) independent of the background color palette (`COLORS`).
- The white wax is softened to ivory, with reduced washout/highlighting.

This remains a procedural visual approximation, not a volumetric fluid simulation. If separation still looks unnatural, the next step is a continuous shape/neck model rather than particle-based topology changes.
