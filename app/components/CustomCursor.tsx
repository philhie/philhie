"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
const getServerSnapshot = () => false;

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const hasFineMouse = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOverLink, setIsOverLink] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    if (!hasFineMouse) return;

    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      if (!hasMoved) setHasMoved(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        setIsOverLink(true);
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        setIsOverLink(false);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, [hasFineMouse, hasMoved]);

  if (!hasFineMouse) return null;

  return (
    <>
      {hasMoved && (
        <style jsx global>{`
          * { cursor: ${isOverLink ? "pointer" : "none"} !important; }
        `}</style>
      )}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isOverLink ? "32px" : "20px",
          height: isOverLink ? "32px" : "20px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,255,255,${isOverLink ? 0.15 : 0.08}) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-100px, -100px)",
          transition: "width 0.2s, height 0.2s, background 0.2s",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
