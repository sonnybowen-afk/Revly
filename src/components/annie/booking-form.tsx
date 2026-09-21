"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { METHODS, methodById } from "@/lib/annie-methods";
import type { Length, Volume } from "@/lib/annie-pricing";
import { LENGTHS, VOLUME_LABELS } from "@/lib/annie-pricing";
import type { BookingDraft, Errors, FieldName } from "@/lib/annie-booking";
import {
  BOOKABLE_DAYS,
  EMPTY_DRAFT,
  NOTES_LIMIT,
  completeness,
  composeMessage,
  contactLinks,
  validate,
} from "@/lib/annie-booking";
import { SALON } from "@/lib/annie-salon";
import { AnnieButton } from "./ui";

const DRAFT_KEY = "annie.booking.draft.v1";

/**
 * The booking request.
 *
 * Annie has no online diary, so this does not pretend to reserve
 * anything. It builds a complete, correctly-formatted enquiry and hands it
 * to WhatsApp, SMS or email — which is how the studio actually works.
 *
 * Validation runs on blur and on submit, never on every keystroke, so
 * nobody is told their email is wrong while they are still typing it.
 */
export function BookingForm() {
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Pre-select the method when arriving from the hair match or a service.
  const presetMethod = searchParams.get("method");

  // Restore an unsent draft. Long forms lose people otherwise, and a
  // browser-storage read can throw in a private window, so it is guarded.
  useEffect(() => {
    let stored: BookingDraft | null = null;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) stored = { ...EMPTY_DRAFT, ...(JSON.parse(raw) as BookingDraft) };
    } catch {
      stored = null;
    }
    setDraft((current) => {
      const base = stored ?? current;
      return presetMethod && methodById(presetMethod)
        ? { ...base, methodId: presetMethod }
        : base;
    });
    setRestored(Boolean(stored));
  }, [presetMethod]);

  // Persist on change. Never fatal — a full or blocked store just means
  // the draft is not kept.
  useEffect(() => {
    if (draft === EMPTY_DRAFT) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* Storage unavailable. The form still works. */
    }
  }, [draft]);

  const errors = useMemo(() => validate(draft), [draft]);
  const visible: Errors = submitted
    ? errors
    : Object.fromEntries(
        Object.entries(errors).filter(([key]) => touched[key as FieldName]),
      );
  const errorCount = Object.keys(errors).length;
  const progress = completeness(draft);
  const links = contactLinks(draft);
  const preview = composeMessage(draft);

  const set = <K extends FieldName>(key: K, value: BookingDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const blur = (key: FieldName) =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  /**
   * "Submit" means: check it, then open the chosen app. On failure, focus
   * moves to the error summary rather than leaving the reader guessing.
   */
  const send = (href: string) => {
    setSubmitted(true);
    if (errorCount > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    window.location.href = href;
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          send(links.whatsapp);
        }}
        className="annie-card p-6 md:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="annie-label">Your request</p>
          <p className="font-technical text-xs text-muted-foreground tabular-nums">
            {progress}% complete
          </p>
        </div>
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="How complete your request is"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {restored ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Picked up where you left off.{" "}
            <button
              type="button"
              onClick={() => {
                setDraft(EMPTY_DRAFT);
                setRestored(false);
                try {
                  window.localStorage.removeItem(DRAFT_KEY);
                } catch {
                  /* nothing to clear */
                }
              }}
              className="cursor-pointer text-primary underline underline-offset-4"
            >
              Start fresh
            </button>
          </p>
        ) : null}

        {/* Error summary. Focusable, linked to each field, and only ever
            shown after an attempted send. */}
        {submitted && errorCount > 0 ? (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="mt-6 rounded-xl border border-destructive/40 bg-destructive-soft p-4"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-destructive-soft-foreground">
              <AlertCircle aria-hidden="true" className="size-4" />
              {errorCount === 1
                ? "One thing needs fixing"
                : `${errorCount} things need fixing`}
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>
                  <a
                    href={`#field-${key}`}
                    className="text-destructive-soft-foreground underline underline-offset-4"
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 space-y-6">
          <Text
            name="name"
            label="Your name"
            required
            value={draft.name}
            error={visible.name}
            autoComplete="given-name"
            onChange={(v) => set("name", v)}
            onBlur={() => blur("name")}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Text
              name="phone"
              label="Mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="07xxx xxxxxx"
              help="Annie replies by WhatsApp or text."
              value={draft.phone}
              error={visible.phone}
              onChange={(v) => set("phone", v)}
              onBlur={() => blur("phone")}
            />
            <Text
              name="email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              help="Optional if you have given a mobile."
              value={draft.email}
              error={visible.email}
              onChange={(v) => set("email", v)}
              onBlur={() => blur("email")}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-card-border bg-background-subtle p-4">
            <input
              type="checkbox"
              checked={draft.consultationOnly}
              onChange={(e) => set("consultationOnly", e.target.checked)}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--primary)]"
            />
            <span>
              <span className="block text-sm font-medium">
                Just a free consultation for now
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                Annie looks at your hair, matches the shade and talks you
                through the options. No obligation, and nothing gets fitted
                on the day unless you want it to.
              </span>
            </span>
          </label>

          {!draft.consultationOnly ? (
            <>
              <Field
                id="field-methodId"
                label="Method"
                help="Leave it blank if you would rather be advised."
                error={visible.methodId}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Pill
                    selected={draft.methodId === ""}
                    onClick={() => set("methodId", "")}
                  >
                    Not sure — advise me
                  </Pill>
                  {METHODS.map((m) => (
                    <Pill
                      key={m.id}
                      selected={draft.methodId === m.id}
                      onClick={() => set("methodId", m.id)}
                    >
                      {m.name}
                    </Pill>
                  ))}
                </div>
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="field-volume" label="How much hair">
                  <div className="flex flex-wrap gap-2">
                    {(["half", "full", "mega"] as Volume[]).map((v) => (
                      <Pill
                        key={v}
                        selected={draft.volume === v}
                        onClick={() => set("volume", draft.volume === v ? "" : v)}
                      >
                        {VOLUME_LABELS[v]}
                      </Pill>
                    ))}
                  </div>
                </Field>

                <Field id="field-length" label="Length">
                  <div className="flex flex-wrap gap-2">
                    {LENGTHS.map((inches: Length) => (
                      <Pill
                        key={inches}
                        selected={draft.length === inches}
                        onClick={() =>
                          set("length", draft.length === inches ? "" : inches)
                        }
                      >
                        {inches}&Prime;
                      </Pill>
                    ))}
                  </div>
                </Field>
              </div>
            </>
          ) : null}

          <Field
            id="field-preferredDay"
            label="Best day for you"
            help="The studio is open Monday to Friday, 11am to 6pm."
            error={visible.preferredDay}
          >
            <div className="flex flex-wrap gap-2">
              {BOOKABLE_DAYS.map((day) => (
                <Pill
                  key={day}
                  selected={draft.preferredDay === day}
                  onClick={() =>
                    set("preferredDay", draft.preferredDay === day ? "" : day)
                  }
                >
                  {day.slice(0, 3)}
                </Pill>
              ))}
            </div>
          </Field>

          {/* A plain label, not the Field fieldset: a <legend> does not
              name a single control, so the textarea would have none. */}
          <div id="field-notes" className="scroll-mt-24">
            <label htmlFor="input-notes" className="annie-label block">
              Anything else
            </label>
            <p id="notes-help" className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Colour you are after, an occasion, dates that suit &mdash;
              whatever helps.
            </p>
            <textarea
              id="input-notes"
              rows={4}
              maxLength={NOTES_LIMIT + 40}
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              onBlur={() => blur("notes")}
              aria-describedby="notes-help notes-count"
              aria-invalid={visible.notes ? true : undefined}
              className="mt-2 w-full rounded-xl border border-card-border bg-background-subtle p-4 text-sm leading-relaxed transition-colors duration-200 placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <p
              id="notes-count"
              className="font-technical mt-1.5 text-right text-xs tabular-nums text-muted-foreground"
            >
              {draft.notes.length}/{NOTES_LIMIT}
            </p>
            {visible.notes ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
                {visible.notes}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-7">
          <p className="annie-label">Send it</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick however you prefer. Your message is written for you —
            you just press send.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <AnnieButton type="submit">
              <MessageCircle aria-hidden="true" className="size-4" />
              WhatsApp
            </AnnieButton>
            <AnnieButton
              type="button"
              tone="outline"
              onClick={() => send(links.sms)}
            >
              <Send aria-hidden="true" className="size-4" />
              Text message
            </AnnieButton>
            <AnnieButton
              type="button"
              tone="outline"
              onClick={() => send(links.email)}
            >
              <Mail aria-hidden="true" className="size-4" />
              Email
            </AnnieButton>
            <a
              href={links.tel}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold-hairline)] px-6 text-sm font-semibold transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Phone aria-hidden="true" className="size-4" />
              Just call
            </a>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Nothing is sent from this page and nothing is stored on a
            server. The buttons open your own messaging app with the
            message already written, addressed to {SALON.phone}.
          </p>
        </div>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="annie-card p-6">
          <p className="annie-label">Message preview</p>
          <pre className="font-technical mt-4 max-h-[26rem] overflow-auto whitespace-pre-wrap text-[0.8rem] leading-relaxed text-muted-foreground">
            {preview}
          </pre>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          This is exactly what Annie receives. Change anything on the left
          and it updates here.
        </p>
      </aside>
    </div>
  );
}

function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset id={id} className="scroll-mt-24">
      <legend className="annie-label mb-1">{label}</legend>
      {help ? (
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {help}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function Text({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  help,
  required,
  type = "text",
  ...rest
}: {
  name: FieldName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  help?: string;
  required?: boolean;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "onBlur" | "value" | "name" | "type">) {
  const inputId = `input-${name}`;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div id={`field-${name}`} className="scroll-mt-24">
      <label htmlFor={inputId} className="annie-label block">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      {help ? (
        <p id={helpId} className="mt-1 text-xs text-muted-foreground">
          {help}
        </p>
      ) : null}
      <input
        id={inputId}
        type={type}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          "mt-2 min-h-12 w-full rounded-xl border bg-background-subtle px-4 text-base transition-colors duration-200",
          "placeholder:text-muted-foreground/70",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          error ? "border-destructive" : "border-card-border focus-visible:border-primary",
        )}
        {...rest}
      />
      {error ? (
        <p
          id={errorId}
          className="mt-2 flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-sm transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        selected
          ? "border-primary bg-primary text-on-primary"
          : "border-card-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
