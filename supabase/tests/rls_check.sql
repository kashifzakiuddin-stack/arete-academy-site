-- ============================================================
-- Arete Academy — Row Level Security boundary tests
-- ============================================================
-- Run the WHOLE file in the Supabase SQL editor after applying
-- 0001_schema.sql (seed content optional). It creates throwaway
-- users inside a transaction, checks every access boundary, and
-- rolls everything back — nothing is left behind.
--
-- If every boundary holds you will see:  "RLS CHECKS PASSED"
-- If any boundary is broken the script STOPS with an exception
-- naming the failed check. Treat any failure as a launch blocker.

begin;

-- ------------------------------------------------------------
-- Fixtures: two parents, one tutor, one child each, one attempt
-- for family B (created as superuser, bypassing RLS)
-- ------------------------------------------------------------

insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test-parent-a@example.com', '{"provider":"email"}', '{"full_name":"Parent A"}', now(), now()),
  ('00000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test-parent-b@example.com', '{"provider":"email"}', '{"full_name":"Parent B"}', now(), now()),
  ('00000000-0000-4000-8000-00000000000c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test-tutor@example.com',    '{"provider":"email"}', '{"full_name":"Tutor T"}',  now(), now());

update public.profiles set role = 'tutor'
where id = '00000000-0000-4000-8000-00000000000c';

insert into public.children (id, parent_id, first_name, year_group) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-00000000000a', 'Alpha', 'Year 5'),
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-00000000000b', 'Beta',  'Year 6');

-- A quiz session + attempt for family B's child, plus mastery.
-- (Uses a synthetic skill so the script works without seed.sql.)
insert into public.subjects (id, name)
values ('rls-test-subject', 'RLS Test Subject');

insert into public.skills (id, subject_id, code, name, category, difficulty_band)
values ('00000000-0000-4000-8000-0000000000f1', 'rls-test-subject', 'RLS-TEST-01', 'RLS Test Skill', 'essential', 1);

insert into public.questions (id, skill_id, difficulty, prompt, worked_solution)
values ('00000000-0000-4000-8000-0000000000f2', '00000000-0000-4000-8000-0000000000f1', 1, 'RLS test question', 'RLS test solution');

insert into public.quiz_sessions (id, child_id, skill_id)
values ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000f1');

insert into public.question_attempts (id, session_id, child_id, question_id, skill_id, is_correct, response_ms)
values ('00000000-0000-4000-8000-0000000000e2', '00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000f2', '00000000-0000-4000-8000-0000000000f1', true, 1000);

insert into public.skill_mastery (child_id, skill_id, mastery, attempts_count, correct_count)
values ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000f1', 0.5, 1, 1);

-- ------------------------------------------------------------
-- Act as PARENT A
-- ------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);

do $$
declare v_count integer;
begin
  -- 1. Parent A sees exactly their own child, no one else's.
  select count(*) into v_count from public.children;
  if v_count <> 1 then
    raise exception 'FAIL check 1: parent A should see exactly 1 child, saw %', v_count;
  end if;
  select count(*) into v_count from public.children where first_name = 'Beta';
  if v_count <> 0 then
    raise exception 'FAIL check 1b: parent A can see another family''s child';
  end if;

  -- 2. Parent A sees none of family B's sessions, attempts, or mastery.
  select count(*) into v_count from public.quiz_sessions;
  if v_count <> 0 then
    raise exception 'FAIL check 2a: parent A can see another family''s quiz sessions';
  end if;
  select count(*) into v_count from public.question_attempts;
  if v_count <> 0 then
    raise exception 'FAIL check 2b: parent A can see another family''s attempts';
  end if;
  select count(*) into v_count from public.skill_mastery;
  if v_count <> 0 then
    raise exception 'FAIL check 2c: parent A can see another family''s mastery data';
  end if;

  -- 3. Question content (answers, misconception tags) is not readable
  --    by any signed-in user — it is served only via the app server.
  select count(*) into v_count from public.questions;
  if v_count <> 0 then
    raise exception 'FAIL check 3a: questions are readable from the browser';
  end if;
  select count(*) into v_count from public.question_options;
  if v_count <> 0 then
    raise exception 'FAIL check 3b: question options (with answers) are readable from the browser';
  end if;

  -- 4. Attempts cannot be inserted directly from the browser.
  begin
    insert into public.question_attempts (session_id, child_id, question_id, skill_id, is_correct, response_ms)
    values ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000f2', '00000000-0000-4000-8000-0000000000f1', true, 1);
    raise exception 'FAIL check 4: a signed-in user could insert an attempt row directly';
  exception
    when insufficient_privilege or check_violation then null; -- expected
  end;

  -- 5. Users cannot promote themselves to tutor.
  begin
    update public.profiles set role = 'tutor'
    where id = '00000000-0000-4000-8000-00000000000a';
    raise exception 'FAIL check 5: a user could change their own role';
  exception
    when insufficient_privilege then null; -- expected
  end;
