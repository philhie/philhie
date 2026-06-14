"use client";

/**
 * KineticName — the name reacts to the cursor: each letter is magnetically
 * displaced toward the pointer, then springs back. Transform-only (GPU
 * composited, zero layout reflow) so it stays smooth on weak hardware.
 * Letter centers are cached and re-measured on resize, never per frame.
 */

import { useEffect, useRef, type CSSProperties } from "react";

interface KineticNameProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** Magnetic reach in px and max pull in px. */
  reach?: number;
  pull?: number;
}

export default function KineticName({
  text,
  className,
  style,
  reach = 240,
  pull = 16,
}: KineticNameProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // no cursor on touch

    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-l]"));
    const centers = letters.map(() => ({ x: 0, y: 0 }));
    const pos = letters.map(() => ({ x: 0, y: 0 }));
    const target = { x: -9999, y: -9999 };
    let raf = 0;

    const measure = () => {
      letters.forEach((l, i) => {
        const r = l.getBoundingClientRect();
        // subtract the live transform so the cached center is the rest position
        centers[i].x = r.left + r.width / 2 - pos[i].x;
        centers[i].y = r.top + r.height / 2 - pos[i].y;
      });
    };
    measure();

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const onLeave = () => {
      target.x = -9999;
      target.y = -9999;
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      for (let i = 0; i < letters.length; i++) {
        const dx = centers[i].x - target.x;
        const dy = centers[i].y - target.y;
        const dist = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, 1 - dist / reach);
        const ease = f * f;
        const tx = (dx / dist) * ease * pull;
        const ty = (dy / dist) * ease * pull;
        pos[i].x += (tx - pos[i].x) * 0.16;
        pos[i].y += (ty - pos[i].y) * 0.16;
        letters[i].style.transform = `translate3d(${pos[i].x.toFixed(2)}px, ${pos[i].y.toFixed(2)}px, 0)`;
      }
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
    };
  }, [reach, pull, text]);

  return (
    <h1 ref={ref} className={className} style={style}>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} style={{ display: "inline-block", width: "0.28em" }} />
        ) : (
          <span
            key={i}
            data-l
            style={{ display: "inline-block", willChange: "transform" }}
          >
            {ch}
          </span>
        ),
      )}
    </h1>
  );
}
