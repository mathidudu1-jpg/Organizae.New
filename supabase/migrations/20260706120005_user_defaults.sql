-- ============================================================
-- 0005 · user_id default auth.uid()
-- O cliente não precisa enviar user_id nos inserts; o banco preenche
-- com o usuário autenticado e a RLS (with check) garante a consistência.
-- ============================================================

alter table public.accounts     alter column user_id set default auth.uid();
alter table public.cards        alter column user_id set default auth.uid();
alter table public.categories   alter column user_id set default auth.uid();
alter table public.transactions alter column user_id set default auth.uid();
alter table public.budgets      alter column user_id set default auth.uid();
alter table public.goals        alter column user_id set default auth.uid();
alter table public.tasks        alter column user_id set default auth.uid();
alter table public.events       alter column user_id set default auth.uid();
