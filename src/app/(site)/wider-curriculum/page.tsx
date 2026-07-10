import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { GreekKeyDivider } from "@/components/motifs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The Wider Curriculum",
  description:
    "Shakespeare, poetry, history, classical civilisation and rhetoric at Arete Academy — the humanistic strand that strengthens every 11+ skill it touches.",
};

/* [DRAFT COPY — REVIEW] Strand descriptions are drafts for the founder to
   review against what is actually taught each term. */

const STRANDS = [
  {
    title: "Shakespeare",
    feeds: "Feeds comprehension and creative writing",
    body: "Recitation and close reading of scenes chosen for the age group. A child who has worked out what Shylock or Viola actually means has done comprehension of the most demanding kind; the exam passage afterwards feels straightforwardly modern.",
  },
  {
    title: "Poetry",
    feeds: "Feeds vocabulary, rhythm and comprehension",
    body: "Poems are learned by heart and then taken apart — rhythm, image, and word choice. Memorisation gives a child the shape of English sentences from the inside; analysis gives them something precise to say about any unseen text.",
  },
  {
    title: "European & World History",
    feeds: "Feeds general knowledge, essay structure and argument",
    body: "Narrative history told properly, then argued about. Why did Rome fall? Was the Armada doomed? Children learn that an argument needs evidence and an order — the exact architecture of a good essay, learned where it is exciting.",
  },
  {
    title: "Classical Civilisation",
    feeds: "Feeds English vocabulary at the root",
    body: "Myth, daily life, and a first acquaintance with Greek and Latin vocabulary. Around half of English derives from Latin and Greek; a child who knows a few dozen roots can decode hundreds of unfamiliar words — the most direct assistance the verbal reasoning paper will ever receive.",
  },
  {
    title: "Rhetoric & Public Speaking",
    feeds: "Feeds interview technique and composure",
    body: "Making a case aloud, courteously and in order: declamation, debate, and answering questions one has not rehearsed. For schools that interview, this is direct preparation; for every child, it is the discovery that their voice can be organised.",
  },
];

export default function WiderCurriculumPage() {
  return (
    <div>
      <PageHeader
        kicker="The Wider Curriculum"
        title="A foundation, not a distraction"
        lede="Each strand below is chosen because it strengthens a faculty the 11+ examines — vocabulary, comprehension, argument, composure — and because it would be worth a child's time even if it did not."
      />

      {/* The explainer, prominent per brief §4 */}
      <section className="mx-auto max-w-2xl px-6 pb-14">
        <div className="border-l-2 border-brass-soft bg-white p-6 sm:p-8">
          <h2 className="text-2xl">Why this is the shortest route, not the scenic one</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/85">
            <p>
              The 11+ rewards a large vocabulary, fast and accurate reading,
              clear written argument, and calm in front of the unfamiliar.
              None of these can be produced by practice papers alone, because
              practice papers exercise skills — they do not create them. The
              skills are created by reading difficult, interesting things and
              being helped to think about them.
            </p>
            <p>
              That is what this strand is. When a pupil traces{" "}
              <em>circumference</em> back to the Latin for &ldquo;carrying
              around&rdquo;, that is verbal reasoning. When they argue about
              the fall of Rome with evidence in hand, that is essay technique.
              When they recite a sonnet, that is comprehension, rhythm and
              nerve. The examination is downstream of all of it.
            </p>
          </div>
        </div>
      </section>

      <GreekKeyDivider />

      <section className="mx-auto max-w-3xl space-y-10 px-6 py-14">
        {STRANDS.map((strand) => (
          <article key={strand.title} className="grid gap-2 sm:grid-cols-[1fr_2fr] sm:gap-8">
            <div>
              <h3 className="text-2xl">{strand.title}</h3>
              <p className="mt-1 text-xs font-semibold tracking-wide text-brass uppercase">
                {strand.feeds}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-ink/85">{strand.body}</p>
          </article>
        ))}
        <p className="pt-2 text-center text-sm text-muted-foreground">
          [DRAFT COPY — REVIEW] Strand descriptions to be confirmed against
          the termly teaching plan.
        </p>
      </section>

      <div className="mx-auto max-w-2xl px-6 pb-8 text-center">
        <Button asChild size="lg">
          <Link href="/admissions">Ask how the strands would fit your child</Link>
        </Button>
      </div>
    </div>
  );
}
