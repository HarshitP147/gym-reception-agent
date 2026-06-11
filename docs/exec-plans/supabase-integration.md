# Exec Plan — Supabase Integration

Status: **done** (data layer only; frontend not rewired).

## Goal
Add a Supabase Postgres backend seeded with realistic data, exposed via one JSON endpoint for an AI chat agent. No frontend changes.

## What was built
- `@supabase/supabase-js` v2 installed.
- `src/lib/supabase.ts` — shared anon client.
- `supabase/migrations/0001_init_gym_schema.sql` — 6 tables + seed + RLS, idempotent.
- `src/app/api/gym-data/route.ts` — `GET` returns all tables as one JSON object.
- `.env.example` template; `.gitignore` un-ignores it via `!.env.example`.

## Decisions
- **UUID PKs** + seed FKs wired by **natural-key subqueries** (no hardcoded UUIDs) → portable, re-runnable.
- **RLS on + public SELECT-only policies** so the anon key can read but not write; silences Supabase "unrestricted table" warnings.
- First 6 classes + all plan features mirror the existing hardcoded site copy verbatim.

## Lessons learned / mistakes avoided
- **Env var name mismatch broke the route.** Code originally read `NEXT_PUBLIC_SUPABASE_ANON_KEY`; the real `.env.local` used the newer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Symptom: `/api/gym-data` returned nothing (client threw on import). Fix: client accepts both names (publishable preferred). Always confirm the actual key name Supabase issues.
- **Restart after env edits.** Env is read at boot; don't assume a stale dev server picked up new vars (Turbopack usually hot-reloads `lib` edits, but verify).
- **Two data sources.** Frontend copy stayed hardcoded; DB is separate. Not a bug — a deliberate boundary. Don't assume the site reads the DB.
- **Only 4 coach portraits exist** → 4 coaches have `image_url = null`. Don't fabricate 8 images.

## Follow-ups (not done)
- Wire frontend components to read from `/api/gym-data` or Supabase directly.
- Connect the AI chat agent (`ChatWidget`) to the gym-data endpoint.
- Add a privileged write path (service role) if bookings/members need to be mutated.
