import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Callout } from "@/components/ui/page";
import { StatementChecker } from "@/components/ucas/statement-checker";

export const metadata: Metadata = {
  title: "Statement checker",
  description:
    "Check your UCAS personal statement against the things admissions tutors react to: named universities, cliché openings, claims without evidence, and listing without reflection.",
};

export default function ReviewPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/ucas" className="hover:text-foreground">
              UCAS
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            Statement checker
          </li>
        </ol>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="font-display text-[2.25rem] leading-tight md:text-[3rem]">
          Statement checker
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Paste your three answers. Every finding tells you what is wrong, why
          it matters to an admissions tutor, and what to do about it.
        </p>
      </header>

      <div className="mb-10 max-w-3xl">
        <Callout title="What this can and cannot judge">
          <p>
            This checks <strong>structure</strong>: the character limits, a
            named university, a cliché opening, claims made without evidence,
            activities listed without reflection, run-on sentences. Those are
            the faults that most reliably cost marks, and they are the ones
            rules can catch dependably.
          </p>
          <p>
            It is not a language model and it cannot tell you whether your
            argument is <em>interesting</em>. A clean result means nothing
            structural is wrong — not that the statement is good. For that you
            need a person, which is what the paid review is for.
          </p>
        </Callout>
      </div>

      <StatementChecker />
    </div>
  );
}
