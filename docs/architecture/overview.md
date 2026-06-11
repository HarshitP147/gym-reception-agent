# Architecture Overview

IronPulse Fitness is a marketing site for a Dublin gym, plus a Supabase data layer (public reads + booking inserts) feeding the FitAgent AI chat receptionist.

## Two independent surfaces

1. **Static marketing site** — `src/app/page.tsx` composes section components (`Nav`, `Hero`, `Problem`, `HowItWorks`, `Features`, `Coaches`, `Metrics`, `Pricing`, `CtaFooter`, `ChatWidget`). All display copy (classes, plans, coaches, gym info) is **hardcoded inside the components**. The home page is statically prerendered.

2. **Data layer** — Supabase Postgres is the source of truth, read through a shared
   `src/lib/gym-data.ts` (`getGymData()`) and exposed to two consumers:

```
external caller ──HTTP GET──▶ /api/gym-data ─┐
                                             ├─▶ getGymData() ──▶ src/lib/supabase.ts ──▶ Postgres
ChatWidget ──POST──▶ /api/chat ──▶ DeepSeek ─┘     (anon client, RLS public read)
                       (tool-use loop, also writes bookings)
```

The **FitAgent chat** (`/api/chat` + `ChatWidget`) is the live AI agent: a streaming
DeepSeek tool-use loop that reads gym data and can insert bookings. See
[chat-agent.md](chat-agent.md).

## Important: two data sources, not synced

The frontend copy and the database are **separate**. Editing a component does not change the DB, and editing the DB does not change the rendered page. Wiring the frontend to read from Supabase is a deliberate future task — do not assume it's done. See [data-layer.md](data-layer.md).

## Request lifecycle for `/api/gym-data`

- Route is `export const dynamic = "force-dynamic"` → runs at request time, never cached.
- Queries all 6 tables in parallel (`Promise.all`), returns one JSON object: `{ gym_info, coaches, classes, membership_plans, members, bookings }`.
- Any per-query error → HTTP 500 with `{ error, details }`.

## Deployment

Hosted on Vercel (Next.js App Router, Turbopack) at `https://gym-site-agent.vercel.app`. Env vars set in Vercel project settings mirror `.env.local` (`.env.local` itself is gitignored and never uploaded). `NEXT_PUBLIC_*` vars are baked at build time — redeploy after changing them. Live + verified: `GET /api/gym-data` returns 200 + full JSON.
