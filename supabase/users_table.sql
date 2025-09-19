-- Supabase users table and RLS policies
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
);

alter table public.users enable row level security;

create policy if not exists "Users can select their own row"
  on public.users for select
  using (auth.uid() = id);

create policy if not exists "Users can insert their own row"
  on public.users for insert
  with check (auth.uid() = id);

create policy if not exists "Users can update their own row"
  on public.users for update
  using (auth.uid() = id);
