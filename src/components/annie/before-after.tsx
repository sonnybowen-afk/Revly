"use client";

import { useCallback, useId, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhotoId } from "@/lib/annie-photos";
import { brief, photo } from "@/lib/annie-photos";
import { PhotoFrame } from "./ui";

/**
 * Before-and-after comparison.
 *
 * The handle is a real range input rather than a div with pointer
 * handlers. That is the whole accessibility story in one decision: it is
 * focusable, it works with arrow keys, Home and End, it announces itself
 * to a screen reader, and touch drag comes free. The visible handle is
 * drawn on top and the input itself is transparent.
 *
 * The clip is `clip-path: inset(...)` on the top layer, which the
 * compositor handles — dragging never triggers layout.
 */
export function BeforeAfter({
  beforeId,
  afterId,
  beforeCaption,
  afterCaption,
  beforeSrc,
  afterSrc,
  label,
  className,
}: {
  /** Slot ids in the photo manifest, for both halves. */
  beforeId?: PhotoId;
  afterId?: PhotoId;
  beforeCaption?: string;
  afterCaption?: string;
  beforeSrc?: string;
  afterSrc?: string;
  /** What this transformation is, for the slider's accessible name. */
  label: string;
  className?: string;
}) {
  const beforeText = beforeCaption ?? (beforeId ? brief(beforeId) : "");
  const afterText = afterCaption ?? (afterId ? brief(afterId) : "");
  // Both halves must be real photographs before the written briefs go.
  const bothReal =
    Boolean(beforeSrc ?? photo(beforeId)) && Boolean(afterSrc ?? photo(afterId));

  const [position, setPosition] = useState(50);
  const id = useId();
  const frameRef = useRef<HTMLDivElement>(null);

  // Clicking anywhere on the image jumps the handle there, which is what
  // everyone tries first.
  const jumpTo = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, Math.round(next))));
  }, []);

  return (
    <figure className={cn("group", className)}>
      <div
        ref={frameRef}
        onPointerDown={(e) => {
          // Ignore the range input's own pointer events, or the two fight.
          if ((e.target as HTMLElement).tagName !== "INPUT") jumpTo(e.clientX);
        }}
        className="annie-gilt-edge relative overflow-hidden rounded-2xl border border-card-border"
      >
        {/* After — the base layer, fully visible underneath. */}
        {/* `still` matters here: a slow push on one layer and not the
            other would drift the two halves out of register. */}
        <PhotoFrame
          id={afterId}
          caption={afterText}
          src={afterSrc}
          alt={`After: ${label}`}
          ratio="4 / 3"
          className="rounded-none border-0"
          index={1}
          still
          hideCaption
        />

        {/* Before — clipped from the right as the handle moves. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <PhotoFrame
            id={beforeId}
            caption={beforeText}
            src={beforeSrc}
            ratio="4 / 3"
            className="h-full rounded-none border-0"
            index={0}
            still
            hideCaption
          />
        </div>

        {/* The seam, drawn over both layers. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-primary"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary bg-background shadow-[0_0_24px_rgba(227,185,72,0.45)]">
            <MoveHorizontal className="size-4 text-primary" />
          </span>
        </div>

        <span
          aria-hidden="true"
          className="annie-label pointer-events-none absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-[0.55rem] backdrop-blur-sm"
        >
          Before
        </span>
        <span
          aria-hidden="true"
          className="annie-label pointer-events-none absolute top-3 right-3 rounded-full bg-background/80 px-2.5 py-1 text-[0.55rem] backdrop-blur-sm"
        >
          After
        </span>

        {/* The control. Transparent, full-bleed, and the only focusable
            thing in the figure. */}
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label={`Reveal the before and after of ${label}`}
          aria-valuetext={`${position}% towards the after photo`}
          className={cn(
            "absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            // The native thumb is hidden; the drawn handle above is the
            // visible affordance and tracks the same value.
            "[&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:opacity-0",
            "[&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:opacity-0",
          )}
        />
      </div>

      <figcaption className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            Drag, or use the arrow keys
          </span>
        </div>
        {/* The frames carry no overlay of their own here, so the two
            photographs are described below instead. */}
        {bothReal ? null : (
          <dl className="mt-3 grid gap-2 text-xs leading-relaxed text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="annie-label text-[0.55rem]">Photo slot &mdash; before</dt>
              <dd className="mt-1">{beforeText}</dd>
            </div>
            <div>
              <dt className="annie-label text-[0.55rem]">Photo slot &mdash; after</dt>
              <dd className="mt-1">{afterText}</dd>
            </div>
          </dl>
        )}
      </figcaption>
    </figure>
  );
}
