"use client";

export default function SoundToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`fixed z-20 font-mono transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/50 focus-visible:outline-offset-2 ${
        enabled
          ? "text-neutral-400 hover:text-neutral-600"
          : "text-neutral-600 hover:text-neutral-400"
      }`}
      style={{
        bottom: "clamp(1.5rem, 3vh, 2.5rem)",
        right: "clamp(1.5rem, 4vw, 3rem)",
        fontSize: "0.625rem",
        letterSpacing: "0.05em",
      }}
      aria-label={enabled ? "Disable sound" : "Enable sound"}
    >
      {enabled ? "listening" : "listen"}
    </button>
  );
}
