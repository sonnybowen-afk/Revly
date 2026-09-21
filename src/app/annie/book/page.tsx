import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, MapPin, Phone } from "lucide-react";
import { Atmosphere } from "@/components/annie/atmosphere";
import { BookingForm } from "@/components/annie/booking-form";
import { BreadcrumbJsonLd } from "@/components/annie/json-ld";
import { OpenBadge } from "@/components/annie/open-badge";
import { Reveal } from "@/components/annie/reveal";
import { AnnieHeading, AnnieSection } from "@/components/annie/ui";
import { ADDRESS_ONE_LINE, SALON } from "@/lib/annie-salon";

export const metadata: Metadata = {
  title: "Book a consultation",
  description:
    "Request a free hair extension consultation at Annie's Secret in Manchester Arndale Market. Build your enquiry and send it by WhatsApp, text or email in one tap.",
};

export default function BookPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Book", path: "/book" },
        ]}
      />

      <section className="relative isolate overflow-hidden">
        <Atmosphere />
        <div className="container-page relative py-20 md:py-24">
          <AnnieHeading
            as="h1"
            label="Book"
            title="Tell Annie about your hair"
            lede="The studio runs on walk-ins, so this is not a diary slot — it is a properly written enquiry that lets Annie set the time aside and have your shade ready before you arrive."
          />

          <Reveal delay={120}>
            <ul className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <li>
                <OpenBadge />
              </li>
              <li className="inline-flex items-center gap-2">
                <Clock aria-hidden="true" className="size-4 text-primary" />
                Monday to Friday, 11am&ndash;6pm
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4 text-primary" />
                {ADDRESS_ONE_LINE}
              </li>
              <li className="inline-flex items-center gap-2">
                <Phone aria-hidden="true" className="size-4 text-primary" />
                <a
                  href={`tel:${SALON.phoneE164}`}
                  className="font-technical transition-colors duration-200 hover:text-primary"
                >
                  {SALON.phone}
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      <AnnieSection className="pt-0">
        {/* useSearchParams needs a boundary so the rest of the page can
            still be prerendered while the form resolves the ?method= link
            it was sent from. */}
        <Suspense fallback={<FormSkeleton />}>
          <BookingForm />
        </Suspense>
      </AnnieSection>
    </>
  );
}

/** Reserves the form's real height, so nothing jumps when it arrives. */
function FormSkeleton() {
  return (
    <div
      className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
      aria-busy="true"
    >
      <div className="annie-card min-h-[42rem] p-8">
        <p className="annie-label">Loading the form…</p>
      </div>
      <div className="annie-card min-h-[18rem] p-6" />
    </div>
  );
}
