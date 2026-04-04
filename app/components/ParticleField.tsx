"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  uniform,
  float,
  vec2,
  vec3,
  vec4,
  Fn,
  If,
  instancedBufferAttribute,
  mix,
  normalize,
  length,
  abs,
  floor,
  max,
  min,
  step,
  dot,
  exp,
  cos,
  sin,
  uv,
} from "three/tsl";
import { PointsNodeMaterial } from "three/webgpu";

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

// ─── TSL Simplex Noise ───────────────────────────────────────
// Port of Ashima/webgl-noise simplex3D to TSL

const mod289_3 = Fn(([x]: [any]) => {
  return x.sub(floor(x.mul(1.0 / 289.0)).mul(289.0));
});

const mod289_4 = Fn(([x]: [any]) => {
  return x.sub(floor(x.mul(1.0 / 289.0)).mul(289.0));
});

const permute = Fn(([x]: [any]) => {
  return mod289_4(x.mul(34.0).add(10.0).mul(x));
});

const taylorInvSqrt = Fn(([r]: [any]) => {
  return float(1.79284291400159).sub(r.mul(0.85373472095314));
});

const snoise = Fn(([v]: [any]) => {
  const C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const D = vec4(0.0, 0.5, 1.0, 2.0);

  const i = floor(v.add(dot(v, vec3(C.y, C.y, C.y)))).toVar();
  const x0 = v.sub(i).add(dot(i, vec3(C.x, C.x, C.x))).toVar();

  const g = step(x0.yzx, x0.xyz);
  const l = float(1.0).sub(g);
  const i1 = min(g.xyz, l.zxy);
  const i2 = max(g.xyz, l.zxy);

  const x1 = x0.sub(i1).add(C.x);
  const x2 = x0.sub(i2).add(C.y);
  const x3 = x0.sub(D.y);

  i.assign(mod289_3(i));
  const p = permute(permute(permute(
    i.z.add(vec4(0.0, i1.z, i2.z, 1.0)))
    .add(i.y).add(vec4(0.0, i1.y, i2.y, 1.0)))
    .add(i.x).add(vec4(0.0, i1.x, i2.x, 1.0)));

  const n_ = float(0.142857142857);
  const ns = n_.mul(D.wyz).sub(D.xzx);
  const j = p.sub(floor(p.mul(ns.z).mul(ns.z)).mul(49.0));

  const x_ = floor(j.mul(ns.z));
  const y_ = floor(j.sub(x_.mul(7.0)));

  const x = x_.mul(ns.x).add(ns.y);
  const y = y_.mul(ns.x).add(ns.y);
  const h = float(1.0).sub(abs(x)).sub(abs(y));

  const b0 = vec4(x.xy, y.xy);
  const b1 = vec4(x.zw, y.zw);
  const s0 = floor(b0).mul(2.0).add(1.0);
  const s1 = floor(b1).mul(2.0).add(1.0);
  const sh = step(h, vec4(0.0, 0.0, 0.0, 0.0)).negate();

  const a0 = b0.xzyw.add(s0.xzyw.mul(sh.xxyy));
  const a1 = b1.xzyw.add(s1.xzyw.mul(sh.zzww));

  const p0 = vec3(a0.xy, h.x);
  const p1 = vec3(a0.zw, h.y);
  const p2 = vec3(a1.xy, h.z);
  const p3 = vec3(a1.zw, h.w);

  const norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  const p0n = p0.mul(norm.x);
  const p1n = p1.mul(norm.y);
  const p2n = p2.mul(norm.z);
  const p3n = p3.mul(norm.w);

  const m = max(float(0.6).sub(vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3))), 0.0).toVar();
  m.assign(m.mul(m));

  return float(42.0).mul(dot(m.mul(m), vec4(dot(p0n, x0), dot(p1n, x1), dot(p2n, x2), dot(p3n, x3))));
});

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
        pos.x.addAssign(snoise(noisePos).mul(0.3));
        pos.y.addAssign(snoise(noisePos.add(100.0)).mul(0.3));
        pos.z.addAssign(snoise(noisePos.add(200.0)).mul(0.15));

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
          snoise(pos.mul(2.0).add(uTime.mul(0.1))).mul(0.5).add(0.5)
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
