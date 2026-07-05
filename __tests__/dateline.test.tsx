import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Dateline } from "@/app/_home/Dateline";

describe("Dateline", () => {
  it("renders the name, the pinned place, and a local time", () => {
    const { container } = render(
      <Dateline
        place="San Francisco"
        timezone="America/Los_Angeles"
        initialTime="14:22"
      />,
    );
    const t = container.textContent ?? "";
    expect(t).toContain("Phil Hie");
    expect(t).toContain("San Francisco");
    expect(t.toLowerCase()).toContain("local");
    // The immediate client tick replaces initialTime with the real SF time,
    // so assert the HH:MM shape rather than the seed value.
    expect(t).toMatch(/\d{2}:\d{2}/);
  });

  it("does not throw", () => {
    expect(() =>
      render(
        <Dateline
          place="San Francisco"
          timezone="America/Los_Angeles"
          initialTime="09:00"
        />,
      ),
    ).not.toThrow();
  });
});
