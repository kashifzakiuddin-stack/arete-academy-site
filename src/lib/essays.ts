/*
  Sample essays for The Commonplace Book, drafted in the register described
  in Section 8 of the brief: a classical or historical text briefly unpacked,
  with a line drawn back to something a child might be reading or writing.

  [DRAFT COPY — REVIEW] All three essays are drafts for the founder to review
  and make their own before launch.

  TODO: PHASE 2 — move to a CMS so the Commonplace Book can be edited
  without a developer.
*/

export interface Essay {
  slug: string;
  title: string;
  standfirst: string;
  term: string;
  date: string; // ISO, for <time> elements
  paragraphs: string[];
}

export const ESSAYS: Essay[] = [
  {
    slug: "on-beginning-well",
    title: "On Beginning Well",
    standfirst:
      "Herodotus opens the first work of history with one long, careful sentence. What a child can learn from it about starting anything at all.",
    term: "Michaelmas Term",
    date: "2025-10-06",
    paragraphs: [
      "The first work of history in the Western tradition begins like this: “Herodotus of Halicarnassus here displays his inquiry, so that human achievements may not become forgotten in time, and great and marvellous deeds — some displayed by Greeks, some by barbarians — may not be without their glory.” One sentence, and we already know who is speaking, what he is doing, and why it matters.",
      "Herodotus calls his work an inquiry — in his Greek, historia, which is where our word comes from. He does not promise to be entertaining, though he constantly is; he promises to find things out and to keep them from being lost. The opening is a small act of confidence: the writer tells you plainly what he is about, and then gets on with it.",
      "Children are asked to begin things constantly — a story, a comprehension answer, a letter to a headteacher they have never met — and the blank page is genuinely difficult, for them as for everyone. The instinct under pressure is to clear the throat: “In this essay I am going to write about…” Herodotus offers a better model. Say who is speaking, say what the piece will do, and let the reader feel that a definite mind is at work.",
      "In practice, we ask pupils to try a Herodotean opening on small things. Not “I am going to describe my holiday,” but “Three things happened in Whitstable last August that my family still argues about.” The second version makes a promise, and a promise creates a reader who wants to see it kept.",
      "It is a long way from Halicarnassus in the fifth century before Christ to a creative-writing task in an exam hall in Croydon. But the craft is the same craft. A child who has once noticed how the father of history clears his throat — which is to say, not at all — has a possession that will outlast any examination.",
    ],
  },
  {
    slug: "small-words-old-roots",
    title: "Small Words, Old Roots",
    standfirst:
      "Why a little Greek and Latin is the shortest route to a large English vocabulary — and to calm in the verbal reasoning paper.",
    term: "Lent Term",
    date: "2026-01-19",
    paragraphs: [
      "Take the word circumference, which every child meets in maths. Inside it sits the Latin circum, “around”, and ferre, “to carry”: the line that carries itself around. A child who knows that much has not merely memorised a definition; they can now make an educated guess at circumnavigate, circumspect, and circumstance — words they may never have been taught at all.",
      "This is the quiet argument for giving children a little Greek and Latin: not as an ornament, but as a master key. English took its learned vocabulary from the classical languages more or less wholesale, so a few dozen roots unlock thousands of words. Tele, “far off”, gives telescope, telephone, telegraph. Graph, “writing”, gives autograph, biography, paragraph. The child starts to see that long words are not opaque objects to be feared but small machines with visible parts.",
      "The verbal reasoning paper rewards exactly this habit of mind. Faced with an unfamiliar word and four possible synonyms, the pupil who can take the word apart has something better than luck: they have a method. And a method is also a comfort. Much of what looks like ability in an examination room is really composure, and composure comes from having somewhere to start.",
      "There is a deeper gain, harder to measure. A child who knows that words have histories begins to treat language as something inherited rather than arbitrary — something people made, and that they may one day make things with in turn. That is a disposition worth more than any single mark scheme, and it happens, conveniently, to raise marks too.",
    ],
  },
  {
    slug: "on-learning-a-poem-by-heart",
    title: "On Learning a Poem by Heart",
    standfirst:
      "Memorisation has fallen out of fashion. Shelley’s “Ozymandias”, fourteen lines long, is a good argument for bringing it back.",
    term: "Summer Term",
    date: "2026-05-04",
    paragraphs: [
      "“My name is Ozymandias, King of Kings; / Look on my Works, ye Mighty, and despair!” A child can learn Shelley’s sonnet in a week — it is only fourteen lines — and most of our pupils do. The question worth answering is why we still ask, when no examination will ever require it.",
      "The first answer is rhythm. A child who carries a sonnet in their head has internalised the shape of an English sentence under pressure: where it breathes, how it turns, what it sounds like when every word is doing work. That ear shows up, unmistakably, in their own writing. Examiners call it fluency; it is really just good company, kept early.",
      "The second answer is comprehension. “Ozymandias” is a poem about a boast outlived by the desert, told at two removes — the poet reports a traveller, who reports an inscription. A child who has learned it by heart has time to notice this, because the words are no longer strangers. Close reading becomes something one does from inside the poem rather than through the window of the page.",
      "The third answer is older than either. The Greeks made Memory — Mnemosyne — the mother of all the Muses, which is a mythological way of saying something true: nothing can be made, or thought, or written, except out of what a person carries with them. A memorised poem is furniture for the mind, and it cannot be confiscated at the door of the exam hall.",
      "We do not set memorisation as a chore, and there are no prizes for speed. The poem is simply learned, a little each session, until one day the child discovers they own it. That discovery — that difficult things yield to patience — may be the most transferable exam skill we teach.",
    ],
  },
];

export function getEssay(slug: string): Essay | undefined {
  return ESSAYS.find((essay) => essay.slug === slug);
}
