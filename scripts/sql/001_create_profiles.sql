-- Create a profiles table for roles and display names, with RLS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'farmer' check (role in ('farmer','developer','verifier','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS: users can select their own profile; developers/verifiers/admins can read all (simple demo policy)
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role in ('developer','verifier','admin')));

-- Users can insert their profile row (first time)
drop policy if exists "Profiles insert by self" on public.profiles;
create policy "Profiles insert by self"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile unless admin
drop policy if exists "Profiles update by owner or admin" on public.profiles;
create policy "Profiles update by owner or admin"
  on public.profiles for update
  using (auth.uid() = id or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role = 'admin'))
  with check (auth.uid() = id or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role = 'admin'));
