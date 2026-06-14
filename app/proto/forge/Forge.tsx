"use client";

import { useRef, useState } from "react";
import ShaderCanvas, { type Uniforms } from "../_engine/ShaderCanvas";
import GradientPoster from "../_engine/GradientPoster";
import KineticName from "../_components/KineticName";
import AudioControl from "../_audio/AudioControl";
import { useCapabilities } from "../_hooks/useCapabilities";
import { usePointerField, useEmpathy } from "../_hooks/useReactive";
import type { Geo } from "../_lib/geo";
import { forgeFragment } from "./shader";

const ACCENT = "#ff7a1e";

export default function Forge({ geo }: { geo: Geo }) {
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
        base="#08090c"
        grain={0.05}
        layers={[
          "radial-gradient(120% 90% at 50% 116%, rgba(255,120,30,0.60), rgba(180,30,10,0.22) 40%, transparent 66%)",
          "radial-gradient(80% 50% at 50% 122%, rgba(255,200,120,0.50), transparent 50%)",
          "linear-gradient(to top, #2a0a04 0%, #140604 35%, #0a0608 70%, #08090c 100%)",
        ]}
      />
      {showShader && (
        <ShaderCanvas
          fragment={forgeFragment}
          uniforms={uniforms}
          onFrame={onFrame}
          dprCap={caps!.dprCap}
          onReady={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 1.2s ease" }}
        />
      )}

      <main style={shell}>
        <p style={kicker}>
          <span style={{ color: ACCENT }}>▲</span>&nbsp; the forge
          {geo.city ? ` · ${geo.city.toLowerCase()}` : ""}
        </p>
        <KineticName text="PHIL HIE" reach={260} pull={18} style={nameStyle} />
        <p style={tagline}>Forged from nothing.</p>

        <p style={story}>
          Sweets at seven. A bot at fifteen. 115,000 readers from a lecture hall.
          Goldman. A Sequoia-backed OS for hospitals. Next — a decacorn, hammered
          out by hand.
        </p>

        <nav style={linksRow}>
          <a href="https://github.com/philhie" style={link} target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/philhie" style={link} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="/proto/forge" style={link}>Thoughts</a>
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
  fontSize: "0.68rem",
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: "rgba(255,210,180,0.55)",
};

const nameStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontWeight: 800,
  fontSize: "clamp(3rem, 14vw, 11rem)",
  lineHeight: 0.88,
  letterSpacing: "-0.04em",
  color: "#fff",
  margin: 0,
  textShadow: "0 0 60px rgba(255,120,40,0.35)",
};

const tagline: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontStyle: "italic",
  fontWeight: 600,
  fontSize: "clamp(1.1rem, 2.6vw, 1.8rem)",
  color: "rgba(255,225,200,0.85)",
};

const story: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontSize: "clamp(1rem, 1.9vw, 1.35rem)",
  lineHeight: 1.5,
  color: "rgba(255,228,210,0.66)",
  maxWidth: "40rem",
  marginTop: "0.5rem",
};

const linksRow: React.CSSProperties = {
  display: "flex",
  gap: "2rem",
  justifyContent: "center",
  marginTop: "1.5rem",
};

const link: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.72rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,220,200,0.6)",
  textDecoration: "none",
};
