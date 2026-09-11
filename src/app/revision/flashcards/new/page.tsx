import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DeckBuilder } from "@/components/flashcards/deck-builder";

export const metadata: Metadata = {
  title: "Create a deck",
  description:
    "Write your own flashcards, pull them out of your notes automatically, or import a deck from Anki, Quizlet or ChatGPT.",
};

export default function NewDeckPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/revision" className="hover:text-foreground">
              Revision
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li>
            <Link href="/revision/flashcards" className="hover:text-foreground">
              Flashcards
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            New deck
          </li>
        </ol>
      </nav>

      <header className="mb-10 max-w-3xl">
        <h1 className="font-display text-[2.25rem] leading-tight md:text-[3rem]">
          Create a deck
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Three ways in: write the cards yourself, pull them out of notes you
          have already made, or bring a deck across from somewhere else. All
          three land in the same table so you can edit before saving.
        </p>
      </header>

      <DeckBuilder />
    </div>
  );
}
