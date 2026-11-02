# Phase 11 — Flow-dependent wax shading

This iteration replaces only `src/rendering/lava.frag.glsl`.

- Removes the persistent center hotspot. No per-blob center contributes to brightness.
- Uses the shared merged signed-distance surface for silhouette normals.
- Introduces broad, drifting highlights restricted to changing surface curvature.
- Uses world-space, slowly traveling color variation, not stamped highlights.
- Retains the existing simulation, preferences and controls from Phase 10.

## Installation
Copy `src/rendering/lava.frag.glsl` over that same file in your existing project and run `npm run dev`.

## Limitations
This is still a 2D shader-based approximation of translucent wax, not volumetric ray-marched 3D geometry. Browser/GPU testing is recommended.
