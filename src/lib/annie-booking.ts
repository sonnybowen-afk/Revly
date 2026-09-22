/**
 * The booking request behind /annie/book.
 *
 * Annie takes walk-ins and confirms by message — there is no third-party
 * booking system to post to, and inventing one would be worse than useless
 * because nobody would be reading the other end. So this does the honest
 * version well: it collects everything Annie actually needs to quote and
 * reserve chair time, validates it properly, and hands the visitor a
 * finished message on WhatsApp, SMS or email with one tap.
 *
 * All pure. Validation and message-building take their input and return a
 * result; nothing here touches the network, the clock or storage.
 */

import type { Method } from "./annie-methods.ts";
import { methodById } from "./annie-methods.ts";
import { quantityLabel, quote, formatGbp } from "./annie-pricing.ts";
import { SALON } from "./annie-salon.ts";

export type BookingDraft = {
  readonly name: string;
  /** UK mobile or landline, however the visitor chose to type it. */
  readonly phone: string;
  readonly email: string;
  /** Method id, or "" when they want Annie to advise. */
  readonly methodId: string;
  /**
   * How many rows / pieces / packs, in the chosen method's own unit.
   * 0 when not yet chosen — the units differ per method, so this only
   * means anything alongside `methodId`.
   */
  readonly quantity: number;
  /** Free text: colour, occasion, dates that suit, anything else. */
  readonly notes: string;
  /** Which day of the week suits, or "" for no preference. */
  readonly preferredDay: string;
  readonly consultationOnly: boolean;
};

export const EMPTY_DRAFT: BookingDraft = {
  name: "",
  phone: "",
  email: "",
  methodId: "",
  quantity: 0,
  notes: "",
  preferredDay: "",
  consultationOnly: false,
};

export type FieldName = keyof BookingDraft;
export type Errors = Partial<Record<FieldName, string>>;

/** Only the weekdays the salon is actually open. */
export const BOOKABLE_DAYS: readonly string[] = SALON.hours
  .filter((d) => d.opens !== null)
  .map((d) => d.day);

const NOTES_MAX = 600;

/**
 * UK numbers, forgiving about how they are typed: spaces, dashes,
 * brackets, a leading +44 or 0 all work. We check the digits, not the
 * punctuation, because rejecting "07428 132 392" would be absurd.
 */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/[\s()-]/g, "");
  const match = /^(?:\+44|0044|0)(\d{9,10})$/.exec(digits);
  if (!match) return null;
  return `0${match[1]}`;
}

/**
 * Deliberately permissive: something, an @, something with a dot. Anything
 * stricter rejects valid addresses, and the only real test is whether the
 * reply arrives.
 */
export function isPlausibleEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}

/**
 * Validates a draft. A contact route is required — phone or email, either
 * will do — because a request Annie cannot answer is not a request.
 */
export function validate(draft: BookingDraft): Errors {
  const errors: Errors = {};

  const name = draft.name.trim();
  if (name.length === 0) {
    errors.name = "Please tell Annie your name.";
  } else if (name.length < 2) {
    errors.name = "That looks too short — please give your full first name.";
  }

  const hasPhone = draft.phone.trim().length > 0;
  const hasEmail = draft.email.trim().length > 0;

  if (!hasPhone && !hasEmail) {
    errors.phone = "Add a phone number or an email so Annie can reply.";
  }
  if (hasPhone && normalisePhone(draft.phone) === null) {
    errors.phone = "That does not look like a UK number. Try 07xxx xxxxxx.";
  }
  if (hasEmail && !isPlausibleEmail(draft.email)) {
    errors.email = "Check the email address — it is missing an @ or a domain.";
  }

  if (draft.notes.length > NOTES_MAX) {
    errors.notes = `Keep it under ${NOTES_MAX} characters — there is room for the detail at your consultation.`;
  }

  if (draft.preferredDay && !BOOKABLE_DAYS.includes(draft.preferredDay)) {
    errors.preferredDay = "The studio is open Monday to Friday.";
  }

  const method = draft.methodId ? methodById(draft.methodId) : undefined;
  if (draft.methodId && !method) {
    errors.methodId = "Pick a method from the list, or leave it to Annie.";
  }
  // A quantity is meaningless without the method whose unit it counts.
  if (draft.quantity > 0 && !method) {
    errors.quantity = "Pick a method first — the amount is counted in its own units.";
  }
  if (method && draft.quantity > 0 && !method.price.steps.includes(draft.quantity)) {
    errors.quantity = `Pick one of the amounts listed for ${method.name}.`;
  }

  return errors;
}

