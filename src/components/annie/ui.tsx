import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { assetPath } from "@/lib/asset";
import { cn } from "@/lib/utils";
import type { PhotoId } from "@/lib/annie-photos";
import { brief, photo } from "@/lib/annie-photos";
import { Magnetic, WordReveal } from "./motion";
import { Reveal } from "./reveal";

/** A page band. Generous vertical rhythm — this is a marketing site. */
export function AnnieSection({
  children,
  className,
  id,
  tone = "base",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "base" | "subtle";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-20 md:py-28",
        tone === "subtle" && "bg-background-subtle",
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

/**
 * Section head: a gold technical label over a serif title. The label is a
 * <p>, not a heading — it is a kicker, and putting it in the heading
 * outline would break the h1→h6 sequence for screen-reader navigation.
 */
export function AnnieHeading({
  label,
  title,
  lede,
  align = "left",
  as: Tag = "h2",
}: {
  label?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}) {
  const centered = align === "center";
  return (
    <Reveal direction="zoom-soft" className={cn(centered && "text-center")}>
      {label ? <p className="annie-label">{label}</p> : null}
      <Tag
        className={cn(
          "mt-4 font-display text-[2.1rem] leading-[1.06] md:text-[3rem]",
          // text-balance and the word masks fight each other, so a
          // word-revealed heading keeps its own natural wrapping.
          typeof title === "string" ? "text-pretty" : "text-balance",
          centered ? "mx-auto max-w-[22ch]" : "max-w-[24ch]",
        )}
      >
        {/* A plain string gets the word-by-word reveal; a heading built
            from markup (a gilt span, a number) is rendered as given. */}
        {typeof title === "string" ? <WordReveal text={title} /> : title}
      </Tag>
      {lede ? (
        <p
          className={cn(
            "mt-5 max-w-[60ch] text-pretty text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]",
            centered && "mx-auto",
          )}
        >
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}

type ButtonTone = "gold" | "outline" | "ghost";

const TONE: Record<ButtonTone, string> = {
  gold: "bg-primary text-on-primary hover:bg-primary-hover",
  outline:
    "border border-[var(--gold-hairline)] text-foreground hover:bg-primary-soft hover:border-primary/40",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
};

/* Every size clears the 44px minimum touch target. */
const BUTTON_BASE =
  "group inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold " +
  "transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.97] " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function AnnieButton({
  tone = "gold",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { tone?: ButtonTone }) {
  return (
    <button className={cn(BUTTON_BASE, TONE[tone], className)} {...props}>
      {children}
    </button>
  );
}

export function AnnieLink({
  tone = "gold",
  className,
  children,
  arrow = false,
  /** Off for links inside dense copy, where a leaning target is noise. */
  magnetic = true,
  ...props
}: ComponentProps<typeof Link> & {
  tone?: ButtonTone;
  arrow?: boolean;
  magnetic?: boolean;
}) {
  const link = (
    <Link className={cn(BUTTON_BASE, TONE[tone], className)} {...props}>
      {children}
      {arrow ? (
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
        />
      ) : null}
    </Link>
  );
  // Magnetic is a no-op on touch and under reduced motion, so this
  // costs nothing where it would not be wanted.
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}

/** A figure with its label. Used across the trust bars. */
export function Stat({
  value,
  label,
  detail,
}: {
  value: ReactNode;
  label: string;
  detail?: string;
}) {
  return (
    <div>
      <p className="font-display text-[2.25rem] leading-none text-primary md:text-[2.75rem]">
        {value}
      </p>
      <p className="annie-label mt-3 text-foreground">{label}</p>
      {detail ? (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A framed slot for one of Annie's photographs.
 *
 * The site ships with no client photography, so rather than filling the
 * gallery with stock images of other people's hair — which would
 * misrepresent the salon's work — every image slot renders this. It is a
 * finished-looking piece of art direction that says exactly which
 * photograph belongs here and what shape it needs to be.
 *
 * Drop a real image in by passing `src`; the frame keeps its aspect ratio
 * so nothing shifts when you do.
 */
export function PhotoFrame({
  id,
  caption,
  ratio = "3 / 4",
  src,
  alt,
  className,
  index = 0,
  /** Turns off the slow push, for a frame sitting beside moving copy. */
  still = false,
  /**
   * Drops the caption overlay. Needed wherever two frames are stacked and
   * clipped against each other — two overlays at different clip depths
   * interleave into unreadable text.
   */
  hideCaption = false,
}: {
  /**
   * The slot's id in the photo manifest. Give this and the frame
   * resolves its own photograph and caption — adding the file to
   * `annie-photos.ts` turns the slot into an image with no change here.
   */
  id?: PhotoId;
  /** Overrides the manifest's brief. Optional when `id` is given. */
  caption?: string;
  ratio?: string;
  src?: string;
  alt?: string;
  className?: string;
  /** Varies the placeholder art so a grid does not look tiled. */
  index?: number;
  still?: boolean;
  hideCaption?: boolean;
}) {
  const fromManifest = photo(id);
  const resolvedSrc = src ?? fromManifest?.src;
  const resolvedCaption = caption ?? (id ? brief(id) : "");
  const resolvedAlt = alt ?? fromManifest?.alt ?? resolvedCaption;

  if (resolvedSrc) {
    return (
      <span
        className={cn(
          "annie-zoom-frame block rounded-2xl border border-card-border",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- the static
            export runs without the image optimiser, so a plain <img> with an
            explicit aspect-ratio is the honest choice here. */}
        <img
          src={assetPath(resolvedSrc)}
          alt={resolvedAlt}
          style={{ aspectRatio: ratio }}
          loading="lazy"
          decoding="async"
          className={cn(
            "annie-zoom-target w-full object-cover",
            !still && "annie-kenburns",
          )}
        />
      </span>
    );
  }

  const hue = index % 3;
  return (
    <div
      style={{ aspectRatio: ratio }}
      className={cn(
        // A dashed gold edge and a deeper wash, so an unfilled slot reads
        // as a designed frame rather than as a hole in the page. On the
        // cream ground the old pale tint all but disappeared.
        "annie-zoom-frame annie-sheen relative w-full rounded-2xl border border-dashed border-primary/35 bg-primary-soft/60",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn("annie-zoom-target absolute inset-0", !still && "annie-kenburns")}
        style={{
          background:
            hue === 0
              ? "linear-gradient(155deg, #f8e7c9 0%, #f3d3da 55%, #f7e3cb 100%)"
              : hue === 1
                ? "linear-gradient(155deg, #f6d9e1 0%, #f9e7c8 58%, #f0cfd8 100%)"
                : "linear-gradient(155deg, #f7e2c8 0%, #f4dae2 48%, #f9ecd4 100%)",
        }}
      />
      {/* A few strands, so an empty frame still reads as hair. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 130"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-60"
      >
        {[18, 34, 50, 66, 82].map((x, i) => (
          <path
            key={x}
            d={`M ${x} -5 C ${x + (i % 2 ? 14 : -14)} 40, ${x - (i % 2 ? 12 : -12)} 82, ${x + (i % 2 ? 6 : -6)} 135`}
            fill="none"
            stroke="#a8811a"
            strokeWidth="0.6"
            opacity={0.3 + i * 0.09}
          />
        ))}
      </svg>
      {hideCaption ? null : (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 to-transparent p-4 pt-10">
          <p className="annie-label text-[0.6rem]">Photo slot</p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            {resolvedCaption}
          </p>
        </div>
      )}
    </div>
  );
}
