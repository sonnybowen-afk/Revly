# Revly

An all-in-one revision hub for UK GCSE and A-Level students. Built around the
two techniques the evidence actually supports — **active recall** and **spaced
repetition** — rather than around content volume.

## What's in it

| Area | Route | State |
|---|---|---|
| Landing page | `/` | Complete |
| Revision hub + resources | `/revision` | Complete; third-party resource list to be curated |
| Flashcards (SM-2 scheduler) | `/revision/flashcards` | Fully functional |
| Revision timetable builder | `/timetable` | Fully functional |
| Tutoring | `/tutoring` | Structure complete; pricing and policies are placeholders |
| UCAS guidance | `/ucas` | Complete; verify dates each cycle |
| NEA & coursework | `/nea` | Complete |

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

## Before you launch

- [ ] Replace the placeholder testimonials in `src/components/landing/testimonials.tsx`, or delete the section
- [ ] Set real pricing and policies in `src/app/tutoring/page.tsx`
- [ ] Write the safeguarding and DBS content — this is a legal obligation, not copy
- [ ] Wire the enquiry form to a real backend or form service
- [ ] Verify UCAS dates for the current cycle
- [ ] Add your curated third-party resources to `src/app/revision/page.tsx`
- [ ] Set the production domain in `metadataBase` in `src/app/layout.tsx`
