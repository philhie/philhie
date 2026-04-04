"use client";

import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
const getServerSnapshot = () => false;

const TRAIL_COUNT = 16;

export default function CustomCursor() {
  const hasFineMouse = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const trailPos = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 })));
  const mouse = useRef({ x: -100, y: -100 });
  const hasMoved = useRef(false);
  const isOverLink = useRef(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const rafRef = useRef(0);

  const setTrailRef = useCallback((el: HTMLDivElement | null, i: number) => {
    if (el) trailRefs.current[i] = el;
  }, []);

  useEffect(() => {
    if (!hasFineMouse) return;

    const style = document.createElement("style");
    document.head.appendChild(style);
    styleRef.current = style;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
      }
      if (!hasMoved.current) {
        hasMoved.current = true;
        if (styleRef.current) {
          styleRef.current.textContent = "* { cursor: none !important; }";
        }
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        isOverLink.current = true;
        if (styleRef.current) {
          styleRef.current.textContent = "* { cursor: pointer !important; }";
        }
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        isOverLink.current = false;
        if (styleRef.current && hasMoved.current) {
          styleRef.current.textContent = "* { cursor: none !important; }";
        }
      }
    };

    const tick = () => {
      const pos = trailPos.current;
      const trails = trailRefs.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let i = 0; i < TRAIL_COUNT; i++) {
        const target = i === 0 ? { x: mx, y: my } : pos[i - 1];
        const lerp = Math.max(0.35 - i * 0.015, 0.05);
        pos[i].x += (target.x - pos[i].x) * lerp;
        pos[i].y += (target.y - pos[i].y) * lerp;

        const el = trails[i];
        if (el) {
          const size = 8 * (1 - i / TRAIL_COUNT);
          const half = size / 2;
          el.style.transform = `translate(${pos[i].x - half}px, ${pos[i].y - half}px)`;
          el.style.opacity = String(0.5 * (1 - i / TRAIL_COUNT));
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(rafRef.current);
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [hasFineMouse]);

  if (!hasFineMouse) return null;

  return (
    <>
      {/* Lead dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 0 16px 6px rgba(255,255,255,0.35), 0 0 40px 12px rgba(255,255,255,0.12)",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-100px, -100px)",
        }}
      />
      {/* Trail */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => setTrailRef(el, i)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 8 * (1 - i / TRAIL_COUNT),
            height: 8 * (1 - i / TRAIL_COUNT),
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            pointerEvents: "none",
            zIndex: 9998,
            opacity: 0,
            transform: "translate(-100px, -100px)",
          }}
        />
      ))}
    </>
  );
}
