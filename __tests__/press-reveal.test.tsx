import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PressReveal } from "@/app/_home/PressReveal";

const PROPS = {
  place: "San Francisco",
  timezone: "America/Los_Angeles",
  initialTime: "14:22",
};

describe("PressReveal", () => {
  it("renders the name (LCP), the 'Building' link to the sealed page, and the adaptive dateline as real DOM", () => {
    const { container } = render(<PressReveal {...PROPS} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Phil Hie");
    // LCP text is present and NOT inline-hidden (entrance is CSS-only, never opacity:0 inline).
    expect(h1.style.opacity).toBe("");

    const building = screen.getByRole("link", { name: /building/i });
    expect(building).toHaveAttribute("href", "/stealth");
    expect(container.textContent).toContain("San Francisco");
  });

  it("puts the follow links in the hero", () => {
    render(<PressReveal {...PROPS} />);
    expect(
      screen.getByRole("link", { name: "X" }).getAttribute("href"),
    ).toContain("x.com/philhie");
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
  });
});
