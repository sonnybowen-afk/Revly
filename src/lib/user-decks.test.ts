import test from "node:test";
import assert from "node:assert/strict";

import { DECKS } from "./decks.ts";
import {
  buildDeck,
  findDeck,
  isUserDeck,
  mergeDecks,
  sanitiseUserDecks,
  type UserDeck,
} from "./user-decks.ts";

function make(overrides: Partial<Parameters<typeof buildDeck>[0]> = {}) {
  return buildDeck({
    title: "My deck",
    subject: "Biology",
    level: "GCSE",
    exam: "AQA",
    description: "",
    origin: "written",
    cards: [{ front: "a", back: "1" }],
    ...overrides,
  });
}

test("built decks get namespaced ids that cannot collide with seed decks", () => {
  const d = make();
  assert.ok(isUserDeck(d.id));
  assert.ok(DECKS.every((s) => s.id !== d.id));
});

test("blank cards are dropped at build time", () => {
  const d = make({
    cards: [
      { front: "a", back: "1" },
      { front: "  ", back: "2" },
      { front: "c", back: "   " },
    ],
  });
  assert.equal(d.cards.length, 1);
});

test("card ids are unique within a deck", () => {
  const d = make({
    cards: [
      { front: "a", back: "1" },
      { front: "b", back: "2" },
      { front: "c", back: "3" },
    ],
  });
  assert.equal(new Set(d.cards.map((c) => c.id)).size, 3);
});

test("an empty title falls back rather than rendering blank", () => {
  assert.equal(make({ title: "   " }).title, "Untitled deck");
});

test("hints are kept only when non-empty", () => {
  const d = make({
    cards: [
      { front: "a", back: "1", hint: "  " },
      { front: "b", back: "2", hint: "watch units" },
    ],
  });
  assert.equal(d.cards[0].hint, undefined);
  assert.equal(d.cards[1].hint, "watch units");
});

test("merge keeps the seed library and appends user decks", () => {
  const d = make();
  const merged = mergeDecks([d]);
  assert.equal(merged.length, DECKS.length + 1);
  assert.equal(merged.at(-1)?.id, d.id);
});

test("findDeck resolves both seed and user decks", () => {
  const d = make();
  assert.equal(findDeck(DECKS[0].id, [d])?.title, DECKS[0].title);
  assert.equal(findDeck(d.id, [d])?.title, "My deck");
  assert.equal(findDeck("nope", [d]), undefined);
});

test("corrupted storage is discarded instead of crashing the list", () => {
  assert.deepEqual(sanitiseUserDecks(null), []);
  assert.deepEqual(sanitiseUserDecks("not an array"), []);
  assert.deepEqual(sanitiseUserDecks([{ id: 1 }]), []);
  assert.deepEqual(sanitiseUserDecks([{ id: "x", title: "t" }]), []);
  assert.deepEqual(
    sanitiseUserDecks([{ id: "x", title: "t", cards: [{ id: "c" }] }]),
    [],
  );
});

test("a well-formed stored deck survives sanitising", () => {
  const good = make() as UserDeck;
  assert.equal(sanitiseUserDecks([good]).length, 1);
});
