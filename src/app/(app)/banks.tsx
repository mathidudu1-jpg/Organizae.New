import { Link } from 'expo-router';
import {
  ChevronRight,
  CreditCard,
  Landmark,
  Plus,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui';
import { useAccountBalances, useAccounts } from '@/features/finance/hooks/useAccounts';
import { useCards } from '@/features/finance/hooks/useCards';
import { useInvestments } from '@/features/invest/hooks/useInvestments';
import { formatCurrency } from '@/lib/format';
import { colors } from '@/theme/colors';

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  wallet: 'Carteira digital',
  cash: 'Dinheiro',
  investment: 'Investimentos',
  other: 'Outra',
};

export default function Banks() {
  const insets = useSafeAreaInsets();
  const { data: accounts, isLoading } = useAccounts();
  const { data: cards } = useCards();
  const { balanceOf, total, isLoading: loadingBalances } = useAccountBalances();
  const invest = useInvestments();

  const list = accounts ?? [];
  const orphanCards = (cards ?? []).filter((c) => !c.account_id);
  const cardsOf = (accountId: string) =>
    (cards ?? []).filter((c) => c.account_id === accountId);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        style={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[720px] mx-auto">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-foreground">Bancos</Text>
            <Link href="/bank-new" asChild>
              <Pressable
                className="flex-row items-center gap-1.5 bg-primary rounded-full px-4 py-2 active:opacity-90"
                testID="btn-add-bank"
              >
                <Plus color="#FFFFFF" size={15} />
                <Text className="text-primary-foreground font-semibold text-xs">Novo banco</Text>
              </Pressable>
            </Link>
          </View>

          {/* Hero: saldo total em contas */}
          <View
            className="rounded-3xl p-6 mb-5 overflow-hidden"
            style={{ backgroundColor: '#14181F' }}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Wallet size={13} color="#2BD4A0" />
              <Text
                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Saldo em contas
              </Text>
            </View>
            {loadingBalances ? (
              <ActivityIndicator color="#2BD4A0" style={{ alignSelf: 'flex-start' }} />
            ) : (
              <Text className="text-white text-3xl font-bold tabular-nums" testID="total-balance">
                {formatCurrency(total)}
              </Text>
            )}
            <Text className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {list.length} {list.length === 1 ? 'conta' : 'contas'} ·{' '}
              {(cards ?? []).length} {(cards ?? []).length === 1 ? 'cartão' : 'cartões'}
            </Text>
          </View>

          {/* Investimentos */}
          <Link href="/investments" asChild>
            <Pressable testID="invest-card">
              <Card className="p-4 mb-5 flex-row items-center gap-3.5 active:bg-muted">
                <View className="w-12 h-12 rounded-2xl bg-accent items-center justify-center">
                  <TrendingUp size={20} color={colors.primary} />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-bold text-foreground">Investimentos</Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5">
                    {invest.data.length === 0
                      ? 'Simule suas aplicações e veja render'
                      : `${invest.data.length} ${invest.data.length === 1 ? 'aplicação' : 'aplicações'}`}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-bold tabular-nums text-foreground">
                    {formatCurrency(invest.totalValue)}
                  </Text>
                  {invest.totalYield > 0 && (
                    <Text className="text-[11px] font-semibold text-success">
                      +{formatCurrency(invest.totalYield)}
                    </Text>
                  )}
                </View>
                <ChevronRight size={16} color={colors.placeholder} />
              </Card>
            </Pressable>
          </Link>

          {isLoading ? (
            <View className="py-16 items-center">
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : list.length === 0 ? (
            <Card className="p-8 items-center">
              <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-4">
                <Landmark color={colors.primary} size={26} />
              </View>
              <Text className="text-lg font-bold text-foreground text-center">
                Cadastre seu primeiro banco
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-1.5 leading-5">
                Cada banco guarda o saldo da conta e os cartões (crédito e débito) que vivem nele.
              </Text>
              <Link href="/bank-new" asChild>
                <Pressable
                  className="mt-6 flex-row items-center gap-2 bg-primary rounded-full px-6 py-3 active:opacity-90"
                  testID="btn-add-bank-empty"
                >
                  <Plus color="#FFFFFF" size={18} />
                  <Text className="text-primary-foreground font-semibold text-sm">
                    Adicionar banco
                  </Text>
                </Pressable>
              </Link>
            </Card>
          ) : (
            <View className="gap-3">
              {list.map((a) => {
                const accountCards = cardsOf(a.id);
                const color = a.color ?? '#14181F';
                return (
                  <Link key={a.id} href={`/bank/${a.id}`} asChild>
                    <Pressable testID={`bank-${a.id}`}>
                      <Card className="p-4 flex-row items-center gap-3.5 active:bg-muted">
                        {/* Marca do banco */}
                        <View
                          className="w-12 h-12 rounded-2xl items-center justify-center"
                          style={{ backgroundColor: color }}
                        >
                          <Text className="text-white font-bold text-sm">
                            {a.name.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>

                        <View className="flex-1 min-w-0">
                          <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                            {a.name}
                          </Text>
                          <View className="flex-row items-center gap-2 mt-0.5">
                            <Text className="text-[11px] text-muted-foreground">
                              {ACCOUNT_TYPE_LABEL[a.type] ?? a.type}
                            </Text>
                            {accountCards.length > 0 && (
                              <View className="flex-row items-center gap-1">
                                <CreditCard size={10} color={colors.mutedForeground} />
                                <Text className="text-[11px] text-muted-foreground">
                                  {accountCards.length}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View className="items-end">
                          <Text className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Saldo
                          </Text>
                          <Text
                            className={`text-sm font-bold tabular-nums ${
                              balanceOf(a.id) < 0 ? 'text-danger' : 'text-foreground'
                            }`}
                          >
                            {formatCurrency(balanceOf(a.id))}
                          </Text>
                        </View>
                        <ChevronRight size={16} color={colors.placeholder} />
                      </Card>
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          )}

          {/* Cartões sem banco */}
          {orphanCards.length > 0 && (
            <View className="mt-6">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Cartões sem banco
              </Text>
              <Card className="overflow-hidden">
                {orphanCards.map((c, i) => (
                  <Link key={c.id} href={`/card/${c.id}`} asChild>
                    <Pressable
                      className={`flex-row items-center gap-3 px-4 py-3 active:bg-muted ${
                        i > 0 ? 'border-t border-border' : ''
                      }`}
                      testID={`orphan-${c.id}`}
                    >
                      <View
                        className="w-9 h-9 rounded-xl items-center justify-center"
                        style={{ backgroundColor: c.color ?? '#14181F' }}
                      >
                        <CreditCard size={15} color="#FFFFFF" />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                          {c.name}
                          {c.last4 ? ` · ${c.last4}` : ''}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                          Toque para vincular a um banco
                        </Text>
                      </View>
                      <ChevronRight size={15} color={colors.placeholder} />
                    </Pressable>
                  </Link>
                ))}
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
