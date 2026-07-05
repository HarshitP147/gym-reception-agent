-- Link Supabase Auth users to the existing `members` table.
--
-- On signup, a trigger upserts a `members` row by email (claiming an
-- existing seed row if the email matches, or creating a fresh 'trial' one)
-- and stamps it with the new auth.users id. No RLS policy changes — the
-- existing "Public read members" policy (anon, authenticated) already
-- covers a signed-in user reading their own row; changing it risks
-- breaking /api/gym-data + FitAgent, which read all members. Idempotent
-- (re-runnable).

alter table members add column if not exists user_id uuid unique references auth.users(id) on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (name, email, user_id, status, join_date)
  values (
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    new.id,
    'trial',
    current_date
  )
  on conflict (email) do update
    set user_id = excluded.user_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- SECURITY DEFINER functions in `public` are executable by PUBLIC by default.
-- Trigger firing doesn't need these grants (it runs as part of the INSERT on
-- auth.users, not a direct call), so lock it down per the Supabase security
-- checklist.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
