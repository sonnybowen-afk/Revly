import Link from "next/link";
import {
  Clock,
  Gem,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Atmosphere, StrandField } from "@/components/annie/atmosphere";
import { BeforeAfter } from "@/components/annie/before-after";
import { CountUp } from "@/components/annie/count-up";
import { Faq, FaqJsonLd } from "@/components/annie/faq";
import { Marquee } from "@/components/annie/marquee";
import { Reveal } from "@/components/annie/reveal";
import { Stars } from "@/components/annie/review-wall";
import { OpenBadge } from "@/components/annie/open-badge";
import {
  AnnieHeading,
  AnnieLink,
  AnnieSection,
  PhotoFrame,
  Stat,
} from "@/components/annie/ui";
import { METHODS } from "@/lib/annie-methods";
import { REVIEW_THEMES } from "@/lib/annie-reviews";
import { ADDRESS_ONE_LINE, MAPS_URL, RATING, SALON } from "@/lib/annie-salon";
import { formatDurationRange } from "@/lib/annie-pricing";

const RIBBON = [
  "LA Weave",
  "Nano Rings",
  "Micro Rings",
  "Tape-in Wefts",
  "Sew-in Weave",
  "Russian hair",
  "Colour matched by eye",
  "No glue, no heat",
  "Manchester Arndale Market",
] as const;

const PROCESS = [
  {
    step: "01",
    title: "Consultation",
    time: "20 minutes, free",
    body: "Annie looks at your hair in daylight, checks the density at the root and matches the shade by eye against your ends — not against a colour chart under a shop light.",
  },
  {
    step: "02",
    title: "The method",
    time: "Same appointment",
    body: "Which bond suits your hair, how much hair you actually need, and what it will cost. If a method is wrong for you, she will say so rather than sell it to you.",
  },
  {
    step: "03",
    title: "Fitting",
    time: "45 minutes to 4 hours",
    body: "Sectioned, fitted and blended, then cut in and styled so it leaves the studio finished. Curls, waves or straightened, included.",
  },
  {
    step: "04",
    title: "Moving up",
    time: "Every 6 to 12 weeks",
    body: "As your own hair grows the bonds move down. They get taken out, cleaned and refitted at the root. The hair itself is re-used, often for a year or more.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Will extensions damage my own hair?",
    a: "Not when they are fitted to the right weight and moved up on time. Every method Annie fits uses rings, tape or thread — no heat and no fusion glue touches your own hair. Damage comes from bonds left in too long or a set that is too heavy for the hair carrying it, which is exactly what the consultation is there to prevent.",
  },
  {
    q: "How long does it take?",
    a: "Tape-in wefts can be in within the hour. Nano rings are the long one and can run to four hours for a full head, because every strand is attached individually. Annie gives you the real figure at your consultation rather than an optimistic one.",
  },
  {
    q: "How long will the hair last?",
    a: "With good-quality hair and proper care, most people get nine to eighteen months out of a set, re-using the same hair through several move-ups. Reviewers of the studio regularly mention sets lasting well over a year.",
  },
  {
    q: "Can I go to the gym, or swim?",
    a: "Yes, though the method matters. LA weave and sew-in cope with anything. Tape-in is the one to think twice about if you swim often, because chlorine and oil-based products work on the adhesive. Say so at your consultation and Annie will steer you accordingly.",
  },
  {
    q: "Do I need an appointment?",
    a: `The studio runs on walk-ins, Monday to Friday between 11am and 6pm. Messaging ahead on ${SALON.phone} is still worth it — it means Annie can set the time aside and have your shade ready.`,
  },
  {
    q: "What if my hair is fine or bleached?",
    a: "That narrows the method rather than ruling extensions out. Nano rings exist precisely for fine hair, and tape-in sits flat enough to hide in a high parting. What matters is the weight per section, which is why Annie will not fit a heavy weave to hair that cannot carry it.",
  },
] as const;

