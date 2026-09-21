import { cn } from "@/lib/utils";

/**
 * The light behind everything.
 *
 * Three blurred jewel fields — champagne, rose gold and amethyst —
 * drifting on different cycles so the background is never the same twice,
 * over a soft vignette that pulls the eye back to the centre column.
 *
 * Polished, not textured: there is deliberately no grain or noise layer,
 * because grain over a warm dark ground reads as hide rather than as
 * lacquer, and this brand is lacquer.
 *
 * Purely decorative, so it is aria-hidden and cannot take pointer events.
 * It animates transform only, and the reduced-motion block in globals.css
 * stops it dead.
 */
export function Atmosphere({
  className,
  intensity = "normal",
}: {
  className?: string;
  intensity?: "quiet" | "normal" | "loud";
}) {
  const scale = { quiet: 0.55, normal: 1, loud: 1.6 }[intensity];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className="annie-aura annie-drift"
        style={{
          top: "-20%",
          left: "-12%",
          width: "clamp(20rem, 54vw, 48rem)",
          aspectRatio: "1",
          background: `radial-gradient(circle, rgba(242,211,132,${0.2 * scale}) 0%, transparent 68%)`,
        }}
      />
      <div
        className="annie-aura annie-float"
        style={{
          bottom: "-26%",
          right: "-14%",
          width: "clamp(18rem, 48vw, 42rem)",
          aspectRatio: "1",
          background: `radial-gradient(circle, rgba(240,184,196,${0.17 * scale}) 0%, transparent 70%)`,
          animationDelay: "-6s",
        }}
      />
      <div
        className="annie-aura annie-drift"
        style={{
          top: "24%",
          right: "18%",
          width: "clamp(14rem, 34vw, 30rem)",
          aspectRatio: "1",
          background: `radial-gradient(circle, rgba(184,154,232,${0.16 * scale}) 0%, transparent 72%)`,
          animationDelay: "-11s",
          animationDuration: "28s",
        }}
      />
      {/* Vignette. Keeps the auras from washing the edges out. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 92% at 50% 0%, transparent 38%, rgba(8,6,13,0.78) 100%)",
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
      opacity: 0.14 + next() * 0.34,
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
          <stop offset="0%" stopColor="#f2d384" stopOpacity="0" />
          <stop offset="26%" stopColor="#f2d384" stopOpacity="1" />
          <stop offset="58%" stopColor="#f0b8c4" stopOpacity="0.85" />
          <stop offset="84%" stopColor="#b89ae8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#b89ae8" stopOpacity="0" />
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
