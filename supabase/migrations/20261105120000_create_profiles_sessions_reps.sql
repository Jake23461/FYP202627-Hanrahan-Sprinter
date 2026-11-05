-- Iteration 3: profiles, sessions and reps, with row level security.
-- See docs/data-model.md for why each column exists.
-- Grants say which tables a role can use at all. RLS then says which rows.
-- Each table revokes first, because the project's default privileges can give
-- anon and authenticated full access to anything new.

-- The test table from the Supabase setup (#9) is no longer needed.
drop table if exists public.test_messages;

-- Profiles: one row per user, created by a trigger on sign up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null,
  events text[] not null default '{}',
  age_group text check (age_group in ('U16', 'U18', 'U20', 'Senior', 'Masters')),
  club text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;

create policy "Signed in users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Make a profile when someone signs up. Display name comes from sign up metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'New athlete'));
  return new;
end;
$$;

-- Only the trigger should run this, not someone calling it through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sessions: one training session on one day.
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null default current_date,
  focus text check (focus in ('acceleration', 'max_velocity', 'speed_endurance', 'race', 'other')),
  surface text check (surface in ('track', 'indoor', 'grass', 'turf', 'road')),
  rpe smallint check (rpe between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id) -- lets reps check they belong to the same user
);

create index sessions_user_date_idx on public.sessions (user_id, session_date desc);

alter table public.sessions enable row level security;

revoke all on public.sessions from anon, authenticated;
grant select, insert, update, delete on public.sessions to authenticated;

create policy "Users can read their own sessions"
  on public.sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own sessions"
  on public.sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own sessions"
  on public.sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own sessions"
  on public.sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- Reps: one timed run in a session.
create table public.reps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  position smallint not null check (position >= 1),
  distance_m smallint not null check (distance_m between 10 and 600),
  time_s numeric(6, 2) not null check (time_s > 0),
  timing_method text not null default 'hand' check (timing_method in ('hand', 'electronic')),
  start_type text check (start_type in ('blocks', 'crouch', 'standing', 'flying', 'rolling')),
  max_effort boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  -- The rep's user must be the session's owner.
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade
);

create index reps_session_idx on public.reps (session_id, position);
create index reps_pb_idx on public.reps (user_id, distance_m, timing_method, time_s) where max_effort;

alter table public.reps enable row level security;

revoke all on public.reps from anon, authenticated;
grant select, insert, update, delete on public.reps to authenticated;

create policy "Users can read their own reps"
  on public.reps for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own reps"
  on public.reps for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own reps"
  on public.reps for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own reps"
  on public.reps for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Personal bests: fastest max effort rep per distance and timing method.
-- Only blocks, crouch and standing starts count: flying and rolling starts are much faster.
-- security_invoker makes the view follow the RLS on reps.
create view public.personal_bests
with (security_invoker = true)
as
select distinct on (r.user_id, r.distance_m, r.timing_method)
  r.user_id,
  r.distance_m,
  r.timing_method,
  r.time_s as best_time_s,
  r.id as rep_id,
  s.session_date
from public.reps r
join public.sessions s on s.id = r.session_id
where r.max_effort
  and r.start_type in ('blocks', 'crouch', 'standing')
order by r.user_id, r.distance_m, r.timing_method, r.time_s asc, s.session_date asc;

revoke all on public.personal_bests from anon, authenticated;
grant select on public.personal_bests to authenticated;
