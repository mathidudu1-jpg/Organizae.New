-- ============================================================
-- 0002 · Núcleo financeiro
-- ============================================================

-- ------------------------------------------------------------
-- ACCOUNTS (contas / carteiras). Saldo é SEMPRE derivado:
-- initial_balance + soma dos lançamentos. Nunca armazenado.
-- ------------------------------------------------------------
create table public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  type            public.account_type not null default 'checking',
  institution     text,
  color           text,
  initial_balance numeric(14,2) not null default 0,
  currency        text not null default 'BRL',
  is_archived     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CARDS (cartões de crédito)
-- ------------------------------------------------------------
create table public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  account_id   uuid references public.accounts(id) on delete set null,
  name         text not null,
  brand        text,
  last4        text,
  credit_limit numeric(14,2),
  closing_day  smallint check (closing_day between 1 and 31),
  due_day      smallint check (due_day between 1 and 31),
  color        text,
  is_archived  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CATEGORIES (com subcategorias via parent_id)
-- ------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  kind       public.category_kind not null,
  icon       text,
  color      text,
  parent_id  uuid references public.categories(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TRANSACTIONS (lançamentos manuais)
--  · date como DATE (sem timezone) → evita bug UTC/BRT
--  · month_ref gerada → convenção única de mês
-- ------------------------------------------------------------
create table public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         public.entry_type not null,
  amount       numeric(14,2) not null check (amount >= 0),
  currency     text not null default 'BRL',
  description  text,
  notes        text,
  date         date not null,
  month_ref    date generated always as (date_trunc('month', date::timestamp)::date) stored,
  account_id          uuid references public.accounts(id) on delete set null,
  card_id             uuid references public.cards(id) on delete set null,
  category_id         uuid references public.categories(id) on delete set null,
  transfer_account_id uuid references public.accounts(id) on delete set null,
  status       public.txn_status not null default 'cleared',
  -- parcelamento
  installment_group uuid,
  installment_no    smallint,
  installment_total smallint,
  -- recorrência (fixos/assinaturas)
  is_recurring boolean not null default false,
  recurrence   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- BUDGETS (orçamento por categoria/mês)
-- ------------------------------------------------------------
create table public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  amount      numeric(14,2) not null,
  month_ref   date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, category_id, month_ref)
);

-- ------------------------------------------------------------
-- GOALS (metas)
-- ------------------------------------------------------------
create table public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  target_amount  numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  due_date       date,
  color          text,
  is_archived    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
create index idx_accounts_user      on public.accounts(user_id);
create index idx_cards_user         on public.cards(user_id);
create index idx_categories_user    on public.categories(user_id);
create index idx_transactions_user  on public.transactions(user_id);
create index idx_transactions_date  on public.transactions(user_id, date);
create index idx_transactions_month on public.transactions(user_id, month_ref);
create index idx_transactions_acct  on public.transactions(account_id);
create index idx_transactions_cat   on public.transactions(category_id);
create index idx_budgets_user       on public.budgets(user_id);
create index idx_goals_user         on public.goals(user_id);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
create trigger accounts_set_updated_at     before update on public.accounts     for each row execute function public.set_updated_at();
create trigger cards_set_updated_at        before update on public.cards        for each row execute function public.set_updated_at();
create trigger categories_set_updated_at   before update on public.categories   for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger budgets_set_updated_at      before update on public.budgets      for each row execute function public.set_updated_at();
create trigger goals_set_updated_at        before update on public.goals        for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS (dono = auth.uid())
-- ------------------------------------------------------------
alter table public.accounts     enable row level security;
alter table public.cards        enable row level security;
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;
alter table public.goals        enable row level security;

create policy "accounts_own"     on public.accounts     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cards_own"        on public.cards        for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "categories_own"   on public.categories   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "transactions_own" on public.transactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "budgets_own"      on public.budgets      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals_own"        on public.goals        for all using (user_id = auth.uid()) with check (user_id = auth.uid());
