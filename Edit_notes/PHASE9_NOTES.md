# Phase 9: Shader fix and animated bottom wax

- Fixed GLSL line 73 `-.facing` syntax error (`-facing`).
- Removed two hard-coded wax circles from GLSL.
- Added simulated bottom reservoirs that drift, bob, deform, merge and release wax.
- Reservoir-to-blob merges use the existing multi-second merge transitions.
- Preserves settings and the rest of the Phase 8 rendering.

Replace `src/rendering/lava.frag.glsl` and `src/simulation/Simulation.ts`.
Run `npm run build` and then `npm run dev`.
