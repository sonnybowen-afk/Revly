/**
 * The hair-match engine behind /annie/hair-match.
 *
 * Given what someone says about their hair and their life, it scores every
 * method Annie fits and explains the result. Two rules hold it together:
 *
 *   1. It is pure. Same answers in, same ranking out — no clock, no storage,
 *      no randomness. That is what makes it testable.
 *   2. It never silently hides a hard no. A method that is wrong for the
 *      hair type is disqualified and *says so*, rather than dropping quietly
 *      to the bottom of the list.
 *
 * The output is advice, not a booking. Every result is framed as a starting
 * point for the free consultation, because the only way to judge a head of
 * hair properly is to look at it.
 */

import type {
  Budget,
  Density,
  Goal,
  HairType,
  Lifestyle,
  Method,
  Upkeep,
} from "./annie-methods.ts";
import { METHODS } from "./annie-methods.ts";

export type Answers = {
  readonly hairType: HairType;
  readonly density: Density;
  readonly goal: Goal;
  readonly lifestyle: Lifestyle;
  readonly upkeep: Upkeep;
  readonly budget: Budget;
  /** Bleached, coloured or otherwise fragile hair. */
  readonly fragile: boolean;
};

export type MatchReason = {
  readonly kind: "plus" | "minus" | "block";
  readonly text: string;
};

export type Match = {
  readonly method: Method;
  /** 0–100. A blocked method always scores 0. */
  readonly score: number;
  readonly blocked: boolean;
  readonly reasons: readonly MatchReason[];
};

/** Weights sum to 100, so a score reads directly as a percentage fit. */
const WEIGHTS = {
  hairType: 30,
  goal: 16,
  upkeep: 16,
  lifestyle: 14,
  budget: 12,
  fragile: 12,
} as const;

const BUDGET_RANK: Record<Budget, number> = { value: 0, mid: 1, premium: 2 };

/** Weeks between move-ups that each upkeep appetite is happy with. */
const UPKEEP_TARGET_WEEKS: Record<Upkeep, number> = {
  frequent: 6,
  standard: 9,
  minimal: 12,
};

