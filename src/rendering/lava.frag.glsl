#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform float uAspect;
uniform float uTime;
uniform int uCount;
uniform vec4 uBlobs[16];
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uLava;
uniform float uDarkWax;

// Render a SINGLE continuous wax surface; never shade individual source ellipses.
float ellipseSdf(vec2 p, vec4 b) {
  vec2 q = p - b.xy;
  vec2 r = max(b.zw, vec2(0.00001));
  float k0 = length(q / r);
  float k1 = length(q / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 0.0001);
}
float smoothUnion(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
// Smooth, shared, low-frequency displacement deforms the entire wax field.
// No per-blob jitter: merged silhouettes remain continuous and stable.
vec2 waxSpace(vec2 p) {
  float t = uTime;
  float swellX = 0.0072 * sin(p.y * 7.8 + t * 0.13 + 0.60 * sin(p.x * 3.6));
  float swellY = 0.0058 * cos(p.x * 7.1 - t * 0.12 + 0.53 * sin(p.y * 4.4));
  float fineX = 0.0027 * sin(p.y * 15.6 + p.x * 3.8 - t * 0.21);
  float fineY = 0.0025 * cos(p.x * 13.9 - p.y * 4.0 + t * 0.18);
  return p + vec2(swellX + fineX, swellY + fineY);
}
float sceneSdf(vec2 p) {
  p = waxSpace(p);
  float d = 10.0;
  for (int i = 0; i < 16; i++) {
    if (i >= uCount) break;
    d = smoothUnion(d, ellipseSdf(p, uBlobs[i]), 0.106);
  }
  return d;
}
// An internal junction between source ellipses can masquerade as a lit
// surface. Locate overlap/union seams separately from the real outer contour.
// This only controls SHADING; it never changes the visible wax silhouette.
float seamLightingMask(vec2 p) {
  vec2 samplePoint = waxSpace(p);
  float closest = 10.0;
  float second = 10.0;
  for (int i = 0; i < 16; i++) {
    if (i >= uCount) break;
    float v = ellipseSdf(samplePoint, uBlobs[i]);
    if (v < closest) { second = closest; closest = v; }
    else if (v < second) { second = v; }
  }
  // Only equal-contribution areas from nearby wax sources are suspect.
  // This includes the thin film between masses during coalescence, but does
  // not flatten other curved regions or remove their specular reflections.
  // A wide, smooth specular exclusion zone follows the junction through
  // the whole split/merge.  It fades continuously before the neck closes,
  // so the reflection cannot concentrate into a pinprick at its centre.
  float matching = 1.0 - smoothstep(0.010, 0.115, abs(second - closest));
  float nearby = 1.0 - smoothstep(0.005, 0.125, second);
  float seam = matching * nearby;
  return 1.0 - 0.995 * seam;
}

// A coherent low-frequency flow moves ACROSS wax rather than being locked to its center.
vec2 advect(vec2 p, float t) {
  vec2 a = vec2(0.045 * sin(p.y * 4.1 + t * 0.23),
                0.030 * cos(p.x * 4.4 - t * 0.19));
  return p + a + vec2(t * 0.007, -t * 0.004);
}
float flowingBands(vec2 q, float t) {
  float a = sin(q.x * 5.7 + q.y * 3.0 + 0.65 * sin(q.y * 4.5) - t * 0.09);
  float b = sin(q.y * 8.2 - q.x * 2.5 + t * 0.12);
  return 0.5 + 0.32 * a + 0.18 * b;
}
void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec3 bg = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
  bg *= 0.87 + 0.10 * (1.0 - abs(2.0 * vUv.y - 1.0));
  float d = sceneSdf(p);
  float aa = max(fwidth(d), 0.0006);
  float mask = 1.0 - smoothstep(-aa, aa, d);
  float halo = exp(-max(d, 0.0) * 38.0) * 0.019 * (1.0 - 0.85 * uDarkWax);
  if (mask <= 0.0001) {
    outColor = vec4(clamp(bg + uLava * halo, 0.0, 1.0), 1.0);
    return;
  }
  float depth = max(-d, 0.0);
  // Wax has a gently curved apparent rim and a broad, thick center, but
  // NO center-located light or radial spotlight.
  float rim = exp(-depth * 37.0);
  // Keep interior wax brightness independent of distance to its center.
  // Reflections are confined to a narrow, moving surface band.
  const float e = 0.0019;
  vec2 grad = vec2(sceneSdf(p + vec2(e,0.0)) - sceneSdf(p - vec2(e,0.0)),
                   sceneSdf(p + vec2(0.0,e)) - sceneSdf(p - vec2(0.0,e))) / (2.0 * e);
  float gradientStrength = length(grad);
  // A wider gradient stabilizes shading across the tight curvature of necks
  // and splitting saddles. Blend gently toward the finely sampled normal.
  const float wideE = 0.005;
  vec2 wideGrad = vec2(
    sceneSdf(p + vec2(wideE,0.0)) - sceneSdf(p - vec2(wideE,0.0)),
    sceneSdf(p + vec2(0.0,wideE)) - sceneSdf(p - vec2(0.0,wideE))
  ) / (2.0 * wideE);
  vec2 smoothGrad = mix(grad, wideGrad, 0.53);
  vec2 outward = smoothGrad / max(length(smoothGrad), 0.00001);
  // At the saddle between merging wax masses, opposing surface gradients
  // cancel. A normalized near-zero gradient otherwise produces a tiny,
  // abnormally bright reflection at the throat. Suppress ONLY specular light
  // at these ambiguous normals, leaving the overall rim illumination intact.
  // Use the gradient actually used for lighting too: averaging normals at
  // the neck can cancel them even if the fine gradient alone looks reliable.
  float neckSpecularMask = smoothstep(0.20, 0.82,
                                      min(gradientStrength, length(smoothGrad)));
  float seamMask = seamLightingMask(p);
  // Junction uncertainty suppresses only the glints, not the underlying
  // diffuse surface illumination. Multiplying every lighting term by the
  // seam mask used to create local dim patches while separating.
  // Specular-only suppression. Diffuse and shadow lighting are deliberately
  // unaffected, preserving Phase 24's corrected seamless base shading.
  float surfaceReliability = neckSpecularMask * seamMask;
  float t = uTime;
  vec2 q = advect(p, t);
  float flow = flowingBands(q, t);
  float ripple = sin(q.x * 11.5 - q.y * 7.0 + t * 0.32) * 0.5;
  // Perturb surface orientation gently in the same shared spatial field;
  // suppress microhighlights inside thick blob interiors.
  // Highlights are based on the unified moving surface normal, never on
  // distance to a blob center. Two broad angled reflections glide over it.
  vec2 warped = outward + rim * vec2(0.09 * sin(q.y * 7.5 + t * 0.21),
                                     0.08 * cos(q.x * 8.4 - t * 0.17));
  vec2 edgeNormal = normalize(warped + vec2(0.00001, 0.0));
  vec2 lightA = normalize(vec2(-0.66 + 0.12*sin(t * 0.10),
                               0.75 + 0.10*cos(t * 0.08)));
  vec2 lightB = normalize(vec2(0.91 + 0.08*cos(t * 0.07),
                               0.38 + 0.10*sin(t * 0.11)));
  float facing = dot(edgeNormal, lightA);
  float sideFacing = dot(edgeNormal, lightB);
  float diffuse = 0.62 + 0.28 * facing * rim;
  float shadow = rim * pow(max(-facing, 0.0), 1.5);
  float movingReflection = 0.67 + 0.33 * sin(q.x * 13.0 + q.y * 5.7 - t * 0.42);
  float movingSecondary = 0.65 + 0.35 * cos(q.y * 11.8 - q.x * 6.2 + t * 0.35);
  // Three glancing, flowing reflections. All depend on the unified field
  // normal and advected coordinates; none are anchored to blob centers.
  vec2 lightC = normalize(vec2(-0.18 + 0.15*cos(t*0.09), -0.98));
  float thirdFacing = dot(edgeNormal, lightC);
  float movingThird = 0.5 + 0.5*sin(q.y*9.3 + q.x*7.2 + t*0.29);
  float highlight = surfaceReliability * pow(rim, 1.65) * (
    1.18 * pow(max(facing, 0.0), 5.0) * movingReflection +
    0.81 * pow(max(sideFacing, 0.0), 8.0) * movingSecondary +
    0.34 * pow(max(thirdFacing, 0.0), 10.5) * movingThird
  );
  // Use the chosen pigment's luminance for color-aware lighting. Pale wax
  // needs reduced reflection to avoid chalk; rich wax gets clearer highlights.
  float lum = dot(uLava, vec3(0.2126,0.7152,0.0722));
  float highlightStrength = mix(0.225, 0.135, smoothstep(0.18,0.85,lum));
  float internalStrength = mix(0.072,0.035,smoothstep(0.15,0.85,lum));
  highlightStrength *= 1.0 - 0.35 * uDarkWax;
  internalStrength *= 1.0 - 0.67 * uDarkWax;

  // Gentle luminous wax with spatially drifting warm/cool undertones. The
  // flow signal is very low contrast, avoiding painted stripes or neon.
  float diffLight = 1.0 + 0.10 * (diffuse - 0.62);
  vec3 pigment = uLava * diffLight;
  pigment *= 0.965 + 0.048 * (flow - 0.5) + 0.012 * ripple;
  vec3 warm = mix(uLava, vec3(1.0,0.92,0.83), 0.24);
  // Uniform low-level luminosity, modulated by flowing world-space bands;
  // no center-distance, mass, radial falloff, or fixed internal spotlight.
  pigment += warm * internalStrength * (0.68 + 0.32 * flow);
  pigment += vec3(1.0,0.95,0.91) * highlightStrength * highlight;
  pigment *= 1.0 - (0.13 + 0.025 * ripple) * shadow;

  // Refraction-like transmission is mild and attenuated in thick material.
  // Black stays dark, ivory stays neutral, and all colors keep their identity.
  // A constant low transmission avoids a bright interior/darker rim
  // masquerading as a permanent central spotlight.
  float transmission = (0.145 + 0.012 * (flow - 0.5)) * (1.0 - 0.80 * uDarkWax);
  // Slightly more background transmission with slow spatial variation,
  // unrelated to blob centers, thickness or seam normals. Wax stays pigmented.
  vec3 wax = mix(pigment, mix(bg, uLava, 0.22), transmission);
  vec3 finalColor = mix(bg, wax, mask);
  finalColor += uLava * halo * (1.0-mask);
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
