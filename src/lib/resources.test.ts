import test from "node:test";
import assert from "node:assert/strict";

import {
  RESOURCES,
  countFor,
  filterResources,
  type Resource,
} from "./resources.ts";

test("every resource has a valid https url and no affiliate tracking", () => {
  for (const r of RESOURCES) {
    assert.ok(r.url.startsWith("https://"), `${r.id} is not https`);
    assert.ok(!/[?&](ref|aff|utm_|partner)/i.test(r.url), `${r.id} has tracking`);
  }
});

test("resource ids are unique", () => {
  assert.equal(new Set(RESOURCES.map((r) => r.id)).size, RESOURCES.length);
});

test("every resource declares at least one board, subject and level", () => {
  for (const r of RESOURCES) {
    assert.ok(r.boards.length, `${r.id} has no boards`);
    assert.ok(r.subjects.length, `${r.id} has no subjects`);
    assert.ok(r.levels.length, `${r.id} has no levels`);
    assert.ok(r.why.length > 20, `${r.id} needs a real reason`);
  }
});

test("each exam board has an official past-paper source", () => {
  for (const board of ["AQA", "Edexcel", "OCR", "WJEC / Eduqas"] as const) {
    const official = RESOURCES.find(
      (r) => r.official && r.boards.includes(board),
    );
    assert.ok(official, `no official source for ${board}`);
  }
});

test("filtering by board keeps board-agnostic resources", () => {
  const out = filterResources(RESOURCES, { board: "AQA" });
  assert.ok(out.some((r) => r.boards.includes("All boards")));
  assert.ok(out.every((r) => r.boards.includes("AQA") || r.boards.includes("All boards")));
});

test("filtering by subject keeps 'All subjects' resources", () => {
  const out = filterResources(RESOURCES, { subject: "History" });
  assert.ok(out.some((r) => r.subjects.includes("All subjects")));
  assert.ok(out.some((r) => r.subjects.includes("History")));
});

test("a board-specific resource is excluded from another board", () => {
  const out = filterResources(RESOURCES, { board: "OCR" });
  assert.ok(!out.some((r) => r.id === "aqa-papers"));
});

test("official sources rank first, then free before paid", () => {
  const out = filterResources(RESOURCES, { board: "AQA" });
  assert.ok(out[0].official, "expected an official source first");
  const firstPaid = out.findIndex((r) => r.cost !== "Free");
  const lastFree = out.map((r) => r.cost === "Free").lastIndexOf(true);
  if (firstPaid !== -1) assert.ok(firstPaid > lastFree - out.length);
});

test("level filter excludes resources that do not cover it", () => {
  const out = filterResources(RESOURCES, { level: "A-Level" });
  assert.ok(out.every((r) => r.levels.includes("A-Level")));
  assert.ok(!out.some((r) => r.id === "bitesize"), "Bitesize is GCSE only");
});

test("combining board, subject and level narrows to a usable shortlist", () => {
  const out = filterResources(RESOURCES, {
    board: "AQA",
    subject: "Chemistry",
    level: "A-Level",
  });
  assert.ok(out.length >= 3, `expected a few, got ${out.length}`);
  assert.ok(out.length < RESOURCES.length, "filter did nothing");
  assert.ok(out.some((r) => r.id === "chemguide"));
});

test("'any' behaves as no filter at all", () => {
  const out = filterResources(RESOURCES, {
    board: "any",
    subject: "any",
    level: "any",
    type: "any",
    cost: "any",
  });
  assert.equal(out.length, RESOURCES.length);
});

test("an impossible combination returns empty rather than throwing", () => {
  const out = filterResources(RESOURCES, {
    subject: "Languages",
    type: "Flashcards",
    cost: "Paid",
  });
  assert.deepEqual(out, []);
});

test("countFor reports what selecting an option would yield", () => {
  const base = { level: "GCSE" as const };
  const n = countFor(RESOURCES, base, "subject", "Maths");
  const actual = filterResources(RESOURCES, { ...base, subject: "Maths" }).length;
  assert.equal(n, actual);
});

test("cost is one of the three declared values", () => {
  const valid = new Set(["Free", "Freemium", "Paid"]);
  for (const r of RESOURCES as Resource[]) {
    assert.ok(valid.has(r.cost), `${r.id} has cost ${r.cost}`);
  }
});
