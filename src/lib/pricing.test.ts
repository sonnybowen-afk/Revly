import test from "node:test";
import assert from "node:assert/strict";

import {
  FREE_DECK_LIMIT,
  PLANS,
  UCAS_PRODUCTS,
  annualSaving,
  formatPrice,
} from "./pricing.ts";

test("the free plan never gates reviewing", () => {
  const free = PLANS.find((p) => p.id === "free")!;
  const reviews = free.features.find((f) => /unlimited reviews/i.test(f.label));
  assert.ok(reviews?.included, "reviewing must stay free and uncapped");
  // A lives mechanic would appear as a *feature*, so check the labels.
  // (The detail copy legitimately says "no lives" — that is the promise,
  // not the mechanic, so a blunt search over the whole object is wrong.)
  const labels = PLANS.flatMap((p) => p.features.map((f) => f.label.toLowerCase()));
  for (const label of labels) {
    assert.ok(
      !/\b(lives|hearts|energy|tokens?)\b/.test(label),
      `found a gamified gate in a feature label: "${label}"`,
    );
    assert.ok(
      !/\bdaily\b.*\b(cap|limit)\b/.test(label),
      `found a daily cap in a feature label: "${label}"`,
    );
  }
});

test("the free plan states its exclusions rather than hiding them", () => {
  const free = PLANS.find((p) => p.id === "free")!;
  assert.ok(free.features.some((f) => !f.included), "must list what is not included");
});

test("plan ids are unique and exactly one is featured", () => {
  assert.equal(new Set(PLANS.map((p) => p.id)).size, PLANS.length);
  assert.equal(PLANS.filter((p) => p.featured).length, 1);
});

test("annual pricing is a real saving, not a markup", () => {
  for (const plan of PLANS) {
    if (!plan.annual) continue;
    assert.ok(
      plan.annual < plan.price * 12,
      `${plan.id}: annual must beat 12 months`,
    );
    const saving = annualSaving(plan)!;
    assert.ok(saving > 0 && saving < 60, `${plan.id}: implausible saving ${saving}%`);
  }
});

test("annualSaving is null where there is no annual option", () => {
  assert.equal(annualSaving(PLANS.find((p) => p.id === "free")!), null);
});

test("paid plans cost more than free and ascend in order", () => {
  const free = PLANS.find((p) => p.id === "free")!;
  const plus = PLANS.find((p) => p.id === "plus")!;
  const family = PLANS.find((p) => p.id === "family")!;
  assert.equal(free.price, 0);
  assert.ok(plus.price > free.price);
  assert.ok(family.price > plus.price);
});

test("the UCAS tutor rate respects the platform floor", () => {
  const tutor = UCAS_PRODUCTS.find((p) => p.id === "tutor")!;
  assert.equal(tutor.interval, "hour");
  assert.ok(tutor.from, "hourly rates must be shown as a floor, not a fixed price");
  assert.ok(tutor.price >= 25, "must not undercut the £25 platform minimum");
});

test("every UCAS product says what it includes and who it suits", () => {
  for (const p of UCAS_PRODUCTS) {
    assert.ok(p.includes.length >= 3, `${p.id} needs a real inclusion list`);
    assert.ok(p.bestFor.length > 10, `${p.id} needs a 'best for'`);
    assert.ok(p.price > 0);
  }
});

test("prices format as whole pounds where they are whole", () => {
  assert.equal(formatPrice(0), "£0");
  assert.equal(formatPrice(6), "£6");
  assert.equal(formatPrice(4.5), "£4.50");
});

test("the free deck limit is a real number the UI can state", () => {
  assert.ok(FREE_DECK_LIMIT > 0 && FREE_DECK_LIMIT < 10);
  const free = PLANS.find((p) => p.id === "free")!;
  assert.ok(
    free.features.some((f) => f.label.includes(String(FREE_DECK_LIMIT))),
    "the limit must be stated on the plan",
  );
});
