"use client";

import { useId, useState } from "react";
import { CalendarClock, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY } from "@/lib/srs";

/**
 * 30-day review workload forecast.
 *
 * Single series, so the job is magnitude-over-time: one hue, no legend (the
 * title names the series), recessive axes, and a table view alongside for
 * anyone who can't read the bars.
 */
export function ForecastChart({
  data,
  now,
}: {
  data: { day: number; count: number }[];
  now: number;
}) {
  const [showTable, setShowTable] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const tableId = useId();

  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  const peak = data.reduce((a, b) => (b.count > a.count ? b : a), data[0]);

  const labelFor = (day: number) => {
    if (day === 0) return "Today";
    if (day === 1) return "Tomorrow";
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(now + day * DAY));
  };

  return (
    <figure className="card-surface p-6">
      <figcaption className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">Cards due — next 30 days</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="tabular">{total}</span> reviews scheduled · busiest
            day <span className="tabular">{peak.count}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
          aria-controls={tableId}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <Table2 className="size-4" aria-hidden="true" />
          {showTable ? "Hide data" : "View data"}
        </button>
      </figcaption>

      {total === 0 ? (
        <div className="mt-6 grid place-items-center rounded-md border border-dashed border-border-strong px-6 py-10 text-center">
          <CalendarClock
            className="size-8 text-border-strong"
            aria-hidden="true"
          />
          <p className="mt-3 font-semibold">No reviews scheduled yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Study a deck below and this fills in with the workload the
            scheduler has planned for you.
          </p>
        </div>
      ) : (
      <>
      {/* Bars. The table below is the accessible equivalent, and the
          summary is announced on the container. */}
      <div
        role="img"
        aria-label={`Bar chart of review workload over the next 30 days. ${total} reviews in total. Busiest day has ${peak.count} cards.`}
        className="mt-6 flex h-32 items-end gap-[2px]"
      >
        {data.map((d) => {
          const h = d.count === 0 ? 2 : Math.max(6, (d.count / max) * 100);
          const active = hovered === d.day;
          return (
            <div
              key={d.day}
              className="group relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHovered(d.day)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Hit target spans the full column height, not just the bar. */}
              <div
                className={cn(
                  "w-full rounded-t-[4px] transition-colors duration-150",
                  d.count === 0
                    ? "bg-chart-grid"
                    : active
                      ? "bg-chart-bar"
                      : "bg-chart-bar/80",
                )}
                style={{ height: `${h}%` }}
              />
              {active && d.count > 0 ? (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background shadow-lg">
                  {labelFor(d.day)}: {d.count}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Today</span>
        <span>+15d</span>
        <span>+30d</span>
      </div>
      </>
      )}

      {showTable ? (
        <div id={tableId} className="mt-6 max-h-64 overflow-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Cards due per day over the next 30 days
            </caption>
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th scope="col" className="px-4 py-2 text-left font-semibold">
                  Day
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  Cards due
                </th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((d) => d.count > 0)
                .map((d) => (
                  <tr key={d.day} className="border-t border-border">
                    <td className="px-4 py-2">{labelFor(d.day)}</td>
                    <td className="tabular px-4 py-2 text-right">{d.count}</td>
                  </tr>
                ))}
              {total === 0 ? (
                <tr className="border-t border-border">
                  <td
                    colSpan={2}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No reviews scheduled yet — study a deck to fill this in.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </figure>
  );
}
