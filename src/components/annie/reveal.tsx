"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction =
  | "up"
  | "left"
  | "right"
  /** The house move: swells up into place from 0.88. */
  | "zoom"
  /** A restrained 0.955, for dense grids where a big zoom would churn. */
  | "zoom-soft"
  /** Rack focus — arrives from behind a blur and snaps sharp. */
  | "zoom-blur"
  /** Pulls back from 1.14. For statement headings only. */
  | "zoom-out";

/**
 * Reveals its children once, when they first scroll into view.
 *
 * An IntersectionObserver rather than a scroll listener: the browser does
 * the work off the main thread, and there is nothing to throttle. The CSS
 * in globals.css does the animating — this only flips a data attribute —
 * so the whole effect is transform and opacity and never costs a layout.
 *
 * Two things it is careful about:
 *   • Content is visible to crawlers and to no-JS readers. The hidden
 *     state is applied by CSS keyed on [data-reveal], and the reduced-
 *     motion block overrides it outright.
 *   • It unobserves after firing. Nothing re-animates on the way back up.
 */
export function Reveal({
  children,
  as: Tag = "div",
  direction = "zoom-soft",
  delay = 0,
  className,
  once = true,
}: {
  children: ReactNode;
  as?: ElementType;
  direction?: Direction;
  /** Milliseconds. Use a stagger of 60–90ms across a row of cards. */
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer (or reduced motion) — show it and stop.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      // Fire a little before the element is fully on screen, so the
      // motion has finished by the time the eye arrives.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      data-reveal={direction}
      data-revealed={revealed ? "true" : undefined}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={className ? cn(className) : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Staggers a row or grid: each child is revealed `step` milliseconds after
 * the one before it. 60–90ms reads as one movement; much more and the last
 * card arrives long after the reader has looked away.
 */
export function RevealGroup({
  children,
  step = 70,
  direction = "zoom",
  className,
}: {
  children: ReactNode[];
  step?: number;
  direction?: Direction;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} direction={direction} delay={i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
