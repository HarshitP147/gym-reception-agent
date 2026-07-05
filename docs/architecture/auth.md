# Auth

Supabase Auth (email/password), wired via `@supabase/ssr`. Separate from the anon client in `src/lib/supabase.ts` (used by `/api/gym-data` + `/api/chat` — untouched by this feature).

## Clients — `src/lib/supabase/`

- `client.ts` — `createBrowserClient`, used in Client Components (`Nav`, `login`/`signup` pages, `SignOutButton`).
- `server.ts` — `createServerClient` (async `cookies()` from `next/headers`), used in Server Components and Route Handlers. `setAll` is wrapped in try/catch — Server Components can't write cookies, and that's fine because...
- `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`, see `node_modules/next/dist/docs/.../proxy.md`) refreshes the session cookie on every request via `supabase.auth.getUser()`, and is the one place with write access. It also gates routes: unauthenticated → `/dashboard/*` redirects to `/login`; authenticated → `/login`/`/signup` redirect to `/dashboard`.

## Linking `auth.users` → `members`

Migration `0003_auth_link_members.sql` adds `members.user_id` (FK → `auth.users.id`) and a `SECURITY DEFINER` trigger (`handle_new_user`, on `auth.users` insert) that upserts a `members` row **by email** — claiming an existing seed row if the email matches, or creating a fresh `'trial'` one otherwise. `full_name` comes from `signUp`'s `options.data.full_name`.

No RLS changes — the existing "Public read members" policy (anon + authenticated) already covers a signed-in user reading their own row; changing it risks breaking `/api/gym-data` + FitAgent, which read all members.

## Pages

- `/login`, `/signup` — Client Components, shadcn `Card`/`Input`/`Label`/`Button`/`Alert`. Signup shows a "check your inbox" state when `data.session` is null (email confirmation required by project settings).
- `/api/auth/callback` — exchanges the email-confirmation `code` for a session server-side, redirects to `/dashboard`.
- `/dashboard` — Server Component, protected by `proxy.ts`; fetches the member row + bookings by `user_id`. Two-column layout: member info/bookings on the left, `MemberChatPanel` docked on the right. `<main>` is a fixed `h-screen` flex column (header `shrink-0`, the grid row `flex-1 overflow-hidden`) so the page never grows past one viewport — each column scrolls independently (`overflow-y-auto` + `min-h-0` on the flex/grid children, a required pairing or the column won't actually shrink/scroll).

## Member Concierge chat — `MemberChatPanel` + `/api/member-chat`

A second, separate chat agent from FitAgent — scoped to a signed-in member (knows their membership/bookings, can act on their behalf: rescheduling, booking classes). `src/components/MemberChatPanel.tsx` is the UI (docked `Card`, same send/stream-read pattern as `ChatWidget`) and is **currently wired to a stub**: `/api/member-chat/route.ts` just echoes a "not connected yet" message. Request contract (matches `/api/chat`'s shape so swapping in the real agent needs no UI changes): `POST { messages: {role, content}[], sessionId, member: {id, name, email, status} | null }` → streamed `text/plain` response.

FitAgent (`ChatWidget`) hides itself once a user is signed in (`supabase.auth.getUser()`/`onAuthStateChange` in the widget) — signed-in members get the Concierge panel on `/dashboard` instead.

## Nav

`src/components/Nav.tsx` is a Client Component (not a Server Component reading cookies) specifically so `src/app/page.tsx` can stay statically prerendered — it resolves auth state client-side via `getUser()` + `onAuthStateChange` on mount, rendering a skeleton pill until ready.

**Base UI gotcha:** this project's shadcn install uses Base UI (not Radix — see `components.json`, `--base base-ui`). `DropdownMenuLabel` wraps Base UI's `Menu.GroupLabel`, which throws ("MenuGroupContext is missing") unless wrapped in `<DropdownMenuGroup>` — unlike some Radix-based examples where a label can sit directly in `DropdownMenuContent`. Always wrap label+items in `DropdownMenuGroup` (see `Nav.tsx`'s user menu).
