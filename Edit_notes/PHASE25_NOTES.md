# Phase 25 — Remove split/merge specular hotspots

- Increased specular exclusion at junctions of overlapping source ellipses, with a wider *smooth* falloff so a tiny bright point cannot form where a neck pinches.
- Also suppresses specular highlights where the wider, smoothed surface gradient becomes unreliable.
- This only affects the moving reflections at these necks. **Diffuse illumination, surface shadows, shading color and translucency are unchanged**, retaining the Phase 24 shadow fix.
- Simulation, speeds, bounciness, wax amount, settings, and PWA files unchanged.
- GLSL requires testing in a WebGL2 browser; the package and sources were inspected but the shader was not browser-tested here.
