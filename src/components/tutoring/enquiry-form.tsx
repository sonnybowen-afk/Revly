"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Fields {
  name: string;
  email: string;
  level: string;
  subject: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = {
  name: "",
  email: "",
  level: "",
  subject: "",
  message: "",
};

const LEVELS = ["GCSE", "A-Level", "Both"];

function validate(values: Fields): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) {
    errors.name = "Enter your name so we know who to reply to.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter an email address so we can reply.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "That email address doesn't look right — check for typos.";
  }

  if (!values.level) {
    errors.level = "Choose the level you need help with.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Tell us which subject, so we can match a specialist.";
  }

  return errors;
}

export function EnquiryForm() {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);

  function setField(field: keyof Fields, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Re-validate a field that has already errored, so the message clears
    // as soon as the user fixes it.
    if (errors[field]) setErrors(validate(next));
  }

  // Validate on blur, not on every keystroke.
  function handleBlur(field: keyof Fields) {
    setTouched((t) => ({ ...t, [field]: true }));
    const all = validate(values);
    setErrors((prev) => ({ ...prev, [field]: all[field] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({
      name: true,
      email: true,
      level: true,
      subject: true,
      message: true,
    });

    if (Object.keys(found).length > 0) {
      setShowSummary(true);
      // Move focus to the summary so screen reader users hear the problem.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setShowSummary(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="card-surface flex flex-col items-center p-8 text-center md:p-12"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-xl font-bold">Enquiry ready to send</h3>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          The form validated successfully. It is not wired to a backend yet —
          connect it to your CRM, inbox or a form service and this is where the
          confirmation will appear.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setValues(EMPTY);
            setErrors({});
            setTouched({});
            setSubmitted(false);
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  const errorList = (Object.keys(errors) as (keyof Fields)[]).filter(
    (k) => errors[k],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="card-surface p-6 md:p-8">
      <h3 className="text-xl font-bold">Request a tutor</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us what you need and we will match a subject specialist. Fields
        marked <span aria-hidden="true">*</span> are required.
      </p>

      {/* Error summary — focusable, linked to each invalid field. */}
      {showSummary && errorList.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 rounded-xl border border-destructive/35 bg-destructive-soft p-4"
        >
          <p className="flex items-center gap-2 font-bold text-destructive-soft-foreground">
            <AlertCircle className="size-4" aria-hidden="true" />
            There {errorList.length === 1 ? "is 1 problem" : `are ${errorList.length} problems`} with this form
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {errorList.map((key) => (
              <li key={key}>
                <a
                  href={`#field-${key}`}
                  className="text-sm font-medium text-destructive-soft-foreground underline underline-offset-2"
                >
                  {errors[key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Your name"
          required
          error={touched.name ? errors.name : undefined}
        >
          <input
            id="field-name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={
              touched.name && errors.name ? "error-name" : undefined
            }
            className={inputClass(touched.name && !!errors.name)}
          />
        </Field>

        <Field
          id="email"
          label="Email"
          required
          error={touched.email ? errors.email : undefined}
        >
          <input
            id="field-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={
              touched.email && errors.email ? "error-email" : undefined
            }
            className={inputClass(touched.email && !!errors.email)}
          />
        </Field>

        <Field
          id="level"
          label="Level"
          required
          error={touched.level ? errors.level : undefined}
        >
          <select
            id="field-level"
            value={values.level}
            onChange={(e) => setField("level", e.target.value)}
            onBlur={() => handleBlur("level")}
            aria-invalid={touched.level && !!errors.level}
            aria-describedby={
              touched.level && errors.level ? "error-level" : undefined
            }
            className={inputClass(touched.level && !!errors.level)}
          >
            <option value="">Choose a level…</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="subject"
          label="Subject"
          required
          hint="e.g. A-Level Chemistry"
          error={touched.subject ? errors.subject : undefined}
        >
          <input
            id="field-subject"
            type="text"
            value={values.subject}
            onChange={(e) => setField("subject", e.target.value)}
            onBlur={() => handleBlur("subject")}
            aria-invalid={touched.subject && !!errors.subject}
            aria-describedby={cn(
              "hint-subject",
              touched.subject && errors.subject ? "error-subject" : "",
            ).trim()}
            className={inputClass(touched.subject && !!errors.subject)}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          id="message"
          label="What do you need help with?"
          hint="Optional — the more specific, the better the match."
        >
          <textarea
            id="field-message"
            rows={4}
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            aria-describedby="hint-message"
            className={cn(inputClass(false), "min-h-28 py-3 resize-y")}
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-7 w-full sm:w-auto">
        <Send className="size-4" aria-hidden="true" />
        Send enquiry
      </Button>
    </form>
  );
}

function inputClass(invalid?: boolean) {
  return cn(
    // 16px text avoids iOS zoom-on-focus; min-h-11 clears the touch target.
    "min-h-11 w-full rounded-lg border bg-background px-3 text-base",
    "transition-colors duration-150",
    invalid ? "border-destructive" : "border-border",
  );
}

function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`field-${id}`} className="block text-sm font-semibold">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>
      {hint ? (
        <p id={`hint-${id}`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p
          id={`error-${id}`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
