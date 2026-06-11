# Local Setup & Verify

## Requirements
- Node.js 20+ (Node 24 LTS on Vercel), npm.
- A Supabase project.

## Steps
1. `npm install`
2. Create `.env.local` (copy `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
   DEEPSEEK_API_KEY=sk-…          # powers FitAgent chat (/api/chat); server-side only
   ```
   (Supabase key: Project Settings → API. DeepSeek key: platform.deepseek.com.)
3. Run the migrations in the Supabase SQL editor → Run, in order:
   - `supabase/migrations/0001_init_gym_schema.sql` (schema + seed + read RLS)
   - `supabase/migrations/0002_bookings_insert_policy.sql` (anon INSERT on `bookings`, needed for chat bookings)
4. `npm run dev`

## Verify the data layer
```bash
curl -s http://localhost:3000/api/gym-data | jq \
  '{coaches:(.coaches|length), classes:(.classes|length), plans:(.membership_plans|length),
    members:(.members|length), bookings:(.bookings|length), gym:(.gym_info.name)}'
```
Expect: coaches 8, classes 12, plans 3, members 20, bookings 30, gym "IronPulse Fitness".

## Verify the chat (FitAgent)
```bash
curl -s -N -X POST http://localhost:3000/api/chat -H 'content-type: application/json' \
  -d '{"sessionId":"t","messages":[{"role":"user","content":"What are your opening hours?"}]}'
```
Streams a plain-text reply. No `DEEPSEEK_API_KEY` ⇒ 500 `"Chat is not configured…"`.
Restart `next dev` after adding the key (read at boot). See [../architecture/chat-agent.md](../architecture/chat-agent.md).

## Commands
| Command | Does |
|---|---|
| `npm run dev` | dev server (Turbopack) |
| `npm run build` | production build |
| `npm run start` | serve prod build |
| `npm run lint` | eslint |

## Production (Vercel)
Deployed at `https://gym-site-agent.vercel.app`. Verify the live data layer:
```bash
curl -s https://gym-site-agent.vercel.app/api/gym-data | jq '.gym_info.name'
```
- Endpoint is **`/api/gym-data`** — `/api/data` returns 404 (wrong path, not a broken deploy).
- Env vars live in **Vercel → project → Settings → Environment Variables**, not `.env.local` (which is gitignored and never uploaded).
- `NEXT_PUBLIC_*` vars are **baked at build time** → after changing them in Vercel, **redeploy** for it to take effect.

## Pitfalls (learned)
- **Empty/failing `/api/gym-data`?** Almost always env. The client reads `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `…_ANON_KEY`). A missing/misnamed key throws on import and the route returns nothing. Fix `.env.local` and **restart `next dev`** (env is read at boot, though Turbopack often hot-reloads `src/lib` edits).
- **Wrong port.** If 3000 is busy, dev runs on 3001 — curl the port shown in the log.
- **Can't write via the API?** By design — RLS allows reads only. See [../database/schema.md](../database/schema.md).
