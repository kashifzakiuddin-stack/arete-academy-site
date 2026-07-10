-- ============================================================
-- Arete Academy — Skills Practice System, Phase 2 schema
-- Run this whole file once in the Supabase SQL editor.
-- ============================================================
--
-- Access model, in one paragraph:
--   Parents authenticate; children are profiles under a parent, not
--   logins. Row Level Security lets a parent read ONLY their own
--   children's data, and a tutor read ONLY pupils assigned to them.
--   Question content (correct answers, misconception tags) has NO
--   read policy for signed-in users: it is served exclusively by the
--   application server, which never sends answers to the browser
--   before the pupil has answered. Attempt rows are append-only —
--   there are deliberately no UPDATE or DELETE policies, and writes
--   happen only through the application server (service key) after
--   an ownership check, so history can never be overwritten.
--
-- Data protection notes (see also README-PHASE2.md):
--   * Supabase encrypts the database at rest (AES-256) by default.
--   * Data minimisation: children carry a first name and year group
--     only — no surname, date of birth, school, or photo.
--   * Every data-bearing row has retain_until, defaulting to 24
--     months from creation. Enforcement (a scheduled purge) is a
--     Phase 3 item and is flagged for legal review.

-- ------------------------------------------------------------
-- Profiles & roles
-- ------------------------------------------------------------

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'parent' check (role in ('parent', 'tutor')),
  full_name  text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per login. role=tutor is granted manually in SQL, never self-service.';

-- Create a profile automatically when a user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- True when the calling user is a tutor.
create function public.is_tutor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'tutor'
  );
$$;

alter table public.profiles enable row level security;

create policy "read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Users may edit their name but can never change their own role.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ------------------------------------------------------------
-- Families: child profiles under one parent account
-- ------------------------------------------------------------

create table public.children (
  id           uuid primary key default gen_random_uuid(),
  parent_id    uuid not null references public.profiles (id) on delete cascade,
  first_name   text not null,
  year_group   text not null default '',
  retain_until date not null default (current_date + interval '24 months'),
  created_at   timestamptz not null default now()
);

create index children_parent_idx on public.children (parent_id);

alter table public.children enable row level security;

create policy "parents manage own children"
  on public.children for all
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- (The tutors-read-assigned-children policy is created further down,
-- after tutor_assignments exists — a policy cannot reference a table
-- that has not been created yet.)

-- ------------------------------------------------------------
-- Tutor assignments
-- ------------------------------------------------------------

create table public.tutor_assignments (
  tutor_id   uuid not null references public.profiles (id) on delete cascade,
  child_id   uuid not null references public.children (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tutor_id, child_id)
);

alter table public.tutor_assignments enable row level security;

-- Pilot-stage simplification (flagged in the phase summary): any tutor
-- may assign themselves to a pupil. Tighten to admin-managed once there
-- is more than one member of staff.
create policy "tutors manage own assignments"
  on public.tutor_assignments for all
  using (public.is_tutor() and tutor_id = auth.uid())
  with check (public.is_tutor() and tutor_id = auth.uid());

