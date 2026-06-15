"use client";

import { useRef, useState } from "react";
import ShaderCanvas, { type Uniforms } from "../_engine/ShaderCanvas";
import GradientPoster from "../_engine/GradientPoster";
import KineticName from "../_components/KineticName";
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
import { typeFragment } from "./shader";

const ACCENT = "#e8a14c";

export default function TypeWorld({ geo }: { geo: Geo }) {
  const caps = useCapabilities();
  const pointer = usePointerField();
  const empathy = useEmpathy();
  useReturningVisitor("ph-type");
  const sky = useSky(geo);

  const reveal = useRef(0);
  const [ready, setReady] = useState(false);

  const [uniforms] = useState<Uniforms>(() => ({
    uPointer: { value: [0.5, 0.5] },
    uPointerInfluence: { value: 0 },
    uWarmth: { value: 0.5 },
    uReveal: { value: 0 },
  }));

  const onFrame = (u: Uniforms, _t: number, dt: number) => {
    const p = pointer.read(dt);
    const dim = empathy.read();
    reveal.current += (1 - reveal.current) * Math.min(1, dt * 0.9);
    u.uPointer.value = [p.x, p.y];
    u.uPointerInfluence.value = p.influence;
    u.uWarmth.value = sky.current.warmth;
    u.uReveal.value = reveal.current * dim;
  };

  const showShader = caps != null && caps.tier !== "none";

  return (
    <>
      <GradientPoster
        base="#04050a"
        grain={0.06}
        layers={[
          "radial-gradient(50% 45% at 42% 40%, rgba(120,120,150,0.14), transparent 62%)",
          "linear-gradient(#06070d, #04050a)",
        ]}
      />
      {showShader && (
        <ShaderCanvas
          fragment={typeFragment}
          uniforms={uniforms}
          onFrame={onFrame}
          dprCap={Math.min(caps!.dprCap, 1.0)}
          targetFps={45}
          onReady={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 1.4s ease" }}
        />
      )}

      <main style={block}>
        <KineticName
          text="PHIL HIE"
          className="weather-name"
          style={{ fontSize: "clamp(3.5rem, 18vw, 14rem)" }}
          reach={300}
          pull={20}
        />
        <div style={{ marginTop: "clamp(1.75rem, 3.5vh, 3rem)" }}>
          <Provenance accent={ACCENT} />
        </div>
        <nav style={links}>
          <a href="https://github.com/philhie" style={link} target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/philhie" style={link} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="/proto/type" style={link}>Thoughts</a>
        </nav>
      </main>

      {geo.city && <p style={skyTag}>your sky · {geo.city.toLowerCase()}</p>}
      <TrackEmbed accent={ACCENT} />
    </>
  );
}

const block: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "clamp(1.5rem, 6vw, 6rem)",
  maxWidth: "min(52rem, 96vw)",
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
  color: "rgba(232,161,76,0.5)",
};
