-- ============================================================
-- Arete Academy — SAMPLE seed content (Phase 2)
-- Run once in the Supabase SQL editor, AFTER 0001_schema.sql.
-- ============================================================
--
-- SAMPLE CONTENT: the eight skills, eleven misconceptions and
-- twenty-four questions below exist so the system can be used and
-- demonstrated end to end. They are placeholders for the real
-- 41-skill taxonomy and question bank, which will be provided
-- separately. To load the real content, follow the same three
-- inserts: skills, misconceptions, then seed_question() calls.

insert into public.subjects (id, name) values ('maths', 'Mathematics');

insert into public.skills (subject_id, code, name, category, difficulty_band, sort_order) values
  ('maths', 'MAT-E-01', 'Place Value & Ordering',           'essential', 1, 10),
  ('maths', 'MAT-E-02', 'Column Addition & Subtraction',    'essential', 1, 20),
  ('maths', 'MAT-E-03', 'Short Multiplication & Division',  'essential', 2, 30),
  ('maths', 'MAT-E-04', 'Fractions of Amounts',             'essential', 2, 40),
  ('maths', 'MAT-E-05', 'Time & Timetables',                'essential', 2, 50),
  ('maths', 'MAT-X-01', 'Ratio & Proportion',               'extension', 3, 60),
  ('maths', 'MAT-X-02', 'Algebraic Reasoning',              'extension', 3, 70),
  ('maths', 'MAT-X-03', 'Multi-step Word Problems',         'extension', 3, 80);

insert into public.misconceptions (subject_id, code, label, description) values
  ('maths', 'MC-CARRY',     'Forgot to carry or exchange',        'Column arithmetic slip: a carry or borrow was dropped.'),
  ('maths', 'MC-PLACE',     'Place-value confusion',              'Digits misaligned or a digit''s value misread.'),
  ('maths', 'MC-SLIP',      'Correct method, arithmetic slip',    'The approach was right; a single calculation went wrong.'),
  ('maths', 'MC-MISREAD',   'Misread the question',               'Answered a different question from the one asked.'),
  ('maths', 'MC-OP',        'Chose the wrong operation',          'Added when subtraction was needed, multiplied instead of dividing, etc.'),
  ('maths', 'MC-PARTIAL',   'Stopped before the final step',      'Completed the first stage of a multi-step problem and answered with it.'),
  ('maths', 'MC-REMAINDER', 'Ignored or misused the remainder',   'Division context needed the remainder interpreted, not discarded.'),
  ('maths', 'MC-TIME-60',   'Treated an hour as 100 minutes',     'Clock arithmetic done in base 100.'),
  ('maths', 'MC-RATIO-PART','Confused a part with the whole',     'Ratio parts and totals mixed up, or the ratio inverted.'),
  ('maths', 'MC-ALG-INV',   'Wrong inverse operation',            'Undid an equation step with the wrong inverse.'),
  ('maths', 'MC-FRAC-WHOLE','Fraction of the wrong quantity',     'Applied the fraction to the wrong whole.');

-- Temporary helper so each question reads as one compact call.
create function pg_temp.seed_question(
  p_skill_code text,
  p_difficulty smallint,
  p_time_limit integer,
  p_prompt text,
  p_solution text,
  p_options jsonb   -- [{ "body": "...", "correct": true } | { "body": "...", "mc": "MC-..." } | { "body": "..." }]
) returns void
language plpgsql
as $$
declare
  v_question uuid;
  v_option jsonb;
  v_pos smallint := 1;
begin
  insert into public.questions (skill_id, difficulty, prompt, worked_solution, time_limit_seconds)
  select s.id, p_difficulty, p_prompt, p_solution, p_time_limit
  from public.skills s where s.code = p_skill_code
  returning id into v_question;

  for v_option in select * from jsonb_array_elements(p_options) loop
    insert into public.question_options (question_id, position, body, is_correct, misconception_id)
    values (
      v_question,
      v_pos,
      v_option ->> 'body',
      coalesce((v_option ->> 'correct')::boolean, false),
      (select m.id from public.misconceptions m where m.code = v_option ->> 'mc')
    );
    v_pos := v_pos + 1;
  end loop;
end;
$$;

-- ——— MAT-E-01 · Place Value & Ordering ———

select pg_temp.seed_question('MAT-E-01', 1::smallint, 45,
  'What is the value of the digit 7 in 4,725?',
  'Read the columns from the right: 5 ones, 2 tens, 7 hundreds, 4 thousands. 4,725 = 4,000 + 700 + 20 + 5, so the 7 is worth 700.',
  '[{"body":"7","mc":"MC-PLACE"},{"body":"70","mc":"MC-PLACE"},{"body":"700","correct":true},{"body":"7,000","mc":"MC-PLACE"}]');

