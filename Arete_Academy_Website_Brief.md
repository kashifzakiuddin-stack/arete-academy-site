# Arete Academy — Website Design Brief & Feature Checklist

*A working brief to hand to a website-building AI or developer. Written so it can be pasted whole into another Claude instance.*

---

## 1. Brand Philosophy & Positioning

**Core thesis to communicate:** this is not a crammer. It is an education in the older sense of *paideia* — the shaping of a person, not just the priming of a candidate. The 11+ is treated as one worthy proving ground among several, not the whole point of the child's schooling.

- [ ] Write a short "Our Philosophy" statement built around *arete* (ἀρετή) — excellence of character and craft together, not excellence as a trophy. Good source material: Aristotle's virtue ethics, the idea of the *kalos kagathos* (the good and beautiful person), Plato's Academy as the namesake institution.
- [ ] Distinguish explicitly, in copy, between "exam technique" and "formation" — the site should say what it is *for*, not just what it *covers*.
- [ ] One thing worth watching: there's a fine line between "we value formation over material advancement" and sounding like you're sneering at families who are, quite reasonably, trying to get their child into a good school for practical reasons. I'd suggest the ethos come through as *quiet confidence and higher aspiration*, not as a dig at competitors or at parental motives. Discerning customers are put off by cattiness as much as by cheapness — the tone should read as "we assume you already share our standards," not "we are better than the others."
- [ ] Consider a Latin or Greek motto for the crest/masthead, with a translation given once, unobtrusively, in the footer — not repeated everywhere.

---

## 2. Visual & Design Language

