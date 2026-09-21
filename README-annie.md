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

### 3. Photography — `public/annie/`

The site ships with **no photographs**, because filling a real salon's
gallery with stock pictures of other people's hair would misrepresent
Annie's work. Every image position renders a `PhotoFrame` instead: a
finished-looking gold frame that states exactly which photograph belongs in
it and at what aspect ratio.

```tsx
<PhotoFrame caption="…" ratio="4 / 5" />                 // empty slot
<PhotoFrame caption="…" ratio="4 / 5" src="/annie/x.jpg" /> // photograph
```

The frame keeps its aspect ratio either way, so dropping real files in
shifts nothing on the page. The gallery page lists every shot that is
wanted.

## What is actually built

| Feature | Where | Notes |
|---|---|---|
| Hair match finder | `/annie/hair-match` | Seven questions, scores all five methods 0–100, explains every result and names what it rules out |
| Cost-of-ownership estimator | `/annie/services#estimator` | Fitting + every move-up across the first year, reduced to a monthly figure, compared across methods |
| Before/after sliders | `/annie/gallery`, home | A real `<input type="range">` — keyboard, touch and screen-reader operable |
| Review wall | `/annie/reviews` | Rating breakdown, filter by stars and by method |
| Enquiry builder | `/annie/book` | Validates, saves a draft, and composes a finished WhatsApp / SMS / email message |
| Structured data | everywhere | `HairSalon` with real NAP, hours and services; `FAQPage`; `BreadcrumbList` |

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

Direction: **extravagant**. Obsidian with a violet undertone, one champagne
gold, and rose-gold and amethyst as gradient partners. Glass, gilt and glow;
no texture anywhere.

- **Type** — Playfair Display (display), Inter (body), JetBrains Mono
  (prices, timings, labels). Loaded in `app/annie/layout.tsx`, so the files
  are only fetched on salon routes.
- **Colour** — the salon re-points the *same* semantic tokens Revly uses, in
  a `.annie-root` block in `globals.css`. Every `bg-background` and
  `text-muted-foreground` utility keeps working and simply comes out gold.
  A `:root:has(.annie-root)` rule carries the theme up to `<html>`, so the
  browser chrome and the overscroll gutter go dark with the page.
- **Contrast** — body text measures 7.9:1 or better on the salon canvas.
  **axe reports zero violations across all nine pages at 390px and 1440px.**

### Motion

Zoom is the house move. `<Reveal>` defaults to `zoom-soft`, with
`zoom`, `zoom-out` and `zoom-blur` (a rack-focus) as accents, plus
ken-burns on photographs, a sheen sweep on cards, and hover zoom.

It is all IntersectionObserver plus CSS — no animation library. Only
`transform`, `opacity` and `filter` animate, so nothing here can cause a
layout shift. `prefers-reduced-motion: reduce` stops every decorative
animation and reveals all content outright, which is the failure mode that
matters: a stalled reveal leaves a page unreadable, not merely still.

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
