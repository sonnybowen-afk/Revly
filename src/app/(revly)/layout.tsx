import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * Revly's chrome. It used to live in the root layout, but the root now only
 * owns <html>/<body> so that a second site (the Annie's Secret salon site
 * under /annie) can bring its own header, footer and palette without
 * inheriting the revision-hub furniture.
 */
export default function RevlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary focus:font-semibold"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
