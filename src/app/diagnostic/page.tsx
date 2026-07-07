import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { GreekKeyDivider } from "@/components/motifs";
import { Button } from "@/components/ui/button";
import { DiagnosticQuiz } from "@/components/diagnostic/diagnostic-quiz";

export const metadata: Metadata = {
  title: "The Diagnostic",
  description:
    "Arete Academy's adaptive diagnostic assessment: a skill-by-skill map of where a child truly stands, reported to parents in plain English. Try the demonstration.",
};

export default function DiagnosticPage() {
  return (
    <div>
      <PageHeader
        kicker="Γνῶθι σεαυτόν · Know thyself"
        title="The Diagnostic"
        lede="Before we teach a child anything, we find out — precisely — what they already know. The Diagnostic is an adaptive assessment that maps ability skill by skill, and reports what it finds in plain English."
      />

      <section className="mx-auto max-w-2xl space-y-5 px-6 pb-14 text-base leading-relaxed text-ink/85">
        <p>
          Most assessments produce a mark. The Diagnostic produces a map. It
          draws on a bank of questions tied to our 41-skill taxonomy of the
          11+ curriculum and adapts as the child works: answer well and the
          questions step up; struggle and they quietly ease off. The result is
          not a percentage but a picture — which skills are secure, which are
          fragile, and where the true edge of ability lies.
        </p>
        <p>
          It also records what a mark cannot: how long each answer took, and
          whether the child <em>knew</em> or guessed. A wrong answer given
          with certainty tells a tutor more than the mark itself — it is
          usually a settled misconception, and it is the first thing good
          teaching addresses.
        </p>
        <p>
          The demonstration below is a miniature of the experience — eight
          questions across two skill areas, with the same adaptive behaviour,
          timing and confidence capture as the full assessment.
          {/* TODO: PHASE 2 — replace demo with the real engine: full
              taxonomy, error-type tagging, retention across sittings,
              parent and tutor dashboards. */}
        </p>
      </section>

      <section className="border-y border-border bg-mist/30 px-6 py-14 sm:py-16">
        <DiagnosticQuiz />
      </section>

      <section className="mx-auto max-w-2xl px-6 pt-14 pb-4">
        <h2 className="text-center text-3xl">In the full assessment</h2>
        <ul className="mt-8 space-y-4 text-sm leading-relaxed text-ink/85">
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">The complete taxonomy.</strong>{" "}
            All 41 skills across Mathematics, English, Verbal and Non-Verbal
            Reasoning, in three difficulty bands.
          </li>
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">More than right or wrong.</strong>{" "}
            Response times, confidence, and error type — a careless slip, a
            conceptual gap, or a misread question — recorded for every answer.
          </li>
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">A picture over time.</strong>{" "}
            Repeated sittings show retention and decay, not just a single
            snapshot — so revision goes where it is needed.
          </li>
          <li className="border-l-2 border-brass-soft pl-5">
            <strong className="text-navy">Plain English for parents.</strong>{" "}
            A per-skill mastery map with a written narrative — what is
            secure, what is fragile, and what we propose to do about it.
          </li>
        </ul>
        <GreekKeyDivider className="mt-12" />
        <div className="mt-10 text-center">
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            The Diagnostic is the first step for every child who joins us. To
            arrange a baseline assessment, begin with an enquiry.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/admissions">Arrange a baseline assessment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
