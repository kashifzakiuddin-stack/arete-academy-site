import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ESSAYS, getEssay } from "@/lib/essays";
import { GreekKeyDivider } from "@/components/motifs";

export function generateStaticParams() {
  return ESSAYS.map((essay) => ({ slug: essay.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) return {};
  return {
    title: essay.title,
    description: essay.standfirst,
  };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 pt-16 pb-8 sm:pt-24">
      <header className="text-center">
        <p className="inscription">
          The Commonplace Book · {essay.term}{" "}
          <time dateTime={essay.date} className="normal-case tracking-normal">
            {new Date(essay.date).getFullYear()}
          </time>
        </p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
          {essay.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-serif text-xl italic leading-relaxed text-muted-foreground">
          {essay.standfirst}
        </p>
        <GreekKeyDivider className="mt-10" />
      </header>

      <div className="mt-12 space-y-6 text-base leading-[1.8] text-ink/90">
        {essay.paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.85] first-letter:text-brass"
                : undefined
            }
          >
            {paragraph}
          </p>
        ))}
      </div>

      <footer className="mt-14 border-t border-border pt-8 text-center">
        <p className="text-xs text-muted-foreground">
          [DRAFT COPY — REVIEW] Sample essay drafted for tone; to be reviewed
          by the founder before launch.
        </p>
        <Link
          href="/commonplace-book"
          className="mt-4 inline-block text-sm font-medium text-mid-blue hover:text-brass"
        >
          ← Back to the Commonplace Book
        </Link>
      </footer>
    </article>
  );
}
