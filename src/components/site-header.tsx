"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/revision", label: "Revision" },
  { href: "/timetable", label: "Timetable" },
  { href: "/tutoring", label: "Tutoring" },
  { href: "/ucas", label: "UCAS" },
  { href: "/nea", label: "NEA" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation so the panel never strands the user.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll only while the mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight"
        >
          <Logo />
          <span>Revly</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <ButtonLink href="/revision" size="sm" className="hidden sm:inline-flex">
            Start revising
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-xl border border-border cursor-pointer lg:hidden"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-border bg-background"
        >
          <nav aria-label="Mobile" className="container-page py-4 flex flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-xl px-4 text-base font-medium",
                    active
                      ? "bg-primary-soft text-primary-soft-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 flex items-center justify-between gap-3">
              <ThemeToggle />
              <ButtonLink href="/revision" size="sm">
                Start revising
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-on-primary",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5">
        <path
          d="M5 4.5A1.5 1.5 0 0 1 6.5 3H17a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 17.5v-13Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M5 17.5A1.5 1.5 0 0 1 6.5 16H19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="m9 9.5 2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