/** Resilience (1–5) each lifestyle really needs. */
const LIFESTYLE_NEED: Record<Lifestyle, number> = {
  relaxed: 2,
  active: 4,
  "very-active": 5,
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function midpoint(range: readonly [number, number]): number {
  return (range[0] + range[1]) / 2;
}

/**
 * Density nudges the hair-type judgement rather than replacing it: low
 * density on medium hair behaves a lot like fine hair, high density on fine
 * hair behaves like medium.
 */
function effectiveHairType(hairType: HairType, density: Density): HairType {
  if (hairType === "textured") return "textured";
  if (density === "low" && hairType === "thick") return "medium";
  if (density === "low" && hairType === "medium") return "fine";
  if (density === "high" && hairType === "fine") return "medium";
  return hairType;
}

function scoreMethod(method: Method, answers: Answers): Match {
  const reasons: MatchReason[] = [];
  const effective = effectiveHairType(answers.hairType, answers.density);

  // ── Hard blocks ────────────────────────────────────────────────────
  if (method.avoid.includes(effective)) {
    reasons.push({
      kind: "block",
      text:
        effective === "fine"
          ? `${method.name} puts more weight on each section than fine hair should carry.`
          : `${method.name} is not the right fit for ${effective} hair — the bond will not sit correctly.`,
    });
    return { method, score: 0, blocked: true, reasons };
  }

  let score = 0;

  // ── Hair type ──────────────────────────────────────────────────────
  if (method.suits.includes(effective)) {
    score += WEIGHTS.hairType;
    reasons.push({
      kind: "plus",
      text: `Fitted on ${effective} hair every week — this is what it is designed for.`,
    });
  } else {
    score += WEIGHTS.hairType * 0.45;
    reasons.push({
      kind: "minus",
      text: `Workable on ${effective} hair, but not the method Annie would reach for first.`,
    });
  }

  // ── Goal ───────────────────────────────────────────────────────────
  if (method.goals.includes(answers.goal)) {
    score += WEIGHTS.goal;
    reasons.push({
      kind: "plus",
      text:
        answers.goal === "length"
          ? "Adds length cleanly without a heavy root."
          : answers.goal === "volume"
            ? "Built to carry volume — this is where it shines."
            : "Handles length and volume in the same fitting.",
    });
  } else {
    score += WEIGHTS.goal * 0.4;
    reasons.push({
      kind: "minus",
      text: `Better at ${method.goals.join(" and ")} than at what you are after.`,
    });
  }

  // ── Upkeep appetite ────────────────────────────────────────────────
  const target = UPKEEP_TARGET_WEEKS[answers.upkeep];
  const actual = midpoint(method.maintenanceWeeks);
  // Full marks within a fortnight of the target, tailing off after that.
  const upkeepFit = clamp01(1 - Math.abs(actual - target) / 8);
  score += WEIGHTS.upkeep * upkeepFit;
  if (upkeepFit >= 0.75) {
    reasons.push({
      kind: "plus",
      text: `Move-ups every ${method.maintenanceWeeks[0]}–${method.maintenanceWeeks[1]} weeks, which matches how often you want to come in.`,
    });
  } else if (actual < target) {
    reasons.push({
      kind: "minus",
      text: `Wants moving up every ${method.maintenanceWeeks[0]}–${method.maintenanceWeeks[1]} weeks — more often than you asked for.`,
    });
  }

  // ── Lifestyle ──────────────────────────────────────────────────────
  const need = LIFESTYLE_NEED[answers.lifestyle];
  const resilienceFit = clamp01(1 - Math.max(0, need - method.resilience) / 3);
  score += WEIGHTS.lifestyle * resilienceFit;
  if (method.resilience >= need && need >= 4) {
    reasons.push({
      kind: "plus",
      text: "Holds up to training, washing often and swimming.",
    });
  } else if (method.resilience < need) {
    reasons.push({
      kind: "minus",
      text: `${method.name} needs a gentler routine than yours — chlorine and daily washing shorten it.`,
    });
  }

  // ── Budget ─────────────────────────────────────────────────────────
  const budgetGap = Math.abs(BUDGET_RANK[method.budget] - BUDGET_RANK[answers.budget]);
  score += WEIGHTS.budget * clamp01(1 - budgetGap / 2);
  if (budgetGap === 0) {
    reasons.push({ kind: "plus", text: "Sits in the budget you picked." });
  } else if (BUDGET_RANK[method.budget] > BUDGET_RANK[answers.budget]) {
    reasons.push({
      kind: "minus",
      text: "Costs more up front than the budget you picked, though the hair lasts longer.",
    });
  }

  // ── Fragile hair ───────────────────────────────────────────────────
  if (answers.fragile) {
    score += WEIGHTS.fragile * ((method.gentleness - 1) / 4);
    if (method.gentleness >= 4) {
      reasons.push({
        kind: "plus",
        text: "Gentle enough for bleached or previously damaged hair.",
      });
    } else {
      reasons.push({
        kind: "minus",
        text: "Puts more tension on the root than fragile hair really wants.",
      });
    }
  } else {
    score += WEIGHTS.fragile;
  }

  return {
    method,
    score: Math.round(clamp01(score / 100) * 100),
    blocked: false,
    reasons,
  };
}

/**
 * Every method, ranked. Blocked methods stay in the list at the bottom with
 * their reason intact, so the page can show *why* something was ruled out.
 * Ties break on method id, which keeps the order stable across renders.
 */
export function rankMethods(answers: Answers): readonly Match[] {
  return METHODS.map((method) => scoreMethod(method, answers)).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.method.id.localeCompare(b.method.id);
  });
}

/** The single recommendation, or null when every method was ruled out. */
export function topMatch(answers: Answers): Match | null {
  const ranked = rankMethods(answers);
  const best = ranked[0];
  return best && !best.blocked ? best : null;
}

/**
 * How confident the ranking is. A clear winner reads "strong"; a photo
 * finish reads "close", which the UI turns into "either of these two works".
 */
export function confidence(ranked: readonly Match[]): "strong" | "good" | "close" {
  const viable = ranked.filter((m) => !m.blocked);
  if (viable.length < 2) return "strong";
  const gap = viable[0].score - viable[1].score;
  if (gap >= 12) return "strong";
  if (gap >= 5) return "good";
  return "close";
}

export const QUESTION_COUNT = 7;
