"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXTRAS, METHODS, methodById } from "@/lib/annie-methods";
import {
  MAINTENANCE_NOTE,
  PRICE_NOTE,
  PRICE_SOURCE,
  formatDurationRange,
  formatGbp,
  fullHeadPrice,
  quantityLabel,
  quote,
  unitRateLabel,
} from "@/lib/annie-pricing";
import { AnnieLink } from "./ui";

/**
 * The price calculator.
 *
 * Every figure it shows comes off the studio's printed list: the unit
 * rate, the full-head rate, and the flat-price extras. It makes no
 * projection and assumes no maintenance price, because the list does not
 * publish one — that gets an honest note instead of a plausible guess.
 */
export function PriceCalculator({ initialMethod }: { initialMethod?: string }) {
  const [methodId, setMethodId] = useState(
    initialMethod && methodById(initialMethod) ? initialMethod : METHODS[0].id,
  );
  const method = methodById(methodId) ?? METHODS[0];
  const [quantity, setQuantity] = useState<number>(method.price.fullHeadQty);

  // Units differ per method, so a quantity cannot survive a method change.
  const chooseMethod = (id: string) => {
    const next = methodById(id);
    if (!next) return;
    setMethodId(id);
    setQuantity(next.price.fullHeadQty);
  };

  const result = useMemo(() => quote(method, quantity), [method, quantity]);
  const dearest = useMemo(
    () => Math.max(...METHODS.map(fullHeadPrice)),
    [],
  );

  return (
    <div className="annie-card p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-7">
          <fieldset>
            <legend className="annie-label mb-3">Method</legend>
            <div className="grid gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={m.id === methodId}
                  onClick={() => chooseMethod(m.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    m.id === methodId
                      ? "border-primary bg-primary-soft"
                      : "border-card-border bg-background-subtle hover:border-primary/40",
                  )}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {m.name}
                    </span>
                    <span className="font-technical text-xs text-primary">
                      {unitRateLabel(m)}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Full head {quantityLabel(m, m.price.fullHeadQty)} &middot;{" "}
                    {formatGbp(m.price.fullHead)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="annie-label mb-3">
              How many {method.price.unitPlural}
            </legend>
            <div className="flex flex-wrap gap-2">
              {method.price.steps.map((step) => (
                <button
                  key={step}
                  type="button"
                  aria-pressed={step === quantity}
                  onClick={() => setQuantity(step)}
                  className={cn(
                    "font-technical min-h-11 cursor-pointer rounded-full border px-4 text-sm transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    step === quantity
                      ? "border-primary bg-primary text-on-primary"
                      : "border-card-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {step}
                  {step === method.price.fullHeadQty ? (
                    <span className="ml-1.5 text-[0.7em]">full head</span>
                  ) : null}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <p className="annie-label mb-3">Also on the list</p>
            <ul className="space-y-2">
              {EXTRAS.map((extra) => (
                <li
                  key={extra.id}
                  className="flex items-baseline justify-between gap-4 border-b border-border pb-2 text-sm"
                >
                  <span>
                    <span className="text-foreground">{extra.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {extra.detail}
                    </span>
                  </span>
                  <span className="font-technical shrink-0 text-primary">
                    {formatGbp(extra.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--gold-hairline)] bg-primary-soft/40 p-6">
            <p className="annie-label">
              {method.name} &middot; {quantityLabel(method, quantity)}
            </p>
            <p
              className="mt-3 font-display text-[3rem] leading-none text-primary md:text-[3.75rem]"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatGbp(result.total)}
            </p>

            {result.saving > 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                The full-head rate, rather than{" "}
                <span className="font-technical">
                  {formatGbp(result.atUnitRate)}
                </span>{" "}
                at {unitRateLabel(method)} &mdash; a{" "}
                <span className="font-technical text-foreground">
                  {formatGbp(result.saving)}
                </span>{" "}
                difference.
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {quantityLabel(method, quantity)} at {unitRateLabel(method)}.
              </p>
            )}

            <dl className="mt-6 grid gap-4 border-t border-[var(--gold-hairline)] pt-5 text-sm sm:grid-cols-2">
              <Row term="Rate" value={unitRateLabel(method)} />
              <Row
                term="Full head"
                value={`${quantityLabel(method, method.price.fullHeadQty)} · ${formatGbp(method.price.fullHead)}`}
              />
              <Row
                term="Chair time"
                value={formatDurationRange(result.fitMinutes)}
              />
              <Row
                term="Back in every"
                value={`${method.maintenanceWeeks[0]}–${method.maintenanceWeeks[1]} weeks`}
              />
            </dl>
          </div>

          <div>
            <p className="annie-label">Full head, method by method</p>
            <ul className="mt-4 space-y-3">
              {METHODS.map((m) => {
                const price = fullHeadPrice(m);
                const isCurrent = m.id === methodId;
                return (
                  <li key={m.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span
                        className={
                          isCurrent ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {m.name}
                      </span>
                      <span className="font-technical text-xs tabular-nums text-muted-foreground">
                        {formatGbp(price)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500 ease-out",
                          isCurrent ? "bg-primary" : "bg-chart-bar-quiet",
                        )}
                        style={{ width: `${(price / dearest) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{PRICE_SOURCE}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <p className="flex items-start gap-3 rounded-xl border border-[var(--gold-hairline)] bg-primary-soft/30 p-4 text-sm leading-relaxed">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{PRICE_NOTE}</span>
        </p>
        <p className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm leading-relaxed text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{MAINTENANCE_NOTE}</span>
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <AnnieLink href={`/annie/book?method=${method.id}`} arrow>
          Book this in
        </AnnieLink>
        <AnnieLink href="/annie/hair-match" tone="outline">
          Not sure which method?
        </AnnieLink>
      </div>
    </div>
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
