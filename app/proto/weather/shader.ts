import { GLSL } from "../_engine/glsl";

/**
 * Direction A — "A name made of weather": a true volumetric atmosphere.
 *
 * Not a gradient. A single-pass volumetric raymarch through 3D FBM cloud
 * density with physical light scattering (Beer's law + a nested light-march for
 * god-rays + Henyey-Greenstein forward-scatter), a slow dawn→night light cycle,
 * blue-noise jitter + dither to kill banding. Heavy by nature → runs only on the
 * capable tier (half-res); weak devices get the static poster.
 *
 * GLSL ES 1.00, WebGL2-class. (WebGPU/TSL is a later upgrade; the look is
 * identical, the math is what makes it premium.)
 */
export const weatherFragment = /* glsl */ `
${GLSL.common}

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerInfluence;
uniform float uWarmth;     // your-sky 0..1
uniform float uDaylight;   // your-sky 0..1
uniform float uHaze;       // your-sky cloud cover 0..1
uniform vec2  uDrift;      // your-sky wind
uniform float uSun;        // dawn→night cycle, 0..1
uniform float uReveal;     // entrance 0..1
uniform float uSteps;      // adaptive march budget (tier-driven)

// ---- 3D value noise + fbm (volumetric density) ----
float hash13(vec3 p){
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise3(vec3 p){
  vec3 i = floor(p); vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i + vec3(0,0,0));
  float n100 = hash13(i + vec3(1,0,0));
  float n010 = hash13(i + vec3(0,1,0));
  float n110 = hash13(i + vec3(1,1,0));
  float n001 = hash13(i + vec3(0,0,1));
  float n101 = hash13(i + vec3(1,0,1));
  float n011 = hash13(i + vec3(0,1,1));
  float n111 = hash13(i + vec3(1,1,1));
  return mix(mix(mix(n000,n100,f.x), mix(n010,n110,f.x), f.y),
             mix(mix(n001,n101,f.x), mix(n011,n111,f.x), f.y), f.z);
}
float fbm3(vec3 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ v += a * vnoise3(p); p *= 2.03; a *= 0.5; }
  return v;
}
// Henyey-Greenstein phase
float hg(float c, float g){
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * PI * pow(max(1.0 + g2 - 2.0 * g * c, 1e-3), 1.5));
}
float density(vec3 p){
  p.xz += uDrift * uTime * 0.12;
  p.y  += uTime * 0.015;
  float base = fbm3(p * 0.62);
  return clamp(base - (0.46 - 0.22 * uHaze), 0.0, 1.0);
}
// Cheap single-octave density for the light march (shadowing only — low-freq
// is plenty, and this is where the cost was). ~3x cheaper than the main field.
float densityLight(vec3 p){
  p.xz += uDrift * uTime * 0.12;
  p.y  += uTime * 0.015;
  float n = vnoise3(p * 0.62);
  return clamp(n - (0.46 - 0.22 * uHaze), 0.0, 1.0);
}

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec3 ro = vec3(0.0, 0.0, 4.0);
  vec3 rd = normalize(vec3(p, -1.6));

  // pointer = a soft gravitational bend in the field (not a spotlight)
  vec2 pc = (uPointer - 0.5) * vec2(aspect, 1.0);
  rd.xy += (pc - p) * 0.05 * uPointerInfluence;
  rd = normalize(rd);

  // sun swings below→high→below across the dawn→day→dusk→night cycle
  float sunAng = mix(-0.35, PI + 0.35, uSun);
  vec3 sunDir = normalize(vec3(cos(sunAng) * 0.6, sin(sunAng), 0.35));
  float hgt = clamp(sin(sunAng), 0.0, 1.0);

  vec3 dawn  = vec3(1.0, 0.42, 0.16);
  vec3 day   = vec3(1.0, 0.92, 0.78);
  vec3 night = vec3(0.10, 0.14, 0.30);
  vec3 sunCol = mix(mix(night, dawn, smoothstep(0.0, 0.22, hgt)), day, smoothstep(0.22, 0.8, hgt));
  sunCol = mix(sunCol, mix(dawn, day, uWarmth), 0.22 * uDaylight);

  // interleaved-gradient blue-noise jitter (dedband the march)
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float jitter = fract(ign + uTime * 0.61);

  float t = 1.0 + jitter * 0.18;
  float transmittance = 1.0;
  vec3 scattered = vec3(0.0);
  const int MAX_STEPS = 40;
  for (int i = 0; i < MAX_STEPS; i++){
    if (float(i) >= uSteps || transmittance < 0.02) break;
    vec3 sp = ro + rd * t;
    float dens = density(sp);
    if (dens > 0.001){
      float ldens = 0.0; float lt = 0.14;
      for (int j = 0; j < 3; j++){ ldens += densityLight(sp + sunDir * lt); lt += 0.26; }
      float lightT = exp(-ldens * 1.05);
      float phase = hg(dot(rd, sunDir), 0.55);
      vec3 lum = sunCol * lightT * phase * 6.2 + sunCol * 0.16;
      float dT = exp(-dens * 0.3);
      scattered += transmittance * (1.0 - dT) * lum * dens;
      transmittance *= dT;
    }
    t += 0.19;
  }

  // quiet sky behind the volume + sun bloom (baked, no post pass)
  vec3 sky = mix(night * 0.28, sunCol * 0.4, smoothstep(-0.25, 0.45, rd.y + hgt * 0.5));
  vec3 col = sky * transmittance + scattered;
  float sd = max(dot(rd, sunDir), 0.0);
  col += sunCol * pow(sd, 90.0) * 2.2 * hgt;     // disc
  col += sunCol * pow(sd, 7.0) * 0.05 * hgt;     // halo

  col = tonemap(col * 1.08);
  col *= vignette(uv, 0.26, 1.0);
  col *= uReveal;
  col += (jitter - 0.5) / 255.0;                 // dither at device pixels
  gl_FragColor = vec4(col, 1.0);
}
`;
