/**
 * Revision timetable generator.
 *
 * Allocates a fixed number of weekly study slots across subjects, then lays
 * them out so the week is actually workable. Two evidence-led constraints
 * shape the output:
 *
 *   Interleaving — alternating subjects beats blocking one subject into a
 *   single long session, so the layout avoids running the same subject twice
 *   in a row wherever the allocation allows.
 *
 *   Spacing — subjects are spread across days rather than clustered, so the
 *   gap between encounters does the work.
 *
 * Everything here is pure and deterministic: same inputs, same timetable.
 */

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayName = (typeof DAYS)[number];

export interface SubjectInput {
  id: string;
  name: string;
  /** 1 = very shaky, 5 = solid. Lower confidence earns more slots. */
  confidence: number;
  /** ISO date (yyyy-mm-dd) of the exam, or "" if unknown. */
  examDate: string;
}

export interface Availability {
  /** Slots the learner can realistically do, per day of the week. */
  slotsPerDay: Record<DayName, number>;
}

export interface ScheduledSlot {
  day: DayName;
  index: number;
  subjectId: string;
  subjectName: string;
}

export interface TimetableResult {
  slots: ScheduledSlot[];
  /** Slots awarded per subject, keyed by subject id. */
  allocation: Record<string, number>;
  totalSlots: number;
  warnings: string[];
}

/**
 * Weight a subject by how shaky it is and how soon the exam is.
 *
 * Confidence contributes linearly (a 1 is worth five times a 5). Urgency is
 * a bounded decay rather than 1/days, so an exam tomorrow doesn't swallow
 * the entire week and an exam six months out doesn't fall to zero.
 */
export function subjectWeight(
  subject: SubjectInput,
  now: number = Date.now(),
): number {
  const confidenceWeight = Math.max(1, 6 - clamp(subject.confidence, 1, 5));

  let urgency = 1;
  if (subject.examDate) {
    const exam = new Date(`${subject.examDate}T00:00:00`).getTime();
    if (!Number.isNaN(exam)) {
      const days = (exam - now) / 86_400_000;
      if (days <= 0) {
        urgency = 0; // exam has passed — drop it out of the rotation
      } else {
        // 1.0 at ~120+ days out, rising toward 2.5 as the exam approaches.
        urgency = 1 + 1.5 * Math.min(1, Math.max(0, (120 - days) / 120));
      }
    }
  }

  return confidenceWeight * urgency;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Largest-remainder apportionment. Distributes `total` whole slots in
 * proportion to the weights without drift or a lost final slot.
 */
export function apportion(
  weights: Record<string, number>,
  total: number,
): Record<string, number> {
  const ids = Object.keys(weights);
  const sum = ids.reduce((s, id) => s + weights[id], 0);
  const result: Record<string, number> = {};

  if (total <= 0 || sum <= 0) {
    for (const id of ids) result[id] = 0;
    return result;
  }

  const exact: { id: string; whole: number; remainder: number }[] = ids.map(
    (id) => {
      const share = (weights[id] / sum) * total;
      const whole = Math.floor(share);
      return { id, whole, remainder: share - whole };
    },
  );

  let assigned = 0;
  for (const e of exact) {
    result[e.id] = e.whole;
    assigned += e.whole;
  }

  // Hand out what rounding left over, largest remainder first. Ties break on
  // id so the result stays deterministic.
  const leftover = total - assigned;
  exact
    .sort((a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id))
    .slice(0, leftover)
    .forEach((e) => {
      result[e.id] += 1;
    });

  return result;
}

/**
 * Lay allocated slots out across the week.
 *
 * Walks the week slot by slot and each time picks the subject with the most
 * remaining slots, skipping whichever subject filled the previous slot so
 * sessions interleave. If the only candidate left is the previous subject,
 * it repeats rather than leaving the slot empty.
 */
function layout(
  allocation: Record<string, number>,
  names: Record<string, string>,
  availability: Availability,
): ScheduledSlot[] {
  const remaining = { ...allocation };
  const slots: ScheduledSlot[] = [];
  let previous: string | null = null;

  for (const day of DAYS) {
    const count = Math.max(0, Math.floor(availability.slotsPerDay[day] ?? 0));
    for (let index = 0; index < count; index += 1) {
      const candidates = Object.keys(remaining).filter(
        (id) => remaining[id] > 0,
      );
      if (candidates.length === 0) return slots;

      const notPrevious = candidates.filter((id) => id !== previous);
      const pool = notPrevious.length > 0 ? notPrevious : candidates;

      // Most remaining work first; deterministic tie-break on id.
      pool.sort((a, b) => remaining[b] - remaining[a] || a.localeCompare(b));
      const chosen = pool[0];

      remaining[chosen] -= 1;
      previous = chosen;
      slots.push({
        day,
        index,
        subjectId: chosen,
        subjectName: names[chosen],
      });
    }
  }

  return slots;
}

export function generateTimetable(
  subjects: SubjectInput[],
  availability: Availability,
  now: number = Date.now(),
): TimetableResult {
  const warnings: string[] = [];

  const totalSlots = DAYS.reduce(
    (sum, day) => sum + Math.max(0, Math.floor(availability.slotsPerDay[day] ?? 0)),
    0,
  );

  const active = subjects.filter((s) => s.name.trim().length > 0);

  if (active.length === 0) {
    return { slots: [], allocation: {}, totalSlots, warnings: ["Add at least one subject."] };
  }
  if (totalSlots === 0) {
    return {
      slots: [],
      allocation: {},
      totalSlots,
      warnings: ["Set how many sessions you can do on at least one day."],
    };
  }

  const weights: Record<string, number> = {};
  const names: Record<string, string> = {};
  for (const subject of active) {
    weights[subject.id] = subjectWeight(subject, now);
    names[subject.id] = subject.name.trim();
  }

  const past = active.filter((s) => weights[s.id] === 0);
  if (past.length > 0) {
    warnings.push(
      `${past.map((s) => s.name.trim()).join(", ")} ${past.length === 1 ? "has" : "have"} an exam date in the past and ${past.length === 1 ? "was" : "were"} left out.`,
    );
  }

  const live = Object.fromEntries(
    Object.entries(weights).filter(([, w]) => w > 0),
  );
  if (Object.keys(live).length === 0) {
    return {
      slots: [],
      allocation: {},
      totalSlots,
      warnings: [...warnings, "Every exam date is in the past."],
    };
  }

  if (totalSlots < Object.keys(live).length) {
    warnings.push(
      `Only ${totalSlots} ${totalSlots === 1 ? "session" : "sessions"} a week for ${Object.keys(live).length} subjects — some will not appear. Add more availability if you can.`,
    );
  }

  const allocation = apportion(live, totalSlots);
  const slots = layout(allocation, names, availability);

  return { slots, allocation, totalSlots, warnings };
}

/** Group a flat slot list into day columns for rendering. */
export function byDay(slots: ScheduledSlot[]): Record<DayName, ScheduledSlot[]> {
  const grouped = {} as Record<DayName, ScheduledSlot[]>;
  for (const day of DAYS) grouped[day] = [];
  for (const slot of slots) grouped[slot.day].push(slot);
  return grouped;
}

export function daysUntil(examDate: string, now: number = Date.now()): number | null {
  if (!examDate) return null;
  const exam = new Date(`${examDate}T00:00:00`).getTime();
  if (Number.isNaN(exam)) return null;
  return Math.ceil((exam - now) / 86_400_000);
}
