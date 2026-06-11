-- Allow the public (anon) key to INSERT bookings so the FitAgent chat receptionist
-- can create bookings on a member's behalf. RLS stays SELECT-only for every other
-- table; only bookings gains a public INSERT. Idempotent (re-runnable).
--
-- NOTE: with `with check (true)` anyone holding the publishable key can insert a
-- booking row. Acceptable for this demo; tighten (or move writes to a service-role
-- path) before treating bookings as trusted data.

drop policy if exists "Public insert bookings" on bookings;
create policy "Public insert bookings" on bookings
  for insert to anon, authenticated with check (true);
