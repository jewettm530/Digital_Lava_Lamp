# Phase 17 — Wax conservation and reflections

- Merge/split transitions now interpolate squared radii (2D wax area), keeping the total `sum(radius²)` stable through topology changes.
- Removed radius-based 'breathing' from render uniforms; ellipse deformation conserves area instead.
- Kept existing motion, controls, speed, pigment palette, translucency and gentle illumination.
- Added a third subtle moving glancing highlight and strengthened the two existing dynamic reflections. No center-based hotspot.
- **Limitation:** Conserving simulated 2D wax area does not guarantee exactly constant *visible pixel coverage*: overlap, soft unions and wax leaving the screen can still alter coverage slightly. An exact visible-area constraint would require an additional rendered-mask feedback pass or explicit area compensation.
