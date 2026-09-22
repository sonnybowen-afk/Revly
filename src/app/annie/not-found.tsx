import { Atmosphere } from "@/components/annie/atmosphere";
import { AnnieLink } from "@/components/annie/ui";

export default function AnnieNotFound() {
  return (
    <section className="relative isolate overflow-hidden">
      <Atmosphere />
      <div className="container-page relative flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="annie-label">404</p>
        <h1 className="mt-5 max-w-[18ch] text-balance font-display text-[2.25rem] leading-tight md:text-[3rem]">
          That page has grown out
        </h1>
        <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
          The link may be out of date. The services page is the best place
          to pick things back up.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <AnnieLink href="/annie/services" arrow>
            Services and prices
          </AnnieLink>
          <AnnieLink href="/annie" tone="outline">
            Back to the start
          </AnnieLink>
        </div>
      </div>
    </section>
  );
}
