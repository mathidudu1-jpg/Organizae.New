import { Link } from 'expo-router';
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  CalendarCheck,
  Car,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Heart,
  Home as HomeIcon,
  LogOut,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chip } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { AppointmentsCard } from '@/features/dashboard/components/AppointmentsCard';
import { BanksWidget } from '@/features/dashboard/components/BanksWidget';
import { useCategories } from '@/features/finance/hooks/useCategories';
import { useSpendingChart, type ChartPeriod } from '@/features/finance/hooks/useSpendingChart';
import { useTransactions } from '@/features/finance/hooks/useTransactions';
import { addMonthsToMonthRef } from '@/features/finance/lib/invoice';
import { useUpcomingEvents } from '@/features/personal/hooks/useEvents';
import { useTasks } from '@/features/personal/hooks/useTasks';
import { currentMonthRef, formatCurrency, todayISO } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import type { Transaction } from '@/types/database';

// ---------- helpers ----------

const CATEGORY_ICONS: Record<string, typeof Receipt> = {
  utensils: Utensils,
  car: Car,
  home: HomeIcon,
  'shopping-bag': ShoppingBag,
  heart: Heart,
  'gamepad-2': Gamepad2,
  receipt: Receipt,
  'trending-up': TrendingUp,
  briefcase: Briefcase,
  'more-horizontal': MoreHorizontal,
};

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function monthLabel(monthRef: string): string {
  const [y, m] = monthRef.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function formatScale(v: number): string {
  if (v === 0) return '0';
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(Math.round(v));
}

// ---------- widgets ----------

/** Resumo do dia (mobile): compromissos + tarefas de hoje → /agenda. */
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
        </Card>
      </Pressable>
    </Link>
  );
}

