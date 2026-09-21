/**
 * The photo manifest.
 *
 * Every image position on the salon site is a named slot. While a slot
 * is empty the page renders a `PhotoFrame` — a finished-looking gold
 * frame stating which photograph belongs there. Add the file and the
 * slot becomes the photograph, at the same aspect ratio, so nothing on
 * the page moves.
 *
 * To add a photograph:
 *   1. Save the file into `public/annie/` using the id as the filename.
 *   2. Add a line to PHOTOS below with its `src` and a real `alt`.
 *
 * On alt text: describe what the photograph *shows* — the hair, the
 * method, the angle. "Hair extensions" is not alt text. If an image is
 * purely decorative, it does not belong in this manifest at all.
 *
 * Nothing here is filled in yet, because this session could not reach
 * anniesecrethairextension.co.uk, Instagram, Fresha or Treatwell — the
 * network policy denies all four. The briefs below are what to shoot or
 * pull across.
 */

export type Photo = {
  readonly src: string;
  readonly alt: string;
};

/** Every slot on the site, and what belongs in it. */
export const PHOTO_BRIEFS = {
  // ── Home ────────────────────────────────────────────────────────
  "hero": "One finished head of hair, three-quarter profile, market light behind. The single most important image on the site.",
  "home-detail-bond": "Close detail of a nano bond at the root, showing how small it sits.",
  "home-detail-match": "A colour match held against the client's own ends in daylight.",
  "home-studio": "The studio inside Arndale Market — chair, mirror and light.",
  "visit-studio": "The studio again, wider: the chair, the mirror and the market light behind it.",

  // ── Home before / after ─────────────────────────────────────────
  "ba-nano-before": "Before: fine hair at collarbone length, centre parting, daylight.",
  "ba-nano-after": "After: nano rings fitted and cut in. Same parting, same light.",
  "ba-weave-before": "Before: fine ponytail shot from behind, natural light.",
  "ba-weave-after": "After: the LA weave row fitted, blended and styled into waves.",

  // ── Services, one per method ────────────────────────────────────
  "method-la-weave": "LA Weave: the bond at the root and the finished blend.",
  "method-nano-rings": "Nano Rings: the bond at the root and the finished blend.",
  "method-micro-rings": "Micro Rings: the bond at the root and the finished blend.",
  "method-tape-in": "Tape-in Wefts: the bond at the root and the finished blend.",
  "method-sew-in-weave": "Sew-in Weave: the braid base and the finished blend.",

  // ── Gallery before / after ──────────────────────────────────────
  "gallery-1-before": "Before: fine hair at collarbone length, centre parting, daylight.",
  "gallery-1-after": "After: nano rings fitted and cut in, same parting, same light.",
  "gallery-2-before": "Before: fine ponytail shot from behind, natural light.",
  "gallery-2-after": "After: the weave row fitted, blended and styled into soft waves.",
  "gallery-3-before": "Before: natural coils, shot at the crown to show the braid base.",
  "gallery-3-after": "After: the weft sewn in, blended at the leave-out and finished.",
  "gallery-4-before": "Before: shoulder-length hair, flat through the ends.",
  "gallery-4-after": "After: tape wefts placed, showing how flat they sit at the root.",

  // ── Gallery details ─────────────────────────────────────────────
  "detail-1": "A nano bond at the root, shot close enough to show the scale.",
  "detail-2": "A shade match held against the client's own ends in daylight.",
  "detail-3": "A finished LA weave row, parted to show the weft hidden underneath.",
  "detail-4": "The blend at the leave-out on a sew-in, looking down at the crown.",
  "detail-5": "Hair before fitting: wefts laid out, colour-matched and measured.",
  "detail-6": "The studio inside Arndale Market — chair, mirror, and market light.",
  "detail-7": "A move-up in progress: rings opened and the hair re-set at the root.",
  "detail-8": "Finished and styled into curls before the client leaves.",

  // ── About and contact ───────────────────────────────────────────
  "annie-portrait": "Annie in the studio: portrait at the chair, market light behind.",
  "shopfront": "The shopfront inside the market, so people know what to look for.",
} as const;

export type PhotoId = keyof typeof PHOTO_BRIEFS;

/**
 * The photographs that exist. A slot missing from here renders as a
 * brief instead, which is why an unfinished site never shows a broken
 * image or a stock photograph of somebody else's work.
 *
 * Example, once a file is in place:
 *
 *   "hero": {
 *     src: "/annie/hero.jpg",
 *     alt: "A finished full head of 20 inch nano ring extensions, waved.",
 *   },
 */
export const PHOTOS: Partial<Record<PhotoId, Photo>> = {};

export function photo(id: PhotoId | undefined): Photo | undefined {
  return id ? PHOTOS[id] : undefined;
}

export function brief(id: PhotoId): string {
  return PHOTO_BRIEFS[id];
}

/** How many slots are filled. Used by the gallery's own status note. */
export function photoProgress(): { filled: number; total: number } {
  const total = Object.keys(PHOTO_BRIEFS).length;
  return { filled: Object.keys(PHOTOS).length, total };
}
