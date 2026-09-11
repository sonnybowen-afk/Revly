/**
 * Curated revision resources.
 *
 * The web has thousands of these and most students never find the good
 * ones. The job here is filtering: every entry is tagged by exam board,
 * subject, level, type and cost, so a learner can go from "I sit AQA
 * GCSE Biology" to a short, relevant list rather than a search page.
 *
 * Honesty rules for this file:
 *   - `cost` is stated plainly. Nothing free-looking that is really a
 *     paywall.
 *   - `boards` lists boards a resource genuinely covers. "All" means the
 *     content is board-agnostic, not that it claims every spec.
 *   - No affiliate links, ever.
 */

export const BOARDS = [
  "AQA",
  "Edexcel",
  "OCR",
  "WJEC / Eduqas",
  "All boards",
] as const;

export const SUBJECTS = [
  "Maths",
  "Biology",
  "Chemistry",
  "Physics",
  "Combined Science",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Psychology",
  "Economics",
  "Languages",
  "All subjects",
] as const;

export const LEVELS = ["GCSE", "A-Level"] as const;

export const TYPES = [
  "Past papers",
  "Revision notes",
  "Video lessons",
  "Practice questions",
  "Flashcards",
  "Community",
] as const;

export type Board = (typeof BOARDS)[number];
export type Subject = (typeof SUBJECTS)[number];
export type Level = (typeof LEVELS)[number];
export type ResourceType = (typeof TYPES)[number];
export type Cost = "Free" | "Freemium" | "Paid";

export interface Resource {
  id: string;
  title: string;
  url: string;
  /** Who runs it — matters for judging reliability. */
  provider: string;
  type: ResourceType;
  boards: Board[];
  subjects: Subject[];
  levels: Level[];
  cost: Cost;
  description: string;
  /** Why this one is on the list at all. */
  why: string;
  /** Official exam-board source — ranked first, always. */
  official?: boolean;
}

