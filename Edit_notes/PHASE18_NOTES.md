# Phase 18 changes
- Fixed center hotspots: removed radius/depth-dependent interior brightness, kept a low uniform flowing internal illumination.
- Stronger specular highlights only near the combined silhouette surface, following changing SDF normals; no per-blob centered spots.
- Fluid wobble: area-preserving oscillatory stretch with a damped spring; small impulses during merges and splits.
- Speed: internal time coefficient reduced from 0.92 to 0.85 (~7.6% slower for all five speed options). 1x remains faster than 0.5x.
- Wax conservation from Phase 17 retained.
- No changes to user controls, palettes, wake lock or pause logic.
