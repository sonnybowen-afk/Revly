/**
 * The extension methods Annie fits, described in enough detail to drive the
 * services page, the comparison table, the hair-match finder and the
 * maintenance estimator from one place.
 *
 * The method facts (how a fitting works, what hair it suits, how often it
 * needs moving up) are standard trade knowledge and stable.
 *
 * The money is not. Every `guide` figure below is a PLACEHOLDER band, and
 * PRICING_CONFIRMED is false until Annie replaces them with her real card.
 * While that flag is false the UI labels every price as a guide and leads
 * with the consultation — see `annie-pricing.ts`.
 */

export type HairType = "fine" | "medium" | "thick" | "textured";
export type Density = "low" | "medium" | "high";
export type Goal = "length" | "volume" | "both";
export type Lifestyle = "relaxed" | "active" | "very-active";
export type Upkeep = "minimal" | "standard" | "frequent";
export type Budget = "value" | "mid" | "premium";

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
  /** Indicative fitting price band in GBP. Placeholder — see the note above. */
  readonly guide: readonly [number, number];
  /** Indicative maintenance appointment price in GBP. Placeholder. */
  readonly guideMaintenance: number;
  readonly bestFor: string;
  readonly watchOut: string;
};

export const METHODS: readonly Method[] = [
  {
    id: "la-weave",
    name: "LA Weave",
    summary:
      "A weft sewn onto a row of micro-rings. No glue, no heat, and it carries real weight.",
    how: "A line of tiny rings is threaded along your own hair, then a continuous weft is sewn onto that row. Because the weight sits on the row rather than on single strands, it holds far more hair than an individual-bond method.",
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
    budget: "mid",
    guide: [180, 400],
    guideMaintenance: 60,
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
    budget: "premium",
    guide: [250, 600],
    guideMaintenance: 80,
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
    avoid: [],
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
    guide: [200, 450],
    guideMaintenance: 65,
    bestFor: "A first set of extensions when you want length without fuss.",
    watchOut: "Slightly more visible than nano in a very fine, high parting.",
  },
  {
    id: "tape-in",
    name: "Tape-in Wefts",
    summary:
      "Flat, seamless panels sandwiched either side of your own hair. In and out fastest.",
    how: "Pre-taped wefts are placed in pairs, back to back, around a thin section of your own hair. They lie completely flat, which is why they disappear so well under fine to medium hair.",
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
    guide: [150, 350],
    guideMaintenance: 55,
    bestFor: "A fast, flat, natural finish — and the quickest appointment.",
    watchOut:
      "The medical-grade adhesive does not love oil-based products or daily swimming.",
  },
  {
    id: "sew-in-weave",
    name: "Sew-in Weave",
    summary:
      "A braided base with the weft stitched on. The strongest hold for textured hair.",
    how: "Your own hair is cornrowed into a flat base and the weft is sewn directly onto the braids. Nothing clamps onto individual strands at all, which is why it suits coily and afro-textured hair so well.",
    suits: ["textured", "thick"],
    avoid: ["fine"],
    goals: ["length", "volume", "both"],
    fitMinutes: [120, 240],
    maintenanceWeeks: [6, 10],
    hairLifeMonths: [9, 18],
    usesHeat: false,
    usesGlue: false,
    discretion: 3,
    resilience: 5,
    gentleness: 3,
    budget: "mid",
    guide: [180, 420],
    guideMaintenance: 60,
    bestFor: "Protective styling on textured hair, and full dramatic volume.",
    watchOut:
      "The braid base must be kept clean and must never be taken down too tight.",
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
