"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/lib/storage";
import {
  MIN_PER_QUESTION,
  QUESTIONS,
  READINESS_LABEL,
  TOTAL_LIMIT,
  reviewStatement,
  type Severity,
} from "@/lib/statement-review";

const SEVERITY: Record<
  Severity,
  { icon: typeof XCircle; tone: string; label: string }
> = {
  fail: { icon: XCircle, tone: "text-destructive", label: "Must fix" },
  warn: { icon: AlertTriangle, tone: "text-accent", label: "Costing you marks" },
  note: { icon: Info, tone: "text-muted-foreground", label: "Worth a look" },
};

export function StatementChecker() {
  const [answers, setAnswers, hydrated] = usePersistentState<string[]>(
    "ucas:statement",
    ["", "", ""],
  );
  const [checked, setChecked] = useState(false);

  const result = useMemo(() => reviewStatement(answers), [answers]);

  function setAnswer(i: number, value: string) {
    setAnswers((prev) => prev.map((a, j) => (j === i ? value : a)));
  }

  if (!hydrated) {
    return <div className="card-surface h-96 animate-pulse" />;
  }

  const over = result.withinTotal < 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-12">
      {/* ── Editor ──────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
          <h2 className="font-display text-xl">Your three answers</h2>
          <p
            className={cn(
              "tabular text-sm",
              over ? "font-semibold text-destructive" : "text-muted-foreground",
            )}
          >
            {result.totalChars} / {TOTAL_LIMIT} characters
            {over ? ` · ${Math.abs(result.withinTotal)} over` : ""}
          </p>
        </div>

        <div className="space-y-8 pt-6">
          {QUESTIONS.map((q, i) => {
            const stat = result.stats[i];
            return (
              <div key={i}>
                <label
                  htmlFor={`q${i}`}
                  className="block text-sm font-semibold leading-snug"
                >
                  <span className="figures-display mr-2 text-muted-foreground">
                    0{i + 1}
                  </span>
                  {q}
                </label>
                <textarea
                  id={`q${i}`}
                  value={answers[i] ?? ""}
                  onChange={(e) => setAnswer(i, e.target.value)}
                  rows={7}
                  className="mt-3 min-h-40 w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 text-base"
                />
                <p
                  className={cn(
                    "tabular mt-1.5 text-xs",
                    stat.chars === 0
                      ? "text-muted-foreground"
                      : stat.meetsMinimum
                        ? "text-success"
                        : "text-accent",
                  )}
                >
                  {stat.chars} characters
                  {stat.chars > 0 && !stat.meetsMinimum
                    ? ` · ${MIN_PER_QUESTION - stat.chars} short of the minimum`
                    : ""}
                  {stat.meetsMinimum ? " · meets the minimum" : ""}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
          <Button onClick={() => setChecked(true)} size="lg">
            Check my statement
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setAnswers(["", "", ""]);
              setChecked(false);
            }}
          >
            Clear
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Your draft is saved in this browser only. It is never uploaded.
        </p>
      </div>

      {/* ── Findings ────────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-20">
        <div className="card-surface p-6">
          <h2 className="font-display text-xl">What the checker found</h2>

          {!checked || result.readiness === "empty" ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Paste or write your answers, then run the check. Every finding
              comes with the reason behind it and what to do about it.
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge
                  tone={
                    result.readiness === "not-ready"
                      ? "danger"
                      : result.readiness === "needs-work"
                        ? "warning"
                        : "success"
                  }
                >
                  {READINESS_LABEL[result.readiness]}
                </Badge>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-[4px] border border-border bg-border">
                {(["fail", "warn", "note"] as Severity[]).map((s) => (
                  <div key={s} className="bg-card px-3 py-3 text-center">
                    <dd className="figures-display block text-2xl">
                      {result.counts[s]}
                    </dd>
                    <dt className="mt-0.5 block text-[0.6875rem] leading-tight text-muted-foreground">
                      {SEVERITY[s].label}
                    </dt>
                  </div>
                ))}
              </dl>

              {result.findings.length === 0 ? (
                <div className="mt-6 flex gap-3 border-l-2 border-success pl-4">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Nothing structural to flag. That is as far as a rule-based
                    check can take you — get a teacher or a specialist to read
                    it for argument and tone.
                  </p>
                </div>
              ) : (
                <ul className="mt-6 space-y-6">
                  {result.findings.map((f) => {
                    const meta = SEVERITY[f.severity];
                    const Icon = meta.icon;
                    return (
                      <li key={f.id} className="border-t border-border pt-5">
                        <div className="flex gap-3">
                          <Icon
                            className={cn("mt-0.5 size-4 shrink-0", meta.tone)}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold leading-snug">
                              {f.title}
                            </p>
                            {f.question !== null ? (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Question {f.question + 1}
                              </p>
                            ) : null}
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                              {f.message}
                            </p>
                            {f.excerpt ? (
                              <p className="mt-2 border-l-2 border-border pl-3 text-sm italic text-muted-foreground [overflow-wrap:anywhere]">
                                {f.excerpt}
                              </p>
                            ) : null}
                            <p className="mt-2.5 text-sm leading-relaxed">
                              <span className="font-semibold">Fix. </span>
                              {f.fix}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
