/**
 * The price calculator behind /services.
 *
 * ── What changed, and why it matters ──────────────────────────────────
 * This used to be a cost-of-ownership estimator built on invented price
 * bands and an invented "half / full / mega" volume model. Annie's real
 * price list arrived and it works nothing like that: she charges per row,
 * per piece or per pack, with a printed full-head rate for each method.
 *
 * So this now computes from her published figures and nothing else. The
 * numbers it returns are hers. There is no projection, no annual
 * forecast, no assumed maintenance price — because the list does not
 * publish one, and a plausible-looking guess is worse than an honest
 * "ask at your consultation".
 */

import type { Method } from "./methods.ts";

/** The figures come from the studio's printed list, not from guesswork. */
export const PRICING_CONFIRMED = true;

export const PRICE_SOURCE =
  "Prices as shown on the studio's own price list.";

export const PRICE_NOTE =
  "Annie confirms your exact price — and exactly what it covers — at your free consultation, before anything is fitted.";

/** What a move-up costs is not on the printed list, so the site says so. */
export const MAINTENANCE_NOTE =
  "Move-ups are not on the price list because they depend on how much is being refitted. Annie quotes yours when she sees it.";

export type Quote = {
  readonly methodId: string;
  /** How many rows / pieces / packs. */
  readonly quantity: number;
  /** Total in whole pounds. */
  readonly total: number;
  /** True when `quantity` reaches the printed full-head quantity. */
  readonly isFullHead: boolean;
  /**
   * What the same quantity would cost at the unit rate. Equals `total`
   * unless the full-head rate undercuts it, which is the only case worth
   * showing a saving for.
   */
  readonly atUnitRate: number;
  readonly saving: number;
  /** Chair time for this quantity, low to high, in minutes. */
  readonly fitMinutes: readonly [number, number];
};

/**
 * What a given quantity of a given method costs, straight off the list.
 *
 * Pure: no clock, no storage, so it renders identically on the server
 * and the client.
 */
export function quote(method: Method, quantity: number): Quote {
  const { unit, fullHeadQty, fullHead } = method.price;
  const atUnitRate = unit * quantity;
  const isFullHead = quantity >= fullHeadQty;
  // The printed full-head rate can undercut the unit rate (150 pieces is
  // £125, not £150), so it wins once you reach a full head.
  const total = isFullHead ? fullHead : atUnitRate;

  // Fitting time scales with how much is being fitted, floored so a
  // small set never reads as instant.
  const share = Math.min(1, quantity / fullHeadQty);
  const scale = 0.45 + 0.55 * share;
  const round5 = (n: number) => Math.max(15, Math.round((n * scale) / 5) * 5);

  return {
    methodId: method.id,
    quantity,
    total,
    isFullHead,
    atUnitRate,
    saving: Math.max(0, atUnitRate - total),
    fitMinutes: [round5(method.fitMinutes[0]), round5(method.fitMinutes[1])],
  };
}

/** The full-head price for a method, for the comparison bars. */
export function fullHeadPrice(method: Method): number {
  return method.price.fullHead;
}

/** "£15 per row" / "£1 per piece" — the rate as the list prints it. */
export function unitRateLabel(method: Method): string {
  return `${formatGbp(method.price.unit)} per ${method.price.unitLabel}`;
}

/** "3 rows" / "150 pieces" — pluralised against the quantity. */
export function quantityLabel(method: Method, quantity: number): string {
  const { unitLabel, unitPlural } = method.price;
  return `${quantity} ${quantity === 1 ? unitLabel : unitPlural}`;
}

export function formatGbp(amount: number): string {
  return `£${amount.toLocaleString("en-GB")}`;
}

/** "£45–£125", or "£45" when both ends agree. */
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
