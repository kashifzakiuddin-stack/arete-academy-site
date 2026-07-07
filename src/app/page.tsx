import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GreekKeyDivider, LaurelMark, ColumnMark } from "@/components/motifs";

export default function HomePage() {
  return (
    <>
      {/* Hero — statement of philosophy up front, then two clear paths. */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <LaurelMark className="size-14 text-brass" />
          <p className="inscription mt-6">Arete Academy · 11+ Tuition</p>
          <h1 className="mt-5 text-4xl leading-[1.15] text-balance sm:text-6xl">
            The shaping of a person, not merely the priming of a candidate.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Arete Academy prepares children for the 11+ within an education in
            the older sense — one that treats the examination as a worthy
            proving ground, and the child as considerably more than a score.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/diagnostic">
                Take the Diagnostic <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admissions">Enquire about a place</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What we are for — technique vs formation */}
      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <p className="inscription text-center">What we are for</p>
        <h2 className="mt-4 text-center text-3xl sm:text-4xl">
          Technique is necessary. It is not sufficient.
        </h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-base leading-relaxed text-ink/85">
          <p>
            A child can be drilled to pass an examination, and for a while the
            drilling works. But the schools our families aspire to are not
            looking for children who have been drilled. They are looking for
            children who read willingly, reason clearly, write with something
            to say, and hold their nerve when a question is unfamiliar —
            qualities that cannot be crammed, because they are not techniques.
            They are the early forms of character.
          </p>
          <p>
            Our teaching therefore runs on two strands at once. The first is
            rigorous, systematic preparation in the four 11+ disciplines,
            mapped skill by skill so that nothing is left to chance. The
            second is a wider curriculum — Shakespeare, poetry, history, the
            classical world — chosen because it strengthens precisely the
            faculties the examination tests, and because it would be worth
            teaching even if it did not.
          </p>
          <p>
            The Greeks had a word for excellence of this kind:{" "}
            <em className="font-serif text-lg text-navy">arete</em> — the
            excellence of a thing that has become fully what it is. It is the
            standard we hold ourselves to, before we ask it of any child.
          </p>
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="link">
            <Link href="/philosophy">
              Read our philosophy <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <GreekKeyDivider />

      {/* Three pillars */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <p className="inscription text-center">The programme</p>
        <h2 className="mt-4 text-center text-3xl sm:text-4xl">
          Three parts of one education
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <ColumnMark className="mb-2 size-10 text-brass-soft" />
              <CardTitle>The Core</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Mathematics, English, verbal and non-verbal reasoning, taught
                systematically against a 41-skill map of the 11+ curriculum.
                Every session has a purpose; every purpose is visible.
              </p>
              <Link
                href="/programmes"
                className="text-sm font-medium text-mid-blue hover:text-brass"
              >
                Academic programmes →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <LaurelMark className="mb-2 size-10 text-brass-soft" />
              <CardTitle>The Wider Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Shakespeare, poetry, history and the classical world — not an
                extra, but a foundation. Vocabulary, comprehension, argument
                and composure are formed here, then measured in the exam hall.
              </p>
              <Link
                href="/wider-curriculum"
                className="text-sm font-medium text-mid-blue hover:text-brass"
              >
                The wider curriculum →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <svg
                viewBox="0 0 40 40"
                aria-hidden="true"
                className="mb-2 size-10 text-brass-soft"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="20" cy="20" r="16" />
                <path d="M20 10 V20 L27 24" strokeLinecap="round" />
              </svg>
              <CardTitle>The Diagnostic</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                An adaptive assessment that finds the true edge of a
                child&rsquo;s ability — skill by skill, not mark by mark — and
                reports it to parents in plain English.
              </p>
              <Link
                href="/diagnostic"
                className="text-sm font-medium text-mid-blue hover:text-brass"
              >
                Try the demonstration →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why the humanities strand is not a distraction — prominent, per brief §4 */}
      <section className="border-y border-border bg-navy text-mist">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <p className="inscription text-brass-soft">A fair question</p>
          <h2 className="mt-4 text-3xl text-mist sm:text-4xl">
            &ldquo;Why Shakespeare, when my child needs maths?&rdquo;
          </h2>
          <div className="mt-8 space-y-5 text-left text-base leading-relaxed text-mist/85 sm:text-center">
            <p>
              Because the 11+ is, above all, a test of language and reasoning
              under pressure — and the humanities are where language and
              reasoning are formed. A child who has read closely, argued a
              position, and learned how English words are built from Greek and
              Latin roots walks into the verbal reasoning paper already at
              home. The mathematics is taught with equal rigour; the wider
              curriculum is what makes the rest of the paper feel familiar.
            </p>
            <p>
              We are glad to be asked. It is the question of a parent taking
              their child&rsquo;s time seriously, and it deserves a serious
              answer.
            </p>
          </div>
          <div className="mt-8">
            <Button asChild variant="secondary">
              <Link href="/wider-curriculum">How the strands reinforce each other</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quiet close */}
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4 text-center sm:pt-24">
        <h2 className="text-3xl sm:text-4xl">Begin with a conversation</h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          Every programme we teach is designed around one family. Tell us
          about your child, and we will arrange a consultation — unhurried,
          and without obligation.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/admissions">Enquire</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
