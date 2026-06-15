/**
 * Capability gate — runs BEFORE any WebGL init so weak devices never pay the
 * cost. Returns a render tier; the prototype decides what to mount from it.
 *
 *   "none" → no WebGL: show the static CSS gradient poster (also the LCP element)
 *   "mid"  → half-res shader, DPR clamped to 1.0, light/no pointer interaction
 *   "high" → full-res buffer, DPR up to 1.25, pointer warp on
 */

export type RenderTier = "none" | "mid" | "high";

export interface Capabilities {
  tier: RenderTier;
  dprCap: number;
  reducedMotion: boolean;
  saveData: boolean;
  webgl2: boolean;
  cores: number;
  memory: number;
  coarsePointer: boolean;
}

function hasWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

export function detectCapabilities(): Capabilities {
  if (typeof window === "undefined") {
    return {
      tier: "none",
      dprCap: 1,
      reducedMotion: false,
      saveData: false,
      webgl2: false,
      cores: 4,
      memory: 4,
      coarsePointer: false,
    };
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  // Network Information API (Chromium). Treat data-saver as a hard "be cheap".
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const saveData = conn?.saveData === true;
  const slowNet =
    conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g";

  const cores = navigator.hardwareConcurrency || 4;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const webgl2 = hasWebGL2();

  let tier: RenderTier;
  if (reducedMotion || saveData || slowNet || !webgl2 || memory <= 2) {
    tier = "none";
  } else if (memory <= 4 || cores <= 4 || coarsePointer) {
    tier = "mid";
  } else {
    tier = "high";
  }

  // Render-buffer DPR ceilings. A half-res buffer + DPR 1.0 is the single
  // biggest fillrate win on integrated GPUs / phones.
  const rawDpr = window.devicePixelRatio || 1;
  const dprCap =
    tier === "high" ? Math.min(rawDpr, 1.25) : Math.min(rawDpr, 1.0);

  return {
    tier,
    dprCap,
    reducedMotion,
    saveData,
    webgl2,
    cores,
    memory,
    coarsePointer,
  };
}
