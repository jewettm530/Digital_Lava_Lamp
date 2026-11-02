# Phase 8 — wax volume and softly transmitted light

This release changes **only** `src/rendering/lava.frag.glsl`.

- Keeps the Phase 7 simulation, transition timing, settings and pigments unchanged.
- Replaces fixed light-center shading with lighting based on the *combined* wax signed-distance field and its outward normal.
- Uses thickness-inspired scattering: broad interior glow and more transparent thin edges.
- Uses slowly drifting light for subtle variation as blobs move, and softer rim light.
- Avoids individual circular highlights inside a merged mass.
- Keeps black dark and the approved ivory-white pigment unchanged.

This is artistic 2.5D rendering, not physically accurate volumetric refraction.

## Install
Copy `src/rendering/lava.frag.glsl` over the matching file in your current project. Run `npm run dev` and test it on several colors. If it seems less natural, keep your Phase 7 shader as a quick rollback.
