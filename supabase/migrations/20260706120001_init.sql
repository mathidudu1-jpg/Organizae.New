-- ============================================================
-- 0001 · Base: extensões, helpers, enums, profiles
-- ============================================================

create extension if not exists pgcrypto;

-- Helper: mantém updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Enums (conjuntos estáveis)
create type public.account_type as enum ('checking','savings','wallet','cash','investment','other');
create type public.entry_type   as enum ('income','expense','transfer');
create type public.category_kind as enum ('income','expense');
create type public.txn_status   as enum ('pending','cleared');
create type public.task_priority as enum ('low','medium','high');

-- ------------------------------------------------------------
-- PROFILES (1:1 com auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  avatar_url text,
  currency   text not null default 'BRL',
  locale     text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
