import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { AnnieHeader } from "@/components/annie/annie-header";
import { AnnieFooter } from "@/components/annie/annie-footer";
import { SalonJsonLd } from "@/components/annie/json-ld";
import { CustomCursor, ScrollProgress } from "@/components/annie/motion";
import { SALON } from "@/lib/annie-salon";

/* Display serif — the luxury/editorial half of the pairing. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

/* Body grotesque — neutral, so the serif carries all the character. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Technical voice: labels, prices, timings. Two weights only. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SALON.website),
  title: {
    default: `${SALON.name} — ${SALON.tagline}`,
    template: `%s · ${SALON.shortName}`,
  },
  description:
    "Boutique hair extension studio in Manchester Arndale Market. LA weave, nano rings, micro rings, tape-in and sew-in weaves, matched and fitted by Annie. Rated 4.9 from 82 reviews.",
  keywords: [
    "hair extensions Manchester",
    "LA weave Manchester",
    "nano ring extensions",
    "micro ring extensions",
    "tape in extensions Manchester",
    "sew in weave Manchester",
    "Arndale Market hair salon",
    "Russian hair extensions",
  ],
  openGraph: {
    title: `${SALON.name} — ${SALON.tagline}`,
    description:
      "LA weave, nano rings, micro rings, tape-in and sew-in weaves, fitted by Annie in Manchester Arndale Market.",
    type: "website",
    locale: "en_GB",
    siteName: SALON.name,
  },
  alternates: { canonical: "/" },
};

/**
 * The salon site's root of its own.
 *
 * Everything hangs off `.annie-root`: the three fonts, and the token
 * overrides in globals.css that repaint every semantic colour utility in
 * the salon's palette. Because the wrapper carries the class, the
 * `:root:has(.annie-root)` rule reaches <html> too, so the browser chrome
 * and the overscroll gutter go dark with the page.
 */
export default function AnnieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`annie-root flex min-h-dvh flex-col ${playfair.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <SalonJsonLd />
      <ScrollProgress />
      <CustomCursor />
      <a
        href="#annie-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-on-primary"
      >
        Skip to main content
      </a>
      <AnnieHeader />
      <main id="annie-main" className="flex-1">
        {children}
      </main>
      <AnnieFooter />
    </div>
  );
}
