# Phase 6 — cohesive merged shading and wax palette

Replace these files in your existing project:
- `src/rendering/lava.frag.glsl`
- `src/rendering/Renderer.ts`
- `src/settings.ts`

No simulation changes; Phase 5 merge/split timing is preserved.

Changes: shared spatial deformation rather than per-blob distortion; broader, smoother union; shading only from the combined signed-distance surface; genuinely dark black wax with restrained reflections; more nuanced non-white pigment shades. White is unchanged at `#DFDCD5`.

Run `npm run dev` and review mergers at 1x. Note that a purely 2D metaball shader is still an approximation of 3D wax.
