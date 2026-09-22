"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up to a number when it scrolls into view.
 *
 * Driven by requestAnimationFrame against a real timestamp rather than a
 * fixed per-frame increment, so it takes the same wall-clock time on a
 * 60Hz laptop and a 120Hz phone, and it cannot overshoot.
 *
 * The final value is what the server renders, so a crawler, a no-JS
 * visitor and a reduced-motion reader all get the real figure immediately.
 * The counter only ever replaces a number that was already correct.
 */
export function CountUp({
  to,
  duration = 1400,
  decimals = 0,
  suffix = "",
  prefix = "",
}: {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        // Drop to zero in the same commit that starts the animation, so
        // the real figure is never shown and then snatched away.
        setValue(0);

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // Ease-out cubic: quick off the mark, settles onto the value.
          const eased = 1 - Math.pow(1 - t, 3);
          if (t < 1) {
            setValue(to * eased);
            frameRef.current = requestAnimationFrame(tick);
          } else {
            setValue(to);
          }
        };
        frameRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [to, duration]);

  const shown = value ?? to;

  return (
    <span ref={ref} className="font-technical tabular-nums">
      {prefix}
      {shown.toLocaleString("en-GB", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
