import Link from "next/link";

// A simple chooser so Phil can move between the four prototype worlds.
const WORLDS = [
  { href: "/proto/ascent", n: "01", name: "The Ascent", desc: "Rise from nothing → orbit. The climb is the story. Warm → cold, cinematic narrative.", color: "#e8a14c" },
  { href: "/proto/signal", n: "02", name: "The Signal", desc: "A faint signal grows into a constellation that remembers you. Minimal mystery.", color: "#9fb0cc" },
  { href: "/proto/forge", n: "03", name: "The Forge", desc: "Molten → steel. Sparks, urgency, building from nothing. Visceral warmth.", color: "#ff7a1e" },
  { href: "/proto/system", n: "04", name: "The System", desc: "Boot into a living machine I built. Cold technical sublime. Engineer flex.", color: "#7fb2e8" },
];

export default function ProtoIndex() {
  return (
    <main
      style={{
        minHeight: "100svh",
        background: "#050608",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(2rem, 6vw, 6rem)",
        gap: "2.5rem",
        overflow: "auto",
      }}
    >
      <header>
        <p
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          philhie.com — prototypes
        </p>
        <h1
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2rem, 6vw, 4rem)",
            letterSpacing: "-0.03em",
            margin: "0.75rem 0 0",
          }}
        >
          Four worlds. Choose one.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontStyle: "italic",
            fontSize: "1.05rem",
            color: "rgba(240,228,214,0.6)",
            marginTop: "0.75rem",
            maxWidth: "44rem",
          }}
        >
          Same fast engine, same reactive suite (your sky · gravity cursor ·
          returning-visitor memory · mobile tilt), same opt-in audio. Different
          souls. Open each on laptop and phone.
        </p>
      </header>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {WORLDS.map((w) => (
          <li key={w.href} style={{ background: "#050608" }}>
            <Link
              href={w.href}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "1.5rem",
                padding: "1.75rem clamp(1rem, 3vw, 2.5rem)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.8rem", color: w.color, flexShrink: 0 }}>{w.n}</span>
              <span style={{ flex: 1 }}>
                <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 700, fontSize: "clamp(1.25rem, 3vw, 2rem)", letterSpacing: "-0.02em", display: "block" }}>
                  {w.name}
                </span>
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: "0.4rem", display: "block", lineHeight: 1.5 }}>
                  {w.desc}
                </span>
              </span>
              <span aria-hidden style={{ color: w.color, fontSize: "1.2rem", flexShrink: 0 }}>↗</span>
            </Link>
          </li>
        ))}
      </ul>

      <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.66rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>
        Prototypes only — not the final site. The winner gets built out fully.
      </p>
    </main>
  );
}
