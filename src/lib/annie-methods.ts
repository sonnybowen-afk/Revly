/**
 * The extension methods Annie fits, and what she charges for them.
 *
 * ── On the money ──────────────────────────────────────────────────────
 * Every figure below is transcribed from the salon's own printed price
 * list, supplied by the client. It is reproduced exactly: the unit rate
 * and the full-head rate, both as written.
 *
 * Note that the full-head rate is not always the unit rate times the
 * quantity — a full head of 150 pieces is £125, not £150. That is a real
 * bundled rate from the list, not a rounding error, so `fullHead` is
 * stored separately rather than computed.
 *
 * What the list does *not* say is whether the hair itself is included.
 * So neither does the site: the prices are presented as the studio
 * presents them, and the page directs you to the free consultation to
 * confirm what a given price covers. Do not infer it here.
 */

export type HairType = "fine" | "medium" | "thick" | "textured";
export type Density = "low" | "medium" | "high";
export type Goal = "length" | "volume" | "both";
export type Lifestyle = "relaxed" | "active" | "very-active";
export type Upkeep = "minimal" | "standard" | "frequent";
/**
 * The two price points the list actually has: the row-and-pack methods
 * at £45–£50 a full head, and the strand methods at £125. There is no
 * third tier, so the type does not pretend there is one.
 */
export type Budget = "value" | "mid";

/** How a method is counted and charged, straight off the price list. */
export type Price = {
  /** Pounds per unit. */
  readonly unit: number;
  /** "row", "piece", "pack" — singular. */
  readonly unitLabel: string;
  readonly unitPlural: string;
  /** How many units make a full head, per the list. */
  readonly fullHeadQty: number;
  /** The full-head price, as printed. May undercut unit × quantity. */
  readonly fullHead: number;
  /** The quantities the calculator offers, ending at a full head. */
  readonly steps: readonly number[];
};

export type Method = {
  readonly id: string;
  readonly name: string;
  /** One line, plain English, no jargon. */
  readonly summary: string;
  readonly how: string;
  /** Hair types this method is genuinely good on. */
  readonly suits: readonly HairType[];
  /** Hair types it should not be fitted to. */
  readonly avoid: readonly HairType[];
  readonly goals: readonly Goal[];
  /** Fitting time in minutes, low to high. */
  readonly fitMinutes: readonly [number, number];
  /** Weeks between maintenance (move-up) appointments. */
  readonly maintenanceWeeks: readonly [number, number];
  /** How many months the hair itself typically lasts with care. */
  readonly hairLifeMonths: readonly [number, number];
  readonly usesHeat: boolean;
  readonly usesGlue: boolean;
  /** 1–5: how flat and undetectable it sits. */
  readonly discretion: number;
  /** 1–5: how well it copes with gym, swimming and washing often. */
  readonly resilience: number;
  /** 1–5: how gentle it is on fragile or previously bleached hair. */
  readonly gentleness: number;
  readonly budget: Budget;
  readonly price: Price;
  readonly bestFor: string;
  readonly watchOut: string;
};

