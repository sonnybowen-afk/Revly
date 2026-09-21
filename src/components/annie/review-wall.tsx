"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { methodById } from "@/lib/annie-methods";
import type { Review } from "@/lib/annie-reviews";
import {
  REVIEWS,
  REVIEWS_VERIFIED,
  averageRating,
  filterReviews,
  ratingBreakdown,
  reviewedMethodIds,
} from "@/lib/annie-reviews";
import { RATING } from "@/lib/annie-salon";

/** Five stars, with the rating exposed to assistive tech as a number. */
export function Stars({
  rating,
  size = "sm",
  label,
}: {
  rating: number;
  size?: "sm" | "lg";
  label?: string;
}) {
  const px = size === "lg" ? "size-5" : "size-3.5";
  return (
    <span
      role="img"
      aria-label={label ?? `${rating} out of 5`}
      className="inline-flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(
            px,
            n <= Math.round(rating)
              ? "fill-primary text-primary"
              : "text-border-strong",
          )}
        />
      ))}
    </span>
  );
}

export function ReviewWall() {
  const [minRating, setMinRating] = useState(0);
  const [methodId, setMethodId] = useState<string | null>(null);

  const methodIds = useMemo(() => reviewedMethodIds(REVIEWS), []);
  const shown = useMemo(
    () =>
      filterReviews(REVIEWS, {
        minRating: minRating || undefined,
        methodId,
      }),
    [minRating, methodId],
  );

  const breakdown = ratingBreakdown(REVIEWS);
  const wallAverage = averageRating(REVIEWS);

  return (
    <div>
      {/* The honest banner. It is the first thing in the component, not a
          footnote, and it disappears on its own once REVIEWS_VERIFIED
          says the wall holds imported reviews. */}
      {!REVIEWS_VERIFIED ? (
        <p className="mb-8 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm leading-relaxed text-warning-soft-foreground">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong className="font-semibold">Sample layout.</strong> The cards
            below are placeholders showing how the wall lays out — they are
            not customer reviews. The{" "}
            <span className="font-technical">{RATING.value}</span> rating from{" "}
            <span className="font-technical">{RATING.count}</span> reviews
            above is real and links to {RATING.source}. Import the real
            reviews to replace these.
          </span>
        </p>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <aside className="space-y-8">
          <div className="annie-card p-6">
            <p className="annie-label">Verified aggregate</p>
            <p className="mt-3 font-display text-5xl leading-none text-primary">
              {RATING.value}
            </p>
            <div className="mt-3">
              <Stars
                rating={RATING.value}
                size="lg"
                label={`${RATING.value} out of 5 from ${RATING.count} reviews on ${RATING.source}`}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              From{" "}
              <a
                href={RATING.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline underline-offset-4 transition-colors duration-200 hover:text-primary-hover"
              >
                {RATING.count} reviews on {RATING.source}
              </a>
            </p>
          </div>

          <div>
            <p className="annie-label">This wall</p>
            <ul className="mt-4 space-y-2">
              {breakdown.map((row) => (
                <li key={row.stars} className="flex items-center gap-3 text-sm">
                  <span className="font-technical w-6 shrink-0 tabular-nums text-muted-foreground">
                    {row.stars}
                    <span className="sr-only"> star</span>
                  </span>
                  <span
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={`${row.count} at ${row.stars} stars, ${row.percent} percent`}
                  >
                    <span
                      className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                      style={{ width: `${row.percent}%` }}
                    />
                  </span>
                  <span className="font-technical w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              {REVIEWS.length} shown, averaging{" "}
              <span className="font-technical">{wallAverage}</span>.
            </p>
          </div>

          <fieldset>
            <legend className="annie-label mb-3">Filter</legend>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={minRating === 0 && methodId === null}
                onClick={() => {
                  setMinRating(0);
                  setMethodId(null);
                }}
              >
                Everything
              </Chip>
              <Chip
                selected={minRating === 5}
                onClick={() => setMinRating(minRating === 5 ? 0 : 5)}
              >
                5 stars only
              </Chip>
              {methodIds.map((id) => {
                const method = methodById(id);
                if (!method) return null;
                return (
                  <Chip
                    key={id}
                    selected={methodId === id}
                    onClick={() => setMethodId(methodId === id ? null : id)}
                  >
                    {method.name}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        </aside>

        <div>
          <p className="sr-only" aria-live="polite">
            {shown.length} reviews shown
          </p>
          {shown.length === 0 ? (
            <div className="annie-card p-10 text-center">
              <p className="font-display text-xl">Nothing matches that</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try clearing the filter to see every review again.
              </p>
            </div>
          ) : (
            <ul className="columns-1 gap-5 md:columns-2 [&>li]:mb-5 [&>li]:break-inside-avoid">
              {shown.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const method = review.methodId ? methodById(review.methodId) : undefined;
  return (
    <li className="annie-card annie-lift p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <span className="annie-label text-[0.55rem]">{review.source}</span>
      </div>
      <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-foreground">
        {review.body}
      </blockquote>
      <footer className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
        <cite className="not-italic">{review.author}</cite>
        <span aria-hidden="true">·</span>
        <time dateTime={review.date} className="font-technical">
          {new Date(`${review.date}T00:00:00Z`).toLocaleDateString("en-GB", {
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })}
        </time>
        {method ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-primary">{method.name}</span>
          </>
        ) : null}
      </footer>
    </li>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        selected
          ? "border-primary bg-primary text-on-primary"
          : "border-card-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
