"use client";

import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Vector2 } from "three";
import ParticleField from "./ParticleField";

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
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot
  );

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const particleCount = isDesktop ? 3000 : 1200;
  const chromaOffset = useMemo(() => isDesktop ? CHROMA_OFFSET : CHROMA_ZERO, [isDesktop]);

  return (
    <Canvas
      dpr={[1, 2]}
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
      <ParticleField count={particleCount} isReturning={isReturning} />
      <EffectComposer>
        <Bloom
          intensity={isDesktop ? 1.8 : 1.0}
          luminanceThreshold={0.2}
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
    </Canvas>
  );
}
