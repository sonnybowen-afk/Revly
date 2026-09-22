"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SALON } from "@/lib/salon";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/hair-match", label: "Hair match" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
  { href: "/aftercare", label: "Aftercare" },
] as const;

export function AnnieHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // The bar goes from transparent over the hero to frosted once you move.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    // Passive: this listener must never be able to block scrolling.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation, so a tap never leaves it hanging open.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Escape closes it, and the page behind it must not scroll.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "annie-glass border-b border-[var(--gold-hairline)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Monogram />
          {/* The wordmark is hidden on small screens, and the monogram is
              decorative, so the link needs a name of its own. */}
          <span className="sr-only">Annie&rsquo;s Secret Hair Extensions, home</span>
          <span aria-hidden="true" className="hidden leading-tight sm:block">
            <span className="block font-display text-[1.05rem] text-foreground">
              Annie&rsquo;s Secret
            </span>
            <span className="annie-label block text-[0.6rem]">
              Hair Extensions
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-11 items-center rounded-md px-3 text-sm transition-colors duration-200",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-3 bottom-1.5 h-px origin-left bg-primary transition-transform duration-300 ease-out",
                        active ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${SALON.phoneE164}`}
            className="hidden min-h-11 items-center gap-2 rounded-full border border-[var(--gold-hairline)] px-4 text-sm text-foreground transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:inline-flex"
          >
            <Phone aria-hidden="true" className="size-4 text-primary" />
            <span className="font-technical text-[0.8rem]">{SALON.phone}</span>
          </a>

          <Link
            href="/book"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-[background-color,transform] duration-200 hover:bg-primary-hover active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Book
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="annie-mobile-nav"
            className="inline-flex size-11 items-center justify-center rounded-md text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
          >
            {menuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer. Rendered only when open so nothing in it is
          reachable by keyboard while it is hidden. */}
      {menuOpen ? (
        <div
          id="annie-mobile-nav"
          className="annie-glass border-t border-[var(--gold-hairline)] lg:hidden"
        >
          <nav aria-label="Main" className="container-page py-4">
            <ul className="flex flex-col">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center justify-between border-b border-border/60 text-base transition-colors duration-200",
                        active ? "text-primary" : "text-foreground",
                      )}
                    >
                      {item.label}
                      <span aria-hidden="true" className="annie-label text-[0.6rem]">
                        {active ? "Here" : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <a
              href={`tel:${SALON.phoneE164}`}
              className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold-hairline)] text-sm"
            >
              <Phone aria-hidden="true" className="size-4 text-primary" />
              <span className="font-technical">{SALON.phone}</span>
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

/** The mark: an A drawn as two strands meeting, inside a gold ring. */
function Monogram() {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-10 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft"
    >
      <svg viewBox="0 0 24 24" className="size-5">
        <path
          d="M5 19 C 8 12, 10 7, 12 4 C 14 7, 16 12, 19 19"
          fill="none"
          stroke="#e3b948"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M8.6 14.5 H 15.4" stroke="#e8b4b8" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
