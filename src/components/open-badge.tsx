"use client";

import { useEffect, useState } from "react";
import { openState } from "@/lib/salon";

/**
 * "Open until 6pm" / "Opens tomorrow at 11am".
 *
 * Whether the salon is open depends on the visitor's clock, which the
 * server does not have. Rendering it on the server would either be wrong
 * for anyone outside the server's timezone or cause a hydration mismatch,
 * so this deliberately renders nothing until it is mounted and then fills
 * in — and it reserves its own height so the fill-in shifts nothing.
 */
export function OpenBadge({ className }: { className?: string }) {
  const [state, setState] = useState<ReturnType<typeof openState> | null>(null);

  useEffect(() => {
    const update = () => setState(openState(new Date()));
    update();
    // A minute is plenty: the label only changes on the hour boundaries.
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p
      className={className}
      // The label is a live-ish status, but it must never interrupt a
      // screen reader mid-sentence, so it is polite and atomic.
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="inline-flex min-h-7 items-center gap-2 rounded-full border border-[var(--gold-hairline)] bg-primary-soft/40 px-3 text-xs">
        {state ? (
          <>
            <span
              aria-hidden="true"
              className={
                state.open
                  ? "size-1.5 rounded-full bg-success"
                  : "size-1.5 rounded-full bg-muted-foreground"
              }
            />
            <span className={state.open ? "text-success" : "text-muted-foreground"}>
              {state.label}
            </span>
          </>
        ) : (
          /* Placeholder of the same height while the clock is read. */
          <span className="invisible">Opens tomorrow at 11am</span>
        )}
      </span>
    </p>
  );
}
