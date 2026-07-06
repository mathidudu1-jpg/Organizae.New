-- ============================================================
-- 0003 · Vida pessoal (tarefas + agenda)
-- ============================================================

-- ------------------------------------------------------------
-- TASKS (tarefas)
-- ------------------------------------------------------------
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  notes        text,
  due_date     date,
  due_time     time,
  priority     public.task_priority not null default 'medium',
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EVENTS (compromissos / agenda)
-- ------------------------------------------------------------
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  notes        text,
  date         date not null,
  time         time,
  end_time     time,
  location     text,
  color        text,
  is_completed boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Índices
create index idx_tasks_user  on public.tasks(user_id);
create index idx_tasks_due   on public.tasks(user_id, due_date);
create index idx_events_user on public.events(user_id);
create index idx_events_date on public.events(user_id, date);

-- updated_at
create trigger tasks_set_updated_at  before update on public.tasks  for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();

-- RLS
alter table public.tasks  enable row level security;
alter table public.events enable row level security;

create policy "tasks_own"  on public.tasks  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "events_own" on public.events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
