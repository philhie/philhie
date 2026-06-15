import Link from "next/link";

// v2 hero directions. A (weather) is the lead; B and C are the alternates.
const WORLDS = [
  { href: "/proto/weather", n: "A", name: "A name made of weather", desc: "The living dawn→night volumetric atmosphere. Cinematic, alive, faceless. (Lead.)", color: "#e8a14c" },
  { href: "/proto/object", n: "B", name: "Liquid-metal object", desc: "A morphing obsidian / liquid-metal mass — soul (organic) meets machine (mirror-precise).", color: "#cfd6e6" },
  { href: "/proto/type", n: "C", name: "Typographic cinema", desc: "The name as the hero on a near-empty stage, one drifting light, heavy film grain.", color: "#e8a14c" },
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
        <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          philhie.com — directions
        </p>
        <h1 style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 6vw, 4rem)", letterSpacing: "-0.03em", margin: "0.75rem 0 0" }}>
          Three directions. A leads.
        </h1>
        <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", fontSize: "1.05rem", color: "rgba(240,228,214,0.6)", marginTop: "0.75rem", maxWidth: "44rem" }}>
          One screen. Same name, same Provenance Ledger, same reactive engine + real-track audio. Different hero. Open each on your Mac and phone.
        </p>
      </header>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {WORLDS.map((w) => (
          <li key={w.href} style={{ background: "#050608" }}>
            <Link href={w.href} style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", padding: "1.75rem clamp(1rem, 3vw, 2.5rem)", textDecoration: "none", color: "inherit" }}>
              <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.9rem", color: w.color, flexShrink: 0 }}>{w.n}</span>
              <span style={{ flex: 1 }}>
                <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 700, fontSize: "clamp(1.25rem, 3vw, 2rem)", letterSpacing: "-0.02em", display: "block" }}>{w.name}</span>
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: "0.4rem", display: "block", lineHeight: 1.5 }}>{w.desc}</span>
              </span>
              <span aria-hidden style={{ color: w.color, fontSize: "1.2rem", flexShrink: 0 }}>↗</span>
            </Link>
          </li>
        ))}
      </ul>

      <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.66rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>
        Prototypes — the winner gets built to final, then /thoughts.
      </p>
    </main>
  );
}
