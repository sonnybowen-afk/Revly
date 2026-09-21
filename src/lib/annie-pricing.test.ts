import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { METHODS, methodById } from "./annie-methods.ts";
import type { Length, Volume } from "./annie-pricing.ts";
import {
  LENGTHS,
  PRICE_DISCLAIMER,
  PRICING_CONFIRMED,
  estimate,
  formatDurationRange,
  formatGbp,
  formatRange,
} from "./annie-pricing.ts";

const laWeave = methodById("la-weave")!;
const tape = methodById("tape-in")!;

describe("estimate", () => {
  it("produces a coherent estimate for every method, volume and length", () => {
    const volumes: Volume[] = ["half", "full", "mega"];
    for (const method of METHODS) {
      for (const volume of volumes) {
        for (const length of LENGTHS) {
          const e = estimate(method, volume, length);
          assert.ok(e.fitting[0] <= e.fitting[1], `${method.id} fitting range`);
          assert.ok(e.firstYear[0] >= e.fitting[0], `${method.id} first year`);
          assert.ok(e.monthly[0] <= e.monthly[1], `${method.id} monthly`);
          assert.ok(e.maintenance > 0, `${method.id} maintenance`);
          assert.ok(e.maintenanceVisits >= 0);
          assert.equal(e.methodId, method.id);
        }
      }
    }
  });

  it("charges more for more hair", () => {
    const half = estimate(laWeave, "half", 18);
    const full = estimate(laWeave, "full", 18);
    const mega = estimate(laWeave, "mega", 18);
    assert.ok(half.fitting[0] < full.fitting[0]);
    assert.ok(full.fitting[0] < mega.fitting[0]);
  });

  it("charges more for longer hair", () => {
    const short = estimate(laWeave, "full", 16);
    const long = estimate(laWeave, "full", 24);
    assert.ok(long.fitting[1] > short.fitting[1]);
  });

  it("leaves a 16 inch full head at the method's own guide band", () => {
    // 16" full head is the reference point: both multipliers are 1.
    const e = estimate(laWeave, "full", 16);
    assert.deepEqual(e.fitting, [laWeave.guide[0], laWeave.guide[1]]);
    assert.equal(e.maintenance, laWeave.guideMaintenance);
  });

  it("scales fitting time with volume but not with length", () => {
    const half = estimate(laWeave, "half", 16);
    const full = estimate(laWeave, "full", 16);
    const fullLong = estimate(laWeave, "full", 24);
    assert.ok(half.fitMinutes[1] < full.fitMinutes[1]);
    assert.deepEqual(full.fitMinutes, fullLong.fitMinutes);
  });

  it("counts first-year move-ups from the slower end of the interval", () => {
    // Tape-in moves up every 6–8 weeks: floor(52/8) - 1 = 5 visits.
    assert.equal(estimate(tape, "full", 18).maintenanceVisits, 5);
    // Nano rings every 8–12 weeks: floor(52/12) - 1 = 3 visits.
    assert.equal(estimate(methodById("nano-rings")!, "full", 18).maintenanceVisits, 3);
  });

  it("builds the first-year total from the fitting plus every move-up", () => {
    const e = estimate(tape, "full", 20);
    assert.equal(e.firstYear[0], e.fitting[0] + e.maintenance * e.maintenanceVisits);
    assert.equal(e.firstYear[1], e.fitting[1] + e.maintenance * e.maintenanceVisits);
  });

  it("derives the monthly figure from the first-year total", () => {
    const e = estimate(laWeave, "mega", 22);
    assert.equal(e.monthly[0], Math.round(e.firstYear[0] / 12));
    assert.equal(e.monthly[1], Math.round(e.firstYear[1] / 12));
  });

  it("rounds money to the nearest five pounds", () => {
    for (const length of LENGTHS) {
      const e = estimate(laWeave, "mega", length);
      assert.equal(e.fitting[0] % 5, 0);
      assert.equal(e.fitting[1] % 5, 0);
      assert.equal(e.maintenance % 5, 0);
    }
  });

  it("is deterministic", () => {
    const a = estimate(laWeave, "full", 20);
    const b = estimate(laWeave, "full", 20);
    assert.deepEqual(a, b);
  });
});

describe("price honesty", () => {
  it("keeps the guide bands flagged as unconfirmed", () => {
    // This flips to true only when METHODS carries Annie's real price card.
    // Until then the UI must lead with the consultation, not the number.
    assert.equal(PRICING_CONFIRMED, false);
  });

  it("says the price is confirmed at the consultation", () => {
    assert.match(PRICE_DISCLAIMER, /consultation/i);
  });
});

describe("formatting", () => {
  it("formats pounds with thousands separators", () => {
    assert.equal(formatGbp(1250), "£1,250");
    assert.equal(formatGbp(90), "£90");
  });

  it("collapses a range whose ends agree", () => {
    assert.equal(formatRange([200, 200]), "£200");
    assert.equal(formatRange([200, 450]), "£200–£450");
  });

  it("formats durations in hours and minutes", () => {
    assert.equal(formatDurationRange([45, 45]), "45 min");
    assert.equal(formatDurationRange([90, 180]), "1 hr 30 min–3 hr");
  });
});

describe("length bands", () => {
  it("offers the inch bands the trade sells in", () => {
    assert.deepEqual([...LENGTHS] as Length[], [16, 18, 20, 22, 24]);
  });
});
