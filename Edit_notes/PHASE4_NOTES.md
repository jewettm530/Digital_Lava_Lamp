# Phase 4: real coalescence and gentler white

The simulation now merges nearby compatible blobs into one simulated mass, preserving their approximate 2D area, position, velocity and temperature. Large blobs can split after a cooldown. A gentle source near the bottom replenishes wax after repeated mergers. Lateral currents differ across blobs.

The White palette preset is intentionally warm off-white (#E5E2DB), and the shader now adds less white to blob shading, reducing the blown-out look.

This is still a stylized procedural simulation, not a full fluid solver. Merging remains a state transition rather than a fully animated viscous bridge. During testing, look for abrupt mergers and excessive growth. If those remain distracting, the next step is a deformation/necking transition across several frames.

Replace only these files in your existing project:
- src/simulation/Simulation.ts
- src/rendering/lava.frag.glsl
- src/settings.ts

Run npm run dev. Preserve your .git folder.
