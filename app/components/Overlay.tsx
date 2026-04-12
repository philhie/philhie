"use client";

export default function Overlay({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed z-10 transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: "clamp(1.5rem, 5vh, 4rem)",
        paddingLeft: "clamp(1rem, 4vw, 3rem)",
        paddingTop: "8rem",
        paddingRight: "1rem",
        background:
          "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto", maxWidth: "min(32rem, calc(100vw - 2rem))" }}>
        <h1
          className="font-sans text-white leading-none"
          style={{
            fontSize: "clamp(3rem, 10vw, 10rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            marginLeft: "-0.04em",
          }}
        >
          Phil Hie
        </h1>

        <p
          className="font-sans text-neutral-400"
          style={{
            fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
            marginTop: "0.75rem",
          }}
        >
          Just doing things.
        </p>

        <div
          className="flex gap-6"
          style={{ flexWrap: "wrap", marginTop: "1rem" }}
        >
          <a
            href="https://github.com/philhie"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 font-mono text-neutral-500 hover:text-white transition-colors duration-150 uppercase focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/50 focus-visible:outline-offset-2"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
              padding: "0.5rem 0",
            }}
          >
            GitHub
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-neutral-300">
              ↗
            </span>
          </a>
          <a
            href="https://linkedin.com/in/philhie"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 font-mono text-neutral-500 hover:text-white transition-colors duration-150 uppercase focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/50 focus-visible:outline-offset-2"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
              padding: "0.5rem 0",
            }}
          >
            LinkedIn
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-neutral-300">
              ↗
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
