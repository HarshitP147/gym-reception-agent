# FitAgent — AI Receptionist Chat

A floating chat widget that answers gym questions and books classes in a warm
front-desk-receptionist persona, backed by live Supabase data. Separate from the
read-only `/api/gym-data` route — this is the second consumer of the data layer.

## Flow

```
ChatWidget.tsx ──POST /api/chat──▶ route.ts ──▶ DeepSeek (OpenAI-compatible)
 (client, stream)  {messages,sessionId}            │  tool-use loop
                                                    ▼
                                          chat-tools.ts ──▶ src/lib/supabase.ts ──▶ Postgres
```

- **Provider:** DeepSeek v4 Flash via the OpenAI-compatible API (uses the `openai`
  Node SDK, `baseURL=https://api.deepseek.com`). Chosen over Claude for cost.
- **Key:** server-side `DEEPSEEK_API_KEY` (no `NEXT_PUBLIC_`). Missing key ⇒
  `/api/chat` returns 500 `"Chat is not configured…"`. Optional overrides
  `DEEPSEEK_MODEL` (default `deepseek-v4-flash`), `DEEPSEEK_BASE_URL`.

## Files

| File | Role |
|---|---|
| `src/app/api/chat/route.ts` | `POST` streaming handler + manual tool-use loop (`force-dynamic`) |
| `src/lib/chat-tools.ts` | 4 tool schemas (OpenAI function format) + `executeTool()` |
| `src/lib/gym-data.ts` | shared `getGymData()` — reused by `/api/chat` **and** `/api/gym-data` |
| `src/components/ChatWidget.tsx` | client bubble: grow-from-corner panel, streamed reply, `RichText` inline markdown |

## Route (`/api/chat`)

- Body: `{ messages: {role,content}[], sessionId: string }`. Rejects (400) if no
  user message; 500 if key missing or gym data fails to load.
- **System prompt** = receptionist persona/rules **+ PUBLIC gym data only**
  (`gym_info`, `coaches`, `classes`, `membership_plans`). `members`/`bookings`
  rows are **deliberately excluded** (PII) — reached only via tools, one record at
  a time. This is how "never expose raw DB IDs / technical details" is enforced.
- Persona rules emphasize: warm + concise, **decisive** (recommend ONE option +
  one-sentence reason, not a menu, unless asked for all), 1–3 sentences, no
  bullet dumps. Tweak these in `buildSystemPrompt()` if replies get verbose.
- Streams plain text (`text/plain`, `no-cache`). Tool calls arrive split across
  deltas and are accumulated by `index`; loop capped at `MAX_TOOL_ROUNDS = 6`.

## Tools (`chat-tools.ts`)

| Tool | Input | Returns (never raw ids) |
|---|---|---|
| `get_class_availability` | `{ query }` | matching class name/category/spots/schedule |
| `get_timetable` | – | all classes (name/category/days/time/duration/difficulty) |
| `get_member_info` | `{ name?, email? }` | name / plan name / join_date / status |
| `create_booking` | `{ name, email, class_name, date? }` | confirmation (no ids) |

`executeTool()` never throws — returns a message string on miss/error so the model
can respond gracefully. Booking resolves member (email→name) + class by name, then
inserts `{ member_id, class_id, status:'confirmed', booking_date, notes }`.

## Booking writes need RLS

Default RLS is read-only. Booking inserts require migration
`0002_bookings_insert_policy.sql` (anon INSERT `with check (true)`). Without it,
`create_booking` fails silently and returns an apology. Insert is public for the
demo — revisit with a tighter policy / service-role path later.
`spots_remaining` is **not** decremented (no UPDATE policy; out of scope).

## Widget (`ChatWidget.tsx`)

`"use client"`. Two-flag (`render`/`shown`) grow-from-corner open/close (250ms).
Seeds a hardcoded greeting on first open. `send()` POSTs history, reads
`res.body.getReader()`, appends each chunk to the last assistant message (live
typing). `RichText` renders inline `**bold**`/`*italic*` and is stream-tolerant
(an unclosed `**` stays plain text until its closer arrives); newlines preserved
by `whitespace-pre-wrap`. React Compiler: no `ref.current` / `crypto`/`Date.now`
during render — `sessionId` is generated lazily inside `send()`.
