import { PersonJsonLd } from "./_seo/PersonJsonLd";
import { Masthead } from "./_home/Masthead";
import { IndexLedger } from "./_home/IndexLedger";
import { Colophon } from "./_home/Colophon";

export default function Home() {
  return (
    <>
      <PersonJsonLd />

      <main className="mx-auto max-w-[88rem] px-[var(--gutter-x)]">
        <Masthead />
        <IndexLedger />
      </main>

      <Colophon />
    </>
  );
}
