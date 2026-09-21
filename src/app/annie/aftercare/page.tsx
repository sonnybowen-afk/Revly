import type { Metadata } from "next";
import { Droplets, Moon, ShieldAlert, Waves, Wind } from "lucide-react";
import { Atmosphere } from "@/components/annie/atmosphere";
import { Faq, FaqJsonLd } from "@/components/annie/faq";
import { BreadcrumbJsonLd } from "@/components/annie/json-ld";
import { Reveal } from "@/components/annie/reveal";
import {
  AnnieHeading,
  AnnieLink,
  AnnieSection,
} from "@/components/annie/ui";
import { METHODS } from "@/lib/annie-methods";
import { SALON } from "@/lib/annie-salon";

export const metadata: Metadata = {
  title: "Aftercare",
  description:
    "How to wash, dry, brush and sleep in hair extensions so a set lasts a year or more. Aftercare from Annie's Secret Hair Extension, Manchester.",
};

const RULES = [
  {
    icon: Droplets,
    title: "Washing",
    lede: "Twice a week, three at the very most.",
    points: [
      "Sulphate-free shampoo, and keep it away from the bonds themselves.",
      "Conditioner from the mid-lengths down only — never at the root.",
      "Support the weight of the hair in one hand while you wash the other.",
      "Rinse until the water runs completely clear. Residue at the root is what loosens a bond.",
    ],
  },
  {
    icon: Wind,
    title: "Drying",
    lede: "Never go to bed on wet hair. This is the big one.",
    points: [
      "Squeeze out with a towel. Do not rub, and do not twist it up.",
      "Rough-dry the roots and the bonds fully on a cool setting before anything else.",
      "Damp bonds slip and matt. Dry bonds do neither.",
    ],
  },
  {
    icon: Waves,
    title: "Brushing",
    lede: "Twice a day, bottom up.",
    points: [
      "Use a proper extension brush with looped bristles.",
      "Start at the ends and work upwards in sections.",
      "Hold the hair above the bonds so you are not dragging on the root.",
      "Before washing and before bed, without fail.",
    ],
  },
  {
    icon: Moon,
    title: "Sleeping",
    lede: "A loose plait saves more sets than anything else on this page.",
    points: [
      "Plait loosely or tie in a low, soft ponytail.",
      "A silk or satin pillowcase halves the friction overnight.",
      "Never sleep on it wet.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "What to keep away",
    lede: "A short list, and it matters.",
    points: [
      "Oil-based and silicone-heavy products near the bonds, especially on tape.",
      "Chlorine and salt water without rinsing straight after and drying properly.",
      "Purple and toning shampoos unless Annie has said yours can take it.",
      "Straighteners directly on a bond. The hair, yes. The bond, never.",
    ],
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "How soon can I wash it after a fitting?",
    a: "Leave it 48 hours. Tape in particular needs that time for the adhesive to cure properly, and rings settle into place over the first couple of days.",
  },
  {
    q: "Can I colour my extensions?",
    a: "Talk to Annie first, always. Good-quality hair can usually be toned darker, but lifting it is a different matter and it is very easy to ruin an expensive set in one go. Never bleach extensions at home.",
  },
  {
    q: "What if a bond slips out?",
    a: `It happens occasionally and it is not a disaster — keep the piece and bring it in. Message ${SALON.phone} and Annie will refit it. What you must not do is try to reattach it yourself.`,
  },
  {
    q: "How do I know when it is time for a move-up?",
    a: `Depends on the method: ${METHODS.map((m) => `${m.name} every ${m.maintenanceWeeks[0]}–${m.maintenanceWeeks[1]} weeks`).join(", ")}. The real tell is feeling the bonds sitting further from your scalp than they did, or finding the brush catching where it used to run through.`,
  },
  {
    q: "Can I go swimming?",
    a: "Yes, with sense. Wet the hair with clean water before you get in so it absorbs less of the pool, tie it up, and rinse and dry it fully afterwards. If you swim several times a week, say so at your consultation — it should change which method you are fitted with.",
  },
  {
    q: "Will I lose more hair than usual?",
    a: "You will see more hair come out at a move-up, and that is normal rather than alarming: everyone sheds around a hundred hairs a day, and with extensions in, the shed hair is held at the bond instead of falling out. It all comes away at once when the bonds are opened.",
  },
] as const;

export default function AftercarePage() {
  return (
    <>
      <FaqJsonLd items={FAQ_ITEMS} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Aftercare", path: "/aftercare" },
        ]}
      />

      <section className="relative isolate overflow-hidden">
        <Atmosphere />
        <div className="container-page relative py-20 md:py-28">
          <AnnieHeading
            as="h1"
            label="Aftercare"
            title="Whether a set lasts a year is mostly down to this page"
            lede="The fitting is a few hours. The next twelve months are yours. None of this is difficult, but all of it matters."
          />
          <Reveal delay={140}>
            <div className="mt-10 flex flex-wrap gap-4">
              <AnnieLink href="/annie/book" arrow>
                Book a move-up
              </AnnieLink>
              <a
                href={`tel:${SALON.phoneE164}`}
                className="font-technical inline-flex min-h-12 items-center rounded-full border border-[var(--gold-hairline)] px-6 text-sm font-semibold transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Ask Annie: {SALON.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <AnnieSection className="pt-0">
        <div className="space-y-6">
          {RULES.map((rule, i) => (
            <Reveal key={rule.title} direction="zoom" delay={(i % 2) * 80}>
              <article className="annie-card p-6 md:p-8">
                <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
                  <div className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
                      <rule.icon aria-hidden="true" className="size-5 text-primary" />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl">{rule.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-primary">
                        {rule.lede}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {rule.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60"
                        />
                        <span className="leading-relaxed text-muted-foreground">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </AnnieSection>

      <AnnieSection tone="subtle">
        <AnnieHeading
          label="Move-ups"
          title="When to come back in"
          lede="Every method loosens as your own hair grows out. Leaving it too long is what causes matting at the root — and matting is what damages hair."
        />
        <Reveal delay={100}>
          <div
            className="mt-12 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            tabIndex={0}
            role="region"
            aria-label="How often each method needs a move-up, scrollable sideways"
          >
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="sr-only">
                How often each method needs a maintenance appointment
              </caption>
              <thead>
                <tr className="border-b border-[var(--gold-hairline)]">
                  <th scope="col" className="annie-label py-4 pr-4 text-left">
                    Method
                  </th>
                  <th scope="col" className="annie-label px-4 py-4 text-right">
                    Move-up every
                  </th>
                  <th scope="col" className="annie-label px-4 py-4 text-right">
                    Hair lasts
                  </th>
                  <th scope="col" className="annie-label py-4 pl-4 text-left">
                    The thing to watch
                  </th>
                </tr>
              </thead>
              <tbody>
                {METHODS.map((method) => (
                  <tr key={method.id} className="border-b border-border">
                    <th scope="row" className="py-5 pr-4 text-left font-normal">
                      {method.name}
                    </th>
                    <td className="font-technical px-4 py-5 text-right text-muted-foreground">
                      {method.maintenanceWeeks[0]}&ndash;{method.maintenanceWeeks[1]} wks
                    </td>
                    <td className="font-technical px-4 py-5 text-right text-muted-foreground">
                      {method.hairLifeMonths[0]}&ndash;{method.hairLifeMonths[1]} mths
                    </td>
                    <td className="max-w-[24rem] py-5 pl-4 leading-relaxed text-muted-foreground">
                      {method.watchOut}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </AnnieSection>

      <AnnieSection>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <AnnieHeading
            label="Questions"
            title="The ones that come up after a fitting"
          />
          <Reveal>
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </AnnieSection>
    </>
  );
}
