# Phase 2 — Skills Practice System: setup guide

Everything here is done through web dashboards — no terminal needed.
Total time: roughly 20 minutes.

## What you are setting up

- **Supabase** (free) — the database and login system. Holds families,
  child profiles, the question bank, and every practice attempt.
- **Vercel** (already set up in Phase 1) — hosts the site. It needs
  three new environment variables so the site can talk to Supabase.

---

## Step 1 — Create the Supabase project

1. Go to <https://supabase.com> → **Start your project** → sign in
   **with GitHub** (same account as the repository).
2. Click **New project**.
   - Organization: accept the default.
   - Name: `arete-academy`.
   - Database password: click **Generate a password** and store it in a
     password manager. You will rarely need it, but keep it safe.
   - Region: **West EU (London)** — keeps children's data in the UK.
3. Click **Create new project** and wait a minute or two.

## Step 2 — Create the database tables

1. In the left sidebar, open **SQL Editor**.
2. In GitHub, open `supabase/migrations/0001_schema.sql` in this
   repository, click the **copy** icon on the file, paste the whole
   file into the SQL editor, and click **Run**.
   You should see "Success. No rows returned".
3. Do the same with `supabase/seed.sql` (the sample Maths content —
   replace later with the real 41-skill bank).

## Step 3 — Run the security checks

1. Still in the SQL editor, paste the whole of
   `supabase/tests/rls_check.sql` and click **Run**.
2. The Messages panel must say **RLS CHECKS PASSED**. If it shows any
   `FAIL …` message instead, stop and report it — do not launch with a
   failing check. The script cleans up after itself either way.

## Step 4 — Configure sign-in behaviour

1. Left sidebar → **Authentication** → **Sign In / Providers**.
2. Under **Email**, leave email/password enabled.
3. Decision point: **Confirm email**.
   - ON (default): parents must click a link in their inbox before the
     account works. Safer; slight friction. The app already handles
     this ("check your email" screen).
   - For quick testing you may switch it OFF, then back ON before real
     families use it.
4. Authentication → **URL Configuration** → set **Site URL** to your
   Vercel URL (e.g. `https://arete-academy-site.vercel.app`).

## Step 5 — Give Vercel the keys

1. In Supabase: **Project Settings** (gear icon) → **API**.
   You need three values: **Project URL**, the **anon / public** key,
   and the **service_role** key (click *Reveal*).
2. In Vercel: your project → **Settings** → **Environment Variables**.
   Add, for all environments:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | the Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon / public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key |

   The service_role key bypasses all row-level security — treat it
   like a master password. It is never sent to the browser.
3. Vercel → **Deployments** → **⋯** on the latest → **Redeploy**.

## Step 6 — Create your own tutor account

1. On the live site, click **Sign in → Create a family account** and
   register with your own email.
2. In Supabase → SQL Editor, run (with your email substituted):

   ```sql
   update public.profiles set role = 'tutor'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

3. To see a pupil in your tutor view, assign yourself (substitute both
   emails; run after the family has added the child):

   ```sql
   insert into public.tutor_assignments (tutor_id, child_id)
   select t.id, c.id
   from auth.users u
   join public.profiles t on t.id = u.id and t.role = 'tutor'
   cross join public.children c
   where u.email = 'you@example.com'
     and c.first_name = 'CHILD FIRST NAME';
   ```

   (A proper in-app admin flow for this is a Phase 3 item.)

## Loading the real question bank

The seed content is a placeholder. To load the real 41 skills and
questions, follow the same three-insert pattern as `supabase/seed.sql`:
skills, misconceptions, then one `seed_question(...)` call per question
(skill code, difficulty 1–3, time limit in seconds, prompt, worked
solution, and four options with `"correct": true` on the right one and
an optional `"mc": "MC-CODE"` misconception tag on each wrong one).
Share the content in any structured form and it can be converted into
that file mechanically.

## Data protection notes (read before real families use this)

- Supabase encrypts the database at rest; connections are TLS.
- We store the minimum: parent name/email, child FIRST NAME and year
  group only. No surname, DOB, school, or photos.
- Every data-bearing row has a `retain_until` date (default 24 months).
  **Automatic deletion when that date passes is NOT yet built** — a
  scheduled purge job is a Phase 3 item and a legal-review point.
- Items flagged for professional legal/data-protection review before
  launch are listed in the phase summary: privacy policy (Age
  Appropriate Design Code), retention periods, lawful basis, the
  "show your working" free-text field, and breach procedures.
