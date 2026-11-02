# Phase 15 — Slightly more translucent, softly luminous wax

Starting point: Phase 14. Only `src/rendering/lava.frag.glsl` changed.

- Raised thin-wax background transmission from 16% to 22.5% and thick-wax transmission from 6% to 9.5%, retaining pigment tint and darker black-wax behavior.
- Increased gentle flowing internal illumination ~20–26%, keeping the dynamic surface-oriented specular highlights unchanged.
- Widened the already-subtle external halo slightly (0.014 → 0.019), preserving its dark-wax suppression.
- Kept the no-central-hotspot shading approach, blob physics, speed, controls, palettes, and selected ivory white unchanged.

Installation: replace only `src/rendering/lava.frag.glsl` in your existing project.
This shader has not been validated in a live WebGL2 renderer in this environment.
