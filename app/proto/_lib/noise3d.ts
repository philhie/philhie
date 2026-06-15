/**
 * Bake a tileable 3D fbm noise volume into a 2D atlas canvas, so the cloud
 * shader can sample it with one texture lookup per step instead of computing
 * multi-octave value noise per step (the ~5-10x perf win — Horizon Zero Dawn /
 * Nubis approach, adapted to a 2D atlas so it works in WebGL2 GLSL ES 1.00 via
 * the existing canvas-texture pipeline).
 *
 * Layout: SIZE³ volume, SIZE z-slices packed in a TILES×TILES grid (SIZE=64,
 * TILES=8 → a 512×512 grayscale atlas). The shader unpacks it as 3D + does
 * trilinear (hardware bilinear in xy, manual lerp across two z-slices).
 */
export const NOISE_SIZE = 64;
export const NOISE_TILES = 8; // 8×8 = 64 slices

export function buildNoiseAtlas(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const S = NOISE_SIZE;
  const T = NOISE_TILES;
  const A = S * T; // 512

  // Periodic value-noise lattices per octave (periods divide into [0,1) → tileable).
  const periods = [4, 8, 16];
  const amps = [0.5, 0.25, 0.125];
  let seed = 1337;
  const rnd = () => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const lattices = periods.map((P) => {
    const arr = new Float32Array(P * P * P);
    for (let i = 0; i < arr.length; i++) arr[i] = rnd();
    return arr;
  });

  const sm = (t: number) => t * t * (3 - 2 * t);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const sampleLat = (lat: Float32Array, P: number, x: number, y: number, z: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const ux = sm(x - ix), uy = sm(y - iy), uz = sm(z - iz);
    const at = (a: number, b: number, c: number) =>
      lat[(((a % P) + P) % P) * P * P + (((b % P) + P) % P) * P + (((c % P) + P) % P)];
    const c000 = at(ix, iy, iz), c100 = at(ix + 1, iy, iz), c010 = at(ix, iy + 1, iz), c110 = at(ix + 1, iy + 1, iz);
    const c001 = at(ix, iy, iz + 1), c101 = at(ix + 1, iy, iz + 1), c011 = at(ix, iy + 1, iz + 1), c111 = at(ix + 1, iy + 1, iz + 1);
    return lerp(
      lerp(lerp(c000, c100, ux), lerp(c010, c110, ux), uy),
      lerp(lerp(c001, c101, ux), lerp(c011, c111, ux), uy),
      uz,
    );
  };

  const cv = document.createElement("canvas");
  cv.width = A;
  cv.height = A;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(A, A);
  const data = img.data;

  for (let z = 0; z < S; z++) {
    const ox = (z % T) * S;
    const oy = Math.floor(z / T) * S;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const px = x / S, py = y / S, pz = z / S;
        let v = 0;
        for (let o = 0; o < periods.length; o++) {
          const P = periods[o];
          v += amps[o] * sampleLat(lattices[o], P, px * P, py * P, pz * P);
        }
        v /= 0.875; // normalize to ~0..1
        const val = Math.max(0, Math.min(255, (v * 255) | 0));
        const ai = ((oy + y) * A + (ox + x)) * 4;
        data[ai] = val;
        data[ai + 1] = val;
        data[ai + 2] = val;
        data[ai + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}
