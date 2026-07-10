import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { GreekKeyDivider } from "@/components/motifs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Results & Testimonials",
  description:
    "What families say about Arete Academy, and how we talk about results: honestly, specifically, and with consent.",
};

/* [PLACEHOLDER] Anonymised placeholder testimonials — initials only, per the
   brief (Section 7). Replace with real testimonials once explicit parental
   consent is on file for each. Do not publish named results claims. */
const TESTIMONIALS = [
  {
    initials: "R. A.",
    context: "Parent of a Year 6 pupil",
    quote:
      "[PLACEHOLDER] What struck us was the honesty. The first report told us plainly what our son could not yet do — and then, term by term, we watched that list shrink.",
  },
  {
    initials: "S. M.",
    context: "Parent of a Year 5 pupil",
    quote:
      "[PLACEHOLDER] My daughter started asking for more poetry at bedtime. I did not expect that from 11+ preparation.",
  },
  {
    initials: "K. O.",
    context: "Parent of a Year 6 pupil",
    quote:
      "[PLACEHOLDER] The diagnostic report was the first time anyone had shown us exactly where the gaps were, rather than a mark out of a hundred. It changed how we spent the final six months.",
  },
  {
    initials: "T. B.",
    context: "Parent of two pupils",
    quote:
      "[PLACEHOLDER] Calm, rigorous, and no theatre. Both boys arrived at their exams unafraid, which is what we had hoped to buy and did not quite believe was possible.",
  },
];

export default function ResultsPage() {
  return (
    <div>
      <PageHeader
        kicker="Results & Testimonials"
        title="Spoken for, quietly"
        lede="We let families speak in their own words, and we publish nothing without consent. Testimonials appear over initials only."
      />

      <section className="mx-auto max-w-2xl px-6 pb-12 text-base leading-relaxed text-ink/85">
        <p>
          We keep our claims honest and specific. In time this page will list
          the schools at which our pupils have gained places — named schools,
          real years, nothing rounded up. What we will not publish is a
          success percentage: those figures are unverifiable by design, and
          families who share our standards know it. [PLACEHOLDER — add
          school-place outcomes as they accrue, with family consent.]
        </p>
      </section>

      <GreekKeyDivider />

      <div className="mx-auto grid max-w-4xl gap-6 px-6 py-14 sm:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <Card key={t.initials}>
            <CardContent className="flex h-full flex-col justify-between gap-6">
              <blockquote className="font-serif text-lg leading-relaxed text-navy">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer className="text-sm text-muted-foreground">
                <span className="font-semibold text-brass">{t.initials}</span>
                {" · "}
                {t.context}
              </footer>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-8 text-center">
        <p className="text-sm text-muted-foreground">
          Every testimonial on this page is published with explicit parental
          consent on file, and identified by initials only.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/admissions">Begin your own enquiry</Link>
        </Button>
      </div>
    </div>
  );
}
