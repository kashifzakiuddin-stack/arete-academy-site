# Arete Academy — Website

The marketing site and adaptive-quiz demo for Arete Academy, a premium 11+
tuition practice with a classical/humanistic ethos. Built to the spec in
[`Arete_Academy_Website_Brief.md`](./Arete_Academy_Website_Brief.md).

**Phase 1 scope:** front-end only. No backend, database, authentication or
payments. The Diagnostic quiz and the enquiry form run entirely on mock data
and local component state — search the codebase for `TODO: PHASE 2` to find
every seam where the real infrastructure will attach.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui-style components (vendored in `src/components/ui/`)
- Fonts: Cormorant Garamond (headings) + Source Sans 3 (body), self-hosted
  at build time via `next/font`

## Deploying with Vercel (no local setup needed)

This repo is a standard Vercel-compatible Next.js app. To get a live URL
from a browser only:

1. Go to <https://vercel.com/signup> and choose **Continue with GitHub**.
2. Once signed in, click **Add New… → Project**.
3. Vercel lists your GitHub repositories. Click **Import** next to
   `arete-academy-site`. (If it isn't listed, click **Adjust GitHub App
   Permissions** and grant Vercel access to the repository.)
4. Leave every setting at its default — Vercel detects Next.js
   automatically — and click **Deploy**.
5. After a minute or two you'll get a live URL like
   `arete-academy-site.vercel.app`. Every future push to `main` redeploys
   it automatically, and every branch/PR gets its own preview URL, visible
   in the PR's checks and on the Vercel dashboard.

## Local development (optional)

```bash
npm install
npm run dev
```

## Content status

Real copy: Home and Our Philosophy. Everything else is drafted and marked
inline — search for `[PLACEHOLDER]` and `[DRAFT COPY — REVIEW]`. All policy
text is placeholder and marked `[PLACEHOLDER — LEGAL REVIEW NEEDED]`.
