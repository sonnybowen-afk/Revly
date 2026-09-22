# Annie's Secret Hair Extension

The salon's website. A static Next.js site, deployed to GitHub Pages.

- **Studio** — Arndale Market, Manchester M4 3AH
- **Phone** — 07428 132392
- **Hours** — Monday to Friday, 11am–6pm. Walk in; appointment not necessary.
- **Rated** — 4.9 from 82 reviews on Treatwell

```bash
npm install
npm run dev          # http://localhost:3000
npm run test         # 116 tests
npm run typecheck
npm run build
npm run build:pages  # static export into out/
```

Requires Node 22+ — the test runner uses native TypeScript type stripping.

## Putting it on anniesecrethairextension.co.uk

**Nothing is live on the domain yet, and nothing here changes that on its
own.** Annie's existing site keeps serving until somebody changes the DNS.
Do these in order.

### 1. Point the DNS at GitHub

At whoever the domain is registered with, for the apex
`anniesecrethairextension.co.uk`, four `A` records:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

And for `www`, one `CNAME` record pointing at `sonnybowen-afk.github.io`.

Optionally add `AAAA` records for IPv6:

```
2606:50c0:8000::153   2606:50c0:8001::153
2606:50c0:8002::153   2606:50c0:8003::153
```

> Check these against GitHub's current documentation before entering them
> — the addresses are stable but not permanent, and a stale IP here is a
> dead website.

**The moment these propagate, the old site stops answering on that
address.** Give it up to 24 hours, though it is usually much quicker.

### 2. Flip the switch in this repo

Settings → Secrets and variables → Actions → **Variables** → New variable:

```
Name   CUSTOM_DOMAIN
Value  anniesecrethairextension.co.uk
```

Then re-run the deploy workflow. It writes a `CNAME` file into the
build, which is what tells Pages to serve the domain.

It is a variable rather than a committed file on purpose: a `CNAME` in
the artifact makes `github.io` redirect to the custom domain, so if it
were committed now the preview URL would break and the real domain would
not work yet either — the site would be reachable at neither address.

### 3. Turn on HTTPS

Settings → Pages → tick **Enforce HTTPS** once the certificate has been
issued. That can take an hour or so after DNS propagates.

Nothing in the code needs editing for any of this. `configure-pages`
reports the base path, which becomes empty on a custom domain, and
`next.config.ts` and `assetPath()` follow it.

## Where the content came from

Every figure, quote and photograph on this site is the salon's own.

### Prices — `src/lib/methods.ts`

Transcribed from the studio's printed price list.

| Service | Rate | Full head |
|---|---|---|
| LA Weave | £15 per row | 3 rows · **£45** |
| Nano Ring | £1 per piece | 150 pieces · **£125** |
| Micro Ring | £1 per piece | 150 pieces · **£125** |
| Mini-Tip | £1 per piece | 150 pieces · **£125** |
| Tape Hair Extensions | £25 per pack | 2 packs · **£50** |
| Extensions take-out | — | £10 |
| Kim Kardashian braid | — | £20 |

The full-head rate is **stored, not computed**. 150 pieces at £1 is £150
but the list prints £125, so `fullHead` sits beside `unit` rather than
being derived, and the calculator shows the difference as a saving.

**No maintenance price is invented.** The list does not publish one, so
the site says move-ups are quoted at the consultation rather than
showing a plausible guess.

What the list does not say is whether the hair itself is included, so
neither does the site. If it should, say so in `PRICE_NOTE`.

### Reviews — `src/lib/reviews.ts`

The **4.9 from 82** aggregate is real, from Treatwell, and linked
wherever it appears.

Three client messages are quoted verbatim — from Emily M., Jade, and one
whose screenshot carried no name. `rating` is nullable because these are
messages, not platform reviews, and none carried a star rating: the wall
shows a quote mark instead of stars and hides the rating filter rather
than inventing five stars. Names are cut to a first name at most.

They are deliberately **kept out of the JSON-LD** — self-published
testimonials without ratings earn no rich result and invite a manual
penalty. The Treatwell aggregate does that job.

