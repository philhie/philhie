"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useState, useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { Vector2 } from "three";
import ParticleField from "./ParticleField";

type QualityTier = "high" | "medium" | "low";

// Responsive detection with live resize updates
function subscribeDesktop(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getDesktopSnapshot() {
  return typeof window !== "undefined" && window.innerWidth > 768;
}

function getDesktopServerSnapshot() {
  return true;
}

// Memoized Vector2 instances
const CHROMA_OFFSET = new Vector2(0.0005, 0.0005);
const CHROMA_ZERO = new Vector2(0, 0);

export default function Scene({
  onReady,
  onContextLost,
  isReturning,
}: {
  onReady?: () => void;
  onContextLost?: () => void;
  isReturning: boolean;
}) {
  const [quality, setQuality] = useState<QualityTier>("high");

  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot
  );

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const handleDecline = useCallback(() => {
    setQuality((prev) => {
      if (prev === "high") return "medium";
      if (prev === "medium") return "low";
      return "low";
    });
  }, []);

  const handleIncline = useCallback(() => {
    setQuality((prev) => {
      if (prev === "low") return "medium";
      if (prev === "medium") return "high";
      return "high";
    });
  }, []);

  const particleCount =
    quality === "high" ? (isDesktop ? 2000 : 800) :
    quality === "medium" ? (isDesktop ? 800 : 400) :
    400;

  const showBloom = quality !== "low";
  const showChromatic = isDesktop && quality === "high";
  const chromaOffset = useMemo(() => showChromatic ? CHROMA_OFFSET : CHROMA_ZERO, [showChromatic]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: false,
      }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      role="presentation"
      aria-hidden="true"
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <PerformanceMonitor
        onDecline={handleDecline}
        onIncline={handleIncline}
        flipflops={3}
        onFallback={() => setQuality("low")}
      >
        <ParticleField count={particleCount} isReturning={isReturning} />
        <EffectComposer>
          <Bloom
            intensity={showBloom ? (isDesktop ? 1.5 : 0.8) : 0}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            offset={chromaOffset}
            blendFunction={BlendFunction.NORMAL}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette darkness={0.7} offset={0.3} />
          <Noise
            blendFunction={BlendFunction.SOFT_LIGHT}
            opacity={0.15}
          />
        </EffectComposer>
      </PerformanceMonitor>
    </Canvas>
  );
}
