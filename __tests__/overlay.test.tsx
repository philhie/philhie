import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Overlay from "../app/components/Overlay";

describe("Overlay", () => {
  it("renders name, tagline, and links", () => {
    render(<Overlay visible={true} />);
    expect(screen.getByText("Phil Hie")).toBeInTheDocument();
    expect(screen.getByText("Just doing things.")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("has opacity-100 when visible", () => {
    const { container } = render(<Overlay visible={true} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain("opacity-100");
  });

  it("has opacity-0 when not visible", () => {
    const { container } = render(<Overlay visible={false} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain("opacity-0");
  });

  it("links open in new tab", () => {
    render(<Overlay visible={true} />);
    const github = screen.getByText("GitHub").closest("a");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links have focus-visible class", () => {
    render(<Overlay visible={true} />);
    const github = screen.getByText("GitHub").closest("a");
    expect(github?.className).toContain("focus-visible:outline");
  });
});
