/**
 * Personal statement checker.
 *
 * Scores a draft against the things admissions tutors reliably react to,
 * and explains each one so the learner can fix it themselves. Every check
 * is a rule with a stated reason — nothing here is a black box, and it
 * does not pretend to predict an outcome.
 *
 * Same constraint as the notes converter: no server, so no language model.
 * That turns out to matter less here than you would think, because most of
 * what separates a weak statement from a strong one is structural — claims
 * without evidence, no reflection, a named university, a cliché opening —
 * and structure is exactly what rules are good at. What it cannot judge is
 * whether an argument is *interesting*. A human still has to read it.
 *
 * UCAS format from 2026 entry: three questions, 4,000 characters across
 * all three, minimum 350 characters each.
 */

export const TOTAL_LIMIT = 4000;
export const MIN_PER_QUESTION = 350;

export const QUESTIONS = [
  "Why do you want to study this course or subject?",
  "How have your qualifications and studies helped you prepare for this course or subject?",
  "What else have you done to help you prepare outside education, and why are these experiences useful?",
] as const;

export type Severity = "fail" | "warn" | "note";

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  /** What is wrong, in plain terms. */
  message: string;
  /** What to do about it. */
  fix: string;
  /** Which answer it came from, 0-indexed, or null for whole-statement. */
  question: number | null;
  excerpt?: string;
}

export interface QuestionStats {
  index: number;
  chars: number;
  words: number;
  sentences: number;
  meetsMinimum: boolean;
}

export interface ReviewResult {
  findings: Finding[];
  stats: QuestionStats[];
  totalChars: number;
  withinTotal: number;
  readiness: "empty" | "not-ready" | "needs-work" | "close";
  counts: Record<Severity, number>;
}

/* ── Patterns ──────────────────────────────────────────────────── */

