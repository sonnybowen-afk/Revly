import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { RATING } from "./annie-salon.ts";
import type { Review } from "./annie-reviews.ts";
import {
  REVIEWS,
  REVIEWS_VERIFIED,
  REVIEW_THEMES,
  averageRating,
  filterReviews,
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
  it("does not claim the sample rows are real reviews", () => {
    assert.equal(REVIEWS_VERIFIED, false);
  });

  it("marks every shipped row as a sample", () => {
    for (const r of REVIEWS) {
      assert.equal(r.source, "Sample", `${r.id} should be flagged as a sample`);
      assert.match(r.body, /placeholder/i, `${r.id} should read as a placeholder`);
    }
  });

  it("attributes every theme to the platform it was summarised from", () => {
    assert.ok(REVIEW_THEMES.length > 0);
    for (const theme of REVIEW_THEMES) {
      assert.equal(theme.source, RATING.source);
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
