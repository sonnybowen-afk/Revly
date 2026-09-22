import type { NextConfig } from "next";

/**
 * The site is a fully static export, opt-in via DEPLOY_TARGET so that
 * `next dev` and `next start` keep the normal Next.js server locally.
 *
 * ── Base path, and why it matters here ────────────────────────────────
 * On a GitHub Pages *project* site the content lives under /<repo>. On a
 * custom domain it lives at the root and the base path is empty.
 * configure-pages reports the right one, and the deploy workflow passes
 * it in, so this needs no editing when the domain is attached.
 *
 * assetBase then publishes the same prefix to the browser, because Next
 * prefixes its own bundles and next/link hrefs but NOT a hand-written
 * `src` on a plain <img>. See src/lib/asset.ts — getting this wrong
 * 404s every photograph on the deployed site while looking perfect in
 * development, which is exactly how it was missed the first time.
 */
const isPagesBuild = process.env.DEPLOY_TARGET === "github-pages";

// Empty for a custom domain; "/<repo>" for a project site. Next rejects
// a bare "/" and a trailing slash, so normalise both away.
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = rawBasePath === "/" ? "" : rawBasePath.replace(/\/$/, "");
const assetBase = isPagesBuild ? basePath : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_ASSET_BASE: assetBase },
  ...(isPagesBuild
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath ? `${basePath}/` : undefined,
        // Each route becomes a directory with its own index.html, which
        // is what static hosts expect.
        trailingSlash: true,
        // The export has no server, so the image optimiser cannot run.
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
