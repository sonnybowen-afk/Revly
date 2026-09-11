import test from "node:test";
import assert from "node:assert/strict";

import {
  DAYS,
  apportion,
  byDay,
  daysUntil,
  generateTimetable,
  subjectWeight,
  type Availability,
  type DayName,
  type SubjectInput,
} from "./timetable.ts";

const NOW = new Date("2026-01-10T09:00:00Z").getTime();

function availability(perDay: Partial<Record<DayName, number>>): Availability {
  const slotsPerDay = Object.fromEntries(
    DAYS.map((d) => [d, perDay[d] ?? 0]),
  ) as Record<DayName, number>;
  return { slotsPerDay };
}

const evenWeek = availability({
  Monday: 2,
  Tuesday: 2,
  Wednesday: 2,
  Thursday: 2,
  Friday: 2,
  Saturday: 3,
  Sunday: 3,
});

function subject(
  id: string,
  confidence: number,
  examDate = "",
): SubjectInput {
  return { id, name: id.toUpperCase(), confidence, examDate };
}

test("lower confidence earns a heavier weight", () => {
  assert.ok(subjectWeight(subject("a", 1), NOW) > subjectWeight(subject("b", 5), NOW));
});

test("a nearer exam outranks a distant one at equal confidence", () => {
  const near = subjectWeight(subject("a", 3, "2026-02-01"), NOW);
  const far = subjectWeight(subject("b", 3, "2026-11-01"), NOW);
  assert.ok(near > far, `near=${near} far=${far}`);
});

test("a past exam date drops the subject out of the rotation", () => {
  assert.equal(subjectWeight(subject("a", 2, "2025-06-01"), NOW), 0);
});

test("apportion distributes every slot without drift", () => {
  const result = apportion({ a: 1, b: 1, c: 1 }, 10);
  assert.equal(Object.values(result).reduce((s, n) => s + n, 0), 10);
});

test("apportion tracks the weights proportionally", () => {
  const result = apportion({ a: 3, b: 1 }, 8);
  assert.deepEqual(result, { a: 6, b: 2 });
});

test("apportion is deterministic when remainders tie", () => {
  const a = apportion({ x: 1, y: 1, z: 1 }, 4);
  const b = apportion({ z: 1, y: 1, x: 1 }, 4);
  assert.deepEqual(a, b);
});

test("apportion handles zero total and zero weight safely", () => {
  assert.deepEqual(apportion({ a: 1 }, 0), { a: 0 });
  assert.deepEqual(apportion({ a: 0, b: 0 }, 5), { a: 0, b: 0 });
});

test("the timetable fills exactly the available slots", () => {
  const result = generateTimetable(
    [subject("maths", 2), subject("bio", 3), subject("chem", 4)],
    evenWeek,
    NOW,
  );
  assert.equal(result.totalSlots, 16);
  assert.equal(result.slots.length, 16);
});

test("allocation totals match the slots actually laid out", () => {
  const result = generateTimetable(
    [subject("maths", 1), subject("bio", 5), subject("chem", 3)],
    evenWeek,
    NOW,
  );
  const allocated = Object.values(result.allocation).reduce((s, n) => s + n, 0);
  assert.equal(allocated, result.slots.length);
});

test("the weakest subject gets the most sessions", () => {
  const result = generateTimetable(
    [subject("weak", 1), subject("mid", 3), subject("strong", 5)],
    evenWeek,
    NOW,
  );
  assert.ok(result.allocation.weak > result.allocation.mid);
  assert.ok(result.allocation.mid > result.allocation.strong);
});

test("subjects interleave rather than blocking back-to-back", () => {
  const result = generateTimetable(
    [subject("a", 3), subject("b", 3), subject("c", 3)],
    evenWeek,
    NOW,
  );
  let repeats = 0;
  for (let i = 1; i < result.slots.length; i += 1) {
    if (result.slots[i].subjectId === result.slots[i - 1].subjectId) repeats += 1;
  }
  assert.equal(repeats, 0, `expected no back-to-back repeats, found ${repeats}`);
});

test("a single subject still fills the week without stalling", () => {
  const result = generateTimetable([subject("solo", 2)], evenWeek, NOW);
  assert.equal(result.slots.length, 16);
  assert.ok(result.slots.every((s) => s.subjectId === "solo"));
});

test("slots land only on days with declared availability", () => {
  const result = generateTimetable(
    [subject("a", 3), subject("b", 2)],
    availability({ Monday: 2, Thursday: 1 }),
    NOW,
  );
  const days = new Set(result.slots.map((s) => s.day));
  assert.deepEqual([...days].sort(), ["Monday", "Thursday"]);
  assert.equal(result.slots.length, 3);
});

test("warns when there are fewer sessions than subjects", () => {
  const result = generateTimetable(
    [subject("a", 3), subject("b", 3), subject("c", 3)],
    availability({ Monday: 2 }),
    NOW,
  );
  assert.ok(result.warnings.some((w) => w.includes("some will not appear")));
});

test("warns and excludes subjects whose exam has passed", () => {
  const result = generateTimetable(
    [subject("live", 3, "2026-06-01"), subject("gone", 3, "2025-06-01")],
    evenWeek,
    NOW,
  );
  assert.ok(result.warnings.some((w) => w.includes("GONE")));
  assert.equal(result.allocation.gone, undefined);
  assert.ok(result.slots.every((s) => s.subjectId === "live"));
});

test("empty inputs produce guidance, not a crash", () => {
  assert.deepEqual(generateTimetable([], evenWeek, NOW).warnings, [
    "Add at least one subject.",
  ]);
  const noTime = generateTimetable([subject("a", 3)], availability({}), NOW);
  assert.equal(noTime.slots.length, 0);
  assert.ok(noTime.warnings[0].includes("sessions you can do"));
});

test("blank subject names are ignored", () => {
  const result = generateTimetable(
    [{ id: "a", name: "   ", confidence: 3, examDate: "" }],
    evenWeek,
    NOW,
  );
  assert.equal(result.slots.length, 0);
});

test("negative or fractional availability is floored to whole slots", () => {
  const result = generateTimetable(
    [subject("a", 3)],
    availability({ Monday: 2.7, Tuesday: -3 }),
    NOW,
  );
  assert.equal(result.slots.length, 2);
  assert.ok(result.slots.every((s) => s.day === "Monday"));
});

test("byDay buckets every slot and keeps all seven days present", () => {
  const result = generateTimetable([subject("a", 3), subject("b", 3)], evenWeek, NOW);
  const grouped = byDay(result.slots);
  assert.equal(Object.keys(grouped).length, 7);
  const total = DAYS.reduce((s, d) => s + grouped[d].length, 0);
  assert.equal(total, result.slots.length);
});

test("daysUntil counts forward and handles blanks", () => {
  assert.equal(daysUntil("", NOW), null);
  assert.equal(daysUntil("not-a-date", NOW), null);
  assert.equal(daysUntil("2026-01-20", NOW), 10);
});

test("the same inputs always produce the same timetable", () => {
  const subjects = [subject("a", 2, "2026-05-01"), subject("b", 4, "2026-06-01")];
  const first = generateTimetable(subjects, evenWeek, NOW);
  const second = generateTimetable(subjects, evenWeek, NOW);
  assert.deepEqual(first.slots, second.slots);
});
