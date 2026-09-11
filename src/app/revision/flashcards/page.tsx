import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FlashcardsApp } from "@/components/flashcards/flashcards-app";

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Spaced-repetition flashcards for GCSE and A-Level. Active recall with automatic scheduling — cards return exactly when you are about to forget them.",
};

export default function FlashcardsPage() {
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
          <li aria-current="page" className="font-medium text-foreground">
            Flashcards
          </li>
        </ol>
      </nav>

      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold md:text-4xl">Flashcards</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Answer from memory, grade how it felt, and let the scheduler decide
          when you see each card again. Progress saves in this browser — no
          account needed.
        </p>
      </header>

      <FlashcardsApp />
    </div>
  );
}
