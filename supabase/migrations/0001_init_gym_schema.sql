-- =============================================================================
-- IronPulse Fitness — full schema + seed data (self-contained, idempotent)
-- Paste into the Supabase SQL editor and run once. Safe to re-run.
--
-- UUID primary keys (gen_random_uuid). Seed foreign keys are wired via
-- natural-key subqueries (no hardcoded UUID literals). RLS is enabled on
-- every table with public SELECT-only policies so the anon key used by
-- /api/gym-data can read, while writes stay blocked.
-- =============================================================================

-- 1. Drop (children first; cascade clears policies/constraints) ---------------
drop table if exists bookings, members, classes, membership_plans, coaches, gym_info cascade;

-- 2. Tables -------------------------------------------------------------------

create table coaches (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique,
  speciality       text not null,
  bio              text,
  certifications   text,
  years_experience int,
  available        boolean not null default true,
  image_url        text
);

create table membership_plans (
  id                uuid primary key default gen_random_uuid(),
  name              text not null unique,
  price_monthly     numeric(6,2) not null,
  features          text[] not null default '{}',
  is_popular        boolean not null default false,
  max_pt_sessions   int not null default 0,
  includes_classes  boolean not null default false,
  includes_recovery boolean not null default false
);

create table gym_info (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  address          text,
  city             text,
  eircode          text,
  phone            text,
  email            text,
  whatsapp_number  text,
  opening_hours    jsonb,
  google_rating    numeric(2,1),
  total_members    int,
  established_year int,
  description      text
);

create table classes (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  category        text,
  coach_id        uuid references coaches(id) on delete set null,
  schedule_days   text[] not null default '{}',
  schedule_time   text,
  duration_mins   int,
  spots_total     int,
  spots_remaining int,
  difficulty      text,
  description     text
);

create table members (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null unique,
  phone             text,
  plan_id           uuid references membership_plans(id) on delete set null,
  join_date         date,
  status            text not null check (status in ('active','inactive','trial')),
  goals             text,
  emergency_contact text
);

create table bookings (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid references members(id) on delete cascade,
  class_id     uuid references classes(id) on delete cascade,
  booking_date date,
  status       text not null check (status in ('confirmed','cancelled','attended')),
  notes        text
);

-- 3. Seed ---------------------------------------------------------------------

-- coaches (8)
insert into coaches (name, speciality, bio, certifications, years_experience, available, image_url) values
  ('Coach Sean',   'Strength & Powerlifting',        '10 years competitive powerlifting, IPF certified coach. Sean has coached over 200 members to personal bests.',                    'IPF Certified Coach',                  10, true, '/images/portraits/178102586208c0.png'),
  ('Coach Claire', 'HIIT & MetCon',                  'Former national-level sprinter. Claire''s MetCon Burn class has a 3-month waiting list for a reason.',                              'Former national sprinter, L3 PT',      7,  true, '/images/portraits/17810259072777.png'),
  ('Coach Conor',  'Boxing & Conditioning',          'Amateur boxing champion turned S&C coach. Pad work, technique, fitness — Conor covers all three.',                                  'Amateur boxing champion, S&C L2',      8,  true, '/images/portraits/1781025927f526.png'),
  ('Coach Niamh',  'Cardio & Cycling',               'Triathlete and endurance specialist. Niamh designs every Spin session around output, not just effort.',                            'Triathlon coach, Spin certified',      6,  true, '/images/portraits/17810259556dcc.png'),
  ('Coach Aoife',  'Yoga & Mobility',                'Yoga and mobility specialist who keeps the studio calm and focused. Aoife leads both flow and recovery sessions.',                  '200hr YTT Certified',                  9,  true, null),
  ('Coach Marcus', 'Nutrition & Body Composition',   'Sports nutritionist who turns goals into practical meal plans. Marcus runs the body composition and nutrition programmes.',         'Registered Sports Nutritionist',       5,  true, null),
  ('Coach Roisin', 'Pilates & Core',                 'Pilates and core specialist focused on posture, control and injury prevention. Roisin teaches the reformer and mat classes.',       'STOTT Pilates Certified',              7,  true, null),
  ('Coach Darragh','CrossFit & Functional',          'Functional fitness coach who programmes the daily WOD. Darragh scales every workout so all levels can train together.',             'CrossFit Level 2 (CF-L2)',             6,  true, null);

