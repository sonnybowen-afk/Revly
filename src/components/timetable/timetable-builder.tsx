"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePersistentState } from "@/lib/storage";
import { cn, plural } from "@/lib/utils";
import {
  DAYS,
  byDay,
  daysUntil,
  generateTimetable,
  type Availability,
  type DayName,
  type SubjectInput,
} from "@/lib/timetable";

const CONFIDENCE_LABELS: Record<number, string> = {
  1: "Very shaky",
  2: "Shaky",
  3: "Getting there",
  4: "Fairly solid",
  5: "Solid",
};

const DEFAULT_SUBJECTS: SubjectInput[] = [
  { id: "s1", name: "Mathematics", confidence: 2, examDate: "" },
  { id: "s2", name: "Biology", confidence: 3, examDate: "" },
  { id: "s3", name: "Chemistry", confidence: 4, examDate: "" },
];

const DEFAULT_AVAILABILITY: Availability = {
  slotsPerDay: {
    Monday: 2,
    Tuesday: 2,
    Wednesday: 2,
    Thursday: 2,
    Friday: 1,
    Saturday: 3,
    Sunday: 3,
  },
};

/** Stable, collision-free ids without pulling in a uuid dependency. */
let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `s${Date.now().toString(36)}${idCounter}`;
}

