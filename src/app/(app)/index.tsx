import { Link } from 'expo-router';
import {
  ArrowDownRight,
  ArrowUpRight,
  LogOut,
  Plus,
  Wallet,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/AuthProvider';
import { useCategories } from '@/features/finance/hooks/useCategories';
import { useTransactions } from '@/features/finance/hooks/useTransactions';
import { currentMonthRef, formatCurrency } from '@/lib/format';
import { supabase } from '@/lib/supabase';

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: transactions, isLoading } = useTransactions(currentMonthRef());
  const { data: categories } = useCategories();

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
          <View className="flex-row items-center justify-between mb-6">
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
              <LogOut color="#6B7280" size={16} />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator color="#0B8A63" size="large" />
            </View>
          ) : (
            <>
              {/* Resumo do mês */}
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-3xl bg-surface border border-border p-4">
                  <View className="w-8 h-8 rounded-xl bg-accent items-center justify-center mb-3">
                    <Wallet color="#0B8A63" size={15} />
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
                    <ArrowUpRight color="#12805C" size={15} />
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
                    <ArrowDownRight color="#E5484D" size={15} />
                  </View>
                  <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Saídas
                  </Text>
                  <Text className="text-lg font-bold text-danger mt-0.5" testID="sum-expense">
                    {formatCurrency(summary.expense)}
                  </Text>
                </View>
              </View>

              {/* Lançamentos recentes / empty state */}
              {hasData ? (
                <View className="mt-6">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-base font-bold text-foreground">
                      Lançamentos recentes
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
                        <View
                          key={t.id}
                          className={`flex-row items-center gap-3 px-4 py-3.5 ${
                            i > 0 ? 'border-t border-border' : ''
                          }`}
                        >
                          <View
                            className={`w-9 h-9 rounded-xl items-center justify-center ${
                              isIncome ? 'bg-accent' : 'bg-danger/10'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight color="#12805C" size={16} />
                            ) : (
                              <ArrowDownRight color="#E5484D" size={16} />
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
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View className="mt-6 rounded-3xl bg-surface border border-border p-8 items-center">
                  <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-4">
                    <Wallet color="#0B8A63" size={26} />
                  </View>
                  <Text className="text-lg font-bold text-foreground text-center">
                    Tudo pronto pra começar
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center mt-1.5 leading-5">
                    Registre seu primeiro lançamento e veja seu mês ganhar forma.
                  </Text>
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
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
