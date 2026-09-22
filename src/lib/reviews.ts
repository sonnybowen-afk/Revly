/**
 * What clients have said, and where each thing came from.
 *
 * ── Two different kinds of evidence, kept apart ───────────────────────
 *   • The AGGREGATE (RATING in salon.ts) — 4.9 from 82 reviews on
 *     Treatwell. Star-rated, third-party, and always shown with its
 *     source and a link.
 *   • The TESTIMONIALS below — messages clients sent Annie directly, by
 *     WhatsApp and Instagram, which she published to her own Instagram
 *     story. They are real and quoted verbatim, but they carry no star
 *     rating, because a message is not a rated review.
 *
 * That distinction is why `rating` is nullable. An earlier version of
 * this file required a 1–5 and would have forced a five-star rating onto
 * messages that never had one — which is exactly the sort of small
 * invention that turns a real testimonial into a fake review.
 *
 * ── Names ─────────────────────────────────────────────────────────────
 * Reduced to a first name, or a first name and last initial, which is the
 * convention review platforms use and the least exposure consistent with
 * the quote still meaning something. One client is unnamed because the
 * screenshot carried no name; the card says where it came from instead.
 *
 * ── Deliberately NOT in the JSON-LD ───────────────────────────────────
 * These are self-published testimonials without ratings. Marking them up
 * as schema.org Review nodes invites a manual penalty and would not earn
 * a rich result anyway. The Treatwell aggregate does that job.
 */

import { RATING } from "./salon.ts";

/** True: every entry below is a real client message, quoted verbatim. */
export const REVIEWS_VERIFIED = true;

export type Review = {
  readonly id: string;
  /** First name, or first name and initial. Null when none was given. */
  readonly author: string | null;
  /** 1–5 where the source carried a rating; null for a plain message. */
  readonly rating: 1 | 2 | 3 | 4 | 5 | null;
  /** Quoted verbatim, typos and all. Do not tidy these up. */
  readonly body: string;
  /** ISO date the salon published it, "YYYY-MM-DD". */
  readonly date: string;
  /** Method id from methods.ts, or null when unstated. */
  readonly methodId: string | null;
  /** Where it came from, in the visitor's words not ours. */
  readonly source: string;
};

export const REVIEWS: readonly Review[] = [
  {
    id: "emily-m",
    author: "Emily M.",
    rating: null,
    body: "Annie's Russian hair is better quality than all the top brands..I know because I've bought it and hers lasts twice as long at least. Quality is amazing and she is a total extensions expert xx",
    date: "2024-03-23",
    methodId: null,
    source: "Instagram message",
  },
  {
    id: "whatsapp-refit",
    author: null,
    rating: null,
    body: "Hey Annie, Just wanted to drop you a message and say thank you so so much for sorting my hair yesterday & for the price you did it at. I absolutely love it (and so does my boyfriend) and i cant believe how natural it looks! I'll see you in 6 weeks for the refit",
    date: "2024-03-21",
    methodId: null,
    source: "WhatsApp message",
  },
  {
    id: "jade",
    author: "Jade",
    rating: null,
    body: "Hair still amazing as ever even after dying it still shiny and smooth I love it",
    date: "2024-03-21",
    methodId: null,
    source: "WhatsApp message",
  },
];

/**
 * What reviewers consistently bring up. The first three are summarised
 * from the published review profiles; the fourth is corroborated by the
 * testimonials above, where two separate clients name the hair itself.
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
    id: "russian-hair",
    label: "The Russian hair",
    detail:
      "Clients who have bought hair elsewhere come back to the quality of Annie's, and to how long it lasts against the brands they had been using.",
    source: "Client messages",
  },
  {
    id: "value",
    label: "Price against the city centre",
    detail:
      "The most common note across the profiles is value: the standard of the fitting set against what the rest of Manchester charges.",
    source: RATING.source,
  },
  {
    id: "natural",
    label: "How natural it looks",
    detail:
      "The blend is what clients mention when they first see it — that it does not read as extensions at all.",
    source: "Client messages",
  },
] as const;

export type RatingBreakdown = {
  readonly stars: 1 | 2 | 3 | 4 | 5;
  readonly count: number;
  /** 0–100, rounded. */
  readonly percent: number;
};

/** Only the entries that actually carry a star rating. */
export function ratedReviews(reviews: readonly Review[]): readonly Review[] {
  return reviews.filter((r) => r.rating !== null);
}

/**
 * How many of each star rating, highest first, with percentages.
 * Unrated messages are excluded — they are not zero-star reviews.
 */
export function ratingBreakdown(
  reviews: readonly Review[],
): readonly RatingBreakdown[] {
  const rated = ratedReviews(reviews);
  const total = rated.length;
  const stars: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];
  return stars.map((s) => {
    const count = rated.filter((r) => r.rating === s).length;
    return {
      stars: s,
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });
}

/** Mean of the rated entries, to one decimal place. 0 when none. */
export function averageRating(reviews: readonly Review[]): number {
  const rated = ratedReviews(reviews);
  if (rated.length === 0) return 0;
  const sum = rated.reduce((acc, r) => acc + (r.rating ?? 0), 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

export type ReviewFilter = {
  /** Only reviews at or above this rating. Excludes unrated entries. */
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
    .filter((r) =>
      filter.minRating === undefined
        ? true
        : r.rating !== null && r.rating >= filter.minRating,
    )
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

/** Method ids that at least one review names, in first-seen order. */
export function reviewedMethodIds(
  reviews: readonly Review[],
): readonly string[] {
  const seen: string[] = [];
  for (const r of reviews) {
    if (r.methodId && !seen.includes(r.methodId)) seen.push(r.methodId);
  }
  return seen;
}
