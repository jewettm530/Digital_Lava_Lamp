# Phase 24 — Neck shading refinement

Based on the marked screenshots:
- Applied a *small* increase to smooth-union blending (0.092 → 0.106) to round the unusually sharp dents at joining/splitting contours.
- Computed the surface normal from a mixture of narrow and wider SDF gradients; this reduces localized shading discontinuity on necks.
- Junction/seam uncertainty now attenuates specular glints only. Diffuse light and subtle shadows no longer disappear abruptly in those regions.
- Specular seam masking is softer spatially, preserving most of the moving reflections while reducing neck glints.
- No center-based radial hotspot calculation added.
- No changes to `Simulation.ts`, timing, bounciness, colors, controls, or wake lock.

The blue slivers seen in the annotations are partly actual background showing through sharp negative-space indentations, not only shaded wax. The modest smooth-union increase targets those contours without changing the overall look radically.
