/**
 * GradientPoster — a pure CSS mesh-gradient + SVG-turbulence grain.
 *
 * Two jobs at once:
 *  1. The instant LCP element — server-rendered, paints with the HTML, no JS.
 *  2. The fallback for no-WebGL / reduced-motion / save-data / weak devices.
 *
 * The shader canvas mounts at the same box and crossfades in over this, so
 * there is never a layout shift (CLS 0) and never a blank frame.
 */

import type { CSSProperties } from "react";

export interface GradientPosterProps {
  /** CSS gradient strings, stacked as background-images (first = on top). */
  layers: string[];
  /** Solid base color behind the gradients. */
  base: string;
  /** Grain opacity, 0..1. */
  grain?: number;
  className?: string;
  style?: CSSProperties;
}

// Inline fractal-noise grain. One SVG, zero JS, costs nothing per frame.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function GradientPoster({
  layers,
  base,
  grain = 0.05,
  className,
  style,
}: GradientPosterProps) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundColor: base,
        backgroundImage: layers.join(", "),
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat",
          opacity: grain,
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
