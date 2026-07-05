import { PersonJsonLd } from "./_seo/PersonJsonLd";
import { Masthead } from "./_home/Masthead";
import { IndexLedger } from "./_home/IndexLedger";
import { Colophon } from "./_home/Colophon";
import { SoundToggle } from "./_audio/SoundToggle";
import { ThemeToggle } from "@/components/theme-toggle";

// The masthead shows San Francisco local time — computed fresh at request time.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <PersonJsonLd />

      <ThemeToggle className="fixed right-[clamp(1rem,4vw,2.5rem)] top-[clamp(1rem,3vh,1.75rem)] z-50" />

      <main className="mx-auto max-w-[88rem] px-[clamp(1.5rem,5vw,5rem)]">
        <Masthead />
        <IndexLedger />
      </main>

      <Colophon />

      <SoundToggle className="fixed bottom-[clamp(1.25rem,4vh,2.5rem)] right-[clamp(1.25rem,4vw,3rem)] z-50" />
    </>
  );
}
