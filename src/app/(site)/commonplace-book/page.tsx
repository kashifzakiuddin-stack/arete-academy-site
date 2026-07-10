import type { Metadata } from "next";
import Link from "next/link";

import { ESSAYS } from "@/lib/essays";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "The Commonplace Book",
  description:
    "Occasional essays from Arete Academy: classical and historical texts briefly unpacked, with a line drawn back to what a child might be reading or writing.",
};

export default function CommonplaceBookPage() {
  return (
    <div>
      <PageHeader
        kicker="The Commonplace Book"
        title="Occasional essays"
        lede="In the old tradition of the commonplace book: a passage worth keeping, briefly unpacked, with a line drawn back to something a child might be reading or writing. Published termly — infrequent, but meant."
      />

      <div className="mx-auto max-w-2xl space-y-12 px-6 pb-10">
        {ESSAYS.map((essay) => (
          <article key={essay.slug} className="group">
            <p className="inscription">
              {essay.term}{" "}
              <time dateTime={essay.date} className="text-muted-foreground normal-case tracking-normal">
                · {new Date(essay.date).getFullYear()}
              </time>
            </p>
            <h2 className="mt-2 text-3xl">
              <Link
                href={`/commonplace-book/${essay.slug}`}
                className="transition-colors group-hover:text-brass"
              >
                {essay.title}
              </Link>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {essay.standfirst}
            </p>
            <Link
              href={`/commonplace-book/${essay.slug}`}
              className="mt-3 inline-block text-sm font-medium text-mid-blue hover:text-brass"
            >
              Read the essay →
            </Link>
          </article>
        ))}
      </div>

      <p className="mx-auto max-w-2xl px-6 pb-8 text-center text-xs text-muted-foreground">
        [DRAFT COPY — REVIEW] All three essays are drafts for the founder to
        review and make their own before launch.
      </p>
    </div>
  );
}
