# Docs, Skills & MCP Routing

Never write library/framework code from memorized APIs. Consult the matching **agent skill** first; if no skill fits, fetch current docs via the **Context7 MCP**.

## Skill → fallback map

| Topic | Skill (use first) | MCP fallback |
|---|---|---|
| Supabase: DB, auth, RLS, client, migrations, CLI | `supabase:supabase` | Supabase MCP (`mcp__plugin_supabase_supabase__*`) |
| Postgres query/schema/perf | `supabase:supabase-postgres-best-practices` | Context7 (`mcp__context7__*`) |
| Next.js App Router (routing, RSC, caching, middleware) | `vercel:nextjs` | Context7 + read `node_modules/next/dist/docs/` |
| Next.js version upgrades / codemods | `vercel:next-upgrade` | Context7 |
| Vercel deploy / CI / env / CLI | `vercel:deployments-cicd`, `vercel:env-vars`, `vercel:vercel-cli` | Vercel MCP (`mcp__plugin_vercel_vercel__*`) |
| AI chat agent / LLM features | `vercel:ai-sdk`, `vercel:ai-gateway` | Context7 |
| Tailwind / shadcn / UI quality | `vercel:shadcn`, `frontend-design` | shadcn MCP / Context7 |
| Any other library / framework / API | — | **Context7 MCP** |

## Context7 recipe
1. `resolve-library-id` with both `libraryName` and `query`.
2. Pick the best / highest-reputation match (prefer version-specific IDs).
3. `query-docs` with that ID and the question.
4. Answer from the fetched docs; cite the version.

## Notes
- A global rule (`~/.claude/rules/context7.md`) already mandates Context7 for library work.
- For Next.js specifically, the bundled `node_modules/next/dist/docs/` is authoritative for this exact version — prefer it over general web knowledge.
