"use client";

import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useSyncExternalStore } from "react";
import { HalfFloatType } from "three";
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

  // DESIGN.md: 2000 desktop / 800 mobile
  const particleCount = isDesktop ? 2000 : 800;

  return (
    <Canvas
      // On-demand rendering: the useFrame loop self-invalidates during the
      // entrance and while interacting, then stops on idle (DESIGN.md
      // "freeze-on-idle"). Without this the default "always" loop renders the
      // full postprocessing chain at 60fps forever, saturating the main thread.
      frameloop="demand"
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
      <ParticleField count={particleCount} isReturning={isReturning} />
      <EffectComposer frameBufferType={HalfFloatType}>
        <Bloom
          intensity={isDesktop ? 1.5 : 0.8}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.3}
          mipmapBlur
          resolutionScale={isDesktop ? 1.0 : 0.5}
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
