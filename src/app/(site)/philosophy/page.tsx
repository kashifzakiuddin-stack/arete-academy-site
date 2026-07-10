import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { GreekKeyDivider } from "@/components/motifs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Philosophy",
  description:
    "Paideia at Arete Academy: an account of what we mean by excellence — arete — and why we prepare children for the 11+ by educating the whole person.",
};

export default function PhilosophyPage() {
  return (
    <article>
      <PageHeader
        kicker="Παιδεία · Paideia — the formation of a person"
        title="Our Philosophy"
        lede="What we mean by excellence, and why we will not settle for its imitation."
      />

      <div className="mx-auto max-w-2xl space-y-6 px-6 pb-8 text-base leading-relaxed text-ink/85">
        <p className="font-serif text-2xl leading-snug text-navy">
          The word <em>arete</em> is usually translated “excellence”, but the
          translation loses something. To the Greeks it meant the excellence
          of a thing that has become fully itself — the arete of a knife is to
          cut cleanly; the arete of a horse is speed and courage; the arete of
          a person is character and craft together, neither one without the
          other.
        </p>

        <p>
          That is the excellence we take as our standard. Not excellence as a
          trophy — a percentage, a place, a letter after a name — but
          excellence as a condition of the person: a child who reasons
          honestly, reads with appetite, writes with care, and meets
          difficulty with composure rather than dread. Aristotle observed
          that we become just by doing just acts, brave by doing brave ones;
          excellence, he concluded, is not an act but a habit. Our teaching
          is the patient formation of such habits.
        </p>

        <p>
          The older Greek word for this whole undertaking was{" "}
          <em>paideia</em>: not schooling, exactly, and not training, but the
          shaping of a person — the slow work by which a child comes into
          possession of their own mind. The ideal it aimed at was the{" "}
          <em>kalos kagathos</em>, the person both good and admirable, in whom
          ability and character were not two subjects on a timetable but one
          thing. We take our name from the Academy of Plato, the olive grove
          where that tradition of teaching began, and we try to be worthy of
          the borrowing.
        </p>

        <GreekKeyDivider className="py-6" />

        <h2 className="text-3xl">The examination, in its place</h2>

        <p>
          None of this is a way of talking down the 11+. Families come to us
          because a good school matters, and it does matter — profoundly. The
          right school can set the course of a childhood. We prepare children
          for the examination with complete seriousness: systematically,
          skill by skill, with nothing left to sentiment or chance. Our
          diagnostic work exists precisely so that ambition can be pursued
          with clear eyes.
        </p>

        <p>
          But we hold the examination in its place. It is a proving ground —
          one worthy proving ground among several a child will meet — and not
          the purpose of their education. The distinction matters practically
          as well as morally. A child taught only technique carries a
          borrowed competence that expires on the day of the test. A child
          who has been formed — who owns the reading, the reasoning, the
          habits of work — carries that possession into the examination, into
          the school that follows it, and well beyond. Preparation of this
          kind does not trade against results. It is where results come from.
        </p>

        <h2 className="text-3xl">What this looks like in practice</h2>

        <ul className="list-none space-y-4">
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">Mastery before pace.</strong>{" "}
            We find the true edge of a child&rsquo;s understanding and teach from
            there, rather than marching every pupil through the same scheme at
            the same speed.
          </li>
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">The whole curriculum.</strong>{" "}
            Shakespeare, poetry, history and the classical world sit beside
            mathematics and reasoning — because they feed the same faculties
            the examination tests, and because they are worth a
            child&rsquo;s time in themselves.
          </li>
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">Honesty with parents.</strong>{" "}
            We report what we find in plain English — strengths, gaps, and what
            we propose to do about them. Reassurance is cheap; accuracy is a
            form of respect.
          </li>
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">Calm, not urgency.</strong>{" "}
            A child&rsquo;s last year of primary school should not feel like an
            emergency. Steady, well-directed work outperforms panic, and it
            leaves the child intact.
          </li>
        </ul>

        <p>
          We assume the families who find their way to us already share these
          standards. Our work is simply to honour them.
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-6 pt-6 pb-4 text-center">
        <Button asChild size="lg">
          <Link href="/admissions">Arrange a consultation</Link>
        </Button>
      </div>
    </article>
  );
}
