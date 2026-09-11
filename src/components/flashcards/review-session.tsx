"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Eye, Lightbulb, PartyPopper, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import type { Deck, SeedCard } from "@/lib/decks";
import {
  buildQueue,
  createCardState,
  previewIntervals,
  reviewCard,
  type CardState,
  type Grade,
} from "@/lib/srs";
import { cn, plural } from "@/lib/utils";
import type { ProgressMap, SessionTally } from "./types";

/**
 * Cards still in a learning step come back within the same sitting if they
 * are due soon — the same "learn ahead" window Anki uses by default.
 */
const LEARN_AHEAD_MS = 20 * 60 * 1000;

const GRADES: { grade: Grade; label: string; key: string; className: string }[] =
  [
    {
      grade: "again",
      label: "Again",
      key: "1",
      className:
        "border-destructive/40 text-destructive hover:bg-destructive-soft",
    },
    {
      grade: "hard",
      label: "Hard",
      key: "2",
      className: "border-accent/45 text-accent hover:bg-accent-soft",
    },
    {
      grade: "good",
      label: "Good",
      key: "3",
      className: "border-primary/45 text-primary hover:bg-primary-soft",
    },
    {
      grade: "easy",
      label: "Easy",
      key: "4",
      className: "border-success/45 text-success hover:bg-success-soft",
    },
  ];

