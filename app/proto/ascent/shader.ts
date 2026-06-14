import { GLSL } from "../_engine/glsl";

/**
 * The Ascent — an atmosphere that transforms with scroll. At the ground a warm
 * hazy horizon glow (tinted by the visitor's real local sky); as you ascend the
 * horizon sinks and dims, the palette cools to ink, and stars emerge into orbit.
 * Glow is baked (no bloom), one fbm + one domain warp, grain in-pass.
 */
export const ascentFragment = /* glsl */ `
${GLSL.common}

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform float uScroll;          // 0 ground .. 1 orbit
uniform vec2  uPointer;         // 0..1
uniform float uPointerInfluence;
uniform float uWarmth;          // your-sky: 0 cold .. 1 warm
uniform float uDaylight;        // your-sky: 0 night .. 1 midday
uniform float uHaze;            // your-sky: cloud cover
uniform vec2  uDrift;           // your-sky: wind
uniform float uReturning;       // 0 first visit .. 1 returning
uniform float uReveal;          // entrance 0 .. 1

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float alt = clamp(uScroll, 0.0, 1.0);

  // gravity-well warp toward the pointer (a soft lens, not a spotlight)
  vec2 pc = uv - uPointer; pc.x *= aspect;
  float pd = length(pc);
  float well = uPointerInfluence * 0.05 / (pd * pd + 0.02);
  vec2 w = uv - normalize(pc + 1e-5) * well;

  // drifting atmosphere, thinning with altitude
  vec2 np = w * vec2(2.4, 3.2);
  np += uDrift * uTime * 0.04;
  np.y -= uTime * 0.015 + uScroll * 0.5;
  float warp = fbm(np * 0.5 + uTime * 0.01);
  float clouds = fbm(np + warp);
  float density = clouds * (1.0 - alt * 0.65) * (0.45 + 0.55 * uHaze);

  // vertical palette: warm ember low → ink orbit high
  float h = clamp(mix(uv.y, alt + (1.0 - uv.y) * 0.25, 0.55), 0.0, 1.0);
  vec3 ground = mix(vec3(0.45, 0.16, 0.06), vec3(0.98, 0.52, 0.20), uWarmth);
  ground *= mix(0.55, 1.0, uDaylight);
  vec3 midSky = vec3(0.10, 0.09, 0.15);
  vec3 orbit = vec3(0.012, 0.018, 0.05);
  vec3 sky = mix(ground, midSky, smoothstep(0.0, 0.5, h));
  sky = mix(sky, orbit, smoothstep(0.45, 1.0, h));

  // horizon glow that sinks + dims as you ascend (baked, not bloom)
  float hy = uv.y - (0.18 - uScroll * 0.32);
  float band = glow(hy, 0.14, 1.0) * (1.0 - uScroll * 0.7);
  vec3 sun = mix(vec3(1.0, 0.45, 0.18), vec3(1.0, 0.82, 0.5), uWarmth) * band;

  // stars emerge at altitude
  vec2 sp = w * vec2(aspect, 1.0) * 90.0;
  vec2 gi = floor(sp); vec2 gf = fract(sp);
  float hh = hash21(gi);
  float twinkle = 0.6 + 0.4 * sin(uTime * 2.2 + hh * 60.0);
  float star = smoothstep(0.975, 1.0, hh) * smoothstep(0.16, 0.0, length(gf - 0.5));
  float stars = star * twinkle * smoothstep(0.25, 0.85, alt) * (1.0 + 0.4 * uReturning);

  vec3 col = sky;
  col += density * vec3(0.5, 0.45, 0.55) * 0.22 * (1.0 - alt * 0.4);
  col += sun;
  col += stars * vec3(0.92, 0.96, 1.0);

  col = tonemap(col * 1.12);
  col *= vignette(uv, 0.3, 1.0);
  col *= uReveal;
  col += grain(gl_FragCoord.xy, uTime) * (0.02 + 0.03 * (1.0 - alt));

  gl_FragColor = vec4(col, 1.0);
}
`;