### Photographs — `src/lib/photos.ts`

Twenty slots, all filled, from the salon's own Instagram. Prepared for
the web: Instagram chrome cropped off, side-by-side composites split at
the gutter, video frames chosen where both halves show the whole head,
everything normalised to 2:3.

Her posts record the colour and show the before and after. They do
**not** record which method was fitted, or how many inches. So neither
does the site: the transformation slots are named by colour, and labels
say what the two frames show ("Blonde — length and volume") rather than
an invented specification.

Adding one is a file in `public/photos/` and a line in the manifest:

```ts
"detail-bond": {
  src: "/photos/detail-bond.jpg",
  alt: "A nano ring at the root, close enough to show the scale.",
},
```

A slot with no entry renders a gold frame saying what belongs there, so
the site never shows a broken image.

### The bond viewer — `src/components/bond-viewer.tsx`

The one thing no photograph shows is the bond itself — a good fitting
hides it. Rather than hold five macro-shot slots open indefinitely, it is
drawn: a head you zoom into, 1× to 24×, with a different bond per method.

Roughly to scale — a nano ring is drawn at 3mm because a nano ring is
about 3mm — with a scale bar reading 47mm at 1× and 2.6mm at 18×. It is
labelled "Illustration" and is never presented as a photograph.

## Design

Warm ivory, antique gold and blush, with deliberately almost no black.
Playfair Display, Inter and JetBrains Mono.

Bright gold on cream is unreadable, so there are **two golds**:
`--primary` (`#856610`) is dark enough to be *text*; `--gold-bright` is
for fills and gradients only. Every pair was computed rather than
eyeballed and the numbers are in the header of `globals.css`. The worst
pair on the site is 3.0:1 against a 3:1 threshold.

**axe reports zero violations across all nine pages at 390px and 1440px.**

### Motion

Live rather than reveal-once: custom cursor, magnetic CTAs, word-by-word
heading reveals, scroll-linked parallax, a progress hairline and falling
petals, in `src/components/motion.tsx`.

Four rules hold it together — transform and opacity only, one
`requestAnimationFrame` at a time, passive listeners throughout, and it
all switches off under `prefers-reduced-motion`, with the pointer effects
additionally gated on a fine pointer so a phone never pays for a cursor
it has not got.

The native cursor is hidden by a class `CustomCursor` adds *after it
mounts*, never from the stylesheet, so a failed script leaves an ordinary
cursor rather than none.

## The logic, and its tests

All the decision-making is pure TypeScript with no React in it — same
input, same output, no clock and no storage. **116 tests.**

```
src/lib/salon.ts       Business facts, opening-hours logic
src/lib/methods.ts     The five methods and the price list
src/lib/hair-match.ts  Recommendation scoring
src/lib/pricing.ts     Price calculator, from the real list
src/lib/reviews.ts     Aggregation and filtering
src/lib/booking.ts     Validation and message composition
src/lib/photos.ts      The photo manifest
src/lib/asset.ts       Base-path prefixing for <img> src
```

`openState()` takes a `Date` rather than reading one, which is what lets
the "Open until 6pm" badge be tested at all.

### A trap worth knowing about

`assetPath()` exists because Next prefixes `basePath` onto its own
bundles and onto `next/link` hrefs, but **not** onto a hand-written `src`
on a plain `<img>`. On a project site everything is served under
`/<repo>`, so `src="/photos/hero.jpg"` 404s while the file sits at
`/<repo>/photos/hero.jpg`.

It looks perfect in development, where there is no base path at all. If
you add an image anywhere, run it through `assetPath()`.

## Still worth adding

- **The method behind each before/after.** The labels are honest but
  vague because the source posts do not say. One line each once known.
- **More testimonials** as they come in — same shape, `rating: null` for
  a message.
- **Six photographs**, if they ever become possible: a bond at the root,
  a colour match in daylight, and one bond shot per method. Their slots
  are gone, but the bond viewer would happily sit beside real macro
  shots rather than instead of them.
