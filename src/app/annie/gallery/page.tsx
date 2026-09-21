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
import type { PhotoId } from "@/lib/annie-photos";
import { photoProgress } from "@/lib/annie-photos";
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
    beforeId: "gallery-1-before",
    afterId: "gallery-1-after",
  },
  {
    label: "LA weave, 22 inch, mega volume",
    beforeId: "gallery-2-before",
    afterId: "gallery-2-after",
  },
  {
    label: "Sew-in weave, 18 inch, protective style",
    beforeId: "gallery-3-before",
    afterId: "gallery-3-after",
  },
  {
    label: "Tape-in wefts, 16 inch, half head",
    beforeId: "gallery-4-before",
    afterId: "gallery-4-after",
  },
] as const satisfies readonly {
  label: string;
  beforeId: PhotoId;
  afterId: PhotoId;
}[];

const DETAILS = [
  "detail-1",
  "detail-2",
  "detail-3",
  "detail-4",
  "detail-5",
  "detail-6",
  "detail-7",
  "detail-8",
] as const satisfies readonly PhotoId[];

export default function GalleryPage() {
  const { filled, total } = photoProgress();

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
                beforeId={item.beforeId}
                afterId={item.afterId}
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
          {DETAILS.map((id, i) => (
            <Reveal key={id} direction="zoom" delay={(i % 3) * 70}>
              <PhotoFrame
                id={id}
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
                {filled === 0
                  ? "These frames are waiting for Annie's photographs"
                  : `${filled} of ${total} photographs added`}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Rather than fill the gallery with stock pictures of other
                people&rsquo;s work, each frame says exactly which shot belongs
                in it. Drop the files into{" "}
                <code className="font-technical text-primary">public/annie/</code>,
                add a line to{" "}
                <code className="font-technical text-primary">annie-photos.ts</code>,
                and the slots become photographs without anything shifting.
              </p>
            </div>
          </div>
        </Reveal>
      </AnnieSection>
    </>
  );
}