select pg_temp.seed_question('MAT-E-01', 2::smallint, 60,
  'Which of these numbers is the largest: 3.09, 3.4, 3.19, 3.41?',
  'Compare digit by digit. All start 3, so compare tenths: 3.4 and 3.41 both have 4 tenths, beating 3.09 and 3.19. Then hundredths: 3.41 has 1, 3.4 has 0 — so 3.41 is largest. A longer decimal is not automatically larger; each column must be compared in turn.',
  '[{"body":"3.09","mc":"MC-PLACE"},{"body":"3.4","mc":"MC-PLACE"},{"body":"3.19","mc":"MC-PLACE"},{"body":"3.41","correct":true}]');

select pg_temp.seed_question('MAT-E-01', 3::smallint, 90,
  'Round 47,962 to the nearest hundred.',
  'The hundreds digit is 9, so the choice is between 47,900 and 48,000. Look at the tens digit: 6, which is 5 or more, so round up. 47,962 → 48,000.',
  '[{"body":"47,900","mc":"MC-PLACE"},{"body":"48,000","correct":true},{"body":"47,960","mc":"MC-MISREAD"},{"body":"50,000","mc":"MC-MISREAD"}]');

-- ——— MAT-E-02 · Column Addition & Subtraction ———

select pg_temp.seed_question('MAT-E-02', 1::smallint, 45,
  'Calculate 356 + 487.',
  'Ones: 6 + 7 = 13 — write 3, carry 1. Tens: 5 + 8 + 1 = 14 — write 4, carry 1. Hundreds: 3 + 4 + 1 = 8. Answer: 843.',
  '[{"body":"733","mc":"MC-CARRY"},{"body":"833","mc":"MC-CARRY"},{"body":"843","correct":true},{"body":"853","mc":"MC-SLIP"}]');

select pg_temp.seed_question('MAT-E-02', 2::smallint, 60,
  'Calculate 703 − 458.',
  'The ones column needs an exchange, but the tens column is 0, so exchange from the hundreds first: 703 becomes 6 hundreds, 10 tens, 3 ones, then 6 hundreds, 9 tens, 13 ones. Now subtract: 13 − 8 = 5, 9 − 5 = 4, 6 − 4 = 2. Answer: 245.',
  '[{"body":"245","correct":true},{"body":"255","mc":"MC-SLIP"},{"body":"345","mc":"MC-CARRY"},{"body":"355","mc":"MC-CARRY"}]');

select pg_temp.seed_question('MAT-E-02', 3::smallint, 90,
  'A shop takes £1,204 on Saturday and £876 on Sunday. How much more does it take on Saturday than on Sunday?',
  '"How much more" asks for the difference, so subtract: 1,204 − 876. Exchange through the columns: 1,204 − 876 = 328. Saturday took £328 more.',
  '[{"body":"£328","correct":true},{"body":"£2,080","mc":"MC-OP"},{"body":"£432","mc":"MC-SLIP"},{"body":"£338","mc":"MC-CARRY"}]');

-- ——— MAT-E-03 · Short Multiplication & Division ———

select pg_temp.seed_question('MAT-E-03', 1::smallint, 45,
  'Calculate 47 × 6.',
  'Ones: 7 × 6 = 42 — write 2, carry 4. Tens: 4 × 6 = 24, plus the carried 4 makes 28. Answer: 282.',
  '[{"body":"282","correct":true},{"body":"242","mc":"MC-CARRY"},{"body":"2,428","mc":"MC-PLACE"},{"body":"288","mc":"MC-SLIP"}]');

select pg_temp.seed_question('MAT-E-03', 2::smallint, 60,
  'Calculate 372 ÷ 4.',
  'Short division: 3 ÷ 4 doesn''t go, so take 37 ÷ 4 = 9 remainder 1. Carry the 1 to make 12; 12 ÷ 4 = 3. Answer: 93. Check by multiplying back: 93 × 4 = 372.',
  '[{"body":"93","correct":true},{"body":"92","mc":"MC-SLIP"},{"body":"83","mc":"MC-PLACE"},{"body":"103","mc":"MC-CARRY"}]');

select pg_temp.seed_question('MAT-E-03', 3::smallint, 90,
  'A minibus seats 14 children. How many minibuses are needed to take 187 children on a trip?',
  '187 ÷ 14 = 13 remainder 5. Thirteen full minibuses carry 182 children, leaving 5 who still need transport — so a fourteenth minibus is needed. In "how many are needed" problems, a remainder rounds up. Answer: 14.',
  '[{"body":"14","correct":true},{"body":"13","mc":"MC-REMAINDER"},{"body":"13 remainder 5","mc":"MC-REMAINDER"},{"body":"12","mc":"MC-SLIP"}]');

