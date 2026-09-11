"use client";

import { useMemo, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BOARDS,
  LEVELS,
  RESOURCES,
  SUBJECTS,
  TYPES,
  countFor,
  filterResources,
  type ResourceFilters,
} from "@/lib/resources";

const COSTS = ["Free", "Freemium", "Paid"] as const;

const INITIAL: ResourceFilters = {
  board: "any",
  subject: "any",
  level: "any",
  type: "any",
  cost: "any",
};

export function ResourceBrowser() {
  const [filters, setFilters] = useState<ResourceFilters>(INITIAL);

  const results = useMemo(
    () => filterResources(RESOURCES, filters),
    [filters],
  );

  const active = (Object.keys(filters) as (keyof ResourceFilters)[]).filter(
    (k) => filters[k] && filters[k] !== "any",
  ).length;

  function set(key: keyof ResourceFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="grid gap-4 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          id="board"
          label="Exam board"
          value={String(filters.board)}
          onChange={(v) => set("board", v)}
          options={BOARDS.filter((b) => b !== "All boards")}
          filters={filters}
          filterKey="board"
        />
        <Select
          id="subject"
          label="Subject"
          value={String(filters.subject)}
          onChange={(v) => set("subject", v)}
          options={SUBJECTS.filter((s) => s !== "All subjects")}
          filters={filters}
          filterKey="subject"
        />
        <Select
          id="level"
          label="Level"
          value={String(filters.level)}
          onChange={(v) => set("level", v)}
          options={LEVELS}
          filters={filters}
          filterKey="level"
        />
        <Select
          id="type"
          label="Type"
          value={String(filters.type)}
          onChange={(v) => set("type", v)}
          options={TYPES}
          filters={filters}
          filterKey="type"
        />
        <Select
          id="cost"
          label="Cost"
          value={String(filters.cost)}
          onChange={(v) => set("cost", v)}
          options={COSTS}
          filters={filters}
          filterKey="cost"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 py-5">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          <span className="tabular font-semibold text-foreground">
            {results.length}
          </span>{" "}
          {results.length === 1 ? "resource" : "resources"}
          {active > 0 ? " matching your filters" : " in the library"}
        </p>
        {active > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setFilters(INITIAL)}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      {results.length === 0 ? (
        <div className="border-y border-border py-16 text-center">
          <p className="font-display text-xl">Nothing matches that yet</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            The library is curated rather than exhaustive, so some
            combinations come up empty. Try widening one filter.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => setFilters(INITIAL)}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {results.map((r) => (
            <li key={r.id}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-6 transition-colors duration-150 hover:bg-muted"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-display text-lg leading-tight">
                        {r.title}
                      </h3>
                      <ExternalLink
                        aria-hidden="true"
                        className="size-3.5 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                      {r.official ? <Badge tone="success">Official</Badge> : null}
                    </div>

                    <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
                      {r.description}
                    </p>

                    <p className="mt-2.5 max-w-[70ch] border-l-2 border-border pl-3 text-sm leading-relaxed">
                      {r.why}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <Badge tone={r.cost === "Free" ? "success" : r.cost === "Paid" ? "danger" : "warning"}>
                      {r.cost}
                    </Badge>
                    <Badge tone="neutral">{r.type}</Badge>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {/* Drop the provider when it just repeats the board. */}
                  {[
                    r.boards.join(", ") === r.provider ? null : r.provider,
                    r.levels.join(", "),
                    r.boards.join(", "),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
  filters,
  filterKey,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  filters: ResourceFilters;
  filterKey: keyof ResourceFilters;
}) {
  // Count what each option would yield, ignoring this filter's own value,
  // so a dead end is visible before it is chosen.
  const base = { ...filters, [filterKey]: "any" };

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-2 min-h-11 w-full rounded-md border bg-background px-3 text-base",
          value !== "any" ? "border-primary" : "border-border",
        )}
      >
        <option value="any">Any</option>
        {options.map((o) => {
          const n = countFor(RESOURCES, base, filterKey, o);
          return (
            <option key={o} value={o} disabled={n === 0}>
              {o} ({n})
            </option>
          );
        })}
      </select>
    </div>
  );
}
