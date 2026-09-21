/**
 * Reviews for the salon site.
 *
 * ── Read this before adding content ───────────────────────────────────
 * Putting invented testimonials on a real business's website is a lie
 * about real customers, so this module will not do it. Two things are
 * kept strictly apart:
 *
 *   • VERIFIED — the aggregate rating, which is real, and carries the
 *     platform it came from so the page can always say where it got it.
 *   • SAMPLE   — placeholder rows that exist so the wall has something to
 *     lay out during development. REVIEWS_VERIFIED is false while they are
 *     in place, and the UI must show the sample ribbon and must not present
 *     them as customer quotes.
 *
 * To go live: export the real reviews from Treatwell/Fresha/Google into
 * REVIEWS in the same shape, then set REVIEWS_VERIFIED to true. The ribbon
 * disappears on its own. See README-annie.md.
 */

import { RATING } from "./annie-salon.ts";

/** False while REVIEWS holds sample rows rather than imported ones. */
export const REVIEWS_VERIFIED = false;

export type Review = {
  readonly id: string;
  /** First name and last initial, as the review platforms publish them. */
  readonly author: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly body: string;
  /** ISO date, "YYYY-MM-DD". */
  readonly date: string;
  /** Method id from annie-methods.ts, or null when unstated. */
  readonly methodId: string | null;
  readonly source: string;
};

/**
 * Placeholder rows. Every body here is written as an obvious layout
 * placeholder rather than as a plausible customer voice — that is
 * deliberate, so nothing here can be mistaken for a real review if it ever
 * reaches production by accident.
 */
export const REVIEWS: readonly Review[] = [
  {
    id: "sample-1",
    author: "Sample review",
    rating: 5,
    body: "Placeholder row — replace with a real five-star review imported from Treatwell. This text is here to size the card and nothing else.",
    date: "2026-08-14",
    methodId: "nano-rings",
    source: "Sample",
  },
  {
    id: "sample-2",
    author: "Sample review",
    rating: 5,
    body: "Placeholder row — replace with a real review. Long enough to show how a two-line card wraps against a short one on a narrow screen.",
    date: "2026-07-02",
    methodId: "la-weave",
    source: "Sample",
  },
  {
    id: "sample-3",
    author: "Sample review",
    rating: 4,
    body: "Placeholder row — replace with a real four-star review, so the wall is not made up only of fives.",
    date: "2026-06-19",
    methodId: "tape-in",
    source: "Sample",
  },
  {
    id: "sample-4",
    author: "Sample review",
    rating: 5,
    body: "Placeholder row — replace with a real review mentioning a mini-tip set.",
    date: "2026-05-30",
    methodId: "mini-tip",
    source: "Sample",
  },
  {
    id: "sample-5",
    author: "Sample review",
    rating: 5,
    body: "Placeholder row — replace with a real review. Short one.",
    date: "2026-05-08",
    methodId: "micro-rings",
    source: "Sample",
  },
  {
    id: "sample-6",
    author: "Sample review",
    rating: 5,
    body: "Placeholder row — replace with a real review that does not name a method, to exercise the unfiltered case.",
    date: "2026-04-21",
    methodId: null,
    source: "Sample",
  },
];

/**
 * What reviewers consistently bring up, drawn from the published summaries
 * of the salon's own review profiles. These are themes across many
 * reviews, not quotes from any one person, which is why each carries the
 * platform it was summarised from.
 */
export const REVIEW_THEMES = [
  {
    id: "longevity",
    label: "How long the hair lasts",
    detail:
      "Reviewers repeatedly single out how long the hair keeps going — good-quality sets measured in years rather than months.",
    source: RATING.source,
  },
  {
    id: "value",
    label: "Price against the city centre",
    detail:
      "The most common note across the profiles is value: the standard of the fitting set against what the rest of Manchester charges.",
    source: RATING.source,
  },
  {
    id: "welcome",
    label: "The welcome",
    detail:
      "The atmosphere comes up as often as the hair does — reviewers describe the studio as warm and unhurried.",
    source: RATING.source,
  },
  {
    id: "colour-match",
    label: "Matching the colour",
    detail:
      "Annie matching the shade and blend by eye, in person, is called out again and again.",
    source: RATING.source,
  },
] as const;

export type RatingBreakdown = {
  readonly stars: 1 | 2 | 3 | 4 | 5;
  readonly count: number;
  /** 0–100, rounded. */
  readonly percent: number;
};

/** How many of each star rating, highest first, with percentages. */
export function ratingBreakdown(
  reviews: readonly Review[],
): readonly RatingBreakdown[] {
  const total = reviews.length;
  const stars: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];
  return stars.map((s) => {
    const count = reviews.filter((r) => r.rating === s).length;
    return {
      stars: s,
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });
}

/** Mean rating of a set of reviews, to one decimal place. 0 when empty. */
export function averageRating(reviews: readonly Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export type ReviewFilter = {
  /** Only reviews at or above this rating. */
  readonly minRating?: number;
  /** Only reviews naming this method. */
  readonly methodId?: string | null;
};

/** Filtered, newest first. Sorting is stable on id so renders don't jitter. */
export function filterReviews(
  reviews: readonly Review[],
  filter: ReviewFilter = {},
): readonly Review[] {
  return reviews
    .filter((r) => (filter.minRating === undefined ? true : r.rating >= filter.minRating))
    .filter((r) =>
      filter.methodId === undefined || filter.methodId === null
        ? true
        : r.methodId === filter.methodId,
    )
    .slice()
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.id.localeCompare(b.id);
    });
}

/** Method ids that at least one review names, in catalogue order. */
export function reviewedMethodIds(
  reviews: readonly Review[],
): readonly string[] {
  const seen: string[] = [];
  for (const r of reviews) {
    if (r.methodId && !seen.includes(r.methodId)) seen.push(r.methodId);
  }
  return seen;
}
