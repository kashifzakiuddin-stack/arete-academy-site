import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { LaurelMark } from "@/components/motifs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Faculty",
  description:
    "The tutors of Arete Academy: subject specialists, DBS-checked, and committed to the formation of the whole child.",
};

/* [PLACEHOLDER] All three bios below are realistic placeholders for layout
   and tone. Replace with real tutors, real credentials and (consented)
   photographs before launch. */
const FACULTY = [
  {
    name: "[PLACEHOLDER] Dr E. Hartley",
    role: "Director of Studies · Mathematics",
    bio: "Read Mathematics at [university]; ten years' experience preparing pupils for the 11+ and independent-school entrance. Believes a child who can explain why a method works has learned something no examination can take away.",
  },
  {
    name: "[PLACEHOLDER] Mr J. Okafor",
    role: "English & Rhetoric",
    bio: "Read English at [university]; former head of department at a London prep school. Teaches close reading through whole texts and coaches declamation and interview technique with patience and good humour.",
  },
  {
    name: "[PLACEHOLDER] Mrs A. Konstantinou",
    role: "Classics & Verbal Reasoning",
    bio: "Read Classics at [university]. Introduces pupils to myth and to Greek and Latin word-roots — the most direct route to the vocabulary the verbal reasoning paper rewards.",
  },
];

export default function FacultyPage() {
  return (
    <div>
      <PageHeader
        kicker="Faculty"
        title="The people who teach"
        lede="Small in number, chosen with care. Every tutor is a subject specialist first, and every tutor teaches because they cannot quite help it."
      />

      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-14 md:grid-cols-3">
        {FACULTY.map((tutor) => (
          <Card key={tutor.name}>
            <CardHeader>
              {/* Line-art in place of photographs — see safeguarding note below. */}
              <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-mist/60 text-brass">
                <LaurelMark className="size-10" />
              </div>
              <CardTitle className="text-xl">{tutor.name}</CardTitle>
              <CardDescription className="text-xs font-semibold tracking-wide text-brass uppercase">
                {tutor.role}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tutor.bio}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mx-auto max-w-2xl px-6 pb-8">
        <div className="border-l-2 border-brass-soft bg-white p-6 sm:p-8">
          <h2 className="text-2xl">Vetting &amp; safeguarding</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/85">
            Every tutor holds an enhanced DBS check, renewed on the schedule
            recommended for those working with children, and provides
            references which we take up in person. Our full safeguarding
            policy is published on the policies page. [PLACEHOLDER — confirm
            exact vetting procedure wording with legal review.]
          </p>
        </div>
      </section>
    </div>
  );
}
