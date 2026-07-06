-- ============================================================
-- 0004 · Onboarding automático no signup
-- Cria o profile e um conjunto de categorias-padrão (PT-BR).
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );

  insert into public.categories (user_id, name, kind, icon, color, sort_order) values
    (new.id, 'Alimentação', 'expense', 'utensils',        '#f97316', 1),
    (new.id, 'Transporte',  'expense', 'car',             '#3b82f6', 2),
    (new.id, 'Moradia',     'expense', 'home',            '#8b5cf6', 3),
    (new.id, 'Compras',     'expense', 'shopping-bag',    '#ec4899', 4),
    (new.id, 'Saúde',       'expense', 'heart',           '#ef4444', 5),
    (new.id, 'Lazer',       'expense', 'gamepad-2',       '#14b8a6', 6),
    (new.id, 'Contas',      'expense', 'receipt',         '#6b7280', 7),
    (new.id, 'Salário',     'income',  'trending-up',     '#12805c', 8),
    (new.id, 'Freelance',   'income',  'briefcase',       '#0ea5e9', 9),
    (new.id, 'Outros',      'expense', 'more-horizontal', '#94a3b8', 10);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
