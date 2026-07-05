import { POSITIONING, SOCIALS } from "../_lib/site";
import { INDEX } from "../_home/index-data";

/**
 * Agent-readable layer ("MX"). A Person graph so crawlers and AI agents parse
 * the record cleanly — the emerging frontier almost no personal site ships.
 * Server-only; always in the initial HTML.
 */
export function PersonJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Phil Hie",
    url: "https://philhie.com",
    jobTitle: "Founder",
    description: POSITIONING,
    knowsAbout: ["Artificial intelligence", "Startups", "Finance", "Product"],
    alumniOf: [{ "@type": "Organization", name: "Goldman Sachs" }],
    worksFor: { "@type": "Organization", name: "Stealth" },
    hasOccupation: INDEX.map((e) => ({
      "@type": "Occupation",
      name: `${e.role}, ${e.company}`,
    })),
    sameAs: [SOCIALS.github, SOCIALS.linkedin, SOCIALS.x],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
