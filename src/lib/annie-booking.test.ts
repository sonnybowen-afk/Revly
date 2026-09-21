import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { SALON } from "./annie-salon.ts";
import type { BookingDraft } from "./annie-booking.ts";
import {
  BOOKABLE_DAYS,
  EMPTY_DRAFT,
  NOTES_LIMIT,
  completeness,
  composeMessage,
  contactLinks,
  isPlausibleEmail,
  isValid,
  normalisePhone,
  validate,
} from "./annie-booking.ts";

const draft = (over: Partial<BookingDraft> = {}): BookingDraft => ({
  ...EMPTY_DRAFT,
  name: "Jo",
  phone: "07428 132392",
  ...over,
});

describe("normalisePhone", () => {
  it("accepts a plain UK mobile", () => {
    assert.equal(normalisePhone("07428132392"), "07428132392");
  });

  it("ignores spaces, dashes and brackets", () => {
    assert.equal(normalisePhone("07428 132 392"), "07428132392");
    assert.equal(normalisePhone("07428-132-392"), "07428132392");
    assert.equal(normalisePhone("(07428) 132392"), "07428132392");
  });

  it("accepts the +44 and 0044 forms", () => {
    assert.equal(normalisePhone("+447428132392"), "07428132392");
    assert.equal(normalisePhone("00447428132392"), "07428132392");
  });

  it("accepts a landline", () => {
    assert.equal(normalisePhone("0161 123 4567"), "01611234567");
  });

  it("rejects anything that is not a UK number", () => {
    assert.equal(normalisePhone(""), null);
    assert.equal(normalisePhone("12345"), null);
    assert.equal(normalisePhone("07428"), null);
    assert.equal(normalisePhone("+1 415 555 0100"), null);
    assert.equal(normalisePhone("not a phone"), null);
  });
});

describe("isPlausibleEmail", () => {
  it("accepts ordinary addresses", () => {
    assert.ok(isPlausibleEmail("jo@example.com"));
    assert.ok(isPlausibleEmail("jo.smith+hair@mail.co.uk"));
    assert.ok(isPlausibleEmail("  jo@example.com  "));
  });

  it("rejects addresses with no @ or no domain", () => {
    assert.equal(isPlausibleEmail("jo"), false);
    assert.equal(isPlausibleEmail("jo@"), false);
    assert.equal(isPlausibleEmail("jo@example"), false);
    assert.equal(isPlausibleEmail("jo @example.com"), false);
  });
});

describe("validate", () => {
  it("passes a complete draft", () => {
    assert.deepEqual(validate(draft()), {});
    assert.ok(isValid(draft()));
  });

  it("requires a name", () => {
    assert.ok(validate(draft({ name: "" })).name);
    assert.ok(validate(draft({ name: "  " })).name);
    assert.ok(validate(draft({ name: "J" })).name);
  });

  it("requires a phone number or an email, but not both", () => {
    assert.ok(validate(draft({ phone: "", email: "" })).phone);
    assert.deepEqual(validate(draft({ phone: "", email: "jo@example.com" })), {});
    assert.deepEqual(validate(draft({ phone: "07428132392", email: "" })), {});
  });

  it("rejects a malformed phone number that was supplied", () => {
    assert.ok(validate(draft({ phone: "12345" })).phone);
  });

  it("rejects a malformed email that was supplied", () => {
    assert.ok(validate(draft({ email: "nope" })).email);
  });

  it("caps the notes field", () => {
    assert.deepEqual(validate(draft({ notes: "x".repeat(NOTES_LIMIT) })), {});
    assert.ok(validate(draft({ notes: "x".repeat(NOTES_LIMIT + 1) })).notes);
  });

  it("only accepts days the studio is open", () => {
    assert.deepEqual(validate(draft({ preferredDay: "Wednesday" })), {});
    assert.ok(validate(draft({ preferredDay: "Sunday" })).preferredDay);
  });

  it("only accepts a method Annie actually fits", () => {
    assert.deepEqual(validate(draft({ methodId: "nano-rings" })), {});
    assert.ok(validate(draft({ methodId: "hot-fusion" })).methodId);
  });
});

