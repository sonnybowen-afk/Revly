"use client";

import { Layers, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DECKS } from "@/lib/decks";
import { countDue, createCardState, type CardState } from "@/lib/srs";
import { cn, plural } from "@/lib/utils";
import type { ProgressMap } from "./types";

const ACCENT_TONE = {
  brand: "brand",
  study: "study",
  success: "success",
  warning: "warning",
} as const;

export function DeckList({
  progress,
  now,
  onStart,
}: {
  progress: ProgressMap;
  now: number;
  onStart: (deckId: string) => void;
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {DECKS.map((deck) => {
        const states: CardState[] = deck.cards.map(
          (c) => progress[c.id] ?? createCardState(0),
        );
        const counts = countDue(states, now);
        const studied = states.filter((s) => s.reps > 0).length;
        const pct = Math.round((studied / deck.cards.length) * 100);

        return (
          <li key={deck.id} className="card-surface flex flex-col p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Badge tone={ACCENT_TONE[deck.accent]}>{deck.subject}</Badge>
              <Badge tone="neutral">{deck.level}</Badge>
            </div>

            <h3 className="mt-4 text-lg font-bold">{deck.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {deck.exam}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {deck.description}
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">
                  {studied} of {deck.cards.length} seen
                </span>
                <span className="tabular text-muted-foreground">{pct}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${deck.title} progress`}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <DueChip label="new" value={counts.new} tone="text-primary" />
              <DueChip
                label="learning"
                value={counts.learning}
                tone="text-warning"
              />
              <DueChip
                label="review"
                value={counts.review}
                tone="text-success"
              />
            </div>

            <Button
              onClick={() => onStart(deck.id)}
              className="mt-6 w-full"
              variant={counts.total > 0 ? "primary" : "secondary"}
            >
              {counts.total > 0 ? (
                <>
                  <Play className="size-4" aria-hidden="true" />
                  Study {counts.total} {plural(counts.total, "card")}
                </>
              ) : (
                <>
                  <Layers className="size-4" aria-hidden="true" />
                  Nothing due — browse deck
                </>
              )}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function DueChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1",
        value === 0 && "opacity-50",
      )}
    >
      <span className={cn("tabular", tone)}>{value}</span>
      <span className="text-muted-foreground font-medium">{label}</span>
    </span>
  );
}
