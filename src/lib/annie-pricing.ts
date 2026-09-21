/**
 * The cost-of-ownership estimator behind /annie/services.
 *
 * Extensions are not a one-off purchase and pricing them as one is how
 * people get a shock six months later. This works out the whole first year:
 * the fitting, every move-up, and the point where the hair itself is
 * replaced — then reduces it to a monthly figure that is comparable across
 * methods.
 *
 * ── On the numbers ────────────────────────────────────────────────────
 * PRICING_CONFIRMED is the switch that matters. While it is false, every
 * band in `annie-methods.ts` is a placeholder and the UI must lead with the
 * consultation rather than the price. Set it to true only once the figures
 * in METHODS match Annie's real price card.
 */

import type { Method } from "./annie-methods.ts";

/** Flip to true once METHODS carries Annie's real prices. */
export const PRICING_CONFIRMED = false;

export const PRICE_DISCLAIMER =
  "Guide figures only. Your price depends on how much hair you need and how long it is, and Annie confirms it at your free consultation before anything is fitted.";

/** How much hair is being fitted — the main lever on price. */
export type Volume = "half" | "full" | "mega";

/** Inches of hair. The bands the trade actually sells in. */
export type Length = 16 | 18 | 20 | 22 | 24;

export type Estimate = {
  readonly methodId: string;
  /** Fitting, low to high, in whole pounds. */
  readonly fitting: readonly [number, number];
  /** One maintenance appointment, in whole pounds. */
  readonly maintenance: number;
  /** Maintenance appointments in the first twelve months. */
  readonly maintenanceVisits: number;
  /** Fitting + every move-up across the first year, low to high. */
  readonly firstYear: readonly [number, number];
  /** First-year total spread over twelve months, low to high. */
  readonly monthly: readonly [number, number];
  /** Chair time for the initial fitting, low to high, in minutes. */
  readonly fitMinutes: readonly [number, number];
  /** Weeks between move-ups. */
  readonly maintenanceWeeks: readonly [number, number];
};

/** More hair costs more hair, and takes longer to fit. */
const VOLUME_MULTIPLIER: Record<Volume, number> = {
  half: 0.65,
  full: 1,
  mega: 1.45,
};

export const VOLUME_LABELS: Record<Volume, string> = {
  half: "Half head",
  full: "Full head",
  mega: "Mega volume",
};

export const VOLUME_DESCRIPTIONS: Record<Volume, string> = {
  half: "Length and a lift through the back. The everyday set.",
  full: "Full coverage from nape to crown. What most people picture.",
  mega: "Maximum density for thick, red-carpet hair.",
};

export const LENGTHS: readonly Length[] = [16, 18, 20, 22, 24];

/**
 * Longer hair costs more per gram, and the step up is not linear — 24"
 * costs a good deal more than proportionally more than 16".
 */
function lengthMultiplier(length: Length): number {
  return 1 + (length - 16) * 0.055;
}

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

/**
 * The first-year cost of a method at a given volume and length. Pure — no
 * clock, no storage — so the same inputs always render the same figures on
 * the server and the client.
 */
export function estimate(
  method: Method,
  volume: Volume,
  length: Length,
): Estimate {
  const multiplier = VOLUME_MULTIPLIER[volume] * lengthMultiplier(length);

  const fitting: [number, number] = [
    round5(method.guide[0] * multiplier),
    round5(method.guide[1] * multiplier),
  ];

  // Maintenance scales with how much hair has to be moved up, but far less
  // steeply than the fitting — the labour is similar whatever the length.
  const maintenance = round5(
    method.guideMaintenance * (1 + (multiplier - 1) * 0.5),
  );

  // Move-ups in the first twelve months, using the slower end of the
  // interval so the estimate is not alarmist. The fitting itself is not a
  // move-up, hence the -1.
  const weeks = method.maintenanceWeeks[1];
  const maintenanceVisits = Math.max(0, Math.floor(52 / weeks) - 1);

  const maintenanceTotal = maintenance * maintenanceVisits;
  const firstYear: [number, number] = [
    fitting[0] + maintenanceTotal,
    fitting[1] + maintenanceTotal,
  ];

  const fitScale = VOLUME_MULTIPLIER[volume];
  return {
    methodId: method.id,
    fitting,
    maintenance,
    maintenanceVisits,
    firstYear,
    monthly: [Math.round(firstYear[0] / 12), Math.round(firstYear[1] / 12)],
    fitMinutes: [
      Math.round((method.fitMinutes[0] * fitScale) / 5) * 5,
      Math.round((method.fitMinutes[1] * fitScale) / 5) * 5,
    ],
    maintenanceWeeks: method.maintenanceWeeks,
  };
}

export function formatGbp(amount: number): string {
  return `£${amount.toLocaleString("en-GB")}`;
}

/** "£180–£400", or "£180" when both ends agree. */
export function formatRange(range: readonly [number, number]): string {
  return range[0] === range[1]
    ? formatGbp(range[0])
    : `${formatGbp(range[0])}–${formatGbp(range[1])}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

export function formatDurationRange(range: readonly [number, number]): string {
  return range[0] === range[1]
    ? formatDuration(range[0])
    : `${formatDuration(range[0])}–${formatDuration(range[1])}`;
}
