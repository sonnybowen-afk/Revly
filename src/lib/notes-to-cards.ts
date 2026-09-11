/**
 * Notes → flashcards.
 *
 * IMPORTANT, and stated plainly in the UI too: this is a deterministic
 * extractor, not a language model. Revly is a static site with no server,
 * and calling an LLM from the browser would mean shipping an API key in
 * public JavaScript — which would be leaked the moment anyone opened
 * devtools. So this does the job with grammar and structure instead.
 *
 * In practice that is a fair trade. It is instant, free, works offline,
 * and nothing leaves the browser. What it cannot do is paraphrase or infer
 * a question that the notes do not already imply — so it produces DRAFTS,
 * and the UI says so.
 *
 * The seam for a real model is `generateCards`: give it the same signature
 * behind a server route and nothing else has to change.
 */

export interface GeneratedCard {
  front: string;
  back: string;
  /** Which rule produced it — surfaced so the learner can judge quality. */
  rule: RuleName;
}

export type RuleName =
  | "definition"
  | "is-statement"
  | "list-under-heading"
  | "term-bullet"
  | "qa-pair";

export interface GenerateResult {
  cards: GeneratedCard[];
  /** Lines that carried no extractable structure. */
  unused: number;
  byRule: Record<RuleName, number>;
}

const MIN_FRONT = 3;
const MIN_BACK = 2;
const MAX_FRONT = 220;

/** `Term: definition`, `Term - definition`, `Term = definition`. */
const DEFINITION =
  /^\s*(?:[-*•]\s*)?(?:\d+[.)]\s*)?(?:\*\*)?([^:\-–—=*][^:\-–—=]{1,80}?)(?:\*\*)?\s*(?::|\s[-–—]\s|=)\s*(.{3,})$/;

/** `Osmosis is the movement of…`, `Mitosis means…` */
const IS_STATEMENT =
  /^\s*(?:[-*•]\s*)?(?:\*\*)?([A-Z][^.!?]{2,60}?)(?:\*\*)?\s+(?:is|are|was|were|means|refers to|is defined as|is called)\s+(.{8,})$/;

const HEADING_MD = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/;
const HEADING_COLON = /^\s*(?:\*\*)?([A-Z][^.!?]{2,70}?)(?:\*\*)?\s*:\s*$/;
const BULLET = /^\s*(?:[-*•]|\d+[.)])\s+(.+)$/;

const QA_LINE = /^\s*(?:\*\*)?(?:Q|Question)\s*(?:\*\*)?\s*[:.]\s*(.+)$/i;
const ANSWER_LINE = /^\s*(?:\*\*)?(?:A|Answer)\s*(?:\*\*)?\s*[:.]\s*(.+)$/i;