-- ——— MAT-E-04 · Fractions of Amounts ———

select pg_temp.seed_question('MAT-E-04', 1::smallint, 45,
  'What is 1⁄4 of 36?',
  'Finding a quarter means dividing by 4: 36 ÷ 4 = 9.',
  '[{"body":"9","correct":true},{"body":"12","mc":"MC-MISREAD"},{"body":"32","mc":"MC-OP"},{"body":"144","mc":"MC-OP"}]');

select pg_temp.seed_question('MAT-E-04', 2::smallint, 60,
  'What is 3⁄8 of 56?',
  'Divide by the denominator, then multiply by the numerator: 56 ÷ 8 = 7, and 7 × 3 = 21. One eighth is 7, so three eighths is 21.',
  '[{"body":"21","correct":true},{"body":"7","mc":"MC-PARTIAL"},{"body":"24","mc":"MC-SLIP"},{"body":"168","mc":"MC-OP"}]');

select pg_temp.seed_question('MAT-E-04', 3::smallint, 90,
  'Ella spends 2⁄5 of her £30 birthday money on a book. How much does she have left?',
  'First the spend: one fifth of £30 is £6, so two fifths is £12. The question asks what is LEFT: £30 − £12 = £18. (Answering £12 answers a different question — read to the end.)',
  '[{"body":"£18","correct":true},{"body":"£12","mc":"MC-MISREAD"},{"body":"£6","mc":"MC-PARTIAL"},{"body":"£20","mc":"MC-SLIP"}]');

-- ——— MAT-E-05 · Time & Timetables ———

select pg_temp.seed_question('MAT-E-05', 1::smallint, 45,
  'A film starts at 14:40 and lasts 50 minutes. At what time does it end?',
  'Bridge through the hour: 20 minutes takes it to 15:00, and the remaining 30 minutes takes it to 15:30. (14:40 + 50 is not 14:90 — there are 60 minutes in an hour.)',
  '[{"body":"15:30","correct":true},{"body":"14:90","mc":"MC-TIME-60"},{"body":"15:20","mc":"MC-SLIP"},{"body":"15:10","mc":"MC-SLIP"}]');

select pg_temp.seed_question('MAT-E-05', 2::smallint, 60,
  'A train leaves at 09:47 and arrives at 11:23. How long is the journey?',
  'Count on in stages: 09:47 → 10:00 is 13 minutes; 10:00 → 11:00 is 1 hour; 11:00 → 11:23 is 23 minutes. Total: 1 hour 36 minutes. (Column-subtracting the clock times treats an hour as 100 minutes and gives a wrong answer.)',
  '[{"body":"1 hour 36 minutes","correct":true},{"body":"1 hour 24 minutes","mc":"MC-SLIP"},{"body":"1 hour 76 minutes","mc":"MC-TIME-60"},{"body":"2 hours 36 minutes","mc":"MC-SLIP"}]');

select pg_temp.seed_question('MAT-E-05', 3::smallint, 90,
  'Bus A leaves Croydon at 08:35 and takes 47 minutes. Bus B leaves at 08:50 and takes 29 minutes. Which bus arrives first, and when?',
  'Work each out. Bus A: 08:35 + 47 — 25 minutes reaches 09:00, the other 22 reach 09:22. Bus B: 08:50 + 29 — 10 minutes reaches 09:00, the other 19 reach 09:19. Bus B arrives first, at 09:19, despite leaving later.',
  '[{"body":"Bus B, at 09:19","correct":true},{"body":"Bus A, at 09:22","mc":"MC-MISREAD"},{"body":"Bus B, at 09:29","mc":"MC-SLIP"},{"body":"Bus A, at 09:12","mc":"MC-SLIP"}]');

-- ——— MAT-X-01 · Ratio & Proportion ———

select pg_temp.seed_question('MAT-X-01', 2::smallint, 60,
  'Purple paint is made by mixing red and blue in the ratio 2 : 3. If 12 tins of red are used, how many tins of blue are needed?',
  'The ratio says every 2 tins of red go with 3 tins of blue. 12 tins of red is 12 ÷ 2 = 6 lots of the ratio, so blue needs 6 × 3 = 18 tins.',
  '[{"body":"18","correct":true},{"body":"8","mc":"MC-RATIO-PART"},{"body":"13","mc":"MC-OP"},{"body":"30","mc":"MC-RATIO-PART"}]');

