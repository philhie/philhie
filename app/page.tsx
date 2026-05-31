"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import SoundToggle from "./components/SoundToggle";
import SoundEngine from "./components/SoundEngine";
import CustomCursor from "./components/CustomCursor";
import Overlay from "./components/Overlay";
import SceneErrorBoundary from "./components/SceneErrorBoundary";

const Scene = dynamic(() => import("./components/Scene"), { ssr: false });

// Konami code sequence
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA",
];

// Centralized visit counter — single source of truth
function getVisitData() {
  try {
    const key = "ph-visit";
    const prev = localStorage.getItem(key);
    const count = prev ? parseInt(prev, 10) + 1 : 1;
    localStorage.setItem(key, String(count));
    return { isReturning: count > 1, count };
  } catch {
    return { isReturning: false, count: 1 };
  }
}

// Reduced motion media query with live updates
const reducedMotionQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function subscribeReducedMotion(callback: () => void) {
  reducedMotionQuery?.addEventListener("change", callback);
  return () => reducedMotionQuery?.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return reducedMotionQuery?.matches ?? false;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function Home() {
  const [sceneReady, setSceneReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Centralized visit data — read once, shared with ParticleField via prop
  const [visitData] = useState(getVisitData);

  // Show overlay immediately for reduced motion
  useEffect(() => {
    if (reducedMotion) {
      setShowOverlay(true);
      setSceneReady(true);
    }
  }, [reducedMotion]);

  // Show overlay after the entrance. DESIGN.md: text fades in 0.5s after the
  // reveal phase begins (2.5s) → 3.0s first visit; returning visitors get the
  // compressed 1.5s entrance. This timing also gates LCP (the <h1> is the
  // largest contentful element), so it is kept as tight as the design allows.
  useEffect(() => {
    if (reducedMotion) return;
    const delay = visitData.isReturning ? 1000 : 3000;
    const timer = setTimeout(() => setShowOverlay(true), delay);
    return () => clearTimeout(timer);
  }, [reducedMotion, visitData.isReturning]);

  // Konami code listener
  useEffect(() => {
    let position = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const onKey = (e: KeyboardEvent) => {
      if (e.code === KONAMI[position]) {
        position++;
        clearTimeout(timeout);
        timeout = setTimeout(() => { position = 0; }, 2000);
        if (position === KONAMI.length) {
          position = 0;
          window.dispatchEvent(new Event("konami"));
        }
      } else {
        position = 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timeout);
    };
  }, []);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleContextLost = useCallback(() => setWebglFailed(true), []);
  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);

  // Static fallback for WebGL failure
  if (webglFailed) {
    return <StaticFallback />;
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* CSS loading glow (visible before canvas mounts) */}
      {!sceneReady && !reducedMotion && (
        <div className="loading-glow" />
      )}

      {/* WebGL Scene */}
      {!reducedMotion && (
        <SceneErrorBoundary>
          <Scene
            onReady={handleSceneReady}
            onContextLost={handleContextLost}
            isReturning={visitData.isReturning}
          />
        </SceneErrorBoundary>
      )}

      {/* Reduced motion: static particle-like background */}
      {reducedMotion && (
        <div className="fixed inset-0 z-0">
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      {/* DOM Overlay: name, tagline, links */}
      <Overlay visible={showOverlay} />

      {/* Sound */}
      <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
      <SoundEngine enabled={soundEnabled} />

      {/* Custom cursor */}
      <CustomCursor />
    </div>
  );
}

function StaticFallback() {
  return (
    <div className="flex min-h-screen bg-black">
      <Overlay visible={true} />
    </div>
  );
}
