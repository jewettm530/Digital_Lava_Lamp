# Phase 22 — Merge/split interior hotspot fix

Only `src/rendering/lava.frag.glsl` changed.

Phase 21 used only the magnitude of the field gradient to identify an unreliable surface normal. That misses places where two overlapping ellipses create internal lighting artifacts yet the gradient is not small. This phase calculates proximity to the two nearest contributing source ellipses, recognizes narrow blended seams, and fades specular, diffuse, and directional shadow terms locally. The exterior silhouette, wax pigment, gentle translucency, global reflections, and simulation remain unchanged.

This is a targeted rendering correction; it requires confirmation in WebGL2 on the user's machine.
