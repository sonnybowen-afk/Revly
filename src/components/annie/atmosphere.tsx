import { cn } from "@/lib/utils";
import { Parallax, Petals } from "./motion";

/**
 * The light behind everything.
 *
 * Three blurred colour fields — gold, blush and a warm cream — drifting
 * on different cycles so the background is never the same twice, each on
 * its own parallax rate so the layers separate as you scroll. Blush
 * petals fall across the whole thing.
 *
 * On a cream ground the auras are washes, not glows: low alpha and wide
 * blur, so they tint the paper rather than sitting on top of it.
 *
 * Purely decorative, so it is aria-hidden and cannot take pointer events.
 * It animates transform only, and the reduced-motion block in globals.css
 * stops it dead.
 */
export function Atmosphere({
  className,
  intensity = "normal",
  petals = true,
}: {
  className?: string;
  intensity?: "quiet" | "normal" | "loud";
  /** Off for dense bands where falling petals would fight the content. */
  petals?: boolean;
}) {
  const scale = { quiet: 0.55, normal: 1, loud: 1.5 }[intensity];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Each layer drifts at its own rate, so they separate on scroll. */}
      <Parallax speed={0.06}>
        <div
          className="annie-aura annie-drift"
          style={{
            top: "-18%",
            left: "-10%",
            width: "clamp(20rem, 54vw, 48rem)",
            aspectRatio: "1",
            background: `radial-gradient(circle, rgba(201,162,39,${0.18 * scale}) 0%, transparent 68%)`,
          }}
        />
      </Parallax>
      <Parallax speed={-0.1}>
        <div
          className="annie-aura annie-float"
          style={{
            bottom: "-24%",
            right: "-12%",
            width: "clamp(18rem, 48vw, 42rem)",
            aspectRatio: "1",
            background: `radial-gradient(circle, rgba(232,160,180,${0.3 * scale}) 0%, transparent 70%)`,
            animationDelay: "-6s",
          }}
        />
      </Parallax>
      <Parallax speed={0.14}>
        <div
          className="annie-aura annie-drift"
          style={{
            top: "22%",
            right: "16%",
            width: "clamp(14rem, 34vw, 30rem)",
            aspectRatio: "1",
            background: `radial-gradient(circle, rgba(247,214,222,${0.5 * scale}) 0%, transparent 72%)`,
            animationDelay: "-11s",
            animationDuration: "28s",
          }}
        />
      </Parallax>

      {petals ? <Petals count={intensity === "loud" ? 16 : 9} /> : null}

      {/* A soft cream fade at the foot, so a band ends rather than stops. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 55%, rgba(255,251,247,0.85) 100%)",
        }}
      />
    </div>
  );
}

/**
 * A field of drawn hair strands. Bézier curves stroked in a champagne-to-
 * rose gradient, drawn on with stroke-dashoffset when the page loads,
 * then left alone.
 *
 * The paths come from a fixed seed rather than Math.random, so the server
 * and the client draw exactly the same field and React does not report a
 * hydration mismatch.
 */
export function StrandField({
  count = 16,
  className,
}: {
  count?: number;
  className?: string;
}) {
  // A small deterministic PRNG. Same seed, same field, every render.
  let seed = 20260921;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const strands = Array.from({ length: count }, (_, i) => {
    const x = (i / (count - 1)) * 1000;
    const sway = 90 + next() * 210;
    const drop = 340 + next() * 290;
    // Each strand falls from the top edge and curls away to one side.
    const d = `M ${x.toFixed(1)} -20 C ${(x + sway * 0.4).toFixed(1)} ${(drop * 0.35).toFixed(1)}, ${(x - sway * 0.5).toFixed(1)} ${(drop * 0.7).toFixed(1)}, ${(x + sway * 0.2).toFixed(1)} ${drop.toFixed(1)}`;
    return {
      d,
      // Rough path length — it only needs to exceed the real one.
      dash: Math.round(drop * 1.8),
      delay: Math.round(next() * 1100),
      opacity: 0.2 + next() * 0.4,
      width: 0.6 + next() * 1.2,
    };
  });

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMin slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <linearGradient id="annie-strand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a227" stopOpacity="0" />
          <stop offset="26%" stopColor="#c9a227" stopOpacity="0.9" />
          <stop offset="58%" stopColor="#d99aab" stopOpacity="0.8" />
          <stop offset="84%" stopColor="#e8a0b4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e8a0b4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {strands.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill="none"
          stroke="url(#annie-strand)"
          strokeWidth={s.width}
          strokeLinecap="round"
          opacity={s.opacity}
          className="annie-draw"
          style={
            {
              "--dash": s.dash,
              "--draw-delay": `${s.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}
