# Phase 20 — Edge elasticity, diagonal currents, hotspot fix

- Removed depth-dependent translucency (the fixed brighter-center/darker-edge pattern); constant gentle background transmission inside wax, preserving moving specular bands on the *combined* fluid outline.
- Narrowed the specular band without reducing peak glancing highlights.
- Increased diagonal currents compared with Phase 19, while buoyancy remains predominantly vertical.
- Added near-wall spring forces and damping so wax gradually compresses and rebounds on hitting the virtual glass.
- Strengthened contact compression in the rendering ellipses while preserving their areas.
- Retained the Phase 19 speed, wax conservation, pause, wake lock, settings, and color palette.
- Browser/WebGL testing still required; fixed internal simulations cannot guarantee exactly constant visible-screen area in all overlaps.
