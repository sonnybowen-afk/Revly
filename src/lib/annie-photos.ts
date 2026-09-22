/**
 * The photo manifest.
 *
 * Every image position on the salon site is a named slot. A slot with an
 * entry in PHOTOS renders that photograph; a slot without one renders a
 * `PhotoFrame` — a gold frame stating which photograph belongs there. So
 * the site is never showing a broken image, and never showing a stock
 * picture of somebody else's work.
 *
 * To add a photograph:
 *   1. Save the file into `public/annie/`.
 *   2. Add a line to PHOTOS below with its `src` and a real `alt`.
 *
 * On alt text: describe what the photograph *shows* — the hair, the
 * length, the angle. "Hair extensions" is not alt text.
 *
 * Every slot here is filled. The one thing no photograph shows is the
 * bond itself — you cannot see a nano ring in a picture of a finished
 * head — so rather than hold five macro-shot slots open indefinitely,
 * that job went to <BondViewer>, a drawn illustration that says it is
 * one. See components/annie/bond-viewer.tsx.
 *
 * ── On what these photographs do and do not claim ─────────────────────
 * The images in place came from Annie's own Instagram, supplied by the
 * client. Her posts do not record which method was fitted, how many
 * inches, or half head against full head. So neither does this file, and
 * neither do the labels on the page: they describe the colour and what
 * is visibly different between the two frames, and nothing else.
 *
 * That is why the transformation slots are named by colour rather than
 * by method: a photo of a finished head is not a photo of a nano bond,
 * and filing it under one would be a claim the photograph cannot support.
 */

export type Photo = {
  readonly src: string;
  readonly alt: string;
};

/** Every slot on the site, and what belongs in it. */
export const PHOTO_BRIEFS = {
  // ── The hero ────────────────────────────────────────────────────
  "hero": "One finished head of hair, three-quarter or back view, in the studio mirror.",

  // ── Transformations, named by colour rather than by method ──────
  "blonde-before": "Blonde, before: full length, shot from behind in the studio.",
  "blonde-after": "Blonde, after: the finished set, waved, same angle.",
  "platinum-before": "Platinum, before: the client's own length, shot from behind.",
  "platinum-after": "Platinum, after: the finished set, waved, same angle.",
  "pearl-before": "Pearl blonde, before: the client's own length at the mirror.",
  "pearl-after": "Pearl blonde, after: the finished set, waved, same angle.",
  "copper-before": "Copper, before: the client's own length, shot from behind.",
  "copper-after": "Copper, after: the finished set, waved, same angle.",
  "salon-blonde-before": "Blonde, before: the client's own length at the studio mirror.",
  "salon-blonde-after": "Blonde, after: the finished set, longer and fuller.",
  "bob-brunette-before": "Brunette, before: a shoulder-length bob.",
  "bob-brunette-after": "Brunette, after: the finished set, well past the shoulder blades.",
  "ginger-smooth-before": "Ginger, before: dry, thinning ends.",
  "ginger-smooth-after": "Ginger, after: the finished set, thick and smooth to the ends.",

  // ── Detail shots ────────────────────────────────────────────────
  "detail-waves-blonde": "The finished waves on a blonde set, close.",
  "detail-waves-copper": "The finished waves on a copper set, close.",
  "detail-crown-platinum": "A platinum set from the crown down, showing the blend.",
  "studio-mirror": "The studio: the gilt mirror, the chair and the light.",

  // ── The unit itself ─────────────────────────────────────────────
  "shopfront": "The shopfront inside the market, so people know what to look for.",
} as const;

export type PhotoId = keyof typeof PHOTO_BRIEFS;

/**
 * The photographs that exist. Supplied by the salon from its own
 * Instagram; the watermarks in some frames are Annie's own.
 */
export const PHOTOS: Partial<Record<PhotoId, Photo>> = {
  "hero": {
    src: "/annie/hero.jpg",
    alt: "A finished set of long, bright red hair falling past the shoulders, photographed from behind in front of the studio's gilt mirror.",
  },

  "blonde-before": {
    src: "/annie/blonde-before.jpg",
    alt: "Blonde hair before extensions, straight and falling to mid-back, photographed from behind.",
  },
  "blonde-after": {
    src: "/annie/blonde-after.jpg",
    alt: "The same blonde hair after extensions, noticeably longer and fuller, curled into loose waves through the ends.",
  },
  "platinum-before": {
    src: "/annie/platinum-before.jpg",
    alt: "Platinum blonde hair before extensions, straight and cut to just below the shoulder.",
  },
  "platinum-after": {
    src: "/annie/platinum-after.jpg",
    alt: "The same platinum blonde hair after extensions, falling well past the shoulder blades in soft waves.",
  },
  "pearl-before": {
    src: "/annie/pearl-before.jpg",
    alt: "Pearl blonde hair before extensions, straight and shoulder length, at the studio mirror.",
  },
  "pearl-after": {
    src: "/annie/pearl-after.jpg",
    alt: "The same pearl blonde hair after extensions, long and waved through the lengths.",
  },
  "copper-before": {
    src: "/annie/copper-before.jpg",
    alt: "Copper hair before extensions, straight and falling to mid-back.",
  },
  "copper-after": {
    src: "/annie/copper-after.jpg",
    alt: "The same copper hair after extensions, longer and fuller, curled into waves.",
  },
  "salon-blonde-before": {
    src: "/annie/salon-blonde-before.jpg",
    alt: "Blonde hair before extensions, straight and falling just past the shoulders, at the studio mirror.",
  },
  "salon-blonde-after": {
    src: "/annie/salon-blonde-after.jpg",
    alt: "The same blonde hair after extensions, noticeably longer and thicker through the lengths.",
  },
  "bob-brunette-before": {
    src: "/annie/bob-brunette-before.jpg",
    alt: "Brunette hair before extensions, cut into a shoulder-length bob.",
  },
  "bob-brunette-after": {
    src: "/annie/bob-brunette-after.jpg",
    alt: "The same brunette hair after extensions, now falling well past the shoulder blades.",
  },
  "ginger-smooth-before": {
    src: "/annie/ginger-smooth-before.jpg",
    alt: "Ginger hair before extensions, dry and thinning through the ends.",
  },
  "ginger-smooth-after": {
    src: "/annie/ginger-smooth-after.jpg",
    alt: "The same ginger hair after extensions, thick and smooth all the way to the ends.",
  },
  "shopfront": {
    src: "/annie/shopfront.jpg",
    alt: "The Annie's Secret unit inside Manchester Arndale Market: a lit black sign reading Hair Extensions and Weave Bar, with Just Walk In Welcome, Appointment Not Necessary, Free Consultation and the phone number.",
  },

  "detail-waves-blonde": {
    src: "/annie/detail-waves-blonde.jpg",
    alt: "Close view of the ends of a finished blonde set, curled into soft waves.",
  },
  "detail-waves-copper": {
    src: "/annie/detail-waves-copper.jpg",
    alt: "Close view of the ends of a finished copper set, curled into defined waves.",
  },
  "detail-crown-platinum": {
    src: "/annie/detail-crown-platinum.jpg",
    alt: "A platinum blonde set seen from the crown down, with no visible join between the client's own hair and the extensions.",
  },
  "studio-mirror": {
    src: "/annie/studio-mirror.jpg",
    alt: "The studio's ornate gilt mirror above the styling chair, with the ceiling light reflected in it.",
  },
};

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
