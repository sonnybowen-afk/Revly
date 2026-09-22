import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { METHODS } from "./methods.ts";
import type { Answers } from "./hair-match.ts";
import { confidence, rankMethods, topMatch } from "./hair-match.ts";

const base: Answers = {
  hairType: "medium",
  density: "medium",
  goal: "both",
  lifestyle: "relaxed",
  upkeep: "standard",
  budget: "mid",
  fragile: false,
};

const answers = (over: Partial<Answers> = {}): Answers => ({ ...base, ...over });

describe("rankMethods", () => {
  it("returns every method, ranked high to low", () => {
    const ranked = rankMethods(answers());
    assert.equal(ranked.length, METHODS.length);
    for (let i = 1; i < ranked.length; i += 1) {
      assert.ok(ranked[i - 1].score >= ranked[i].score);
    }
  });

  it("keeps scores inside 0–100", () => {
    const ranked = rankMethods(answers());
    for (const match of ranked) {
      assert.ok(match.score >= 0 && match.score <= 100, `${match.method.id} = ${match.score}`);
    }
  });

  it("is deterministic", () => {
    const a = rankMethods(answers({ hairType: "fine" }));
    const b = rankMethods(answers({ hairType: "fine" }));
    assert.deepEqual(
      a.map((m) => [m.method.id, m.score]),
      b.map((m) => [m.method.id, m.score]),
    );
  });

  it("scores near the ceiling when every axis lines up", () => {
    // LA Weave on its home ground: thick hair, volume, very active, and
    // the cheaper of the two price points — a full head is £45.
    // It cannot reach a literal 100 because no method's move-up midpoint sits
    // exactly on an upkeep target, so the honest ceiling is the high 90s.
    const ranked = rankMethods(
      answers({
        hairType: "thick",
        density: "high",
        goal: "volume",
        lifestyle: "very-active",
        upkeep: "standard",
        budget: "value",
        fragile: false,
      }),
    );
    assert.equal(ranked[0].method.id, "la-weave");
    assert.ok(ranked[0].score >= 95, `scored ${ranked[0].score}`);
  });
});

describe("hard blocks", () => {
  it("blocks LA Weave on fine hair", () => {
    const ranked = rankMethods(answers({ hairType: "fine", density: "low" }));
    const blocked = ranked.filter((m) => m.blocked).map((m) => m.method.id);
    assert.ok(blocked.includes("la-weave"));
  });

  it("scores a blocked method 0 and explains why", () => {
    const ranked = rankMethods(answers({ hairType: "fine" }));
    const weave = ranked.find((m) => m.method.id === "la-weave");
    assert.ok(weave);
    assert.equal(weave.score, 0);
    assert.equal(weave.reasons.filter((r) => r.kind === "block").length, 1);
  });

  it("sorts blocked methods to the bottom rather than dropping them", () => {
    const ranked = rankMethods(answers({ hairType: "fine" }));
    assert.equal(ranked.length, METHODS.length);
    const firstBlocked = ranked.findIndex((m) => m.blocked);
    assert.ok(ranked.slice(firstBlocked).every((m) => m.blocked));
  });

  it("blocks tape and nano on textured hair and recommends one that suits it", () => {
    const ranked = rankMethods(answers({ hairType: "textured" }));
    const blocked = ranked.filter((m) => m.blocked).map((m) => m.method.id);
    assert.ok(blocked.includes("tape-in"));
    assert.ok(blocked.includes("nano-rings"));
    // Both the sew-in and the LA Weave are fitted on textured hair, so the
    // winner is whichever scores higher — but it must be one of those two.
    assert.ok(ranked[0].method.suits.includes("textured"));
    assert.equal(ranked[0].blocked, false);
  });
});

describe("density adjusts the hair-type judgement", () => {
  it("treats low-density medium hair as fine, blocking LA Weave", () => {
    const ranked = rankMethods(answers({ hairType: "medium", density: "low" }));
    const weave = ranked.find((m) => m.method.id === "la-weave");
    assert.ok(weave?.blocked);
  });

  it("treats high-density fine hair as medium, unblocking LA Weave", () => {
    const ranked = rankMethods(answers({ hairType: "fine", density: "high" }));
    const weave = ranked.find((m) => m.method.id === "la-weave");
    assert.equal(weave?.blocked, false);
  });
});

describe("preferences move the ranking", () => {
  it("prefers nano rings for fragile fine hair", () => {
    const best = topMatch(
      answers({ hairType: "fine", fragile: true, budget: "mid", upkeep: "minimal" }),
    );
    assert.equal(best?.method.id, "nano-rings");
  });

  it("prefers tape-in on a value budget wanting the quickest fit", () => {
    const ranked = rankMethods(
      answers({ hairType: "fine", budget: "value", upkeep: "frequent" }),
    );
    assert.equal(ranked[0].method.id, "tape-in");
  });

  it("penalises a low-resilience method for a very active client", () => {
    const relaxed = rankMethods(answers({ hairType: "fine", lifestyle: "relaxed" }));
    const active = rankMethods(answers({ hairType: "fine", lifestyle: "very-active" }));
    const score = (list: ReturnType<typeof rankMethods>, id: string) =>
      list.find((m) => m.method.id === id)?.score ?? 0;
    assert.ok(score(active, "tape-in") < score(relaxed, "tape-in"));
  });

  it("penalises fragile hair on anything less than the gentlest bond", () => {
    const sturdy = rankMethods(answers({ hairType: "thick", fragile: false }));
    const fragile = rankMethods(answers({ hairType: "thick", fragile: true }));
    const score = (list: ReturnType<typeof rankMethods>, id: string) =>
      list.find((m) => m.method.id === id)?.score ?? 0;
    // Nano is the only 5/5 for gentleness; everything else takes a hit.
    assert.ok(score(fragile, "la-weave") < score(sturdy, "la-weave"));
    assert.equal(score(fragile, "nano-rings"), score(sturdy, "nano-rings"));
  });

  it("keeps only the methods that are on the price list", () => {
    const ids = rankMethods(answers()).map((m) => m.method.id).sort();
    assert.deepEqual(ids, [
      "la-weave",
      "micro-rings",
      "mini-tip",
      "nano-rings",
      "tape-in",
    ]);
  });
});

describe("topMatch", () => {
  it("returns the highest-scoring unblocked method", () => {
    const ranked = rankMethods(answers());
    assert.equal(topMatch(answers())?.method.id, ranked[0].method.id);
  });

  it("never returns a blocked method", () => {
    const best = topMatch(answers({ hairType: "textured" }));
    assert.equal(best?.blocked, false);
  });
});

describe("confidence", () => {
  it("reports how close the top two are", () => {
    const ranked = rankMethods(answers());
    const viable = ranked.filter((m) => m.blocked === false);
    const gap = viable[0].score - viable[1].score;
    const expected = gap >= 12 ? "strong" : gap >= 5 ? "good" : "close";
    assert.equal(confidence(ranked), expected);
  });

  it("is strong when only one method survives", () => {
    const single = rankMethods(answers()).slice(0, 1);
    assert.equal(confidence(single), "strong");
  });
});
