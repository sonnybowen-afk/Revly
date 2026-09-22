# Revly

An all-in-one revision hub for UK GCSE and A-Level students. Built around the
two techniques the evidence actually supports — **active recall** and **spaced
repetition** — rather than around content volume.

## What's in it

| Area | Route | State |
|---|---|---|
| Landing page | `/` | Complete |
| Revision hub + resource browser | `/revision` | Complete; 22 curated resources, filterable |
| Flashcards (SM-2 scheduler) | `/revision/flashcards` | Fully functional |
| Create a deck | `/revision/flashcards/new` | Write / from notes / import |
| Revision timetable builder | `/timetable` | Fully functional |
| Tutoring | `/tutoring` | Structure complete; pricing and policies are placeholders |
| UCAS guidance + tuition | `/ucas` | Complete; verify dates each cycle |
| Statement checker | `/ucas/review` | Fully functional |
| Pricing | `/pricing` | Shopfront only — no payments wired |
| NEA & coursework | `/nea` | Complete |

## Also in this repository

**[Annie's Secret Hair Extension](README-annie.md)** — a second, separate
site served from `/annie`, for a hair extension studio in Manchester. It
shares this app's build and deploy pipeline but has its own root chrome,
palette, typography and motion. See [README-annie.md](README-annie.md) for
what still needs Annie's real prices, reviews and photographs before it
goes live.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checks as part of the build) |
| `npm run start` | Serve the production build |
| `npm run test` | Scheduler and timetable unit tests |
| `npm run typecheck` | Types only, no build |

Requires Node 22+ (the test runner uses native TypeScript type stripping).

## Architecture

```
src/
  app/                     App Router pages, one folder per route
  components/
    ui/                    Primitives: button, badge, section, page furniture
    landing/               Landing-page sections
    flashcards/            Review session, deck list, forecast chart
    timetable/             Timetable builder
    tutoring/              Enquiry form
  lib/
    srs.ts                 Spaced-repetition scheduler  ← core logic
    srs.test.ts            21 tests
    timetable.ts           Timetable allocation + layout ← core logic
    timetable.test.ts      21 tests
    cards-io.ts            Import parsers (Anki / Quizlet / ChatGPT / CSV)
    cards-io.test.ts       18 tests
    notes-to-cards.ts      Notes -> flashcard extraction
    notes-to-cards.test.ts 17 tests
    resources.ts           Curated resource library + filtering
    resources.test.ts      14 tests
    pricing.ts             Plans and UCAS products
    pricing.test.ts        10 tests
    statement-review.ts    UCAS personal statement checker
    statement-review.test.ts  19 tests
    user-decks.ts          Learner-created deck model
    user-decks.test.ts     9 tests
    decks.ts               Seed card content
    storage.ts             Versioned, SSR-safe localStorage
```

### The scheduler (`src/lib/srs.ts`)

An SM-2 derivative with Anki-style learning steps. Every function is pure —
it takes a card and a grade and returns a new card, reading neither the clock
nor storage on its own, which is what makes it testable and deterministic.

- Four phases: `new → learning → review`, with `relearning` after a lapse
- Learning ladder of 1 min and 10 min before a card graduates to 1 day
- Ease factor starts at 2.5, floors at 1.3, and only moves on non-`good` grades
- A lapse retains half the interval rather than resetting to day one
- Intervals are fuzzed ±5% so a deck studied in one sitting doesn't come back
  as a single wall
- Cards still in a learning step reappear within the same session
  (20-minute learn-ahead window, as Anki does)

Interval previews on the grade buttons run the real scheduler with fuzz
disabled, so what the button promises is what actually happens.

### The timetable (`src/lib/timetable.ts`)

Weights each subject by confidence (1–5) and exam proximity, apportions the
week's slots by largest-remainder so no slot is lost to rounding, then lays
them out avoiding back-to-back repeats of the same subject (interleaving).
Same inputs always produce the same timetable.

### Creating decks (`/revision/flashcards/new`)

Three routes in, all converging on the same editable table so nothing is
saved without review:

**Write your own** — a plain card editor.

**From your notes** — pastes notes and extracts cards from their
*structure*: `Term: definition` lines, headings followed by bullets, and
any `Q:`/`A:` pairs already written.

> This is a deterministic extractor, **not a language model**, and the UI
> says so plainly. Revly is a static site with no server; calling an LLM
> from the browser would mean publishing an API key in the page source.
> The trade is a fair one — it is instant, free, works offline and nothing
> leaves the browser — but it cannot paraphrase or invent a question the
> notes do not already imply, so it produces drafts you edit.
>
> `generateCards(notes)` in `src/lib/notes-to-cards.ts` is the seam. Put a
> real model behind a server route with the same signature and no caller
> changes.

**Import** — auto-detects the format:

| Source | Handled |
|---|---|
| Anki | Plain-text export, including `#separator` / `#tags column` directives, tags and HTML fields |
| Quizlet | Tab default, plus configurable field/record separators for custom exports |
| ChatGPT | Markdown tables and `Q:`/`A:` prose, with markdown emphasis stripped |
| Generic | CSV with quoted fields, TSV, semicolon, blank-line-separated pairs |

Anki `.apkg` files are zipped SQLite databases and cannot be read in the
browser — the UI says to use Anki's plain-text export instead.

### Resource library (`src/lib/resources.ts`)