describe("BOOKABLE_DAYS", () => {
  it("is the weekdays the salon opens, and nothing else", () => {
    assert.deepEqual([...BOOKABLE_DAYS], [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]);
  });
});

describe("completeness", () => {
  it("is 0 for an empty draft", () => {
    assert.equal(completeness(EMPTY_DRAFT), 0);
  });

  it("rises as fields are filled", () => {
    const partial = completeness(draft());
    const more = completeness(draft({ methodId: "tape-in", volume: "full" }));
    assert.ok(more > partial);
  });

  it("reaches 100 on a fully specified request", () => {
    assert.equal(
      completeness(
        draft({
          methodId: "tape-in",
          volume: "full",
          length: 20,
          preferredDay: "Thursday",
        }),
      ),
      100,
    );
  });

  it("counts a consultation-only request as specified without a method", () => {
    assert.equal(
      completeness(draft({ consultationOnly: true, preferredDay: "Monday" })),
      100,
    );
  });
});

describe("composeMessage", () => {
  it("opens differently for a consultation and an enquiry", () => {
    assert.match(composeMessage(draft({ consultationOnly: true })), /consultation/i);
    assert.match(composeMessage(draft()), /enquire/i);
  });

  it("includes the name and a normalised phone number", () => {
    const message = composeMessage(draft({ name: "  Jo Smith ", phone: "+447428132392" }));
    assert.match(message, /Name: Jo Smith/);
    assert.match(message, /Phone: 07428132392/);
  });

  it("names the method, volume and length when chosen", () => {
    const message = composeMessage(
      draft({ methodId: "nano-rings", volume: "mega", length: 22 }),
    );
    assert.match(message, /Method: Nano Rings/);
    assert.match(message, /Volume: Mega volume/);
    assert.match(message, /Length: 22 inches/);
  });

  it("says so when the visitor wants advice rather than a method", () => {
    assert.match(composeMessage(draft({ methodId: "" })), /advised/i);
  });

  it("leaves the fitting detail out of a consultation request", () => {
    const message = composeMessage(
      draft({ consultationOnly: true, methodId: "nano-rings", volume: "full" }),
    );
    assert.equal(/Method:/.test(message), false);
    assert.equal(/Volume:/.test(message), false);
  });

  it("appends free-text notes last", () => {
    const message = composeMessage(draft({ notes: "  Going to a wedding in June.  " }));
    assert.ok(message.trimEnd().endsWith("Going to a wedding in June."));
  });

  it("omits empty optional fields entirely", () => {
    const message = composeMessage(draft({ email: "", preferredDay: "", notes: "" }));
    assert.equal(/Email:/.test(message), false);
    assert.equal(/Best day:/.test(message), false);
  });
});

describe("contactLinks", () => {
  it("points every route at the salon's own number", () => {
    const links = contactLinks(draft());
    const bare = SALON.phoneE164.replace("+", "");
    assert.ok(links.whatsapp.startsWith(`https://wa.me/${bare}?text=`));
    assert.ok(links.sms.startsWith(`sms:${SALON.phoneE164}`));
    assert.equal(links.tel, `tel:${SALON.phoneE164}`);
  });

  it("URL-encodes the message into every link", () => {
    const links = contactLinks(draft({ name: "Jo & Sam", notes: "100% human hair?" }));
    // Raw ampersands or hashes would truncate the message in the target app.
    const query = links.whatsapp.split("?text=")[1];
    assert.equal(query.includes(" "), false);
    assert.equal(decodeURIComponent(query).includes("Jo & Sam"), true);
    assert.equal(decodeURIComponent(links.sms.split("&body=")[1]).includes("100%"), true);
  });

  it("gives the email link a subject as well as a body", () => {
    const links = contactLinks(draft({ consultationOnly: true }));
    assert.match(links.email, /^mailto:\?subject=/);
    assert.match(decodeURIComponent(links.email), /Consultation request/);
  });
});
