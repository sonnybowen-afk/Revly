import Link from "next/link";
import { Logo } from "@/components/site-header";

const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Revise",
    links: [
      { href: "/revision", label: "Revision hub" },
      { href: "/revision/flashcards", label: "Flashcards" },
      { href: "/timetable", label: "Timetable builder" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/tutoring", label: "Find a tutor" },
      { href: "/nea", label: "NEA & coursework" },
    ],
  },
  {
    title: "Next steps",
    links: [
      { href: "/ucas", label: "UCAS guidance" },
      { href: "/ucas#personal-statement", label: "Personal statement" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background-subtle">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Logo />
              <span className="font-display text-xl">Revly</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Everything a GCSE or A-Level student needs to revise, in one
              place. Built around active recall and spaced repetition.
            </p>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="eyebrow">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Revly. Built for UK students.</p>
          <p>
            Progress is stored in your browser. Nothing is uploaded.
          </p>
        </div>
      </div>
    </footer>
  );
}
