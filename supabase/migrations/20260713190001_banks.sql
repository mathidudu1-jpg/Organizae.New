-- ============================================================
-- 0007 · Bancos: cartão crédito/débito + saldo de conta DERIVADO
--
-- Semântica de saldo (fonte única, nunca armazenado):
--   saldo = initial_balance
--         + entradas na conta           (income com account_id, sem cartão)
--         - saídas diretas da conta     (expense com account_id, sem cartão)
--         - compras no DÉBITO           (expense em cartão kind=debit → conta do cartão)
--         - pagamentos de fatura        (invoice_payments com account_id)
--   Compras no CRÉDITO não tocam a conta até a fatura ser paga.
-- ============================================================

create type public.card_kind as enum ('credit', 'debit');

alter table public.cards
  add column kind public.card_kind not null default 'credit';

alter table public.invoice_payments
  add column account_id uuid references public.accounts(id) on delete set null;

create index idx_invoice_payments_account on public.invoice_payments(account_id);

-- Saldo por conta (view com RLS do chamador — cada usuário só vê o seu)
create or replace view public.account_balances
with (security_invoker = true) as
select
  a.id as account_id,
  a.user_id,
  (
    a.initial_balance
    + coalesce((
        select sum(case when t.type = 'income' then t.amount else -t.amount end)
        from public.transactions t
        left join public.cards c on c.id = t.card_id
        where t.type in ('income', 'expense')
          and (
            (t.account_id = a.id and t.card_id is null)
            or (c.kind = 'debit' and c.account_id = a.id)
          )
      ), 0)
    - coalesce((
        select sum(p.amount)
        from public.invoice_payments p
        where p.account_id = a.id
      ), 0)
  )::numeric(14, 2) as balance
from public.accounts a;

grant select on public.account_balances to authenticated;