const CLICHES: { pattern: RegExp; label: string }[] = [
  { pattern: /\bfrom (?:a|an) (?:young|early) age\b/i, label: "from a young age" },
  { pattern: /\bfor as long as i can remember\b/i, label: "for as long as I can remember" },
  { pattern: /\bever since i was\b/i, label: "ever since I was" },
  { pattern: /\bsince childhood\b/i, label: "since childhood" },
  { pattern: /\bi have always been (?:fascinated|passionate|interested|drawn)\b/i, label: "I have always been…" },
  { pattern: /\bmy (?:lifelong |burning )?passion for\b/i, label: "my passion for" },
  { pattern: /\bin today'?s society\b/i, label: "in today's society" },
  { pattern: /\bthe world of\b/i, label: "the world of" },
  { pattern: /\bthroughout my life\b/i, label: "throughout my life" },
  { pattern: /\bi was captivated by\b/i, label: "I was captivated by" },
];

/**
 * Named universities are disqualifying — one statement goes to all five.
 *
 * Deliberately case-sensitive on the proper-noun parts: lowercasing the
 * whole pattern would flag "I want to go to university". "Cambridge" is
 * guarded against the exam-board senses, since plenty of applicants
 * legitimately sit Cambridge IGCSEs.
 */
const UNIVERSITIES = new RegExp(
  [
    "[Uu]niversity of [A-Z][A-Za-z]+",
    "[A-Z][A-Za-z]+ University",
    "\\bOxbridge\\b",
    "\\bImperial College\\b",
    "\\bUCL\\b",
    "\\bLSE\\b",
    "\\bRussell Group\\b",
    "\\bOxford\\b(?!\\s+(?:University Press|Dictionary))",
    "\\bCambridge\\b(?!\\s+(?:IGCSE|International|Assessment|Pre-U|Dictionary|University Press))",
  ].join("|"),
);

const CLAIM =
  /\b(?:i am (?:really |very |deeply )?(?:passionate|interested|fascinated|keen|excited)|i (?:love|enjoy|adore)|i find [a-z ]{3,30} (?:fascinating|interesting)|has always interested me)\b/gi;

const EVIDENCE =
  /\b(?:i read|i have read|reading\s|i completed|i built|i designed|i wrote|i volunteered|i attended|i shadowed|work experience|placement|internship|apprenticeship|lecture|seminar|olympiad|competition|\bEPQ\b|\bMOOC\b|open course|research paper|journal|dissertation|i organised|i led|i coached|i taught|i tutored|part[- ]time job|i analysed|i investigated)\b/gi;

const REFLECTION =
  /\b(?:taught me|showed me|i learned|i learnt|i realised|i realized|as a result|this (?:developed|confirmed|challenged|changed)|which gave me|made me appreciate|i now understand|this made me|prompted me to|led me to)\b/gi;

const INTENSIFIERS =
  /\b(?:very|really|extremely|incredibly|truly|hugely|massively|absolutely|utterly)\b/gi;

/* ── Helpers ───────────────────────────────────────────────────── */

function sentencesOf(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z"'(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function wordsOf(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function countMatches(text: string, re: RegExp): number {
  const matches = text.match(new RegExp(re.source, re.flags.replace("g", "") + "g"));
  return matches ? matches.length : 0;
}

function excerptAround(text: string, re: RegExp, span = 90): string | undefined {
  const m = text.match(re);
  if (!m || m.index === undefined) return undefined;
  const start = Math.max(0, m.index - 20);
  const raw = text.slice(start, start + span).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${raw}${start + span < text.length ? "…" : ""}`;
}

/* ── The checker ───────────────────────────────────────────────── */

export function reviewStatement(answers: string[]): ReviewResult {
  const cleaned = answers.map((a) => (a ?? "").trim());
  const findings: Finding[] = [];

  const stats: QuestionStats[] = cleaned.map((text, index) => ({
    index,
    chars: text.length,
    words: wordsOf(text).length,
    sentences: sentencesOf(text).length,
    meetsMinimum: text.length >= MIN_PER_QUESTION,
  }));

  const totalChars = cleaned.reduce((sum, a) => sum + a.length, 0);
  const whole = cleaned.join("\n\n");

  if (!whole.trim()) {
    return {
      findings: [],
      stats,
      totalChars: 0,
      withinTotal: TOTAL_LIMIT,
      readiness: "empty",
      counts: { fail: 0, warn: 0, note: 0 },
    };
  }

  /* ── Hard limits ─────────────────────────────────────────── */

  if (totalChars > TOTAL_LIMIT) {
    findings.push({
      id: "over-limit",
      severity: "fail",
      question: null,
      title: `${totalChars - TOTAL_LIMIT} characters over the limit`,
      message: `UCAS allows ${TOTAL_LIMIT} characters across all three answers. Yours is ${totalChars}.`,
      fix: "Cut the weakest evidence rather than trimming words evenly — an anecdote that carries no reflection is usually the cheapest thing to lose.",
    });
  }

  cleaned.forEach((text, i) => {
    if (text.length === 0) {
      findings.push({
        id: `empty-${i}`,
        severity: "fail",
        question: i,
        title: `Question ${i + 1} is empty`,
        message: "All three questions must be answered.",
        fix: "Even a rough first pass is worth writing — the checker can work with it.",
      });
      return;
    }
    if (text.length < MIN_PER_QUESTION) {
      findings.push({
        id: `short-${i}`,
        severity: "fail",
        question: i,
        title: `Question ${i + 1} is under the ${MIN_PER_QUESTION}-character minimum`,
        message: `It is ${text.length} characters. UCAS will not let you submit below ${MIN_PER_QUESTION}.`,
        fix: "Add the 'so what' to something you have already mentioned rather than introducing a new activity.",
      });
    }
  });

  const uni = whole.match(UNIVERSITIES);
  if (uni) {
    findings.push({
      id: "named-university",
      severity: "fail",
      question: null,
      title: `You have named a university ("${uni[0]}")`,
      message:
        "The same statement goes to all five of your choices. Naming one tells the other four they are not your first pick.",
      fix: "Describe what you want from the course instead of who provides it.",
      excerpt: excerptAround(whole, UNIVERSITIES),
    });
  }

  /* ── Opening ─────────────────────────────────────────────── */

  const opening = cleaned[0] ?? "";
  const openingWindow = opening.slice(0, 240);

  for (const { pattern, label } of CLICHES) {
    if (pattern.test(openingWindow)) {
      findings.push({
        id: `cliche-${label.replace(/\W+/g, "-")}`,
        severity: "warn",
        question: 0,
        title: `Opens with a cliché: "${label}"`,
        message:
          "Admissions tutors read thousands of these. An opening they have seen before buys you nothing in the first line, which is the line most likely to be read closely.",
        fix: "Open on the specific thing that actually hooked you — a problem, a text, a result that surprised you — and let the interest be implied by it.",
        excerpt: excerptAround(openingWindow, pattern),
      });
      break;
    }
  }

  if (/^\s*["“']/.test(opening)) {
    findings.push({
      id: "quote-opening",
      severity: "warn",
      question: 0,
      title: "Opens with a quotation",
      message:
        "The first thing on the page is someone else's sentence. It also spends characters you cannot spare on words that are not yours.",
      fix: "Start with your own observation. If the quote genuinely matters, work it in later and say why.",
    });
  }

  /* ── Evidence and reflection ─────────────────────────────── */

  const claims = countMatches(whole, CLAIM);
  const evidence = countMatches(whole, EVIDENCE);

  if (claims > 0 && evidence === 0) {
    findings.push({
      id: "claims-no-evidence",
      severity: "fail",
      question: null,
      title: "You state interest but never evidence it",
      message: `There ${claims === 1 ? "is 1 statement" : `are ${claims} statements`} of interest or enthusiasm and no concrete evidence — nothing read, built, attended, or done.`,
      fix: "For each claim, name the thing that proves it. 'I am passionate about chemistry' does nothing; 'I worked through Chemguide's kinetics section after the rate equations unit confused me' does.",
      excerpt: excerptAround(whole, CLAIM),
    });
  } else if (claims >= 3 && evidence < claims / 2) {
    findings.push({
      id: "claim-heavy",
      severity: "warn",
      question: null,
      title: "More assertion than evidence",
      message: `${claims} claims of interest against ${evidence} pieces of concrete evidence.`,
      fix: "Delete the weakest claims entirely. A statement made only of evidence still reads as enthusiastic; one made only of claims reads as empty.",
    });
  }

  const reflection = countMatches(whole, REFLECTION);
  if (evidence >= 2 && reflection === 0) {
    findings.push({
      id: "no-reflection",
      severity: "fail",
      question: null,
      title: "You list what you did, never what it taught you",
      message:
        "Activities are mentioned but nothing is drawn from them. This is the single most common reason a statement full of impressive things still reads flat.",
      fix: "After each activity add one sentence: what it changed in how you think about the subject.",
    });
  } else if (evidence >= 3 && reflection < 2) {
    findings.push({
      id: "thin-reflection",
      severity: "warn",
      question: null,
      title: "Reflection is thin for the number of activities",
      message: `${evidence} activities but only ${reflection} reflective sentence${reflection === 1 ? "" : "s"}.`,
      fix: "Cut an activity and use the characters to reflect properly on one that remains.",
    });
  }

  if (cleaned[2] && cleaned[2].length >= MIN_PER_QUESTION) {
    const q3Reflection = countMatches(cleaned[2], REFLECTION);
    if (q3Reflection === 0) {
      findings.push({
        id: "q3-no-why",
        severity: "warn",
        question: 2,
        title: "Question 3 answers the 'what' but not the 'why'",
        message:
          "The question explicitly asks why these experiences are useful. Listing them is only half a mark.",
        fix: "Close each example with the transferable thing it gave you that the course will draw on.",
      });
    }
  }

  /* ── Style ───────────────────────────────────────────────── */

  const allSentences = sentencesOf(whole);
  const longOnes = allSentences.filter((s) => wordsOf(s).length > 40);
  if (longOnes.length > 0) {
    findings.push({
      id: "run-on",
      severity: "warn",
      question: null,
      title: `${longOnes.length} sentence${longOnes.length === 1 ? "" : "s"} over 40 words`,
      message:
        "Long sentences bury the point, and this is read quickly. Anything over about 40 words usually contains two ideas.",
      fix: "Split at the conjunction. Short sentences read as confident, not simple.",
      excerpt: longOnes[0].slice(0, 120) + "…",
    });
  }

  const iOpeners = allSentences.filter((s) => /^I\b/.test(s)).length;
  if (allSentences.length >= 6 && iOpeners / allSentences.length > 0.5) {
    findings.push({
      id: "i-openers",
      severity: "warn",
      question: null,
      title: `${iOpeners} of ${allSentences.length} sentences start with "I"`,
      message:
        "It reads as a list of assertions rather than an argument, and the rhythm gets monotonous fast.",
      fix: "Lead with the subject matter on some of them: 'Reading X changed…' rather than 'I read X, which changed…'.",
    });
  }

  const intensifiers = countMatches(whole, INTENSIFIERS);
  const totalWords = wordsOf(whole).length;
  if (totalWords > 100 && intensifiers / totalWords > 0.015) {
    findings.push({
      id: "intensifiers",
      severity: "note",
      question: null,
      title: `${intensifiers} intensifiers ("very", "really", "incredibly")`,
      message:
        "They add characters without adding meaning, and you are paying for every character.",
      fix: "Delete them. If a sentence weakens without 'very', the underlying word is the problem.",
    });
  }

  if (evidence > 0 && !/\b(?:i read|i have read|reading|book|journal|article|paper|lecture)\b/i.test(whole)) {
    findings.push({
      id: "no-reading",
      severity: "note",
      question: null,
      title: "Nothing read is mentioned",
      message:
        "For most academic courses, evidence of independent reading is the clearest signal of genuine subject interest.",
      fix: "Name one thing you read beyond the syllabus and what you made of it — disagreeing with it is fine, and often better.",
    });
  }

  /* ── Readiness ───────────────────────────────────────────── */

  const counts = findings.reduce(
    (acc, f) => {
      acc[f.severity] += 1;
      return acc;
    },
    { fail: 0, warn: 0, note: 0 } as Record<Severity, number>,
  );

  const readiness =
    counts.fail > 0 ? "not-ready" : counts.warn > 1 ? "needs-work" : "close";

  const order: Record<Severity, number> = { fail: 0, warn: 1, note: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    findings,
    stats,
    totalChars,
    withinTotal: TOTAL_LIMIT - totalChars,
    readiness,
    counts,
  };
}

export const READINESS_LABEL: Record<ReviewResult["readiness"], string> = {
  empty: "Nothing to check yet",
  "not-ready": "Not submittable yet",
  "needs-work": "Submittable, but leaving marks on the table",
  close: "In good shape — get a human to read it",
};
