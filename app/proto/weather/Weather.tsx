"use client";

import { useRef, useState } from "react";
import ShaderCanvas, { type Uniforms } from "../_engine/ShaderCanvas";
import GradientPoster from "../_engine/GradientPoster";
import Provenance from "../_components/Provenance";
import TrackEmbed from "../_audio/TrackEmbed";
import { useCapabilities } from "../_hooks/useCapabilities";
import {
  usePointerField,
  useReturningVisitor,
  useEmpathy,
} from "../_hooks/useReactive";
import { useSky } from "../_lib/sky";
import type { Geo } from "../_lib/geo";
import { weatherFragment } from "./shader";

const ACCENT = "#e8a14c";
const TWO_PI = Math.PI * 2;

export default function Weather({ geo }: { geo: Geo }) {
  const caps = useCapabilities();
  const pointer = usePointerField();
  const empathy = useEmpathy();
  useReturningVisitor("ph-weather");
  const sky = useSky(geo);

  const reveal = useRef(0);
  const phase0 = useRef<number | null>(null);
  const lastWarm = useRef(-1);
  const blockRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const [uniforms] = useState<Uniforms>(() => ({
    uPointer: { value: [0.5, 0.5] },
    uPointerInfluence: { value: 0 },
    uWarmth: { value: 0.6 },
    uDaylight: { value: 0.6 },
    uHaze: { value: 0.3 },
    uDrift: { value: [0.3, 0.1] },
    uSun: { value: 0.4 },
    uReveal: { value: 0 },
    uSteps: { value: 28 },
  }));

  const onFrame = (u: Uniforms, t: number, dt: number) => {
    const p = pointer.read(dt);
    const s = sky.current;
    const dim = empathy.read();
    reveal.current += (1 - reveal.current) * Math.min(1, dt * 0.9);

    // seed the cycle near the visitor's real local time, then drift slowly
    if (phase0.current == null) {
      phase0.current = Math.asin(Math.max(-1, Math.min(1, 2 * s.daylight - 1)));
    }
    const sun = 0.5 + 0.5 * Math.sin((t * TWO_PI) / 90 + phase0.current);
    const sunAng = -0.35 + (Math.PI + 0.7) * sun;
    const warm = Math.max(0, Math.sin(sunAng));

    u.uPointer.value = [p.x, p.y];
    u.uPointerInfluence.value = p.influence * (caps?.tier === "high" ? 1 : 0.6);
    u.uWarmth.value = s.warmth;
    u.uDaylight.value = s.daylight;
    u.uHaze.value = s.haze;
    u.uDrift.value = s.drift;
    u.uSun.value = sun;
    u.uSteps.value = caps?.tier === "high" ? 30 : 20;
    u.uReveal.value = reveal.current * dim;

    // shift the name's glow warm(day)→cool(night) — one cheap CSS var, throttled
    if (blockRef.current && Math.abs(warm - lastWarm.current) > 0.01) {
      blockRef.current.style.setProperty("--warm", warm.toFixed(3));
      lastWarm.current = warm;
    }
  };

  const showShader = caps != null && caps.tier !== "none";

  return (
    <>
      <GradientPoster
        base="#04060c"
        grain={0.05}
        layers={[
          "radial-gradient(90% 70% at 28% 88%, rgba(232,128,44,0.34), rgba(232,128,44,0) 56%)",
          "radial-gradient(120% 90% at 50% 8%, rgba(70,96,150,0.20), transparent 55%)",
          "linear-gradient(to top, #0a0a12 0%, #070912 45%, #05070f 78%, #04060c 100%)",
        ]}
      />
      {showShader && (
        <ShaderCanvas
          fragment={weatherFragment}
          uniforms={uniforms}
          onFrame={onFrame}
          dprCap={Math.min(caps!.dprCap, caps!.tier === "high" ? 0.85 : 0.6)}
          targetFps={40}
          onReady={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 1.6s ease" }}
        />
      )}

      <main ref={blockRef} style={block}>
        <h1 className="weather-name">PHIL&nbsp;HIE</h1>
        <div style={{ marginTop: "clamp(1.5rem, 3vh, 2.5rem)" }}>
          <Provenance accent={ACCENT} />
        </div>
        <nav style={links}>
          <a href="https://github.com/philhie" style={link} target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/philhie" style={link} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="/proto/weather" style={link}>Thoughts</a>
        </nav>
      </main>

      {geo.city && (
        <p style={skyTag}>
          your sky · {geo.city.toLowerCase()}
        </p>
      )}

      <TrackEmbed accent={ACCENT} />
    </>
  );
}

/* ------------------------------- styles ------------------------------- */

const block: React.CSSProperties = {
  position: "fixed",
  left: "clamp(1.5rem, 5vw, 5rem)",
  bottom: "clamp(1.75rem, 6vh, 4.5rem)",
  zIndex: 2,
  maxWidth: "min(38rem, 90vw)",
};

const links: React.CSSProperties = {
  display: "flex",
  gap: "1.75rem",
  marginTop: "clamp(1.5rem, 3vh, 2.25rem)",
};

const link: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.55)",
  textDecoration: "none",
};

const skyTag: React.CSSProperties = {
  position: "fixed",
  top: "clamp(1.5rem, 4vh, 2.5rem)",
  right: "clamp(1.5rem, 4vw, 3rem)",
  zIndex: 2,
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(232,161,76,0.55)",
};
