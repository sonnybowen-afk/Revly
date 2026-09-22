import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  ADDRESS_ONE_LINE,
  MAPS_URL,
  RATING,
  SALON,
  hoursForDay,
  openState,
} from "./salon.ts";

/** Local time, so the assertions read the way the sign on the door does. */
const at = (day: number, hour: number, minute = 0) => {
  // 2026-09-21 is a Monday, so day 1 = that Monday.
  const date = new Date(2026, 8, 20 + day, hour, minute, 0, 0);
  assert.equal(date.getDay(), day % 7, "fixture landed on the wrong weekday");
  return date;
};

describe("opening hours data", () => {
  it("covers all seven days starting on Monday", () => {
    assert.equal(SALON.hours.length, 7);
    assert.equal(SALON.hours[0].day, "Monday");
    assert.equal(SALON.hours[6].day, "Sunday");
  });

  it("opens Monday to Friday and closes at the weekend", () => {
    const open = SALON.hours.filter((d) => d.opens !== null).map((d) => d.short);
    assert.deepEqual(open, ["Mon", "Tue", "Wed", "Thu", "Fri"]);
  });

  it("maps Date#getDay onto the Monday-first table", () => {
    assert.equal(hoursForDay(0).day, "Sunday");
    assert.equal(hoursForDay(1).day, "Monday");
    assert.equal(hoursForDay(6).day, "Saturday");
  });
});

describe("openState", () => {
  it("is open during a weekday afternoon", () => {
    const state = openState(at(3, 14, 30));
    assert.equal(state.open, true);
    assert.match(state.label, /Open until 6pm/);
  });

  it("is open on the dot of opening and shut on the dot of closing", () => {
    assert.equal(openState(at(2, 11, 0)).open, true);
    assert.equal(openState(at(2, 17, 59)).open, true);
    assert.equal(openState(at(2, 18, 0)).open, false);
  });

  it("says when it opens later the same morning", () => {
    const state = openState(at(1, 9, 0));
    assert.equal(state.open, false);
    assert.match(state.label, /Opens today at 11am/);
  });

  it("points at tomorrow after closing on a weekday", () => {
    const state = openState(at(2, 19, 0));
    assert.equal(state.open, false);
    assert.match(state.label, /Opens tomorrow at 11am/);
  });

  it("names the day when the next opening is not tomorrow", () => {
    // Saturday: closed, and Sunday is closed too, so it must say Monday.
    const state = openState(at(6, 13, 0));
    assert.equal(state.open, false);
    assert.match(state.label, /Opens Monday at 11am/);
  });

  it("is closed all weekend", () => {
    assert.equal(openState(at(6, 12, 0)).open, false);
    assert.equal(openState(at(7, 12, 0)).open, false);
  });
});

describe("contact details", () => {
  it("keeps the dialling number and the display number in step", () => {
    assert.equal(SALON.phoneE164, `+44${SALON.phone.replace(/\s/g, "").slice(1)}`);
  });

  it("builds a one-line address from the parts", () => {
    assert.equal(ADDRESS_ONE_LINE, "Arndale Market, Manchester, M4 3AH");
  });

  it("encodes the business name into the maps link", () => {
    assert.ok(MAPS_URL.startsWith("https://www.google.com/maps/search/?api=1&query="));
    assert.match(decodeURIComponent(MAPS_URL), /Annie's Secret Hair Extension/);
    assert.match(decodeURIComponent(MAPS_URL), /M4 3AH/);
  });

  it("links out to every platform over https", () => {
    for (const url of Object.values(SALON.social)) {
      if (url.startsWith("@")) continue;
      assert.match(url, /^https:\/\//);
    }
  });
});

describe("rating", () => {
  it("never states a rating without its count and source", () => {
    assert.equal(RATING.value, 4.9);
    assert.equal(RATING.count, 82);
    assert.equal(RATING.source, "Treatwell");
    assert.equal(RATING.sourceUrl, SALON.social.treatwell);
  });
});
