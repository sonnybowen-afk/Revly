/**
 * Seed deck library.
 *
 * Real GCSE and A-Level content so the app is useful on first load rather
 * than presenting an empty shell. Learners can add their own cards on top;
 * these stay as the starting library.
 */

export type Level = "GCSE" | "A-Level";

export interface SeedCard {
  id: string;
  front: string;
  back: string;
  /** Optional exam-technique note shown after the answer is revealed. */
  hint?: string;
}

export interface Deck {
  id: string;
  title: string;
  subject: string;
  level: Level;
  exam: string;
  description: string;
  /** Tailwind-safe token name used for the deck's accent chip. */
  accent: "brand" | "study" | "success" | "warning";
  cards: SeedCard[];
}

export const DECKS: Deck[] = [
  {
    id: "bio-cells",
    title: "Cell Biology",
    subject: "Biology",
    level: "GCSE",
    exam: "AQA Paper 1",
    description:
      "Cell structure, transport and division — the highest-yield topic in Paper 1.",
    accent: "success",
    cards: [
      {
        id: "bio-cells-1",
        front: "Name three structures found in a plant cell but not an animal cell.",
        back: "Cell wall (cellulose), permanent vacuole, and chloroplasts.",
        hint: "Three marks: one per structure. Don't write 'chlorophyll' — that's the pigment, not the organelle.",
      },
      {
        id: "bio-cells-2",
        front: "Define diffusion.",
        back: "The net movement of particles from an area of higher concentration to an area of lower concentration, down a concentration gradient. It is a passive process.",
        hint: "The word 'net' earns the mark. 'Passive' is often a second mark.",
      },
      {
        id: "bio-cells-3",
        front: "Define osmosis.",
        back: "The diffusion of water molecules from a dilute solution to a concentrated solution through a partially permeable membrane.",
        hint: "You must say 'partially permeable' — 'semi-permeable' is not credited by AQA.",
      },
      {
        id: "bio-cells-4",
        front: "Define active transport and give one example.",
        back: "Movement of substances against a concentration gradient, from low to high concentration, using energy from respiration. Example: mineral ion uptake by root hair cells.",
        hint: "'Requires energy from respiration' is the discriminating mark.",
      },
      {
        id: "bio-cells-5",
        front: "State the equation for magnification.",
        back: "Magnification = size of image ÷ size of real object",
        hint: "Convert to the same units first. 1 mm = 1000 µm.",
      },
      {
        id: "bio-cells-6",
        front: "What are the three stages of the cell cycle?",
        back: "1. Interphase — DNA replicates and organelles grow in number. 2. Mitosis — chromosomes separate. 3. Cytokinesis — cytoplasm and membrane divide into two identical cells.",
      },
      {
        id: "bio-cells-7",
        front: "Why are stem cells from meristems useful in plants?",
        back: "They can differentiate into any plant cell type throughout the plant's life, so they can be used to clone rare or disease-resistant plants quickly and cheaply.",
      },
      {
        id: "bio-cells-8",
        front: "Give three adaptations of a root hair cell.",
        back: "Large surface area from the hair projection; thin cell wall for a short diffusion path; many mitochondria to release energy for active transport.",
        hint: "Always link each adaptation to its function — adaptation alone rarely scores.",
      },
    ],
  },
  {
    id: "chem-bonding",
    title: "Bonding & Structure",
    subject: "Chemistry",
    level: "GCSE",
    exam: "AQA Paper 1",
    description:
      "Ionic, covalent and metallic bonding, plus the property questions examiners build on them.",
    accent: "study",
    cards: [
      {
        id: "chem-bond-1",
        front: "What is ionic bonding?",
        back: "The electrostatic force of attraction between oppositely charged ions, formed when electrons transfer from a metal to a non-metal.",
        hint: "'Electrostatic force of attraction' is the mark-scheme phrase. Learn it verbatim.",
      },
      {
        id: "chem-bond-2",
        front: "Why do ionic compounds have high melting points?",
        back: "There are strong electrostatic forces of attraction between oppositely charged ions acting in all directions throughout the giant lattice. A large amount of energy is needed to overcome them.",
      },
      {
        id: "chem-bond-3",
        front: "Why does graphite conduct electricity but diamond does not?",
        back: "In graphite each carbon forms three covalent bonds, leaving one delocalised electron per atom free to move and carry charge. In diamond all four outer electrons are used in covalent bonds, so there are no free electrons.",
        hint: "Compare both substances explicitly — a one-sided answer loses the comparison mark.",
      },
      {
        id: "chem-bond-4",
        front: "Explain why metals are malleable.",
        back: "Metal atoms are arranged in layers that can slide over one another without breaking the metallic bonding, because the delocalised electrons continue to attract the positive ions.",
      },
      {
        id: "chem-bond-5",
        front: "Why do simple molecular substances have low boiling points?",
        back: "The intermolecular forces between molecules are weak and need little energy to overcome. The covalent bonds within the molecules are strong but are not broken during boiling.",
        hint: "The second sentence is the mark most candidates miss.",
      },
      {
        id: "chem-bond-6",
        front: "What is the charge on an ion formed by a Group 2 element?",
        back: "2+ — it loses two electrons to achieve a full outer shell.",
      },
      {
        id: "chem-bond-7",
        front: "Define an alloy and explain why alloys are harder than pure metals.",
        back: "An alloy is a mixture of a metal with at least one other element. The different-sized atoms distort the regular layers, so the layers cannot slide over each other easily.",
      },
    ],
  },
  {
    id: "maths-diff",
    title: "Differentiation",
    subject: "Mathematics",
    level: "A-Level",
    exam: "Edexcel Pure 1",
    description:
      "Rules, stationary points and the applications that carry the method marks.",
    accent: "brand",
    cards: [
      {
        id: "maths-diff-1",
        front: "Differentiate y = xⁿ from first principles — state the definition.",
        back: "f′(x) = lim(h→0) [f(x + h) − f(x)] ÷ h",
        hint: "The limit notation itself is worth a mark. Never drop the 'lim as h→0'.",
      },
      {
        id: "maths-diff-2",
        front: "State the product rule.",
        back: "If y = uv then dy/dx = u(dv/dx) + v(du/dx)",
      },
      {
        id: "maths-diff-3",
        front: "State the quotient rule.",
        back: "If y = u/v then dy/dx = [v(du/dx) − u(dv/dx)] ÷ v²",
        hint: "The numerator order matters — swapping the terms flips the sign and loses every accuracy mark.",
      },
      {
        id: "maths-diff-4",
        front: "State the chain rule.",
        back: "If y = f(u) and u = g(x) then dy/dx = (dy/du) × (du/dx)",
      },
      {
        id: "maths-diff-5",
        front: "How do you determine the nature of a stationary point?",
        back: "Find where dy/dx = 0, then evaluate d²y/dx². If d²y/dx² > 0 it is a minimum; if < 0 it is a maximum; if = 0 the test is inconclusive, so examine the sign of the gradient either side.",
        hint: "The inconclusive case is the most commonly examined part of this question.",
      },
      {
        id: "maths-diff-6",
        front: "Differentiate sin(x), cos(x) and tan(x) with respect to x.",
        back: "d/dx sin x = cos x;  d/dx cos x = −sin x;  d/dx tan x = sec²x  (x in radians)",
        hint: "These only hold in radians. Degrees will cost you the question.",
      },
      {
        id: "maths-diff-7",
        front: "Differentiate eˣ and ln(x).",
        back: "d/dx eˣ = eˣ;  d/dx ln x = 1/x  (for x > 0)",
      },
      {
        id: "maths-diff-8",
        front: "What does it mean for a function to be increasing on an interval?",
        back: "f′(x) > 0 for all x in that interval — the gradient is positive throughout.",
      },
    ],
  },
  {
    id: "phys-mechanics",
    title: "Mechanics",
    subject: "Physics",
    level: "A-Level",
    exam: "AQA Paper 1",
    description:
      "SUVAT, projectiles, moments and momentum with the definitions examiners insist on.",
    accent: "warning",
    cards: [
      {
        id: "phys-mech-1",
        front: "State the four SUVAT equations.",
        back: "v = u + at;  s = ut + ½at²;  v² = u² + 2as;  s = ½(u + v)t",
        hint: "They only apply to uniform acceleration. Say so if the question asks for a condition.",
      },
      {
        id: "phys-mech-2",
        front: "Define momentum and state its unit.",
        back: "Momentum p = mass × velocity. Unit: kg m s⁻¹ (equivalently N s). It is a vector quantity.",
      },
      {
        id: "phys-mech-3",
        front: "State the principle of conservation of linear momentum.",
        back: "In a closed system with no external resultant force, the total momentum before a collision equals the total momentum after.",
        hint: "'No external resultant force' is the condition mark.",
      },
      {
        id: "phys-mech-4",
        front: "What is the difference between an elastic and an inelastic collision?",
        back: "Both conserve momentum. An elastic collision also conserves kinetic energy; an inelastic collision does not — some kinetic energy is transferred to other forms.",
      },
      {
        id: "phys-mech-5",
        front: "State the principle of moments.",
        back: "For a body in equilibrium, the sum of the clockwise moments about any point equals the sum of the anticlockwise moments about that same point.",
        hint: "'About the same point' is required for full marks.",
      },
      {
        id: "phys-mech-6",
        front: "Why is the horizontal velocity of a projectile constant (ignoring air resistance)?",
        back: "There is no horizontal force acting, so by Newton's first law there is no horizontal acceleration and the horizontal component of velocity stays unchanged.",
      },
      {
        id: "phys-mech-7",
        front: "Define the newton.",
        back: "One newton is the resultant force that gives a mass of 1 kg an acceleration of 1 m s⁻².",
      },
    ],
  },
  {
    id: "eng-macbeth",
    title: "Macbeth — Key Quotations",
    subject: "English Literature",
    level: "GCSE",
    exam: "AQA Paper 1",
    description:
      "Quotations with analysis, ready for closed-book retrieval under timed conditions.",
    accent: "brand",
    cards: [
      {
        id: "eng-mac-1",
        front: "Quote: Macbeth's ambition, Act 1 Scene 7.",
        back: "\"I have no spur to prick the sides of my intent, but only vaulting ambition, which o'erleaps itself.\"",
        hint: "Equestrian metaphor. 'Vaulting' suggests ambition that overreaches and self-destructs — it literally trips over itself.",
      },
      {
        id: "eng-mac-2",
        front: "Quote: Lady Macbeth rejecting femininity, Act 1 Scene 5.",
        back: "\"Come, you spirits that tend on mortal thoughts, unsex me here.\"",
        hint: "Imperative verbs and supernatural invocation. Links to Jacobean anxieties about witchcraft and the natural order.",
      },
      {
        id: "eng-mac-3",
        front: "Quote: Macbeth's guilt after the murder, Act 2 Scene 2.",
        back: "\"Will all great Neptune's ocean wash this blood clean from my hand?\"",
        hint: "Rhetorical question plus classical allusion — hyperbole showing guilt is beyond cleansing. Contrast with Lady Macbeth's 'a little water clears us of this deed'.",
      },
      {
        id: "eng-mac-4",
        front: "Quote: Lady Macbeth's guilt in the sleepwalking scene, Act 5 Scene 1.",
        back: "\"Out, damned spot! Out, I say!\"",
        hint: "The prose form here signals her mental collapse — she has lost the verse of nobility. Structural point worth crediting.",
      },
      {
        id: "eng-mac-5",
        front: "Quote: the opening paradox that frames the play.",
        back: "\"Fair is foul, and foul is fair.\"",
        hint: "Chiasmus and paradox, establishing the inversion of the natural order as the play's central motif.",
      },
      {
        id: "eng-mac-6",
        front: "Quote: Macbeth's nihilism on hearing of his wife's death, Act 5 Scene 5.",
        back: "\"Life's but a walking shadow, a poor player that struts and frets his hour upon the stage.\"",
        hint: "Metatheatrical metaphor. Life reduced to performance — meaningless and brief.",
      },
    ],
  },
  {
    id: "hist-cold-war",
    title: "The Cold War 1941–1991",
    subject: "History",
    level: "GCSE",
    exam: "Edexcel Paper 2",
    description:
      "Dates, causes and consequences for the source and interpretation questions.",
    accent: "study",
    cards: [
      {
        id: "hist-cw-1",
        front: "What was the Truman Doctrine (1947) and why did it matter?",
        back: "A US pledge to support free peoples resisting subjugation, effectively committing the USA to containment of communism. It marked the formal end of US isolationism.",
      },
      {
        id: "hist-cw-2",
        front: "What was the Marshall Plan (1947)?",
        back: "$13 billion of American economic aid to rebuild Western Europe. The USA saw it as recovery; Stalin saw it as dollar imperialism designed to buy influence.",
        hint: "Examiners reward giving both interpretations.",
      },
      {
        id: "hist-cw-3",
        front: "Why did the Berlin Blockade happen (1948–49) and how did it end?",
        back: "Stalin blockaded West Berlin's land routes in response to currency reform and Bizonia. The Allies responded with the Berlin Airlift, flying in supplies for 11 months until Stalin lifted the blockade in May 1949.",
      },
      {
        id: "hist-cw-4",
        front: "Give the three key dates of the Cuban Missile Crisis.",
        back: "14 October 1962: U-2 spy plane photographs missile sites. 22 October: Kennedy announces a naval quarantine. 28 October: Khrushchev agrees to withdraw the missiles.",
      },
      {
        id: "hist-cw-5",
        front: "What was détente and name one agreement associated with it?",
        back: "A relaxation of Cold War tensions in the 1970s. Examples: SALT I (1972) limiting strategic arms, or the Helsinki Accords (1975) on borders and human rights.",
      },
      {
        id: "hist-cw-6",
        front: "What were glasnost and perestroika?",
        back: "Gorbachev's reforms from 1985. Glasnost meant 'openness' — greater freedom of speech and press. Perestroika meant 'restructuring' — limited market reform of the Soviet economy.",
      },
    ],
  },
];

export function getDeck(id: string): Deck | undefined {
  return DECKS.find((d) => d.id === id);
}

export const SUBJECTS = Array.from(new Set(DECKS.map((d) => d.subject))).sort();

export function totalCards(): number {
  return DECKS.reduce((sum, d) => sum + d.cards.length, 0);
}