select pg_temp.seed_question('MAT-X-01', 3::smallint, 90,
  '£45 is shared between two children in the ratio 4 : 5. How much is the larger share?',
  'Total parts: 4 + 5 = 9, so each part is £45 ÷ 9 = £5. The larger share is 5 parts: 5 × £5 = £25. (Taking 4⁄5 of £45 treats the ratio as a fraction of the whole — a part-versus-whole mix-up.)',
  '[{"body":"£25","correct":true},{"body":"£20","mc":"MC-MISREAD"},{"body":"£36","mc":"MC-RATIO-PART"},{"body":"£5","mc":"MC-PARTIAL"}]');

select pg_temp.seed_question('MAT-X-01', 3::smallint, 90,
  'A recipe for 4 people uses 300 g of flour. How much flour is needed for 10 people?',
  'Find the amount for one person: 300 ÷ 4 = 75 g. Then scale up: 75 × 10 = 750 g. (The unitary method — down to one, then up to what you need.)',
  '[{"body":"750 g","correct":true},{"body":"3,000 g","mc":"MC-OP"},{"body":"600 g","mc":"MC-PARTIAL"},{"body":"120 g","mc":"MC-RATIO-PART"}]');

-- ——— MAT-X-02 · Algebraic Reasoning ———

select pg_temp.seed_question('MAT-X-02', 2::smallint, 60,
  'If 3n + 4 = 19, what is n?',
  'Undo each step in reverse order. Subtract 4 from both sides: 3n = 15. Divide both sides by 3: n = 5. Check: 3 × 5 + 4 = 19. ✓',
  '[{"body":"5","correct":true},{"body":"15","mc":"MC-PARTIAL"},{"body":"7","mc":"MC-SLIP"},{"body":"4","mc":"MC-ALG-INV"}]');

select pg_temp.seed_question('MAT-X-02', 3::smallint, 90,
  'y = 4x − 3. What is y when x = 6?',
  'Substitute x = 6: y = 4 × 6 − 3 = 24 − 3 = 21. Multiplication happens before subtraction.',
  '[{"body":"21","correct":true},{"body":"27","mc":"MC-ALG-INV"},{"body":"24","mc":"MC-PARTIAL"},{"body":"12","mc":"MC-OP"}]');

select pg_temp.seed_question('MAT-X-02', 3::smallint, 90,
  'Two whole numbers multiply to make 24 and differ by 5. What is their sum?',
  'List the factor pairs of 24: 1 × 24, 2 × 12, 3 × 8, 4 × 6. The pair with a difference of 5 is 3 and 8. Their sum is 11.',
  '[{"body":"11","correct":true},{"body":"10","mc":"MC-MISREAD"},{"body":"14","mc":"MC-SLIP"},{"body":"8","mc":"MC-PARTIAL"}]');

-- ——— MAT-X-03 · Multi-step Word Problems ———

select pg_temp.seed_question('MAT-X-03', 2::smallint, 60,
  'Pencils cost 35p each. Sam buys 6 pencils and pays with a £5 note. How much change does he receive?',
  'Step 1 — the cost: 6 × 35p = 210p = £2.10. Step 2 — the change: £5.00 − £2.10 = £2.90. Stopping at £2.10 answers "how much did he spend", not the question asked.',
  '[{"body":"£2.90","correct":true},{"body":"£2.10","mc":"MC-PARTIAL"},{"body":"£4.65","mc":"MC-MISREAD"},{"body":"£3.90","mc":"MC-CARRY"}]');

select pg_temp.seed_question('MAT-X-03', 3::smallint, 90,
  'A cinema has 18 rows of 24 seats. 350 tickets have been sold. How many seats are empty?',
  'Step 1 — total seats: 18 × 24 = 432. Step 2 — empty seats: 432 − 350 = 82.',
  '[{"body":"82","correct":true},{"body":"432","mc":"MC-PARTIAL"},{"body":"92","mc":"MC-CARRY"},{"body":"78","mc":"MC-SLIP"}]');

select pg_temp.seed_question('MAT-X-03', 3::smallint, 90,
  'Amara buys 3 notebooks at £2.35 each and one pen. She pays with a £10 note and receives £1.60 change. How much does the pen cost?',
  'Step 1 — the notebooks: 3 × £2.35 = £7.05. Step 2 — total spent: £10.00 − £1.60 = £8.40. Step 3 — the pen: £8.40 − £7.05 = £1.35.',
  '[{"body":"£1.35","correct":true},{"body":"£7.05","mc":"MC-PARTIAL"},{"body":"£2.95","mc":"MC-MISREAD"},{"body":"£1.45","mc":"MC-SLIP"}]');

drop function pg_temp.seed_question(text, smallint, integer, text, text, jsonb);
