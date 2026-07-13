import {
  CalendarDays,
  Check,
  Clock,
  Coffee,
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
import { useCreateEvent, useDeleteEvent, useUpcomingEvents } from '@/features/personal/hooks/useEvents';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useToggleTask,
} from '@/features/personal/hooks/useTasks';
import { todayISO } from '@/lib/format';
import { colors } from '@/theme/colors';

type Tab = 'tasks' | 'events';

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function dueLabel(due: string | null): { text: string; danger: boolean } | null {
  if (!due) return null;
  const today = todayISO();
  if (due < today) return { text: `Atrasada · ${toBRShort(due)}`, danger: true };
  if (due === today) return { text: 'Hoje', danger: false };
  if (due === tomorrowISO()) return { text: 'Amanhã', danger: false };
  return { text: toBRShort(due), danger: false };
}

function TasksSection() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState('');
  const [due, setDue] = useState<string | null>(null);

  const add = async () => {
    if (title.trim().length < 1) return;
    await createTask.mutateAsync({ title: title.trim(), due_date: due });
    setTitle('');
    setDue(null);
  };

  const pending = (tasks ?? []).filter((t) => !t.is_completed);
  const done = (tasks ?? []).filter((t) => t.is_completed).slice(0, 5);

  return (
    <View>
      {/* Quick add */}
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
        <View className="flex-row gap-2 mt-2">
          <Chip label="Sem prazo" selected={due === null} onPress={() => setDue(null)} />
          <Chip label="Hoje" selected={due === todayISO()} onPress={() => setDue(todayISO())} />
          <Chip
            label="Amanhã"
            selected={due === tomorrowISO()}
            onPress={() => setDue(tomorrowISO())}
          />
        </View>
      </Card>

      {/* Lista */}
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
          {pending.length > 0 && (
            <Card className="overflow-hidden mt-4">
              {pending.map((t, i) => {
                const label = dueLabel(t.due_date);
                return (
                  <View
                    key={t.id}
                    className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                  >
                    <Pressable
                      onPress={() => toggleTask.mutate({ id: t.id, done: true })}
                      className="w-6 h-6 rounded-full border-2 border-border items-center justify-center active:bg-accent"
                      hitSlop={6}
                      testID={`task-toggle-${t.id}`}
                    />
                    <View className="flex-1 min-w-0">
                      <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                        {t.title}
                      </Text>
                      {label && (
                        <Text
                          className={`text-[11px] mt-0.5 ${label.danger ? 'text-danger' : 'text-muted-foreground'}`}
                        >
                          {label.text}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => deleteTask.mutate(t.id)}
                      hitSlop={6}
                      className="p-1.5 rounded-full active:bg-muted"
                    >
                      <Trash2 size={14} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                );
              })}
            </Card>
          )}

          {done.length > 0 && (
            <>
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-5 mb-2 px-1">
                Concluídas
              </Text>
              <Card className="overflow-hidden">
                {done.map((t, i) => (
                  <View
                    key={t.id}
                    className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                  >
                    <Pressable
                      onPress={() => toggleTask.mutate({ id: t.id, done: false })}
                      className="w-6 h-6 rounded-full bg-primary items-center justify-center active:opacity-80"
                      hitSlop={6}
                    >
                      <Check size={13} color="#FFFFFF" />
                    </Pressable>
                    <Text
                      className="flex-1 text-sm text-muted-foreground line-through"
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                    <Pressable
                      onPress={() => deleteTask.mutate(t.id)}
                      hitSlop={6}
                      className="p-1.5 rounded-full active:bg-muted"
                    >
                      <Trash2 size={14} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))}
              </Card>
            </>
          )}
        </>
      )}
    </View>
  );
}

function EventsSection() {
  const { data: events, isLoading } = useUpcomingEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const [title, setTitle] = useState('');
  const [dateBR, setDateBR] = useState(toBRShort(todayISO()) + '/' + todayISO().slice(0, 4));
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    setError(null);
    if (title.trim().length < 1) return;
    const m = dateBR.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) {
      setError('Data inválida (DD/MM/AAAA).');
      return;
    }
    const dateISO = `${m[3]}-${m[2]}-${m[1]}`;
    const timeOk = time.trim() === '' || /^\d{2}:\d{2}$/.test(time.trim());
    if (!timeOk) {
      setError('Hora inválida (HH:MM).');
      return;
    }
    await createEvent.mutateAsync({
      title: title.trim(),
      date: dateISO,
      time: time.trim() || null,
    });
    setTitle('');
    setTime('');
  };

  const grouped = useMemo(() => {
    const map = new Map<string, NonNullable<typeof events>>();
    for (const e of events ?? []) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return [...map.entries()];
  }, [events]);

  return (
    <View>
      {/* Add */}
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

      {/* Lista agrupada por dia */}
      {isLoading ? (
        <View className="py-14 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : grouped.length === 0 ? (
        <Card className="p-8 items-center mt-4">
          <Coffee size={26} color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground mt-2 text-center">Agenda livre!</Text>
        </Card>
      ) : (
        grouped.map(([date, list]) => (
          <View key={date} className="mt-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {date === todayISO() ? 'Hoje' : toBRShort(date)}
            </Text>
            <Card className="overflow-hidden">
              {list.map((e, i) => (
                <View
                  key={e.id}
                  className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <View className="w-9 h-9 rounded-xl bg-accent items-center justify-center">
                    <CalendarDays size={16} color={colors.primary} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                      {e.title}
                    </Text>
                    <View className="flex-row items-center gap-3 mt-0.5">
                      <View className="flex-row items-center gap-1">
                        <Clock size={10} color={colors.mutedForeground} />
                        <Text className="text-[11px] text-muted-foreground">
                          {e.time ? e.time.slice(0, 5) : 'Dia todo'}
                        </Text>
                      </View>
                      {e.location ? (
                        <View className="flex-row items-center gap-1">
                          <MapPin size={10} color={colors.mutedForeground} />
                          <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                            {e.location}
                          </Text>
                        </View>
                      ) : null}
                    </View>
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

export default function Agenda() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('tasks');

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        style={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[720px] mx-auto">
          <Text className="text-xl font-bold text-foreground mb-4">Agenda</Text>

          {/* Alternador */}
          <View className="flex-row gap-2 mb-4">
            <Chip
              label="Tarefas"
              selected={tab === 'tasks'}
              onPress={() => setTab('tasks')}
              testID="tab-tasks"
            />
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
