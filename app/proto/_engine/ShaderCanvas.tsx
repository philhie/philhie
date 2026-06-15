"use client";

/**
 * ShaderCanvas — the GPU-light heart of every prototype world.
 *
 * One fullscreen OGL Triangle running a single fragment shader. No particles,
 * no overdraw, no post-processing passes. The "bloom" is baked into the shader.
 *
 * Cheapness, by construction:
 *  - render-buffer DPR is capped (≤1.25 desktop / ≤1.0 mobile) and degrades
 *    further if frames slip — the gradient softness hides the low resolution
 *  - init is deferred to requestIdleCallback so it never blocks LCP
 *  - the loop pauses on hidden tabs and when `paused` is set
 *
 * The world supplies a `fragment` string and an `onFrame` callback that writes
 * live values (scroll, pointer, sky state, …) into the uniform objects.
 */

import { useEffect, useRef } from "react";
import { Renderer, Triangle, Program, Mesh } from "ogl";
import { FULLSCREEN_VERT } from "./glsl";

export type Uniforms = Record<string, { value: unknown }>;

export interface ShaderCanvasProps {
  fragment: string;
  /** Extra uniforms beyond the always-present base set. */
  uniforms?: Uniforms;
  /** Called every frame to mutate uniform values. t = seconds, dt = seconds. */
  onFrame?: (u: Uniforms, t: number, dt: number) => void;
  /** Render-buffer DPR ceiling (from capability detection). */
  dprCap?: number;
  /** Cap the render rate (fps). 0 = uncapped. Big win for slow scenes on 120Hz. */
  targetFps?: number;
  /** Pause the render loop (e.g. behind a modal). */
  paused?: boolean;
  /** Fired after the first successful frame — used to crossfade out the poster. */
  onReady?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function idle(cb: () => void): number {
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }
  ).requestIdleCallback;
  if (ric) return ric(cb, { timeout: 600 });
  return window.setTimeout(cb, 1);
}

export default function ShaderCanvas({
  fragment,
  uniforms,
  onFrame,
  dprCap = 1,
  targetFps = 0,
  paused = false,
  onReady,
  className,
  style,
}: ShaderCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let mesh: Mesh | null = null;
    let raf = 0;
    let disposed = false;
    let ready = false;

    // Base uniforms present in every world.
    const base: Uniforms = {
      uTime: { value: 0 },
      uResolution: { value: [1, 1] },
      uDpr: { value: dprCap },
    };
    const u: Uniforms = { ...base, ...(uniforms ?? {}) };

    // Adaptive buffer scale: starts at the cap, degrades on sustained slowdowns.
    let effectiveDpr = dprCap;
    const minDpr = Math.min(0.6, dprCap);
    let fpsAccum = 0;
    let fpsFrames = 0;
    let lastDegrade = 0;

    const start = () => {
      if (disposed) return;
      try {
        renderer = new Renderer({
          dpr: effectiveDpr,
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
        });
      } catch {
        return; // No WebGL — the poster underneath stays visible.
      }

      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 1);
      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      container.appendChild(canvas);

      try {
        const geometry = new Triangle(gl);
        const program = new Program(gl, {
          vertex: FULLSCREEN_VERT,
          fragment,
          uniforms: u,
        });
        mesh = new Mesh(gl, { geometry, program });
      } catch {
        // Shader failed to compile/link — fall back to the poster underneath.
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        renderer = null;
        mesh = null;
        return;
      }

      const resize = () => {
        if (!renderer) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        renderer.dpr = effectiveDpr;
        renderer.setSize(w, h);
        u.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      };
      resize();

      const ro = new ResizeObserver(resize);
      ro.observe(container);

      let lastRender = performance.now();
      const frameInterval = targetFps > 0 ? 1000 / targetFps : 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (pausedRef.current || document.hidden) {
          lastRender = now;
          return;
        }
        // Frame-rate cap: a slow, living scene doesn't need 120Hz. Skipping
        // frames here is the single biggest win on ProMotion displays.
        if (frameInterval > 0 && now - lastRender < frameInterval - 1) return;
        const dt = Math.min((now - lastRender) / 1000, 0.05);
        lastRender = now;

        const t = now / 1000;
        u.uTime.value = t;
        onFrameRef.current?.(u, t, dt);
        if (renderer && mesh) renderer.render({ scene: mesh });

        if (!ready) {
          ready = true;
          onReadyRef.current?.();
        }

        // DPR watchdog only when uncapped (a cap already bounds the frame cost).
        if (frameInterval === 0) {
          fpsAccum += dt;
          fpsFrames += 1;
          if (fpsAccum >= 1) {
            const fps = fpsFrames / fpsAccum;
            if (fps < 50 && effectiveDpr > minDpr && now - lastDegrade > 2500) {
              effectiveDpr = Math.max(minDpr, effectiveDpr - 0.15);
              lastDegrade = now;
              resize();
            }
            fpsAccum = 0;
            fpsFrames = 0;
          }
        }
      };
      raf = requestAnimationFrame(loop);

      cleanupFns.push(() => {
        ro.disconnect();
        const ext = gl.getExtension("WEBGL_lose_context");
        ext?.loseContext();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      });
    };

    const cleanupFns: Array<() => void> = [];
    const idleId = idle(start);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      const ric = (
        window as Window & { cancelIdleCallback?: (id: number) => void }
      ).cancelIdleCallback;
      if (ric) ric(idleId);
      else clearTimeout(idleId);
      cleanupFns.forEach((fn) => fn());
    };
    // Re-init only when the shader program itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragment, dprCap]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
