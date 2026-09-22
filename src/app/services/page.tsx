import type { Metadata } from "next";
import { Check, Clock, RefreshCw, Sparkles, X } from "lucide-react";
import { Atmosphere } from "@/components/atmosphere";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { BondViewer } from "@/components/bond-viewer";
import { PriceCalculator } from "@/components/price-estimator";
import { Reveal } from "@/components/reveal";
import {
  AnnieHeading,
  AnnieLink,
  AnnieSection,
} from "@/components/ui";
import { HAIR_TYPE_LABELS, METHODS } from "@/lib/methods";
import type { HairType } from "@/lib/methods";
import {
  formatDurationRange,
  formatGbp,
  quantityLabel,
  unitRateLabel,
} from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Services & prices",
  description:
    "La weave, nano rings, micro rings, mini-tip and tape hair extensions in Manchester. How each method works, who it suits, how long it takes, and the studio's own prices in full — a full head from £45.",
};

const HAIR_TYPES: readonly HairType[] = ["fine", "medium", "thick", "textured"];

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
      />

      <section className="relative isolate overflow-hidden">
        <Atmosphere />
        <div className="container-page relative py-20 md:py-28">
          <AnnieHeading
            as="h1"
            label="Services"
            title="Five methods, and the truth about each one"
            lede="What the fitting involves, whose hair it suits, how often you will be back, and exactly what it costs — the studio's own prices, in full."
          />
          <Reveal delay={140}>
            <div className="mt-10 flex flex-wrap gap-4">
              <AnnieLink href="/hair-match" arrow>
                Find my method
              </AnnieLink>
              <AnnieLink href="#prices" tone="outline">
                See the prices
              </AnnieLink>
            </div>
          </Reveal>
        </div>
      </section>

      <AnnieSection tone="subtle" id="compare">
        <AnnieHeading
          label="Side by side"
          title="The whole range on one page"
          lede="Scroll the table sideways on a phone — every column is here rather than hidden behind a tab."
        />

        <Reveal delay={100}>
          <div
            className="mt-12 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            tabIndex={0}
            role="region"
            aria-label="Comparison of every hair extension method, scrollable sideways"
          >
            <table className="w-full min-w-[54rem] border-collapse text-sm">
              <caption className="sr-only">
                Comparison of the five hair extension methods by hair type,
                fitting time, maintenance interval and how long the hair lasts
              </caption>
              <thead>
                <tr className="border-b border-[var(--gold-hairline)]">
                  <th scope="col" className="annie-label py-4 pr-4 text-left">
                    Method
                  </th>
                  {HAIR_TYPES.map((type) => (
                    <th
                      key={type}
                      scope="col"
                      className="annie-label px-3 py-4 text-center"
                    >
                      {HAIR_TYPE_LABELS[type]}
                    </th>
                  ))}
                  <th scope="col" className="annie-label px-3 py-4 text-right">
                    Fitting
                  </th>
                  <th scope="col" className="annie-label px-3 py-4 text-right">
                    Move-ups
                  </th>
                  <th scope="col" className="annie-label px-3 py-4 text-right">
                    Hair lasts
                  </th>
                  <th scope="col" className="annie-label py-4 pl-3 text-right">
                    Full head
                  </th>
                </tr>
              </thead>
              <tbody>
                {METHODS.map((method) => (
                  <tr key={method.id} className="border-b border-border">
                    <th scope="row" className="py-5 pr-4 text-left font-normal">
                      <a
                        href={`#${method.id}`}
                        className="text-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {method.name}
                      </a>
                    </th>
                    {HAIR_TYPES.map((type) => {
                      const suited = method.suits.includes(type);
                      const avoided = method.avoid.includes(type);
                      return (
                        <td key={type} className="px-3 py-5 text-center">
                          {/* An icon plus a text label — never colour alone. */}
                          {suited ? (
                            <span className="inline-flex flex-col items-center gap-1 text-success">
                              <Check aria-hidden="true" className="size-4" />
                              <span className="text-[0.65rem]">Ideal</span>
                            </span>
                          ) : avoided ? (
                            <span className="inline-flex flex-col items-center gap-1 text-destructive">
                              <X aria-hidden="true" className="size-4" />
                              <span className="text-[0.65rem]">Not suited</span>
                            </span>
                          ) : (
                            <span className="inline-flex flex-col items-center gap-1 text-muted-foreground">
                              <span aria-hidden="true" className="text-base leading-4">
                                &ndash;
                              </span>
                              <span className="text-[0.65rem]">Possible</span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="font-technical px-3 py-5 text-right text-muted-foreground">
                      {formatDurationRange(method.fitMinutes)}
                    </td>
                    <td className="font-technical px-3 py-5 text-right text-muted-foreground">
                      {method.maintenanceWeeks[0]}&ndash;{method.maintenanceWeeks[1]} wks
                    </td>
                    <td className="font-technical px-3 py-5 text-right text-muted-foreground">
                      {method.hairLifeMonths[0]}&ndash;{method.hairLifeMonths[1]} mths
                    </td>
                    <td className="font-technical py-5 pl-3 text-right whitespace-nowrap text-primary">
                      {formatGbp(method.price.fullHead)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </AnnieSection>

      <AnnieSection>
        <div className="space-y-24">
          {METHODS.map((method, i) => (
            <article
              key={method.id}
              id={method.id}
              className="scroll-mt-28 border-t border-[var(--gold-hairline)] pt-12"
            >
              <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div>
                  <Reveal>
                    <p className="annie-label">
                      {String(i + 1).padStart(2, "0")} &middot;{" "}
                      {unitRateLabel(method)}
                    </p>
                    <h2 className="mt-4 font-display text-[2rem] leading-tight md:text-[2.75rem]">
                      {method.name}
                    </h2>
                    <p className="mt-5 max-w-[58ch] text-pretty text-lg leading-relaxed text-muted-foreground">
                      {method.summary}
                    </p>
                    <p className="mt-5 max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
                      {method.how}
                    </p>
                  </Reveal>

                  <Reveal delay={90}>
                    <dl className="mt-9 grid gap-5 sm:grid-cols-3">
                      <Spec
                        icon={Clock}
                        term="Chair time"
                        value={formatDurationRange(method.fitMinutes)}
                      />
                      <Spec
                        icon={RefreshCw}
                        term="Back in every"
                        value={`${method.maintenanceWeeks[0]}–${method.maintenanceWeeks[1]} weeks`}
                      />
                      <Spec
                        icon={Sparkles}
                        term="Full head"
                        value={`${quantityLabel(method, method.price.fullHeadQty)} · ${formatGbp(method.price.fullHead)}`}
                      />
                    </dl>
                  </Reveal>

                  <Reveal delay={150}>
                    <div className="mt-9 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-success/30 bg-success-soft/40 p-5">
                        <p className="annie-label text-success">Best for</p>
                        <p className="mt-2 text-sm leading-relaxed text-foreground">
                          {method.bestFor}
                        </p>
                      </div>
                      <div className="rounded-xl border border-warning/30 bg-warning-soft/40 p-5">
                        <p className="annie-label text-warning">Worth knowing</p>
                        <p className="mt-2 text-sm leading-relaxed text-foreground">
                          {method.watchOut}
                        </p>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={200}>
                    <ul className="mt-8 flex flex-wrap gap-2.5">
                      <Tag ok={!method.usesHeat}>
                        {method.usesHeat ? "Uses heat" : "No heat"}
                      </Tag>
                      <Tag ok={!method.usesGlue}>
                        {method.usesGlue ? "Medical-grade adhesive" : "No adhesive"}
                      </Tag>
                      <Tag ok>Discretion {method.discretion}/5</Tag>
                      <Tag ok>Resilience {method.resilience}/5</Tag>
                      <Tag ok>Gentleness {method.gentleness}/5</Tag>
                    </ul>
                  </Reveal>

                  <Reveal delay={250}>
                    <div className="mt-9 flex flex-wrap gap-4">
                      <AnnieLink href={`/book?method=${method.id}`} arrow>
                        Enquire about {method.name}
                      </AnnieLink>
                    </div>
                  </Reveal>
                </div>

                {/* A drawn bond rather than a photo slot: the macro
                    shot this needs does not exist, and the illustration
                    explains the mechanism better than a still would. */}
                <Reveal direction="zoom" delay={120}>
                  <BondViewer initialMethod={method.id} />
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </AnnieSection>

      <AnnieSection tone="subtle" id="prices">
        <AnnieHeading
          label="What it costs"
          title="What it costs"
          lede="Straight off the studio's own price list. Pick a method and how much you want fitted."
        />
        <Reveal delay={120}>
          <div className="mt-12">
            <PriceCalculator />
          </div>
        </Reveal>
      </AnnieSection>
    </>
  );
}

function Spec({
  icon: Icon,
  term,
  value,
}: {
  icon: typeof Clock;
  term: string;
  value: string;
}) {
  return (
    <div>
      <dt className="annie-label flex items-center gap-2">
        <Icon aria-hidden="true" className="size-3.5" />
        {term}
      </dt>
      <dd className="font-technical mt-2 text-foreground">{value}</dd>
    </div>
  );
}

function Tag({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li
      className={
        ok
          ? "rounded-full border border-[var(--gold-hairline)] bg-primary-soft/30 px-3.5 py-1.5 text-xs text-foreground"
          : "rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground"
      }
    >
      {children}
    </li>
  );
}
