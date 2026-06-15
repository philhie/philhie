import { GLSL } from "../_engine/glsl";

/**
 * Direction B — a sculptural liquid-metal / obsidian mass.
 *
 * A morphing SDF (merged spheres + surface ripple) sphere-traced in one
 * fullscreen pass, shaded as near-black metal reflecting a procedural studio
 * environment, with a fresnel rim, a single sculptural specular, and a warm
 * dispersion edge (your-sky tint). Slowly turns; the cursor steers it. Soul
 * (organic morph) meets machine (mirror-precise metal).
 */
export const objectFragment = /* glsl */ `
${GLSL.common}

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerInfluence;
uniform float uWarmth;     // your-sky tint
uniform float uReveal;
uniform float uSteps;      // adaptive march budget

mat3 rotY(float a){ float s = sin(a), c = cos(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
mat3 rotX(float a){ float s = sin(a), c = cos(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0); return mix(b,a,h) - k*h*(1.0-h); }

float map(vec3 p){
  float t = uTime * 0.25;
  float d = length(p) - 1.0;
  d = smin(d, length(p - vec3(sin(t)*0.7, cos(t*0.8)*0.6, sin(t*1.3)*0.5)) - 0.6, 0.55);
  d = smin(d, length(p + vec3(cos(t*1.1)*0.7, sin(t*0.6)*0.6, cos(t)*0.5)) - 0.55, 0.55);
  d += 0.05 * sin(7.0*p.x + t*2.0) * sin(7.0*p.y) * sin(7.0*p.z); // liquid ripple
  return d;
}
vec3 calcNormal(vec3 p){
  vec2 e = vec2(0.0012, 0.0);
  return normalize(vec3(
    map(p+e.xyy) - map(p-e.xyy),
    map(p+e.yxy) - map(p-e.yxy),
    map(p+e.yyx) - map(p-e.yyx)));
}
// procedural studio environment, warm/cool by your-sky
vec3 env(vec3 r){
  float up = r.y * 0.5 + 0.5;
  vec3 cool = vec3(0.45, 0.55, 0.78);
  vec3 warm = vec3(0.92, 0.70, 0.48);
  vec3 horizon = mix(vec3(0.015,0.02,0.035), mix(cool, warm, uWarmth), up);
  float key = pow(max(dot(r, normalize(vec3(0.5,0.8,0.3))), 0.0), 8.0);
  return horizon + vec3(1.0,0.95,0.9) * key * 1.3;
}

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec3 ro = vec3(0.0, 0.0, 3.6);
  vec3 rd = normalize(vec3(p, -1.7));
  float ax = (uPointer.x - 0.5) * 1.2 * uPointerInfluence + uTime * 0.06;
  float ay = (uPointer.y - 0.5) * 0.8 * uPointerInfluence;
  mat3 rot = rotY(ax) * rotX(ay);
  ro = rot * ro; rd = rot * rd;

  float t = 0.0; bool hit = false;
  const int MAX = 96;
  for (int i = 0; i < MAX; i++){
    if (float(i) >= uSteps) break;
    float d = map(ro + rd * t);
    if (d < 0.001){ hit = true; break; }
    if (t > 8.0) break;
    t += d * 0.9;
  }

  vec3 col;
  if (hit){
    vec3 pos = ro + rd * t;
    vec3 n = calcNormal(pos);
    vec3 refl = reflect(rd, n);
    float fres = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
    vec3 base = vec3(0.02, 0.022, 0.028);
    col = base + env(refl) * mix(0.22, 1.0, fres);
    col += fres * vec3(0.95, 0.62, 0.42) * 0.16 * (0.4 + uWarmth);  // dispersion edge
    col += pow(max(dot(refl, normalize(vec3(0.5,0.8,0.3))), 0.0), 64.0) * 1.6; // specular
  } else {
    col = env(rd) * 0.10;
  }

  col = tonemap(col * 1.05);
  col *= vignette(uv, 0.32, 1.0);
  col *= uReveal;
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  col += (ign - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;
