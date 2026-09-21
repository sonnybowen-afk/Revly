import type { Metadata } from "next";
import { Camera, Instagram } from "lucide-react";
import { Atmosphere } from "@/components/annie/atmosphere";
import { BeforeAfter } from "@/components/annie/before-after";
import { BreadcrumbJsonLd } from "@/components/annie/json-ld";
import { Reveal } from "@/components/annie/reveal";
import {
  AnnieHeading,
  AnnieLink,
  AnnieSection,
  PhotoFrame,
} from "@/components/annie/ui";
import { SALON } from "@/lib/annie-salon";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Before and after transformations from Annie's Secret Hair Extension in Manchester — LA weave, nano rings, tape-in wefts and sew-in weaves, fitted and blended in the studio.",
};

/**
 * The gallery is built around photo slots rather than stock imagery.
 *
 * Filling a real salon's gallery with pictures of other people's work
 * would misrepresent what Annie has actually done, so each frame states
 * precisely which photograph belongs in it. Drop a file into
 * `public/annie/` and pass `src` to turn a slot into a photograph — the
 * frame keeps its aspect ratio, so nothing on the page moves when you do.
 */
const TRANSFORMATIONS = [
  {
    label: "Nano rings, 20 inch, full head",
    before: "Before: fine hair at collarbone length, centre parting, daylight.",
    after: "After: nano rings fitted and cut in, same parting, same light.",
  },
  {
    label: "LA weave, 22 inch, mega volume",
    before: "Before: fine ponytail shot from behind, natural light.",
    after: "After: the weave row fitted, blended and styled into soft waves.",
  },
  {
    label: "Sew-in weave, 18 inch, protective style",
    before: "Before: natural coils, shot at the crown to show the braid base.",
    after: "After: the weft sewn in, blended at the leave-out and finished.",
  },
  {
    label: "Tape-in wefts, 16 inch, half head",
    before: "Before: shoulder-length hair, flat through the ends.",
    after: "After: tape wefts placed, showing how flat they sit at the root.",
  },
] as const;

const DETAILS = [
  "A nano bond at the root, shot close enough to show the scale.",
  "A shade match held against the client's own ends in daylight.",
  "A finished LA weave row, parted to show the weft hidden underneath.",
  "The blend at the leave-out on a sew-in, looking down at the crown.",
  "Hair before fitting: wefts laid out, colour-matched and measured.",
  "The studio inside Arndale Market — chair, mirror, and market light.",
  "A move-up in progress: rings opened and the hair re-set at the root.",
  "Finished and styled into curls before the client leaves.",
] as const;

export default function GalleryPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ]}
      />

      <section className="relative isolate overflow-hidden">
        <Atmosphere />
        <div className="container-page relative py-20 md:py-28">
          <AnnieHeading
            as="h1"
            label="Gallery"
            title="The work, before and after"
            lede="Same parting, same light, same angle. That is the only kind of before-and-after worth looking at."
          />
          <Reveal delay={140}>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={SALON.social.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Instagram aria-hidden="true" className="size-4" />
                More on {SALON.social.instagramHandle}
              </a>
              <AnnieLink href="/annie/book" tone="outline" arrow>
                Book a consultation
              </AnnieLink>
            </div>
          </Reveal>
        </div>
      </section>

      <AnnieSection className="pt-0">
        <div className="grid gap-10 lg:grid-cols-2">
          {TRANSFORMATIONS.map((item, i) => (
            <Reveal key={item.label} direction="zoom-blur" delay={(i % 2) * 90}>
              <BeforeAfter
                label={item.label}
                beforeCaption={item.before}
                afterCaption={item.after}
              />
            </Reveal>
          ))}
        </div>
      </AnnieSection>

      <AnnieSection tone="subtle">
        <AnnieHeading
          label="Details"
          title="Close up"
          lede="The bond, the blend, the match. The parts you only see if someone shows you."
        />
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>div]:mb-5 [&>div]:break-inside-avoid">
          {DETAILS.map((caption, i) => (
            <Reveal key={caption} direction="zoom" delay={(i % 3) * 70}>
              <PhotoFrame
                caption={caption}
                ratio={i % 3 === 1 ? "1 / 1" : "3 / 4"}
                index={i}
              />
            </Reveal>
          ))}
        </div>
      </AnnieSection>

      <AnnieSection className="py-16">
        <Reveal>
          <div className="annie-card mx-auto flex max-w-3xl flex-col items-center gap-5 p-8 text-center md:flex-row md:text-left">
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
              <Camera aria-hidden="true" className="size-5 text-primary" />
            </span>
            <div className="flex-1">
              <h2 className="font-display text-xl">
                These frames are waiting for Annie&rsquo;s photographs
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Rather than fill the gallery with stock pictures of other
                people&rsquo;s work, each frame says exactly which shot belongs
                in it. Drop the files into{" "}
                <code className="font-technical text-primary">public/annie/</code>{" "}
                and the slots become photographs without anything shifting.
              </p>
            </div>
          </div>
        </Reveal>
      </AnnieSection>
    </>
  );
}
