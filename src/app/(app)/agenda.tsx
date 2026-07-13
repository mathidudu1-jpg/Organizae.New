import {
  CalendarDays,
  Check,
  Clock,
  Coffee,
  Flag,
  ListChecks,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chip } from '@/components/ui';
import {
  useCreateEvent,
  useDeleteEvent,
  useUpcomingEvents,
} from '@/features/personal/hooks/useEvents';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useToggleTask,
} from '@/features/personal/hooks/useTasks';
import { todayISO } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { Task, TaskPriority } from '@/types/database';

type Tab = 'tasks' | 'events';

// ---------- datas ----------

function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function weekdayLetter(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
    .slice(0, 3);
}

function dayLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Hoje';
  if (iso === addDaysISO(today, 1)) return 'Amanhã';
  return toBRShort(iso);
}

// ---------- prioridades ----------

const PRIORITY: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Baixa', color: '#94A3B8' },
  medium: { label: 'Média', color: '#E6A200' },
  high: { label: 'Alta', color: '#E5484D' },
};

// ---------- tarefas ----------

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const done = task.is_completed;
  const overdue = !done && task.due_date != null && task.due_date < todayISO();
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Pressable
        onPress={onToggle}
        className={`w-6 h-6 rounded-full items-center justify-center ${
          done ? 'bg-primary' : 'border-2 border-border active:bg-accent'
        }`}
        hitSlop={6}
        testID={`task-toggle-${task.id}`}
      >
        {done && <Check size={13} color="#FFFFFF" />}
      </Pressable>
      {/* Bandeira de prioridade */}
      {!done && (
        <Flag size={12} color={PRIORITY[task.priority].color} fill={PRIORITY[task.priority].color} />
      )}
      <View className="flex-1 min-w-0">
        <Text
          className={`text-sm ${done ? 'text-muted-foreground line-through' : 'font-medium text-foreground'}`}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        {task.due_date && !done && (
          <Text className={`text-[11px] mt-0.5 ${overdue ? 'text-danger' : 'text-muted-foreground'}`}>
            {overdue ? `Atrasada · ${toBRShort(task.due_date)}` : dayLabel(task.due_date)}
          </Text>
        )}
      </View>
      <Pressable onPress={onDelete} hitSlop={6} className="p-1.5 rounded-full active:bg-muted">
        <Trash2 size={14} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

function TaskGroup({ title, tone, tasks, toggle, remove }: {
  title: string;
  tone?: 'danger';
  tasks: Task[];
  toggle: (t: Task) => void;
  remove: (id: string) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <View className="mt-4">
      <View className="flex-row items-center gap-2 mb-2 px-1">
        <Text
          className={`text-xs font-semibold uppercase tracking-wider ${
            tone === 'danger' ? 'text-danger' : 'text-muted-foreground'
          }`}
        >
          {title}
        </Text>
        <View className={`px-1.5 rounded-full ${tone === 'danger' ? 'bg-danger/10' : 'bg-muted'}`}>
          <Text
            className={`text-[10px] font-bold ${tone === 'danger' ? 'text-danger' : 'text-muted-foreground'}`}
          >
            {tasks.length}
          </Text>
        </View>
      </View>
      <Card className="overflow-hidden">
        {tasks.map((t, i) => (
          <View key={t.id} className={i > 0 ? 'border-t border-border' : ''}>
            <TaskRow task={t} onToggle={() => toggle(t)} onDelete={() => remove(t.id)} />
          </View>
        ))}
      </Card>
    </View>
  );
}

