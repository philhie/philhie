"use client";

import { useRef, useState } from "react";
import ShaderCanvas, { type Uniforms } from "../_engine/ShaderCanvas";
import GradientPoster from "../_engine/GradientPoster";
import AudioControl from "../_audio/AudioControl";
import { useCapabilities } from "../_hooks/useCapabilities";
import { usePointerField, useEmpathy } from "../_hooks/useReactive";
import type { Geo } from "../_lib/geo";
import { systemFragment } from "./shader";

const ACCENT = "#7fb2e8";

// Proof as a system readout — precise, cold, elegant (not a hacker terminal).
const READOUT: [string, string][] = [
  ["ORIGIN", "Munich · single mother · oldest of three"],
  ["BOOTSTRAP", "sweets at 7 · a self-built sneaker bot"],
  ["REACH", "115,000 subscribers · top-5 AI newsletter"],
  ["DEPLOY", "Goldman Sachs · Picus Capital"],
  ["RUNTIME", "Avelios · €30M · Sequoia"],
  ["TARGET", "decacorn"],
];

export default function System({ geo }: { geo: Geo }) {
  const caps = useCapabilities();
  const pointer = usePointerField();
  const empathy = useEmpathy();

  const reveal = useRef(0);
  const [ready, setReady] = useState(false);

  const [uniforms] = useState<Uniforms>(() => ({
    uPointer: { value: [0.5, 0.5] },
    uPointerInfluence: { value: 0 },
    uReveal: { value: 0 },
  }));

  const onFrame = (u: Uniforms, _t: number, dt: number) => {
    const p = pointer.read(dt);
    const dim = empathy.read();
    reveal.current += (1 - reveal.current) * Math.min(1, dt * 1.0);
    u.uPointer.value = [p.x, p.y];
    u.uPointerInfluence.value = p.influence;
    u.uReveal.value = reveal.current * dim;
  };

  const showShader = caps != null && caps.tier !== "none";

  return (
    <>
      <GradientPoster
        base="#010307"
        grain={0.045}
        layers={[
          "radial-gradient(60% 50% at 50% 45%, rgba(40,70,100,0.22), transparent 72%)",
          "linear-gradient(#02040a, #010307)",
        ]}
      />
      {showShader && (
        <ShaderCanvas
          fragment={systemFragment}
          uniforms={uniforms}
          onFrame={onFrame}
          dprCap={caps!.dprCap}
          onReady={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 1.2s ease" }}
        />
      )}

      <main style={shell}>
        <div style={panel}>
          <p style={kicker}>
            <span style={{ color: ACCENT }}>●</span> system online
            {geo.city ? ` · node: ${geo.city.toLowerCase()}` : ""}
          </p>
          <h1 style={nameStyle}>PHIL&nbsp;HIE</h1>
          <p style={tagline}>Ask why. Then build.</p>

          <div style={readout}>
            {READOUT.map(([k, v]) => (
              <div key={k} style={row}>
                <span style={rowKey}>{k}</span>
                <span style={leader} />
                <span style={rowVal}>{v}</span>
              </div>
            ))}
          </div>

          <nav style={linksRow}>
            <a href="https://github.com/philhie" style={link} target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/philhie" style={link} target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="/proto/system" style={link}>Thoughts</a>
          </nav>
        </div>
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
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
};

const panel: React.CSSProperties = {
  width: "min(46rem, 100%)",
};

const kicker: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.66rem",
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: "rgba(150,180,210,0.5)",
};

const nameStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontWeight: 700,
  fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
  lineHeight: 0.95,
  letterSpacing: "-0.02em",
  color: "#eef4fc",
  margin: "1rem 0 0",
};

const tagline: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontStyle: "italic",
  fontSize: "clamp(0.95rem, 2vw, 1.35rem)",
  color: "rgba(180,205,230,0.6)",
  marginTop: "0.75rem",
};

const readout: React.CSSProperties = {
  marginTop: "2.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
};

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
};

const rowKey: React.CSSProperties = {
  color: ACCENT,
  textTransform: "uppercase",
  flexShrink: 0,
};

const leader: React.CSSProperties = {
  flex: 1,
  margin: "0 0.6rem",
  borderBottom: "1px dotted rgba(127,178,232,0.25)",
  transform: "translateY(-0.2rem)",
};

const rowVal: React.CSSProperties = {
  color: "rgba(214,226,240,0.75)",
  flexShrink: 0,
  textAlign: "right",
};

const linksRow: React.CSSProperties = {
  display: "flex",
  gap: "2rem",
  marginTop: "2.5rem",
};

const link: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(190,210,232,0.55)",
  textDecoration: "none",
};
