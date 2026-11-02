# Phase 12 — Softly illuminated, subtly translucent wax

This update replaces **only** `src/rendering/lava.frag.glsl` and does not alter the established movement, splitting, merging, controls, or preferred ivory white color.

Changes:
- Thickness-dependent backdrop transmission: lightly translucent at edges, more opaque inside.
- Subtle internal illumination that flows in shared scene coordinates.
- Directional light and moving soft reflections derived from the *unified* lava surface.
- Rounded surface normals, faint grazing highlights, and subtle light-facing shadows.
- No center-anchored hotspot or per-ellipse lighting.
- Dark wax receives reduced transmission and highlights so black stays dark.

## Installation

Replace `src/rendering/lava.frag.glsl` in your current project, then run `npm run dev`.

## Limitations

This remains a procedural 2.5D shader: it uses signed-distance depth as a visual proxy for wax thickness, not physical volume ray tracing. The effects are intentionally restrained. Evaluate on your device and compare appearance across black, white, pink, and blue wax.
