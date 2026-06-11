# Data Layer

## Supabase client — `src/lib/supabase.ts`

Single shared `createClient` instance, imported anywhere (server or client). Reads env at module load and **throws on import if vars are missing**.

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??   // current Supabase name
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;            // legacy alias
```

Both key names are accepted — the project's `.env.local` uses the **publishable** name. See the pitfall in [../guides/local-setup.md](../guides/local-setup.md).

## API route — `src/app/api/gym-data/route.ts`

- `export const dynamic = "force-dynamic"` so it always hits the DB.
- `GET` only. Returns `Response.json({...})` (Web API, not `NextResponse`).
- Fans out 6 queries with `Promise.all`, each `.select("*")` ordered sensibly; `gym_info` uses `.single()`.
- Collects errors → returns 500 `{ error, details }` if any query failed.

Shape returned:

```json
{ "gym_info": {…}, "coaches": [...], "classes": [...],
  "membership_plans": [...], "members": [...], "bookings": [...] }
```

## Access model

Tables have **RLS enabled with public SELECT-only policies**. The anon/publishable key can read everything but cannot write. This is intentional — see [../database/schema.md](../database/schema.md). Don't disable RLS to "fix" a write; writes should use a privileged path that does not exist yet.
