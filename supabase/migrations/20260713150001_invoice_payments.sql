-- ============================================================
-- 0006 · Pagamentos de fatura de cartão
-- Pagamento NÃO é um lançamento (a compra já contou como despesa
-- na data da compra) — é um registro que quita a fatura.
-- Status da fatura é DERIVADO: aberta (ciclo corrente), fechada
-- (ciclo encerrado, falta pagar), vencida, paga.
-- ============================================================

create table public.invoice_payments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  card_id    uuid not null references public.cards(id) on delete cascade,
  -- Fatura quitada: mês do VENCIMENTO (YYYY-MM-01), mesma convenção do motor.
  month_ref  date not null,
  amount     numeric(14,2) not null check (amount > 0),
  paid_at    date not null,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_invoice_payments_user on public.invoice_payments(user_id);
create index idx_invoice_payments_card on public.invoice_payments(card_id, month_ref);

create trigger invoice_payments_set_updated_at
  before update on public.invoice_payments
  for each row execute function public.set_updated_at();

alter table public.invoice_payments enable row level security;

create policy "invoice_payments_own" on public.invoice_payments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
