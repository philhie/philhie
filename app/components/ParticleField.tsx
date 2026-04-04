/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
// @ts-nocheck — TSL node types are polymorphic and don't resolve cleanly in TypeScript
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  uniform,
  float,
  vec2,
  vec4,
  Fn,
  If,
  instancedBufferAttribute,
  mix,
  normalize,
  length,
  exp,
  cos,
  sin,
  uv,
  min,
} from "three/tsl";
import { PointsNodeMaterial } from "three/webgpu";
import { mx_perlin_noise_float } from "three/src/nodes/materialx/lib/mx_noise.js";

// ─── Easing functions ────────────────────────────────────────

export function easeInCubic(t: number) { return t * t * t; }
export function easeOutQuad(t: number) { return 1 - (1 - t) * (1 - t); }
export function easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

// ─── Shared PRNG (mulberry32) ───────────────────────────────

export function createRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ─── Konami code targets (career timeline) ───────────────────
const KONAMI_LABELS = ["2015", "2022", "2022", "2023", "2025", "???"];
function generateKonamiTargets(count: number): Float32Array {
  const targets = new Float32Array(count * 3);
  const clusterCount = KONAMI_LABELS.length;
  const particlesPerCluster = Math.floor(count / clusterCount);
  const rand = createRng(137);

  for (let c = 0; c < clusterCount; c++) {
    const cx = (c / (clusterCount - 1)) * 4 - 2;
    const cy = 0;
    for (let i = 0; i < particlesPerCluster; i++) {
      const idx = (c * particlesPerCluster + i) * 3;
      targets[idx] = cx + (rand() - 0.5) * 0.3;
      targets[idx + 1] = cy + (rand() - 0.5) * 0.4;
      targets[idx + 2] = (rand() - 0.5) * 0.2;
    }
  }
  return targets;
}

// ─── Time of day color ───────────────────────────────────────

export function getTimeOfDayColor(): THREE.Color {
  const hour = new Date().getHours();
  if ((hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19)) {
    return new THREE.Color(0xfef3c7);
  } else if (hour >= 20 || hour <= 4) {
    return new THREE.Color(0xdbeafe);
  }
  return new THREE.Color(0xffffff);
}

// Use Three.js built-in perlin noise (has .setLayout() for GPU function compilation)
const noise3f = (v: any) => mx_perlin_noise_float(v);

// ─── Component ───────────────────────────────────────────────

