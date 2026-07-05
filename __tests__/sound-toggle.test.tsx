import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SoundToggle } from "@/app/_audio/SoundToggle";

describe("SoundToggle", () => {
  it("renders the resting 'sound on' affordance, unpressed and disabled until the player is ready", () => {
    render(<SoundToggle />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent(/sound on/i);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    // The YouTube API never loads in jsdom, so the control stays disabled.
    expect(btn).toBeDisabled();
  });

  it("forwards positioning classes", () => {
    render(<SoundToggle className="fixed bottom-4" />);
    expect(screen.getByRole("button").className).toContain("fixed");
  });
});
