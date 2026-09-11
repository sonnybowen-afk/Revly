/**
 * Scheduler tests. Run with:  npm run test
 *
 * Node's built-in runner with type stripping — no test framework dependency.
 * Every case pins `now` and `random` so the scheduler is fully deterministic.
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  DAY,
  DEFAULT_CONFIG,
  MINUTE,
  buildQueue,
  countDue,
  createCardState,
  forecast,
  formatDelay,
  previewIntervals,
  retentionRate,
  reviewCard,
  type CardState,
} from "./srs.ts";

const NOW = 1_700_000_000_000;
const fixedRandom = () => 0.5; // no fuzz displacement at the midpoint

function review(card: CardState, grade: Parameters<typeof reviewCard>[1]) {
  return reviewCard(card, grade, { now: NOW, random: fixedRandom });
}

test("a new card starts due immediately with the default ease", () => {
  const card = createCardState(NOW);
  assert.equal(card.phase, "new");
  assert.equal(card.due, NOW);
  assert.equal(card.ease, DEFAULT_CONFIG.startingEase);
  assert.equal(card.reps, 0);
});

test("new + good walks onto the second learning step, not into review", () => {
  const next = review(createCardState(NOW), "good");
  assert.equal(next.phase, "learning");
  assert.equal(next.step, 1);
  assert.equal(next.due, NOW + DEFAULT_CONFIG.learningSteps[1] * MINUTE);
  // Still not a real repetition — it hasn't graduated yet.
  assert.equal(next.reps, 0);
});

test("good on the final learning step graduates to the 1-day interval", () => {
  let card = review(createCardState(NOW), "good"); // step 0 -> 1
  card = review(card, "good"); // graduates
  assert.equal(card.phase, "review");
  assert.equal(card.interval, DEFAULT_CONFIG.graduatingInterval);
  assert.equal(card.due, NOW + DEFAULT_CONFIG.graduatingInterval * DAY);
  assert.equal(card.reps, 1);
});

test("easy on a new card skips the ladder straight to the easy interval", () => {
  const card = review(createCardState(NOW), "easy");
  assert.equal(card.phase, "review");
  assert.equal(card.interval, DEFAULT_CONFIG.easyInterval);
  assert.equal(card.ease, 2.65); // 2.5 + 0.15
});

test("again on a learning card returns it to the first step", () => {
  let card = review(createCardState(NOW), "good");
  assert.equal(card.step, 1);
  card = review(card, "again");
  assert.equal(card.step, 0);
  assert.equal(card.phase, "learning");
  assert.equal(card.due, NOW + DEFAULT_CONFIG.learningSteps[0] * MINUTE);
});

test("review intervals compound by the ease factor", () => {
  const card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 10,
    ease: 2.5,
    reps: 3,
  };
  const next = review(card, "good");
  // 10 * 2.5 = 25 days, ease untouched because "good" is the neutral grade.
  assert.equal(next.interval, 25);
  assert.equal(next.ease, 2.5);
});

test("hard shrinks growth and nudges ease down", () => {
  const card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 10,
    ease: 2.5,
    reps: 3,
  };
  const next = review(card, "hard");
  assert.equal(next.interval, 12); // 10 * 1.2
  assert.equal(next.ease, 2.35); // 2.5 - 0.15
});

test("easy applies the bonus on top of ease", () => {
  const card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 10,
    ease: 2.5,
    reps: 3,
  };
  const next = review(card, "easy");
  // 10 * (2.5 + 0.15) * 1.3 = 34.45 -> 34
  assert.equal(next.ease, 2.65);
  assert.equal(next.interval, 34);
});

test("a lapse retains half the interval and enters relearning", () => {
  const card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 30,
    ease: 2.5,
    reps: 5,
  };
  const next = review(card, "again");
  assert.equal(next.phase, "relearning");
  assert.equal(next.lapses, 1);
  assert.equal(next.interval, 15); // 30 * 0.5 retained, not reset to zero
  assert.equal(next.ease, 2.3); // 2.5 - 0.2
  assert.equal(next.due, NOW + DEFAULT_CONFIG.relearningSteps[0] * MINUTE);
});

test("relearning resumes at the retained interval rather than day one", () => {
  let card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 30,
    ease: 2.5,
    reps: 5,
  };
  card = review(card, "again"); // -> relearning, interval retained at 15
  card = review(card, "good"); // single relearning step, so it graduates
  assert.equal(card.phase, "review");
  assert.equal(card.interval, 15);
});

test("ease never falls below the configured floor", () => {
  let card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 5,
    ease: 1.35,
    reps: 2,
  };
  for (let i = 0; i < 10; i += 1) {
    card = { ...review(card, "hard"), phase: "review" };
  }
  assert.equal(card.ease, DEFAULT_CONFIG.minimumEase);
  assert.ok(card.ease >= 1.3);
});

test("intervals always advance by at least a day", () => {
  const card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 1,
    ease: 1.3,
    reps: 1,
  };
  const next = review(card, "hard");
  // 1 * 1.2 = 1.2 would round back to 1, which would stall the card forever.
  assert.ok(next.interval >= 2, `expected >= 2, got ${next.interval}`);
});

test("intervals are capped at the configured maximum", () => {
  const card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: DEFAULT_CONFIG.maximumInterval,
    ease: 2.5,
    reps: 40,
  };
  const next = review(card, "easy");
  assert.equal(next.interval, DEFAULT_CONFIG.maximumInterval);
});

test("fuzz keeps intervals within the configured spread", () => {
  const card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 100,
    ease: 2.5,
    reps: 8,
  };
  const low = reviewCard(card, "good", { now: NOW, random: () => 0 });
  const high = reviewCard(card, "good", { now: NOW, random: () => 1 });
  // Base is 250 days; ±5% puts the band at roughly 237–263.
  assert.ok(low.interval >= 237 && low.interval <= 250, `low=${low.interval}`);
  assert.ok(
    high.interval >= 250 && high.interval <= 263,
    `high=${high.interval}`,
  );
});

test("preview matches what the scheduler actually does", () => {
  const card: CardState = {
    ...createCardState(NOW),
    phase: "review",
    interval: 10,
    ease: 2.5,
    reps: 3,
  };
  const preview = previewIntervals(card, { now: NOW });
  assert.equal(preview.good, "25d");
  assert.equal(preview.hard, "12d");
  assert.equal(preview.again, "10m");
});

test("due counts split correctly by phase", () => {
  const cards: CardState[] = [
    { ...createCardState(NOW), phase: "new" },
    { ...createCardState(NOW), phase: "learning" },
    { ...createCardState(NOW), phase: "review" },
    { ...createCardState(NOW), phase: "review", due: NOW + 5 * DAY }, // not due
  ];
  const counts = countDue(cards, NOW);
  assert.deepEqual(counts, { new: 1, learning: 1, review: 1, total: 3 });
});

test("queue orders learning first, then oldest reviews, then new", () => {
  const mk = (phase: CardState["phase"], due: number, id: string) => ({
    id,
    state: { ...createCardState(NOW), phase, due },
  });
  const queue = buildQueue(
    [
      mk("new", NOW, "n1"),
      mk("review", NOW - 2 * DAY, "r-old"),
      mk("learning", NOW, "l1"),
      mk("review", NOW - 1 * DAY, "r-new"),
    ],
    { now: NOW },
  );
  assert.deepEqual(
    queue.map((c) => c.id),
    ["l1", "r-old", "r-new", "n1"],
  );
});

test("queue respects the daily new-card intake limit", () => {
  const cards = Array.from({ length: 50 }, (_, i) => ({
    id: `n${i}`,
    state: createCardState(NOW),
  }));
  assert.equal(buildQueue(cards, { now: NOW, newLimit: 20 }).length, 20);
});

test("overdue cards land in today's forecast bucket, never a negative one", () => {
  const cards: CardState[] = [
    { ...createCardState(NOW), phase: "review", due: NOW - 10 * DAY },
    { ...createCardState(NOW), phase: "review", due: NOW + 2 * DAY },
    { ...createCardState(NOW), phase: "new", due: NOW }, // new cards excluded
  ];
  const buckets = forecast(cards, 7, NOW);
  assert.equal(buckets[0].count, 1);
  assert.equal(buckets[2].count, 1);
  assert.equal(buckets.reduce((s, b) => s + b.count, 0), 2);
});

test("retention is null until something has graduated", () => {
  assert.equal(retentionRate([createCardState(NOW)]), null);
  const studied: CardState = { ...createCardState(NOW), reps: 9, lapses: 1 };
  assert.equal(retentionRate([studied]), 90);
});

test("delays format at a human scale", () => {
  assert.equal(formatDelay(30_000), "<1m");
  assert.equal(formatDelay(10 * MINUTE), "10m");
  assert.equal(formatDelay(3 * DAY), "3d");
  assert.equal(formatDelay(60 * DAY), "2.0mo");
  assert.equal(formatDelay(730 * DAY), "2.0y");
});
