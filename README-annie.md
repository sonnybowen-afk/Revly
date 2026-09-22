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

**Nothing is outstanding.** Prices, reviews and photography are all real,
and each was gated behind a flag while it was not. This section is kept
as the record of what those flags mean and where the content came from,
so the next person changing it knows what the rules were.

### 1. Prices — **done**

`PRICING_CONFIRMED` is `true`. Every figure on the site is transcribed
from the studio's own printed price list:

| Service | Rate | Full head |
|---|---|---|
| LA Weave | £15 per row | 3 rows · **£45** |
| Nano Ring | £1 per piece | 150 pieces · **£125** |
| Micro Ring | £1 per piece | 150 pieces · **£125** |
| Mini-Tip | £1 per piece | 150 pieces · **£125** |
| Tape Hair Extensions | £25 per pack | 2 packs · **£50** |
| Extensions take-out | — | £10 |
| Kim Kardashian braid | — | £20 |

Two things worth knowing about how this is modelled:

- **The full-head rate is stored, not computed.** 150 pieces at £1 is
  £150, but the list prints £125. That is a real bundled rate, so
  `fullHead` sits alongside `unit` rather than being derived from it, and
  the calculator shows the difference as a saving.
- **No maintenance price is invented.** The list does not publish one, so
  the site says move-ups are quoted at the consultation rather than
  showing a plausible-looking guess. The old first-year projection is
  gone with it.

What the list does *not* say is whether the hair itself is included, so
neither does the site. If it should, add it to `PRICE_NOTE`.

**Sew-in Weave was removed** — it is not on the price list. Mini-Tip took
its place. Textured hair now routes to the LA Weave in the match finder,
which genuinely suits it.

### 2. Reviews — **done**

`REVIEWS_VERIFIED` is `true`. Three real client messages, quoted verbatim,
supplied by the client:

| Who | Where from | Published |
|---|---|---|
| Emily M. | Instagram message | 23 Mar 2024 |
| Jade | WhatsApp message | 21 Mar 2024 |
| *name withheld* | WhatsApp message | 21 Mar 2024 |

Three decisions worth knowing about:

- **`rating` is nullable.** These are messages, not platform reviews, and
  none carried a star rating. The type used to require a 1–5, which would
  have forced an invented five stars onto all three. The wall shows a
  quote mark instead of stars, and hides the rating breakdown and the
  rating filter entirely rather than rendering empty ones.
- **Names are reduced** to a first name, or a first name and initial —
  the convention review platforms use, and the least exposure consistent
  with the quote meaning anything. One screenshot carried no name, so
  that card says so. A test enforces the format.
- **They stay out of the JSON-LD.** Self-published testimonials without
  ratings do not earn a rich result and do invite a manual penalty. The
  Treatwell aggregate does that job.

The **4.9 from 82** headline is unchanged: real, third-party, and linked.

### 3. Photography — `src/lib/annie-photos.ts`

**Every slot is filled** with Annie's own photographs, supplied by the
client from her Instagram and prepared for the web here. 

Every image position is a named slot. A slot with an entry in `PHOTOS`
renders the photograph; a slot without one renders a `PhotoFrame` — a gold
frame stating what belongs there. So the site never shows a broken image
and never shows a stock picture of somebody else's work.

Adding the rest is two lines each:

```bash
cp annie-portrait.jpg public/annie/
```

```ts
"annie-portrait": {
  src: "/annie/annie-portrait.jpg",
  alt: "Annie at the styling chair in the studio.",
},
```

The frame keeps its ratio so the page does not move, the brief disappears,
and the gallery's counter goes up.

#### The six slots that were never going to be filled

Five `method-*` slots wanted a macro shot of each bond, and
`detail-bond` wanted the same thing again. The client cannot get them,
and they are the one thing no photograph of a finished head can show —
which is rather the point of a good fitting.

So they were **removed and replaced by `<BondViewer>`**: a zoomable,
drawn illustration of a head that goes from whole head down to a single
bond at the root, with a different bond per method. It sits in each
method's section on the services page and once more on the gallery.

