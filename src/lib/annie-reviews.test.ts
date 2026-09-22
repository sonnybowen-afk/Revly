import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { METHOD_IDS } from "./annie-methods.ts";
import { RATING } from "./annie-salon.ts";
import type { Review } from "./annie-reviews.ts";
import {
  REVIEWS,
  REVIEWS_VERIFIED,
  REVIEW_THEMES,
  averageRating,
  filterReviews,
  ratedReviews,
  ratingBreakdown,
  reviewedMethodIds,
} from "./annie-reviews.ts";

const review = (over: Partial<Review> & Pick<Review, "id">): Review => ({
  author: "Sample review",
  rating: 5,
  body: "Placeholder.",
  date: "2026-01-01",
  methodId: null,
  source: "Sample",
  ...over,
});

describe("review honesty", () => {
  it("ships real client messages, not placeholders", () => {
    assert.equal(REVIEWS_VERIFIED, true);
    assert.ok(REVIEWS.length > 0);
    for (const r of REVIEWS) {
      assert.doesNotMatch(r.body, /placeholder/i, `${r.id}`);
      assert.ok(r.body.length > 40, `${r.id} should be a real quote`);
    }
  });

  it("never invents a star rating for an unrated message", () => {
    // Every entry is a WhatsApp or Instagram message. None carried a
    // rating, so none may claim one.
    for (const r of REVIEWS) {
      if (r.source.includes("message")) {
        assert.equal(r.rating, null, `${r.id} must not claim a rating`);
      }
    }
  });

  it("says where every testimonial came from", () => {
    for (const r of REVIEWS) {
      assert.ok(r.source.length > 0, r.id);
      assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/, r.id);
    }
  });

  it("keeps names to a first name at most", () => {
    for (const r of REVIEWS) {
      if (r.author === null) continue;
      // "Emily M." is fine; "Emily McDermott" is more exposure than a
      // testimonial needs.
      assert.ok(
        /^[A-Z][a-z]+( [A-Z]\.)?$/.test(r.author),
        `${r.id} author "${r.author}" should be a first name, optionally with an initial`,
      );
    }
  });

  it("only names methods that are actually on the price list", () => {
    // Sew-in weave was dropped when the real price list arrived, and a
    // review pointing at a method that no longer exists silently loses
    // its filter chip rather than failing loudly.
    for (const r of REVIEWS) {
      if (r.methodId === null) continue;
      assert.ok(
        METHOD_IDS.includes(r.methodId),
        `${r.id} names "${r.methodId}", which is not a method Annie fits`,
      );
    }
  });

  it("attributes every theme to where it was drawn from", () => {
    assert.ok(REVIEW_THEMES.length > 0);
    // Some themes summarise the platform profiles, others are drawn from
    // the client messages. Either is fine; an unsourced one is not.
    const allowed = [RATING.source, "Client messages"];
    for (const theme of REVIEW_THEMES) {
      assert.ok(
        allowed.includes(theme.source),
        `${theme.id} cites "${theme.source}", which is not a source we hold`,
      );
    }
  });

  it("keeps the real aggregate rating paired with its count and source", () => {
    assert.ok(RATING.value > 0 && RATING.value <= 5);
    assert.ok(RATING.count > 0);
    assert.ok(RATING.source.length > 0);
    assert.match(RATING.sourceUrl, /^https:\/\//);
  });
});

describe("ratingBreakdown", () => {
  it("counts from five stars down", () => {
    const rows = ratingBreakdown([
      review({ id: "a", rating: 5 }),
      review({ id: "b", rating: 5 }),
      review({ id: "c", rating: 4 }),
      review({ id: "d", rating: 1 }),
    ]);
    assert.deepEqual(
      rows.map((r) => [r.stars, r.count]),
      [
        [5, 2],
        [4, 1],
        [3, 0],
        [2, 0],
        [1, 1],
      ],
    );
  });

  it("turns counts into percentages that add up", () => {
    const rows = ratingBreakdown([
      review({ id: "a", rating: 5 }),
      review({ id: "b", rating: 4 }),
    ]);
    assert.equal(rows[0].percent, 50);
    assert.equal(rows[1].percent, 50);
    assert.equal(rows.reduce((n, r) => n + r.percent, 0), 100);
  });

  it("returns zeroes rather than dividing by zero on an empty wall", () => {
    const rows = ratingBreakdown([]);
    assert.equal(rows.length, 5);
    assert.ok(rows.every((r) => r.count === 0 && r.percent === 0));
  });

  it("ignores unrated messages rather than counting them as zero", () => {
    const rows = ratingBreakdown([
      review({ id: "a", rating: 5 }),
      review({ id: "b", rating: null }),
    ]);
    assert.equal(rows[0].count, 1);
    assert.equal(rows[0].percent, 100);
    assert.equal(rows.reduce((n, r) => n + r.count, 0), 1);
  });
});

