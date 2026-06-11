# File & Code Conventions

## Imports
Use the `@/` alias (`@/lib/supabase`, `@/components/Nav`). Defined in `tsconfig.json` as `@/* → ./src/*`. Never use deep relative paths like `../../lib`.

## Route handlers
- Path: `src/app/api/<name>/route.ts`.
- Export `async function GET()` (and other verbs as needed). Return `Response.json(...)` (Web API).
- Add `export const dynamic = "force-dynamic"` for anything reading live DB data, so it isn't statically cached.
- See [nextjs-16.md](nextjs-16.md) before relying on routing/caching behavior from memory.

## Components
- PascalCase files in `src/components/`, default-exported function components.
- Section components are presentational; their copy is currently hardcoded (not from the DB).

## Styling
- Tailwind CSS v4 utilities + theme tokens from `src/app/globals.css` (`--accent` lime `#c8f135`, dark background). Use the CSS-variable tokens; don't hardcode hex values.

## SQL
- See [../database/migrations.md](../database/migrations.md).

## Env
- `.env*` is gitignored except `.env.example` (committed template). Real values go in `.env.local`. Env is read at process boot — restart `next dev` after changing it.

## Package manager
- **npm only** (`package-lock.json`). Do not introduce pnpm/yarn/bun.