export const METHODS: readonly Method[] = [
  {
    id: "la-weave",
    name: "LA Weave",
    summary:
      "A weft sewn onto a row of micro-rings. No glue, no heat, and it carries real weight.",
    how: "A line of tiny rings is threaded along your own hair, then a continuous weft is sewn onto that row. Because the weight sits on the row rather than on single strands, it holds far more hair than an individual-bond method. It is also the quickest route to a full head here — three rows does it.",
    suits: ["medium", "thick", "textured"],
    avoid: ["fine"],
    goals: ["volume", "both"],
    fitMinutes: [90, 180],
    maintenanceWeeks: [6, 10],
    hairLifeMonths: [9, 18],
    usesHeat: false,
    usesGlue: false,
    discretion: 4,
    resilience: 5,
    gentleness: 4,
    budget: "value",
    price: {
      unit: 15,
      unitLabel: "row",
      unitPlural: "rows",
      fullHeadQty: 3,
      fullHead: 45,
      steps: [1, 2, 3],
    },
    bestFor: "Big, dense transformations that still have to survive the gym.",
    watchOut:
      "Needs enough of your own hair along the row to hide the weft, so it is not the one for very fine hair.",
  },
  {
    id: "nano-rings",
    name: "Nano Rings",
    summary:
      "The smallest bond there is — around 90% smaller than a micro ring. Built for fine hair.",
    how: "Each strand is attached with a nano-sized ring clamped onto a few of your own hairs. No adhesive and no heat touches your hair at any point. The bond is small enough to sit invisibly in a parting.",
    suits: ["fine", "medium"],
    avoid: ["textured"],
    goals: ["length", "volume", "both"],
    fitMinutes: [120, 240],
    maintenanceWeeks: [8, 12],
    hairLifeMonths: [9, 18],
    usesHeat: false,
    usesGlue: false,
    discretion: 5,
    resilience: 4,
    gentleness: 5,
    budget: "mid",
    price: {
      unit: 1,
      unitLabel: "piece",
      unitPlural: "pieces",
      fullHeadQty: 150,
      fullHead: 125,
      steps: [50, 100, 150],
    },
    bestFor: "Fine hair, high partings, and anyone who wears their hair up.",
    watchOut: "The longest fitting of the lot — set the afternoon aside.",
  },
  {
    id: "micro-rings",
    name: "Micro Rings",
    summary:
      "Individual strands on a small ring. The dependable middle ground on price and upkeep.",
    how: "Strands are attached one at a time with a small copper ring, clamped flat. Nothing is glued or heated, and each bond can be moved up and re-used as your hair grows.",
    suits: ["medium", "thick"],
    avoid: ["textured"],
    goals: ["length", "volume", "both"],
    fitMinutes: [90, 180],
    maintenanceWeeks: [8, 12],
    hairLifeMonths: [9, 15],
    usesHeat: false,
    usesGlue: false,
    discretion: 4,
    resilience: 4,
    gentleness: 4,
    budget: "mid",
    price: {
      unit: 1,
      unitLabel: "piece",
      unitPlural: "pieces",
      fullHeadQty: 150,
      fullHead: 125,
      steps: [50, 100, 150],
    },
    bestFor: "A first set of extensions when you want length without fuss.",
    watchOut: "Slightly more visible than nano in a very fine, high parting.",
  },
  {
    id: "mini-tip",
    name: "Mini-Tip",
    summary:
      "A keratin-tipped strand secured with a ring. Small bond, strand by strand.",
    how: "Each strand comes pre-tipped and is secured with a ring rather than melted on, so the bond stays small and sits close to the root. Fitted one strand at a time, like micro and nano rings.",
    suits: ["medium", "thick"],
    avoid: ["textured"],
    goals: ["length", "volume", "both"],
    fitMinutes: [120, 210],
    maintenanceWeeks: [8, 12],
    hairLifeMonths: [9, 15],
    usesHeat: false,
    usesGlue: false,
    discretion: 4,
    resilience: 4,
    gentleness: 4,
    budget: "mid",
    price: {
      unit: 1,
      unitLabel: "piece",
      unitPlural: "pieces",
      fullHeadQty: 150,
      fullHead: 125,
      steps: [50, 100, 150],
    },
    bestFor: "A neat, strand-by-strand finish with a small, tidy bond.",
    watchOut: "Strand by strand means a long appointment — allow the time.",
  },
  {
    id: "tape-in",
    name: "Tape Hair Extensions",
    summary:
      "Flat, seamless panels sandwiched either side of your own hair. In and out fastest.",
    how: "Pre-taped wefts are placed in pairs, back to back, around a thin section of your own hair. They lie completely flat, which is why they disappear so well under fine to medium hair. Two packs does a full head.",
    suits: ["fine", "medium"],
    avoid: ["textured"],
    goals: ["length", "volume", "both"],
    fitMinutes: [45, 90],
    maintenanceWeeks: [6, 8],
    hairLifeMonths: [6, 12],
    usesHeat: false,
    usesGlue: true,
    discretion: 5,
    resilience: 3,
    gentleness: 4,
    budget: "value",
    price: {
      unit: 25,
      unitLabel: "pack",
      unitPlural: "packs",
      fullHeadQty: 2,
      fullHead: 50,
      steps: [1, 2],
    },
    bestFor: "A fast, flat, natural finish — and the quickest appointment.",
    watchOut:
      "The medical-grade adhesive does not love oil-based products or daily swimming.",
  },
] as const;

/**
 * The rest of the price list — services that are not a fitting, printed
 * as flat prices with no unit.
 */
export const EXTRAS = [
  {
    id: "take-out",
    name: "Extensions take-out",
    price: 10,
    detail:
      "Removing an existing set, whoever fitted it. Worth booking together with a refit.",
  },
  {
    id: "kk-braid",
    name: "Kim Kardashian braid",
    price: 20,
    detail: "The sleek, tight-to-the-scalp braid, done in the studio.",
  },
] as const;

export function methodById(id: string): Method | undefined {
  return METHODS.find((m) => m.id === id);
}

/** Every method Annie fits, in the order the services page lists them. */
export const METHOD_IDS = METHODS.map((m) => m.id);

export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  fine: "Fine",
  medium: "Medium",
  thick: "Thick",
  textured: "Curly or afro-textured",
};
