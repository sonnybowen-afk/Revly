import test from "node:test";
import assert from "node:assert/strict";

import {
  MIN_PER_QUESTION,
  TOTAL_LIMIT,
  reviewStatement,
} from "./statement-review.ts";

const pad = (s: string, n = MIN_PER_QUESTION + 40) => s.padEnd(n, " x");
const has = (r: ReturnType<typeof reviewStatement>, id: string) =>
  r.findings.some((f) => f.id === id);

test("an empty statement reports nothing rather than a wall of errors", () => {
  const r = reviewStatement(["", "", ""]);
  assert.equal(r.readiness, "empty");
  assert.equal(r.findings.length, 0);
  assert.equal(r.totalChars, 0);
});

test("answers under the minimum are flagged as failures", () => {
  const r = reviewStatement(["too short", "", ""]);
  assert.ok(has(r, "short-0"));
  assert.ok(has(r, "empty-1"));
  assert.equal(r.readiness, "not-ready");
});

test("exceeding the total character limit is a failure with the overage", () => {
  const long = "a".repeat(1500);
  const r = reviewStatement([long, long, long]);
  const f = r.findings.find((x) => x.id === "over-limit")!;
  assert.ok(f);
  assert.ok(f.title.includes(String(4500 - TOTAL_LIMIT)));
});

test("naming a university is a failure and the name is quoted back", () => {
  const r = reviewStatement([
    pad("I want to study at the University of Manchester because of its labs."),
    pad("My A-Levels prepared me."),
    pad("I did work experience."),
  ]);
  const f = r.findings.find((x) => x.id === "named-university")!;
  assert.ok(f, "should flag a named university");
  assert.equal(f.severity, "fail");
  assert.ok(/Manchester/i.test(f.title));
});

test("common university shorthands are caught too", () => {
  for (const name of ["Oxbridge", "Imperial College", "LSE"]) {
    const r = reviewStatement([pad(`Studying at ${name} appeals to me.`), pad("x"), pad("y")]);
    assert.ok(has(r, "named-university"), `missed ${name}`);
  }
});

test("a cliché opening is flagged once, not once per phrase", () => {
  const r = reviewStatement([
    pad("From a young age I have always been fascinated by chemistry."),
    pad("x"),
    pad("y"),
  ]);
  const cliches = r.findings.filter((f) => f.id.startsWith("cliche-"));
  assert.equal(cliches.length, 1);
  assert.equal(cliches[0].severity, "warn");
});

test("opening with a quotation is flagged", () => {
  const r = reviewStatement([pad('"Science is magic that works" said Vonnegut.'), pad("x"), pad("y")]);
  assert.ok(has(r, "quote-opening"));
});

test("claims with no evidence anywhere is a failure", () => {
  const r = reviewStatement([
    pad("I am passionate about physics and I love the subject deeply."),
    pad("I enjoy mechanics."),
    pad("I find astronomy fascinating."),
  ]);
  const f = r.findings.find((x) => x.id === "claims-no-evidence")!;
  assert.ok(f);
  assert.equal(f.severity, "fail");
});

test("evidence without reflection is a failure", () => {
  const r = reviewStatement([
    pad("I read widely around the subject and I attended a lecture series."),
    pad("I completed an EPQ and I built a small telescope."),
    pad("I volunteered at a science museum and did work experience."),
  ]);
  assert.ok(has(r, "no-reflection"));
});

test("a strong answer avoids the evidence and reflection failures", () => {
  const strong = [
    pad(
      "Rate equations confused me, so I worked through Chemguide's kinetics section. That showed me the maths was the obstacle, not the chemistry.",
    ),
    pad(
      "I completed an EPQ on catalysis. Designing the method taught me how much of chemistry is controlling variables you cannot see.",
    ),
    pad(
      "I volunteered in a pharmacy dispensary. Watching interaction checks made me appreciate that reaction conditions matter outside a lab.",
    ),
  ];
  const r = reviewStatement(strong);
  assert.ok(!has(r, "claims-no-evidence"));
  assert.ok(!has(r, "no-reflection"));
  assert.ok(!has(r, "named-university"));
  assert.equal(r.counts.fail, 0);
});

