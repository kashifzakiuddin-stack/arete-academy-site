import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Contact, Safeguarding & Policies",
  description:
    "How to reach Arete Academy, and our safeguarding, children's data and complaints policies in full.",
};

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        kicker="Contact & Policies"
        title="Contact, Safeguarding & Policies"
        lede="How to reach us — and, because every pupil we teach is a child, the policies we hold ourselves to, published in full."
      />

      <section className="mx-auto grid max-w-4xl gap-10 px-6 pb-14 sm:grid-cols-2">
        <div>
          <h2 className="text-2xl">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/85">
            <li>
              <span className="font-semibold text-navy">Area:</span> South
              London &amp; Croydon, in person and online
            </li>
            <li>
              <span className="font-semibold text-navy">Address:</span>{" "}
              [PLACEHOLDER — address]
            </li>
            <li>
              <span className="font-semibold text-navy">Telephone:</span>{" "}
              [PLACEHOLDER — telephone]
            </li>
            <li>
              <span className="font-semibold text-navy">Email:</span>{" "}
              [PLACEHOLDER — email]
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            For admissions, the quickest route is the{" "}
            <Link
              href="/admissions"
              className="font-medium text-mid-blue hover:text-brass"
            >
              enquiry form
            </Link>
            .
          </p>
        </div>
        <div>
          <h2 className="text-2xl">Safeguarding, in brief</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/85">
            Every tutor holds an enhanced DBS check. A designated safeguarding
            lead oversees all concerns. No photograph of any child is
            published without written parental consent, and none is published
            without a clear reason. The full policies are below.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-8">
        <h2 className="text-2xl">Policies in full</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          [PLACEHOLDER — LEGAL REVIEW NEEDED] Every policy below is outline
          placeholder text. Each must be drafted properly and reviewed by a
          solicitor before launch — in particular the children&rsquo;s data
          policy, which should be written with the UK Age Appropriate Design
          Code in mind rather than adapted from a generic template.
        </p>

        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="safeguarding">
            <AccordionTrigger>Safeguarding Policy</AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>
                [PLACEHOLDER — LEGAL REVIEW NEEDED] To cover: designated
                safeguarding lead and deputy; staff vetting (enhanced DBS,
                references, induction); code of conduct for lessons, including
                online-lesson rules (recorded or parent-audible sessions, no
                one-to-one private messaging); procedure for reporting
                concerns, including concerns about staff; escalation to the
                local authority designated officer; annual review date.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="childrens-data">
            <AccordionTrigger>
              Children&rsquo;s Data &amp; Privacy Policy
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>
                [PLACEHOLDER — LEGAL REVIEW NEEDED] To cover: what data the
                Diagnostic collects about a child (responses, timings,
                confidence ratings) and why; lawful basis; retention periods;
                parental access and deletion rights; no sale or sharing of
                data; UK Age Appropriate Design Code conformance —
                high-privacy defaults, data minimisation, no nudge techniques,
                no profiling beyond the educational purpose parents have
                agreed to.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="photography">
            <AccordionTrigger>Photography &amp; Image Consent</AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>
                [PLACEHOLDER — LEGAL REVIEW NEEDED] To cover: no images of
                identifiable children without written parental consent; no
                publication without a clear reason; withdrawal of consent at
                any time; secure storage and deletion of images.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="complaints">
            <AccordionTrigger>Complaints Procedure</AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>
                [PLACEHOLDER — LEGAL REVIEW NEEDED] To cover: informal
                resolution first; written complaint route and response
                timescales; records kept; how safeguarding-related complaints
                are handled differently (immediately, and never informally).
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/admissions">Make an enquiry</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
