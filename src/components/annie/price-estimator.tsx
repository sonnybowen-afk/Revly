"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { METHODS, methodById } from "@/lib/annie-methods";
import type { Length, Volume } from "@/lib/annie-pricing";
import {
  LENGTHS,
  PRICE_DISCLAIMER,
  PRICING_CONFIRMED,
  VOLUME_DESCRIPTIONS,
  VOLUME_LABELS,
  estimate,
  formatDurationRange,
  formatRange,
} from "@/lib/annie-pricing";
import { AnnieLink } from "./ui";

const VOLUMES: readonly Volume[] = ["half", "full", "mega"];

/**
 * What a set actually costs over its first year.
 *
 * Extensions get sold on the fitting price and then surprise people with
 * the move-ups, so this shows the whole year at once: the fitting, every
 * maintenance visit, and the two reduced to a monthly figure that can be
 * compared across methods honestly.
 *
 * Every figure is a guide until PRICING_CONFIRMED is true, and the panel
 * says so in a place that cannot be missed rather than in small print.
 */
export function PriceEstimator({ initialMethod }: { initialMethod?: string }) {
  const [methodId, setMethodId] = useState(
    initialMethod && methodById(initialMethod) ? initialMethod : METHODS[0].id,
  );
  const [volume, setVolume] = useState<Volume>("full");
  const [length, setLength] = useState<Length>(20);

  const method = methodById(methodId) ?? METHODS[0];
  const result = useMemo(
    () => estimate(method, volume, length),
    [method, volume, length],
  );

  // Scale the comparison bars against the dearest option on screen, so the
  // shortest bar is never invisible.
  const ceiling = useMemo(
    () =>
      Math.max(
        ...METHODS.map((m) => estimate(m, volume, length).firstYear[1]),
      ),
    [volume, length],
  );

  return (
    <div className="annie-card p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-7">
          <Field label="Method">
            <div className="grid gap-2">
              {METHODS.map((m) => (
                <Choice
                  key={m.id}
                  selected={m.id === methodId}
                  onClick={() => setMethodId(m.id)}
                  title={m.name}
                  detail={m.summary}
                />
              ))}
            </div>
          </Field>

          <Field label="How much hair">
            <div className="grid gap-2 sm:grid-cols-3">
              {VOLUMES.map((v) => (
                <Choice
                  key={v}
                  selected={v === volume}
                  onClick={() => setVolume(v)}
                  title={VOLUME_LABELS[v]}
                  detail={VOLUME_DESCRIPTIONS[v]}
                  compact
                />
              ))}
            </div>
          </Field>

          <Field label={`Length — ${length} inches`}>
            <div
              role="group"
              aria-label="Hair length in inches"
              className="flex flex-wrap gap-2"
            >
              {LENGTHS.map((inches) => (
                <button
                  key={inches}
                  type="button"
                  aria-pressed={inches === length}
                  onClick={() => setLength(inches)}
                  className={cn(
                    "font-technical min-h-11 min-w-14 cursor-pointer rounded-full border px-4 text-sm transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    inches === length
                      ? "border-primary bg-primary text-on-primary"
                      : "border-card-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {inches}&Prime;
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--gold-hairline)] bg-primary-soft/30 p-6">
            <p className="annie-label">First year, all in</p>
            <p
              className="mt-3 font-display text-[2.5rem] leading-none text-primary md:text-[3.25rem]"
              /* The whole panel updates together, so announce it once. */
              aria-live="polite"
              aria-atomic="true"
            >
              {formatRange(result.firstYear)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              About{" "}
              <span className="font-technical text-foreground">
                {formatRange(result.monthly)}
              </span>{" "}
              a month across twelve months.
            </p>

            <dl className="mt-6 grid gap-4 border-t border-[var(--gold-hairline)] pt-5 text-sm sm:grid-cols-2">
              <Row term="Fitting" value={formatRange(result.fitting)} />
              <Row
                term="Each move-up"
                value={formatRange([result.maintenance, result.maintenance])}
              />
              <Row
                term="Move-ups in year one"
                value={`${result.maintenanceVisits}`}
              />
              <Row
                term="Chair time"
                value={formatDurationRange(result.fitMinutes)}
              />
              <Row
                term="Back in every"
                value={`${result.maintenanceWeeks[0]}–${result.maintenanceWeeks[1]} weeks`}
              />
              <Row
                term="Hair lasts"
                value={`${method.hairLifeMonths[0]}–${method.hairLifeMonths[1]} months`}
              />
            </dl>
          </div>

          <div>
            <p className="annie-label">Against the other methods</p>
            <ul className="mt-4 space-y-3">
              {METHODS.map((m) => {
                const other = estimate(m, volume, length);
                const width = Math.round((other.firstYear[1] / ceiling) * 100);
                const isCurrent = m.id === methodId;
                return (
                  <li key={m.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span
                        className={cn(
                          isCurrent ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {m.name}
                      </span>
                      <span className="font-technical text-xs tabular-nums text-muted-foreground">
                        {formatRange(other.firstYear)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500 ease-out",
                          isCurrent ? "bg-primary" : "bg-chart-bar-quiet",
                        )}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Bars compare the top of each first-year range at the same
              volume and length.
            </p>
          </div>
        </div>
      </div>

      {!PRICING_CONFIRMED ? (
        <p className="mt-8 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm leading-relaxed text-warning-soft-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{PRICE_DISCLAIMER}</span>
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <AnnieLink href={`/annie/book?method=${method.id}`} arrow>
          Get an exact price
        </AnnieLink>
        <AnnieLink href="/annie/hair-match" tone="outline">
          Not sure which method?
        </AnnieLink>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="annie-label mb-3">{label}</legend>
      {children}
    </fieldset>
  );
}

function Choice({
  selected,
  onClick,
  title,
  detail,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  detail: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        selected
          ? "border-primary bg-primary-soft"
          : "border-card-border bg-background-subtle hover:border-primary/40",
      )}
    >
      <span className="block text-sm font-medium text-foreground">{title}</span>
      <span
        className={cn(
          "mt-1 block text-xs leading-relaxed text-muted-foreground",
          compact && "line-clamp-2",
        )}
      >
        {detail}
      </span>
    </button>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="font-technical mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
