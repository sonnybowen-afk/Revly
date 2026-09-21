# Annie's Secret Hair Extension — salon site

A second site living in this repository, served from `/annie`. It shares the
Next.js app, the build and the deploy pipeline with Revly, but nothing else:
its own root chrome, its own palette, its own typography and its own motion
system.

- **Live paths** — `/annie`, `/annie/services`, `/annie/hair-match`,
  `/annie/gallery`, `/annie/reviews`, `/annie/about`, `/annie/aftercare`,
  `/annie/book`, `/annie/contact`
- **Business** — Annie's Secret Hair Extension, Arndale Market, Manchester
  M4 3AH · 07428 132392 · Mon–Fri 11am–6pm · walk-in

## Before this goes live

Three things are deliberately unfinished, because finishing them would have
meant inventing facts about a real business. Each one is gated behind a flag
so the site cannot quietly ship a fiction.

### 1. Prices — `src/lib/annie-methods.ts`

Every `guide` and `guideMaintenance` figure is a **placeholder band**. The
relationships between methods are sensible, but the numbers are not Annie's.

```
src/lib/annie-methods.ts     ← replace guide / guideMaintenance per method
src/lib/annie-pricing.ts     ← then set PRICING_CONFIRMED = true
```

While `PRICING_CONFIRMED` is `false`, the estimator shows a prominent
"guide figures only" notice and every call to action leads with the free
consultation rather than a number. Setting it to `true` removes the notice.
A unit test asserts the flag is still `false`, so flipping it is a
deliberate act that shows up in a diff.

### 2. Reviews — `src/lib/annie-reviews.ts`

The **4.9 from 82 reviews** aggregate is real and sourced from the salon's
public Treatwell profile; it links out to it everywhere it appears. The four
review *themes* are summarised from the published profiles, and each one
names the platform it came from.

The individual cards on the review wall are **placeholders, written to read
obviously as placeholders**. No invented customer quote appears anywhere.

To go live:

1. Export the real reviews from Treatwell, Fresha or Google.
2. Replace `REVIEWS` with them, keeping the `Review` shape.
3. Set `REVIEWS_VERIFIED = true`.

The amber "sample layout" banner disappears on its own, and `review` nodes
start being emitted into the JSON-LD. Until then they are deliberately
withheld — marking up placeholder reviews for Google is both dishonest and a
manual penalty waiting to happen.

### 3. Photography — `src/lib/annie-photos.ts`

The site ships with **no photographs**. I could not download them:
`anniesecrethairextension.co.uk`, Instagram, Fresha and Treatwell are all
refused by this environment's network policy (403 at the egress gateway),
so there was nothing to pull across. And filling a real salon's gallery
with stock pictures of other people's hair would misrepresent Annie's work,
so every image position renders a `PhotoFrame` instead: a gold frame
stating exactly which photograph belongs in it.

**Every slot is named and briefed** in `annie-photos.ts` — 31 of them, from
the hero down to each before/after half. Adding a photograph is two lines:

```bash
cp hero.jpg public/annie/hero.jpg
```

```ts
// src/lib/annie-photos.ts
export const PHOTOS: Partial<Record<PhotoId, Photo>> = {
  "hero": {
    src: "/annie/hero.jpg",
    alt: "A finished full head of 20 inch nano ring extensions, waved.",
  },
};
```

That is all. The frame keeps its aspect ratio, so the page does not move;
the written brief disappears on its own; the gallery's status card counts
up from "0 of 31"; and a before/after pair only drops its written briefs
once *both* halves are real photographs.

`PHOTO_BRIEFS` in the same file is the shot list — what to photograph, from
what angle, in what light. Alt text is required per photograph, because
"hair extensions" is not alt text.

## What is actually built

| Feature | Where | Notes |
|---|---|---|
| Hair match finder | `/annie/hair-match` | Seven questions, scores all five methods 0–100, explains every result and names what it rules out |
| Cost-of-ownership estimator | `/annie/services#estimator` | Fitting + every move-up across the first year, reduced to a monthly figure, compared across methods |
| Before/after sliders | `/annie/gallery`, home | A real `<input type="range">` — keyboard, touch and screen-reader operable |
| Review wall | `/annie/reviews` | Rating breakdown, filter by stars and by method |
| Enquiry builder | `/annie/book` | Validates, saves a draft, and composes a finished WhatsApp / SMS / email message |
| Structured data | everywhere | `HairSalon` with real NAP, hours and services; `FAQPage`; `BreadcrumbList` |
| Photo manifest | `src/lib/annie-photos.ts` | 31 named, briefed slots; drop a file in and the frame becomes a photograph |
| Live motion | `src/components/annie/motion.tsx` | Custom cursor, magnetic CTAs, word reveals, parallax, scroll progress, petals |

### The logic, and its tests

All the decision-making is pure TypeScript with no React in it, tested with
`node --test`. **96 tests** cover this site.

