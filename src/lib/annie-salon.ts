/**
 * Annie's Secret Hair Extension — the single source of truth for every
 * business fact on the salon site.
 *
 * Everything in this file is verifiable from the salon's own public
 * listings (Companies House, Treatwell, Fresha, Instagram). Nothing here is
 * invented. If a detail changes, change it here and it changes everywhere,
 * including the JSON-LD that Google reads.
 */

export type OpeningDay = {
  /** Schema.org day name, used directly in JSON-LD. */
  readonly day: string;
  readonly short: string;
  /** 24h "HH:MM", or null when closed. */
  readonly opens: string | null;
  readonly closes: string | null;
};

export const SALON = {
  name: "Annie's Secret Hair Extension",
  alternateName: "Annie's Secret Hair & Weave Bar",
  shortName: "Annie's Secret",
  tagline: "Manchester's hair extension experts",
  /** Registered at Companies House as company 15893346. */
  companyNumber: "15893346",
  legalName: "ANNIE'S SECRET HAIR EXTENSION LIMITED",

  address: {
    unit: "Arndale Market",
    street: "High Street",
    city: "Manchester",
    postcode: "M4 3AH",
    country: "United Kingdom",
  },

  /** Landmarks the salon's own listings use to describe the location. */
  landmarks: [
    "Two minutes from Piccadilly Gardens",
    "A short walk from Victoria station",
    "Inside Manchester Arndale Market",
  ],

  phone: "07428 132392",
  /** E.164, for tel: and WhatsApp links. */
  phoneE164: "+447428132392",
  website: "https://anniesecrethairextension.co.uk",

  social: {
    instagram: "https://www.instagram.com/annie_secret_hair/",
    instagramHandle: "@annie_secret_hair",
    facebook:
      "https://www.facebook.com/p/Annie-Secret-hair-Extensions-Weave-Bar-100041857252822/",
    treatwell: "https://www.treatwell.co.uk/place/annie-s-secret-hair-weave-bar/",
    fresha: "https://www.fresha.com/lvp/annies-secret-hair-extensions-gnA6DM",
  },

  /** How the salon actually takes work: walk-ins, confirmed by message. */
  bookingModel: "walk-in",

  hours: [
    { day: "Monday", short: "Mon", opens: "11:00", closes: "18:00" },
    { day: "Tuesday", short: "Tue", opens: "11:00", closes: "18:00" },
    { day: "Wednesday", short: "Wed", opens: "11:00", closes: "18:00" },
    { day: "Thursday", short: "Thu", opens: "11:00", closes: "18:00" },
    { day: "Friday", short: "Fri", opens: "11:00", closes: "18:00" },
    { day: "Saturday", short: "Sat", opens: null, closes: null },
    { day: "Sunday", short: "Sun", opens: null, closes: null },
  ] as readonly OpeningDay[],
} as const;

export const ADDRESS_ONE_LINE = [
  SALON.address.unit,
  SALON.address.city,
  SALON.address.postcode,
].join(", ");

/** Google Maps needs the business name as well — the market has no street number. */
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(`${SALON.name}, ${ADDRESS_ONE_LINE}`);

/**
 * Aggregate rating shown on the site. Sourced from the salon's public
 * Treatwell profile — the figure and the count travel together so the
 * site can never claim a rating without saying where it came from.
 */
export const RATING = {
  value: 4.9,
  count: 82,
  source: "Treatwell",
  sourceUrl: SALON.social.treatwell,
} as const;

/** Day index (0 = Sunday, as Date#getDay returns) → opening hours row. */
export function hoursForDay(dayIndex: number): OpeningDay {
  // SALON.hours starts on Monday; Date#getDay starts on Sunday.
  return SALON.hours[(dayIndex + 6) % 7];
}

export type OpenState = {
  readonly open: boolean;
  /** Short human sentence, e.g. "Open until 6pm" or "Opens Monday 11am". */
  readonly label: string;
};

function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12}${suffix}` : `${hour12}.${String(m).padStart(2, "0")}${suffix}`;
}

/**
 * Whether the salon is open at a given moment. Pure: it takes the time
 * rather than reading the clock, so it is testable and renders the same on
 * the server and the client.
 */
export function openState(now: Date): OpenState {
  const today = hoursForDay(now.getDay());
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (today.opens && today.closes) {
    const [oh, om] = today.opens.split(":").map(Number);
    const [ch, cm] = today.closes.split(":").map(Number);
    const opensAt = oh * 60 + om;
    const closesAt = ch * 60 + cm;

    if (minutes >= opensAt && minutes < closesAt) {
      return { open: true, label: `Open until ${to12h(today.closes)}` };
    }
    if (minutes < opensAt) {
      return { open: false, label: `Opens today at ${to12h(today.opens)}` };
    }
  }

  // Closed for the rest of today — find the next day that opens.
  for (let ahead = 1; ahead <= 7; ahead += 1) {
    const next = hoursForDay((now.getDay() + ahead) % 7);
    if (next.opens) {
      const when = ahead === 1 ? "tomorrow" : next.day;
      return { open: false, label: `Opens ${when} at ${to12h(next.opens)}` };
    }
  }

  return { open: false, label: "Closed" };
}
