"use client";

import { useSyncExternalStore } from "react";
import { detectCapabilities, type Capabilities } from "../_lib/capabilities";

/**
 * Device capability as an external store: `null` on the server / during
 * hydration (so the static poster paints first), then the real tier on the
 * client. Modeled via useSyncExternalStore so we never setState-in-effect and
 * never hit a hydration mismatch.
 */

let cached: Capabilities | null = null;

function getSnapshot(): Capabilities | null {
  if (!cached) cached = detectCapabilities();
  return cached;
}

function getServerSnapshot(): Capabilities | null {
  return null;
}

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = () => {
    cached = detectCapabilities();
    onChange();
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

export function useCapabilities(): Capabilities | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
