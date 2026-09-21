import type { Metadata } from "next";
import { TimetableBuilder } from "@/components/timetable/timetable-builder";

export const metadata: Metadata = {
  title: "Revision timetable",
  description:
    "Build a balanced GCSE or A-Level revision timetable. Weighted by confidence and exam proximity, with interleaved subjects and built-in spacing.",
};

export default function TimetablePage() {
  return (
    <div className="container-page py-10 md:py-14">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold md:text-4xl">Revision timetable</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell it what you are sitting, how confident you feel and when you are
          actually free. It weights the week towards your weakest subjects and
          nearest exams, then interleaves them so no two sessions in a row
          cover the same thing.
        </p>
      </header>

      <TimetableBuilder />
    </div>
  );
}
