/**
 * Flashcard import.
 *
 * Accepts what people actually have rather than demanding one format:
 * Anki text exports, Quizlet exports with their custom separators,
 * ChatGPT output (markdown tables or Q:/A: prose), and plain CSV/TSV.
 *
 * Everything here is pure — text in, cards out — so the detection rules
 * are testable without a browser.
 */

export type ImportFormat =
  | "markdown-table"
  | "qa-block"
  | "anki-tsv"
  | "tsv"
  | "csv"
  | "custom"
  | "paragraph-pairs"
  | "unknown";

export interface ParsedCard {
  front: string;
  back: string;
  tags?: string[];
}

export interface ParseResult {
  format: ImportFormat;
  cards: ParsedCard[];
  /** Rows that looked like data but could not be split into two sides. */
  skipped: number;
  notes: string[];
}

export interface ParseOptions {
  /** Overrides detection. Quizlet users usually need this. */
  fieldSeparator?: string;
  /** Separator *between cards*, for Quizlet's "\n\n" style exports. */
  recordSeparator?: string;
}

const QA_FRONT = /^\s*(?:\*\*)?(?:Q|Question|Front|Term)\s*(?:\*\*)?\s*[:.\-—]\s*/i;
const QA_BACK = /^\s*(?:\*\*)?(?:A|Answer|Back|Definition)\s*(?:\*\*)?\s*[:.\-—]\s*/i;

/** Anki text exports lead with `#separator:tab`-style directives. */
const ANKI_DIRECTIVE = /^#\s*(separator|html|tags column|columns|deck|notetype)\s*:/i;

/** Strip the HTML Anki wraps fields in, without pulling in a parser. */
export function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:div|p|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Remove the markdown emphasis ChatGPT sprinkles through answers. */
function stripMarkdown(input: string): string {
  return input
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|\s)\*(\S.*?\S|\S)\*(?=\s|$)/g, "$1$2")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

function clean(value: string): string {
  return stripMarkdown(stripHtml(value)).replace(/\s+\n/g, "\n").trim();
}

/** RFC-4180-ish splitter: handles quoted fields and escaped quotes. */
export function splitDelimited(line: string, sep: string): string[] {
  const out: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"' && field.trim() === "") {
      quoted = true;
      continue;
    }
    if (line.startsWith(sep, i)) {
      out.push(field);
      field = "";
      i += sep.length - 1;
      continue;
    }
    field += ch;
  }
  out.push(field);
  return out;
}

function isMarkdownTable(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return false;
  const piped = lines.filter((l) => l.includes("|")).length;
  const hasRule = lines.some((l) => /^\s*\|?[\s:|-]*-{2,}[\s:|-]*\|/.test(l));
  return hasRule && piped >= 2;
}

function parseMarkdownTable(text: string): ParseResult {
  const rows = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes("|"))
    .filter((l) => !/^\|?[\s:|-]*-{2,}[\s:|-]*\|?$/.test(l));

  const cards: ParsedCard[] = [];
  let skipped = 0;
  let sawHeader = false;

  for (const row of rows) {
    const cells = row
      .replace(/^\s*\|/, "")
      .replace(/\|\s*$/, "")
      .split("|")
      .map((c) => clean(c));

    if (cells.length < 2 || !cells[0] || !cells[1]) {
      skipped += 1;
      continue;
    }
    // Drop a header row like | Question | Answer |
    if (
      !sawHeader &&
      /^(question|front|term|prompt)$/i.test(cells[0]) &&
      /^(answer|back|definition|response)$/i.test(cells[1])
    ) {
      sawHeader = true;
      continue;
    }
    cards.push({ front: cells[0], back: cells[1] });
  }

  return {
    format: "markdown-table",
    cards,
    skipped,
    notes: ["Read as a markdown table — the format ChatGPT usually returns."],
  };
}

function parseQaBlocks(text: string): ParseResult {
  const lines = text.split("\n");
  const cards: ParsedCard[] = [];
  let front: string | null = null;
  let back: string[] = [];

  const flush = () => {
    if (front && back.length) {
      const body = clean(back.join("\n"));
      if (body) cards.push({ front: clean(front), back: body });
    }
    front = null;
    back = [];
  };

  for (const raw of lines) {
    if (QA_FRONT.test(raw)) {
      flush();
      front = raw.replace(QA_FRONT, "");
      continue;
    }
    if (QA_BACK.test(raw)) {
      back = [raw.replace(QA_BACK, "")];
      continue;
    }
    if (front && back.length) back.push(raw);
    else if (front && raw.trim()) front += ` ${raw.trim()}`;
  }
  flush();

  return {
    format: "qa-block",
    cards,
    skipped: 0,
    notes: ["Read as question/answer blocks."],
  };
}

