import { GLSL } from "../_engine/glsl";

/**
 * Direction A — "A name made of weather", 100x pass.
 *
 * A volumetric dawn→night atmosphere with real depth: raymarched 3D FBM clouds
 * (Beer's law + nested light-march god-rays + Henyey-Greenstein scatter), and at
 * night a CRISP star field (two layers + a faint milky-way band), a sharp moon,
 * and the occasional shooting star — the night sky Phil loved. Crisp celestial
 * detail against soft cloud = perceived sharpness. Blue-noise jitter + dither.
 */
export const weatherFragment = /* glsl */ `
${GLSL.common}

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2  uPointer;
uniform float uPointerInfluence;
uniform float uWarmth;
uniform float uDaylight;
uniform float uHaze;
uniform vec2  uDrift;
uniform float uSun;
uniform float uReveal;
uniform float uSteps;
uniform sampler2D uNameMask;   // screen-space mask of "PHIL HIE"
uniform float uBeat;           // 0..1 musical pulse

float hash13(vec3 p){
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise3(vec3 p){
  vec3 i = floor(p); vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i + vec3(0,0,0)); float n100 = hash13(i + vec3(1,0,0));
  float n010 = hash13(i + vec3(0,1,0)); float n110 = hash13(i + vec3(1,1,0));
  float n001 = hash13(i + vec3(0,0,1)); float n101 = hash13(i + vec3(1,0,1));
  float n011 = hash13(i + vec3(0,1,1)); float n111 = hash13(i + vec3(1,1,1));
  return mix(mix(mix(n000,n100,f.x), mix(n010,n110,f.x), f.y),
             mix(mix(n001,n101,f.x), mix(n011,n111,f.x), f.y), f.z);
}
float fbm3(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*vnoise3(p); p*=2.03; a*=0.5; } return v; }
float hg(float c, float g){ float g2=g*g; return (1.0-g2)/(4.0*PI*pow(max(1.0+g2-2.0*g*c,1e-3),1.5)); }
float density(vec3 p){
  p.xz += uDrift*uTime*0.12; p.y += uTime*0.015;
  return clamp(fbm3(p*0.62) - (0.46 - 0.22*uHaze), 0.0, 1.0);
}
float densityLight(vec3 p){
  p.xz += uDrift*uTime*0.12; p.y += uTime*0.015;
  return clamp(vnoise3(p*0.62) - (0.46 - 0.22*uHaze), 0.0, 1.0);
}

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec3 ro = vec3(0.0, 0.0, 4.0);
  vec3 rd = normalize(vec3(p, -1.6));
  vec2 pc = (uPointer - 0.5) * vec2(aspect, 1.0);
  rd.xy += (pc - p) * 0.05 * uPointerInfluence; rd = normalize(rd);

  float sunAng = mix(-0.35, PI + 0.35, uSun);
  vec3 sunDir = normalize(vec3(cos(sunAng)*0.6, sin(sunAng), 0.35));
  float hgt = clamp(sin(sunAng), 0.0, 1.0);
  float night = smoothstep(0.18, -0.08, sin(sunAng));   // 1 deep night → 0 day

  // richer, higher-contrast palette
  vec3 dawn  = vec3(1.0, 0.38, 0.11);
  vec3 day   = vec3(1.0, 0.94, 0.82);
  vec3 nightC= vec3(0.05, 0.08, 0.20);
  vec3 sunCol = mix(mix(nightC, dawn, smoothstep(0.0, 0.20, hgt)), day, smoothstep(0.20, 0.85, hgt));
  sunCol = mix(sunCol, mix(dawn, day, uWarmth), 0.20 * uDaylight);

  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float jitter = fract(ign + uTime * 0.61);

  // ---- volumetric clouds ----
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
      float phase = hg(dot(rd, sunDir), 0.6);
      vec3 lum = sunCol * lightT * phase * 6.5 + sunCol * 0.14;
      float dT = exp(-dens * 0.3);
      scattered += transmittance * (1.0 - dT) * lum * dens;
      transmittance *= dT;
    }
    t += 0.19;
  }

  // ---- sky behind the clouds ----
  vec3 sky = mix(nightC * 0.55, sunCol * 0.5, smoothstep(-0.1, 0.6, rd.y + hgt * 0.4));
  sky = mix(sky, nightC * 0.8, night * 0.6);

  // crisp stars (two layers) + faint milky-way band — night only
  vec2 sg = p * 130.0; vec2 gi = floor(sg); vec2 gf = fract(sg) - 0.5;
  float sh = hash21(gi);
  float twk = 0.55 + 0.45 * sin(uTime * 3.0 + sh * 120.0);
  float star = smoothstep(0.985, 1.0, sh) * smoothstep(0.085, 0.0, length(gf)) * twk;
  vec2 sg2 = p * 230.0; vec2 gi2 = floor(sg2); vec2 gf2 = fract(sg2) - 0.5;
  float sh2 = hash21(gi2 + 50.0);
  float star2 = smoothstep(0.992, 1.0, sh2) * smoothstep(0.06, 0.0, length(gf2));
  float stars = (star + star2 * 0.6) * night;
  float mw = fbm(p * vec2(2.5, 5.0) + vec2(3.0, 0.0));
  float band = smoothstep(0.55, 0.85, mw) * smoothstep(0.55, 0.0, abs(p.y - 0.12)) * night * 0.14;
  sky += vec3(0.85, 0.92, 1.0) * stars + vec3(0.42, 0.48, 0.68) * band;

  // crisp moon (night)
  vec3 moonDir = normalize(vec3(0.35, 0.55, 0.4));
  float mdn = max(dot(rd, moonDir), 0.0);
  sky += vec3(0.90, 0.93, 1.0) * pow(mdn, 520.0) * 3.2 * night;
  sky += vec3(0.50, 0.60, 0.85) * pow(mdn, 26.0) * 0.06 * night;

  vec3 col = sky * transmittance + scattered;

  // sun disc + halo (day/dawn)
  float sd = max(dot(rd, sunDir), 0.0);
  col += sunCol * pow(sd, 180.0) * 3.2 * hgt;
  col += sunCol * pow(sd, 6.0) * 0.05 * hgt;

  // occasional shooting star (night, brief, only some cycles)
  float cyc = floor(uTime * 0.09);
  float ph = fract(uTime * 0.09);
  float seed = hash21(vec2(cyc, 7.0));
  vec2 head = vec2(-0.7 + seed * 0.5, 0.45 - seed * 0.2) + normalize(vec2(1.0, -0.35)) * ph * 2.0;
  vec2 rel = p - head;
  float along = clamp(dot(rel, -normalize(vec2(1.0, -0.35))), 0.0, 0.32);
  float perp = length(rel + normalize(vec2(1.0, -0.35)) * along);
  float streak = smoothstep(0.012, 0.0, perp) * (1.0 - smoothstep(0.0, 0.32, along)) * smoothstep(0.0, 0.04, along);
  col += vec3(1.0, 0.96, 0.9) * streak * step(ph, 0.16) * step(0.55, seed) * night * 2.0;

  // ---- the name, carved OUT of the weather (letters made of light) ----
  vec2 nuv = vec2(uv.x, 1.0 - uv.y);            // screen → canvas-mask space
  float nameA = texture2D(uNameMask, nuv).r;
  vec3 fill = sunCol * (0.5 + 0.8 * hgt);        // warm by day/dawn
  fill = mix(fill, vec3(0.80, 0.86, 1.0), night * 0.7); // cool/white at night
  fill += scattered * 1.3;                       // pick up the cloud scatter
  fill += vec3(0.9, 0.95, 1.0) * stars * 2.2;    // stars shimmer within (night)
  float godray = 0.55 + 0.7 * pow(max(dot(rd, sunDir), 0.0), 3.0) * hgt;
  fill *= godray * (1.0 + uBeat * 0.22);         // god-rays rake through + beat
  float halo = texture2D(uNameMask, nuv + vec2(0.0045, 0.0)).r
             + texture2D(uNameMask, nuv - vec2(0.0045, 0.0)).r
             + texture2D(uNameMask, nuv + vec2(0.0, 0.008)).r
             + texture2D(uNameMask, nuv - vec2(0.0, 0.008)).r;
  halo = clamp(halo * 0.25 - nameA, 0.0, 1.0);   // soft ring just outside glyphs
  col = mix(col, fill, nameA);
  col += fill * halo * 0.22;

  col = tonemap(col * 1.1);
  col *= vignette(uv, 0.26, 1.0);
  col *= uReveal;
  col += (jitter - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;
