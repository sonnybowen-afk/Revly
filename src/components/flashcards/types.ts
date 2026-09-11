import type { CardState } from "@/lib/srs";

/** Persisted shape: card id → scheduling state. */
export type ProgressMap = Record<string, CardState>;

export interface SessionTally {
  reviewed: number;
  again: number;
  startedAt: number;
}
