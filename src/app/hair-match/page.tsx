import type { Metadata } from "next";
import { Atmosphere } from "@/components/atmosphere";
import { HairMatch } from "@/components/hair-match";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { AnnieHeading, AnnieSection } from "@/components/ui";

export const metadata: Metadata = {
  title: "Find my hair extension method",
  description:
    "Seven questions about your hair, your lifestyle and your budget. The match finder scores LA weave, nano rings, micro rings, mini-tip and tape hair extensions against your answers — and says which ones are wrong for you.",
};

export default function HairMatchPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Hair match", path: "/hair-match" },
        ]}
      />

      <section className="relative isolate overflow-hidden">
        <Atmosphere />
        <div className="container-page relative py-20 md:py-24">
          <AnnieHeading
            as="h1"
            label="Match finder"
            title="Which method is right for your hair?"
            lede="Seven questions, about a minute. It scores all five methods against your answers and explains every result — including the ones it rules out."
          />
        </div>
      </section>

      <AnnieSection className="pt-0">
        <div className="mx-auto max-w-4xl">
          <HairMatch />
        </div>
      </AnnieSection>

      <AnnieSection tone="subtle" className="py-16">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="annie-label">A word on what this is</p>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              The finder weighs hair type and density hardest, then your
              goal, how often you can come in, how hard your hair works and
              your budget. It is genuinely useful for narrowing things down,
              and it is genuinely no substitute for Annie putting her hands
              in your hair for twenty minutes. Nothing here is a quote.
            </p>
          </div>
        </Reveal>
      </AnnieSection>
    </>
  );
}
