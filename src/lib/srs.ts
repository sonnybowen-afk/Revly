/**
 * Revly spaced-repetition engine
 * ══════════════════════════════
 * An SM-2 derivative with Anki-style learning steps and a four-button grade
 * scale. Every function here is PURE — it takes a card plus a grade and
 * returns a new card. Nothing reads the clock or touches storage on its own,
 * which keeps the scheduler deterministic and testable.
 *
 * Reference: Wozniak & Gorzelanczyk, SuperMemo 2 (1990), adapted with the
 * graduated-interval and lapse handling that modern Anki uses.
 */

export const MINUTE = 60_000;
export const DAY = 86_400_000;

/** How well the learner recalled the card. */
export type Grade = "again" | "hard" | "good" | "easy";

export type CardPhase = "new" | "learning" | "review" | "relearning";

export interface CardState {
  /** Scheduling phase the card is currently in. */
  phase: CardPhase;
  /** Index into the learning/relearning step ladder. */
  step: number;
  /** Current inter-repetition interval, in days. 0 while still in steps. */
  interval: number;
  /** SM-2 ease factor. Clamped to a sane floor so cards never death-spiral. */
  ease: number;
  /** Epoch ms when the card next becomes due. */
  due: number;
  /** Total successful reviews since the last lapse. */
  reps: number;
  /** How many times this card has been forgotten after graduating. */
  lapses: number;
  /** Epoch ms of the last review, or null if never seen. */
  lastReviewed: number | null;
}

export interface SchedulerConfig {
  /** Learning ladder for brand-new cards, in minutes. */
  learningSteps: number[];
  /** Ladder used after a lapse, in minutes. */
  relearningSteps: number[];
  /** Interval (days) awarded when a card graduates with "good". */
  graduatingInterval: number;
  /** Interval (days) awarded when a new card is graded "easy" immediately. */
  easyInterval: number;
  /** Starting ease factor. */
  startingEase: number;
  /** Lowest ease a card may fall to. */
  minimumEase: number;
  /** Multiplier applied to the interval on "hard". */
  hardMultiplier: number;
  /** Extra multiplier applied on top of ease for "easy". */
  easyBonus: number;
  /** Fraction of the old interval retained after a lapse. */
  lapseMultiplier: number;
  /** Hard ceiling on any interval, in days. */
  maximumInterval: number;
  /** Random spread applied to intervals so reviews don't clump. 0 disables. */
  fuzzFactor: number;
}

export const DEFAULT_CONFIG: SchedulerConfig = {
  learningSteps: [1, 10],
  relearningSteps: [10],
  graduatingInterval: 1,
  easyInterval: 4,
  startingEase: 2.5,
  minimumEase: 1.3,
  hardMultiplier: 1.2,
  easyBonus: 1.3,
  lapseMultiplier: 0.5,
  maximumInterval: 365 * 5,
  fuzzFactor: 0.05,
};

/** A pristine, never-studied card. Due immediately. */
export function createCardState(now: number = Date.now()): CardState {
  return {
    phase: "new",
    step: 0,
    interval: 0,
    ease: DEFAULT_CONFIG.startingEase,
    due: now,
    reps: 0,
    lapses: 0,
    lastReviewed: null,
  };
}

/**
 * Ease adjustment per grade. "Good" is the neutral baseline — it is the only
 * grade that leaves ease untouched, which is what keeps the factor stable for
 * a learner who is tracking the schedule correctly.
 */
