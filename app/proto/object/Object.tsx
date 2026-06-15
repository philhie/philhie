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
import { objectFragment } from "./shader";

const ACCENT = "#cfd6e6";

export default function ObjectWorld({ geo }: { geo: Geo }) {
  const caps = useCapabilities();
  const pointer = usePointerField();
  const empathy = useEmpathy();
  useReturningVisitor("ph-object");
  const sky = useSky(geo);

  const reveal = useRef(0);
  const [ready, setReady] = useState(false);

  const [uniforms] = useState<Uniforms>(() => ({
    uPointer: { value: [0.5, 0.5] },
    uPointerInfluence: { value: 0 },
    uWarmth: { value: 0.5 },
    uReveal: { value: 0 },
    uSteps: { value: 72 },
  }));

  const onFrame = (u: Uniforms, _t: number, dt: number) => {
    const p = pointer.read(dt);
    const dim = empathy.read();
    reveal.current += (1 - reveal.current) * Math.min(1, dt * 0.9);
    u.uPointer.value = [p.x, p.y];
    u.uPointerInfluence.value = p.influence;
    u.uWarmth.value = sky.current.warmth;
    u.uSteps.value = caps?.tier === "high" ? 84 : 56;
    u.uReveal.value = reveal.current * dim;
  };

  const showShader = caps != null && caps.tier !== "none";

  return (
    <>
      <GradientPoster
        base="#05070c"
        grain={0.05}
        layers={[
          "radial-gradient(60% 60% at 50% 44%, rgba(120,140,180,0.18), transparent 60%)",
          "radial-gradient(40% 40% at 50% 42%, rgba(20,22,30,0.9), transparent 70%)",
          "linear-gradient(#070910, #05070c)",
        ]}
      />
      {showShader && (
        <ShaderCanvas
          fragment={objectFragment}
          uniforms={uniforms}
          onFrame={onFrame}
          dprCap={Math.min(caps!.dprCap, caps!.tier === "high" ? 0.85 : 0.6)}
          targetFps={40}
          onReady={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 1.4s ease" }}
        />
      )}

      <main style={block}>
        <h1 className="weather-name" style={{ ["--warm" as string]: 0.45 }}>PHIL&nbsp;HIE</h1>
        <div style={{ marginTop: "clamp(1.5rem, 3vh, 2.5rem)" }}>
          <Provenance accent={ACCENT} />
        </div>
        <nav style={links}>
          <a href="https://github.com/philhie" style={link} target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/philhie" style={link} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="/proto/object" style={link}>Thoughts</a>
        </nav>
      </main>

      {geo.city && <p style={skyTag}>your sky · {geo.city.toLowerCase()}</p>}
      <TrackEmbed accent={ACCENT} />
    </>
  );
}

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
  color: "rgba(207,214,230,0.5)",
};
