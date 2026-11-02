# Phase 13 — More fluid, color-aware wax lighting

Changes are limited to `src/rendering/lava.frag.glsl`.

- More responsive, shape-based specular reflection; no per-blob central highlight.
- Slow advection of weak interior illumination; no painted bands.
- Pigment-luminance-adjusted highlights and glow, so pale and dark pigments behave better.
- Light, thickness-dependent transmission while keeping black dark and white ivory.
- Existing physics, settings, gradients, and playback behavior unchanged.

This is an artistic 2.5D shader approximation, not volumetric ray tracing.
