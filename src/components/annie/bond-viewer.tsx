"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Method } from "@/lib/annie-methods";
import { METHODS, methodById } from "@/lib/annie-methods";

/**
 * A head you can zoom into, down to the bond at the root.
 *
 * This exists because the one thing no photograph in the gallery shows
 * is the bond itself — you cannot see a nano ring in a picture of a
 * finished head, which is exactly the thing people want to understand
 * before they book. Rather than leave five empty photo slots waiting for
 * a macro lens, the site draws it.
 *
 * ── Roughly to scale, on purpose ──────────────────────────────────────
 * The head is 190 units across, standing in for about 220mm, so one unit
 * is a little over a millimetre. A nano ring is drawn at ~3 units because
 * a nano ring really is about 3mm. At the default zoom it is a speck —
 * and that is the honest answer to "will anyone see it?". The zoom is
 * what makes it legible, not an exaggerated drawing.
 *
 * ── How the zoom works ────────────────────────────────────────────────
 * The viewBox stays put and a group is scaled around the bond, so the
 * browser can transition it on the compositor. Animating the viewBox
 * instead would mean a JavaScript loop and a repaint every frame.
 *
 * It is an illustration and says so. It is not a photograph of Annie's
 * work, and nothing on the page implies it is.
 */

/** The point everything zooms towards: a parting, left of the crown. */
const FOCUS = { x: 168, y: 156 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 24;

/**
 * The hair mass is 192 units across and a head is about 150mm across the
 * back, so one user unit is a shade under a millimetre. Every bond below
 * is drawn against that, which is what lets the scale bar be honest.
 */
const MM_PER_UNIT = 150 / 192;
/** The on-screen scale bar, in user units. Fixed; the label changes. */
const SCALE_BAR = 60;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function BondViewer({
  initialMethod,
  className,
}: {
  initialMethod?: string;
  className?: string;
}) {
  const [methodId, setMethodId] = useState(
    initialMethod && methodById(initialMethod) ? initialMethod : METHODS[0].id,
  );
  const [zoom, setZoom] = useState(1);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const method = methodById(methodId) ?? METHODS[0];
  const sliderId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  // The parallax tilt is a desktop nicety. No hover, no tilt; reduced
  // motion, no tilt either.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTiltEnabled(fine && !still);
  }, []);

  useEffect(() => {
    if (!tiltEnabled) return;
    const node = frameRef.current;
    if (!node) return;
    let frame = 0;
    let next = { x: 0, y: 0 };
    const write = () => {
      frame = 0;
      setTilt(next);
    };
    const onMove = (e: PointerEvent) => {
      const box = node.getBoundingClientRect();
      // −1..1 across the frame, then a gentle 7 degrees either way.
      next = {
        y: ((e.clientX - box.left) / box.width - 0.5) * 14,
        x: -((e.clientY - box.top) / box.height - 0.5) * 10,
      };
      if (!frame) frame = requestAnimationFrame(write);
    };
    const onLeave = () => {
      next = { x: 0, y: 0 };
      if (!frame) frame = requestAnimationFrame(write);
    };
    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tiltEnabled]);

  const step = (delta: number) =>
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((z + delta) * 10) / 10)));

  // Annotations would be illegible over a whole head, so they wait.
  const close = zoom >= 4;
  // Zooming a painted hair mass just gives you a bigger painted hair
  // mass. So the far view fades out and a macro view of the scalp fades
  // in, which is what actually happens when you put your face closer.
  const farOpacity = clamp01(1 - (zoom - 2.2) / 2.2);
  const nearOpacity = clamp01((zoom - 2.6) / 2.4);

  return (
    <div className={cn("annie-card p-5 md:p-7", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="annie-label">Zoom into the bond</p>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            Drawn roughly to scale &mdash; a nano ring really is about
            three millimetres. Zoom in to see how {method.name} sits at
            the root.
          </p>
        </div>
        <span className="annie-label shrink-0 text-[0.55rem] text-muted-foreground">
          Illustration
        </span>
      </div>

      <div
        ref={frameRef}
        className="relative mt-5 overflow-hidden rounded-2xl border border-card-border bg-background-subtle"
        style={{ perspective: "1200px" }}
      >
        <svg
          viewBox="0 0 400 460"
          className="block w-full"
          role="img"
          aria-label={`Illustration of a head seen from behind, zoomed ${zoom.toFixed(1)} times, showing how a ${method.name} bond sits at the root.`}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
            transformStyle: "preserve-3d",
          }}
        >
          <defs>
            <radialGradient id="bv-scalp" cx="42%" cy="30%" r="72%">
              <stop offset="0%" stopColor="#f6e2d4" />
              <stop offset="100%" stopColor="#e2c3ae" />
            </radialGradient>
            <linearGradient id="bv-hair" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#8a6a3a" />
              <stop offset="45%" stopColor="#b08a4e" />
              <stop offset="100%" stopColor="#d9b877" />
            </linearGradient>
            <linearGradient id="bv-ext" x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0%" stopColor="#c9a227" />
              <stop offset="100%" stopColor="#efd79a" />
            </linearGradient>
            <linearGradient id="bv-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f3e3b4" />
              <stop offset="45%" stopColor="#b8901f" />
              <stop offset="100%" stopColor="#8a6a12" />
            </linearGradient>
          </defs>

          <g
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${FOCUS.x}px ${FOCUS.y}px`,
              transition: "transform 620ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <g style={{ opacity: farOpacity, transition: "opacity 420ms ease-out" }}>
              <Head />
              {/* A reticle, so you can see where the zoom is heading. */}
              <circle
                cx={FOCUS.x}
                cy={FOCUS.y}
                r="13"
                fill="none"
                stroke="#8a6a12"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                opacity="0.8"
              />
            </g>
            <g style={{ opacity: nearOpacity, transition: "opacity 420ms ease-out" }}>
              <Macro />
              <Bond method={method} />
            </g>
          </g>

          {/* Outside the scaled group, so the bar stays the same length
              on screen and only its label changes — which is what makes
              it a scale bar rather than a decoration. */}
          <g transform="translate(18 438)">
            <line x1="0" y1="0" x2={SCALE_BAR} y2="0" stroke="#7b6569" strokeWidth="1.4" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#7b6569" strokeWidth="1.4" />
            <line x1={SCALE_BAR} y1="-4" x2={SCALE_BAR} y2="4" stroke="#7b6569" strokeWidth="1.4" />
            <text
              x={SCALE_BAR + 8}
              y="4"
              fill="#7b6569"
              fontSize="12"
              fontFamily="var(--font-technical)"
            >
              {formatMm((SCALE_BAR / zoom) * MM_PER_UNIT)}
            </text>
          </g>
        </svg>

        <span className="font-technical pointer-events-none absolute right-3 bottom-3 rounded-full bg-background/80 px-2.5 py-1 text-[0.65rem] text-muted-foreground backdrop-blur-sm">
          {zoom.toFixed(1)}&times;
        </span>
      </div>

      {close ? (
        <p className="mt-4 rounded-xl border border-[var(--gold-hairline)] bg-primary-soft/40 p-4 text-sm leading-relaxed">
          <span className="annie-label text-[0.55rem]">{method.name}</span>
          <span className="mt-1.5 block text-muted-foreground">
            {BOND_NOTES[method.id] ?? method.summary}
          </span>
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={zoom <= MIN_ZOOM}
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-card-border transition-colors duration-200 hover:border-primary/50 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Minus aria-hidden="true" className="size-4" />
          <span className="sr-only">Zoom out</span>
        </button>

        <label htmlFor={sliderId} className="sr-only">
          Zoom level
        </label>
        <input
          id={sliderId}
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-valuetext={`${zoom.toFixed(1)} times`}
          className="h-11 flex-1 cursor-ew-resize accent-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />

        <button
          type="button"
          onClick={() => step(1)}
          disabled={zoom >= MAX_ZOOM}
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-card-border transition-colors duration-200 hover:border-primary/50 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus aria-hidden="true" className="size-4" />
          <span className="sr-only">Zoom in</span>
        </button>

        <button
          type="button"
          onClick={() => setZoom(1)}
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-card-border transition-colors duration-200 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          <span className="sr-only">Reset the zoom</span>
        </button>
      </div>

      <fieldset className="mt-5">
        <legend className="annie-label mb-3">Bond</legend>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={m.id === methodId}
              onClick={() => {
                setMethodId(m.id);
                // Jump in close on a switch: comparing bonds is the
                // whole point, and doing it at 1× shows nothing.
                setZoom((z) => (z < 10 ? 14 : z));
              }}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                m.id === methodId
                  ? "border-primary bg-primary text-on-primary"
                  : "border-card-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {m.name}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** What you are actually looking at, once you are close enough to see it. */
const BOND_NOTES: Record<string, string> = {
  "la-weave":
    "A row of tiny rings threaded along your own hair, with a continuous weft sewn onto the row. The weight sits on the row, not on single strands.",
  "nano-rings":
    "A nano-sized ring clamped onto a few of your own hairs. Around 90% smaller than a micro ring, which is why it disappears in a parting.",
  "micro-rings":
    "A small copper ring clamped flat over your own hair and the extension strand together. Nothing melted, nothing glued.",
  "mini-tip":
    "A pre-tipped strand held in a ring rather than melted on, so the bond stays small and sits close to the root.",
  "tape-in":
    "Two pre-taped wefts placed back to back around a thin section of your own hair, so the join lies completely flat.",
};

/** Millimetres, to a sensible number of figures for the magnification. */
function formatMm(mm: number): string {
  if (mm >= 10) return `${mm.toFixed(0)} mm`;
  if (mm >= 1) return `${mm.toFixed(1)} mm`;
  return `${mm.toFixed(2)} mm`;
}

/**
 * The head, seen from behind.
 *
 * Every strand is clipped to the hair mass, which is the difference
 * between hair and a handful of lines escaping past the shoulders.
 */
function Head() {
  // Deterministic strands: same seed, same head, server and client.
  let seed = 424242;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const strands = Array.from({ length: 54 }, () => {
    const x = 106 + next() * 188;
    const sway = (next() - 0.5) * 34;
    const end = 290 + next() * 120;
    return {
      d: `M ${x.toFixed(1)} ${(96 + next() * 46).toFixed(1)} C ${(x + sway).toFixed(1)} 220, ${(x - sway * 0.6).toFixed(1)} 300, ${(x + sway * 0.35).toFixed(1)} ${end.toFixed(1)}`,
      w: 0.5 + next() * 1.0,
      o: 0.14 + next() * 0.34,
    };
  });

  const HAIR =
    "M 200 34 C 264 34, 298 90, 298 156 C 298 224, 308 312, 318 404 C 280 416, 240 420, 200 420 C 160 420, 120 416, 82 404 C 92 312, 102 224, 102 156 C 102 90, 136 34, 200 34 Z";

  return (
    <g>
      <defs>
        <clipPath id="bv-hairclip">
          <path d={HAIR} />
        </clipPath>
      </defs>

      {/* Shoulders, behind the hair. */}
      <path
        d="M 44 460 C 62 400, 130 372, 200 372 C 270 372, 338 400, 356 460 Z"
        fill="#e7d6c6"
      />
      {/* Neck. */}
      <path d="M 172 236 L 228 236 L 232 384 L 168 384 Z" fill="#e8c9b3" />
      {/* Scalp, which only shows at the parting. */}
      <ellipse cx="200" cy="152" rx="94" ry="112" fill="url(#bv-scalp)" />

      {/* The hair mass. */}
      <path d={HAIR} fill="url(#bv-hair)" />

      <g clipPath="url(#bv-hairclip)">
        {/* A sheen band across the crown — what sells it as round. */}
        <ellipse cx="186" cy="150" rx="78" ry="54" fill="#e8c98a" opacity="0.22" />
        <ellipse cx="176" cy="128" rx="44" ry="26" fill="#f6e3b8" opacity="0.28" />
        {/* Shadow down both sides, for the same reason. */}
        <path d="M 102 60 L 138 60 L 126 420 L 82 404 Z" fill="#6b4e26" opacity="0.22" />
        <path d="M 298 60 L 262 60 L 274 420 L 318 404 Z" fill="#6b4e26" opacity="0.26" />

        {strands.map((s, i) => (
          <path
            key={i}
            d={s.d}
            stroke="#6b4e26"
            strokeWidth={s.w}
            strokeLinecap="round"
            fill="none"
            opacity={s.o}
          />
        ))}

        {/* A short parting at the crown, where the bond sits. */}
        <path
          d={`M ${FOCUS.x + 2} 70 C ${FOCUS.x} 100, ${FOCUS.x - 1} 130, ${FOCUS.x} ${FOCUS.y}`}
          stroke="#e2c3ae"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </g>
    </g>
  );
}

/**
 * The macro view: scalp, and the individual hairs growing out of it.
 *
 * Drawn at the same scale as the head, centred on the bond, so the zoom
 * genuinely magnifies rather than swapping in a different picture.
 */
function Macro() {
  const { x, y } = FOCUS;
  let seed = 90210;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  return (
    <g>
      {/* Skin, with the parting running through it. */}
      <rect
        x={x - 46}
        y={y - 46}
        width="92"
        height="110"
        fill="url(#bv-scalp)"
        rx="4"
      />
      {/* A few follicle shadows, so it is not a flat swatch. */}
      {Array.from({ length: 26 }, (_, i) => {
        const px = x - 42 + next() * 84;
        const py = y - 42 + next() * 96;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={0.5 + next() * 0.4}
            ry={0.35 + next() * 0.3}
            fill="#c49a7c"
            opacity={0.18 + next() * 0.16}
          />
        );
      })}
      {/* Your own hair, growing out and falling away. */}
      {Array.from({ length: 22 }, (_, i) => {
        const px = x - 40 + next() * 80;
        const sway = (next() - 0.5) * 10;
        return (
          <path
            key={i}
            d={`M ${px.toFixed(1)} ${(y - 40 + next() * 24).toFixed(1)} C ${(px + sway).toFixed(1)} ${y + 6}, ${(px - sway).toFixed(1)} ${y + 30}, ${(px + sway * 0.6).toFixed(1)} ${y + 62}`}
            stroke="#6b4e26"
            strokeWidth={0.22 + next() * 0.16}
            strokeLinecap="round"
            fill="none"
            opacity={0.5 + next() * 0.35}
          />
        );
      })}
    </g>
  );
}

/**
 * The bond itself, at the focus point.
 *
 * Sized in the same units as the head, so a nano ring is genuinely
 * smaller than a micro ring on screen rather than just labelled so.
 */
function Bond({ method }: { method: Method }) {
  const { x, y } = FOCUS;

  /** Your own hair, running through the bond. */
  const own = (
    <>
      {[-3, -1.2, 0.6, 2.4].map((dx, i) => (
        <path
          key={i}
          d={`M ${x + dx} ${y - 14} C ${x + dx - 1} ${y}, ${x + dx + 1.5} ${y + 16}, ${x + dx - 0.5} ${y + 34}`}
          stroke="#6b4e26"
          strokeWidth="0.32"
          fill="none"
          opacity="0.8"
        />
      ))}
    </>
  );

  /** The added hair, in gold so the two are told apart. */
  const added = (offset: number, count = 5) => (
    <>
      {Array.from({ length: count }, (_, i) => {
        const dx = offset + (i - count / 2) * 0.9;
        return (
          <path
            key={i}
            d={`M ${x + dx} ${y + 2} C ${x + dx + 1.5} ${y + 14}, ${x + dx - 1} ${y + 26}, ${x + dx + 0.8} ${y + 40}`}
            stroke="url(#bv-ext)"
            strokeWidth="0.34"
            fill="none"
            opacity="0.95"
          />
        );
      })}
    </>
  );

  switch (method.id) {
    case "nano-rings":
      return (
        <g>
          {own}
          {added(0.6)}
          {/* ~3mm across. Deliberately tiny at low zoom. */}
          <rect
            x={x - 1.5}
            y={y - 1.1}
            width="3"
            height="2.2"
            rx="0.9"
            fill="url(#bv-metal)"
          />
        </g>
      );

    case "micro-rings":
      return (
        <g>
          {own}
          {added(0.6)}
          <rect
            x={x - 2.6}
            y={y - 1.9}
            width="5.2"
            height="3.8"
            rx="1.5"
            fill="url(#bv-metal)"
          />
        </g>
      );

    case "mini-tip":
      return (
        <g>
          {own}
          {added(0.8)}
          {/* The keratin tip, then the ring holding it. */}
          <path
            d={`M ${x + 0.4} ${y - 4} L ${x + 1.8} ${y + 1} L ${x - 1} ${y + 1} Z`}
            fill="#e8d3a8"
            opacity="0.95"
          />
          <rect
            x={x - 2.2}
            y={y - 1.4}
            width="4.4"
            height="3.2"
            rx="1.3"
            fill="url(#bv-metal)"
          />
        </g>
      );

    case "tape-in":
      return (
        <g>
          {own}
          {added(0, 9)}
          {/* Two panels, sandwiching a thin section of your own hair. */}
          <rect
            x={x - 7}
            y={y - 3.4}
            width="14"
            height="2.6"
            rx="0.7"
            fill="#d8c49a"
            stroke="#a8811a"
            strokeWidth="0.25"
          />
          <rect
            x={x - 7}
            y={y + 0.8}
            width="14"
            height="2.6"
            rx="0.7"
            fill="#d8c49a"
            stroke="#a8811a"
            strokeWidth="0.25"
          />
        </g>
      );

    case "la-weave":
    default:
      return (
        <g>
          {own}
          {/* A row of rings, the thread through them, and the weft. */}
          {[-10, -5, 0, 5, 10].map((dx) => (
            <rect
              key={dx}
              x={x + dx - 1.6}
              y={y - 1.3}
              width="3.2"
              height="2.6"
              rx="1"
              fill="url(#bv-metal)"
            />
          ))}
          <path
            d={`M ${x - 13} ${y + 2.4} L ${x + 13} ${y + 2.4}`}
            stroke="#8a6a12"
            strokeWidth="0.5"
          />
          <rect
            x={x - 13}
            y={y + 2.8}
            width="26"
            height="1.6"
            rx="0.6"
            fill="#c9a227"
            opacity="0.9"
          />
          {added(-9, 4)}
          {added(-3, 4)}
          {added(3, 4)}
          {added(9, 4)}
        </g>
      );
  }
}
