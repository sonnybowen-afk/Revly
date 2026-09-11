import test from "node:test";
import assert from "node:assert/strict";

import { generateCards } from "./notes-to-cards.ts";

test("colon definitions become question/answer pairs", () => {
  const r = generateCards("Osmosis: the diffusion of water through a partially permeable membrane");
  assert.equal(r.cards.length, 1);
  assert.equal(r.cards[0].front, "Define osmosis.");
  assert.ok(r.cards[0].back.startsWith("The diffusion of water"));
  assert.equal(r.cards[0].rule, "definition");
});

test("dash and equals definitions are picked up too", () => {
  const r = generateCards(
    "Catalyst - a substance that speeds up a reaction\nVelocity = displacement divided by time",
  );
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[0].rule, "definition");
});

test("multi-word terms get a phrasing that reads naturally", () => {
  const r = generateCards("Active transport: movement against a concentration gradient using energy");
  assert.equal(r.cards[0].front, "What is meant by active transport?");
});

test("'X is Y' statements become definition cards", () => {
  const r = generateCards("Mitosis is nuclear division producing two genetically identical cells.");
  assert.equal(r.cards.length, 1);
  assert.equal(r.cards[0].rule, "is-statement");
  assert.equal(r.cards[0].front, "Define mitosis.");
});

test("a heading with bullets becomes one list card", () => {
  const notes = [
    "## Causes of the First World War",
    "- Militarism",
    "- Alliances",
    "- Imperialism",
    "- Nationalism",
  ].join("\n");
  const r = generateCards(notes);
  const list = r.cards.find((c) => c.rule === "list-under-heading");
  assert.ok(list, "expected a list card");
  assert.equal(list.front, "List causes of the first world war.");
  assert.ok(list.back.includes("• Militarism"));
  assert.ok(list.back.includes("• Nationalism"));
});

test("'Stages of…' headings get a List phrasing, others get key points", () => {
  const stages = generateCards("Stages of mitosis:\n- Prophase\n- Metaphase\n- Anaphase");
  assert.ok(stages.cards[0].front.startsWith("List"));
  const other = generateCards("The heart:\n- Four chambers\n- Pumps blood around the body");
  assert.ok(other.cards[0].front.startsWith("What are the key points"));
});

test("bullets that are themselves definitions become their own cards", () => {
  const notes = [
    "## Key terms",
    "- Ion: a charged atom",
    "- Isotope: same element, different neutron count",
  ].join("\n");
  const r = generateCards(notes);
  const terms = r.cards.filter((c) => c.rule === "term-bullet");
  assert.equal(terms.length, 2);
  assert.equal(terms[0].front, "Define ion.");
});

test("explicit Q/A in the notes is respected verbatim", () => {
  const notes = "Q: What is the unit of force?\nA: The newton";
  const r = generateCards(notes);
  assert.equal(r.cards.length, 1);
  assert.equal(r.cards[0].rule, "qa-pair");
  assert.equal(r.cards[0].front, "What is the unit of force?");
  assert.equal(r.cards[0].back, "The newton");
});

test("a lone bullet under a heading does not become a list card", () => {
  const r = generateCards("## Something\n- only one point here");
  assert.equal(r.cards.filter((c) => c.rule === "list-under-heading").length, 0);
});

test("repeated terms produce one card, not duplicates", () => {
  const r = generateCards("Ion: a charged atom\nIon: a charged atom");
  assert.equal(r.cards.length, 1);
});

test("a front is never identical to its back", () => {
  const r = generateCards("Photosynthesis: photosynthesis");
  assert.equal(r.cards.length, 0);
});

test("bare prose with no structure yields nothing rather than junk", () => {
  const r = generateCards(
    "I went to the shop today and then I came home again because it was raining.",
  );
  assert.equal(r.cards.length, 0);
  assert.ok(r.unused > 0);
});

test("empty input is safe", () => {
  const r = generateCards("");
  assert.equal(r.cards.length, 0);
  assert.equal(r.unused, 0);
});

test("markdown emphasis is stripped from generated cards", () => {
  const r = generateCards("**Diffusion**: movement from **high** to low concentration");
  assert.equal(r.cards[0].front, "Define diffusion.");
  assert.ok(!r.cards[0].back.includes("**"));
});

test("a realistic page of notes yields a usable set across rules", () => {
  const notes = [
    "# Cell Transport",
    "",
    "Diffusion: net movement of particles from high to low concentration",
    "Osmosis is the diffusion of water through a partially permeable membrane.",
    "",
    "Features of active transport:",
    "- Requires energy from respiration",
    "- Moves substances against the gradient",
    "- Uses carrier proteins",
    "",
    "Q: Where does active transport occur in plants?",
    "A: Root hair cells",
  ].join("\n");

  const r = generateCards(notes);
  assert.ok(r.cards.length >= 4, `expected 4+, got ${r.cards.length}`);
  const rules = new Set(r.cards.map((c) => c.rule));
  assert.ok(rules.has("definition"));
  assert.ok(rules.has("list-under-heading"));
  assert.ok(rules.has("qa-pair"));
  // Counts reported must match the cards actually returned.
  const counted = Object.values(r.byRule).reduce((s, n) => s + n, 0);
  assert.ok(counted >= r.cards.length);
});

test("headings alone never produce a card", () => {
  const r = generateCards("# Biology\n## Cells\n### Transport");
  assert.equal(r.cards.length, 0);
});

test("very long terms are rejected rather than made into unreadable fronts", () => {
  const long = "x".repeat(300);
  const r = generateCards(`${long}: something`);
  assert.equal(r.cards.length, 0);
});
