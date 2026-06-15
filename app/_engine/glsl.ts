/**
 * Shared GLSL building blocks for the prototype worlds.
 *
 * Design rule (the whole point of the rebuild): everything here is cheap.
 * One fullscreen fragment shader, glow baked in-shader (no bloom passes),
 * grain/dither in the same pass (no post-processing). Concatenate `GLSL.common`
 * into a world's fragment shader and call the helpers.
 *
 * GLSL ES 1.00 (OGL default) for the broadest device compatibility.
 */

export const GLSL = {
  /** Hashing + value noise + fbm + utility helpers. ~cheap. */
  common: /* glsl */ `
precision highp float;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

mat2 rot(float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

vec2 hash22(vec2 p){
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(262144.0, 32768.0) * n) * 2.0 - 1.0;
}

// Smooth value noise in [0,1]
float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal brownian motion (5 octaves). Rotated lattice to hide axis artifacts.
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){
    v += a * vnoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// Cheap baked glow — replaces a multi-pass bloom chain entirely.
float glow(float d, float radius, float intensity){
  return intensity * exp(-(d * d) / max(radius * radius, 1e-5));
}

// Ordered-ish dithering + film grain in one. Add to final color before output.
// Kills 8-bit banding on smooth gradients and adds an authored "film" texture.
float grain(vec2 fragCoord, float t){
  return (hash21(fragCoord + fract(t) * 113.0) - 0.5);
}

// ACES-ish filmic tonemap for rich blacks + soft highlights (cinematic).
vec3 tonemap(vec3 x){
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// Vignette as a multiply (cheap, no extra pass).
float vignette(vec2 uv, float amount, float softness){
  vec2 q = uv * (1.0 - uv);
  float v = q.x * q.y * 15.0;
  return pow(v, amount * softness);
}
`,
} as const;

/** Default fullscreen vertex shader for an OGL Triangle. */
export const FULLSCREEN_VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
