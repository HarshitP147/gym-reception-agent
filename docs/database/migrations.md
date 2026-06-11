# Migrations

Location: `supabase/migrations/`, numbered `NNNN_description.sql`.

## Conventions

- **Self-contained & idempotent.** Each file must run cleanly in one paste into the Supabase SQL editor, including on a re-run. Start with `drop table if exists … cascade;` (children first), then create, seed, and enable RLS.
- **UUID PKs** via `gen_random_uuid()` (built into Supabase Postgres — no extension needed).
- **Wire seed FKs by natural key**, not literal UUIDs (see [schema.md](schema.md)).
- **Always re-enable RLS + recreate policies** in the same file, since `drop … cascade` removes them.
- **Target Supabase, not vanilla Postgres.** Policies reference the `anon` and `authenticated` roles, which exist in Supabase.

## Running

Paste the file into the Supabase dashboard → SQL editor → Run. There is no Supabase CLI wired into this repo; if you add one, document it here.

## Verifying

After running, check row counts in the Table Editor against the expected counts in [schema.md](schema.md), and confirm each table shows RLS "enabled" with a SELECT policy. End-to-end check via the API route is in [../guides/local-setup.md](../guides/local-setup.md).
