"use client";

/**
 * The "alive" suite — reactive signals that make each world respond to the
 * visitor without an LLM. The returned APIs are sample/ref based: they never
 * trigger React re-renders; the consumer reads them inside the shader's
 * per-frame callback. (Stable objects via useState so we never touch a ref
 * during render.)
 */

import { useEffect, useRef, useState } from "react";

/* ----------------------------- pointer field ----------------------------- */

export interface PointerSample {
  x: number; // 0..1, left→right
  y: number; // 0..1, bottom→top
  speed: number; // smoothed pointer speed (≈ screens/sec)
  influence: number; // 0..1, high right after movement / while pressed
  down: number; // 0 or 1
}

/** A gravity-well cursor (NOT a spotlight): smoothed position + speed + recency. */
export function usePointerField() {
  const s = useRef({
    tx: 0.5, ty: 0.5, x: 0.5, y: 0.5,
    vx: 0, vy: 0, speed: 0, down: 0, lastMove: -1e9,
  });

  useEffect(() => {
    const st = s.current;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = 1 - e.clientY / window.innerHeight;
      st.vx = nx - st.tx;
      st.vy = ny - st.ty;
      st.tx = nx;
      st.ty = ny;
      st.lastMove = performance.now();
    };
    const onDown = () => { st.down = 1; };
    const onUp = () => { st.down = 0; };
    const onLeave = () => { st.lastMove = -1e9; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const [api] = useState(() => ({
    read(dt: number): PointerSample {
      const st = s.current;
      const k = 1 - Math.exp(-dt * 7);
      st.x += (st.tx - st.x) * k;
      st.y += (st.ty - st.y) * k;
      const inst = Math.hypot(st.vx, st.vy) * 60;
      st.speed += (inst - st.speed) * Math.min(1, dt * 8);
      st.vx *= 0.85;
      st.vy *= 0.85;
      const since = (performance.now() - st.lastMove) / 1000;
      const recency = Math.exp(-since * 1.2);
      return {
        x: st.x,
        y: st.y,
        speed: st.speed,
        influence: Math.max(st.down, recency),
        down: st.down,
      };
    },
  }));
  return api;
}

/* ---------------------------- scroll progress ---------------------------- */

/** Live scroll progress 0..1 of a scroll container (or the window). */
export function useScrollProgress(
  targetRef?: React.RefObject<HTMLElement | null>,
) {
  const [api] = useState(() => ({
    read(): number {
      const el = targetRef?.current;
      if (el) {
        const max = el.scrollHeight - el.clientHeight;
        return max > 0 ? el.scrollTop / max : 0;
      }
      if (typeof window === "undefined") return 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    },
  }));
  return api;
}

/* ------------------------------- gyro tilt ------------------------------- */

interface IOSOrientation {
  requestPermission?: () => Promise<"granted" | "denied">;
}

/** Device-orientation parallax. Android listens immediately; iOS needs enable(). */
export function useGyroTilt() {
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Stable attach fn (created once) so we never write a fresh value to a ref
  // during render. Reads `tilt` only when invoked (in effect / on gesture).
  const [attach] = useState(() => () => {
    const onOrient = (e: DeviceOrientationEvent) => {
      tilt.current.tx = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 35));
      tilt.current.ty = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 40) / 35));
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  });

  useEffect(() => {
    const DOE = (
      window as unknown as { DeviceOrientationEvent?: IOSOrientation }
    ).DeviceOrientationEvent;
    // Non-iOS: just listen. iOS exposes requestPermission and needs a gesture.
    if (!DOE || typeof DOE.requestPermission !== "function") {
      return attach();
    }
    return undefined;
  }, [attach]);

  const [api] = useState(() => ({
    /** Call from a user gesture on iOS to unlock orientation. */
    async enable() {
      const DOE = (
        window as unknown as { DeviceOrientationEvent?: IOSOrientation }
      ).DeviceOrientationEvent;
      if (DOE && typeof DOE.requestPermission === "function") {
        try {
          const res = await DOE.requestPermission();
          if (res === "granted") attach();
        } catch {
          /* denied — silently stay flat */
        }
      }
    },
    read(dt: number): [number, number] {
      const t = tilt.current;
      const k = 1 - Math.exp(-dt * 4);
      t.x += (t.tx - t.x) * k;
      t.y += (t.ty - t.y) * k;
      return [t.x, t.y];
    },
  }));
  return api;
}

/* --------------------------- returning visitor --------------------------- */

export interface VisitState {
  count: number;
  isReturning: boolean;
  seed: number; // stable per-visitor, 0..1
}

/** Reads + increments a per-visitor record. Worlds accrue state across visits. */
export function useReturningVisitor(key = "ph-proto"): VisitState {
  const [state] = useState<VisitState>(() => {
    if (typeof window === "undefined") {
      return { count: 1, isReturning: false, seed: 0.5 };
    }
    try {
      const countKey = `${key}-count`;
      const seedKey = `${key}-seed`;
      const count = (parseInt(localStorage.getItem(countKey) || "0", 10) || 0) + 1;
      localStorage.setItem(countKey, String(count));
      let seed = parseFloat(localStorage.getItem(seedKey) || "");
      if (!(seed >= 0 && seed <= 1)) {
        seed = Math.random();
        localStorage.setItem(seedKey, String(seed));
      }
      return { count, isReturning: count > 1, seed };
    } catch {
      return { count: 1, isReturning: false, seed: 0.5 };
    }
  });
  return state;
}

/* -------------------------------- empathy -------------------------------- */

/** Returns a dimming factor (1 = full, lower when on low battery / data-saver). */
export function useEmpathy() {
  const dim = useRef(1);

  useEffect(() => {
    const conn = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (conn?.saveData) dim.current = Math.min(dim.current, 0.7);

    const getBattery = (
      navigator as Navigator & {
        getBattery?: () => Promise<{ level: number; charging: boolean }>;
      }
    ).getBattery;
    if (getBattery) {
      getBattery
        .call(navigator)
        .then((b) => {
          if (!b.charging && b.level < 0.2) dim.current = Math.min(dim.current, 0.6);
        })
        .catch(() => {});
    }
  }, []);

  const [api] = useState(() => ({
    read(): number {
      return dim.current;
    },
  }));
  return api;
}
