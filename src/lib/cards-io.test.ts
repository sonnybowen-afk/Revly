import test from "node:test";
import assert from "node:assert/strict";

import {
  dedupe,
  parseImport,
  splitDelimited,
  stripHtml,
} from "./cards-io.ts";

test("Anki tab export parses, honouring its directives", () => {
  const anki = [
    "#separator:tab",
    "#html:true",
    "#tags column:3",
    "What is osmosis?\tDiffusion of water through a partially permeable membrane\tbiology gcse",
    "Define diffusion\tNet movement from high to low concentration\tbiology",
  ].join("\n");

  const r = parseImport(anki);
  assert.equal(r.format, "anki-tsv");
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[0].front, "What is osmosis?");
  assert.deepEqual(r.cards[0].tags, ["biology", "gcse"]);
});

test("Anki HTML in fields is stripped, not shown raw", () => {
  const anki =
    "#separator:tab\nWhat is a <b>catalyst</b>?\tA substance that<br>speeds up a reaction";
  const r = parseImport(anki);
  assert.equal(r.cards[0].front, "What is a catalyst?");
  assert.equal(r.cards[0].back, "A substance that\nspeeds up a reaction");
});

test("Quizlet default tab export parses without configuration", () => {
  const q = "mitochondria\tsite of aerobic respiration\nribosome\tsite of protein synthesis";
  const r = parseImport(q);
  assert.equal(r.format, "tsv");
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[1].back, "site of protein synthesis");
});

test("Quizlet custom separators are honoured when supplied", () => {
  const q = "photosynthesis - converting light energy to chemical energy\n\nrespiration - releasing energy from glucose";
  const r = parseImport(q, { fieldSeparator: " - ", recordSeparator: "\n\n" });
  assert.equal(r.format, "custom");
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[0].front, "photosynthesis");
  assert.equal(r.cards[1].front, "respiration");
});

test("ChatGPT markdown table parses and drops the header row", () => {
  const md = [
    "| Question | Answer |",
    "|---|---|",
    "| What is Ohm's law? | V = IR |",
    "| Unit of resistance? | Ohm |",
  ].join("\n");
  const r = parseImport(md);
  assert.equal(r.format, "markdown-table");
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[0].front, "What is Ohm's law?");
});

test("markdown emphasis is stripped from table cells", () => {
  const md = "| Question | Answer |\n|---|---|\n| **Define mitosis** | Nuclear division producing *identical* cells |";
  const r = parseImport(md);
  assert.equal(r.cards[0].front, "Define mitosis");
  assert.equal(r.cards[0].back, "Nuclear division producing identical cells");
});

test("ChatGPT Q:/A: prose parses, including bolded labels", () => {
  const qa = [
    "**Q:** What causes the greenhouse effect?",
    "**A:** Gases absorbing and re-emitting infrared radiation.",
    "Q: Name two greenhouse gases",
    "A: Carbon dioxide and methane.",
  ].join("\n");
  const r = parseImport(qa);
  assert.equal(r.format, "qa-block");
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[1].back, "Carbon dioxide and methane.");
});

test("multi-line answers stay attached to their question", () => {
  const qa = [
    "Q: State the three stages of the cell cycle",
    "A: 1. Interphase",
    "2. Mitosis",
    "3. Cytokinesis",
  ].join("\n");
  const r = parseImport(qa);
  assert.equal(r.cards.length, 1);
  assert.ok(r.cards[0].back.includes("Cytokinesis"));
});

test("quoted CSV fields containing commas survive intact", () => {
  const csv = '"Name three organelles","Nucleus, mitochondria, ribosome"\n"Define ion","A charged atom"';
  const r = parseImport(csv);
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[0].back, "Nucleus, mitochondria, ribosome");
});

test("escaped double quotes inside a CSV field are unescaped", () => {
  assert.deepEqual(splitDelimited('"He said ""yes""",ok', ","), [
    'He said "yes"',
    "ok",
  ]);
});

test("prose with commas is not mistaken for CSV", () => {
  const prose =
    "Photosynthesis happens in the chloroplast.\nIt needs light, water, and carbon dioxide.\nThe products are glucose and oxygen.";
  const r = parseImport(prose);
  assert.notEqual(r.format, "csv");
});

test("blank-line separated blocks parse as front/back pairs", () => {
  const text =
    "What is the capital of France?\nParis\n\nWhat is the capital of Spain?\nMadrid";
  const r = parseImport(text);
  assert.equal(r.format, "paragraph-pairs");
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[1].back, "Madrid");
});

test("rows missing a second side are counted as skipped, not dropped silently", () => {
  const tsv = "front one\tback one\njust a front with no back\nfront two\tback two";
  const r = parseImport(tsv);
  assert.equal(r.cards.length, 2);
  assert.equal(r.skipped, 1);
});

test("unrecognisable input reports rather than inventing cards", () => {
  const r = parseImport("a single line of nothing in particular");
  assert.equal(r.format, "unknown");
  assert.equal(r.cards.length, 0);
  assert.ok(r.notes[0].includes("Could not work out the format"));
});

test("empty input is handled without throwing", () => {
  const r = parseImport("   \n  \n ");
  assert.equal(r.cards.length, 0);
  assert.equal(r.format, "unknown");
});

test("CRLF line endings from Windows exports are normalised", () => {
  const r = parseImport("front\tback\r\nsecond\tcard\r\n");
  assert.equal(r.cards.length, 2);
  assert.equal(r.cards[0].back, "back");
});

test("stripHtml converts block tags to line breaks", () => {
  assert.equal(stripHtml("<div>one</div><div>two</div>"), "one\ntwo");
  assert.equal(stripHtml("a &amp; b &lt;c&gt;"), "a & b <c>");
});

test("dedupe removes repeated fronts and blank sides", () => {
  const out = dedupe([
    { front: "A", back: "1" },
    { front: "a", back: "2" },
    { front: "", back: "3" },
    { front: "B", back: "" },
    { front: "B", back: "4" },
  ]);
  assert.deepEqual(out, [
    { front: "A", back: "1" },
    { front: "B", back: "4" },
  ]);
});
