import Link from "next/link";
import { Clock, Instagram, MapPin, Phone } from "lucide-react";
import { ADDRESS_ONE_LINE, MAPS_URL, RATING, SALON } from "@/lib/salon";
import { OpenBadge } from "./open-badge";

const SITE_LINKS = [
  { href: "/services", label: "Services & prices" },
  { href: "/hair-match", label: "Find my method" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About Annie" },
  { href: "/aftercare", label: "Aftercare" },
  { href: "/contact", label: "Find us" },
  { href: "/book", label: "Book a consultation" },
] as const;

export function AnnieFooter() {
  return (
    <footer className="relative mt-24 border-t border-[var(--gold-hairline)] bg-background-subtle">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl">Annie&rsquo;s Secret</p>
            <p className="annie-label mt-1">{SALON.tagline}</p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A boutique hair extension studio tucked inside Manchester
              Arndale Market. Every set is matched and fitted by Annie
              herself.
            </p>
            <div className="mt-6">
              <OpenBadge />
            </div>
          </div>

          <nav aria-labelledby="annie-footer-nav">
            <h2 id="annie-footer-nav" className="annie-label">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="annie-label">Visit</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {ADDRESS_ONE_LINE}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <a
                  href={`tel:${SALON.phoneE164}`}
                  className="font-technical text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {SALON.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  Monday to Friday, 11am&ndash;6pm
                  <br />
                  Closed Saturday and Sunday
                </span>
              </li>
              <li className="flex gap-3">
                <Instagram aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <a
                  href={SALON.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-technical text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {SALON.social.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="annie-hairline mt-14 flex flex-col gap-4 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SALON.legalName}. Registered in
            England and Wales, company no.{" "}
            <span className="font-technical">{SALON.companyNumber}</span>.
          </p>
          <p>
            Rated{" "}
            <span className="font-technical text-primary">{RATING.value}</span>{" "}
            from{" "}
            <a
              href={RATING.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4 transition-colors duration-200 hover:text-primary"
            >
              {RATING.count} reviews on {RATING.source}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
