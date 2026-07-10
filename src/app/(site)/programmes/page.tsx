import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Academic Programmes",
  description:
    "The four 11+ disciplines at Arete Academy — Mathematics, English, Verbal Reasoning and Non-Verbal Reasoning — taught against a 41-skill map of the curriculum.",
};

/* [DRAFT COPY — REVIEW] Programme descriptions below are drafts for the
   founder to review against the real scheme of work and skill taxonomy. */

const PROGRAMMES = [
  {
    title: "Mathematics",
    code: "The Quadrivium begins here",
    body: "Arithmetic fluency first, then the full 11+ syllabus — number, algebra, ratio, geometry, measurement and statistics — taught to mastery against our skill map. Pupils learn not only the method but the reason for the method, so unfamiliar problems hold no terror.",
    points: [
      "Diagnostic placement before teaching begins",
      "Skill-by-skill mastery tracking across the taxonomy",
      "Weekly problem sets calibrated to the child's current band",
    ],
  },
  {
    title: "English",
    code: "Reading, writing, and the ear for language",
    body: "Close reading of whole texts rather than extracts alone; comprehension taught as disciplined attention; composition taught as craft, with drafting and revision. Spelling, punctuation and grammar are woven through rather than bolted on.",
    points: [
      "Comprehension technique grounded in real reading",
      "Creative and persuasive writing with structured feedback",
      "Vocabulary built through etymology, not lists alone",
    ],
  },
  {
    title: "Verbal Reasoning",
    code: "Language as a system",
    body: "Every major verbal reasoning question type, taught as patterns of language rather than tricks. The wider curriculum feeds this paper directly: a child who knows how words are built decodes unfamiliar ones with a method rather than a guess.",
    points: [
      "All standard question families, mapped and practised",
      "Root-word and etymology work shared with the English strand",
      "Timed practice introduced gradually, once accuracy is secure",
    ],
  },
  {
    title: "Non-Verbal Reasoning",
    code: "Pattern, space, and logic",
    body: "Spatial and abstract reasoning taught explicitly — rotation, reflection, sequence, analogy and the rest — with the reasoning made verbal before it is made fast. Children learn to say why an answer is right, which is what makes speed reliable.",
    points: [
      "Explicit strategies for each question family",
      "Spatial visualisation exercises beyond the test formats",
      "Accuracy before speed, always",
    ],
  },
];

export default function ProgrammesPage() {
  return (
    <div>
      <PageHeader
        kicker="The Core"
        title="Academic Programmes"
        lede="The four disciplines of the 11+, taught systematically against a 41-skill map of the curriculum — so that every session has a purpose, and every purpose is visible."
      />

      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-16 md:grid-cols-2">
        {PROGRAMMES.map((programme) => (
          <Card key={programme.title}>
            <CardHeader>
              <CardTitle className="text-2xl">{programme.title}</CardTitle>
              <CardDescription className="font-serif text-base italic text-brass">
                {programme.code}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-ink/85">
                {programme.body}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {programme.points.map((point) => (
                  <li key={point} className="border-l-2 border-brass-soft/60 pl-3">
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-8 text-center">
        <p className="text-sm text-muted-foreground">
          [DRAFT COPY — REVIEW] Programme details to be checked against the
          current scheme of work before launch.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/skills-practice">See the Skills Practice system</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admissions">Enquire about a programme</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