- [ ] Keep continuity with the house palette already in use across Arete materials: navy (#1F3864), mid-blue (#2E74B5), light-blue (#D6E4F0). Add one warm accent for the "classical" register — an aged gold or brass, used sparingly (crest, dividers, hover states), not as a dominant colour.
- [ ] Typography: a serif for headings that reads as classical/inscriptional rather than Victorian-fussy (something like Cormorant, Spectral, or EB Garamond), paired with a clean, highly legible sans (the existing Arial house style, or a step up such as Inter or Source Sans) for body text and the quiz interface.
- [ ] Motifs to use *lightly*: a laurel wreath mark, a Greek key (meander) border as a divider rather than wallpaper, restrained column/pediment line drawings. Avoid clip-art togas and columns — the aim is "Ashmolean museum," not "toga party."
- [ ] Photography/imagery: avoid stock-photo children-laughing-at-laptops. Favour muted, library-and-manuscript imagery, close-ups of handwriting, open books, chalk/ink textures. If real photos of pupils are used, treat as a safeguarding matter (see Section 7).
- [ ] Generous white space, restrained animation. Nothing that feels like a SaaS landing page (no bouncing rockets, no countdown "act now" banners).

---

## 3. Site Architecture

- [ ] **Home** — statement of philosophy up front, then a clear path into either "the Diagnostic" (assessment) or "Enquire"
- [ ] **Our Philosophy** ("Paideia" or similar) — the ethos statement, expanded
- [ ] **Academic Programmes** — 11+ core subjects, structured clearly
- [ ] **The Wider Curriculum** — Shakespeare, poetry, history, world civilisations (see Section 4)
- [ ] **The Diagnostic** — landing page for the adaptive quiz/assessment tool (see Section 5)
- [ ] **Faculty** — tutor bios, credentials, DBS statement
- [ ] **Results & Testimonials** — handled carefully, see Section 7
- [ ] **Admissions / Enquire** — bespoke consultation route, not a price list (see Section 6)
- [ ] **The Commonplace Book** — journal/blog (see Section 8)
- [ ] **Contact / Safeguarding & Policies**

---

## 4. Core Academic Offering — Content Features

- [ ] 11+ core: Maths, English, Verbal Reasoning, Non-Verbal Reasoning, mapped to your existing skill taxonomy
- [ ] Supplementary humanistic strand, explicitly framed as strengthening the core exam skills, not as an unrelated extra:
  - [ ] Shakespeare (recitation, close reading — feeds comprehension and creative writing)
  - [ ] Poetry (memorisation and analysis — feeds vocabulary, rhythm, comprehension)
  - [ ] European and world history (feeds general knowledge, essay structure, argument)
  - [ ] An introduction to classical civilisation (myth, a little Greek/Latin vocabulary — feeds English vocabulary roots directly, which is a genuine and easy-to-justify link to 11+ verbal skills)
  - [ ] Rhetoric / public speaking (feeds interview technique for schools that interview)
- [ ] A short explainer, somewhere prominent, on *why* the humanities strand is not a distraction from exam prep but a foundation for it — this is the strongest rebuttal to "why am I paying for Shakespeare when my child needs maths."

---

## 5. Signature Feature — The Adaptive Diagnostic

This should be built directly on your existing 41-skill taxonomy and quiz infrastructure, not a separate system.

- [ ] Skill-mapped question bank tied to the full taxonomy (Number, Algebra, Ratio, Statistics, etc., across the three difficulty bands you already use)
- [ ] Adaptive weighting engine — questions selected based on live performance, not fixed order
- [ ] Countdown timers per question, consistent with existing quiz design
- [ ] Data capture beyond right/wrong:
  - [ ] response time per question
  - [ ] error-type tagging (careless slip vs conceptual gap vs misread question)
  - [ ] confidence self-rating before reveal (did the child guess or know)
  - [ ] skill decay/retention over repeated sittings, not just a single snapshot
- [ ] Parent-facing dashboard: per-skill mastery map, trend over time, plain-English narrative summary (not just a chart)
- [ ] Tutor-facing dashboard: the same data at higher resolution, exportable as CSV
- [ ] A free or low-friction "Baseline Assessment" as the lead-generation front door — this is likely your strongest conversion tool, so give it its own clean landing page
- [ ] Restrained gamification appropriate to the brand: progression through named tiers rather than cartoon badges — something like *Ephebe → Apprentice → Adept* could sit well with the classical framing, but keep it understated
- [ ] Because this collects data on children, build in data-protection care from the start (see Section 7) rather than bolting it on later

---

## 6. Enrolment & Fees

Given your instinct not to publish a fixed rate card yet, the cleanest premium-market solution is a **consultation-based / bespoke quote model** — this is entirely normal at the top end of tutoring and private education, and reads as considered rather than evasive if the copy is right.

- [ ] No published price list at launch. Replace with "Enquire for a tailored programme" or similar.
- [ ] An enquiry form that gathers enough context (year group, target schools, current level, family circumstances if volunteered) to let you quote appropriately without ever stating a rate publicly.
- [ ] If you do want to vary price by ability to pay, frame it as a **bursary or sliding-scale policy** rather than silent discretion — families tend to trust "we offer means-tested places" far more than opaque pricing, even if the mechanism (a private conversation) ends up similar. A stated bursary policy also protects you: charging different families different amounts *based on ability to pay* is standard practice (most independent schools do exactly this), but doing it invisibly, with no policy at all, is the version that can look arbitrary if ever questioned. Basing price on a protected characteristic (rather than means) would be the thing to avoid — worth a quick word with an accountant or solicitor once you formalise it, since I can't give you a firm legal opinion here.
- [ ] Whatever you choose, keep the public-facing tone as "bespoke programmes designed around the family," not "prices on application" in the slightly cagey estate-agent sense.

---

## 7. Trust, Safeguarding & Credibility

Because every user of the core service is a minor, this section should be treated as load-bearing, not decorative.

- [ ] Clear DBS/vetting statement for all tutors
- [ ] A visible safeguarding policy page
- [ ] A privacy policy specifically addressing children's data, written with the UK's Age Appropriate Design Code in mind, not a generic template
- [ ] Testimonials by initials only, with explicit parental consent on file before publishing
- [ ] No photos of identifiable children without written parental consent, and no photos at all published without a clear reason
- [ ] Results claims kept honest and specific rather than superlative — "helped pupils gain places at X, Y, Z" reads better to a discerning audience than "99% success rate" style claims, which can look like the opposite of the ethos you're going for

---

## 8. Editorial Features — "The Commonplace Book"

A journal section does double duty: it's SEO-useful and it's the clearest possible demonstration of the ethos, since it lets the writing itself carry the brand.

- [ ] Short essays or reflections in the commonplace-book tradition — a classical or historical text, briefly unpacked, with a line drawn back to something a child might be reading or writing about
- [ ] Age-banded recommended reading lists (this plays to genuine expertise you already have)
- [ ] Termly rather than weekly cadence — infrequent-but-excellent suits the brand better than a content mill

---

## 9. Community & Engagement

- [ ] Parent information evenings / webinars, bookable through the site
- [ ] A small enrichment calendar — a declamation or debate afternoon, a history quiz, something that reinforces "this is a community, not a transaction"
- [ ] Alumni updates (school offers received) if families are willing, again with consent

---

## 10. Technical / Backend Notes

- [ ] Secure client portal for dashboards and materials (separate parent/tutor logins)
- [ ] CMS that lets you edit the Commonplace Book and Faculty pages without a developer
- [ ] Payment/invoicing set up to handle bespoke, non-published amounts per family rather than a fixed checkout price
- [ ] Fully responsive/mobile-first — most enquiry traffic will likely come from a parent's phone regardless of how "classical" the aesthetic is
- [ ] Basic accessibility compliance (WCAG AA) — matters both ethically and for SEO
- [ ] Local SEO for South London/Croydon alongside the more prestige-oriented national positioning

---

## 11. Naming & Copy Texture

- [ ] Consider Greek/Latin section labels with a quiet English gloss underneath on first use only (not repeated on every page — becomes twee fast)
- [ ] Possible tagline directions: something built around *arete* itself, or around the idea of education as formation rather than acquisition
- [ ] Keep all copy free of exclamation marks, superlatives, and urgency language ("limited spaces!", "book now!") — the target customer is reassured by restraint, not urgency
