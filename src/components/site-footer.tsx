import Link from "next/link";

import { NAV_ITEMS } from "@/lib/nav";
import { LaurelMark } from "@/components/motifs";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-navy text-mist/90">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-brass-soft">
            <LaurelMark className="size-9" />
            <span className="font-serif text-lg font-semibold tracking-[0.14em] text-mist uppercase">
              Arete Academy
            </span>
          </div>
          <p className="font-serif text-base italic text-mist/80">
            Non scholae sed vitae discimus.
          </p>
          {/* Motto translated once, unobtrusively, per the brief. */}
          <p className="text-sm text-mist/60">
            We learn not for school, but for life.
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-2.5">
          <p className="inscription text-brass-soft">Pages</p>
          <ul className="space-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-brass-soft"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admissions"
                className="transition-colors hover:text-brass-soft"
              >
                Admissions &amp; Enquiries
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-2.5">
          <p className="inscription text-brass-soft">Contact</p>
          <ul className="space-y-2 text-sm text-mist/80">
            <li>South London &amp; Croydon</li>
            <li>[PLACEHOLDER — address]</li>
            <li>[PLACEHOLDER — telephone]</li>
            <li>[PLACEHOLDER — email]</li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <p className="inscription text-brass-soft">Safeguarding</p>
          <p className="text-sm leading-relaxed text-mist/80">
            All tutors hold enhanced DBS clearance. Our safeguarding and
            children&rsquo;s data policies are published in full on the{" "}
            <Link
              href="/contact"
              className="underline decoration-brass-soft/60 underline-offset-2 hover:text-brass-soft"
            >
              policies page
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="border-t border-mist/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-mist/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Arete Academy. All rights reserved.</p>
          <p>
            <Link href="/contact" className="hover:text-brass-soft">
              Safeguarding &amp; Policies
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
