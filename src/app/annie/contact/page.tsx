import type { Metadata } from "next";
import {
  Bus,
  Car,
  Facebook,
  Footprints,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  TrainFront,
} from "lucide-react";
import { Atmosphere } from "@/components/annie/atmosphere";
import { BreadcrumbJsonLd } from "@/components/annie/json-ld";
import { OpenBadge } from "@/components/annie/open-badge";
import { Reveal } from "@/components/annie/reveal";
import {
  AnnieHeading,
  AnnieLink,
  AnnieSection,
  PhotoFrame,
} from "@/components/annie/ui";
import { ADDRESS_ONE_LINE, MAPS_URL, SALON } from "@/lib/annie-salon";

export const metadata: Metadata = {
  title: "Find us",
  description: `Annie's Secret Hair Extension, ${ADDRESS_ONE_LINE}. Open Monday to Friday 11am to 6pm. Two minutes from Piccadilly Gardens, a short walk from Victoria station.`,
};

const ROUTES = [
  {
    icon: Footprints,
    title: "On foot",
    body: "Two minutes from Piccadilly Gardens. Head for the Arndale Market entrance on High Street — the market is the food and independents hall, not the main shopping centre.",
  },
  {
    icon: TrainFront,
    title: "By train",
    body: "A short walk from Victoria. From Piccadilly it is about ten minutes through the centre, or one stop on the tram to Market Street.",
  },
  {
    icon: Bus,
    title: "Tram and bus",
    body: "Market Street tram stop is the closest, about three minutes away. Shudehill interchange is a similar walk from the other side.",
  },
  {
    icon: Car,
    title: "Parking",
    body: "The Arndale car park on High Street is directly above. Cross Street and Shudehill are the other two within a few minutes' walk.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Find us", path: "/contact" },
        ]}
      />

      <section className="relative isolate overflow-hidden">
        <Atmosphere />
        <div className="container-page relative py-20 md:py-28">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div>
              <AnnieHeading
                as="h1"
                label="Find us"
                title="Inside Manchester Arndale Market"
                lede="Not the shopping centre — the market hall next to it, off High Street. Once you are in, ask for Annie's."
              />

              <Reveal delay={120}>
                <div className="mt-9">
                  <OpenBadge />
                </div>
              </Reveal>

              <Reveal delay={170}>
                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  <a
                    href={`tel:${SALON.phoneE164}`}
                    className="annie-card annie-lift flex items-center gap-4 p-5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
                      <Phone aria-hidden="true" className="size-5 text-primary" />
                    </span>
                    <span>
                      <span className="annie-label block text-[0.55rem]">Call</span>
                      <span className="font-technical mt-0.5 block text-sm text-foreground">
                        {SALON.phone}
                      </span>
                    </span>
                  </a>

                  <a
                    href={`https://wa.me/${SALON.phoneE164.replace("+", "")}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="annie-card annie-lift flex items-center gap-4 p-5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
                      <MessageCircle aria-hidden="true" className="size-5 text-primary" />
                    </span>
                    <span>
                      <span className="annie-label block text-[0.55rem]">WhatsApp</span>
                      <span className="mt-0.5 block text-sm text-foreground">
                        Send a message
                      </span>
                    </span>
                  </a>

                  <a
                    href={SALON.social.instagram}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="annie-card annie-lift flex items-center gap-4 p-5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
                      <Instagram aria-hidden="true" className="size-5 text-primary" />
                    </span>
                    <span>
                      <span className="annie-label block text-[0.55rem]">Instagram</span>
                      <span className="font-technical mt-0.5 block text-sm text-foreground">
                        {SALON.social.instagramHandle}
                      </span>
                    </span>
                  </a>

                  <a
                    href={SALON.social.facebook}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="annie-card annie-lift flex items-center gap-4 p-5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
                      <Facebook aria-hidden="true" className="size-5 text-primary" />
                    </span>
                    <span>
                      <span className="annie-label block text-[0.55rem]">Facebook</span>
                      <span className="mt-0.5 block text-sm text-foreground">
                        Weave Bar page
                      </span>
                    </span>
                  </a>
                </div>
              </Reveal>

              <Reveal delay={220}>
                <div className="mt-8 flex flex-wrap gap-4">
                  <AnnieLink href="/annie/book" arrow>
                    Send an enquiry
                  </AnnieLink>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--gold-hairline)] px-6 text-sm font-semibold transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <MapPin aria-hidden="true" className="size-4 text-primary" />
                    Open in Maps
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal direction="zoom" delay={120}>
              <div className="space-y-6">
                <PhotoFrame
                  caption="The shopfront inside the market, so people know what to look for."
                  ratio="4 / 3"
                  index={0}
                />
                <div className="annie-card p-6">
                  <h2 className="annie-label">Opening hours</h2>
                  <dl className="mt-4 divide-y divide-border">
                    {SALON.hours.map((day) => (
                      <div
                        key={day.day}
                        className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
                      >
                        <dt className="text-muted-foreground">{day.day}</dt>
                        <dd
                          className={
                            day.opens
                              ? "font-technical text-foreground"
                              : "font-technical text-muted-foreground"
                          }
                        >
                          {day.opens ? `${day.opens} – ${day.closes}` : "Closed"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                    Walk-ins welcome across those hours. Messaging ahead means
                    Annie can set the time aside and have your shade ready.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <AnnieSection tone="subtle">
        <AnnieHeading
          label="Getting here"
          title="Four ways in"
          lede="It is genuinely central. The only thing people get wrong is walking into the shopping centre instead of the market."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROUTES.map((route, i) => (
            <Reveal key={route.title} direction="zoom" delay={i * 80}>
              <article className="annie-card annie-lift h-full p-6">
                <span className="grid size-11 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
                  <route.icon aria-hidden="true" className="size-5 text-primary" />
                </span>
                <h2 className="mt-5 font-display text-xl">{route.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {route.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <address className="annie-card mt-10 flex flex-col gap-5 p-6 not-italic md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="annie-label">Address</p>
                <p className="mt-1.5 text-sm text-foreground">
                  {SALON.name}
                  <br />
                  {SALON.address.unit}, {SALON.address.street}
                  <br />
                  {SALON.address.city} {SALON.address.postcode}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="annie-label">Prefer to write?</p>
                <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                  Use the{" "}
                  <AnnieLink
                    href="/annie/book"
                    tone="ghost"
                    className="inline min-h-0 px-0 text-sm font-normal text-primary underline underline-offset-4"
                  >
                    enquiry builder
                  </AnnieLink>{" "}
                  and it will write the message for you.
                </p>
              </div>
            </div>
          </address>
        </Reveal>
      </AnnieSection>
    </>
  );
}
