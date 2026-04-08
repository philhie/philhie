import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SoundToggle from "../app/components/SoundToggle";

describe("SoundToggle", () => {
  it("renders 'listen' button when not enabled", () => {
    render(<SoundToggle enabled={false} onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: /enable sound/i })).toBeInTheDocument();
    expect(screen.getByText("listen")).toBeInTheDocument();
  });

  it("renders 'listening' button when enabled", () => {
    render(<SoundToggle enabled={true} onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: /disable sound/i })).toBeInTheDocument();
    expect(screen.getByText("listening")).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(<SoundToggle enabled={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByText("listen"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("has focus-visible outline class", () => {
    render(<SoundToggle enabled={false} onToggle={() => {}} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("focus-visible:outline");
  });
});
