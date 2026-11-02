# Phase 21 — Merge/split neck highlight fix

- Retained the Phase 20 fluid simulation and overall lighting.
- Calculated the magnitude of the *combined field gradient*. Where opposing normals cancel in a merge/split throat, the surface orientation is undefined and could produce an isolated bright dot.
- Masked only specular highlights in those low-gradient regions with a smooth transition. Diffuse shading, outer reflections, motion, speed, palette, and translucency are unchanged.
- Needs visual validation in your browser; this is a targeted shader fix, not a new simulation.
