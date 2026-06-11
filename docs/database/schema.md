# Database Schema

Defined in [`supabase/migrations/0001_init_gym_schema.sql`](../../supabase/migrations/0001_init_gym_schema.sql). All PKs are `uuid default gen_random_uuid()`. RLS enabled on every table with a `Public read <table>` SELECT-only policy for `anon, authenticated`.

## Tables

| Table | Key columns | Notes |
|---|---|---|
| `coaches` | name (unique), speciality, bio, certifications, years_experience, available, image_url | 8 rows. Only 4 have `image_url` (the rest are null). |
| `membership_plans` | name (unique), price_monthly, features (text[]), is_popular, max_pt_sessions, includes_classes, includes_recovery | 3 rows: Basic / Performance (popular) / Elite. Features match `src/components/Pricing.tsx` verbatim. |
| `gym_info` | name, address, city, eircode, phone, email, whatsapp_number, opening_hours (jsonb), google_rating, total_members, established_year, description | 1 row. Single source of truth for gym facts. |
| `classes` | name (unique), category, coach_id→coaches, schedule_days (text[]), schedule_time, duration_mins, spots_total, spots_remaining, difficulty, description | 12 rows. First 6 match `src/components/HowItWorks.tsx`. |
| `members` | name, email (unique), phone, plan_id→membership_plans, join_date, status, goals, emergency_contact | 20 rows. `status` ∈ {active, inactive, trial}. Fake data. |
| `bookings` | member_id→members, class_id→classes, booking_date, status, notes | 30 rows. `status` ∈ {confirmed, cancelled, attended}. |

## Foreign keys

```
classes.coach_id   → coaches.id        (on delete set null)
members.plan_id    → membership_plans.id (on delete set null)
bookings.member_id → members.id         (on delete cascade)
bookings.class_id  → classes.id         (on delete cascade)
```

## Seed FK wiring

Seeds use **natural-key subqueries** rather than hardcoded UUIDs, e.g. `(select id from coaches where name = 'Coach Sean')`. `bookings` are inserted via `INSERT … SELECT` from a `VALUES` list joined to `members` (by email) and `classes` (by name). This keeps the script portable and re-runnable. The unique constraints on name/email make these subqueries safe.

Expected counts after running: coaches 8, classes 12, membership_plans 3, gym_info 1, members 20, bookings 30.