create policy "tutors read assigned children"
  on public.children for select
  using (
    public.is_tutor()
    and exists (
      select 1 from public.tutor_assignments ta
      where ta.child_id = children.id and ta.tutor_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- Subject-agnostic content: subjects, skills, misconceptions,
-- questions, options
-- ------------------------------------------------------------

create table public.subjects (
  id   text primary key,          -- e.g. 'maths', later 'spag', 'vr'
  name text not null
);

create table public.skills (
  id              uuid primary key default gen_random_uuid(),
  subject_id      text not null references public.subjects (id),
  code            text not null unique,   -- e.g. 'MAT-E-03'
  name            text not null,
  category        text not null check (category in ('essential', 'extension')),
  difficulty_band smallint not null default 1 check (difficulty_band between 1 and 3),
  active          boolean not null default true,
  sort_order      integer not null default 0
);

create index skills_subject_idx on public.skills (subject_id, category, sort_order);

create table public.misconceptions (
  id          uuid primary key default gen_random_uuid(),
  subject_id  text not null references public.subjects (id),
  code        text not null unique,       -- e.g. 'MC-CARRY'
  label       text not null,              -- e.g. 'Forgot to carry'
  description text not null default ''
);

create table public.questions (
  id                 uuid primary key default gen_random_uuid(),
  skill_id           uuid not null references public.skills (id) on delete cascade,
  difficulty         smallint not null default 1 check (difficulty between 1 and 3),
  prompt             text not null,
  worked_solution    text not null,       -- full reasoning, revealed after answering
  time_limit_seconds integer not null default 60,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

create index questions_skill_idx on public.questions (skill_id, difficulty) where active;

create table public.question_options (
  id               uuid primary key default gen_random_uuid(),
  question_id      uuid not null references public.questions (id) on delete cascade,
  position         smallint not null,
  body             text not null,
  is_correct       boolean not null default false,
  -- Which specific misconception this wrong answer typically reveals.
  -- Null on the correct option, and on distractors with no clear signal.
  misconception_id uuid references public.misconceptions (id),
  unique (question_id, position)
);

-- Content is world-readable only where harmless (the skill menu) and
-- server-only where it would leak answers.
alter table public.subjects       enable row level security;
alter table public.skills         enable row level security;
alter table public.misconceptions enable row level security;
alter table public.questions      enable row level security;
alter table public.question_options enable row level security;

create policy "signed-in users read subjects"
  on public.subjects for select using (auth.uid() is not null);

create policy "signed-in users read skills"
  on public.skills for select using (auth.uid() is not null);

create policy "signed-in users read misconception labels"
  on public.misconceptions for select using (auth.uid() is not null);

-- questions / question_options: NO select policy on purpose.
-- Only the application server (service key, bypasses RLS) reads them,
-- so is_correct and misconception tags never reach the browser early.

-- ------------------------------------------------------------
-- Practice data: sessions, attempts (append-only), mastery
-- ------------------------------------------------------------

create table public.quiz_sessions (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children (id) on delete cascade,
  skill_id     uuid not null references public.skills (id),
  created_at   timestamptz not null default now(),
  completed_at timestamptz,
  retain_until date not null default (current_date + interval '24 months')
);

create index quiz_sessions_child_idx on public.quiz_sessions (child_id, created_at desc);

create table public.question_attempts (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references public.quiz_sessions (id) on delete cascade,
  child_id           uuid not null references public.children (id) on delete cascade,
  question_id        uuid not null references public.questions (id),
  skill_id           uuid not null references public.skills (id),
  resurfaced         boolean not null default false,
  selected_option_id uuid references public.question_options (id),  -- null = ran out of time
  is_correct         boolean not null default false,
  misconception_id   uuid references public.misconceptions (id),
  confidence         text check (confidence in ('guess', 'fairly_sure', 'certain')),
  response_ms        integer not null default 0,
  working            text,                -- optional "show your working"
  created_at         timestamptz not null default now(),
  retain_until       date not null default (current_date + interval '24 months')
);

create index question_attempts_child_skill_idx
  on public.question_attempts (child_id, skill_id, created_at);
create index question_attempts_session_idx
  on public.question_attempts (session_id);

create table public.skill_mastery (
  child_id        uuid not null references public.children (id) on delete cascade,
  skill_id        uuid not null references public.skills (id),
  mastery         real not null default 0 check (mastery between 0 and 1),
  attempts_count  integer not null default 0,
  correct_count   integer not null default 0,
  last_attempt_at timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (child_id, skill_id)
);

alter table public.quiz_sessions     enable row level security;
alter table public.question_attempts enable row level security;
alter table public.skill_mastery     enable row level security;

-- Reads: the child's parent, or an assigned tutor. Writes: none for
-- signed-in users — the application server records attempts and
-- mastery after verifying ownership, so rows cannot be forged or
-- edited from the browser, and history is never overwritten.

create function public.can_read_child(target_child uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.children c
    where c.id = target_child and c.parent_id = auth.uid()
  )
  or exists (
    select 1 from public.tutor_assignments ta
    where ta.child_id = target_child and ta.tutor_id = auth.uid()
      and public.is_tutor()
  );
$$;

create policy "family and tutor read sessions"
  on public.quiz_sessions for select
  using (public.can_read_child(child_id));

create policy "family and tutor read attempts"
  on public.question_attempts for select
  using (public.can_read_child(child_id));

create policy "family and tutor read mastery"
  on public.skill_mastery for select
  using (public.can_read_child(child_id));
