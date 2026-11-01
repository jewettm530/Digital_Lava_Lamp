export const MAX_BLOBS = 20;
export interface Blob { x: number; y: number; r: number; phase: number; drift: number; direction: number; speed: number; }
function random(min: number, max: number): number { return min + Math.random() * (max - min); }

/** Coordinates use screen HEIGHT as one unit, so circles retain their shape on wide screens. */
export class Simulation {
  readonly blobs: Blob[] = [];
  aspect = 1;
  elapsed = 0;
  constructor(aspect: number) { this.resize(aspect, true); }
  resize(aspect: number, initial = false): void {
    const old = this.aspect;
    this.aspect = aspect;
    if (!initial) {
      for (const b of this.blobs) b.x = Math.max(b.r * 0.4, Math.min(aspect - b.r * 0.4, b.x * aspect / old));
      return;
    }
    // Wider screens get more blobs, up to the shader budget.
    const count = Math.max(9, Math.min(17, Math.round(9 + (aspect - 0.55) * 5)));
    for (let i = 0; i < count; i++) {
      const r = random(0.060, 0.123);
      this.blobs.push({ x: random(r * 0.6, Math.max(r * 0.7, aspect - r * 0.6)),
        y: random(0.03, 0.97), r, phase: random(0, Math.PI * 2),
        drift: random(0.7, 1.6), direction: i % 4 === 0 ? -1 : 1,
        speed: random(0.010, 0.022) });
    }
    // Larger blobs tend to be slower; these timings are intentionally calm.
  }
  update(dt: number, multiplier: number): void {
    const step = Math.min(dt, 0.04) * multiplier;
    this.elapsed += step;
    for (const b of this.blobs) {
      const t = this.elapsed * b.drift + b.phase;
      const wobble = Math.sin(t * 0.63) * 0.33 + Math.sin(t * 1.13) * 0.18;
      const speed = b.speed * (1 + wobble);
      b.y += b.direction * speed * step;
      b.x += (Math.sin(t * 0.51) + Math.sin(t * 0.23 + b.phase) * 0.5) * 0.008 * step;
      const side = Math.min(b.r * 0.4, this.aspect * 0.15);
      b.x = Math.max(side, Math.min(this.aspect - side, b.x));
      const edge = b.direction > 0 ? 1 - b.r * 0.35 : b.r * 0.35;
      if ((b.direction > 0 && b.y >= edge) || (b.direction < 0 && b.y <= edge)) {
        b.y = edge;
        b.direction *= -1;
      }
    }
  }
  uniforms(): Float32Array {
    const result = new Float32Array(MAX_BLOBS * 4);
    this.blobs.forEach((b, i) => result.set([b.x, b.y, b.r, b.phase], i * 4));
    return result;
  }
}
