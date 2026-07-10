import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { GreekKeyDivider } from "@/components/motifs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The Skills Practice System",
  description:
    "Arete Academy's login-gated skills practice: short, skill-specific quizzes taken over months, with rolling mastery tracking, spaced revisiting, and plain-English reporting for parents.",
};

export default function SkillsPracticePage() {
  return (
    <div>
      <PageHeader
        kicker="Μελέτη · Practice"
        title="The Skills Practice System"
        lede="A single assessment gives a single data point. Our practice system gives a longitudinal picture: short, skill-specific quizzes taken over months — each one recorded, never overwritten, and read back to you in plain English."
      />

      <section className="mx-auto max-w-2xl space-y-5 px-6 pb-14 text-base leading-relaxed text-ink/85">
        <p>
          Pupils practise one skill at a time — short division, fractions of
          amounts, ratio — in short quizzes with a timer per question, a
          confidence check before each answer is marked, and a full worked
          solution after it. Not just the right answer: the reasoning.
        </p>
        <p>
          Underneath, every attempt is recorded permanently. Each skill
          carries a rolling mastery estimate that rises with good work and —
          this matters — fades when a skill is left unvisited, so
          &ldquo;mastered last term&rdquo; never quietly becomes
          &ldquo;forgotten by the exam&rdquo;. Skills that look shaky are
          folded back into later quizzes automatically. Nothing gets quietly
          forgotten.
        </p>
        <p>
          And when a question is answered wrongly, we record more than the
          mark. Every wrong answer is tagged with the specific misconception
          it typically reveals — forgot to carry, misread the question,
          right method with an arithmetic slip — so a parent or tutor sees
          not just that something went wrong, but what kind of thing, and
          whether it is resolving.
        </p>
      </section>

      <GreekKeyDivider />

      <section className="mx-auto max-w-2xl px-6 py-14">
        <h2 className="text-center text-3xl">What parents see</h2>
        <ul className="mt-8 space-y-4 text-sm leading-relaxed text-ink/85">
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">A mastery map.</strong>{" "}
            Every skill, colour-coded by how secure it is today — not on its
            best-ever day.
          </li>
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">Trends, not snapshots.</strong>{" "}
            A line per skill showing progress over months, built from the
            full history of attempts.
          </li>
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">Plain English.</strong>{" "}
            A written summary alongside the charts: what is secure, what is
            fragile, what the recent wrong answers have in common, and what
            we propose to do about it.
          </li>
        </ul>
      </section>

      <section className="border-t border-border bg-mist/30">
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-3xl">Access for families</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The practice system is part of an Arete Academy programme rather
            than a stand-alone product. Families with a place sign in below;
            if you are considering us, begin with an enquiry and we will show
            you the system as part of the consultation.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signin">Sign in to practise</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admissions">Enquire about a place</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