/** Normalise markup and whitespace, leaving punctuation alone. */
function normalize(value: string): string {
  return value
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

/**
 * Normalise a *fragment* — a term or a definition body — and drop the
 * trailing punctuation it inherited from the sentence it came out of.
 * Never use this on a composed question: it would eat the "." or "?".
 */
function tidy(value: string): string {
  return normalize(value).replace(/[.,;]+$/, "");
}

function sentenceCase(value: string): string {
  const v = value.trim();
  if (!v) return v;
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function usable(front: string, back: string): boolean {
  return (
    front.length >= MIN_FRONT &&
    front.length <= MAX_FRONT &&
    back.length >= MIN_BACK &&
    front.toLowerCase() !== back.toLowerCase()
  );
}

/** "Photosynthesis: photosynthesis" is not a flashcard. */
function echoesTerm(term: string, body: string): boolean {
  return tidy(term).toLowerCase() === tidy(body).toLowerCase();
}

/**
 * Phrase a question for a term. Uses "Define" for single words and short
 * noun phrases, "What is" otherwise — which reads less robotic than
 * applying one template to everything.
 */
function questionFor(term: string): string {
  const t = tidy(term);
  const words = t.split(/\s+/).length;
  if (words === 1) return `Define ${t.toLowerCase()}.`;
  if (words <= 4) return `What is meant by ${t.toLowerCase()}?`;
  return `${sentenceCase(t)} — explain.`;
}

function listQuestion(heading: string): string {
  const h = tidy(heading).replace(/:$/, "");
  if (/^(the\s+)?(stages|steps|phases|types|kinds|causes|reasons|effects|factors|advantages|disadvantages|features|functions)\b/i.test(h)) {
    return `List ${h.toLowerCase()}.`;
  }
  return `What are the key points about ${h.toLowerCase()}?`;
}

export function generateCards(notes: string): GenerateResult {
  const lines = notes.replace(/\r\n/g, "\n").split("\n");
  const cards: GeneratedCard[] = [];
  const byRule: Record<RuleName, number> = {
    definition: 0,
    "is-statement": 0,
    "list-under-heading": 0,
    "term-bullet": 0,
    "qa-pair": 0,
  };

  let usedLines = 0;
  let totalContentLines = 0;

  let heading: string | null = null;
  let bullets: string[] = [];

  const push = (front: string, back: string, rule: RuleName) => {
    const f = sentenceCase(normalize(front));
    const b = sentenceCase(tidy(back));
    if (!usable(f, b)) return false;
    cards.push({ front: f, back: b, rule });
    byRule[rule] += 1;
    return true;
  };

  /** Turn the bullets collected under a heading into one list card. */
  const flushBullets = () => {
    if (heading && bullets.length >= 2) {
      const body = bullets.map((b) => `• ${tidy(b)}`).join("\n");
      const f = sentenceCase(normalize(listQuestion(heading)));
      if (usable(f, body)) {
        cards.push({ front: f, back: body, rule: "list-under-heading" });
        byRule["list-under-heading"] += 1;
        usedLines += bullets.length;
      }
    }
    bullets = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      flushBullets();
      continue;
    }
    totalContentLines += 1;

    // Explicit Q/A wins over everything — the writer already did the work.
    const q = line.match(QA_LINE);
    if (q) {
      const next = (lines[i + 1] ?? "").trim();
      const a = next.match(ANSWER_LINE);
      if (a) {
        if (push(q[1], a[1], "qa-pair")) usedLines += 2;
        i += 1;
        continue;
      }
    }

    const mdHeading = line.match(HEADING_MD);
    if (mdHeading) {
      flushBullets();
      heading = mdHeading[1];
      usedLines += 1;
      continue;
    }

    const colonHeading = line.match(HEADING_COLON);
    if (colonHeading) {
      flushBullets();
      heading = colonHeading[1];
      usedLines += 1;
      continue;
    }

    const bullet = line.match(BULLET);
    if (bullet) {
      const inner = bullet[1];
      // A bullet that is itself `term — definition` is worth its own card.
      const innerDef = inner.match(DEFINITION);
      if (
        innerDef &&
        tidy(innerDef[1]).split(/\s+/).length <= 6 &&
        !echoesTerm(innerDef[1], innerDef[2])
      ) {
        if (push(questionFor(innerDef[1]), innerDef[2], "term-bullet")) {
          usedLines += 1;
          continue;
        }
      }
      bullets.push(inner);
      continue;
    }

    // Plain lines: definition patterns, then "X is Y" statements.
    const def = line.match(DEFINITION);
    if (
      def &&
      tidy(def[1]).split(/\s+/).length <= 8 &&
      !echoesTerm(def[1], def[2])
    ) {
      if (push(questionFor(def[1]), def[2], "definition")) {
        usedLines += 1;
        continue;
      }
    }

    const isStmt = line.match(IS_STATEMENT);
    if (isStmt) {
      const term = tidy(isStmt[1]);
      if (term.split(/\s+/).length <= 6 && !echoesTerm(term, isStmt[2])) {
        if (push(questionFor(term), isStmt[2], "is-statement")) {
          usedLines += 1;
          continue;
        }
      }
    }

    // Prose under a heading still contributes to that heading's list card.
    if (heading && line.length > 20) bullets.push(line);
  }

  flushBullets();

  // Same front twice means the notes repeated themselves; keep the first.
  const seen = new Set<string>();
  const unique = cards.filter((c) => {
    const key = c.front.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    cards: unique,
    unused: Math.max(0, totalContentLines - usedLines),
    byRule,
  };
}

export const RULE_LABELS: Record<RuleName, string> = {
  definition: "Definition",
  "is-statement": "Statement",
  "list-under-heading": "List",
  "term-bullet": "Term",
  "qa-pair": "Q&A",
};
