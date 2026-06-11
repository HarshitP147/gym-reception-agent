# IronPulse Fitness — Knowledge Base

Entry point for the `docs/` knowledge base. `AGENTS.md` (repo root) is the ~map; this directory holds the deeper sources of truth. Navigate on demand — don't load everything at once.

## Index

| Area | File | Read when |
|---|---|---|
| Site architecture & data flow | [architecture/overview.md](architecture/overview.md) | Understanding how pages + data layer fit together |
| Supabase client & `/api/gym-data` | [architecture/data-layer.md](architecture/data-layer.md) | Touching the client, the API route, or how the agent reads data |
| DB tables, columns, FKs, RLS | [database/schema.md](database/schema.md) | Querying or changing the schema |
| Migration conventions | [database/migrations.md](database/migrations.md) | Writing or running SQL migrations |
| File/code conventions | [conventions/file-conventions.md](conventions/file-conventions.md) | Writing any code in `src/` |
| Next.js 16 gotchas | [conventions/nextjs-16.md](conventions/nextjs-16.md) | Writing routing / rendering / caching code |
| Local setup & verify | [guides/local-setup.md](guides/local-setup.md) | Running the app, env vars, smoke test |
| Docs, skills & MCP routing | [guides/docs-and-mcp.md](guides/docs-and-mcp.md) | Needing library docs / best practices |
| Supabase integration history | [exec-plans/supabase-integration.md](exec-plans/supabase-integration.md) | What was built, decisions, lessons learned |

## Maintenance

Keep files small and single-topic. When code changes, update the matching doc in the same change. New decisions → append to the relevant `exec-plans/` file. Stale rules rot fast — delete what's no longer true rather than letting it mislead.
