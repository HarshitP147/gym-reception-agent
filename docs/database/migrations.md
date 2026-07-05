# Migrations

Location: `supabase/migrations/`, numbered `NNNN_description.sql`.

## Conventions

- **Self-contained & idempotent.** Each file must run cleanly in one paste into the Supabase SQL editor, including on a re-run. Start with `drop table if exists … cascade;` (children first), then create, seed, and enable RLS.
- **UUID PKs** via `gen_random_uuid()` (built into Supabase Postgres — no extension needed).
- **Wire seed FKs by natural key**, not literal UUIDs (see [schema.md](schema.md)).
- **Always re-enable RLS + recreate policies** in the same file, since `drop … cascade` removes them.
- **Target Supabase, not vanilla Postgres.** Policies reference the `anon` and `authenticated` roles, which exist in Supabase.

## Running

Supabase CLI is linked to the `gym-agent` project (ref `nitrtksdydxjmtfavqai`). For a new migration file:

```
supabase db push --dry-run --linked   # preview what would run
supabase db push --linked             # apply it
```

`supabase migration list` shows local vs. remote status. Pasting into the dashboard SQL editor still works too, but then the CLI's remote history won't know about it — run `supabase migration repair <version> --status applied --linked` after, or `db push` will try to replay it.

**0001/0002/0003 were originally applied by hand** (before the CLI was linked), then retroactively marked `applied` via `migration repair` so `db push` wouldn't replay 0001's `drop table cascade` against live data. Keep that in mind if the remote history and local files ever look out of sync — check `migration list` before pushing, don't assume.

## Verifying

After running, check row counts in the Table Editor against the expected counts in [schema.md](schema.md), and confirm each table shows RLS "enabled" with a SELECT policy. End-to-end check via the API route is in [../guides/local-setup.md](../guides/local-setup.md).
