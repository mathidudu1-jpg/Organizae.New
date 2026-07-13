import { Link } from 'expo-router';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Wallet,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCategories } from '@/features/finance/hooks/useCategories';
import { useMonthlySpending } from '@/features/finance/hooks/useMonthlySpending';
import { useTransactions } from '@/features/finance/hooks/useTransactions';
import { addMonthsToMonthRef } from '@/features/finance/lib/invoice';
import { useUpcomingEvents } from '@/features/personal/hooks/useEvents';
import { useTasks } from '@/features/personal/hooks/useTasks';
import { currentMonthRef, formatCurrency, todayISO } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function monthLabel(monthRef: string): string {
  const [y, m] = monthRef.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function shortMonth(monthRef: string): string {
  const [y, m] = monthRef.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

/** Resumo do dia: compromissos de hoje + tarefas pra hoje/atrasadas. */
function TodayWidget() {
  const { data: events } = useUpcomingEvents();
  const { data: tasks } = useTasks();
  const today = todayISO();

  const todayEvents = (events ?? []).filter((e) => e.date === today);
  const dueTasks = (tasks ?? []).filter(
    (t) => !t.is_completed && t.due_date != null && t.due_date <= today
  );

  return (
    <Link href="/agenda" asChild>
      <Pressable testID="today-widget">
        <Card className="px-4 py-3.5 mt-3 flex-row items-center gap-3 active:bg-muted">
          <View className="w-9 h-9 rounded-xl bg-accent items-center justify-center">
            <CalendarCheck size={16} color={colors.primary} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-sm font-semibold text-foreground">Hoje</Text>
            <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
              {todayEvents.length === 0 && dueTasks.length === 0
                ? 'Agenda livre · nenhuma tarefa pra hoje'
                : [
                    todayEvents.length > 0
                      ? `${todayEvents.length} compromisso${todayEvents.length > 1 ? 's' : ''}`
                      : null,
                    dueTasks.length > 0
                      ? `${dueTasks.length} tarefa${dueTasks.length > 1 ? 's' : ''} pendente${dueTasks.length > 1 ? 's' : ''}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
            </Text>
          </View>
          {todayEvents[0] && (
            <Text className="text-[11px] font-semibold text-primary" numberOfLines={1}>
              {todayEvents[0].time ? todayEvents[0].time.slice(0, 5) : ''} {todayEvents[0].title}
            </Text>
          )}
        </Card>
      </Pressable>
    </Link>
  );
}

/** Mini-gráfico dos gastos dos últimos 6 meses (barra do mês selecionado em destaque). */
function SpendingChart({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (monthRef: string) => void;
}) {
  const { data, isLoading } = useMonthlySpending(6);
  const max = Math.max(...data.map((d) => d.total), 1);

  if (isLoading) return null;
  if (data.every((d) => d.total === 0)) return null;

  return (
    <Card className="p-4 mt-3">
      <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Meus gastos · últimos 6 meses
      </Text>
      <View className="flex-row items-end gap-2 h-24">
        {data.map((d) => {
          const isSel = d.monthRef === selected;
          const h = d.total === 0 ? 3 : Math.max(6, Math.round((d.total / max) * 84));
          return (
            <Pressable
              key={d.monthRef}
              onPress={() => onSelect(d.monthRef)}
              className="flex-1 items-center justify-end gap-1.5"
              testID={`chart-bar-${d.monthRef}`}
            >
              <View
                className={`w-full max-w-[26px] rounded-t-md ${
                  isSel ? 'bg-primary' : 'bg-muted-foreground/15'
                }`}
                style={{ height: h }}
              />
              <Text
                className={`text-[10px] ${
                  isSel ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                {shortMonth(d.monthRef)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [monthRef, setMonthRef] = useState(currentMonthRef());
  const { data: transactions, isLoading } = useTransactions(monthRef);
  const { data: categories } = useCategories();

  const isCurrentMonth = monthRef === currentMonthRef();

  const firstName =
    (user?.user_metadata?.name as string | undefined)?.split(' ')[0] ?? 'você';

  const categoryName = useMemo(() => {
    const map = new Map((categories ?? []).map((c) => [c.id, c.name]));
    return (id: string | null) => (id ? (map.get(id) ?? 'Outros') : 'Sem categoria');
  }, [categories]);

  const summary = useMemo(() => {
    const txs = transactions ?? [];
    let income = 0;
    let expense = 0;
    for (const t of txs) {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const recent = (transactions ?? []).slice(0, 5);
  const hasData = (transactions ?? []).length > 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        style={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[720px] mx-auto">
          {/* Header: saudação + logout */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-full bg-accent items-center justify-center">
                <Text className="text-primary font-bold text-base">
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-foreground">Olá, {firstName}</Text>
                <Text className="text-xs text-muted-foreground">Bem-vindo de volta</Text>
              </View>
            </View>
            <Pressable
              onPress={() => supabase.auth.signOut()}
              className="w-9 h-9 rounded-full bg-surface border border-border items-center justify-center active:opacity-80"
              hitSlop={8}
              testID="btn-logout"
            >
              <LogOut color={colors.mutedForeground} size={16} />
            </Pressable>
          </View>

          {/* Seletor de mês */}
          <View className="flex-row items-center justify-center gap-1 mb-4">
            <Pressable
              onPress={() => setMonthRef((m) => addMonthsToMonthRef(m, -1))}
              hitSlop={8}
              className="w-8 h-8 rounded-full items-center justify-center active:bg-muted"
              testID="month-prev"
            >
              <ChevronLeft size={16} color={colors.mutedForeground} />
            </Pressable>
            <Text
              className="text-sm font-bold text-foreground capitalize min-w-[150px] text-center"
              testID="month-label"
            >
              {monthLabel(monthRef)}
            </Text>
            <Pressable
              onPress={() => setMonthRef((m) => addMonthsToMonthRef(m, 1))}
              hitSlop={8}
              className="w-8 h-8 rounded-full items-center justify-center active:bg-muted"
              testID="month-next"
            >
              <ChevronRight size={16} color={colors.mutedForeground} />
            </Pressable>
            {!isCurrentMonth && (
              <Pressable
                onPress={() => setMonthRef(currentMonthRef())}
                hitSlop={8}
                testID="month-today"
              >
                <Text className="text-[11px] text-primary font-semibold ml-1">atual</Text>
              </Pressable>
            )}
          </View>

          {isLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <>
              {/* Resumo do mês */}
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-3xl bg-surface border border-border p-4">
                  <View className="w-8 h-8 rounded-xl bg-accent items-center justify-center mb-3">
                    <Wallet color={colors.primary} size={15} />
                  </View>
                  <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Saldo do mês
                  </Text>
                  <Text
                    className={`text-lg font-bold mt-0.5 ${
                      summary.balance < 0 ? 'text-danger' : 'text-foreground'
                    }`}
                    testID="sum-balance"
                  >
                    {formatCurrency(summary.balance)}
                  </Text>
                </View>
                <View className="flex-1 rounded-3xl bg-surface border border-border p-4">
                  <View className="w-8 h-8 rounded-xl bg-accent items-center justify-center mb-3">
                    <ArrowUpRight color={colors.success} size={15} />
                  </View>
                  <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Entradas
                  </Text>
                  <Text className="text-lg font-bold text-success mt-0.5" testID="sum-income">
                    {formatCurrency(summary.income)}
                  </Text>
                </View>
                <View className="flex-1 rounded-3xl bg-surface border border-border p-4">
                  <View className="w-8 h-8 rounded-xl bg-danger/10 items-center justify-center mb-3">
                    <ArrowDownRight color={colors.danger} size={15} />
                  </View>
                  <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Saídas
                  </Text>
                  <Text className="text-lg font-bold text-danger mt-0.5" testID="sum-expense">
                    {formatCurrency(summary.expense)}
                  </Text>
                </View>
              </View>

              {/* Hoje (agenda + tarefas) */}
              <TodayWidget />

              {/* Gráfico de gastos */}
              <SpendingChart selected={monthRef} onSelect={setMonthRef} />

              {/* Lançamentos / empty state */}
              {hasData ? (
                <View className="mt-6">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-base font-bold text-foreground">
                      Lançamentos {isCurrentMonth ? 'recentes' : `de ${monthLabel(monthRef).split(' ')[0]}`}
                    </Text>
                    <Link href="/new" asChild>
                      <Pressable
                        className="flex-row items-center gap-1.5 bg-primary rounded-full px-4 py-2 active:opacity-90"
                        testID="btn-add"
                      >
                        <Plus color="#FFFFFF" size={15} />
                        <Text className="text-primary-foreground font-semibold text-xs">
                          Adicionar
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                  <View className="rounded-3xl bg-surface border border-border overflow-hidden">
                    {recent.map((t, i) => {
                      const isIncome = t.type === 'income';
                      return (
                        <Link key={t.id} href={`/transaction/${t.id}`} asChild>
                          <Pressable
                            className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-muted ${
                              i > 0 ? 'border-t border-border' : ''
                            }`}
                          >
                            <View
                              className={`w-9 h-9 rounded-xl items-center justify-center ${
                                isIncome ? 'bg-accent' : 'bg-danger/10'
                              }`}
                            >
                              {isIncome ? (
                                <ArrowUpRight color={colors.success} size={16} />
                              ) : (
                                <ArrowDownRight color={colors.danger} size={16} />
                              )}
                            </View>
                            <View className="flex-1 min-w-0">
                              <Text
                                className="text-sm font-semibold text-foreground"
                                numberOfLines={1}
                              >
                                {t.description ?? 'Lançamento'}
                              </Text>
                              <Text className="text-[11px] text-muted-foreground mt-0.5">
                                {categoryName(t.category_id)} · {toBRShort(t.date)}
                                {t.installment_total
                                  ? ` · ${t.installment_no}/${t.installment_total}`
                                  : ''}
                              </Text>
                            </View>
                            <Text
                              className={`text-sm font-bold ${
                                isIncome ? 'text-success' : 'text-foreground'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrency(t.amount)}
                            </Text>
                          </Pressable>
                        </Link>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View className="mt-6 rounded-3xl bg-surface border border-border p-8 items-center">
                  <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-4">
                    <Wallet color={colors.primary} size={26} />
                  </View>
                  <Text className="text-lg font-bold text-foreground text-center">
                    {isCurrentMonth ? 'Tudo pronto pra começar' : 'Mês sem lançamentos'}
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center mt-1.5 leading-5">
                    {isCurrentMonth
                      ? 'Registre seu primeiro lançamento e veja seu mês ganhar forma.'
                      : `Nenhum lançamento em ${monthLabel(monthRef)}.`}
                  </Text>
                  {isCurrentMonth && (
                    <Link href="/new" asChild>
                      <Pressable
                        className="mt-6 flex-row items-center gap-2 bg-primary rounded-full px-6 py-3 active:opacity-90"
                        testID="btn-add-empty"
                      >
                        <Plus color="#FFFFFF" size={18} />
                        <Text className="text-primary-foreground font-semibold text-sm">
                          Adicionar lançamento
                        </Text>
                      </Pressable>
                    </Link>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
