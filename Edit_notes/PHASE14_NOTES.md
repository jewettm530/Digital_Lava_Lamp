# Phase 14 — Fluid surface lighting and mass-conserving bottom wax

- Removed the broad half-vector specular term that caused the fixed bright spot at blob centers. Highlights are now directional, animated, and limited to the combined wax surface.
- Kept subdued interior illumination and soft edge shadows; preserved all wax colors and controls.
- Removed independent bottom spawning. New wax lobes can only arise via gradual splitting from existing blobs or bottom reservoirs.
- Increased the initial bottom reservoir size slightly and lowered the reservoir splitting threshold so bottom wax can release lobes without needing spontaneous births.
- Reduced simulation clock speed by 8% at every selected rate.

Install: replace `src/rendering/lava.frag.glsl` and `src/simulation/Simulation.ts`. Full project is also included. Note: the new bottom behavior preserves finite initial wax mass, so the amount of visible lava can evolve differently over a long session. Shader requires live browser verification.