-- membership_plans (3) — features verbatim from src/components/Pricing.tsx
insert into membership_plans (name, price_monthly, features, is_popular, max_pt_sessions, includes_classes, includes_recovery) values
  ('Basic',       39.00,  ARRAY['Full gym floor access','Cardio & free weights','Changing rooms & lockers','IronPulse app included'],                                              false, 0, false, false),
  ('Performance', 69.00,  ARRAY['Everything in Basic','Unlimited group classes','1 personal training session/mo','Recovery suite access','Nutrition check-in/mo'],                  true,  1, true,  true),
  ('Elite',       129.00, ARRAY['Everything in Performance','4 PT sessions per month','Priority class booking','Body composition scans','Dedicated locker'],                        false, 4, true,  true);

-- gym_info (1)
insert into gym_info (name, address, city, eircode, phone, email, whatsapp_number, opening_hours, google_rating, total_members, established_year, description) values
  ('IronPulse Fitness',
   '14 Ranelagh Road, Ranelagh',
   'Dublin 6',
   'D06 X214',
   '+353 1 555 0192',
   'hello@ironpulsefitness.ie',
   '+353 87 555 0192',
   '{"mon_fri":"5am-11pm","sat_sun":"6am-9pm"}'::jsonb,
   4.9,
   2400,
   2019,
   'IronPulse Fitness is a 12,000 sq ft strength and conditioning gym in Ranelagh, Dublin 6. 8 certified coaches, 40+ classes a week, a full free-weights floor, boxing bay, yoga studio and recovery suite.');

-- classes (12) — first 6 match src/components/HowItWorks.tsx
insert into classes (name, category, coach_id, schedule_days, schedule_time, duration_mins, spots_total, spots_remaining, difficulty, description) values
  ('Powerlifting Foundations', 'Strength', (select id from coaches where name = 'Coach Sean'),   ARRAY['Mon','Wed','Fri'],                     '6:00 AM',  60, 12, 8,  'Intermediate', 'Squat, bench and deadlift technique with progressive programming for real strength gains.'),
  ('MetCon Burn',              'HIIT',     (select id from coaches where name = 'Coach Claire'), ARRAY['Tue','Thu'],                           '7:00 AM',  45, 16, 4,  'Advanced',     'High-intensity metabolic conditioning. Also runs at 6:30 PM. Expect to leave soaked.'),
  ('Power Yoga Flow',          'Yoga',     (select id from coaches where name = 'Coach Aoife'),  ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], '8:00 AM', 60, 20, 12, 'All levels',  'A strong, breath-led vinyasa flow to build mobility, balance and focus.'),
  ('Bag & Pad Boxing',         'Boxing',   (select id from coaches where name = 'Coach Conor'),  ARRAY['Mon','Wed','Sat'],                     '7:30 PM',  60, 14, 6,  'Intermediate', 'Heavy-bag rounds and partner pad work for technique, power and conditioning.'),
  ('Spin & Cycle',             'Cardio',   (select id from coaches where name = 'Coach Niamh'),  ARRAY['Tue','Thu','Sat'],                     '6:00 AM',  45, 20, 10, 'All levels',   'Output-based indoor cycling on connected bikes. Train to your numbers, not just effort.'),
  ('Mobility & Stretch',       'Recovery', (select id from coaches where name = 'Coach Aoife'),  ARRAY['Sun'],                                 '9:00 AM',  45, 15, 15, 'Beginner',     'Guided mobility and stretching to unwind the week and aid recovery. Open class.'),
  ('Pilates Core',             'Pilates',  (select id from coaches where name = 'Coach Roisin'), ARRAY['Mon','Wed','Fri'],                     '9:00 AM',  50, 16, 9,  'Intermediate', 'Mat and reformer Pilates focused on deep core strength, posture and control.'),
  ('CrossFit WOD',             'CrossFit', (select id from coaches where name = 'Coach Darragh'),ARRAY['Mon','Tue','Thu','Sat'],               '5:30 PM',  60, 18, 5,  'Advanced',     'The daily workout of the day, scaled for every level. Functional movements, high intensity.'),
  ('Nutrition Workshop',       'Nutrition',(select id from coaches where name = 'Coach Marcus'), ARRAY['Wed'],                                 '12:00 PM', 90, 25, 18, 'Beginner',     'Practical nutrition and body-composition workshop. Build a plan you can actually follow.'),
  ('Boxing Fundamentals',      'Boxing',   (select id from coaches where name = 'Coach Conor'),  ARRAY['Tue','Thu'],                           '6:00 PM',  60, 14, 11, 'Beginner',     'Learn stance, footwork and the core punches in a supportive, beginner-friendly setting.'),
  ('Morning Yoga',             'Yoga',     (select id from coaches where name = 'Coach Aoife'),  ARRAY['Mon','Tue','Wed','Thu','Fri'],         '6:30 AM',  45, 20, 14, 'All levels',   'Gentle morning flow to wake up the body and set up the day. Perfect before work.'),
  ('Evening HIIT',             'HIIT',     (select id from coaches where name = 'Coach Claire'), ARRAY['Mon','Wed','Fri'],                     '7:00 PM',  45, 16, 7,  'Intermediate', 'Fast, full-body interval training to finish the day strong. Bodyweight and kettlebells.');

