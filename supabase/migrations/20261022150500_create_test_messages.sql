-- Test table for checking the app can read from Supabase.
create table public.test_messages (
  id bigint generated always as identity primary key,
  message text not null,
  created_at timestamptz not null default now()
);

-- Block all access by default, then allow read only.
alter table public.test_messages enable row level security;

create policy "Anyone can read test messages"
  on public.test_messages
  for select
  to anon, authenticated
  using (true);

insert into public.test_messages (message)
values ('Hello from Supabase');
