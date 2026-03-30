"use client";

export default function Overlay({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed z-10 transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        bottom: "clamp(2rem, 5vh, 4rem)",
        left: "clamp(1.5rem, 4vw, 3rem)",
        maxWidth: "32rem",
      }}
    >
      <h1
        className="font-sans text-white leading-none"
        style={{
          fontSize: "clamp(4.5rem, 10vw, 10rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
        }}
      >
        Phil Hie
      </h1>

      <p
        className="font-sans text-neutral-400 mt-3"
        style={{
          fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
        }}
      >
        Building.
      </p>

      <div
        className="flex gap-6 mt-6"
        style={{ flexWrap: "wrap" }}
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
  );
}
