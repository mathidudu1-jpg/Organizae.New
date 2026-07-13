-- ============================================================
-- 0008 · Investimentos (simulados)
-- O valor atual NUNCA é armazenado — é derivado no cliente pelo
-- simulador (juros compostos sobre principal + taxa + data).
-- ============================================================

create type public.investment_type as enum
  ('cdb', 'tesouro', 'poupanca', 'fundo', 'acoes', 'cripto', 'outro');

create type public.rate_kind as enum ('cdi_pct', 'fixed_annual');

create table public.investments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  name       text not null,
  type       public.investment_type not null default 'cdb',
  principal  numeric(14,2) not null check (principal > 0),
  rate_kind  public.rate_kind not null default 'cdi_pct',
  -- cdi_pct → % do CDI (ex: 102). fixed_annual → % ao ano (ex: 12.5).
  rate       numeric(8,2) not null check (rate > 0),
  start_date date not null,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_investments_user on public.investments(user_id);
create index idx_investments_account on public.investments(account_id);

create trigger investments_set_updated_at
  before update on public.investments
  for each row execute function public.set_updated_at();

alter table public.investments enable row level security;

create policy "investments_own" on public.investments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
