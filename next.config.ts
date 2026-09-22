import type { NextConfig } from "next";

/**
 * The GitHub Pages build is a fully static export. It is opt-in via
 * DEPLOY_TARGET so that `npm run dev` and `npm run start` keep the normal
 * Next.js server behaviour locally.
 *
 * Pages serves a project site from /<repo>, so basePath and assetPrefix have
 * to match the repository name. Override NEXT_PUBLIC_BASE_PATH if you later
 * move to a custom domain, where the base path becomes "".
 */
const isPagesBuild = process.env.DEPLOY_TARGET === "github-pages";
// configure-pages reports "" for a custom domain and "/<repo>" for a
// project site. Next.js rejects a bare "/" and a trailing slash, so
// normalise both away.
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Revly";
const basePath =
  rawBasePath === "/" ? "" : rawBasePath.replace(/\/$/, "");

/**
 * Next prefixes basePath onto its own assets and onto next/link hrefs,
 * but NOT onto a hand-written `src` on a plain <img>. Publishing the
 * effective prefix lets `assetPath()` do that job — see src/lib/asset.ts.
 * Empty outside a Pages build, because basePath only applies there.
 */
const assetBase = isPagesBuild ? basePath : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_ASSET_BASE: assetBase },
  ...(isPagesBuild
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: `${basePath}/`,
        // Each route becomes a directory with its own index.html, which is
        // what static hosts expect.
        trailingSlash: true,
        // The export has no server, so the image optimiser cannot run.
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
