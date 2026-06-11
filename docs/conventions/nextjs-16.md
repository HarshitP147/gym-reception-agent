# Next.js 16 — Read Before Coding

This project runs **Next.js 16.2.7** (App Router, Turbopack). It has breaking changes vs older/commonly-memorized Next.js. **Do not trust training-data APIs.**

## Source of truth
The version ships its own docs at `node_modules/next/dist/docs/`. Read the relevant guide there before writing routing, rendering, or caching code. This is also stated in the root `AGENTS.md` (`nextjs-agent-rules` block).

## Confirmed conventions in this version
- Route handler file: `src/app/api/<name>/route.ts`; export `async function GET(request: Request)`.
- Return JSON with `Response.json(...)` — `NextResponse.json(...)` also works.
- Route handlers are **not cached by default** (dynamic). Use `export const dynamic = "force-static"` to cache, or `"force-dynamic"` to force runtime.
- **Dynamic route params are async** — `const { id } = await ctx.params`.
- Cache Components is an optional feature (not enabled here; `next.config.ts` is minimal). The `use cache` directive only works in helper functions, not inline in a handler body.

## Gotchas
- `next dev` falls back to port **3001** (or next free) if 3000 is busy — check the log for the real port before curling/verifying.
