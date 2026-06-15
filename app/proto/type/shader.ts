import { GLSL } from "../_engine/glsl";

/**
 * Direction C — typographic cinema. The background is deliberately minimal so
 * the NAME (crisp DOM type) is the hero: a near-black stage, a single soft light
 * drifting like a slow key light, a faint haze, a strong cinematic vignette, and
 * heavy film grain. Cheap by design.
 */
export const typeFragment = /* glsl */ `
${GLSL.common}

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerInfluence;
uniform float uWarmth;
uniform float uReveal;

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 lightPos = vec2(sin(uTime * 0.06) * 0.45, 0.1 + cos(uTime * 0.05) * 0.18);
  lightPos += (uPointer - 0.5) * vec2(aspect, 1.0) * 0.35 * uPointerInfluence;
  float d = length(p - lightPos);
  float glow = exp(-d * d * 1.1) * 0.22;
  float haze = fbm(p * 2.2 + uTime * 0.025) * 0.05;

  vec3 key = mix(vec3(0.82, 0.84, 0.96), vec3(1.0, 0.86, 0.7), uWarmth);
  vec3 col = vec3(0.012, 0.014, 0.02);
  col += glow * key;
  col += haze * vec3(0.35, 0.40, 0.55);

  col = tonemap(col);
  col *= vignette(uv, 0.45, 1.3);
  col *= uReveal;
  col += grain(gl_FragCoord.xy, uTime) * 0.05;
  gl_FragColor = vec4(col, 1.0);
}
`;