function parseDelimited(
  text: string,
  sep: string,
  format: ImportFormat,
  recordSeparator?: string,
): ParseResult {
  const notes: string[] = [];
  let body = text;
  let tagsColumn: number | null = null;

  // Anki exports lead with directive lines; honour them, then drop them.
  const directives = body
    .split("\n")
    .filter((l) => ANKI_DIRECTIVE.test(l.trim()));
  if (directives.length) {
    notes.push("Anki export directives detected and applied.");
    for (const d of directives) {
      const tagMatch = d.match(/tags column\s*:\s*(\d+)/i);
      if (tagMatch) tagsColumn = Number(tagMatch[1]) - 1;
    }
    body = body
      .split("\n")
      .filter((l) => !l.trim().startsWith("#"))
      .join("\n");
  }

  const records = recordSeparator
    ? body.split(recordSeparator)
    : body.split("\n");

  const cards: ParsedCard[] = [];
  let skipped = 0;

  for (const record of records) {
    if (!record.trim()) continue;
    const cells = splitDelimited(record.replace(/\r$/, ""), sep).map((c) =>
      clean(c),
    );
    if (cells.length < 2 || !cells[0] || !cells[1]) {
      skipped += 1;
      continue;
    }
    const card: ParsedCard = { front: cells[0], back: cells[1] };
    if (tagsColumn !== null && cells[tagsColumn]) {
      const tags = cells[tagsColumn].split(/\s+/).filter(Boolean);
      if (tags.length) card.tags = tags;
    }
    cards.push(card);
  }

  return { format, cards, skipped, notes };
}

/** Blank-line separated blocks where line 1 is the front, the rest the back. */
function parseParagraphPairs(text: string): ParseResult {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  const cards: ParsedCard[] = [];
  let skipped = 0;

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      skipped += 1;
      continue;
    }
    cards.push({
      front: clean(lines[0]),
      back: clean(lines.slice(1).join("\n")),
    });
  }

  return {
    format: "paragraph-pairs",
    cards,
    skipped,
    notes: ["Read as blocks: first line the question, the rest the answer."],
  };
}

/** Share of non-empty lines that contain the separator. */
function separatorCoverage(text: string, sep: string): number {
  const lines = text.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  if (!lines.length) return 0;
  return lines.filter((l) => l.includes(sep)).length / lines.length;
}

export function parseImport(
  text: string,
  options: ParseOptions = {},
): ParseResult {
  const input = text.replace(/\r\n/g, "\n").trim();
  if (!input) {
    return { format: "unknown", cards: [], skipped: 0, notes: [] };
  }

  if (options.fieldSeparator) {
    return parseDelimited(
      input,
      options.fieldSeparator,
      "custom",
      options.recordSeparator,
    );
  }

  if (isMarkdownTable(input)) return parseMarkdownTable(input);

  if (QA_FRONT.test(input) || /\n\s*(?:\*\*)?(?:A|Answer)\s*(?:\*\*)?\s*[:.]/i.test(input)) {
    const result = parseQaBlocks(input);
    if (result.cards.length) return result;
  }

  const isAnki = input.split("\n").some((l) => ANKI_DIRECTIVE.test(l.trim()));
  if (separatorCoverage(input, "\t") >= 0.6) {
    return parseDelimited(input, "\t", isAnki ? "anki-tsv" : "tsv");
  }

  // Only treat commas as a delimiter when they look structural, not prose.
  if (separatorCoverage(input, ",") >= 0.8) {
    const result = parseDelimited(input, ",", "csv");
    if (result.cards.length) return result;
  }

  if (/\n\s*\n/.test(input)) {
    const result = parseParagraphPairs(input);
    if (result.cards.length) return result;
  }

  return {
    format: "unknown",
    cards: [],
    skipped: input.split("\n").filter((l) => l.trim()).length,
    notes: [
      "Could not work out the format. Set a separator below, or paste two columns separated by a tab.",
    ],
  };
}

/** Drop exact duplicates and blank sides; keeps the first of each front. */
export function dedupe(cards: ParsedCard[]): ParsedCard[] {
  const seen = new Set<string>();
  const out: ParsedCard[] = [];
  for (const card of cards) {
    if (!card.front.trim() || !card.back.trim()) continue;
    const key = card.front.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(card);
  }
  return out;
}

export const FORMAT_LABELS: Record<ImportFormat, string> = {
  "markdown-table": "Markdown table",
  "qa-block": "Question / answer blocks",
  "anki-tsv": "Anki text export",
  tsv: "Tab-separated",
  csv: "Comma-separated",
  custom: "Custom separator",
  "paragraph-pairs": "Paragraph pairs",
  unknown: "Not recognised",
};