const EASE_DELTA: Record<Grade, number> = {
  again: -0.2,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

function clampEase(ease: number, config: SchedulerConfig): number {
  return Math.max(config.minimumEase, Number(ease.toFixed(4)));
}

/**
 * Spread an interval by ±fuzzFactor so that a deck reviewed in one sitting
 * doesn't come back as one giant wall on the same future day.
 *
 * `random` is injectable purely so tests can pin it.
 */
function applyFuzz(
  days: number,
  config: SchedulerConfig,
  random: () => number,
): number {
  if (config.fuzzFactor <= 0 || days < 2.5) return Math.round(days);
  const spread = days * config.fuzzFactor;
  const fuzzed = days + (random() * 2 - 1) * spread;
  return Math.max(1, Math.round(fuzzed));
}

function capInterval(days: number, config: SchedulerConfig): number {
  return Math.min(days, config.maximumInterval);
}

export interface ReviewOptions {
  now?: number;
  config?: SchedulerConfig;
  random?: () => number;
}

/**
 * Apply a grade to a card and return its next state.
 *
 * The four phases behave differently on purpose:
 *   new / learning  → walk the learning ladder in minutes, graduate to days
 *   review          → classic SM-2 interval growth, or drop into relearning
 *   relearning      → walk the shorter relearning ladder, then resume
 */
export function reviewCard(
  card: CardState,
  grade: Grade,
  options: ReviewOptions = {},
): CardState {
  const now = options.now ?? Date.now();
  const config = options.config ?? DEFAULT_CONFIG;
  const random = options.random ?? Math.random;

  const next: CardState = { ...card, lastReviewed: now };

  if (card.phase === "new" || card.phase === "learning") {
    return scheduleLearning(next, grade, config, now, random, "learning");
  }

  if (card.phase === "relearning") {
    return scheduleLearning(next, grade, config, now, random, "relearning");
  }

  return scheduleReview(next, grade, config, now, random);
}

function scheduleLearning(
  card: CardState,
  grade: Grade,
  config: SchedulerConfig,
  now: number,
  random: () => number,
  ladder: "learning" | "relearning",
): CardState {
  const steps =
    ladder === "learning" ? config.learningSteps : config.relearningSteps;

  // "Easy" always escapes the ladder immediately.
  if (grade === "easy") {
    const days = capInterval(
      ladder === "learning"
        ? config.easyInterval
        : Math.max(config.graduatingInterval, card.interval),
      config,
    );
    return {
      ...card,
      phase: "review",
      step: 0,
      interval: days,
      ease: clampEase(card.ease + EASE_DELTA.easy, config),
      due: now + days * DAY,
      reps: card.reps + 1,
    };
  }

  if (grade === "again") {
    // Back to the first step. Ease only moves for cards that had graduated.
    return {
      ...card,
      phase: ladder === "learning" ? "learning" : "relearning",
      step: 0,
      due: now + steps[0] * MINUTE,
    };
  }

  if (grade === "hard") {
    // Repeat the current step rather than advancing.
    const stepMinutes = steps[Math.min(card.step, steps.length - 1)];
    return {
      ...card,
      phase: ladder === "learning" ? "learning" : "relearning",
      due: now + stepMinutes * config.hardMultiplier * MINUTE,
    };
  }

  // grade === "good" → advance one rung, graduating off the end of the ladder.
  const nextStep = card.step + 1;
  if (nextStep < steps.length) {
    return {
      ...card,
      phase: ladder === "learning" ? "learning" : "relearning",
      step: nextStep,
      due: now + steps[nextStep] * MINUTE,
    };
  }

  const graduated =
    ladder === "learning"
      ? config.graduatingInterval
      : Math.max(config.graduatingInterval, Math.round(card.interval));
  const days = capInterval(graduated, config);

  return {
    ...card,
    phase: "review",
    step: 0,
    interval: days,
    due: now + days * DAY,
    reps: card.reps + 1,
  };
}

function scheduleReview(
  card: CardState,
  grade: Grade,
  config: SchedulerConfig,
  now: number,
  random: () => number,
): CardState {
  const ease = clampEase(card.ease + EASE_DELTA[grade], config);

  if (grade === "again") {
    // A lapse: retain a fraction of the interval so a mature card doesn't
    // reset all the way to day one, then send it through relearning.
    const retained = Math.max(
      1,
      Math.round(card.interval * config.lapseMultiplier),
    );
    return {
      ...card,
      phase: "relearning",
      step: 0,
      interval: retained,
      ease,
      due: now + config.relearningSteps[0] * MINUTE,
      lapses: card.lapses + 1,
    };
  }

  const base = Math.max(card.interval, 1);
  let days: number;

  if (grade === "hard") {
    days = base * config.hardMultiplier;
  } else if (grade === "good") {
    days = base * ease;
  } else {
    days = base * ease * config.easyBonus;
  }

  // Always move forward by at least a day, even for a harshly-graded card.
  days = Math.max(base + 1, days);
  days = capInterval(applyFuzz(days, config, random), config);

  return {
    ...card,
    phase: "review",
    step: 0,
    interval: days,
    ease,
    due: now + days * DAY,
    reps: card.reps + 1,
  };
}

/**
 * What the learner sees on the grade buttons before committing. Runs the real
 * scheduler with fuzz disabled so the preview matches what actually happens.
 */
export function previewIntervals(
  card: CardState,
  options: ReviewOptions = {},
): Record<Grade, string> {
  const now = options.now ?? Date.now();
  const config = { ...(options.config ?? DEFAULT_CONFIG), fuzzFactor: 0 };
  const grades: Grade[] = ["again", "hard", "good", "easy"];

  return grades.reduce(
    (acc, grade) => {
      const result = reviewCard(card, grade, { now, config });
      acc[grade] = formatDelay(result.due - now);
      return acc;
    },
    {} as Record<Grade, string>,
  );
}

/** Human-readable gap, e.g. "10m", "3d", "2.4mo". */
export function formatDelay(ms: number): string {
  if (ms < MINUTE) return "<1m";
  if (ms < 60 * MINUTE) return `${Math.round(ms / MINUTE)}m`;
  if (ms < DAY) return `${Math.round(ms / (60 * MINUTE))}h`;
  const days = ms / DAY;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${(days / 30).toFixed(1)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export function isDue(card: CardState, now: number = Date.now()): boolean {
  return card.due <= now;
}

export interface QueueCounts {
  new: number;
  learning: number;
  review: number;
  total: number;
}

/** Count what is actually due right now, split by phase. */
export function countDue(
  cards: CardState[],
  now: number = Date.now(),
): QueueCounts {
  const counts: QueueCounts = { new: 0, learning: 0, review: 0, total: 0 };
  for (const card of cards) {
    if (!isDue(card, now)) continue;
    if (card.phase === "new") counts.new += 1;
    else if (card.phase === "learning" || card.phase === "relearning")
      counts.learning += 1;
    else counts.review += 1;
    counts.total += 1;
  }
  return counts;
}

/**
 * Order the day's queue. Learning cards come first because they are the most
 * fragile, then reviews (oldest due first), then a capped intake of new cards.
 */
export function buildQueue<T extends { state: CardState }>(
  cards: T[],
  options: { now?: number; newLimit?: number; reviewLimit?: number } = {},
): T[] {
  const now = options.now ?? Date.now();
  const newLimit = options.newLimit ?? 20;
  const reviewLimit = options.reviewLimit ?? 200;

  const due = cards.filter((c) => isDue(c.state, now));

  const learning = due
    .filter(
      (c) => c.state.phase === "learning" || c.state.phase === "relearning",
    )
    .sort((a, b) => a.state.due - b.state.due);

  const review = due
    .filter((c) => c.state.phase === "review")
    .sort((a, b) => a.state.due - b.state.due)
    .slice(0, reviewLimit);

  const fresh = due.filter((c) => c.state.phase === "new").slice(0, newLimit);

  return [...learning, ...review, ...fresh];
}

/** Percentage of graduated cards the learner is getting right. */
export function retentionRate(cards: CardState[]): number | null {
  const graduated = cards.filter((c) => c.reps > 0);
  if (graduated.length === 0) return null;
  const totalReps = graduated.reduce((sum, c) => sum + c.reps + c.lapses, 0);
  const totalLapses = graduated.reduce((sum, c) => sum + c.lapses, 0);
  if (totalReps === 0) return null;
  return Math.round(((totalReps - totalLapses) / totalReps) * 100);
}

/** Forecast how many cards fall due on each of the next `days` days. */
export function forecast(
  cards: CardState[],
  days: number,
  now: number = Date.now(),
): { day: number; count: number }[] {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, (_, i) => ({ day: i, count: 0 }));

  for (const card of cards) {
    if (card.phase === "new") continue;
    const offset = Math.floor((card.due - startOfToday) / DAY);
    if (offset >= 0 && offset < days) buckets[offset].count += 1;
    else if (offset < 0) buckets[0].count += 1;
  }
  return buckets;
}
