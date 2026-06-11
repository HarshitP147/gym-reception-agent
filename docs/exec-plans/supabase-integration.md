# Exec Plan — Supabase Integration

Status: **done & deployed** (data layer only; frontend not rewired). Live + verified at `https://gym-site-agent.vercel.app/api/gym-data`.

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
- **Vercel env vars are separate from `.env.local`.** `.env.local` is gitignored and never uploaded — env vars must be set in the Vercel dashboard. Because they're `NEXT_PUBLIC_*`, they are **baked at build time**: adding them after a build does nothing until a redeploy. (Confirmed set on Vercel; the deployed route works.)
- **Right route path matters.** The endpoint is `/api/gym-data`, not `/api/data`. Hitting `/api/data` returns 404 — that's a wrong-path error, not a broken deployment. Verified `GET /api/gym-data` returns 200 + full JSON in production.

## Follow-ups
- ~~Connect the AI chat agent (`ChatWidget`) to the gym data.~~ **Done** — see FitAgent below.
- Wire the marketing components to read from `/api/gym-data` or Supabase directly (still hardcoded).
- Add a privileged write path (service role) and tighten the booking INSERT policy (currently public).

---

# Exec Plan — FitAgent Chat (added later)

Status: **done & working locally.** Streaming AI receptionist embedded in the site.
Detail doc: [../architecture/chat-agent.md](../architecture/chat-agent.md).

## What was built
- `src/lib/gym-data.ts` — `getGymData()` extracted from the old route; reused by both `/api/gym-data` and `/api/chat`.
- `src/app/api/chat/route.ts` — streaming `POST`, DeepSeek tool-use loop.
- `src/lib/chat-tools.ts` — 4 tools (availability, timetable, member info, create_booking) + `executeTool()`.
- `src/components/ChatWidget.tsx` — rewritten to a grow-from-corner chat bubble with live-streamed replies and inline markdown.
- `supabase/migrations/0002_bookings_insert_policy.sql` — anon INSERT on `bookings`.

## Decisions
- **Provider = DeepSeek v4 Flash** via the OpenAI-compatible API (`openai` SDK, `baseURL=https://api.deepseek.com`). Picked over Claude purely on cost. Swap via `DEEPSEEK_MODEL`/`DEEPSEEK_BASE_URL`.
- **System prompt loads PUBLIC data only** (`gym_info`, `coaches`, `classes`, `membership_plans`) — `members`/`bookings` PII reached only through tools, one record at a time. Enforces "never expose raw IDs / technical details."
- **Booking writes via an anon INSERT RLS policy** (migration `0002`), not a service-role key. Public insert — accepted for the demo.
- **Persona tuned to be decisive + terse** (1–3 sentences, one recommendation not a menu) after early replies came back over-described.

## Lessons learned
- **DeepSeek/OpenAI streaming tool_calls arrive split across deltas** — accumulate by `index` before parsing args. Loop capped at `MAX_TOOL_ROUNDS = 6`.
- **`DEEPSEEK_API_KEY` is server-side** (no `NEXT_PUBLIC_`); missing ⇒ `/api/chat` 500s. Restart `next dev` after adding.
- **React Compiler bans `ref.current` / `crypto` / `Date.now()` during render** — `sessionId` is generated lazily inside the `send()` handler, not at render.
- **Model emits markdown** (`**bold**`) — the widget needed an inline renderer (`RichText`), stream-tolerant of unclosed markers.
- **`spots_remaining` is not decremented** on booking (no UPDATE policy) — known gap.
