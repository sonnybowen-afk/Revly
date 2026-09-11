"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Versioned localStorage helpers.
 *
 * Every read is wrapped: Safari private mode, blocked site data and quota
 * errors all throw on access rather than returning null, and a revision app
 * that white-screens because storage is disabled is worse than one that
 * quietly forgets progress.
 */

const PREFIX = "revly:v1:";

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* Storage full or unavailable — the session still works in memory. */
  }
}

export function clearStore(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* no-op */
  }
}

/**
 * State backed by localStorage.
 *
 * Always renders `initial` on the first paint so the server and client markup
 * agree, then hydrates from storage in an effect. `hydrated` lets callers hold
 * back skeletons until the real values have landed.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (updater: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
    setValue(readStore<T>(key, initial));
    setHydrated(true);
    // `initial` is intentionally excluded: it is a seed, not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: T) => T)(prev)
          : updater;
      writeStore(keyRef.current, next);
      return next;
    });
  }, []);

  return [value, update, hydrated];
}
