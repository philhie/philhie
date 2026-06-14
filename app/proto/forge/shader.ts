import { GLSL } from "../_engine/glsl";

/**
 * The Forge — molten heat rising from the bottom (the work), cooling to steel
 * at the top (the machine). The cursor stokes the fire. Molten veins, rising
 * sparks, white-hot cores. Warm-humanist, visceral. Baked glow, one warped fbm.
 */
export const forgeFragment = /* glsl */ `
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

  // cursor stokes the heat
  vec2 pc = uv - uPointer; pc.x *= aspect;
  float stoke = uPointerInfluence * exp(-dot(pc, pc) * 5.0);

  // rising, turbulent heat (domain-warped fbm), hotter toward the floor
  vec2 np = vec2(uv.x * 3.0, uv.y * 2.0 - uTime * 0.25);
  float warp = fbm(np * 0.7 + uTime * 0.05);
  float heat = fbm(np + warp * 1.5);
  float floorHeat = smoothstep(0.0, 0.7, 1.0 - uv.y);
  float h = heat * (0.5 + floorHeat) + floorHeat * 0.4 + stoke * 0.8;

  // molten palette: black → deep red → orange → amber → white-hot
  vec3 col = vec3(0.0);
  col = mix(col, vec3(0.5, 0.04, 0.02), smoothstep(0.15, 0.5, h));
  col = mix(col, vec3(0.95, 0.35, 0.05), smoothstep(0.40, 0.75, h));
  col = mix(col, vec3(1.0, 0.75, 0.30), smoothstep(0.70, 0.95, h));
  col = mix(col, vec3(1.0, 0.95, 0.85), smoothstep(0.92, 1.05, h));

  // molten veins (fbm ridges) near the floor
  float vein = abs(fbm(np * 1.5 + 5.0) - 0.5);
  col += smoothstep(0.06, 0.0, vein) * floorHeat * vec3(1.0, 0.55, 0.18);

  // rising sparks
  float sparks = 0.0;
  for (int i = 0; i < 2; i++){
    float fi = float(i);
    vec2 sp = vec2(uv.x * 30.0 + fi * 13.0, uv.y * 30.0 + uTime * (3.0 + fi));
    vec2 gi = floor(sp); vec2 gf = fract(sp) - 0.5;
    sparks += step(0.972, hash21(gi + fi * 31.0)) * smoothstep(0.4, 0.0, length(gf));
  }
  col += sparks * vec3(1.0, 0.7, 0.3) * floorHeat;

  // cooling to tempered steel at the top (soul → machine)
  col = mix(col, vec3(0.10, 0.12, 0.16), smoothstep(0.72, 1.0, uv.y) * 0.6);

  col = tonemap(col * 1.15);
  col *= vignette(uv, 0.3, 1.0);
  col *= uReveal;
  col += grain(gl_FragCoord.xy, uTime) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`;