export default function AnnieHomePage() {
  return (
    <>
      <FaqJsonLd items={FAQ_ITEMS} />
      <Hero />

      <Marquee items={RIBBON} />

      <AnnieSection>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal direction="zoom">
            <Stat
              value={<CountUp to={RATING.value} decimals={1} />}
              label="Average rating"
              detail={`Across ${RATING.count} reviews on ${RATING.source}`}
            />
          </Reveal>
          <Reveal direction="zoom" delay={80}>
            <Stat
              value={<CountUp to={RATING.count} suffix="+" />}
              label="Reviews"
              detail="Written by people who sat in the chair"
            />
          </Reveal>
          <Reveal direction="zoom" delay={160}>
            <Stat
              value={<CountUp to={METHODS.length} />}
              label="Methods fitted"
              detail="Matched to your hair, not to a package"
            />
          </Reveal>
          <Reveal direction="zoom" delay={240}>
            <Stat
              value={
                <>
                  <CountUp to={18} />
                  <span className="text-2xl"> mths</span>
                </>
              }
              label="Hair can last"
              detail="Re-used through every move-up"
            />
          </Reveal>
        </div>
      </AnnieSection>

      <Difference />
      <Methods />
      <MatchTeaser />
      <Process />
      <Work />
      <Voices />
      <Visit />

      <AnnieSection tone="subtle">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <AnnieHeading
            label="Questions"
            title="The things people ask before they sit down"
            lede="And the honest answers, including the ones that talk you out of something."
          />
          <Reveal>
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </AnnieSection>

      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Atmosphere intensity="loud" />
      <StrandField className="opacity-70" />

      <div className="container-page relative py-24 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          <div className="max-w-3xl">
          <Reveal>
            <p className="inline-flex items-center gap-2.5 rounded-full border border-[var(--gold-hairline)] bg-primary-soft/40 px-4 py-2">
              <Stars
                rating={RATING.value}
                label={`Rated ${RATING.value} out of 5 from ${RATING.count} reviews on ${RATING.source}`}
              />
              <span className="font-technical text-xs text-foreground">
                {RATING.value} from {RATING.count} reviews
              </span>
            </p>
          </Reveal>

          <Reveal direction="zoom-out" delay={90}>
            <h1 className="mt-7 text-balance font-display text-[2.75rem] leading-[1.02] md:text-[4.5rem]">
              Hair that looks like it{" "}
              <span className="text-gilt annie-shimmer italic">grew there</span>
            </h1>
          </Reveal>

          <Reveal direction="zoom-soft" delay={170}>
            <p className="mt-7 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              A boutique extension studio hidden inside Manchester Arndale
              Market. Five methods, matched to your hair rather than to a
              price list, and fitted by Annie herself — every single time.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <AnnieLink href="/annie/book" arrow>
                Book a free consultation
              </AnnieLink>
              <AnnieLink href="/annie/hair-match" tone="outline">
                Find my method in 60 seconds
              </AnnieLink>
            </div>
          </Reveal>

          <Reveal delay={330}>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <OpenBadge />
              <span className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4 text-primary" />
                {ADDRESS_ONE_LINE}
              </span>
            </div>
          </Reveal>
          </div>

          {/* The feature panel. It balances the composition and gives
              Annie the most valuable photo placement on the site. */}
          <Reveal direction="zoom" delay={260} className="hidden lg:block">
            <div className="annie-gilt-edge annie-hero-zoom relative p-2">
              {/* The overlay card below sits across the frame, so the
                  frame's own caption moves out from under it. */}
              <PhotoFrame
                caption="Hero shot"
                ratio="4 / 5"
                index={1}
                hideCaption
              />
              {/* Solid, not glass: this card sits over the frame's own
                  caption, and a translucent panel lets that text show
                  through and collide with this one. */}
              <div className="absolute -bottom-6 -left-8 max-w-[15rem] rounded-2xl border border-[var(--gold-hairline)] bg-card p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
                <p className="annie-label text-[0.55rem]">Fitted by</p>
                <p className="mt-1.5 font-display text-xl">Annie</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Salon director. She matches, fits and blends every set
                  herself.
                </p>
              </div>
            </div>
            <p className="mt-10 pl-2 text-xs leading-relaxed text-muted-foreground">
              <span className="annie-label text-[0.55rem]">Photo slot</span>{" "}
              One finished head of hair, three-quarter profile, market light
              behind.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    icon: Gem,
    title: "One pair of hands",
    body: "Annie matches, fits and blends every set herself. There is no junior finishing off the back, and no second opinion you never asked for.",
  },
  {
    icon: ShieldCheck,
    title: "No heat, no fusion glue",
    body: "Every method here attaches with a ring, a flat tape or a thread. Nothing is melted onto your hair, which is the single biggest reason extensions go wrong.",
  },
  {
    icon: HeartHandshake,
    title: "Told the truth",
    body: "If your hair cannot carry the set you have asked for, you will hear that at the consultation rather than three months later when it is breaking.",
  },
  {
    icon: Sparkles,
    title: "Matched by eye",
    body: "Shade matched against your own ends in daylight, then cut in and styled so it leaves finished. Curls, waves or straight, included.",
  },
] as const;

