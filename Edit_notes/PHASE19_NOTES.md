# Phase 19 changes
- Screen edges now act as lamp glass boundaries: blob centers are clamped inside the screen, and near-edge blobs flatten against the wall while preserving area approximately.
- Increased elastic stretch/rebound with stronger damped wobble impulses on merges, splits, and wall contact—without positional jumps.
- Motion is more lava-lamp-like: stronger vertical buoyancy, reduced lateral swirl, and reservoir motion biased toward bottom bobbing instead of sideways wandering.
- All speed settings are slightly slower again: internal time coefficient reduced from 0.85 to 0.82. 1x remains faster than 0.5x but slower than the previous 1x.
- No shader hotspot changes; Phase 18 highlight/translucency behavior preserved.
