<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# IronPulse Fitness — Agent Map

Marketing site for a Dublin gym + a Supabase data layer feeding the **FitAgent** AI chat receptionist (DeepSeek tool-use). Next.js 16 App Router, deployed on Vercel.

This file is a **map**, kept short on purpose. Detailed, single-topic docs live in [`docs/`](docs/README.md) — navigate there on demand instead of expecting everything here.

## Stack (at a glance)
Next.js **16.2.7** (App Router, Turbopack) · React 19 · TypeScript 5 (strict) · Tailwind CSS v4 · Supabase (`@supabase/supabase-js` v2) · DeepSeek v4 Flash via `openai` SDK (FitAgent chat) · **npm** · Vercel.

## Where things are
```
src/app/            # routes — page.tsx (static home), api/gym-data + api/chat (dynamic)
src/components/      # presentational sections + ChatWidget.tsx (FitAgent bubble)
src/lib/supabase.ts  # shared Supabase client
src/lib/gym-data.ts  # getGymData() — shared by /api/gym-data and /api/chat
src/lib/chat-tools.ts# FitAgent tool schemas + executeTool()
supabase/migrations/ # SQL (schema + seed + RLS), idempotent
docs/                # knowledge base — start at docs/README.md
public/images/       # assets (only 4 coach portraits exist)
```

## Knowledge base — read the right doc before acting

| You're about to… | Read |
|---|---|
| Understand the system / data flow | [docs/architecture/overview.md](docs/architecture/overview.md) |
| Touch the client or `/api/gym-data` | [docs/architecture/data-layer.md](docs/architecture/data-layer.md) |
| Touch FitAgent chat / `/api/chat` / widget | [docs/architecture/chat-agent.md](docs/architecture/chat-agent.md) |
| Query or change the DB | [docs/database/schema.md](docs/database/schema.md) |
| Write/run a migration | [docs/database/migrations.md](docs/database/migrations.md) |
| Write any `src/` code | [docs/conventions/file-conventions.md](docs/conventions/file-conventions.md) |
| Write routing/rendering/caching code | [docs/conventions/nextjs-16.md](docs/conventions/nextjs-16.md) |
| Run the app / verify | [docs/guides/local-setup.md](docs/guides/local-setup.md) |
| Need library docs / best practices | [docs/guides/docs-and-mcp.md](docs/guides/docs-and-mcp.md) |
| See history & lessons | [docs/exec-plans/supabase-integration.md](docs/exec-plans/supabase-integration.md) |

## Top rules (don't get these wrong)
- **Next 16 ≠ your training data.** Read `node_modules/next/dist/docs/` for routing/caching/params (params are async).
- **Library code:** consult the matching agent skill first (Supabase → `supabase:supabase`, Next → `vercel:nextjs`, …), else **Context7 MCP**. Full table in [docs/guides/docs-and-mcp.md](docs/guides/docs-and-mcp.md).
- **Env key names:** client reads `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `…_ANON_KEY`); chat reads server-side `DEEPSEEK_API_KEY` (no `NEXT_PUBLIC_`). Wrong/missing ⇒ `/api/gym-data` returns nothing / `/api/chat` 500s. Restart dev after `.env.local` edits.
- **RLS:** reads are public; the only write is booking INSERT via migration `0002` (anon `with check (true)`). Don't disable RLS to force other writes.
- **Two data sources:** frontend copy is hardcoded; DB is separate and not yet wired to the UI (FitAgent reads the DB; the marketing sections don't).
- **npm only.** Don't break the static home page. `next dev` may fall back to port 3001.

## Commands
`npm run dev` · `npm run build` · `npm run start` · `npm run lint` · verify data: `curl -s localhost:3000/api/gym-data | jq` · verify chat: `curl -sN -X POST localhost:3000/api/chat -H 'content-type: application/json' -d '{"sessionId":"t","messages":[{"role":"user","content":"opening hours?"}]}'`