export function TimetableBuilder() {
  const [subjects, setSubjects, subjectsReady] = usePersistentState<
    SubjectInput[]
  >("timetable:subjects", DEFAULT_SUBJECTS);
  const [availability, setAvailability, availabilityReady] =
    usePersistentState<Availability>("timetable:availability", DEFAULT_AVAILABILITY);

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const result = useMemo(
    () => (now === null ? null : generateTimetable(subjects, availability, now)),
    [subjects, availability, now],
  );

  const ready = subjectsReady && availabilityReady && now !== null;

  function updateSubject(id: string, patch: Partial<SubjectInput>) {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  function addSubject() {
    setSubjects((prev) => [
      ...prev,
      { id: nextId(), name: "", confidence: 3, examDate: "" },
    ]);
  }

  function removeSubject(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  function setDaySlots(day: DayName, value: number) {
    setAvailability((prev) => ({
      slotsPerDay: {
        ...prev.slotsPerDay,
        [day]: Math.max(0, Math.min(6, value)),
      },
    }));
  }

  if (!ready) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="card-surface h-[32rem] animate-pulse" />
        <div className="card-surface h-[32rem] animate-pulse" />
      </div>
    );
  }

  const grouped = result ? byDay(result.slots) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,23rem)_1fr] lg:items-start">
      {/* ── Inputs ──────────────────────────────────────────────── */}
      <div className="space-y-6">
        <section className="card-surface p-6">
          <h2 className="text-lg font-bold">Your subjects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Be honest about confidence — it decides how the week is split.
          </p>

          <ul className="mt-5 space-y-5">
            {subjects.map((subject, i) => {
              const until = daysUntil(subject.examDate, now);
              return (
                <li
                  key={subject.id}
                  className="rounded-md border border-border p-4"
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`name-${subject.id}`}
                        className="block text-sm font-semibold"
                      >
                        Subject {i + 1}
                      </label>
                      <input
                        id={`name-${subject.id}`}
                        type="text"
                        value={subject.name}
                        placeholder="e.g. Physics"
                        onChange={(e) =>
                          updateSubject(subject.id, { name: e.target.value })
                        }
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubject(subject.id)}
                      aria-label={`Remove ${subject.name || `subject ${i + 1}`}`}
                      className="mt-7 grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor={`conf-${subject.id}`}
                      className="flex items-center justify-between text-sm font-semibold"
                    >
                      Confidence
                      <span className="font-normal text-muted-foreground">
                        {CONFIDENCE_LABELS[subject.confidence]}
                      </span>
                    </label>
                    <input
                      id={`conf-${subject.id}`}
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={subject.confidence}
                      onChange={(e) =>
                        updateSubject(subject.id, {
                          confidence: Number(e.target.value),
                        })
                      }
                      className="mt-2 h-11 w-full cursor-pointer accent-[var(--primary)]"
                    />
                  </div>

                  <div className="mt-3">
                    <label
                      htmlFor={`exam-${subject.id}`}
                      className="block text-sm font-semibold"
                    >
                      Exam date{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </label>
                    <input
                      id={`exam-${subject.id}`}
                      type="date"
                      value={subject.examDate}
                      onChange={(e) =>
                        updateSubject(subject.id, { examDate: e.target.value })
                      }
                      className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base"
                    />
                    {until !== null ? (
                      <p
                        className={cn(
                          "mt-1.5 text-xs",
                          until <= 0
                            ? "text-destructive"
                            : until < 30
                              ? "text-warning"
                              : "text-muted-foreground",
                        )}
                      >
                        {until <= 0
                          ? "This date has passed"
                          : `${until} ${plural(until, "day")} away`}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          <Button variant="secondary" onClick={addSubject} className="mt-5 w-full">
            <Plus className="size-4" aria-hidden="true" />
            Add subject
          </Button>
        </section>

        <section className="card-surface p-6">
          <h2 className="text-lg font-bold">When can you study?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sessions per day. One session is about 45 minutes.
          </p>

          <ul className="mt-5 space-y-2">
            {DAYS.map((day) => (
              <li key={day} className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`slots-${day}`}
                  className="text-sm font-medium"
                >
                  {day}
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setDaySlots(day, (availability.slotsPerDay[day] ?? 0) - 1)
                    }
                    aria-label={`One fewer session on ${day}`}
                    className="grid size-11 cursor-pointer place-items-center rounded-lg border border-border text-lg font-semibold transition-colors hover:bg-muted"
                  >
                    −
                  </button>
                  <input
                    id={`slots-${day}`}
                    type="number"
                    min={0}
                    max={6}
                    inputMode="numeric"
                    value={availability.slotsPerDay[day] ?? 0}
                    onChange={(e) => setDaySlots(day, Number(e.target.value))}
                    className="tabular min-h-11 w-14 rounded-lg border border-border bg-background text-center text-base"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDaySlots(day, (availability.slotsPerDay[day] ?? 0) + 1)
                    }
                    aria-label={`One more session on ${day}`}
                    className="grid size-11 cursor-pointer place-items-center rounded-lg border border-border text-lg font-semibold transition-colors hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Output ──────────────────────────────────────────────── */}
      {/* Sticks on large screens so the plan stays in view while the
          inputs above it are being edited. */}
      <div className="space-y-6 lg:sticky lg:top-20">
        {result && result.warnings.length > 0 ? (
          <div
            role="status"
            className="flex gap-3 border-l-2 border-accent py-1 pl-4"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <ul className="space-y-1 text-sm text-muted-foreground">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {result && result.slots.length > 0 && grouped ? (
          <>
            <section className="card-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">This week</h2>
                <Badge tone="brand">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  <span className="tabular">{result.slots.length}</span>{" "}
                  {plural(result.slots.length, "session")}
                </Badge>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="rounded-md border border-border bg-background-subtle p-3"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {day.slice(0, 3)}
                    </h3>
                    {grouped[day].length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">Rest</p>
                    ) : (
                      <ol className="mt-2.5 space-y-2">
                        {grouped[day].map((slot) => (
                          <li
                            key={`${slot.day}-${slot.index}`}
                            className="rounded-lg bg-card border border-card-border px-3 py-2.5 text-sm font-medium [overflow-wrap:anywhere]"
                          >
                            {slot.subjectName}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="card-surface p-6">
              <h2 className="text-lg font-bold">How the week is split</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Weighted by your confidence and how close each exam is.
              </p>
              <ul className="mt-5 space-y-4">
                {subjects
                  .filter((s) => result.allocation[s.id] !== undefined)
                  .sort(
                    (a, b) => result.allocation[b.id] - result.allocation[a.id],
                  )
                  .map((s) => {
                    const n = result.allocation[s.id];
                    const pct = Math.round((n / result.slots.length) * 100);
                    return (
                      <li key={s.id}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium [overflow-wrap:anywhere]">
                            {s.name}
                          </span>
                          <span className="tabular shrink-0 text-muted-foreground">
                            {n} {plural(n, "session")} · {pct}%
                          </span>
                        </div>
                        <div
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${s.name} share of the week`}
                          className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                        >
                          <div
                            className="h-full rounded-full bg-chart-bar transition-[width] duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </section>
          </>
        ) : (
          <section className="card-surface grid place-items-center p-12 text-center">
            <CalendarDays
              className="size-10 text-border-strong"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-bold">No timetable yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add at least one subject and set how many sessions you can manage
              on at least one day. The plan builds itself as you type.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
