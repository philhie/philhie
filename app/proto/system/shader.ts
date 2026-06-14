import { GLSL } from "../_engine/glsl";

/**
 * The System — a cold, living computational substrate. A precise technical
 * lattice (deliberately NOT a hacker-green terminal) that bends around the
 * cursor like a lens, nodes igniting as the machine "computes", a slow scan
 * sweep, a central core. Monochrome cool + one steel-blue. Baked, one fbm.
 */
export const systemFragment = /* glsl */ `
${GLSL.common}

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerInfluence;
uniform float uReveal;

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // cursor as a lens that warps the lattice (the system responds to you)
  vec2 pc = uv - uPointer; pc.x *= aspect;
  float pd = length(pc);
  float lens = uPointerInfluence * 0.045 / (pd * pd + 0.02);
  vec2 w = uv - normalize(pc + 1e-5) * lens;

  // cold flowing substrate
  vec2 np = w * 2.0;
  float flow = fbm(np + vec2(uTime * 0.03, -uTime * 0.02));
  vec3 col = mix(vec3(0.010, 0.020, 0.035), vec3(0.040, 0.070, 0.100), flow);

  // precise technical grid, warped by the lens
  vec2 g = (w - 0.5) * vec2(aspect, 1.0);
  vec2 gp = g * 26.0;
  vec2 gf = abs(fract(gp) - 0.5);
  float line = smoothstep(0.47, 0.5, max(gf.x, gf.y));
  col += line * 0.10 * vec3(0.4, 0.6, 0.85);

  // nodes igniting as the machine computes
  vec2 ni = floor(gp);
  float nh = hash21(ni);
  float active = step(0.93, fract(nh + uTime * 0.12));
  float node = active * smoothstep(0.17, 0.0, length(fract(gp) - 0.5));
  col += node * vec3(0.5, 0.85, 1.0) * 0.9;

  // slow scan sweep
  float sweep = exp(-pow(fract(uv.y - uTime * 0.08) - 0.5, 2.0) * 40.0);
  col += sweep * vec3(0.2, 0.45, 0.7) * 0.16;

  // central core
  col += glow(length(p), 0.045, 0.40) * vec3(0.4, 0.7, 1.0);

  col = tonemap(col * 1.2);
  col *= vignette(uv, 0.3, 1.0);
  col *= uReveal;
  col += grain(gl_FragCoord.xy, uTime) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`;
