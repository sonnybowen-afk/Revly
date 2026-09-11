"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  FileUp,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/page";
import { usePersistentState } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Level } from "@/lib/decks";
import {
  FORMAT_LABELS,
  dedupe,
  parseImport,
  type ParseResult,
} from "@/lib/cards-io";
import { RULE_LABELS, generateCards, type GenerateResult } from "@/lib/notes-to-cards";
import {
  LEVELS,
  buildDeck,
  sanitiseUserDecks,
  type DraftCard,
  type UserDeck,
} from "@/lib/user-decks";

type Mode = "write" | "notes" | "import";

const MODES: { id: Mode; label: string; blurb: string }[] = [
  { id: "write", label: "Write your own", blurb: "Type cards one at a time." },
  {
    id: "notes",
    label: "From your notes",
    blurb: "Paste notes and pull cards out of them automatically.",
  },
  {
    id: "import",
    label: "Import",
    blurb: "Bring a deck over from Anki, Quizlet or ChatGPT.",
  },
];

const EMPTY_ROW: DraftCard = { front: "", back: "" };

export function DeckBuilder() {
  const router = useRouter();
  const [userDecks, setUserDecks] = usePersistentState<UserDeck[]>(
    "userDecks",
    [],
  );

  const [mode, setMode] = useState<Mode>("write");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState<Level>("GCSE");
  const [exam, setExam] = useState("");
  const [cards, setCards] = useState<DraftCard[]>([
    { ...EMPTY_ROW },
    { ...EMPTY_ROW },
  ]);
  const [error, setError] = useState<string | null>(null);

  const filled = cards.filter((c) => c.front.trim() && c.back.trim());

  function setCard(i: number, patch: Partial<DraftCard>) {
    setCards((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  function addRow() {
    setCards((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function removeRow(i: number) {
    setCards((prev) => prev.filter((_, j) => j !== i));
  }

  /** Both generators append rather than overwrite work already in the table. */
  function appendCards(incoming: DraftCard[]) {
    setCards((prev) => {
      const kept = prev.filter((c) => c.front.trim() || c.back.trim());
      return [...kept, ...incoming];
    });
  }

  function save() {
    if (filled.length === 0) {
      setError("Add at least one card with both a question and an answer.");
      return;
    }
    if (!title.trim()) {
      setError("Give the deck a title so you can find it later.");
      return;
    }
    const deck = buildDeck({
      title,
      subject,
      level,
      exam,
      description: "",
      origin: mode === "write" ? "written" : mode === "notes" ? "generated" : "imported",
      cards: filled,
    });
    setUserDecks((prev) => [...sanitiseUserDecks(prev), deck]);
    router.push("/revision/flashcards");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start lg:gap-14">
      {/* ── Deck details ────────────────────────────────────────── */}
      <div className="space-y-6">
        <section>
          <h2 className="font-display text-xl">Deck details</h2>
          <div className="mt-5 space-y-4">
            <Field id="title" label="Title" required>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cell Biology"
                className={inputClass}
              />
            </Field>
            <Field id="subject" label="Subject">
              <input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Biology"
                className={inputClass}
              />
            </Field>
            <Field id="level" label="Level">
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
                className={inputClass}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="exam" label="Exam board / paper">
              <input
                id="exam"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                placeholder="e.g. AQA Paper 1"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            <span className="tabular font-semibold text-foreground">
              {filled.length}
            </span>{" "}
            {filled.length === 1 ? "card" : "cards"} ready to save.
          </p>
          {error ? (
            <p
              role="alert"
              className="mt-3 flex items-start gap-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}
          <Button onClick={save} size="lg" className="mt-4 w-full">
            Save deck
          </Button>
        </div>
      </div>

      {/* ── Source + card table ─────────────────────────────────── */}
      <div>
        <div
          role="tablist"
          aria-label="How to add cards"
          className="grid gap-px overflow-hidden rounded-[6px] border border-border bg-border sm:grid-cols-3"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "cursor-pointer px-4 py-4 text-left transition-colors duration-150",
                mode === m.id
                  ? "bg-primary text-on-primary"
                  : "bg-card hover:bg-muted",
              )}
            >
              <span className="block text-sm font-semibold">{m.label}</span>
              <span
                className={cn(
                  "mt-1 block text-xs leading-snug",
                  mode === m.id ? "opacity-80" : "text-muted-foreground",
                )}
              >
                {m.blurb}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {mode === "notes" ? <NotesPanel onCards={appendCards} /> : null}
          {mode === "import" ? <ImportPanel onCards={appendCards} /> : null}
        </div>

        <CardTable
          cards={cards}
          onChange={setCard}
          onRemove={removeRow}
          onAdd={addRow}
        />
      </div>
    </div>
  );
}

/* ── From notes ────────────────────────────────────────────────── */

const SAMPLE = `# Cell Transport

Diffusion: net movement of particles from high to low concentration
Osmosis is the diffusion of water through a partially permeable membrane.

Features of active transport:
- Requires energy from respiration
- Moves substances against the gradient
- Uses carrier proteins`;

function NotesPanel({ onCards }: { onCards: (c: DraftCard[]) => void }) {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);

  function run() {
    setResult(generateCards(notes));
  }

  return (
    <section className="card-surface p-6">
      <h2 className="flex items-center gap-2 font-display text-xl">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        Turn notes into cards
      </h2>

      <div className="mt-4">
        <Callout title="How this works — and what it is not">
          <p>
            This reads the <strong>structure</strong> of your notes —
            definitions, headings with bullets, and any Q/A you have already
            written — and pulls cards out of them. It runs instantly, costs
            nothing, and your notes never leave this browser.
          </p>
          <p>
            It is not a language model. Revly is a static site with no server,
            and calling one from the browser would mean publishing an API key
            in the page source. So it will not paraphrase or invent questions
            your notes do not already imply — <strong>treat what comes out
            as a first draft and edit it below.</strong>
          </p>
        </Callout>
      </div>

      <label htmlFor="notes" className="mt-6 block text-sm font-semibold">
        Paste your notes
      </label>
      <p className="mt-1 text-xs text-muted-foreground">
        Works best with <code>Term: definition</code> lines, headings followed
        by bullets, and <code>Q:</code> / <code>A:</code> pairs.
      </p>
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={12}
        placeholder={SAMPLE}
        className={cn(inputClass, "mt-3 min-h-56 resize-y py-3 font-mono text-sm")}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={!notes.trim()}>
          <Wand2 className="size-4" aria-hidden="true" />
          Extract cards
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setNotes(SAMPLE)}
          type="button"
        >
          Use the example
        </Button>
      </div>

      {result ? (
        <div className="mt-6 border-t border-border pt-5" role="status">
          {result.cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No structure found to work with. Try adding{" "}
              <code>Term: definition</code> lines or a heading with bullets
              under it.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">
                  {result.cards.length} draft{" "}
                  {result.cards.length === 1 ? "card" : "cards"}
                </span>
                {(Object.keys(result.byRule) as (keyof typeof RULE_LABELS)[])
                  .filter((k) => result.byRule[k] > 0)
                  .map((k) => (
                    <Badge key={k} tone="neutral">
                      {result.byRule[k]} {RULE_LABELS[k]}
                    </Badge>
                  ))}
              </div>
              <ul className="mt-4 max-h-60 space-y-2 overflow-auto text-sm">
                {result.cards.slice(0, 8).map((c, i) => (
                  <li key={i} className="border-l-2 border-border pl-3">
                    <span className="font-medium">{c.front}</span>
                    <span className="block text-muted-foreground">{c.back}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5"
                onClick={() => {
                  onCards(
                    result.cards.map((c) => ({ front: c.front, back: c.back })),
                  );
                  setResult(null);
                }}
              >
                Add {result.cards.length} to the deck
              </Button>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

/* ── Import ────────────────────────────────────────────────────── */

const SEPARATORS = [
  { label: "Detect automatically", field: "", record: "" },
  { label: "Tab (Anki, Quizlet default)", field: "\t", record: "" },
  { label: "Comma", field: ",", record: "" },
  { label: "Dash  ( - )", field: " - ", record: "" },
  { label: "Quizlet: dash + blank line", field: " - ", record: "\n\n" },
  { label: "Semicolon", field: ";", record: "" },
];

function ImportPanel({ onCards }: { onCards: (c: DraftCard[]) => void }) {
  const [text, setText] = useState("");
  const [sepIndex, setSepIndex] = useState(0);
  const [result, setResult] = useState<ParseResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function run(raw = text, index = sepIndex) {
    const sep = SEPARATORS[index];
    const parsed = parseImport(raw, {
      ...(sep.field ? { fieldSeparator: sep.field } : {}),
      ...(sep.record ? { recordSeparator: sep.record } : {}),
    });
    setResult({ ...parsed, cards: dedupe(parsed.cards) });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setText(content);
    run(content);
  }

  return (
    <section className="card-surface p-6">
      <h2 className="flex items-center gap-2 font-display text-xl">
        <FileUp className="size-4 text-primary" aria-hidden="true" />
        Import a deck
      </h2>

      <dl className="mt-5 grid gap-4 border-y border-border py-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-semibold">Anki</dt>
          <dd className="mt-1 text-muted-foreground">
            In Anki: <em>File → Export → Notes in Plain Text (.txt)</em>. Tags
            and HTML are handled.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Quizlet</dt>
          <dd className="mt-1 text-muted-foreground">
            On the set: <em>⋯ → Export</em>. Copy the box, or match your
            separators below.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">ChatGPT</dt>
          <dd className="mt-1 text-muted-foreground">
            Paste the reply as-is. Markdown tables and <code>Q:</code>/
            <code>A:</code> lists both work.
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div className="min-w-52 flex-1">
          <label htmlFor="sep" className="block text-sm font-semibold">
            Separator
          </label>
          <select
            id="sep"
            value={sepIndex}
            onChange={(e) => {
              const i = Number(e.target.value);
              setSepIndex(i);
              if (text.trim()) run(text, i);
            }}
            className={cn(inputClass, "mt-1.5")}
          >
            {SEPARATORS.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.csv,.tsv,.md,text/plain"
            onChange={onFile}
            className="sr-only"
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <FileUp className="size-4" aria-hidden="true" />
            Choose a file
          </Button>
        </div>
      </div>

      <label htmlFor="import" className="mt-5 block text-sm font-semibold">
        Or paste it here
      </label>
      <textarea
        id="import"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder={"mitochondria\tsite of aerobic respiration\nribosome\tsite of protein synthesis"}
        className={cn(inputClass, "mt-2 min-h-48 resize-y py-3 font-mono text-sm")}
      />

      <Button className="mt-4" onClick={() => run()} disabled={!text.trim()}>
        Read cards
      </Button>

      {result ? (
        <div className="mt-6 border-t border-border pt-5" role="status">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={result.cards.length ? "success" : "danger"}>
              {FORMAT_LABELS[result.format]}
            </Badge>
            <span className="text-sm font-semibold">
              {result.cards.length} card{result.cards.length === 1 ? "" : "s"}
            </span>
            {result.skipped > 0 ? (
              <span className="text-sm text-muted-foreground">
                · {result.skipped} row{result.skipped === 1 ? "" : "s"} skipped
              </span>
            ) : null}
          </div>

          {result.notes.map((n) => (
            <p key={n} className="mt-2 text-sm text-muted-foreground">
              {n}
            </p>
          ))}

          {result.cards.length > 0 ? (
            <>
              <ul className="mt-4 max-h-60 space-y-2 overflow-auto text-sm">
                {result.cards.slice(0, 8).map((c, i) => (
                  <li key={i} className="border-l-2 border-border pl-3">
                    <span className="font-medium">{c.front}</span>
                    <span className="block text-muted-foreground">{c.back}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5"
                onClick={() => {
                  onCards(
                    result.cards.map((c) => ({ front: c.front, back: c.back })),
                  );
                  setResult(null);
                  setText("");
                }}
              >
                Add {result.cards.length} to the deck
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      <p className="mt-5 text-xs text-muted-foreground">
        Anki <code>.apkg</code> files are zipped databases and cannot be read
        in the browser — use Anki&apos;s plain-text export instead.
      </p>
    </section>
  );
}

/* ── Shared card table ─────────────────────────────────────────── */

function CardTable({
  cards,
  onChange,
  onRemove,
  onAdd,
}: {
  cards: DraftCard[];
  onChange: (i: number, patch: Partial<DraftCard>) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-display text-xl">Cards</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything lands here first. Edit before you save.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add card
        </Button>
      </div>

      <ul className="divide-y divide-border">
        {cards.map((card, i) => (
          <li key={i} className="grid gap-3 py-5 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label
                htmlFor={`front-${i}`}
                className="block text-xs font-semibold text-muted-foreground"
              >
                Question {i + 1}
              </label>
              <textarea
                id={`front-${i}`}
                value={card.front}
                onChange={(e) => onChange(i, { front: e.target.value })}
                rows={2}
                className={cn(inputClass, "mt-1.5 resize-y py-2")}
              />
            </div>
            <div>
              <label
                htmlFor={`back-${i}`}
                className="block text-xs font-semibold text-muted-foreground"
              >
                Answer {i + 1}
              </label>
              <textarea
                id={`back-${i}`}
                value={card.back}
                onChange={(e) => onChange(i, { back: e.target.value })}
                rows={2}
                className={cn(inputClass, "mt-1.5 resize-y py-2")}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove card ${i + 1}`}
              className="mt-6 grid size-11 cursor-pointer place-items-center self-start rounded-md text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {cards.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No cards yet. Add one, or use one of the sources above.
        </p>
      ) : null}
    </section>
  );
}

const inputClass =
  "min-h-11 w-full rounded-md border border-border bg-background px-3 text-base";

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
