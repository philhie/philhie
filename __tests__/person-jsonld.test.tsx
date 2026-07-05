import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PersonJsonLd } from "@/app/_seo/PersonJsonLd";

describe("PersonJsonLd", () => {
  it("emits a valid schema.org Person graph", () => {
    const { container } = render(<PersonJsonLd />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).toBeTruthy();

    const data = JSON.parse(script?.textContent ?? "{}");
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Phil Hie");
    expect(data.jobTitle).toBe("Founder");
    expect(JSON.stringify(data.alumniOf)).toContain("Goldman Sachs");
    expect(Array.isArray(data.sameAs)).toBe(true);
    expect(data.sameAs).toHaveLength(3);
    expect(data.sameAs.join(" ")).toContain("github.com/philhie");
  });
});
