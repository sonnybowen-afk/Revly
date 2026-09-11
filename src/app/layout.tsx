import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://revly.co.uk"),
  title: {
    default: "Revly — Everything you need to revise",
    template: "%s · Revly",
  },
  description:
    "The all-in-one revision hub for GCSE and A-Level students. Spaced-repetition flashcards, revision timetables, tutoring, UCAS and NEA support.",
  keywords: [
    "GCSE revision",
    "A-Level revision",
    "flashcards",
    "spaced repetition",
    "active recall",
    "UCAS",
    "NEA",
    "revision timetable",
  ],
  openGraph: {
    title: "Revly — Everything you need to revise",
    description:
      "Spaced-repetition flashcards, revision timetables, tutoring, UCAS and NEA support for GCSE and A-Level students.",
    type: "website",
    locale: "en_GB",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom is never disabled — maximumScale and userScalable stay at defaults.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090e1a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary focus:font-semibold"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
