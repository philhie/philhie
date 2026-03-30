import { describe, it, expect } from "vitest";
import {
  easeInCubic,
  easeOutQuad,
  easeOutExpo,
  createRng,
  getTimeOfDayColor,
} from "../app/components/ParticleField";
import * as THREE from "three";

describe("easeInCubic", () => {
  it("returns 0 at t=0", () => {
    expect(easeInCubic(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeInCubic(1)).toBe(1);
  });

  it("is below linear at t=0.5", () => {
    expect(easeInCubic(0.5)).toBe(0.125);
    expect(easeInCubic(0.5)).toBeLessThan(0.5);
  });

  it("accelerates (later values grow faster)", () => {
    const a = easeInCubic(0.3) - easeInCubic(0.2);
    const b = easeInCubic(0.9) - easeInCubic(0.8);
    expect(b).toBeGreaterThan(a);
  });
});

describe("easeOutQuad", () => {
  it("returns 0 at t=0", () => {
    expect(easeOutQuad(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeOutQuad(1)).toBe(1);
  });

  it("is above linear at t=0.5", () => {
    expect(easeOutQuad(0.5)).toBe(0.75);
    expect(easeOutQuad(0.5)).toBeGreaterThan(0.5);
  });

  it("decelerates (later values grow slower)", () => {
    const a = easeOutQuad(0.3) - easeOutQuad(0.2);
    const b = easeOutQuad(0.9) - easeOutQuad(0.8);
    expect(a).toBeGreaterThan(b);
  });
});

describe("easeOutExpo", () => {
  it("returns near 0 at t=0", () => {
    // easeOutExpo(0) = 1 - 2^0 = 0
    expect(easeOutExpo(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeOutExpo(1)).toBe(1);
  });

  it("fast initial rise", () => {
    expect(easeOutExpo(0.3)).toBeGreaterThan(0.8);
  });
});

describe("createRng", () => {
  it("produces deterministic values for the same seed", () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const values1 = Array.from({ length: 10 }, rng1);
    const values2 = Array.from({ length: 10 }, rng2);
    expect(values1).toEqual(values2);
  });

  it("produces different values for different seeds", () => {
    const rng1 = createRng(42);
    const rng2 = createRng(137);
    expect(rng1()).not.toBe(rng2());
  });

  it("produces values in [0, 1)", () => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("getTimeOfDayColor", () => {
  it("returns a THREE.Color", () => {
    const color = getTimeOfDayColor();
    expect(color).toBeInstanceOf(THREE.Color);
  });
});
