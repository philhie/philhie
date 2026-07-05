import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { IndexLedger } from "@/app/_home/IndexLedger";
import { INDEX } from "@/app/_home/index-data";

describe("IndexLedger", () => {
  it("renders all five entries — role, company, year, and receipt all present in the DOM (a11y + agent-readable, before any hover)", () => {
    const { container } = render(<IndexLedger />);
    const text = container.textContent ?? "";
    for (const e of INDEX) {
      expect(text).toContain(e.role);
      expect(text).toContain(e.company);
      expect(text).toContain(e.year);
      expect(text).toContain(e.receipt);
    }
    expect(screen.getAllByRole("button")).toHaveLength(INDEX.length);
  });

  it("toggles aria-expanded on the tapped row", () => {
    render(<IndexLedger />);
    const rows = screen.getAllByRole("button");
    expect(rows[0]).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(rows[0]);
    expect(rows[0]).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(rows[0]);
    expect(rows[0]).toHaveAttribute("aria-expanded", "false");
  });
});