-- members (20)
insert into members (name, email, phone, plan_id, join_date, status, goals, emergency_contact) values
  ('Aoife Murphy',       'aoife.murphy@example.ie',       '+353 87 201 4471', (select id from membership_plans where name = 'Performance'), '2022-03-14', 'active',   'Lose 8kg and build endurance',          'Sean Murphy — +353 87 990 1122'),
  ('Cian O''Brien',      'cian.obrien@example.ie',        '+353 86 334 9920', (select id from membership_plans where name = 'Elite'),       '2020-09-01', 'active',   'Compete in first powerlifting meet',    'Mary OBrien — +353 86 221 7788'),
  ('Saoirse Kelly',      'saoirse.kelly@example.ie',      '+353 85 778 1203', (select id from membership_plans where name = 'Basic'),       '2026-06-01', 'trial',    'Get back into a routine',               'Niall Kelly — +353 85 660 4411'),
  ('Liam Walsh',         'liam.walsh@example.ie',         '+353 87 445 6677', (select id from membership_plans where name = 'Performance'), '2021-11-20', 'active',   'Improve cardio and mobility',           'Emma Walsh — +353 87 112 9090'),
  ('Niamh Byrne',        'niamh.byrne@example.ie',        '+353 83 992 0145', (select id from membership_plans where name = 'Basic'),       '2023-01-10', 'active',   'Stay consistent three times a week',    'Tom Byrne — +353 83 445 1212'),
  ('Oisin Ryan',         'oisin.ryan@example.ie',         '+353 86 110 3388', (select id from membership_plans where name = 'Basic'),       '2022-07-05', 'inactive', 'Build general strength',                'Grace Ryan — +353 86 778 5566'),
  ('Caoimhe Doyle',      'caoimhe.doyle@example.ie',      '+353 87 660 2299', (select id from membership_plans where name = 'Elite'),       '2019-05-22', 'active',   'Body recomposition',                    'Paul Doyle — +353 87 334 8899'),
  ('Fionn McCarthy',     'fionn.mccarthy@example.ie',     '+353 85 223 7744', (select id from membership_plans where name = 'Performance'), '2026-05-20', 'trial',    'Try classes before committing',         'Aoibhe McCarthy — +353 85 901 2323'),
  ('Aoibhinn Gallagher', 'aoibhinn.gallagher@example.ie', '+353 87 901 5566', (select id from membership_plans where name = 'Performance'), '2021-02-28', 'active',   'Run a half marathon',                   'Conor Gallagher — +353 87 556 0011'),
  ('Padraig Lynch',      'padraig.lynch@example.ie',      '+353 86 447 8812', (select id from membership_plans where name = 'Basic'),       '2023-08-15', 'active',   'Lose weight and feel better',           'Sinead Lynch — +353 86 223 6677'),
  ('Sinead O''Connor',   'sinead.oconnor@example.ie',     '+353 83 556 9933', (select id from membership_plans where name = 'Performance'), '2020-12-03', 'inactive', 'Reduce stress and improve flexibility', 'Mark OConnor — +353 83 778 4545'),
  ('Cillian Brennan',    'cillian.brennan@example.ie',    '+353 87 220 6644', (select id from membership_plans where name = 'Elite'),       '2019-10-11', 'active',   'Increase squat and bench numbers',      'Laura Brennan — +353 87 661 9988'),
  ('Orla Fitzgerald',    'orla.fitzgerald@example.ie',    '+353 85 990 1177', (select id from membership_plans where name = 'Performance'), '2022-04-18', 'active',   'Tone up and improve posture',           'David Fitzgerald — +353 85 332 7711'),
  ('Eoin Kennedy',       'eoin.kennedy@example.ie',       '+353 86 778 2200', (select id from membership_plans where name = 'Basic'),       '2026-06-05', 'trial',    'See if boxing is for me',               'Roisin Kennedy — +353 86 110 5454'),
  ('Maeve Healy',        'maeve.healy@example.ie',        '+353 87 334 5511', (select id from membership_plans where name = 'Performance'), '2021-06-30', 'active',   'Build core strength',                   'Brian Healy — +353 87 880 3322'),
  ('Darragh Nolan',      'darragh.nolan@example.ie',      '+353 83 221 6688', (select id from membership_plans where name = 'Basic'),       '2023-03-09', 'active',   'Functional fitness for daily life',     'Aoife Nolan — +353 83 990 7676'),
  ('Roisin Quinn',       'roisin.quinn@example.ie',       '+353 86 556 3399', (select id from membership_plans where name = 'Elite'),       '2020-01-25', 'active',   'Marathon training support',             'Cian Quinn — +353 86 445 2121'),
  ('Tadhg Murray',       'tadhg.murray@example.ie',       '+353 85 667 9900', (select id from membership_plans where name = 'Basic'),       '2022-09-12', 'inactive', 'Gain muscle mass',                      'Niamh Murray — +353 85 223 8787'),
  ('Clodagh Moran',      'clodagh.moran@example.ie',      '+353 87 112 4488', (select id from membership_plans where name = 'Performance'), '2023-11-02', 'active',   'Improve overall fitness',               'Eoin Moran — +353 87 667 1313'),
  ('Ronan Sweeney',      'ronan.sweeney@example.ie',      '+353 86 990 5522', (select id from membership_plans where name = 'Performance'), '2021-08-08', 'active',   'Boxing conditioning',                   'Sarah Sweeney — +353 86 334 9595');

