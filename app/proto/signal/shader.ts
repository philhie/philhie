import { GLSL } from "../_engine/glsl";

/**
 * The Signal — a faint signal in the dark that grows into a constellation.
 * Near-monochrome (cool whites on ink), a single amber ember, heavy grain.
 * Star density scales with uGrowth (visits + dwell), the cursor reveals nearby
 * stars (gravity, not spotlight), a central pulse is the "signal". All baked,
 * one fbm, three cheap star layers.
 */
export const signalFragment = /* glsl */ `
${GLSL.common}

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerInfluence;
uniform float uGrowth;     // 0 faint .. 1 full constellation
uniform float uReturning;
uniform float uReveal;
uniform float uSeed;       // per-visitor deterministic layout

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // faint cool nebula, desaturated
  vec2 np = p * 1.5 + vec2(uSeed * 10.0);
  float neb = fbm(np + uTime * 0.01);
  vec3 col = mix(vec3(0.010, 0.012, 0.020), vec3(0.028, 0.036, 0.055), neb * 0.5) * 0.55;

  // cursor reveal field (gravity well of light)
  vec2 pc = uv - uPointer; pc.x *= aspect;
  float reveal = uPointerInfluence * exp(-dot(pc, pc) * 6.0);

  float stars = 0.0;
  float amber = 0.0;
  for (int L = 0; L < 3; L++){
    float fl = float(L);
    float sc = 42.0 + fl * 44.0;
    vec2 sp = (p + vec2(uSeed * 3.0 + fl)) * sc;
    vec2 gi = floor(sp); vec2 gf = fract(sp) - 0.5;
    float h = hash21(gi + fl * 17.0);
    float gate = step(1.0 - (0.08 + 0.20 * uGrowth), h);
    float tw = 0.55 + 0.45 * sin(uTime * 1.5 + h * 60.0);
    stars += gate * smoothstep(0.5, 0.0, length(gf)) * tw * (0.55 + reveal * 1.6);
    float am = step(0.988, hash21(gi + fl * 91.0)) * smoothstep(0.45, 0.0, length(gf));
    amber += am;
  }
  col += stars * vec3(0.80, 0.86, 1.0);
  col += amber * vec3(0.95, 0.60, 0.25) * (0.8 + 0.4 * sin(uTime * 2.0));

  // central signal: a soft core + an expanding ring pulse
  float d = length(p);
  float pulse = fract(uTime * 0.18);
  float ring = glow(d - pulse * 0.9, 0.014, 0.35) * (1.0 - pulse) * (0.4 + 0.3 * uGrowth);
  float core = glow(d, 0.02, 0.7);
  col += (ring + core) * vec3(0.70, 0.80, 1.0);

  col += uReturning * stars * 0.25; // the constellation remembers you

  col = tonemap(col * 1.3);
  col *= uReveal;
  col += grain(gl_FragCoord.xy, uTime) * 0.055; // heavy grain — the "film"
  gl_FragColor = vec4(col, 1.0);
}
`;
