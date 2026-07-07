import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Admissions & Enquiries",
  description:
    "Every Arete Academy programme is designed around one family. Tell us about your child and we will arrange a consultation.",
};

export default function AdmissionsPage() {
  return (
    <div>
      <PageHeader
        kicker="Admissions"
        title="Begin with a conversation"
        lede="We do not publish a rate card, because we do not teach a standard programme. Every engagement is designed around one child — their starting point, their target schools, and the time available — and priced accordingly at consultation."
      />

      <section className="mx-auto max-w-2xl space-y-5 px-6 pb-12 text-base leading-relaxed text-ink/85">
        <p>
          The process is simple. Tell us a little about your child below. We
          will reply personally to arrange an unhurried conversation — by
          telephone or in person — and, where it seems right to continue, a
          baseline Diagnostic assessment. You will then receive a written
          proposal: what we would teach, in what order, and why. There is no
          obligation at any stage.
        </p>
        <p className="text-sm text-muted-foreground">
          [DRAFT COPY — REVIEW] If a bursary or means-tested policy is
          adopted, it should be stated plainly here — a sentence such as
          &ldquo;A number of means-tested places are available each year;
          please raise this at consultation.&rdquo; (See Section 6 of the
          brief.)
        </p>
      </section>

      <section className="border-t border-border bg-mist/30 px-6 py-14">
        <EnquiryForm />
      </section>
    </div>
  );
}