It is drawn roughly to scale — the hair mass is 192 units across for a
head of about 150mm, so a nano ring is drawn at 3 units because a nano
ring is about 3mm. At 1× it is a speck, which is the honest answer to
"will anyone see it?". A scale bar inside the SVG reads 47mm at 1× and
2.6mm at 18×, and it is drawn outside the scaled group so its length is
fixed and only its label changes.

Two layers cross-fade as you zoom: the painted head fades out and a
macro view of scalp and individual hairs fades in, because magnifying a
painted hair mass just gives you a bigger painted hair mass. The viewBox
never moves — a group is scaled around the bond, so the browser can run
it on the compositor rather than repainting every frame.

It says "Illustration" on it. It is not presented as a photograph.

There is **no photograph of Annie**, and the client confirmed none exists,
so the `annie-portrait` slot was removed rather than left as a frame that
can never be filled. The About page leads with the shopfront instead —
the sign says most of what a portrait would have.

#### What the photographs are allowed to claim

This matters more than it sounds. Annie's posts record the colour and show
the before and after; they do **not** record which method was fitted, how
many inches, or half head against full head. So nothing on the site says
so either.

The transformation slots are therefore named by colour (`blonde-before`,
`copper-after`) rather than by method, and the visible labels went from
invented specifics like *"Nano rings, 20 inch, full head"* to what the two
frames actually show: *"Blonde — length and volume"*. The five `method-*`
slots stay empty for the same reason — a photograph of a finished head is
not a photograph of a nano bond, and filing it under one would be a claim
the image does not support.

#### How they were prepared

The originals were phone screenshots of Instagram and two `.mp4` posts.
For each: the Instagram chrome was cropped off, the side-by-side composites
were split at the gutter into separate before and after frames, the best
frames were picked out of the videos, and everything was cropped to a
common 2:3, resized and saved as progressive JPEG. Twenty images come to about 1.8 MB in total.

Instagram's own overlays — the video timer, the mute badge — were cropped
out. Annie's own watermarks were kept.

## What is actually built

| Feature | Where | Notes |
|---|---|---|
| Hair match finder | `/annie/hair-match` | Seven questions, scores all five methods 0–100, explains every result and names what it rules out |
| Price calculator | `/annie/services#prices` | The studio's real rates: pick a method and an amount, see the price and how it compares |
| Before/after sliders | `/annie/gallery`, home | A real `<input type="range">` — keyboard, touch and screen-reader operable |
| Review wall | `/annie/reviews` | Rating breakdown, filter by stars and by method |
| Enquiry builder | `/annie/book` | Validates, saves a draft, and composes a finished WhatsApp / SMS / email message |
| Structured data | everywhere | `HairSalon` with real NAP, hours and services; `FAQPage`; `BreadcrumbList` |
| Photo manifest | `src/lib/annie-photos.ts` | 20 named slots, all filled with Annie's own work |
| Bond viewer | `src/components/annie/bond-viewer.tsx` | A head you can zoom into, 1× to 24×, showing each method's bond at the root, roughly to scale |
| Live motion | `src/components/annie/motion.tsx` | Custom cursor, magnetic CTAs, word reveals, parallax, scroll progress, petals |

### The logic, and its tests

All the decision-making is pure TypeScript with no React in it, tested with
`node --test`. **119 tests** cover this site.

```
src/lib/annie-salon.ts       Business facts, opening-hours logic   (17 tests)
src/lib/annie-methods.ts     The five methods                      —
src/lib/annie-hair-match.ts  Recommendation scoring                (19 tests)
src/lib/annie-pricing.ts     Price calculator, from the real list  (23 tests)
src/lib/annie-reviews.ts     Aggregation and filtering             (27 tests)
src/lib/annie-booking.ts     Validation and message composition    (33 tests)
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
npm run test         # 245 tests, 119 of them this site's
npm run typecheck
npm run build
npm run build:pages  # static export
```

`npm run lint` is broken on this repo and was already: `next lint` was
removed in Next.js 16. CI does not run it.
