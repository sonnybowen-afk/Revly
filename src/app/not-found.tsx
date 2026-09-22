import { ButtonLink } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * The global 404.
 *
 * It carries Revly's chrome itself rather than inheriting it, because the
 * root layout now only owns <html>/<body> — the per-site furniture lives
 * in the route groups, and an unmatched URL belongs to no group. Salon
 * URLs are handled separately by app/annie/not-found.tsx.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <p className="tabular text-sm font-bold tracking-widest text-primary uppercase">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            The link may be out of date. The revision hub is the best place to
            pick things back up.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/revision" size="lg">
              Go to the revision hub
            </ButtonLink>
            <ButtonLink href="/" variant="secondary" size="lg">
              Back to home
            </ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