end $$;

-- ------------------------------------------------------------
-- Act as PARENT B: history is append-only even for your own child
-- ------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000000b","role":"authenticated"}', true);

do $$
declare v_count integer;
begin
  -- 6. Parent B can read their own child's attempt…
  select count(*) into v_count from public.question_attempts;
  if v_count <> 1 then
    raise exception 'FAIL check 6: parent B should see their own child''s attempt, saw %', v_count;
  end if;

  -- 7. …but cannot rewrite or delete history (no UPDATE/DELETE policy:
  --    the statement succeeds but touches zero rows).
  begin
    update public.question_attempts set is_correct = false
    where id = '00000000-0000-4000-8000-0000000000e2';
    get diagnostics v_count = row_count;
    if v_count <> 0 then
      raise exception 'FAIL check 7a: an attempt row could be rewritten (% rows)', v_count;
    end if;
  exception
    when insufficient_privilege then null; -- also acceptable
  end;
  begin
    delete from public.question_attempts
    where id = '00000000-0000-4000-8000-0000000000e2';
    get diagnostics v_count = row_count;
    if v_count <> 0 then
      raise exception 'FAIL check 7b: an attempt row could be deleted (% rows)', v_count;
    end if;
  exception
    when insufficient_privilege then null; -- also acceptable
  end;
end $$;

-- ------------------------------------------------------------
-- Act as the TUTOR: nothing without an assignment, one pupil with
-- ------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000000c","role":"authenticated"}', true);

do $$
declare v_count integer;
begin
  -- 8. Unassigned tutor sees no children and no attempts.
  select count(*) into v_count from public.children;
  if v_count <> 0 then
    raise exception 'FAIL check 8a: tutor sees children without an assignment';
  end if;
  select count(*) into v_count from public.question_attempts;
  if v_count <> 0 then
    raise exception 'FAIL check 8b: tutor sees attempts without an assignment';
  end if;

  -- 9. After assigning themselves to family B's child, the tutor sees
  --    exactly that child and their data — and still not family A's.
  insert into public.tutor_assignments (tutor_id, child_id)
  values ('00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-0000000000b1');

  select count(*) into v_count from public.children;
  if v_count <> 1 then
    raise exception 'FAIL check 9a: assigned tutor should see exactly 1 child, saw %', v_count;
  end if;
  select count(*) into v_count from public.children where first_name = 'Alpha';
  if v_count <> 0 then
    raise exception 'FAIL check 9b: tutor can see an unassigned family''s child';
  end if;
  select count(*) into v_count from public.question_attempts;
  if v_count <> 1 then
    raise exception 'FAIL check 9c: assigned tutor should see 1 attempt, saw %', v_count;
  end if;
end $$;

-- ------------------------------------------------------------
-- A parent must never be able to create tutor assignments.
-- ------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);

do $$
begin
  -- 10. Parent A tries to assign themselves as "tutor" to child B.
  begin
    insert into public.tutor_assignments (tutor_id, child_id)
    values ('00000000-0000-4000-8000-00000000000a', '00000000-0000-4000-8000-0000000000b1');
    raise exception 'FAIL check 10: a parent could create a tutor assignment';
  exception
    when insufficient_privilege or check_violation then null; -- expected
  end;
end $$;

reset role;

do $$ begin raise notice 'RLS CHECKS PASSED'; end $$;

rollback;