/** Card de resumo com barra de progresso (estilo original). */
function SummaryCard({
  label,
  value,
  icon,
  tone,
  progress,
  change,
  testID,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'primary' | 'green' | 'red';
  progress: number;
  change?: number | null;
  testID: string;
}) {
  const tones = {
    primary: { text: 'text-foreground', bar: colors.primary, track: 'rgba(11,138,99,0.12)', chip: 'bg-accent' },
    green: { text: 'text-success', bar: colors.success, track: 'rgba(18,128,92,0.12)', chip: 'bg-accent' },
    red: { text: 'text-danger', bar: colors.danger, track: 'rgba(229,72,77,0.12)', chip: 'bg-danger/10' },
  }[tone];

  return (
    <Card className="flex-1 p-4">
      <View className="flex-row items-center gap-2 mb-3">
        <View className={`p-1.5 rounded-lg ${tones.chip}`}>{icon}</View>
        <Text
          className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1"
          numberOfLines={1}
        >
          {label}
        </Text>
        {change != null && (
          <View
            className={`flex-row items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
              change >= 0 ? 'bg-accent' : 'bg-danger/10'
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight size={9} color={colors.success} />
            ) : (
              <ArrowDownRight size={9} color={colors.danger} />
            )}
            <Text
              className={`text-[10px] font-bold ${change >= 0 ? 'text-success' : 'text-danger'}`}
            >
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
      <Text className={`text-lg font-bold tabular-nums mb-3 ${tones.text}`} testID={testID}>
        {formatCurrency(value)}
      </Text>
      <View className="h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: tones.track }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: tones.bar }}
        />
      </View>
    </Card>
  );
}

/** Gráfico de barras "Meus Gastos" (estilo original: eixo Y, mês atual escuro). */
function SpendingChart({
  period,
  selectedMonth,
  onSelectMonth,
}: {
  period: ChartPeriod;
  selectedMonth: string;
  onSelectMonth: (ref: string) => void;
}) {
  const { data } = useSpendingChart(period);
  const max = Math.max(...data.map((d) => d.total), 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const scaleMax = Math.ceil(max / magnitude) * magnitude;
  const ticks = [scaleMax, scaleMax * 0.5, 0];

  return (
    <View className="mt-4">
      <View className="flex-row h-40">
        {/* Eixo Y */}
        <View className="justify-between py-0.5 pr-2 w-8">
          {ticks.map((t) => (
            <Text key={t} className="text-[10px] text-muted-foreground/60 text-right">
              {formatScale(t)}
            </Text>
          ))}
        </View>
        {/* Área das barras */}
        <View className="flex-1">
          <View className="absolute inset-0 justify-between py-0.5">
            {ticks.map((t) => (
              <View key={t} className="h-px" style={{ backgroundColor: 'rgba(107,114,128,0.10)' }} />
            ))}
          </View>
          <View className="flex-1 flex-row items-end justify-around gap-1 pb-5 pt-1">
            {data.map((d) => {
              const h = d.total === 0 ? 3 : Math.max(6, Math.round((d.total / scaleMax) * 108));
              const isSel = period === 'month' ? d.monthRef === selectedMonth : d.isCurrent;
              return (
                <Pressable
                  key={d.key}
                  disabled={period !== 'month'}
                  onPress={() => d.monthRef && onSelectMonth(d.monthRef)}
                  className="flex-1 items-center justify-end h-full"
                  testID={`chart-bar-${d.key}`}
                >
                  <View
                    className="w-[18px] rounded-t-[5px]"
                    style={{
                      height: h,
                      backgroundColor: isSel ? colors.foreground : 'rgba(107,114,128,0.14)',
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
          <View className="absolute bottom-0 inset-x-0 flex-row justify-around gap-1">
            {data.map((d) => (
              <Text
                key={d.key}
                className={`flex-1 text-center text-[10px] ${
                  (period === 'month' ? d.monthRef === selectedMonth : d.isCurrent)
                    ? 'text-foreground font-bold'
                    : 'text-muted-foreground/70'
                }`}
              >
                {d.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------- tela ----------

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { user } = useAuth();

  const [monthRef, setMonthRef] = useState(currentMonthRef());
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<ChartPeriod>('month');

  const { data: transactions, isLoading } = useTransactions(monthRef);
  const { data: prevTransactions } = useTransactions(addMonthsToMonthRef(monthRef, -1));
  const { data: categories } = useCategories();

  const isCurrentMonth = monthRef === currentMonthRef();
  const firstName =
    (user?.user_metadata?.name as string | undefined)?.split(' ')[0] ?? 'você';

  const catInfo = useMemo(() => {
    const map = new Map((categories ?? []).map((c) => [c.id, c]));
    return (id: string | null) => {
      const c = id ? map.get(id) : undefined;
      return {
        name: c?.name ?? 'Sem categoria',
        Icon: (c?.icon && CATEGORY_ICONS[c.icon]) || Receipt,
        color: c?.color ?? '#94A3B8',
      };
    };
  }, [categories]);

  const summarize = (txs: Transaction[] | undefined) => {
    let income = 0;
    let expense = 0;
    for (const t of txs ?? []) {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  };

  const summary = useMemo(() => summarize(transactions), [transactions]);
  const prevBalance = useMemo(() => summarize(prevTransactions).balance, [prevTransactions]);
  const balanceChange =
    prevBalance !== 0
      ? Math.round(((summary.balance - prevBalance) / Math.abs(prevBalance)) * 100)
      : null;

  const maxVal = Math.max(Math.abs(summary.balance), summary.income, summary.expense, 1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = transactions ?? [];
    return q ? list.filter((t) => (t.description ?? '').toLowerCase().includes(q)) : list;
  }, [transactions, search]);
  const recent = filtered.slice(0, 6);
  const hasData = (transactions ?? []).length > 0;

  const monthSelector = (
    <View className="flex-row items-center gap-0.5 bg-surface border border-border rounded-full px-1 py-1">
      <Pressable
        onPress={() => setMonthRef((m) => addMonthsToMonthRef(m, -1))}
        hitSlop={8}
        className="w-7 h-7 rounded-full items-center justify-center active:bg-muted"
        testID="month-prev"
      >
        <ChevronLeft size={14} color={colors.mutedForeground} />
      </Pressable>
      <Text
        className="text-xs font-bold text-foreground capitalize min-w-[110px] text-center"
        testID="month-label"
      >
        {monthLabel(monthRef)}
      </Text>
      <Pressable
        onPress={() => setMonthRef((m) => addMonthsToMonthRef(m, 1))}
        hitSlop={8}
        className="w-7 h-7 rounded-full items-center justify-center active:bg-muted"
        testID="month-next"
      >
        <ChevronRight size={14} color={colors.mutedForeground} />
      </Pressable>
      {!isCurrentMonth && (
        <Pressable
          onPress={() => setMonthRef(currentMonthRef())}
          hitSlop={8}
          className="pr-2"
          testID="month-today"
        >
          <Text className="text-[11px] text-primary font-semibold">atual</Text>
        </Pressable>
      )}
    </View>
  );

  const leftColumn = (
    <View className="flex-1 min-w-0">
      {/* Meus Gastos + período */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-bold text-base text-foreground">Meus Gastos</Text>
        <View className="flex-row items-center gap-0.5 bg-muted rounded-full p-0.5">
          {(
            [
              ['week', 'Semana'],
              ['month', 'Mês'],
              ['year', 'Ano'],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setPeriod(key)}
              className={`px-3 py-1 rounded-full ${period === key ? 'bg-foreground' : ''}`}
              testID={`period-${key}`}
            >
              <Text
                className={`text-[11px] font-medium ${
                  period === key ? 'text-white' : 'text-muted-foreground'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Cards de resumo */}
      <View className="flex-row gap-3">
        <SummaryCard
          label="Saldo do mês"
          value={summary.balance}
          icon={<Wallet size={13} color={colors.primary} />}
          tone={summary.balance < 0 ? 'red' : 'primary'}
          progress={(Math.abs(summary.balance) / maxVal) * 100}
          change={balanceChange}
          testID="sum-balance"
        />
        <SummaryCard
          label="Entradas"
          value={summary.income}
          icon={<TrendingUp size={13} color={colors.success} />}
          tone="green"
          progress={(summary.income / maxVal) * 100}
          testID="sum-income"
        />
        <SummaryCard
          label="Despesas"
          value={summary.expense}
          icon={<TrendingDown size={13} color={colors.danger} />}
          tone="red"
          progress={(summary.expense / maxVal) * 100}
          testID="sum-expense"
        />
      </View>

      {/* Hoje (mobile) */}
      {!isDesktop && <TodayWidget />}

      {/* Gráfico */}
      <SpendingChart period={period} selectedMonth={monthRef} onSelectMonth={setMonthRef} />

      {/* Lançamentos Recentes */}
      <View className="flex-row items-center justify-between mt-6 mb-3">
        <Text className="font-bold text-base text-foreground">Lançamentos Recentes</Text>
        <Link href="/new" asChild>
          <Pressable
            className="flex-row items-center gap-1.5 bg-primary rounded-full px-4 py-2 active:opacity-90"
            testID="btn-add"
          >
            <Plus color="#FFFFFF" size={14} />
            <Text className="text-primary-foreground font-semibold text-xs">Adicionar</Text>
          </Pressable>
        </Link>
      </View>

      {isLoading ? (
        <View className="py-16 items-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !hasData ? (
        <Card className="p-8 items-center">
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
        </Card>
      ) : recent.length === 0 ? (
        <Card className="p-6 items-center">
          <Text className="text-sm text-muted-foreground">
            Nada encontrado pra "{search.trim()}".
          </Text>
        </Card>
      ) : (
        <View className="gap-1.5">
          {recent.map((t) => {
            const isIncome = t.type === 'income';
            const cat = catInfo(t.category_id);
            return (
              <Link key={t.id} href={`/transaction/${t.id}`} asChild>
                <Pressable testID={`tx-${t.id}`}>
                  <Card className="flex-row items-center gap-3 px-4 py-3.5 active:bg-muted">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{ backgroundColor: `${cat.color}1F` }}
                    >
                      <cat.Icon size={17} color={cat.color} />
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                        {t.description ?? 'Lançamento'}
                      </Text>
                      <Text className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {cat.name}
                        {t.installment_total ? ` · ${t.installment_no}/${t.installment_total}` : ''}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-muted-foreground/70 tabular-nums hidden lg:flex">
                      {toBRShort(t.date)}
                    </Text>
                    <Text
                      className={`text-sm font-bold tabular-nums ${
                        isIncome ? 'text-success' : 'text-foreground'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </Text>
                  </Card>
                </Pressable>
              </Link>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10 lg:px-8"
        style={{ paddingTop: isDesktop ? 8 : insets.top + 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[1120px] mx-auto">
          {/* Header */}
          <View className="flex-row items-center justify-between py-4 lg:py-5">
            <View className="flex-row items-center gap-3 flex-1 min-w-0">
              <View className="w-10 h-10 rounded-full bg-accent items-center justify-center">
                <Text className="text-primary font-bold text-base">
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                  Olá, {firstName}
                </Text>
                <Text className="text-[11px] text-muted-foreground/70 font-medium">
                  Bem-vindo de volta
                </Text>
              </View>
              {/* Busca (desktop) */}
              {isDesktop && (
                <View className="flex-row items-center w-56 h-9 rounded-full bg-surface border border-border px-3.5 ml-4">
                  <Search size={13} color={colors.placeholder} />
                  <TextInput
                    className="flex-1 ml-2 text-xs text-foreground"
                    placeholder="Buscar lançamentos..."
                    placeholderTextColor={colors.placeholder}
                    value={search}
                    onChangeText={setSearch}
                    testID="search"
                  />
                </View>
              )}
            </View>

            <View className="flex-row items-center gap-2">
              {isDesktop && monthSelector}
              {!isDesktop && (
                <Pressable
                  onPress={() => supabase.auth.signOut()}
                  className="w-9 h-9 rounded-full bg-surface border border-border items-center justify-center active:opacity-80"
                  hitSlop={8}
                  testID="btn-logout"
                >
                  <LogOut color={colors.mutedForeground} size={15} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Seletor de mês (mobile, centralizado) */}
          {!isDesktop && <View className="items-center mb-4">{monthSelector}</View>}

          {/* Grid principal */}
          {isDesktop ? (
            <View className="flex-row gap-6 mt-1">
              {leftColumn}
              <View className="w-[340px] gap-6">
                <BanksWidget />
                <AppointmentsCard />
              </View>
            </View>
          ) : (
            leftColumn
          )}
        </View>
      </ScrollView>
    </View>
  );
}
