"use client";

/**
 * Minimal "listen" control. Off by default. When on, exposes a tiny treatment
 * switch so Phil can A/B the faithful motif vs the full cinematic arrangement.
 * Styled to recede — mono, small, low-contrast — and theme-able per world.
 */

import { useEffect, useRef, useState } from "react";
import { SignatureAudio, type Treatment } from "./signature";

export default function AudioControl({ accent = "#e8a14c" }: { accent?: string }) {
  const engineRef = useRef<SignatureAudio | null>(null);
  const [on, setOn] = useState(false);
  const [treatment, setTreatment] = useState<Treatment>("motif");

  useEffect(() => {
    return () => engineRef.current?.dispose();
  }, []);

  const toggle = async () => {
    if (!engineRef.current) engineRef.current = new SignatureAudio();
    const engine = engineRef.current;
    if (on) {
      engine.stop();
      setOn(false);
    } else {
      await engine.start(treatment);
      setOn(true);
    }
  };

  const pick = (t: Treatment) => {
    setTreatment(t);
    engineRef.current?.setTreatment(t);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "clamp(1.25rem, 3vh, 2.25rem)",
        right: "clamp(1.25rem, 4vw, 3rem)",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        fontSize: "0.625rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        userSelect: "none",
      }}
    >
      {on && (
        <div style={{ display: "flex", gap: "0.6rem" }}>
          {(["motif", "cinematic"] as Treatment[]).map((t) => (
            <button
              key={t}
              onClick={() => pick(t)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem 0",
                letterSpacing: "0.18em",
                color: treatment === t ? accent : "rgba(255,255,255,0.32)",
                transition: "color 0.3s ease",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={toggle}
        aria-pressed={on}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.4rem 0",
          letterSpacing: "0.2em",
          color: on ? accent : "rgba(255,255,255,0.4)",
          transition: "color 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: on ? accent : "rgba(255,255,255,0.3)",
            boxShadow: on ? `0 0 10px 2px ${accent}` : "none",
            transition: "all 0.3s ease",
          }}
        />
        {on ? "playing" : "listen"}
      </button>
    </div>
  );
}