export function isValid(draft: BookingDraft): boolean {
  return Object.keys(validate(draft)).length === 0;
}

/** The fields worth filling in, and how many of them are done. 0–100. */
export function completeness(draft: BookingDraft): number {
  const filled = [
    draft.name.trim().length > 0,
    draft.phone.trim().length > 0 || draft.email.trim().length > 0,
    draft.methodId.length > 0 || draft.consultationOnly,
    draft.quantity > 0 || draft.consultationOnly,
    draft.preferredDay.length > 0,
  ].filter(Boolean).length;
  return Math.round((filled / 5) * 100);
}

function describeMethod(method: Method | undefined): string {
  return method ? method.name : "Not sure yet — happy to be advised";
}

/**
 * The message itself. Written the way a person would write it, because a
 * person is going to read it on a phone between clients.
 */
export function composeMessage(draft: BookingDraft): string {
  const method = draft.methodId ? methodById(draft.methodId) : undefined;
  const lines: string[] = [];

  lines.push(
    draft.consultationOnly
      ? `Hi Annie, I'd like to book a free consultation.`
      : `Hi Annie, I'd like to enquire about hair extensions.`,
  );
  lines.push("");
  lines.push(`Name: ${draft.name.trim()}`);

  const phone = normalisePhone(draft.phone);
  if (phone) lines.push(`Phone: ${phone}`);
  if (draft.email.trim()) lines.push(`Email: ${draft.email.trim()}`);

  if (!draft.consultationOnly) {
    lines.push(`Method: ${describeMethod(method)}`);
    if (method && draft.quantity > 0) {
      // Quote the price back, so Annie and the client start from the
      // same number rather than from a half-remembered one.
      const q = quote(method, draft.quantity);
      lines.push(
        `Amount: ${quantityLabel(method, draft.quantity)}` +
          (q.isFullHead ? " (full head)" : ""),
      );
      lines.push(`Price list: ${formatGbp(q.total)}`);
    }
  }

  if (draft.preferredDay) lines.push(`Best day: ${draft.preferredDay}`);

  const notes = draft.notes.trim();
  if (notes) {
    lines.push("");
    lines.push(notes);
  }

  return lines.join("\n");
}

export type ContactLinks = {
  readonly whatsapp: string;
  readonly sms: string;
  readonly email: string;
  readonly tel: string;
};

/** Ready-to-open links carrying the composed message. */
export function contactLinks(draft: BookingDraft): ContactLinks {
  const message = composeMessage(draft);
  const encoded = encodeURIComponent(message);
  // WhatsApp wants the number without the leading +.
  const wa = SALON.phoneE164.replace(/^\+/, "");
  const subject = encodeURIComponent(
    draft.consultationOnly
      ? "Consultation request"
      : "Hair extension enquiry",
  );

  return {
    whatsapp: `https://wa.me/${wa}?text=${encoded}`,
    // iOS wants &body=, Android historically wanted ?body=. The ?& form
    // below is the one both parse correctly.
    sms: `sms:${SALON.phoneE164}?&body=${encoded}`,
    email: `mailto:?subject=${subject}&body=${encoded}`,
    tel: `tel:${SALON.phoneE164}`,
  };
}

export const NOTES_LIMIT = NOTES_MAX;
