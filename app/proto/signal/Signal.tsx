"use client";

import { useRef, useState } from "react";
import ShaderCanvas, { type Uniforms } from "../_engine/ShaderCanvas";
import GradientPoster from "../_engine/GradientPoster";
import KineticName from "../_components/KineticName";
import AudioControl from "../_audio/AudioControl";
import { useCapabilities } from "../_hooks/useCapabilities";
import {
  usePointerField,
  useReturningVisitor,
  useEmpathy,
} from "../_hooks/useReactive";
import type { Geo } from "../_lib/geo";
import { signalFragment } from "./shader";

const ACCENT = "#e8a14c";

// The proof, as a constellation — cryptic, sparse. Hover brightens each star.
const POINTS = ["MUNICH", "AGE 7", "115,000", "GOLDMAN", "PICUS", "SEQUOIA", "DECACORN"];

export default function Signal({ geo }: { geo: Geo }) {
  const caps = useCapabilities();
  const pointer = usePointerField();
  const empathy = useEmpathy();
  const returning = useReturningVisitor("ph-signal");

  const reveal = useRef(0);
  const growth = useRef(0);
  const [ready, setReady] = useState(false);

  const growthBase = Math.min(0.7, 0.25 + 0.15 * (returning.count - 1));

  const [uniforms] = useState<Uniforms>(() => ({
    uPointer: { value: [0.5, 0.5] },
    uPointerInfluence: { value: 0 },
    uGrowth: { value: growthBase },
    uReturning: { value: returning.isReturning ? 1 : 0 },
    uReveal: { value: 0 },
    uSeed: { value: returning.seed },
  }));

  const onFrame = (u: Uniforms, _t: number, dt: number) => {
    const p = pointer.read(dt);
    const dim = empathy.read();
    reveal.current += (1 - reveal.current) * Math.min(1, dt * 1.0);
    growth.current += (1 - growth.current) * Math.min(1, dt * 0.04); // grows over ~25s
    u.uPointer.value = [p.x, p.y];
    u.uPointerInfluence.value = p.influence;
    u.uGrowth.value = Math.min(1, growthBase + growth.current * 0.6);
    u.uReveal.value = reveal.current * dim;
  };

  const showShader = caps != null && caps.tier !== "none";

  return (
    <>
      <GradientPoster
        base="#020306"
        grain={0.09}
        layers={[
          "radial-gradient(60% 50% at 50% 46%, rgba(40,46,60,0.30), transparent 72%)",
          "radial-gradient(7% 7% at 61% 38%, rgba(232,150,70,0.45), transparent 70%)",
          "linear-gradient(#04050a, #020306)",
        ]}
      />
      {showShader && (
        <ShaderCanvas
          fragment={signalFragment}
          uniforms={uniforms}
          onFrame={onFrame}
          dprCap={caps!.dprCap}
          onReady={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 1.4s ease" }}
        />
      )}

      <main style={shell}>
        <p style={kicker}>
          {`// signal${geo.city ? ` · ${geo.city.toLowerCase()}` : ""}`}
        </p>
        <KineticName text="PHIL HIE" reach={180} pull={10} style={nameStyle} />
        <p style={tagline}>Against consensus.</p>

        <p style={memory}>
          the constellation remembers —{" "}
          <span style={{ color: ACCENT }}>
            {returning.count <= 1 ? "first contact" : `visit ${returning.count}`}
          </span>
        </p>

        <div style={pointsRow}>
          {POINTS.map((w) => (
            <span key={w} className="constellation-pt">
              {w}
            </span>
          ))}
        </div>

        <nav style={linksRow}>
          <a href="https://github.com/philhie" style={link} target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/philhie" style={link} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="/proto/signal" style={link}>Thoughts</a>
        </nav>
      </main>

      <AudioControl accent={ACCENT} />
    </>
  );
}

/* ------------------------------- styles ------------------------------- */

const shell: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.5rem",
  padding: "2rem",
  textAlign: "center",
};

const kicker: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.65rem",
  letterSpacing: "0.35em",
  textTransform: "uppercase",
  color: "rgba(190,200,220,0.4)",
};

const nameStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontWeight: 600,
  fontSize: "clamp(2.5rem, 9vw, 6.5rem)",
  lineHeight: 0.95,
  letterSpacing: "0.02em",
  color: "rgba(238,242,252,0.96)",
  margin: 0,
};

const tagline: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontStyle: "italic",
  fontSize: "clamp(0.95rem, 2vw, 1.4rem)",
  color: "rgba(200,210,228,0.62)",
};

const memory: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(190,200,220,0.35)",
  marginTop: "0.5rem",
};

const pointsRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "0.4rem 1.4rem",
  maxWidth: "40rem",
  marginTop: "1rem",
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.66rem",
  letterSpacing: "0.18em",
};

const linksRow: React.CSSProperties = {
  display: "flex",
  gap: "2rem",
  justifyContent: "center",
  marginTop: "1.5rem",
};

const link: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(210,218,232,0.55)",
  textDecoration: "none",
};
