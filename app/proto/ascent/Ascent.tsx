"use client";

import { useRef, useState } from "react";
import ShaderCanvas, { type Uniforms } from "../_engine/ShaderCanvas";
import GradientPoster from "../_engine/GradientPoster";
import KineticName from "../_components/KineticName";
import AudioControl from "../_audio/AudioControl";
import { useCapabilities } from "../_hooks/useCapabilities";
import {
  usePointerField,
  useScrollProgress,
  useReturningVisitor,
  useEmpathy,
} from "../_hooks/useReactive";
import { useSky } from "../_lib/sky";
import type { Geo } from "../_lib/geo";
import { ascentFragment } from "./shader";

const ACCENT = "#e8a14c";

// Proof "stations" — the climb. Cryptic where it intrigues, bold where it lands.
const STATIONS = [
  { n: "01", k: "origin", big: "MUNICH", gloss: "Raised by one. The oldest of three. The start line was set behind the others." },
  { n: "02", k: "instinct", big: "AGE 7", gloss: "The first margin — sweets, bought cheap, sold at recess." },
  { n: "03", k: "the build", big: "THE BOT", gloss: "Limited drops, taken in milliseconds. Self-taught, out of necessity." },
  { n: "04", k: "reach", big: "115,000", gloss: "Subscribers. A top-five AI newsletter, run from a lecture hall." },
  { n: "05", k: "the rooms", big: "GOLDMAN SACHS", gloss: "No network, no nepotism. Walked in anyway — then a VC seat, then conviction." },
  { n: "06", k: "the leap", big: "€30M · SEQUOIA", gloss: "Left the degree for the machine that runs hospitals." },
];

export default function Ascent({ geo }: { geo: Geo }) {
  const caps = useCapabilities();
  const pointer = usePointerField();
  const empathy = useEmpathy();
  const returning = useReturningVisitor("ph-ascent");
  const sky = useSky(geo);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = useScrollProgress(scrollRef);
  const reveal = useRef(0);
  const [ready, setReady] = useState(false);

  const [uniforms] = useState<Uniforms>(() => ({
    uScroll: { value: 0 },
    uPointer: { value: [0.5, 0.5] },
    uPointerInfluence: { value: 0 },
    uWarmth: { value: 0.6 },
    uDaylight: { value: 0.6 },
    uHaze: { value: 0.3 },
    uDrift: { value: [0.3, 0.1] },
    uReturning: { value: returning.isReturning ? 1 : 0 },
    uReveal: { value: 0 },
  }));

  // Not memoized on purpose — ShaderCanvas keeps the latest via its own ref,
  // so a fresh closure each render is correct and lets the compiler optimize.
  const onFrame = (u: Uniforms, _t: number, dt: number) => {
    const p = pointer.read(dt);
    const s = sky.current;
    const dim = empathy.read();
    reveal.current += (1 - reveal.current) * Math.min(1, dt * 1.1);
    u.uScroll.value = scroll.read();
    u.uPointer.value = [p.x, p.y];
    u.uPointerInfluence.value = p.influence * (caps?.tier === "high" ? 1 : 0.5);
    u.uWarmth.value = s.warmth;
    u.uDaylight.value = s.daylight;
    u.uHaze.value = s.haze;
    u.uDrift.value = s.drift;
    u.uReveal.value = reveal.current * dim;
  };

  const showShader = caps != null && caps.tier !== "none";

  return (
    <>
      <GradientPoster
        base="#020308"
        grain={0.06}
        layers={[
          "radial-gradient(120% 80% at 50% 110%, rgba(232,128,44,0.55), rgba(232,128,44,0) 55%)",
          "radial-gradient(100% 60% at 50% 125%, rgba(255,184,96,0.40), transparent 52%)",
          "linear-gradient(to top, #1b0f08 0%, #0a0a12 40%, #04050b 72%, #020308 100%)",
        ]}
      />

      {showShader && (
        <ShaderCanvas
          fragment={ascentFragment}
          uniforms={uniforms}
          onFrame={onFrame}
          dprCap={caps!.dprCap}
          onReady={() => setReady(true)}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 1.2s ease" }}
        />
      )}

      <div ref={scrollRef} className="proto-scroll">
        {/* GROUND — the hero */}
        <section style={heroSection}>
          <div style={{ textAlign: "center" }}>
            <p style={kicker}>
              <span style={{ color: ACCENT }}>↑</span>&nbsp; the ascent
            </p>
            <KineticName text="PHIL HIE" style={nameStyle} />
            <p style={tagline}>Building from nothing.</p>
            {geo.city && (
              <p style={skyWhisper}>
                your sky · {geo.city.toLowerCase()}
              </p>
            )}
          </div>
          <p style={scrollCue}>scroll to rise</p>
        </section>

        {/* THE CLIMB — proof stations */}
        {STATIONS.map((s) => (
          <section key={s.n} style={stationSection}>
            <div className="reveal" style={{ maxWidth: "44rem" }}>
              <p style={stationLabel}>
                {s.n} <span style={{ opacity: 0.5 }}>/ {s.k}</span>
              </p>
              <p style={stationBig}>{s.big}</p>
              <p style={stationGloss}>{s.gloss}</p>
            </div>
          </section>
        ))}

        {/* ORBIT — the summit */}
        <section style={summitSection}>
          <div className="reveal" style={{ textAlign: "center" }}>
            <p style={stationLabel}>07 <span style={{ opacity: 0.5 }}>/ now</span></p>
            <p style={{ ...stationBig, fontSize: "clamp(3rem, 12vw, 9rem)" }}>
              DECACORN
            </p>
            <p style={{ ...stationGloss, margin: "1.5rem auto 0" }}>
              The only acceptable outcome. Building it next.
            </p>
            <nav style={linksRow}>
              <a href="https://github.com/philhie" style={linkStyle} target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://linkedin.com/in/philhie" style={linkStyle} target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="/proto/ascent" style={linkStyle}>Thoughts</a>
            </nav>
          </div>
        </section>
      </div>

      <AudioControl accent={ACCENT} />
    </>
  );
}

