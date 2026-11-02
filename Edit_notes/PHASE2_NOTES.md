# Phase 2 — Fluid movement update

This update replaces `src/simulation/Simulation.ts` and adjusts `src/rendering/lava.frag.glsl`. All existing settings, wake lock, PWA, and pause controls remain intact.

The new motion uses a fixed-step, temperature-inspired buoyancy model with inertia, weak lateral currents, gentle blob repulsion, and boundary interactions. The shader reduces the smoothing radius so separate blobs do not merge into a screen-filling sheet as easily. This is a procedural approximation, not a full Navier–Stokes solver.

## Test

Run `npm install` (if needed), then `npm run dev`. Check motion over several minutes at 1x. Run `npm run build` before committing. If the app is already running, stop and restart the development server if changes do not appear.

## Next refinements

Blob necking and actual mass transfer on splitting/merging, smoother heating/cooling circulation, and a more realistic translucent wax shader.
