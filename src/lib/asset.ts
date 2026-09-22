/**
 * Prefixes a path in `public/` with the deployment's base path.
 *
 * Next.js prefixes basePath onto its own bundles and onto next/link
 * hrefs automatically, but a hand-written `src` on a plain <img> is
 * just a string and gets nothing. On the GitHub Pages project site,
 * where everything is served under /Revly, that means
 * `src="/annie/hero.jpg"` asks for `/annie/hero.jpg` and 404s while the
 * file sits at `/Revly/annie/hero.jpg`.
 *
 * The prefix comes from next.config.ts, which sets it only for a Pages
 * build, so this is a no-op in dev, in `next start`, and on a custom
 * domain where the base path is empty.
 */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? "";

export function assetPath(path: string): string {
  // Only root-relative paths need it. A full URL or a data: URI is
  // already absolute, and a relative path resolves against the page.
  if (!path.startsWith("/")) return path;
  return `${BASE}${path}`;
}

/** The prefix itself, for tests and for anything building its own URL. */
export const ASSET_BASE = BASE;