function TasksSection() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState('');
  const [due, setDue] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const add = async () => {
    if (title.trim().length < 1) return;
    await createTask.mutateAsync({ title: title.trim(), due_date: due, priority });
    setTitle('');
    setDue(null);
    setPriority('medium');
  };

  const today = todayISO();
  const byPriority = (a: Task, b: Task) => {
    const rank: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return rank[a.priority] - rank[b.priority];
  };

  const pending = (tasks ?? []).filter((t) => !t.is_completed);
  const groups = {
    overdue: pending.filter((t) => t.due_date != null && t.due_date < today).sort(byPriority),
    today: pending.filter((t) => t.due_date === today).sort(byPriority),
    upcoming: pending.filter((t) => t.due_date != null && t.due_date > today).sort(byPriority),
    someday: pending.filter((t) => t.due_date == null).sort(byPriority),
  };
  const done = (tasks ?? []).filter((t) => t.is_completed).slice(0, 5);

  const toggle = (t: Task) => toggleTask.mutate({ id: t.id, done: !t.is_completed });
  const remove = (id: string) => deleteTask.mutate(id);

  return (
    <View>
      {/* Criar tarefa */}
      <Card className="p-3">
        <View className="flex-row gap-2">
          <View className="flex-1 h-11 rounded-xl bg-background border border-border px-3 justify-center">
            <TextInput
              className="text-foreground text-sm"
              placeholder="Nova tarefa…"
              placeholderTextColor={colors.placeholder}
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={add}
              testID="task-title"
            />
          </View>
          <Pressable
            onPress={add}
            disabled={createTask.isPending}
            className="w-11 h-11 rounded-xl bg-primary items-center justify-center active:opacity-90"
            testID="task-add"
          >
            {createTask.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Plus color="#FFFFFF" size={18} />
            )}
          </Pressable>
        </View>
        <View className="flex-row flex-wrap gap-2 mt-2">
          <Chip label="Sem prazo" selected={due === null} onPress={() => setDue(null)} />
          <Chip label="Hoje" selected={due === today} onPress={() => setDue(today)} />
          <Chip
            label="Amanhã"
            selected={due === addDaysISO(today, 1)}
            onPress={() => setDue(addDaysISO(today, 1))}
          />
        </View>
        {/* Prioridade */}
        <View className="flex-row gap-2 mt-2">
          {(Object.keys(PRIORITY) as TaskPriority[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              className={`flex-row items-center gap-1.5 px-3 h-9 rounded-full border ${
                priority === p ? 'bg-accent border-primary' : 'bg-surface border-border'
              }`}
              testID={`prio-${p}`}
            >
              <Flag size={11} color={PRIORITY[p].color} fill={PRIORITY[p].color} />
              <Text
                className={`text-xs font-medium ${priority === p ? 'text-primary' : 'text-foreground'}`}
              >
                {PRIORITY[p].label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {isLoading ? (
        <View className="py-14 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : pending.length === 0 && done.length === 0 ? (
        <Card className="p-8 items-center mt-4">
          <ListChecks size={26} color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground mt-2 text-center">
            Nenhuma tarefa ainda. Adicione a primeira acima.
          </Text>
        </Card>
      ) : (
        <>
          <TaskGroup title="Atrasadas" tone="danger" tasks={groups.overdue} toggle={toggle} remove={remove} />
          <TaskGroup title="Hoje" tasks={groups.today} toggle={toggle} remove={remove} />
          <TaskGroup title="Próximas" tasks={groups.upcoming} toggle={toggle} remove={remove} />
          <TaskGroup title="Sem prazo" tasks={groups.someday} toggle={toggle} remove={remove} />
          {done.length > 0 && (
            <View className="mt-4">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Concluídas
              </Text>
              <Card className="overflow-hidden">
                {done.map((t, i) => (
                  <View key={t.id} className={i > 0 ? 'border-t border-border' : ''}>
                    <TaskRow task={t} onToggle={() => toggle(t)} onDelete={() => remove(t.id)} />
                  </View>
                ))}
              </Card>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ---------- compromissos ----------

function EventsSection() {
  const { data: events, isLoading } = useUpcomingEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const today = todayISO();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [dateBR, setDateBR] = useState(`${toBRShort(today)}/${today.slice(0, 4)}`);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Faixa de 7 dias (hoje → +6) com marcador nos dias com eventos
  const week = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i));
    const withEvents = new Set((events ?? []).map((e) => e.date));
    return days.map((d) => ({ date: d, hasEvents: withEvents.has(d) }));
  }, [events, today]);

  const add = async () => {
    setError(null);
    if (title.trim().length < 1) return;
    const m = dateBR.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) {
      setError('Data inválida (DD/MM/AAAA).');
      return;
    }
    if (time.trim() !== '' && !/^\d{2}:\d{2}$/.test(time.trim())) {
      setError('Hora inválida (HH:MM).');
      return;
    }
    await createEvent.mutateAsync({
      title: title.trim(),
      date: `${m[3]}-${m[2]}-${m[1]}`,
      time: time.trim() || null,
      location: location.trim() || null,
    });
    setTitle('');
    setTime('');
    setLocation('');
  };

  const visible = (events ?? []).filter((e) => !selectedDay || e.date === selectedDay);

  const grouped = useMemo(() => {
    const map = new Map<string, NonNullable<typeof events>>();
    for (const e of visible) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return [...map.entries()];
  }, [visible]);

  return (
    <View>
      {/* Faixa da semana */}
      <View className="flex-row gap-1.5 mb-4">
        {week.map((d) => {
          const selected = selectedDay === d.date;
          const isToday = d.date === today;
          return (
            <Pressable
              key={d.date}
              onPress={() => setSelectedDay(selected ? null : d.date)}
              className={`flex-1 items-center py-2.5 rounded-2xl border ${
                selected
                  ? 'bg-primary border-primary'
                  : isToday
                    ? 'bg-accent border-primary/40'
                    : 'bg-surface border-border'
              }`}
              testID={`day-${d.date}`}
            >
              <Text
                className={`text-[10px] uppercase font-semibold ${
                  selected ? 'text-white' : 'text-muted-foreground'
                }`}
              >
                {weekdayLetter(d.date)}
              </Text>
              <Text
                className={`text-sm font-bold mt-0.5 ${selected ? 'text-white' : 'text-foreground'}`}
              >
                {d.date.slice(-2)}
              </Text>
              <View
                className="w-1 h-1 rounded-full mt-1"
                style={{
                  backgroundColor: d.hasEvents
                    ? selected
                      ? '#FFFFFF'
                      : colors.primary
                    : 'transparent',
                }}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Criar compromisso */}
      <Card className="p-3">
        <View className="h-11 rounded-xl bg-background border border-border px-3 justify-center">
          <TextInput
            className="text-foreground text-sm"
            placeholder="Novo compromisso…"
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={setTitle}
            testID="event-title"
          />
        </View>
        <View className="flex-row gap-2 mt-2">
          <View className="flex-1 h-10 rounded-xl bg-background border border-border px-3 justify-center">
            <TextInput
              className="text-foreground text-sm text-center"
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.placeholder}
              value={dateBR}
              onChangeText={setDateBR}
              testID="event-date"
            />
          </View>
          <View className="w-24 h-10 rounded-xl bg-background border border-border px-3 justify-center">
            <TextInput
              className="text-foreground text-sm text-center"
              placeholder="HH:MM"
              placeholderTextColor={colors.placeholder}
              value={time}
              onChangeText={setTime}
              testID="event-time"
            />
          </View>
        </View>
        <View className="flex-row gap-2 mt-2">
          <View className="flex-1 h-10 rounded-xl bg-background border border-border px-3 justify-center">
            <TextInput
              className="text-foreground text-sm"
              placeholder="Local (opcional)"
              placeholderTextColor={colors.placeholder}
              value={location}
              onChangeText={setLocation}
              testID="event-location"
            />
          </View>
          <Pressable
            onPress={add}
            disabled={createEvent.isPending}
            className="w-10 h-10 rounded-xl bg-primary items-center justify-center active:opacity-90"
            testID="event-add"
          >
            {createEvent.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Plus color="#FFFFFF" size={17} />
            )}
          </Pressable>
        </View>
        {error ? <Text className="text-danger text-xs mt-2">{error}</Text> : null}
      </Card>

      {/* Lista */}
      {isLoading ? (
        <View className="py-14 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : grouped.length === 0 ? (
        <Card className="p-8 items-center mt-4">
          <Coffee size={26} color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground mt-2 text-center">
            {selectedDay ? `Nada em ${dayLabel(selectedDay)}.` : 'Agenda livre!'}
          </Text>
        </Card>
      ) : (
        grouped.map(([date, list]) => (
          <View key={date} className="mt-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {dayLabel(date)}
            </Text>
            <Card className="overflow-hidden">
              {list.map((e, i) => (
                <View
                  key={e.id}
                  className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <View className="w-11 items-center">
                    <Text className="text-sm font-bold text-primary">
                      {e.time ? e.time.slice(0, 5) : '—'}
                    </Text>
                  </View>
                  <View className="w-px self-stretch bg-border" />
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                      {e.title}
                    </Text>
                    {e.location ? (
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <MapPin size={10} color={colors.mutedForeground} />
                        <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                          {e.location}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => deleteEvent.mutate(e.id)}
                    hitSlop={6}
                    className="p-1.5 rounded-full active:bg-muted"
                  >
                    <Trash2 size={14} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              ))}
            </Card>
          </View>
        ))
      )}
    </View>
  );
}

// ---------- tela ----------

export default function Agenda() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('tasks');
  const { data: tasks } = useTasks();
  const { data: events } = useUpcomingEvents();

  const today = todayISO();
  const pendingCount = (tasks ?? []).filter((t) => !t.is_completed).length;
  const todayCount =
    (events ?? []).filter((e) => e.date === today).length +
    (tasks ?? []).filter((t) => !t.is_completed && t.due_date === today).length;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        style={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[720px] mx-auto">
          {/* Header + stats */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Agenda</Text>
            <View className="flex-row gap-2">
              <View className="px-3 py-1.5 rounded-full bg-surface border border-border">
                <Text className="text-[11px] font-semibold text-muted-foreground" testID="stat-pending">
                  {pendingCount} pendente{pendingCount === 1 ? '' : 's'}
                </Text>
              </View>
              <View className="px-3 py-1.5 rounded-full bg-accent">
                <Text className="text-[11px] font-semibold text-primary" testID="stat-today">
                  {todayCount} hoje
                </Text>
              </View>
            </View>
          </View>

          {/* Alternador */}
          <View className="flex-row gap-2 mb-4">
            <Chip label="Tarefas" selected={tab === 'tasks'} onPress={() => setTab('tasks')} testID="tab-tasks" />
            <Chip
              label="Compromissos"
              selected={tab === 'events'}
              onPress={() => setTab('events')}
              testID="tab-events"
            />
          </View>

          {tab === 'tasks' ? <TasksSection /> : <EventsSection />}
        </View>
      </ScrollView>
    </View>
  );
}
