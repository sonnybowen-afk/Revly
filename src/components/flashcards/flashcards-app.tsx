"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Target, TrendingUp, Trash2 } from "lucide-react";
import { DeckList } from "./deck-list";
import { ReviewSession } from "./review-session";
import { ForecastChart } from "./forecast-chart";
import type { ProgressMap } from "./types";
import { Button } from "@/components/ui/button";
import { DECKS, getDeck } from "@/lib/decks";
import {
  countDue,
  createCardState,
  forecast,
  retentionRate,
  type CardState,
} from "@/lib/srs";
import { clearStore, usePersistentState } from "@/lib/storage";

export function FlashcardsApp() {
  const [progress, setProgress, hydrated] = usePersistentState<ProgressMap>(
    "flashcards",
    {},
  );
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  // Resolved after mount so server and client markup agree on first paint.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);

  const allStates: CardState[] = useMemo(
    () =>
      DECKS.flatMap((d) =>
        d.cards.map((c) => progress[c.id] ?? createCardState(0)),
      ),
    [progress],
  );

  const counts = useMemo(
    () => (now === null ? null : countDue(allStates, now)),
    [allStates, now],
  );
  const retention = useMemo(() => retentionRate(allStates), [allStates]);
  const forecastData = useMemo(
    () => (now === null ? [] : forecast(allStates, 30, now)),
    [allStates, now],
  );
  const learned = allStates.filter((s) => s.phase === "review").length;

  function handleGrade(cardId: string, state: CardState) {
    setProgress((prev) => ({ ...prev, [cardId]: state }));
  }

  function resetAll() {
    setProgress({});
    clearStore("flashcards");
    setConfirmingReset(false);
    setNow(Date.now());
  }

  const activeDeck = activeDeckId ? getDeck(activeDeckId) : undefined;

  if (!hydrated || now === null) {
    return <LoadingSkeleton />;
  }

  if (activeDeck) {
    return (
      <ReviewSession
        deck={activeDeck}
        progress={progress}
        onGrade={handleGrade}
        onExit={() => {
          setActiveDeckId(null);
          setNow(Date.now());
        }}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          Icon={Target}
          label="Due today"
          value={String(counts?.total ?? 0)}
          tone="text-primary"
        />
        <StatTile
          Icon={TrendingUp}
          label="Retention"
          value={retention === null ? "—" : `${retention}%`}
          tone="text-success"
          hint={retention === null ? "Study a deck to measure" : undefined}
        />
        <StatTile
          Icon={Flame}
          label="Cards in review"
          value={String(learned)}
          tone="text-warning"
        />
      </div>

      <ForecastChart data={forecastData} now={now} />

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Your decks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a deck to start. Cards you find hard come back sooner.
            </p>
          </div>

          {confirmingReset ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Erase all progress?
              </span>
              <Button variant="danger" size="sm" onClick={resetAll}>
                Yes, reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingReset(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingReset(true)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Reset progress
            </Button>
          )}
        </div>

        <div className="mt-6">
          <DeckList
            progress={progress}
            now={now}
            onStart={(id) => setActiveDeckId(id)}
          />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  Icon,
  label,
  value,
  tone,
  hint,
}: {
  Icon: typeof Target;
  label: string;
  value: string;
  tone: string;
  hint?: string;
}) {
  return (
    <div className="card-surface flex items-center gap-4 p-5">
      <span className={`grid size-10 shrink-0 place-items-center rounded-[4px] border border-border text-primary ${tone}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="tabular text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Reserves the same space the real content takes, so nothing shifts on load. */
function LoadingSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your progress</span>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-surface h-[5.75rem] animate-pulse" />
        ))}
      </div>
      <div className="card-surface h-72 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-surface h-80 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
