"use client";

/**
 * Signature audio — synthesized live in the browser, no audio files.
 *
 * An original, instrumental, minor-key trap motif (melody + sub-bass + drums)
 * tuned to the dark, cinematic mood Phil chose. Two treatments to compare:
 *   "motif"     — sparse, recognizable hook looped (the "wait, is that…?" hit)
 *   "cinematic" — full arrangement: adds pads, counter-melody, drum fills
 *
 * Opt-in and lazily constructed on first gesture (AudioContext policy).
 */

export type Treatment = "motif" | "cinematic";

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Dark loop in C# minor: i – VI – VII – iv, one chord per bar (8 steps each).
// Bass roots (low octave) and a minor-pentatonic melody phrase per bar.
const BARS = [
  { root: 37, mel: [49, 52, 56, 52], steps: [0, 3, 6, 10] }, // C#m
  { root: 33, mel: [45, 48, 52, 48], steps: [0, 4, 8, 12] }, // A
  { root: 35, mel: [47, 51, 54, 47], steps: [0, 3, 7, 11] }, // B
  { root: 42, mel: [54, 57, 49, 54], steps: [0, 5, 9, 13] }, // F#m
];

const KICK_STEPS = [0, 6, 10, 16, 22, 26];
const SNARE_STEPS = [8, 24];
const STEPS_PER_BAR = 16;
const TOTAL_STEPS = BARS.length * STEPS_PER_BAR; // 64
const BPM = 72; // halftime feel
const STEP = 60 / BPM / 4; // 16th-note grid

export class SignatureAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private verb: ConvolverNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private step = 0;
  private _treatment: Treatment = "motif";
  private _running = false;

  get running() {
    return this._running;
  }
  get treatment() {
    return this._treatment;
  }

  private ensure() {
    if (this.ctx) return;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);

    // Generated impulse response → cheap, spacious reverb.
    const verb = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 2.4);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
      }
    }
    verb.buffer = buf;
    const verbGain = ctx.createGain();
    verbGain.gain.value = 0.32;
    verb.connect(verbGain).connect(master);

    this.ctx = ctx;
    this.master = master;
    this.verb = verb;
  }

  async start(treatment: Treatment = this._treatment) {
    this.ensure();
    this._treatment = treatment;
    if (!this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this._running = true;
    // Gentle fade-in.
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.5, now + 1.5);
    if (!this.timer) {
      this.nextStepTime = now + 0.05;
      this.step = 0;
      this.timer = setInterval(() => this.schedule(), 25);
    }
  }

  setTreatment(t: Treatment) {
    this._treatment = t;
  }

  stop() {
    this._running = false;
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  dispose() {
    this.stop();
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }

  // Lookahead scheduler: queue any steps falling in the next 100ms.
  private schedule() {
    if (!this.ctx) return;
    while (this.nextStepTime < this.ctx.currentTime + 0.1) {
      this.playStep(this.step % TOTAL_STEPS, this.nextStepTime);
      this.nextStepTime += STEP;
      this.step++;
    }
  }

  private playStep(s: number, time: number) {
    const cinematic = this._treatment === "cinematic";
    const bar = Math.floor(s / STEPS_PER_BAR) % BARS.length;
    const local = s % STEPS_PER_BAR;
    const { root, mel, steps } = BARS[bar];

    // Sub-bass on the downbeat of each bar (and mid-bar in cinematic).
    if (local === 0) this.bass(mtof(root), time, 1.4);
    else if (cinematic && local === 8) this.bass(mtof(root + 12), time, 0.7);

    // Melody motif — the recognizable hook.
    const mi = steps.indexOf(local);
    if (mi >= 0) {
      this.bell(mtof(mel[mi]), time, cinematic ? 0.5 : 0.42);
      if (cinematic) this.bell(mtof(mel[mi] + 7), time + 0.06, 0.18); // a fifth shimmer
    }

    // Pad bed (cinematic only) — held minor chord per bar.
    if (cinematic && local === 0) {
      this.pad([root + 12, root + 15, root + 19], time, STEP * STEPS_PER_BAR);
    }

    // Drums.
    if (KICK_STEPS.includes(local)) this.kick(time);
    if (SNARE_STEPS.includes(local)) this.snare(time);
    // Hats: straight 8ths, accented offbeats; busier fills in cinematic.
    if (local % 2 === 0 || (cinematic && local % 2 === 1 && local > 12)) {
      this.hat(time, local % 4 === 2 ? 0.18 : 0.09);
    }
  }

  /* --------------------------- instruments --------------------------- */

  private bell(freq: number, time: number, gain: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o.type = "triangle";
    o2.type = "sine";
    o.frequency.value = freq;
    o2.frequency.value = freq * 2.001;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);
    o.connect(g);
    o2.connect(g);
    g.connect(this.master!);
    g.connect(this.verb!);
    o.start(time);
    o2.start(time);
    o.stop(time + 1.2);
    o2.stop(time + 1.2);
  }

  private bass(freq: number, time: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq * 2, time);
    o.frequency.exponentialRampToValueAtTime(freq, time + 0.08); // 808 pitch drop
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.9, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g).connect(this.master!);
    o.start(time);
    o.stop(time + dur + 0.05);
  }

  private pad(midis: number[], time: number, dur: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.06, time + 0.8);
    g.gain.linearRampToValueAtTime(0.0001, time + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    g.connect(lp).connect(this.verb!);
    for (const m of midis) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = mtof(m);
      o.detune.value = (Math.random() - 0.5) * 12;
      o.connect(g);
      o.start(time);
      o.stop(time + dur + 0.1);
    }
  }

  private kick(time: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(150, time);
    o.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    o.connect(g).connect(this.master!);
    o.start(time);
    o.stop(time + 0.32);
  }

  private noiseBurst(time: number, dur: number, gain: number, hp: number) {
    const ctx = this.ctx!;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(time);
    src.stop(time + dur);
  }

  private hat(time: number, gain: number) {
    this.noiseBurst(time, 0.04, gain, 7000);
  }

  private snare(time: number) {
    this.noiseBurst(time, 0.18, 0.35, 1800);
    this.kick(time); // body under the snare
  }
}
