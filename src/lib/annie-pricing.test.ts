import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { EXTRAS, METHODS, methodById } from "./annie-methods.ts";
import {
  MAINTENANCE_NOTE,
  PRICE_NOTE,
  PRICING_CONFIRMED,
  formatDurationRange,
  formatGbp,
  formatRange,
  fullHeadPrice,
  quantityLabel,
  quote,
  unitRateLabel,
} from "./annie-pricing.ts";

const laWeave = methodById("la-weave")!;
const nano = methodById("nano-rings")!;
const tape = methodById("tape-in")!;

describe("the price list, as printed", () => {
  it("is the studio's own, not a guess", () => {
    assert.equal(PRICING_CONFIRMED, true);
  });

  it("charges LA Weave at £15 a row, £45 for a full head of three", () => {
    assert.equal(laWeave.price.unit, 15);
    assert.equal(laWeave.price.unitLabel, "row");
    assert.equal(laWeave.price.fullHeadQty, 3);
    assert.equal(laWeave.price.fullHead, 45);
  });

  it("charges the strand methods at £1 a piece, £125 for 150", () => {
    for (const id of ["nano-rings", "micro-rings", "mini-tip"]) {
      const m = methodById(id)!;
      assert.equal(m.price.unit, 1, id);
      assert.equal(m.price.unitLabel, "piece", id);
      assert.equal(m.price.fullHeadQty, 150, id);
      assert.equal(m.price.fullHead, 125, id);
    }
  });

  it("charges tape at £25 a pack, £50 for a full head of two", () => {
    assert.equal(tape.price.unit, 25);
    assert.equal(tape.price.unitLabel, "pack");
    assert.equal(tape.price.fullHeadQty, 2);
    assert.equal(tape.price.fullHead, 50);
  });

  it("lists take-out at £10 and the braid at £20", () => {
    const byId = Object.fromEntries(EXTRAS.map((e) => [e.id, e.price]));
    assert.equal(byId["take-out"], 10);
    assert.equal(byId["kk-braid"], 20);
  });

  it("offers quantities that end at exactly a full head", () => {
    for (const m of METHODS) {
      const steps = m.price.steps;
      assert.ok(steps.length > 0, m.id);
      assert.equal(steps[steps.length - 1], m.price.fullHeadQty, m.id);
      for (let i = 1; i < steps.length; i += 1) {
        assert.ok(steps[i] > steps[i - 1], `${m.id} steps ascend`);
      }
    }
  });

  it("says a move-up is quoted rather than listed", () => {
    assert.match(MAINTENANCE_NOTE, /price list|quote/i);
  });

  it("points at the free consultation for what a price covers", () => {
    assert.match(PRICE_NOTE, /consultation/i);
  });
});

describe("quote", () => {
  it("charges the unit rate below a full head", () => {
    assert.equal(quote(laWeave, 1).total, 15);
    assert.equal(quote(laWeave, 2).total, 30);
    assert.equal(quote(nano, 50).total, 50);
    assert.equal(quote(nano, 100).total, 100);
    assert.equal(quote(tape, 1).total, 25);
  });

  it("charges the printed full-head rate at a full head", () => {
    assert.equal(quote(laWeave, 3).total, 45);
    assert.equal(quote(nano, 150).total, 125);
    assert.equal(quote(tape, 2).total, 50);
  });

  it("shows the saving where the full-head rate undercuts the unit rate", () => {
    // 150 pieces at £1 would be £150; the list prints £125.
    const q = quote(nano, 150);
    assert.equal(q.atUnitRate, 150);
    assert.equal(q.total, 125);
    assert.equal(q.saving, 25);
  });

  it("shows no saving where the rates already agree", () => {
    assert.equal(quote(laWeave, 3).saving, 0);
    assert.equal(quote(tape, 2).saving, 0);
  });

  it("never charges more than the full-head rate past a full head", () => {
    assert.equal(quote(nano, 200).total, 125);
    assert.equal(quote(nano, 200).isFullHead, true);
  });

  it("flags a full head only at the full-head quantity", () => {
    assert.equal(quote(nano, 100).isFullHead, false);
    assert.equal(quote(nano, 150).isFullHead, true);
  });

  it("scales fitting time with how much is being fitted", () => {
    const part = quote(nano, 50);
    const full = quote(nano, 150);
    assert.ok(part.fitMinutes[1] < full.fitMinutes[1]);
    assert.ok(part.fitMinutes[0] >= 15, "never reads as instant");
  });

  it("produces a coherent quote for every method and step", () => {
    for (const m of METHODS) {
      for (const step of m.price.steps) {
        const q = quote(m, step);
        assert.equal(q.methodId, m.id);
        assert.equal(q.quantity, step);
        assert.ok(q.total > 0, `${m.id} @ ${step}`);
        assert.ok(q.total <= q.atUnitRate, `${m.id} never exceeds unit rate`);
        assert.ok(q.fitMinutes[0] <= q.fitMinutes[1]);
      }
    }
  });

  it("is deterministic", () => {
    assert.deepEqual(quote(nano, 100), quote(nano, 100));
  });
});

describe("labels", () => {
  it("prints the unit rate the way the list does", () => {
    assert.equal(unitRateLabel(laWeave), "£15 per row");
    assert.equal(unitRateLabel(nano), "£1 per piece");
    assert.equal(unitRateLabel(tape), "£25 per pack");
  });

  it("pluralises the quantity", () => {
    assert.equal(quantityLabel(laWeave, 1), "1 row");
    assert.equal(quantityLabel(laWeave, 3), "3 rows");
    assert.equal(quantityLabel(tape, 1), "1 pack");
    assert.equal(quantityLabel(nano, 150), "150 pieces");
  });

  it("reports the full-head price for the comparison bars", () => {
    assert.equal(fullHeadPrice(laWeave), 45);
    assert.equal(fullHeadPrice(nano), 125);
  });
});

describe("formatting", () => {
  it("formats pounds with thousands separators", () => {
    assert.equal(formatGbp(1250), "£1,250");
    assert.equal(formatGbp(45), "£45");
  });

  it("collapses a range whose ends agree", () => {
    assert.equal(formatRange([45, 45]), "£45");
    assert.equal(formatRange([45, 125]), "£45–£125");
  });

  it("formats durations in hours and minutes", () => {
    assert.equal(formatDurationRange([45, 45]), "45 min");
    assert.equal(formatDurationRange([90, 180]), "1 hr 30 min–3 hr");
  });
});
