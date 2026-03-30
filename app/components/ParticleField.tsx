"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Inline GLSL ─────────────────────────────────────────────

const vertexShader = /* glsl */ `
  // Simplex noise (Ashima/webgl-noise)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  uniform float uTime;
  uniform float uPhase; // 0=void, 1=bloom, 2=peak, 3=aftermath
  uniform vec2 uCursor;
  uniform float uCursorInfluence;
  uniform float uKonami; // 0 or 1
  uniform float uKonamiProgress; // 0..1 lerp to targets

  attribute vec3 aBasePosition;
  attribute float aSpeed;
  attribute float aSize;
  attribute vec3 aKonamiTarget;

  varying float vAlpha;
  varying float vSize;

  void main() {
    vec3 pos = aBasePosition;

    // Phase-based motion
    if (uPhase < 1.0) {
      // Phase 0: Void - particles far out, invisible
      pos *= 8.0;
      vAlpha = 0.0;
    } else if (uPhase < 2.0) {
      // Phase 1: Bloom - coalesce inward (ease-in-cubic baked into uPhase)
      float t = uPhase - 1.0;
      float radius = mix(8.0, 1.0, t);
      pos = normalize(pos) * radius;
      // Spiral motion
      float angle = uTime * aSpeed * 0.5 + length(pos);
      pos.xz += vec2(cos(angle), sin(angle)) * 0.3 * (1.0 - t);
      vAlpha = t * 0.4;
    } else if (uPhase < 3.0) {
      // Phase 2: Peak - bright, tight
      float t = uPhase - 2.0;
      pos = normalize(pos) * mix(1.0, 0.5, t);
      vAlpha = mix(0.4, 0.6, t);
    } else {
      // Phase 3: Aftermath - disperse + drift
      float disperseT = min((uPhase - 3.0) * 0.5, 1.0);
      float baseRadius = mix(0.5, 2.5, disperseT);
      pos = normalize(pos) * baseRadius;

      // Simplex noise drift
      vec3 noisePos = pos * 0.5 + uTime * 0.05 * aSpeed;
      pos.x += snoise(noisePos) * 0.3;
      pos.y += snoise(noisePos + 100.0) * 0.3;
      pos.z += snoise(noisePos + 200.0) * 0.15;

      // Cursor displacement
      if (uCursorInfluence > 0.01) {
        vec2 diff = pos.xy - uCursor;
        float dist = length(diff);
        float push = uCursorInfluence * 0.5 / (dist * dist + 0.5);
        pos.xy += normalize(diff) * push;
      }

      // Konami mode: lerp to target positions
      if (uKonami > 0.5) {
        pos = mix(pos, aKonamiTarget, uKonamiProgress);
      }

      vAlpha = mix(0.15, 0.35, snoise(pos * 2.0 + uTime * 0.1) * 0.5 + 0.5);
    }

    vSize = aSize;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;

  varying float vAlpha;
  varying float vSize;

  void main() {
    // Soft circle SDF with Gaussian falloff
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = exp(-dist * dist * 8.0) * vAlpha;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

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
// UPDATE WHEN CAREER CHANGES
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
    return new THREE.Color(0xfef3c7); // amber-100
  } else if (hour >= 20 || hour <= 4) {
    return new THREE.Color(0xdbeafe); // blue-100
  }
  return new THREE.Color(0xffffff); // white
}

// ─── Component ───────────────────────────────────────────────

export default function ParticleField({
  count,
  isReturning,
}: {
  count: number;
  isReturning: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
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

  // Entrance duration based on returning visitor
  const entranceDuration = isReturning ? 1.5 : 4.0;
  const phaseScale = 4.0 / entranceDuration;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
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

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aBasePosition", new THREE.BufferAttribute(positions.slice(), 3));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aKonamiTarget", new THREE.BufferAttribute(konamiTargets, 3));

    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uCursor: { value: new THREE.Vector2(0, 0) },
      uCursorInfluence: { value: 0 },
      uColor: { value: getTimeOfDayColor() },
      uKonami: { value: 0 },
      uKonamiProgress: { value: 0 },
    }),
    []
  );

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
    if (!materialRef.current) return;

    const u = materialRef.current.uniforms;
    u.uTime.value += delta;
    const elapsed = u.uTime.value;

    // Phase transitions with easing
    if (elapsed < 0.8 * (1 / phaseScale)) {
      u.uPhase.value = 0;
    } else if (elapsed < 2.5 * (1 / phaseScale)) {
      const t = (elapsed - 0.8 / phaseScale) / (1.7 / phaseScale);
      u.uPhase.value = 1 + easeInCubic(Math.min(t, 1));
    } else if (elapsed < 4.0 * (1 / phaseScale)) {
      const t = (elapsed - 2.5 / phaseScale) / (1.5 / phaseScale);
      u.uPhase.value = 2 + easeOutQuad(Math.min(t, 1));
    } else {
      const t = (elapsed - 4.0 / phaseScale) / 2.0;
      u.uPhase.value = 3 + easeOutExpo(Math.min(t, 1));
    }

    // Cursor lerp (0.15s lag)
    const lerpFactor = 1 - Math.pow(0.001, delta);
    cursorCurrent.current.lerp(cursorTarget.current, lerpFactor);
    u.uCursor.value.copy(cursorCurrent.current);

    // Cursor influence decay
    const targetInfluence = cursorInfluence.current;
    u.uCursorInfluence.value += (targetInfluence - u.uCursorInfluence.value) * lerpFactor;

    // Ripple decay
    if (rippleStrength.current > 0) {
      u.uCursorInfluence.value += rippleStrength.current;
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
      u.uKonami.value = 1;
      u.uKonamiProgress.value = konamiProgress.current;
    } else {
      u.uKonami.value = 0;
      u.uKonamiProgress.value = 0;
    }

    // Idle detection: freeze after 10s
    if (u.uPhase.value >= 3) {
      idleTimer.current += delta;
      if (idleTimer.current > 10 && !isFrozen.current) {
        isFrozen.current = true;
      }
    }

    // Don't stop the render loop during entrance
    if (!isFrozen.current) {
      invalidate();
    }
  });

  // Expose konami trigger
  useEffect(() => {
    const handler = () => {
      if (uniforms.uPhase.value < 3) return;
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
  }, [uniforms, invalidate]);

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
