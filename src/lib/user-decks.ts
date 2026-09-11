/**
 * Decks the learner makes themselves — written, generated from notes, or
 * imported. Stored alongside the seed library, never replacing it.
 */

import type { Deck, Level, SeedCard } from "./decks.ts";
import { DECKS } from "./decks.ts";

export interface UserDeck extends Deck {
  /** Distinguishes these from the built-in library at a glance. */
  origin: "written" | "generated" | "imported";
  createdAt: number;
}

export const USER_DECKS_KEY = "userDecks";

/** Deck ids are namespaced so they can never collide with a seed deck. */
export function newDeckId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newCardId(deckId: string, index: number): string {
  return `${deckId}-c${index}`;
}

export interface DraftCard {
  front: string;
  back: string;
  hint?: string;
}

export function buildDeck(input: {
  title: string;
  subject: string;
  level: Level;
  exam: string;
  description: string;
  origin: UserDeck["origin"];
  cards: DraftCard[];
}): UserDeck {
  const id = newDeckId();
  const cards: SeedCard[] = input.cards
    .filter((c) => c.front.trim() && c.back.trim())
    .map((c, i) => ({
      id: newCardId(id, i),
      front: c.front.trim(),
      back: c.back.trim(),
      ...(c.hint?.trim() ? { hint: c.hint.trim() } : {}),
    }));

  return {
    id,
    title: input.title.trim() || "Untitled deck",
    subject: input.subject.trim() || "General",
    level: input.level,
    exam: input.exam.trim() || "—",
    description: input.description.trim(),
    accent: "brand",
    origin: input.origin,
    createdAt: Date.now(),
    cards,
  };
}

/** Seed library first, then the learner's own, newest last. */
export function mergeDecks(userDecks: UserDeck[]): Deck[] {
  return [...DECKS, ...userDecks];
}

export function findDeck(
  deckId: string,
  userDecks: UserDeck[],
): Deck | undefined {
  return mergeDecks(userDecks).find((d) => d.id === deckId);
}

export function isUserDeck(deckId: string): boolean {
  return deckId.startsWith("u-");
}

/**
 * Guards against a corrupted or hand-edited localStorage blob — a bad
 * value here would otherwise crash the deck list on load.
 */
export function sanitiseUserDecks(value: unknown): UserDeck[] {
  if (!Array.isArray(value)) return [];
  return value.filter((d): d is UserDeck => {
    if (!d || typeof d !== "object") return false;
    const deck = d as Partial<UserDeck>;
    return (
      typeof deck.id === "string" &&
      typeof deck.title === "string" &&
      Array.isArray(deck.cards) &&
      deck.cards.every(
        (c) =>
          c &&
          typeof c.id === "string" &&
          typeof c.front === "string" &&
          typeof c.back === "string",
      )
    );
  });
}

export const LEVELS: Level[] = ["GCSE", "A-Level"];