test("question 3 without a 'why' is flagged separately", () => {
  const r = reviewStatement([
    pad("Rate equations confused me so I read Chemguide. That showed me the gap."),
    pad("My EPQ on catalysis taught me about method design."),
    pad("I volunteered at a pharmacy. I attended a lecture. I did work experience."),
  ]);
  assert.ok(has(r, "q3-no-why"));
});

test("run-on sentences are flagged with an excerpt", () => {
  const long = `I ${"went to the lab and ".repeat(12)}finished.`;
  const r = reviewStatement([pad(long, 600), pad("x"), pad("y")]);
  const f = r.findings.find((x) => x.id === "run-on")!;
  assert.ok(f);
  assert.ok(f.excerpt && f.excerpt.length > 20);
});

test("a statement where most sentences start with I is flagged", () => {
  const text = Array.from({ length: 8 }, (_, i) => `I did thing number ${i}.`).join(" ");
  const r = reviewStatement([pad(text, 600), pad("x"), pad("y")]);
  assert.ok(has(r, "i-openers"));
});

test("intensifier spam is a note, not a failure", () => {
  const text =
    "This is very really extremely incredibly truly good. " .repeat(6) +
    "I read a paper which taught me a lot about the subject and its limits.";
  const r = reviewStatement([pad(text, 700), pad("x"), pad("y")]);
  const f = r.findings.find((x) => x.id === "intensifiers");
  assert.ok(f);
  assert.equal(f.severity, "note");
});

test("readiness escalates with severity", () => {
  const clean = reviewStatement([
    pad("Kinetics confused me so I read Chemguide, which showed me the maths was the gap."),
    pad("My EPQ on catalysis taught me how method design controls hidden variables."),
    pad("Pharmacy volunteering made me appreciate that conditions matter outside a lab."),
  ]);
  assert.ok(["close", "needs-work"].includes(clean.readiness));

  const broken = reviewStatement(["short", "", ""]);
  assert.equal(broken.readiness, "not-ready");
});

test("findings are ordered failures first", () => {
  const r = reviewStatement([
    pad('"A quote" From a young age I have always been passionate about the University of Oxford.'),
    pad("I enjoy it."),
    "tiny",
  ]);
  const severities = r.findings.map((f) => f.severity);
  const firstWarn = severities.indexOf("warn");
  const lastFail = severities.lastIndexOf("fail");
  if (firstWarn !== -1 && lastFail !== -1) assert.ok(lastFail < firstWarn);
});

test("per-question stats are reported accurately", () => {
  const r = reviewStatement(["One. Two.", "", ""]);
  assert.equal(r.stats[0].chars, 9);
  assert.equal(r.stats[0].sentences, 2);
  assert.equal(r.stats[0].words, 2);
  assert.equal(r.stats[0].meetsMinimum, false);
  assert.equal(r.stats.length, 3);
});

test("remaining characters are reported and can go negative", () => {
  const r = reviewStatement(["a".repeat(4100), "", ""]);
  assert.equal(r.withinTotal, TOTAL_LIMIT - 4100);
  assert.ok(r.withinTotal < 0);
});

test("every finding carries a concrete fix, not just a complaint", () => {
  const r = reviewStatement([
    pad("From a young age I have always been passionate about studying at Oxford."),
    pad("I enjoy it."),
    pad("I love it."),
  ]);
  assert.ok(r.findings.length > 0);
  for (const f of r.findings) {
    assert.ok(f.fix.length > 25, `${f.id} has no usable fix`);
    assert.ok(f.message.length > 25, `${f.id} has no explanation`);
  }
});
