import type { Metadata } from "next";
import { Camera, Instagram } from "lucide-react";
import { Atmosphere } from "@/components/annie/atmosphere";
import { BeforeAfter } from "@/components/annie/before-after";
import { BondViewer } from "@/components/annie/bond-viewer";
import { BreadcrumbJsonLd } from "@/components/annie/json-ld";
import { Reveal } from "@/components/annie/reveal";
import {
  AnnieHeading,
  AnnieLink,
  AnnieSection,
  PhotoFrame,
} from "@/components/annie/ui";
import type { PhotoId } from "@/lib/annie-photos";
import { SALON } from "@/lib/annie-salon";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Before and after transformations from Annie's Secret Hair Extension in Manchester — LA weave, nano rings, micro rings, mini-tip and tape hair extensions, fitted and blended in the studio.",
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
/**
 * Labels describe the colour and what is visibly different between the
 * two frames — nothing else. Annie's posts do not record which method
 * was fitted or how many inches, so neither does this page.
 */
const TRANSFORMATIONS = [
  {
    label: "Blonde — length and volume",
    beforeId: "blonde-before",
    afterId: "blonde-after",
  },
  {
    label: "Platinum — length added",
    beforeId: "platinum-before",
    afterId: "platinum-after",
  },
  {
    label: "Pearl blonde — length and waves",
    beforeId: "pearl-before",
    afterId: "pearl-after",
  },
  {
    label: "Copper — length and volume",
    beforeId: "copper-before",
    afterId: "copper-after",
  },
  {
    label: "Blonde — length and thickness",
    beforeId: "salon-blonde-before",
    afterId: "salon-blonde-after",
  },
  {
    label: "Brunette — bob to past the shoulders",
    beforeId: "bob-brunette-before",
    afterId: "bob-brunette-after",
  },
  {
    label: "Ginger — thickness through the ends",
    beforeId: "ginger-smooth-before",
    afterId: "ginger-smooth-after",
  },
] as const satisfies readonly {
  label: string;
  beforeId: PhotoId;
  afterId: PhotoId;
}[];

/** Every detail shot on the page, all of them real. */
const DETAILS = [
  "detail-waves-blonde",
  "detail-crown-platinum",
  "detail-waves-copper",
  "studio-mirror",
  "shopfront",
] as const satisfies readonly PhotoId[];

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

      <AnnieSection className="pt-0">
        <AnnieHeading
          label="The part a photo cannot show"
          title="Zoom into the bond itself"
          lede="No picture of a finished head shows you the bond — that is rather the point of a good one. So this is drawn instead, roughly to scale, and it says so."
        />
        <Reveal delay={120}>
          <div className="mx-auto mt-12 max-w-3xl">
            <BondViewer />
          </div>
        </Reveal>
      </AnnieSection>

    </>
  );
}
