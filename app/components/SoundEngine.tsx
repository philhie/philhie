"use client";

import { useEffect, useRef, useCallback } from "react";

function generateImpulseResponse(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 2.5; // 2.5 seconds
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }

  return buffer;
}

export default function SoundEngine({ enabled }: { enabled: boolean }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const pad1Ref = useRef<OscillatorNode | null>(null);
  const pad2Ref = useRef<OscillatorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number>(0);
  const cursorRef = useRef({ x: 0, y: 0 });
  const lastActivityRef = useRef(0);

  const init = useCallback(() => {
    if (ctxRef.current) return;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Reverb
      const reverb = ctx.createConvolver();
      reverb.buffer = generateImpulseResponse(ctx);
      reverb.connect(masterGain);

      // Dry path
      const dryGain = ctx.createGain();
      dryGain.gain.value = 0.3;
      dryGain.connect(masterGain);

      // Wet path gain
      const wetGain = ctx.createGain();
      wetGain.gain.value = 0.7;
      wetGain.connect(reverb);

      // Ambient pad: two detuned oscillators
      const pad1 = ctx.createOscillator();
      pad1.type = "sine";
      pad1.frequency.value = 55; // A1
      pad1.detune.value = -5;

      const pad2 = ctx.createOscillator();
      pad2.type = "sine";
      pad2.frequency.value = 82.5; // E2
      pad2.detune.value = 5;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.15;
      pad1.connect(padGain);
      pad2.connect(padGain);
      padGain.connect(wetGain);
      padGain.connect(dryGain);

      pad1.start();
      pad2.start();
      pad1Ref.current = pad1;
      pad2Ref.current = pad2;

      // Fade in master
      masterGain.gain.setTargetAtTime(0.4, ctx.currentTime, 1.0);
    } catch {
      // AudioContext creation failed
    }
  }, []);

  // Own pointermove listener for cursor modulation
  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      cursorRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
      lastActivityRef.current = Date.now();
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  // Initialize on enable
  useEffect(() => {
    if (enabled) {
      lastActivityRef.current = Date.now();
      init();
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pad1Ref.current) {
        try { pad1Ref.current.stop(); } catch { /* already stopped */ }
        pad1Ref.current = null;
      }
      if (pad2Ref.current) {
        try { pad2Ref.current.stop(); } catch { /* already stopped */ }
        pad2Ref.current = null;
      }
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
        masterGainRef.current = null;
      }
    };
  }, [enabled, init]);

  // rAF loop for cursor modulation + idle detection
  useEffect(() => {
    if (!enabled) return;

    let running = true;

    const tick = () => {
      if (!running) return;

      const ctx = ctxRef.current;
      const pad1 = pad1Ref.current;
      const master = masterGainRef.current;

      if (ctx && pad1 && master) {
        // Cursor modulation
        const { x, y } = cursorRef.current;
        const baseFreq = 55;
        const modulation = (x * 0.5 + y * 0.3) * 5;
        pad1.frequency.setTargetAtTime(baseFreq + modulation, ctx.currentTime, 0.3);

        // Idle detection
        const elapsed = (Date.now() - lastActivityRef.current) / 1000;
        if (elapsed > 10) {
          master.gain.setTargetAtTime(0.05, ctx.currentTime, 2.0);
        } else {
          master.gain.setTargetAtTime(0.4, ctx.currentTime, 0.5);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  return null;
}
