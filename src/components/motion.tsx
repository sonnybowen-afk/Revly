"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The salon's live-motion toolkit.
 *
 * Everything here follows the same four rules:
 *
 *   1. Transform and opacity only. Nothing in this file can cause a
 *      layout, so nothing in it can cause a layout shift.
 *   2. One rAF frame at a time. Scroll and pointer handlers only ever
 *      record a value; the write happens on the next animation frame,
 *      so a fast scroll cannot queue up hundreds of style writes.
 *   3. Passive listeners. None of this can ever block scrolling.
 *   4. It all switches off. `prefers-reduced-motion: reduce` disables
 *      every effect and renders the final, readable state — and the
 *      pointer effects additionally require a fine pointer, so a phone
 *      never pays for a cursor it does not have.
 */

/** True when the visitor has asked for less motion. Re-checks on change. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true); // Assume yes until told.

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/** True for a mouse or trackpad. False for touch, where hover is a lie. */
function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const update = () => setFine(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return fine;
}

/* ═══════════════════════════════════════════════════════════════════
   Scroll progress
   ═══════════════════════════════════════════════════════════════════ */

/**
 * A gold hairline across the top of the window that fills as you read.
 *
 * Scaled rather than resized, so the browser never re-lays-out the bar.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;

    let frame = 0;
    const write = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    write();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
    >
      <div
        ref={ref}
        className="h-full origin-left scale-x-0 bg-gradient-to-r from-[var(--gold-bright)] via-[var(--blush)] to-[var(--gold-bright)]"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Custom cursor
   ═══════════════════════════════════════════════════════════════════ */

const INTERACTIVE = "a, button, summary, [role='button'], input[type='range']";
const TEXT_ENTRY = "input:not([type='range']), textarea, select";

/**
 * A gold dot that tracks the pointer exactly, with a ring easing along
 * behind it. The ring swells over anything clickable.
 *
 * The native cursor is only hidden once this has mounted — the class
 * that hides it is added from here, never from the stylesheet. If the
 * script fails or never runs, the visitor keeps an ordinary cursor
 * rather than none at all. Over text fields the native caret comes
 * back, because a dot is useless for placing an insertion point.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const active = fine && !reduced;

  useEffect(() => {
    if (!active) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.querySelector(".annie-root");
    root?.classList.add("annie-cursor-none");

    // Start off-screen so nothing flashes at 0,0 before the first move.
    let pointerX = -100;
    let pointerY = -100;
    let ringX = -100;
    let ringY = -100;
    let seen = false;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!seen) {
        seen = true;
        ringX = pointerX;
        ringY = pointerY;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      const target = e.target as Element | null;
      const overLink = Boolean(target?.closest(INTERACTIVE));
      const overText = Boolean(target?.closest(TEXT_ENTRY));
      ring.dataset.over = overLink ? "true" : undefined;
      // Hand the caret back where a caret is what you actually need.
      root?.classList.toggle("annie-cursor-none", !overText);
      dot.style.visibility = overText ? "hidden" : "visible";
      ring.style.visibility = overText ? "hidden" : "visible";
    };

    const tick = () => {
      // Exponential ease — the ring chases, never quite catching up.
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
      root?.classList.remove("annie-cursor-none");
    };
  }, [active]);

  if (!active) return null;

  return (
    <div aria-hidden="true">
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[60] size-1.5 rounded-full bg-[var(--primary)] opacity-0 transition-opacity duration-300"
      />
      <div
        ref={ringRef}
        data-cursor-ring
        className={cn(
          "pointer-events-none fixed top-0 left-0 z-[60] size-9 rounded-full border border-[var(--primary)]/55 opacity-0",
          "transition-[width,height,background-color,border-color,opacity] duration-300 ease-out",
          "data-[over=true]:size-16 data-[over=true]:border-[var(--primary)] data-[over=true]:bg-[var(--gold-glow)]",
        )}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Magnetic
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Leans towards the pointer as it approaches, and springs back on exit.
 *
 * The pull is capped at `strength` pixels and only applies within the
 * element's own bounds plus a small margin, so a magnetic button never
 * chases the pointer across the page. Touch devices get nothing, which
 * is correct: there is no hover to anticipate.
 */