export function ReviewSession({
  deck,
  progress,
  onGrade,
  onExit,
}: {
  deck: Deck;
  progress: ProgressMap;
  onGrade: (cardId: string, state: CardState) => void;
  onExit: () => void;
}) {
  const [queue, setQueue] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState<SessionTally>({
    reviewed: 0,
    again: 0,
    startedAt: Date.now(),
  });
  const [startSize, setStartSize] = useState(0);
  const [studyingAhead, setStudyingAhead] = useState(false);

  const goodButtonRef = useRef<HTMLButtonElement>(null);
  const revealButtonRef = useRef<HTMLButtonElement>(null);

  const stateFor = useCallback(
    (cardId: string): CardState => progress[cardId] ?? createCardState(0),
    [progress],
  );

  // Build the queue once, on entry. Grading mutates it in place from there.
  useEffect(() => {
    const now = Date.now();
    const withState = deck.cards.map((c) => ({
      id: c.id,
      state: progress[c.id] ?? createCardState(0),
    }));
    const due = buildQueue(withState, { now, newLimit: 20 });

    if (due.length > 0) {
      setQueue(due.map((c) => c.id));
      setStartSize(due.length);
      setStudyingAhead(false);
    } else {
      // Nothing scheduled — let them work ahead rather than hitting a wall.
      setQueue(deck.cards.map((c) => c.id));
      setStartSize(deck.cards.length);
      setStudyingAhead(true);
    }
    // Intentionally keyed on the deck only: re-running on every progress
    // change would rebuild the queue mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.id]);

  const currentId = queue[0];
  const card: SeedCard | undefined = useMemo(
    () => deck.cards.find((c) => c.id === currentId),
    [deck.cards, currentId],
  );
  const cardState = currentId ? stateFor(currentId) : null;

  const previews = useMemo(
    () => (cardState ? previewIntervals(cardState) : null),
    [cardState],
  );

  const grade = useCallback(
    (g: Grade) => {
      if (!currentId || !cardState) return;
      const now = Date.now();
      const next = reviewCard(cardState, g, { now });
      onGrade(currentId, next);

      setTally((t) => ({
        ...t,
        reviewed: t.reviewed + 1,
        again: t.again + (g === "again" ? 1 : 0),
      }));

      const rest = queue.slice(1);
      const stillLearning =
        next.phase === "learning" || next.phase === "relearning";
      const dueSoon = next.due - now <= LEARN_AHEAD_MS;

      setQueue(stillLearning && dueSoon ? [...rest, currentId] : rest);
      setRevealed(false);
    },
    [cardState, currentId, onGrade, queue],
  );

  // Keyboard: space/enter reveals, 1–4 grade. Ignored while typing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!currentId) return;

      if (!revealed && (e.code === "Space" || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed) {
        const match = GRADES.find((g) => g.key === e.key);
        if (match) {
          e.preventDefault();
          grade(match.grade);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentId, revealed, grade]);

  // Move focus to the default action as the card changes state, so keyboard
  // users never have to hunt for where they are.
  useEffect(() => {
    if (revealed) goodButtonRef.current?.focus();
    else revealButtonRef.current?.focus();
  }, [revealed, currentId]);

  if (!currentId || !card || !cardState) {
    return (
      <SessionComplete deck={deck} tally={tally} onExit={onExit} />
    );
  }

  const done = Math.max(0, startSize - queue.length);
  const pct = startSize > 0 ? Math.round((done / startSize) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── Session bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          All decks
        </button>

        <div className="flex items-center gap-2">
          {studyingAhead ? <Badge tone="warning">Studying ahead</Badge> : null}
          <Badge tone="neutral">
            <span className="tabular">{queue.length}</span> left
          </Badge>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Session progress"
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── Card ────────────────────────────────────────────────── */}
      <article
        key={currentId + String(revealed)}
        className="card-surface animate-card-flip mt-6 p-6 md:p-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone="neutral">{deck.title}</Badge>
          <PhaseBadge state={cardState} />
        </div>

        <h2 className="mt-7 font-display text-2xl leading-snug md:text-[1.875rem] [overflow-wrap:anywhere]">
          {card.front}
        </h2>

        {/*
          The answer is conditionally rendered, never hidden with CSS — the
          whole point of active recall is that it is genuinely not available
          until the learner commits.
        */}
        {revealed ? (
          <div className="mt-7 border-t border-border pt-7">
            <p className="text-base leading-relaxed md:text-lg [overflow-wrap:anywhere]">
              {card.back}
            </p>

            {card.hint ? (
              <div className="mt-6 flex gap-3 border-l-2 border-accent py-1 pl-4">
                <Lightbulb
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Exam technique.{" "}
                  </span>
                  {card.hint}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-7 text-sm text-muted-foreground">
            Answer it out loud or on paper first, then reveal.
          </p>
        )}
      </article>

      {/* Announce the state change without moving the viewport. */}
      <p aria-live="polite" className="sr-only">
        {revealed
          ? `Answer shown. ${queue.length} cards left in this session.`
          : `New card. ${queue.length} cards left in this session.`}
      </p>

      {/* ── Controls ────────────────────────────────────────────── */}
      <div className="mt-6">
        {revealed ? (
          <>
            <p className="mb-3 text-center text-sm text-muted-foreground">
              How well did you recall it?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {GRADES.map((g) => (
                <button
                  key={g.grade}
                  ref={g.grade === "good" ? goodButtonRef : undefined}
                  type="button"
                  onClick={() => grade(g.grade)}
                  className={cn(
                    "flex min-h-16 cursor-pointer flex-col items-center justify-center gap-0.5",
                    "rounded-[4px] border bg-card font-semibold",
                    "transition-[background-color,transform] duration-150 active:scale-[0.98]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    g.className,
                  )}
                >
                  <span className="text-sm">{g.label}</span>
                  <span className="tabular text-xs opacity-80">
                    {previews?.[g.grade]}
                  </span>
                  <kbd className="mt-0.5 hidden text-[10px] font-normal opacity-60 sm:block">
                    {g.key}
                  </kbd>
                </button>
              ))}
            </div>
          </>
        ) : (
          <Button
            ref={revealButtonRef}
            onClick={() => setRevealed(true)}
            size="lg"
            className="w-full"
          >
            <Eye className="size-4" aria-hidden="true" />
            Show answer
            <kbd className="ml-1 hidden text-xs font-normal opacity-70 sm:inline">
              space
            </kbd>
          </Button>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Reviewed <span className="tabular">{tally.reviewed}</span> this session
        {tally.again > 0 ? (
          <>
            {" · "}
            <span className="tabular">{tally.again}</span> to revisit
          </>
        ) : null}
      </p>
    </div>
  );
}

function PhaseBadge({ state }: { state: CardState }) {
  if (state.phase === "new") return <Badge tone="brand">New</Badge>;
  if (state.phase === "learning") return <Badge tone="warning">Learning</Badge>;
  if (state.phase === "relearning")
    return <Badge tone="danger">Relearning</Badge>;
  return (
    <Badge tone="success">
      Review · <span className="tabular">{state.interval}d</span>
    </Badge>
  );
}

function SessionComplete({
  deck,
  tally,
  onExit,
}: {
  deck: Deck;
  tally: SessionTally;
  onExit: () => void;
}) {
  const minutes = Math.max(1, Math.round((Date.now() - tally.startedAt) / 60000));
  const accuracy =
    tally.reviewed > 0
      ? Math.round(((tally.reviewed - tally.again) / tally.reviewed) * 100)
      : null;

  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-[4px] border border-primary/30 text-primary">
        <PartyPopper className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-6 text-2xl font-bold md:text-3xl">
        {tally.reviewed > 0 ? "Session complete" : "Nothing due right now"}
      </h2>
      <p className="mt-3 text-muted-foreground">
        {tally.reviewed > 0
          ? `You cleared ${deck.title}. The scheduler has already worked out when each card comes back.`
          : `${deck.title} is fully up to date. Come back when cards fall due.`}
      </p>

      {tally.reviewed > 0 ? (
        <dl className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="reviewed" value={String(tally.reviewed)} />
          <Stat
            label="first-try"
            value={accuracy === null ? "—" : `${accuracy}%`}
          />
          <Stat label={plural(minutes, "minute")} value={String(minutes)} />
        </dl>
      ) : null}

      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={onExit} className={buttonStyles("primary", "lg")}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Back to decks
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface px-3 py-5">
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="tabular block text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </dd>
    </div>
  );
}
