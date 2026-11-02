# Phase 7 — fluid illumination and saturated wax pigments

Changes:
- Kept Phase 6/5 physics and smooth merge/split transitions unchanged.
- Used a single union-surface normal with low-amplitude drifting light and interior variation, avoiding static center-bright blob shading.
- Increased wax pigment saturation for all colors except White, whose base remains exactly #DFDCD5.
- Retained dark black wax and reduced the intensity of its surface reflections.
- Limited the animation time step after event-loop stalls and avoided unnecessary position remapping on tiny resize events. These address likely causes of jumps, but the root cause should be checked if jumps persist.

Replace: `src/rendering/lava.frag.glsl`, `src/settings.ts`, and `src/main.ts`.

Test at 1x for several minutes, then try pink, blue, red, black and white wax. Use the browser console to report any errors if a whole-screen jump persists.