/* ------------------------------- styles ------------------------------- */

const heroSection: React.CSSProperties = {
  minHeight: "100svh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",
  padding: "2rem",
  position: "relative",
};

const stationSection: React.CSSProperties = {
  minHeight: "100svh",
  display: "flex",
  alignItems: "center",
  padding: "clamp(2rem, 8vw, 8rem)",
};

const summitSection: React.CSSProperties = {
  minHeight: "100svh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
};

const kicker: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.7rem",
  letterSpacing: "0.35em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
  marginBottom: "1.5rem",
};

const nameStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontWeight: 800,
  fontSize: "clamp(3.25rem, 15vw, 12rem)",
  lineHeight: 0.9,
  letterSpacing: "-0.04em",
  color: "#fff",
  margin: 0,
};

const tagline: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontStyle: "italic",
  fontSize: "clamp(1rem, 2.4vw, 1.6rem)",
  color: "rgba(244,228,212,0.78)",
  marginTop: "1.75rem",
};

const skyWhisper: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.65rem",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: "rgba(232,161,76,0.65)",
  marginTop: "1.5rem",
};

const scrollCue: React.CSSProperties = {
  position: "absolute",
  bottom: "2rem",
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.62rem",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.3)",
};

const stationLabel: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.7rem",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: ACCENT,
  marginBottom: "1.25rem",
};

const stationBig: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontWeight: 800,
  fontSize: "clamp(2.5rem, 9vw, 7rem)",
  lineHeight: 0.92,
  letterSpacing: "-0.03em",
  color: "#fff",
  margin: 0,
};

const stationGloss: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontStyle: "italic",
  fontSize: "clamp(1.05rem, 2.2vw, 1.5rem)",
  lineHeight: 1.4,
  color: "rgba(238,224,210,0.7)",
  marginTop: "1.5rem",
  maxWidth: "34ch",
};

const linksRow: React.CSSProperties = {
  display: "flex",
  gap: "2rem",
  justifyContent: "center",
  marginTop: "3rem",
};

const linkStyle: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), monospace",
  fontSize: "0.72rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.6)",
  textDecoration: "none",
};