export default function ParticleField({
  count,
  isReturning,
}: {
  count: number;
  isReturning: boolean;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const { invalidate } = useThree();

  const idleTimer = useRef(0);
  const isFrozen = useRef(false);
  const cursorTarget = useRef(new THREE.Vector2(0, 0));
  const cursorCurrent = useRef(new THREE.Vector2(0, 0));
  const cursorInfluence = useRef(0);
  const rippleStrength = useRef(0);
  const konamiActive = useRef(false);
  const konamiProgress = useRef(0);
  const konamiTimer = useRef(0);

  const entranceDuration = isReturning ? 1.5 : 4.0;
  const phaseScale = 4.0 / entranceDuration;

  // TSL uniforms
  const uTime = useMemo(() => uniform(0.0), []);
  const uPhase = useMemo(() => uniform(0.0), []);
  const uCursor = useMemo(() => uniform(new THREE.Vector2(0, 0)), []);
  const uCursorInfluence = useMemo(() => uniform(0.0), []);
  const uColor = useMemo(() => uniform(getTimeOfDayColor()), []);
  const uKonami = useMemo(() => uniform(0.0), []);
  const uKonamiProgress = useMemo(() => uniform(0.0), []);

  // Instanced attributes + material
  const sprite = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const rand = createRng(42);

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 0.5 + rand() * 2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.5 + rand() * 1.5;
      sizes[i] = 1.0 + rand() * 3.0;
    }

    const konamiTargets = generateKonamiTargets(count);

    const posAttr = new THREE.InstancedBufferAttribute(positions, 3);
    const speedAttr = new THREE.InstancedBufferAttribute(speeds, 1);
    const sizeAttr = new THREE.InstancedBufferAttribute(sizes, 1);
    const konamiAttr = new THREE.InstancedBufferAttribute(konamiTargets, 3);

    const aBasePosition = instancedBufferAttribute(posAttr);
    const aSpeed = instancedBufferAttribute(speedAttr);
    const aSize = instancedBufferAttribute(sizeAttr);
    const aKonamiTarget = instancedBufferAttribute(konamiAttr);

    // Position node: phase-based motion logic
    const positionNode = Fn(() => {
      const pos = aBasePosition.toVar();
      const alpha = float(0.0).toVar();

      If(uPhase.lessThan(1.0), () => {
        // Phase 0: Void
        pos.assign(pos.mul(8.0));
        alpha.assign(0.0);
      }).ElseIf(uPhase.lessThan(2.0), () => {
        // Phase 1: Bloom - coalesce inward
        const t = uPhase.sub(1.0);
        const radius = mix(float(8.0), float(1.0), t);
        pos.assign(normalize(pos).mul(radius));
        // Spiral motion
        const angle = uTime.mul(aSpeed).mul(0.5).add(length(pos));
        const spiralScale = float(0.3).mul(float(1.0).sub(t));
        pos.x.addAssign(cos(angle).mul(spiralScale));
        pos.z.addAssign(sin(angle).mul(spiralScale));
        alpha.assign(t.mul(0.4));
      }).ElseIf(uPhase.lessThan(3.0), () => {
        // Phase 2: Peak - bright, tight
        const t = uPhase.sub(2.0);
        pos.assign(normalize(pos).mul(mix(float(1.0), float(0.5), t)));
        alpha.assign(mix(float(0.4), float(0.6), t));
      }).Else(() => {
        // Phase 3: Aftermath - disperse + drift
        const disperseT = min(uPhase.sub(3.0).mul(0.5), 1.0);
        const baseRadius = mix(float(0.5), float(2.5), disperseT);
        pos.assign(normalize(pos).mul(baseRadius));

        // Simplex noise drift
        const noisePos = pos.mul(0.5).add(uTime.mul(0.05).mul(aSpeed));
        pos.x.addAssign(noise3f(noisePos).mul(0.3));
        pos.y.addAssign(noise3f(noisePos.add(100.0)).mul(0.3));
        pos.z.addAssign(noise3f(noisePos.add(200.0)).mul(0.15));

        // Cursor displacement
        If(uCursorInfluence.greaterThan(0.01), () => {
          const diff = pos.xy.sub(uCursor);
          const dist = length(diff);
          const push = uCursorInfluence.mul(0.5).div(dist.mul(dist).add(0.5));
          pos.x.addAssign(normalize(diff).x.mul(push));
          pos.y.addAssign(normalize(diff).y.mul(push));
        });

        // Konami mode
        If(uKonami.greaterThan(0.5), () => {
          pos.assign(mix(pos, aKonamiTarget, uKonamiProgress));
        });

        alpha.assign(mix(
          float(0.15),
          float(0.35),
          noise3f(pos.mul(2.0).add(uTime.mul(0.1))).mul(0.5).add(0.5)
        ));
      });

      return vec4(pos, alpha);
    })();

    // Soft circle alpha with Gaussian falloff
    const alphaNode = Fn(() => {
      const center = uv().sub(vec2(0.5, 0.5));
      const dist = length(center);
      return exp(dist.mul(dist).mul(-8.0));
    })();

    const mat = new PointsNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    } as any);

    // Use the xyz of positionNode for position, w for alpha
    mat.positionNode = positionNode.xyz;
    mat.colorNode = vec4(uColor, positionNode.w.mul(alphaNode));
    mat.sizeNode = aSize.mul(float(300.0 / 5.0));

    const s = new THREE.Sprite(mat);
    s.count = count;
    s.frustumCulled = false;

    return s;
  }, [count, uTime, uPhase, uCursor, uCursorInfluence, uColor, uKonami, uKonamiProgress]);

  // Pointer events
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cursorTarget.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      cursorInfluence.current = 1;
      idleTimer.current = 0;
      if (isFrozen.current) {
        isFrozen.current = false;
        invalidate();
      }
    };

    const onClick = () => {
      rippleStrength.current = 3;
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      idleTimer.current = 0;
      if (isFrozen.current) {
        isFrozen.current = false;
        invalidate();
      }
    };

    const onLeave = () => {
      cursorInfluence.current = 0;
    };

    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        cursorTarget.current.set(
          (touch.clientX / window.innerWidth) * 2 - 1,
          -(touch.clientY / window.innerHeight) * 2 + 1
        );
        cursorInfluence.current = 1;
        idleTimer.current = 0;
        if (isFrozen.current) {
          isFrozen.current = false;
          invalidate();
        }
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [invalidate]);

  // Animation loop
  useFrame((_, delta) => {
    uTime.value += delta;
    const elapsed = uTime.value;

    // Phase transitions with easing
    if (elapsed < 0.8 * (1 / phaseScale)) {
      uPhase.value = 0;
    } else if (elapsed < 2.5 * (1 / phaseScale)) {
      const t = (elapsed - 0.8 / phaseScale) / (1.7 / phaseScale);
      uPhase.value = 1 + easeInCubic(Math.min(t, 1));
    } else if (elapsed < 4.0 * (1 / phaseScale)) {
      const t = (elapsed - 2.5 / phaseScale) / (1.5 / phaseScale);
      uPhase.value = 2 + easeOutQuad(Math.min(t, 1));
    } else {
      const t = (elapsed - 4.0 / phaseScale) / 2.0;
      uPhase.value = 3 + easeOutExpo(Math.min(t, 1));
    }

    // Cursor lerp (0.15s lag)
    const lerpFactor = 1 - Math.pow(0.001, delta);
    cursorCurrent.current.lerp(cursorTarget.current, lerpFactor);
    uCursor.value.copy(cursorCurrent.current);

    // Cursor influence decay
    const targetInfluence = cursorInfluence.current;
    uCursorInfluence.value += (targetInfluence - uCursorInfluence.value) * lerpFactor;

    // Ripple decay
    if (rippleStrength.current > 0) {
      uCursorInfluence.value += rippleStrength.current;
      rippleStrength.current *= 0.9;
      if (rippleStrength.current < 0.01) rippleStrength.current = 0;
    }

    // Konami animation
    if (konamiActive.current) {
      konamiTimer.current += delta;
      if (konamiTimer.current < 0.5) {
        konamiProgress.current = easeOutExpo(konamiTimer.current / 0.5);
      } else if (konamiTimer.current > 5) {
        konamiProgress.current *= 0.95;
        if (konamiProgress.current < 0.01) {
          konamiActive.current = false;
          konamiProgress.current = 0;
        }
      }
      uKonami.value = 1;
      uKonamiProgress.value = konamiProgress.current;
    } else {
      uKonami.value = 0;
      uKonamiProgress.value = 0;
    }

    // Idle detection
    if (uPhase.value >= 3) {
      idleTimer.current += delta;
      if (idleTimer.current > 10 && !isFrozen.current) {
        isFrozen.current = true;
      }
    }

    if (!isFrozen.current) {
      invalidate();
    }
  });

  // Konami trigger
  useEffect(() => {
    const handler = () => {
      if (uPhase.value < 3) return;
      konamiActive.current = true;
      konamiTimer.current = 0;
      konamiProgress.current = 0;
      idleTimer.current = 0;
      if (isFrozen.current) {
        isFrozen.current = false;
        invalidate();
      }
    };
    window.addEventListener("konami", handler);
    return () => window.removeEventListener("konami", handler);
  }, [uPhase, invalidate]);

  return <primitive ref={spriteRef} object={sprite} />;
}