```
src/lib/annie-salon.ts       Business facts, opening-hours logic   (17 tests)
src/lib/annie-methods.ts     The five methods                      —
src/lib/annie-hair-match.ts  Recommendation scoring                (18 tests)
src/lib/annie-pricing.ts     First-year cost estimator             (16 tests)
src/lib/annie-reviews.ts     Aggregation and filtering             (19 tests)
src/lib/annie-booking.ts     Validation and message composition    (30 tests)
```

Every one of them is pure: same input, same output, no clock and no storage.
`openState()` takes a `Date` rather than reading one, which is what lets the
"Open until 6pm" badge be tested at all.

## Design

Direction: **classic salon**. Warm ivory, antique gold and blush pink —
light, generous and unhurried. Deliberately almost no black: the ink is a
deep cocoa-plum (`#3A2B2E`), which carries 13:1 on the canvas while still
reading warm.

- **Type** — Playfair Display (display), Inter (body), JetBrains Mono
  (prices, timings, labels). Loaded in `app/annie/layout.tsx`, so the files
  are only fetched on salon routes.
- **Colour** — the salon re-points the *same* semantic tokens Revly uses, in
  a `.annie-root` block in `globals.css`. Every `bg-background` and
  `text-muted-foreground` utility keeps working and simply comes out gold.
  A `:root:has(.annie-root)` rule carries the theme up to `<html>`, so the
  browser chrome and the overscroll gutter go cream with the page.
- **The two golds** — bright gold on cream is unreadable, so there are two.
  `--primary` (`#856610`) is dark enough to be *text*; `--gold-bright` is
  for fills, edges and the gilt gradient on large display type only.
- **Contrast** — every pair was computed rather than eyeballed, and the
  numbers are in the stylesheet header. Body text is 5.2:1 or better; the
  worst pair on the site is 3.0:1 against a 3:1 threshold.
  **axe reports zero violations across all nine pages at 390px and 1440px.**

### Motion

Live, continuous motion rather than reveal-once-and-stop. The toolkit is
`src/components/annie/motion.tsx`:

| Effect | What it does |
|---|---|
| `CustomCursor` | A gold dot tracking exactly, with a ring easing behind it that swells over anything clickable |
| `Magnetic` | CTAs lean towards the pointer and spring back |
| `WordReveal` | Headings rise word by word out of their own clipping masks |
| `Parallax` | Background layers travel at their own rate, so they separate on scroll |
| `ScrollProgress` | A gold hairline across the top that fills as you read |
| `Petals` | Blush petals falling endlessly, no two on the same path |
| `useActiveStep` | Reports which section is at the reading position |

Plus zoom reveals (`zoom`, `zoom-out`, a rack-focus `zoom-blur`), ken-burns
on photographs, sheen sweeps, and gilt shimmer on display type.

Four rules hold all of it together:

1. **Transform and opacity only.** Nothing here can cause a layout, so
   nothing here can cause a layout shift.
2. **One rAF frame at a time.** Handlers record a value; the write happens
   on the next animation frame, so a fast scroll cannot queue up hundreds
   of style writes.
3. **Passive listeners.** None of it can block scrolling.
4. **It all switches off.** `prefers-reduced-motion: reduce` disables every
   effect and renders the final readable state. The pointer effects
   additionally require a fine pointer, so a phone never pays for a cursor
   it does not have.

The native cursor is hidden by a class that `CustomCursor` adds *after it
mounts* — never from the stylesheet. If the script fails, the visitor keeps
an ordinary cursor rather than none at all, and the caret comes back over
text fields, where a dot is useless.

`WordReveal` keeps the words as real text — each is a span with a
non-breaking space — so find-in-page and screen readers are unaffected,
which is the thing most split-text effects quietly break. The words render
*visible* on the server and are hidden in a layout effect before the first
paint, so there is no flash, no hydration mismatch, and with JavaScript off
the heading is simply there.

## How the two sites coexist

```
src/app/
  layout.tsx          <html>, <body>, theme script, globals.css — nothing else
  not-found.tsx       Global 404, carries Revly's chrome itself
  (revly)/
    layout.tsx        Revly header + footer
    page.tsx …        The revision hub, unchanged
  annie/
    layout.tsx        Salon header + footer, fonts, JSON-LD, .annie-root
    page.tsx …        The salon site
```

The root layout used to own Revly's header and footer. It now owns only the
document, and each site brings its own furniture. Revly's routes, styling
and behaviour are otherwise untouched.

### Known limitation

A URL under `/annie` that matches nothing (`/annie/typo`) falls to the
**root** 404, which is Revly's. Next.js resolves genuinely unmatched paths
against the root boundary, and the catch-all route that would fix it is
incompatible with `output: export`, which this repo uses for GitHub Pages.
`app/annie/not-found.tsx` still serves any `notFound()` raised from inside a
salon route. If the salon ever moves to its own domain, make its 404 the
root one.

## Running it

```bash
npm run dev          # http://localhost:3000/annie
npm run test         # 226 tests, 96 of them this site's
npm run typecheck
npm run build
npm run build:pages  # static export
```

`npm run lint` is broken on this repo and was already: `next lint` was
removed in Next.js 16. CI does not run it.