describe("averageRating", () => {
  it("averages to one decimal place", () => {
    const avg = averageRating([
      review({ id: "a", rating: 5 }),
      review({ id: "b", rating: 4 }),
      review({ id: "c", rating: 5 }),
    ]);
    assert.equal(avg, 4.7);
  });

  it("is 0 for an empty list", () => {
    assert.equal(averageRating([]), 0);
  });

  it("is 0 when nothing carries a rating", () => {
    assert.equal(averageRating([review({ id: "a", rating: null })]), 0);
  });

  it("averages only the rated entries", () => {
    assert.equal(
      averageRating([
        review({ id: "a", rating: 4 }),
        review({ id: "b", rating: null }),
      ]),
      4,
    );
  });
});

describe("filterReviews", () => {
  const rows = [
    review({ id: "old", date: "2026-01-01", rating: 4, methodId: "tape-in" }),
    review({ id: "new", date: "2026-06-01", rating: 5, methodId: "nano-rings" }),
    review({ id: "mid", date: "2026-03-01", rating: 5, methodId: "tape-in" }),
  ];

  it("returns everything when unfiltered", () => {
    assert.equal(filterReviews(rows).length, 3);
  });

  it("sorts newest first", () => {
    assert.deepEqual(
      filterReviews(rows).map((r) => r.id),
      ["new", "mid", "old"],
    );
  });

  it("filters by minimum rating", () => {
    assert.deepEqual(
      filterReviews(rows, { minRating: 5 }).map((r) => r.id),
      ["new", "mid"],
    );
  });

  it("drops unrated messages from a rating filter", () => {
    const mixed = [review({ id: "rated", rating: 5 }), review({ id: "msg", rating: null })];
    assert.deepEqual(
      filterReviews(mixed, { minRating: 5 }).map((r) => r.id),
      ["rated"],
    );
  });

  it("filters by method", () => {
    assert.deepEqual(
      filterReviews(rows, { methodId: "tape-in" }).map((r) => r.id),
      ["mid", "old"],
    );
  });

  it("combines both filters", () => {
    assert.deepEqual(
      filterReviews(rows, { minRating: 5, methodId: "tape-in" }).map((r) => r.id),
      ["mid"],
    );
  });

  it("treats a null method as no method filter", () => {
    assert.equal(filterReviews(rows, { methodId: null }).length, 3);
  });

  it("does not mutate the input", () => {
    const before = rows.map((r) => r.id);
    filterReviews(rows, { minRating: 5 });
    assert.deepEqual(rows.map((r) => r.id), before);
  });

  it("breaks date ties on id so the order is stable", () => {
    const sameDay = [
      review({ id: "b", date: "2026-02-02" }),
      review({ id: "a", date: "2026-02-02" }),
    ];
    assert.deepEqual(filterReviews(sameDay).map((r) => r.id), ["a", "b"]);
  });
});

describe("ratedReviews", () => {
  it("separates the rated entries from the messages", () => {
    const mixed = [review({ id: "a", rating: 5 }), review({ id: "b", rating: null })];
    assert.deepEqual(ratedReviews(mixed).map((r) => r.id), ["a"]);
    assert.deepEqual(ratedReviews(REVIEWS), []);
  });
});

describe("reviewedMethodIds", () => {
  it("lists each named method once, in first-seen order", () => {
    assert.deepEqual(
      reviewedMethodIds([
        review({ id: "a", methodId: "tape-in" }),
        review({ id: "b", methodId: null }),
        review({ id: "c", methodId: "nano-rings" }),
        review({ id: "d", methodId: "tape-in" }),
      ]),
      ["tape-in", "nano-rings"],
    );
  });

  it("is empty when no review names a method", () => {
    assert.deepEqual(reviewedMethodIds([review({ id: "a" })]), []);
  });
});