22 entries tagged by board, subject, level, type and cost, so a learner
goes from "I sit AQA GCSE Biology" to a short list rather than a search
page. Official board sources always rank first, then free before paid.
Board-agnostic entries survive a board filter.

Rules enforced by tests: https only, no affiliate or tracking parameters,
every entry carries a one-line reason it earned its place, and every board
has an official past-paper source.

**Links have not been verified from this machine** (the build environment
blocks outbound requests to most hosts). Check them before launch.

## Pricing model

One decision worth knowing about, because it was a judgement call rather
than a spec: **the free tier has no lives, hearts or daily review cap.**

Lives work in Duolingo because running out costs a *streak*. Here it
would cost a student revision time in the weeks before an exam, and the
people who hit the wall first are the ones who cannot pay. Gating the
spaced-repetition scheduler — the one component with evidence behind it
— would make the product worse at its stated job.

So reviewing is free and uncapped forever. What is charged for is scale
(unlimited decks, imports, sync), analysis, and human time.

| Plan | Price | What it adds |
|---|---|---|
| Free | £0 | Full scheduler, all seed decks, 3 own decks, timetable, all guidance |
| Plus | £6/mo or £48/yr | Unlimited decks and imports, sync, retention analytics, adaptive timetable |
| Family | £10/mo or £84/yr | Plus for four students, optional parent summary |

UCAS support is priced separately — a subscription suits weekly revision,
not an application you submit once: course £39 one-off, human statement
review £49 one-off, UCAS tutor from £30/hour.

**No payments are wired up.** There are no accounts and no payment
processor, so every limit is presentational. Enforcing them needs auth,
a database and a provider such as Stripe.

## Statement checker (`src/lib/statement-review.ts`)

Checks a UCAS personal statement against the 2026-entry format (three
questions, 4,000 characters total, 350 minimum each) and the faults that
reliably cost marks:

- Named university — disqualifying, since one statement goes to all five
- Cliché or quotation openings
- Claims of interest with no evidence behind them
- Activities listed with no reflection drawn from them
- Question 3 answering "what" but not "why"
- Run-on sentences, "I"-heavy openings, intensifier spam

Every finding states the problem, why an admissions tutor reacts to it,
and a concrete fix. Same constraint as the notes converter: rules, not a
language model. That matters less here than you would expect — most of
what separates a weak statement from a strong one is structural. What it
cannot judge is whether the argument is *interesting*, and the UI says so.

The university regex is deliberately case-sensitive on proper nouns
(lowercasing it would flag "I want to go to university") and guards
"Cambridge" against the exam-board sense.

## Design system

Tokens live in `src/app/globals.css`. Components consume **semantic** tokens
(`--primary`, `--card`, `--muted-foreground`) and never raw hex.

- Foundation: Swiss minimalism with a bento grid for the hub
- Primary indigo, teal study accent, emerald progress, amber for attention
- Light and dark are designed as a pair, not an inversion — each has its own
  token block, and the theme toggle offers light / dark / system
- Chart colours are validated separately per surface for lightness band,
  chroma and 3:1 contrast

Accessibility is built in rather than retrofitted: visible focus rings
everywhere, 44px minimum touch targets, conditionally rendered answers,
`prefers-reduced-motion` honoured globally, a skip link, an error summary with
focus management on the enquiry form, and a table alternative for the chart.

## Data and privacy

All progress is stored in the visitor's own browser via `localStorage` under
the `revly:v1:` prefix. Nothing is sent to a server, so there is currently no
account system, no cookie banner requirement for analytics you haven't added,
and no personal data to process.

Moving to cross-device sync means adding a backend and, at that point, a
privacy policy and a lawful basis for processing — note that many users will
be under 16.

## Deployment

The site builds to a **fully static export** — every route is prerendered and
the flashcard scheduler and timetable run entirely client-side, so there is no
server to host and no running cost.

```bash
npm run build:pages    # static export -> out/
```

### GitHub Pages (configured)

`.github/workflows/deploy.yml` builds and deploys on every push to `main` or
the current working branch. It runs the unit tests first, so a broken
scheduler cannot reach production.

**One manual step is required before the first deploy:**

> Repository **Settings → Pages → Build and deployment → Source: GitHub
> Actions**

Nothing deploys until that is set — it cannot be enabled from a workflow. Once
it is, push or re-run the workflow and the site goes live at
`https://<owner>.github.io/Revly/`.

The base path comes from `actions/configure-pages`, so attaching a custom
domain later needs no code change: add the domain in Pages settings and the
next build picks up the empty base path automatically.

### Deploying elsewhere

Any static host works — Netlify, Cloudflare Pages, S3. Build with
`DEPLOY_TARGET=github-pages NEXT_PUBLIC_BASE_PATH="" npm run build:pages` and
publish `out/`.

For Vercel, deploy the repository as a normal Next.js project and ignore the
export config entirely — `DEPLOY_TARGET` stays unset there.

## Before you launch

- [ ] Replace the placeholder testimonials in `src/components/landing/testimonials.tsx`, or delete the section
- [ ] Confirm cancellation terms and VAT treatment on `/tutoring` (the £25 rate floor is set in `MINIMUM_HOURLY_RATE`)
- [ ] Write the safeguarding and DBS content — this is a legal obligation, not copy
- [ ] Wire the enquiry form to a real backend or form service
- [ ] Verify UCAS dates for the current cycle
- [ ] Add your curated third-party resources to `src/app/revision/page.tsx`
- [ ] Set the production domain in `metadataBase` in `src/app/layout.tsx`