function Difference() {
  return (
    <AnnieSection tone="subtle">
      <AnnieHeading
        label="Why here"
        title="Most bad extensions are a fitting problem, not a hair problem"
        lede="Beautiful hair fitted to the wrong bond, at the wrong weight, on hair that could not carry it. The fix is not more expensive hair — it is the twenty minutes before anything is fitted."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.title} direction="zoom" delay={i * 80}>
            <article className="annie-card annie-lift h-full p-6">
              <span className="grid size-11 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
                <pillar.icon aria-hidden="true" className="size-5 text-primary" />
              </span>
              <h3 className="mt-5 font-display text-xl">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {pillar.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </AnnieSection>
  );
}

function Methods() {
  return (
    <AnnieSection id="methods">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <AnnieHeading
          label="The five"
          title="Every method, and who each one is actually for"
          lede="Not a menu to pick from blind. Each of these suits a particular kind of hair, and the wrong one on the right head is still the wrong one."
        />
        <Reveal>
          <AnnieLink href="/annie/services" tone="outline" arrow>
            Full detail and prices
          </AnnieLink>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {METHODS.map((method, i) => (
          <Reveal key={method.id} direction="zoom" delay={i * 70}>
            <article className="annie-card annie-lift flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl">{method.name}</h3>
                <span className="annie-label shrink-0 text-[0.55rem]">
                  {method.budget === "value"
                    ? "Value"
                    : method.budget === "mid"
                      ? "Mid"
                      : "Premium"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {method.summary}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
                <div>
                  <dt className="annie-label text-[0.55rem]">Fitting</dt>
                  <dd className="font-technical mt-1 text-foreground">
                    {formatDurationRange(method.fitMinutes)}
                  </dd>
                </div>
                <div>
                  <dt className="annie-label text-[0.55rem]">Move-ups</dt>
                  <dd className="font-technical mt-1 text-foreground">
                    {method.maintenanceWeeks[0]}&ndash;{method.maintenanceWeeks[1]} wks
                  </dd>
                </div>
              </dl>

              <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                <span className="text-foreground">Best for.</span>{" "}
                {method.bestFor}
              </p>

              <Link
                href={`/annie/services#${method.id}`}
                className="mt-6 inline-flex min-h-11 items-center text-sm text-primary transition-colors duration-200 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                How it works &rarr;
              </Link>
            </article>
          </Reveal>
        ))}

        <Reveal direction="zoom" delay={METHODS.length * 70}>
          <article className="annie-card flex h-full flex-col justify-between bg-primary-soft/30 p-6">
            <div>
              <h3 className="font-display text-xl">Not sure which?</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Answer seven questions about your hair and how you live, and
                the match finder scores all five against it — including the
                ones it rules out, and why.
              </p>
            </div>
            <AnnieLink href="/annie/hair-match" className="mt-6 w-full" arrow>
              Find my method
            </AnnieLink>
          </article>
        </Reveal>
      </div>
    </AnnieSection>
  );
}

function MatchTeaser() {
  return (
    <section className="relative isolate overflow-hidden border-y border-[var(--gold-hairline)]">
      <Atmosphere intensity="quiet" />
      <div className="container-page relative py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal direction="zoom-out">
            <p className="annie-label">The match finder</p>
            <h2 className="mt-4 text-balance font-display text-[2.1rem] leading-tight md:text-[3rem]">
              Seven questions. A straight answer.
            </h2>
            <p className="mx-auto mt-5 max-w-[52ch] text-pretty leading-relaxed text-muted-foreground">
              It scores all five methods against your hair type, density,
              lifestyle and budget — and it tells you which ones are wrong for
              you rather than quietly leaving them off the list.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <AnnieLink href="/annie/hair-match" arrow>
                Start the match
              </AnnieLink>
              <AnnieLink href="/annie/services" tone="outline">
                Compare the costs
              </AnnieLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <AnnieSection>
      <AnnieHeading
        label="How it goes"
        title="From walking in to walking out"
        lede="Four stages, and the first one is free."
      />
      {/* `as="li"` on the Reveal matters: a <div> wrapper would sever
          each <li> from its <ol> for assistive tech. */}
      <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PROCESS.map((stage, i) => (
          <Reveal
            key={stage.step}
            as="li"
            direction="zoom"
            delay={i * 90}
            className="annie-card annie-lift h-full p-6"
          >
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-4xl text-primary/30">
                  {stage.step}
                </span>
                <span className="annie-label text-[0.55rem]">{stage.time}</span>
              </div>
              <h3 className="mt-4 font-display text-xl">{stage.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {stage.body}
              </p>
            </>
          </Reveal>
        ))}
      </ol>
    </AnnieSection>
  );
}

function Work() {
  return (
    <AnnieSection tone="subtle">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <AnnieHeading
          label="The work"
          title="Fitted, blended, cut in"
          lede="Drag the handle to see the difference a properly matched set makes."
        />
        <Reveal>
          <AnnieLink href="/annie/gallery" tone="outline" arrow>
            See the gallery
          </AnnieLink>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <Reveal direction="zoom-blur">
          <BeforeAfter
            label="Nano rings, 20 inch, full head"
            beforeCaption="Before: hair at the client's own length, parted centre, daylight."
            afterCaption="After: nano rings fitted and cut in, same parting and same light."
          />
        </Reveal>
        <Reveal direction="zoom-blur" delay={90}>
          <BeforeAfter
            label="LA weave, 22 inch, mega volume"
            beforeCaption="Before: fine ponytail, shot from behind in daylight."
            afterCaption="After: LA weave row fitted, blended and styled into waves."
          />
        </Reveal>
      </div>

      <Reveal delay={160}>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <PhotoFrame
            caption="Close detail of a nano bond at the root, showing how small it sits."
            ratio="1 / 1"
            index={0}
          />
          <PhotoFrame
            caption="A colour match held against the client's own ends in daylight."
            ratio="1 / 1"
            index={1}
          />
          <PhotoFrame
            caption="The studio inside Arndale Market — chair, mirror and light."
            ratio="1 / 1"
            index={2}
          />
        </div>
      </Reveal>
    </AnnieSection>
  );
}

function Voices() {
  return (
    <AnnieSection>
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <AnnieHeading
            label="What people say"
            title={
              <>
                <span className="text-gilt">{RATING.value}</span> from{" "}
                {RATING.count} reviews
              </>
            }
            lede="Four things come up again and again across the studio's review profiles."
          />
          <Reveal delay={120}>
            <div className="mt-8 flex flex-wrap gap-4">
              <AnnieLink href="/annie/reviews" arrow>
                Read the reviews
              </AnnieLink>
              <a
                href={RATING.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-12 items-center rounded-full border border-[var(--gold-hairline)] px-6 text-sm font-semibold transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                See them on {RATING.source}
              </a>
            </div>
          </Reveal>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {REVIEW_THEMES.map((theme, i) => (
            <Reveal
              key={theme.id}
              as="li"
              direction="zoom"
              delay={i * 70}
              className="annie-card annie-lift h-full p-6"
            >
              <>
                <h3 className="font-display text-lg">{theme.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {theme.detail}
                </p>
                <p className="annie-label mt-4 text-[0.55rem]">
                  Summarised from {theme.source}
                </p>
              </>
            </Reveal>
          ))}
        </ul>
      </div>
    </AnnieSection>
  );
}

function Visit() {
  return (
    <AnnieSection tone="subtle">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <AnnieHeading
            label="Find us"
            title="Tucked inside Manchester Arndale Market"
            lede="Two minutes from Piccadilly Gardens, a short walk from Victoria. Walk in Monday to Friday, or message ahead and Annie will set the time aside."
          />

          <Reveal delay={120}>
            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="annie-label flex items-center gap-2">
                  <MapPin aria-hidden="true" className="size-3.5" />
                  Address
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {SALON.address.unit}
                  <br />
                  {SALON.address.city} {SALON.address.postcode}
                </dd>
              </div>
              <div>
                <dt className="annie-label flex items-center gap-2">
                  <Clock aria-hidden="true" className="size-3.5" />
                  Hours
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Monday to Friday
                  <br />
                  11am &ndash; 6pm
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-9 flex flex-wrap gap-4">
              <AnnieLink href="/annie/contact" arrow>
                Directions and parking
              </AnnieLink>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-12 items-center rounded-full border border-[var(--gold-hairline)] px-6 text-sm font-semibold transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Open in Maps
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal direction="zoom" delay={120}>
          <PhotoFrame
            caption="The studio: the chair, the mirror and the market light behind it."
            ratio="4 / 5"
            index={2}
          />
        </Reveal>
      </div>
    </AnnieSection>
  );
}

function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden">
      <Atmosphere intensity="loud" />
      <div className="container-page relative py-24 text-center md:py-32">
        <Reveal direction="zoom-out">
          <p className="annie-label">Ready when you are</p>
          <h2 className="mx-auto mt-5 max-w-[20ch] text-balance font-display text-[2.4rem] leading-[1.04] md:text-[3.5rem]">
            The consultation is free. Start there.
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] text-pretty leading-relaxed text-muted-foreground">
            Twenty minutes, no obligation, and you will leave knowing exactly
            which method suits your hair and what it costs.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <AnnieLink href="/annie/book" arrow>
              Book a consultation
            </AnnieLink>
            <a
              href={`tel:${SALON.phoneE164}`}
              className="font-technical inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--gold-hairline)] px-6 text-sm font-semibold transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {SALON.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