-- bookings (30) — resolve member/class FKs by natural key
insert into bookings (member_id, class_id, booking_date, status, notes)
select m.id, c.id, b.booking_date::date, b.status, b.notes
from (values
  ('aoife.murphy@example.ie',       'MetCon Burn',              '2026-06-09', 'attended',  'Great session, hit a new PB on burpees'),
  ('aoife.murphy@example.ie',       'Power Yoga Flow',          '2026-06-13', 'confirmed', null),
  ('cian.obrien@example.ie',        'Powerlifting Foundations', '2026-06-08', 'attended',  'Worked on deadlift lockout'),
  ('cian.obrien@example.ie',        'CrossFit WOD',             '2026-06-12', 'confirmed', null),
  ('saoirse.kelly@example.ie',      'Morning Yoga',             '2026-06-10', 'attended',  'First class on the trial'),
  ('saoirse.kelly@example.ie',      'Pilates Core',             '2026-06-14', 'confirmed', 'Trying out the studio'),
  ('liam.walsh@example.ie',         'Spin & Cycle',             '2026-06-07', 'attended',  null),
  ('liam.walsh@example.ie',         'Evening HIIT',             '2026-06-11', 'confirmed', null),
  ('niamh.byrne@example.ie',        'Power Yoga Flow',          '2026-06-05', 'attended',  null),
  ('niamh.byrne@example.ie',        'Mobility & Stretch',       '2026-06-15', 'confirmed', null),
  ('oisin.ryan@example.ie',         'Bag & Pad Boxing',         '2026-06-03', 'cancelled', 'Pulled a muscle, had to cancel'),
  ('caoimhe.doyle@example.ie',      'Powerlifting Foundations', '2026-06-09', 'attended',  null),
  ('caoimhe.doyle@example.ie',      'Nutrition Workshop',       '2026-06-17', 'confirmed', 'Body composition review'),
  ('fionn.mccarthy@example.ie',     'CrossFit WOD',             '2026-06-10', 'attended',  'Tough WOD, scaled the pull-ups'),
  ('fionn.mccarthy@example.ie',     'Boxing Fundamentals',      '2026-06-12', 'confirmed', null),
  ('aoibhinn.gallagher@example.ie', 'MetCon Burn',              '2026-06-06', 'attended',  null),
  ('aoibhinn.gallagher@example.ie', 'Spin & Cycle',             '2026-06-13', 'confirmed', null),
  ('padraig.lynch@example.ie',      'Spin & Cycle',             '2026-06-04', 'attended',  null),
  ('padraig.lynch@example.ie',      'Morning Yoga',             '2026-06-11', 'cancelled', 'Slept in'),
  ('sinead.oconnor@example.ie',     'Power Yoga Flow',          '2026-05-28', 'attended',  null),
  ('cillian.brennan@example.ie',    'Powerlifting Foundations', '2026-06-10', 'attended',  'PB on squat'),
  ('cillian.brennan@example.ie',    'Evening HIIT',             '2026-06-16', 'confirmed', null),
  ('orla.fitzgerald@example.ie',    'Pilates Core',             '2026-06-08', 'attended',  null),
  ('orla.fitzgerald@example.ie',    'Power Yoga Flow',          '2026-06-14', 'confirmed', null),
  ('eoin.kennedy@example.ie',       'Boxing Fundamentals',      '2026-06-09', 'attended',  'First boxing class, loved it'),
  ('maeve.healy@example.ie',        'MetCon Burn',              '2026-06-11', 'confirmed', null),
  ('maeve.healy@example.ie',        'Mobility & Stretch',       '2026-06-07', 'attended',  null),
  ('darragh.nolan@example.ie',      'CrossFit WOD',             '2026-06-12', 'confirmed', null),
  ('roisin.quinn@example.ie',       'Nutrition Workshop',       '2026-06-18', 'confirmed', 'Meal plan follow-up'),
  ('ronan.sweeney@example.ie',      'Bag & Pad Boxing',         '2026-06-06', 'attended',  'Good pad work')
) as b(member_email, class_name, booking_date, status, notes)
join members m on m.email = b.member_email
join classes c on c.name = b.class_name;

-- 4. Row Level Security — public read, no public writes -----------------------
alter table coaches          enable row level security;
alter table membership_plans enable row level security;
alter table gym_info         enable row level security;
alter table classes          enable row level security;
alter table members          enable row level security;
alter table bookings         enable row level security;

create policy "Public read coaches"          on coaches          for select to anon, authenticated using (true);
create policy "Public read membership_plans" on membership_plans for select to anon, authenticated using (true);
create policy "Public read gym_info"         on gym_info         for select to anon, authenticated using (true);
create policy "Public read classes"          on classes          for select to anon, authenticated using (true);
create policy "Public read members"          on members          for select to anon, authenticated using (true);
create policy "Public read bookings"         on bookings         for select to anon, authenticated using (true);