export function Magnetic({
  children,
  strength = 14,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const active = fine && !reduced;

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const write = () => {
      frame = 0;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    const onMove = (e: PointerEvent) => {
      const box = node.getBoundingClientRect();
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      // Normalise by half-size so the pull is even on wide buttons.
      x = Math.max(-1, Math.min(1, dx / (box.width / 2))) * strength;
      y = Math.max(-1, Math.min(1, dy / (box.height / 2))) * strength;
      schedule();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      schedule();
    };

    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [active, strength]);

  return (
    <span
      ref={ref}
      className={cn("inline-block transition-transform duration-500 ease-out", className)}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Parallax
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Moves at a different rate from the page as it passes through the
 * viewport. `speed` is a fraction of the travelled distance: positive
 * drifts down (slower than the page), negative drifts up.
 *
 * Decorative layers only. Never body copy — parallaxed text is hard to
 * read and is a reliable way to make people feel sick.
 */
export function Parallax({
  children,
  speed = 0.12,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let visible = false;

    const write = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      // 0 when the element's centre is at the viewport centre.
      const fromCentre = box.top + box.height / 2 - window.innerHeight / 2;
      node.style.transform = `translate3d(0, ${(-fromCentre * speed).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(write);
    };

    // Only listen while the element is actually on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(node);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [reduced, speed]);

  return (
    <Tag ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Word reveal
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Reveals a heading word by word, each one rising out of its own
 * clipping mask.
 *
 * The text stays real text. Each word is a span containing the word and
 * a non-breaking space, so a screen reader reads the sentence normally
 * and find-in-page still works — which is the thing most split-text
 * effects quietly break.
 *
 * The structure never changes between renders, which matters more than
 * it sounds: an earlier version rendered plain text until it knew the
 * motion preference and the masked version afterwards, so the ref moved
 * after the observer had already given up on a null node and every
 * heading stayed hidden for good. Now the words render *visible* on the
 * server and are armed — hidden — in a layout effect, before the first
 * paint. So there is no flash, no hydration mismatch, and with
 * JavaScript off or reduced motion on the heading is simply there.
 */
export function WordReveal({
  text,
  className,
  wordClassName,
  as: Tag = "span",
  delay = 0,
  /** Per-word stagger. 34ms reads as one movement across a headline. */
  step = 34,
}: {
  text: string;
  className?: string;
  /**
   * Classes for each individual word. Anything that paints the text
   * itself belongs here rather than on `className`: the word spans are
   * transformed, and `background-clip: text` on an ancestor cannot clip
   * across a transformed descendant, so a gilt gradient set on the
   * wrapper renders nothing at all.
   */
  wordClassName?: string;
  as?: ElementType;
  delay?: number;
  step?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);
  const words = useMemo(() => text.split(" "), [text]);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Never arm without motion or without an observer: the words are
    // already visible, and leaving them that way is the safe failure.
    if (reduced || typeof IntersectionObserver === "undefined") return;

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hidden = armed && !shown;

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          // The mask. Bottom padding stops descenders being clipped.
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <span
            className={cn(
              "inline-block transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              wordClassName,
            )}
            style={{
              transform: hidden ? "translateY(110%)" : "translateY(0)",
              transitionDelay: hidden ? "0ms" : `${delay + i * step}ms`,
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : null}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Petals
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Blush petals drifting down the page, endlessly.
 *
 * Generated from a fixed seed so the server and the client agree and
 * React reports no hydration mismatch. Each petal gets its own
 * duration, delay, drift and spin through custom properties, so no two
 * follow the same path and the loop never looks like a loop.
 *
 * Purely decorative: aria-hidden, no pointer events, and the
 * reduced-motion block removes them from the page entirely, because a
 * petal that does not fall is just a smudge.
 */
export function Petals({ count = 14 }: { count?: number }) {
  const petals = useMemo(() => {
    let seed = 20260921;
    const next = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    return Array.from({ length: count }, () => ({
      left: next() * 100,
      size: 6 + next() * 12,
      duration: 16 + next() * 18,
      delay: -next() * 30,
      drift: (next() - 0.5) * 220,
      spin: 140 + next() * 320,
      opacity: 0.18 + next() * 0.3,
      rose: next() > 0.45,
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {petals.map((p, i) => (
        <span
          key={i}
          className="annie-petal absolute top-0 block"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              "--petal-duration": `${p.duration}s`,
              "--petal-delay": `${p.delay}s`,
              "--petal-drift": `${p.drift}px`,
              "--petal-spin": `${p.spin}deg`,
              "--petal-opacity": p.opacity,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 20 20" className="h-full w-full">
            {/* A single petal: one rounded lobe, tipped at both ends. */}
            <path
              d="M10 1 C 15 5, 18 11, 10 19 C 2 11, 5 5, 10 1 Z"
              fill={p.rose ? "var(--blush)" : "var(--gold-pale)"}
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Sticky step tracker
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Reports which of `count` sections is currently in view, for a pinned
 * panel that tracks the reader down the page.
 *
 * Returns the index and a setter for the observed nodes. The caller
 * owns the markup; this only owns the arithmetic.
 */
export function useActiveStep(count: number) {
  const [active, setActive] = useState(0);
  const nodes = useRef<(HTMLElement | null)[]>([]);

  const register = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      nodes.current[index] = node;
    },
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.current.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      // A band across the middle of the viewport: a section is "active"
      // once it reaches the reading position, not when it first peeks in.
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const node of nodes.current) if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [count]);

  return { active, register };
}