export const RESOURCES: Resource[] = [
  // ── Official boards ──────────────────────────────────────────
  {
    id: "aqa-papers",
    title: "AQA past papers and mark schemes",
    url: "https://www.aqa.org.uk/find-past-papers-and-mark-schemes",
    provider: "AQA",
    type: "Past papers",
    boards: ["AQA"],
    subjects: ["All subjects"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    official: true,
    description:
      "Every available AQA paper, mark scheme and examiner report, by subject and series.",
    why: "The mark scheme tells you exactly how marks are awarded. Nothing second-hand beats it.",
  },
  {
    id: "edexcel-papers",
    title: "Pearson Edexcel past papers",
    url: "https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html",
    provider: "Pearson",
    type: "Past papers",
    boards: ["Edexcel"],
    subjects: ["All subjects"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    official: true,
    description:
      "Papers and mark schemes across Edexcel GCSE, International GCSE and A-Level.",
    why: "Check whether your spec is GCSE or IGCSE before downloading — the papers differ.",
  },
  {
    id: "ocr-papers",
    title: "OCR past paper finder",
    url: "https://www.ocr.org.uk/qualifications/past-paper-finder/",
    provider: "OCR",
    type: "Past papers",
    boards: ["OCR"],
    subjects: ["All subjects"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    official: true,
    description: "OCR papers, including the A and B specification variants.",
    why: "OCR runs two routes in several subjects. Confirm which one your school entered.",
  },
  {
    id: "eduqas-papers",
    title: "WJEC / Eduqas past papers",
    url: "https://www.eduqas.co.uk/home/past-papers/",
    provider: "WJEC",
    type: "Past papers",
    boards: ["WJEC / Eduqas"],
    subjects: ["All subjects"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    official: true,
    description:
      "Papers for Eduqas and WJEC specifications, used widely in Wales and England.",
    why: "WJEC and Eduqas are separate specs from the same body — pick the right one.",
  },

  // ── Cross-board notes and papers ─────────────────────────────
  {
    id: "pmt",
    title: "Physics & Maths Tutor",
    url: "https://www.physicsandmathstutor.com/",
    provider: "PMT Education",
    type: "Past papers",
    boards: ["AQA", "Edexcel", "OCR"],
    subjects: ["Maths", "Biology", "Chemistry", "Physics", "Economics", "Psychology"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    description:
      "Past papers sorted by topic as well as by year, plus condensed notes per specification.",
    why: "Topic-sorted questions are the fastest way to drill one weak area rather than whole papers.",
  },
  {
    id: "save-my-exams",
    title: "Save My Exams",
    url: "https://www.savemyexams.com/",
    provider: "Save My Exams",
    type: "Revision notes",
    boards: ["AQA", "Edexcel", "OCR"],
    subjects: ["Maths", "Biology", "Chemistry", "Physics", "Economics", "Psychology"],
    levels: ["GCSE", "A-Level"],
    cost: "Freemium",
    description:
      "Spec-matched revision notes and exam questions written by examiners.",
    why: "Genuinely spec-matched, which most note sites are not. Much of it sits behind a subscription.",
  },
  {
    id: "seneca",
    title: "Seneca Learning",
    url: "https://senecalearning.com/",
    provider: "Seneca",
    type: "Practice questions",
    boards: ["AQA", "Edexcel", "OCR"],
    subjects: ["All subjects"],
    levels: ["GCSE", "A-Level"],
    cost: "Freemium",
    description:
      "Interactive courses that quiz as you read, with spaced review built in.",
    why: "Its recall-first format is the right shape. Good for first passes over a topic.",
  },
  {
    id: "bitesize",
    title: "BBC Bitesize",
    url: "https://www.bbc.co.uk/bitesize",
    provider: "BBC",
    type: "Revision notes",
    boards: ["AQA", "Edexcel", "OCR", "WJEC / Eduqas"],
    subjects: ["All subjects"],
    levels: ["GCSE"],
    cost: "Free",
    description:
      "Short, readable topic pages with a quiz at the end, organised by board.",
    why: "Best starting point when a topic has not landed at all. Too shallow on its own for grades 8–9.",
  },

  // ── Maths ────────────────────────────────────────────────────
  {
    id: "corbett",
    title: "Corbettmaths",
    url: "https://corbettmaths.com/",
    provider: "Corbettmaths",
    type: "Practice questions",
    boards: ["All boards"],
    subjects: ["Maths"],
    levels: ["GCSE"],
    cost: "Free",
    description:
      "Practice sheets, worked answers and the 5-a-day drills, all by topic.",
    why: "The best free question bank for GCSE maths. Every sheet has full solutions.",
  },
  {
    id: "maths-genie",
    title: "Maths Genie",
    url: "https://www.mathsgenie.co.uk/",
    provider: "Maths Genie",
    type: "Practice questions",
    boards: ["All boards"],
    subjects: ["Maths"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    description:
      "Topic questions graded by target grade, with videos and model solutions.",
    why: "Grade-banded questions let you work at the boundary you are actually chasing.",
  },
  {
    id: "dr-frost",
    title: "Dr Frost Maths",
    url: "https://www.drfrost.org/",
    provider: "Dr Frost Learning",
    type: "Practice questions",
    boards: ["All boards"],
    subjects: ["Maths"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    description:
      "Free platform with tens of thousands of questions and instant marking.",
    why: "A registered charity, genuinely free, and it tracks which skills are weak.",
  },
  {
    id: "examsolutions",
    title: "ExamSolutions",
    url: "https://www.examsolutions.net/",
    provider: "ExamSolutions",
    type: "Video lessons",
    boards: ["AQA", "Edexcel", "OCR"],
    subjects: ["Maths"],
    levels: ["A-Level"],
    cost: "Free",
    description:
      "Worked video solutions to A-Level maths past paper questions, by topic.",
    why: "Watching a full worked method beats reading a mark scheme when you are stuck.",
  },

  // ── Sciences ─────────────────────────────────────────────────
  {
    id: "cognito",
    title: "Cognito",
    url: "https://cognitoedu.org/",
    provider: "Cognito",
    type: "Video lessons",
    boards: ["AQA", "Edexcel", "OCR"],
    subjects: ["Biology", "Chemistry", "Physics", "Combined Science", "Maths"],
    levels: ["GCSE"],
    cost: "Freemium",
    description:
      "Short animated videos covering GCSE science and maths, with questions after each.",
    why: "Tight, spec-focused videos. Good for a topic you can watch in one sitting.",
  },
  {
    id: "isaac-physics",
    title: "Isaac Physics",
    url: "https://isaacphysics.org/",
    provider: "University of Cambridge",
    type: "Practice questions",
    boards: ["All boards"],
    subjects: ["Physics", "Maths", "Chemistry"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    description:
      "Problem sets from Cambridge, harder than exam standard, with hints rather than answers.",
    why: "If you want A*/grade 9 physics, this is the step up past-papers alone will not give you.",
  },
  {
    id: "chemguide",
    title: "Chemguide",
    url: "https://www.chemguide.co.uk/",
    provider: "Jim Clark",
    type: "Revision notes",
    boards: ["All boards"],
    subjects: ["Chemistry"],
    levels: ["A-Level"],
    cost: "Free",
    description:
      "Long-standing explanatory notes covering A-Level chemistry mechanisms in depth.",
    why: "Explains *why*, not just what. The reference to reach for when a mechanism will not stick.",
  },

  // ── Humanities and other ─────────────────────────────────────
  {
    id: "mr-bruff",
    title: "Mr Bruff",
    url: "https://www.youtube.com/@mrbruff",
    provider: "Andrew Bruff",
    type: "Video lessons",
    boards: ["AQA", "Edexcel", "OCR"],
    subjects: ["English"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    description:
      "Text-by-text analysis videos for GCSE and A-Level English literature and language.",
    why: "Closest thing to a full English course on YouTube. Strong on how to structure an answer.",
  },
  {
    id: "craig-n-dave",
    title: "Craig 'n' Dave",
    url: "https://craigndave.org/",
    provider: "Craig 'n' Dave",
    type: "Video lessons",
    boards: ["AQA", "OCR"],
    subjects: ["Computer Science"],
    levels: ["GCSE", "A-Level"],
    cost: "Freemium",
    description:
      "Complete video coverage of the AQA and OCR computer science specifications.",
    why: "Mapped directly to spec points, so you can see what you have not covered.",
  },
  {
    id: "tutor2u",
    title: "tutor2u",
    url: "https://www.tutor2u.net/",
    provider: "tutor2u",
    type: "Revision notes",
    boards: ["AQA", "Edexcel", "OCR"],
    subjects: ["Economics", "Psychology", "Geography", "History"],
    levels: ["GCSE", "A-Level"],
    cost: "Freemium",
    description:
      "Topic notes, exam technique guides and study packs for the social sciences.",
    why: "Particularly strong on essay structure and evaluation marks in economics and psychology.",
  },
  {
    id: "national-archives",
    title: "The National Archives — Education",
    url: "https://www.nationalarchives.gov.uk/education/",
    provider: "The National Archives",
    type: "Revision notes",
    boards: ["All boards"],
    subjects: ["History"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    description:
      "Original source documents with transcripts and teaching context.",
    why: "Real primary sources — invaluable for NEA coursework and source-analysis questions.",
  },
  {
    id: "quizlet",
    title: "Quizlet",
    url: "https://quizlet.com/",
    provider: "Quizlet",
    type: "Flashcards",
    boards: ["All boards"],
    subjects: ["All subjects"],
    levels: ["GCSE", "A-Level"],
    cost: "Freemium",
    description: "Large library of shared flashcard sets across every subject.",
    why: "Useful for finding a starting set — export it and import it here for proper scheduling.",
  },
  {
    id: "anki",
    title: "Anki",
    url: "https://apps.ankiweb.net/",
    provider: "Anki",
    type: "Flashcards",
    boards: ["All boards"],
    subjects: ["All subjects"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    description:
      "The desktop spaced-repetition app this hub's scheduler is modelled on.",
    why: "If you already have Anki decks, export them as plain text and import them here.",
  },
  {
    id: "student-room",
    title: "The Student Room",
    url: "https://www.thestudentroom.co.uk/",
    provider: "The Student Room",
    type: "Community",
    boards: ["All boards"],
    subjects: ["All subjects"],
    levels: ["GCSE", "A-Level"],
    cost: "Free",
    description:
      "UK student forum covering exams, UCAS applications and university choices.",
    why: "Best for UCAS questions and course experiences. Treat exam predictions as noise.",
  },
];

export interface ResourceFilters {
  board?: Board | "any";
  subject?: Subject | "any";
  level?: Level | "any";
  type?: ResourceType | "any";
  cost?: Cost | "any";
}

/**
 * Filter and rank. "All boards" / "All subjects" entries always survive a
 * specific filter — a board-agnostic maths site is still relevant to an AQA
 * student. Official board sources rank first, then free over paid.
 */
export function filterResources(
  resources: Resource[],
  f: ResourceFilters,
): Resource[] {
  const matches = resources.filter((r) => {
    if (f.board && f.board !== "any") {
      if (!r.boards.includes(f.board) && !r.boards.includes("All boards")) {
        return false;
      }
    }
    if (f.subject && f.subject !== "any") {
      if (
        !r.subjects.includes(f.subject) &&
        !r.subjects.includes("All subjects")
      ) {
        return false;
      }
    }
    if (f.level && f.level !== "any" && !r.levels.includes(f.level)) {
      return false;
    }
    if (f.type && f.type !== "any" && r.type !== f.type) return false;
    if (f.cost && f.cost !== "any" && r.cost !== f.cost) return false;
    return true;
  });

  const costRank: Record<Cost, number> = { Free: 0, Freemium: 1, Paid: 2 };
  return matches.sort((a, b) => {
    if (!!b.official !== !!a.official) return b.official ? 1 : -1;
    if (costRank[a.cost] !== costRank[b.cost]) {
      return costRank[a.cost] - costRank[b.cost];
    }
    return a.title.localeCompare(b.title);
  });
}

/** Count per option so the UI can grey out filters that lead nowhere. */
export function countFor(
  resources: Resource[],
  base: ResourceFilters,
  key: keyof ResourceFilters,
  value: string,
): number {
  return filterResources(resources, { ...base, [key]: value }).length;
}
