# Architecture Overview

IronPulse Fitness is a marketing site for a Dublin gym, plus a read-only Supabase data layer that feeds an AI chat agent.

## Two independent surfaces

1. **Static marketing site** — `src/app/page.tsx` composes section components (`Nav`, `Hero`, `Problem`, `HowItWorks`, `Features`, `Coaches`, `Metrics`, `Pricing`, `CtaFooter`, `ChatWidget`). All display copy (classes, plans, coaches, gym info) is **hardcoded inside the components**. The home page is statically prerendered.

2. **Data layer** — Supabase Postgres is the agent's source of truth, exposed through one endpoint:

```
AI agent ──HTTP GET──▶ /api/gym-data ──▶ src/lib/supabase.ts ──▶ Supabase Postgres
                          (route.ts)        (anon client)        (RLS public read)
```

## Important: two data sources, not synced

The frontend copy and the database are **separate**. Editing a component does not change the DB, and editing the DB does not change the rendered page. Wiring the frontend to read from Supabase is a deliberate future task — do not assume it's done. See [data-layer.md](data-layer.md).

## Request lifecycle for `/api/gym-data`

- Route is `export const dynamic = "force-dynamic"` → runs at request time, never cached.
- Queries all 6 tables in parallel (`Promise.all`), returns one JSON object: `{ gym_info, coaches, classes, membership_plans, members, bookings }`.
- Any per-query error → HTTP 500 with `{ error, details }`.

## Deployment

Hosted on Vercel (Next.js App Router, Turbopack). Env vars set in Vercel project settings mirror `.env.local`.
