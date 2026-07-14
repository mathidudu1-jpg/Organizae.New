import { Link } from 'expo-router';
import {
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CreditCard,
  Landmark,
  Plus,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Enter, Glass, PressableScale, Screen } from '@/components/ui';
import { useAccountBalances, useAccounts } from '@/features/finance/hooks/useAccounts';
import { useCardInvoice } from '@/features/finance/hooks/useCardInvoice';
import { useCards } from '@/features/finance/hooks/useCards';
import { useInvestments } from '@/features/invest/hooks/useInvestments';
import { formatCurrency } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { Card as CardRow } from '@/types/database';

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  wallet: 'Carteira digital',
  cash: 'Dinheiro',
  investment: 'Investimentos',
  other: 'Outra',
};

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** Tile de estatística dentro do hero. */
function HeroTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View className="flex-1 rounded-2xl px-4 py-3 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
      <Text className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </Text>
      <Text className="text-white text-base font-bold tabular-nums mt-1" numberOfLines={1}>
        {value}
      </Text>
      {sub ? (
        <Text className="text-[11px] font-semibold mt-0.5" style={{ color: '#2BD4A0' }} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/** "Próxima fatura" do primeiro cartão de crédito (dado útil no hero). */
function useNextInvoice(cards: CardRow[] | undefined) {
  const firstCredit = (cards ?? []).find((c) => c.kind === 'credit' && c.closing_day && c.due_day);
  const { invoice, total } = useCardInvoice(firstCredit ?? null);
  return firstCredit && invoice ? { card: firstCredit, invoice, total } : null;
}

export default function Banks() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { data: accounts, isLoading } = useAccounts();
  const { data: cards } = useCards();
  const { balanceOf, total, isLoading: loadingBalances } = useAccountBalances();
  const invest = useInvestments();
  const nextInvoice = useNextInvoice(cards);

  const list = accounts ?? [];
  const orphanCards = (cards ?? []).filter((c) => !c.account_id);
  const cardsOf = useMemo(
    () => (accountId: string) => (cards ?? []).filter((c) => c.account_id === accountId),
    [cards]
  );

  const investmentsPanel = (
    <Enter index={2}>
      <Link href="/investments" asChild>
        <PressableScale testID="invest-card">
          <Card className="p-5 hover:shadow-lg transition">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2.5">
                <View className="w-10 h-10 rounded-2xl bg-accent items-center justify-center">
                  <TrendingUp size={17} color={colors.primary} />
                </View>
                <View>
                  <Text className="text-sm font-bold text-foreground">Investimentos</Text>
                  <Text className="text-[11px] text-muted-foreground">
                    {invest.data.length === 0
                      ? 'Simule e veja render'
                      : `${invest.data.length} ${invest.data.length === 1 ? 'aplicação' : 'aplicações'}`}
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.placeholder} />
            </View>

            <Text className="text-2xl font-bold tabular-nums text-foreground">
              {formatCurrency(invest.totalValue)}
            </Text>
            {invest.totalYield > 0 && (
              <View className="flex-row items-center gap-1 mt-0.5">
                <ArrowUpRight size={12} color={colors.success} />
                <Text className="text-xs font-semibold text-success">
                  {formatCurrency(invest.totalYield)} de rendimento
                </Text>
              </View>
            )}

            {/* Top aplicações */}
            {invest.data.slice(0, 2).map((inv) => (
              <View key={inv.id} className="flex-row items-center justify-between mt-2.5 pt-2.5 border-t border-border/70">
                <Text className="text-xs font-medium text-foreground flex-1" numberOfLines={1}>
                  {inv.name}
                </Text>
                <Text className="text-xs font-bold tabular-nums text-foreground ml-2">
                  {formatCurrency(inv.currentValue)}
                </Text>
              </View>
            ))}
          </Card>
        </PressableScale>
      </Link>
    </Enter>
  );

  const banksGrid = (
    <View className={isDesktop ? 'flex-row flex-wrap gap-4' : 'gap-3'}>
      {list.map((a, i) => {
        const accountCards = cardsOf(a.id);
        const color = a.color ?? '#14181F';
        return (
          <Enter key={a.id} index={i + 3} className={isDesktop ? 'w-[calc(50%-8px)]' : ''}>
            <Link href={`/bank/${a.id}`} asChild>
              <PressableScale testID={`bank-${a.id}`}>
                <Card className="p-5 hover:shadow-lg transition overflow-hidden">
                  {/* Filete da cor do banco */}
                  <View
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: color }}
                  />
                  <View className="flex-row items-center gap-3.5">
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
                      <Text className="text-[11px] text-muted-foreground mt-0.5">
                        {ACCOUNT_TYPE_LABEL[a.type] ?? a.type}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={colors.placeholder} />
                  </View>

                  <View className="flex-row items-end justify-between mt-4">
                    <View>
                      <Text className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Saldo
                      </Text>
                      <Text
                        className={`text-xl font-bold tabular-nums ${
                          balanceOf(a.id) < 0 ? 'text-danger' : 'text-foreground'
                        }`}
                      >
                        {formatCurrency(balanceOf(a.id))}
                      </Text>
                    </View>
                    {/* Miniaturas dos cartões */}
                    {accountCards.length > 0 && (
                      <View className="flex-row items-center">
                        {accountCards.slice(0, 3).map((c, j) => (
                          <View
                            key={c.id}
                            className="w-8 h-5 rounded border border-white"
                            style={{
                              backgroundColor: c.color ?? '#14181F',
                              marginLeft: j > 0 ? -10 : 0,
                            }}
                          />
                        ))}
                        <Text className="text-[11px] text-muted-foreground ml-2">
                          {accountCards.length} {accountCards.length === 1 ? 'cartão' : 'cartões'}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              </PressableScale>
            </Link>
          </Enter>
        );
      })}
    </View>
  );

  return (
    <Screen className="bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10 lg:px-8"
        style={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[1120px] mx-auto">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-foreground">Bancos</Text>
            <Link href="/bank-new" asChild>
              <PressableScale
                className="flex-row items-center gap-1.5 bg-primary rounded-full px-4 py-2 hover:brightness-110 hover:shadow-lg hover:shadow-primary/25"
                testID="btn-add-bank"
              >
                <Plus color="#FFFFFF" size={15} />
                <Text className="text-primary-foreground font-semibold text-xs">Novo banco</Text>
              </PressableScale>
            </Link>
          </View>

          {/* Hero de vidro escuro, denso */}
          <Enter index={0}>
            <Glass tint="dark" className="p-6 mb-5">
              <View className={isDesktop ? 'flex-row items-center gap-8' : ''}>
                <View className={isDesktop ? 'w-[300px]' : ''}>
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
                    <Text className="text-white text-4xl font-bold tabular-nums" testID="total-balance">
                      {formatCurrency(total)}
                    </Text>
                  )}
                  <Text className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {list.length} {list.length === 1 ? 'conta' : 'contas'} ·{' '}
                    {(cards ?? []).length} {(cards ?? []).length === 1 ? 'cartão' : 'cartões'}
                  </Text>
                </View>

                {/* Tiles */}
                <View className={`flex-row gap-3 ${isDesktop ? 'flex-1' : 'mt-5'}`}>
                  <HeroTile
                    label="Investido"
                    value={formatCurrency(invest.totalValue)}
                    sub={invest.totalYield > 0 ? `+${formatCurrency(invest.totalYield)}` : undefined}
                  />
                  {nextInvoice ? (
                    <HeroTile
                      label={`Fatura · ${nextInvoice.card.name}`}
                      value={formatCurrency(nextInvoice.total)}
                      sub={`vence ${toBRShort(nextInvoice.invoice.dueDate)}`}
                    />
                  ) : (
                    <HeroTile label="Faturas" value="—" />
                  )}
                  {isDesktop && (
                    <HeroTile
                      label="Patrimônio"
                      value={formatCurrency(Math.round((total + invest.totalValue) * 100) / 100)}
                    />
                  )}
                </View>
              </View>
            </Glass>
          </Enter>

          {isLoading ? (
            <View className="py-16 items-center">
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : list.length === 0 ? (
            <Enter index={1}>
              <View className={isDesktop ? 'flex-row gap-5' : ''}>
                <Card className={`p-8 items-center ${isDesktop ? 'flex-1' : ''}`}>
                  <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-4">
                    <Landmark color={colors.primary} size={26} />
                  </View>
                  <Text className="text-lg font-bold text-foreground text-center">
                    Cadastre seu primeiro banco
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center mt-1.5 leading-5 max-w-[380px]">
                    Cada banco guarda o saldo da conta e os cartões (crédito e débito) que vivem
                    nele. A partir daí, faturas, limites e saldos se atualizam sozinhos.
                  </Text>
                  <Link href="/bank-new" asChild>
                    <PressableScale
                      className="mt-6 flex-row items-center gap-2 bg-primary rounded-full px-6 py-3 hover:brightness-110"
                      testID="btn-add-bank-empty"
                    >
                      <Plus color="#FFFFFF" size={18} />
                      <Text className="text-primary-foreground font-semibold text-sm">
                        Adicionar banco
                      </Text>
                    </PressableScale>
                  </Link>
                </Card>
                {isDesktop && <View className="w-[340px]">{investmentsPanel}</View>}
              </View>
            </Enter>
          ) : isDesktop ? (
            <View className="flex-row gap-5">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Suas contas
                </Text>
                {banksGrid}
              </View>
              <View className="w-[340px] gap-5">
                {investmentsPanel}
                {orphanCards.length > 0 && (
                  <Enter index={4}>
                    <Card className="overflow-hidden">
                      <View className="px-4 pt-4 pb-2 flex-row items-center gap-2">
                        <CalendarClock size={13} color={colors.warning} />
                        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Cartões sem banco
                        </Text>
                      </View>
                      {orphanCards.map((c, i) => (
                        <Link key={c.id} href={`/card/${c.id}`} asChild>
                          <PressableScale
                            className={`flex-row items-center gap-3 px-4 py-3 hover:bg-muted ${
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
                              </Text>
                              <Text className="text-[11px] text-muted-foreground">
                                Toque para vincular a um banco
                              </Text>
                            </View>
                            <ChevronRight size={15} color={colors.placeholder} />
                          </PressableScale>
                        </Link>
                      ))}
                    </Card>
                  </Enter>
                )}
              </View>
            </View>
          ) : (
            <>
              {investmentsPanel}
              <View className="mt-5">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Suas contas
                </Text>
                {banksGrid}
              </View>
              {orphanCards.length > 0 && (
                <View className="mt-6">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Cartões sem banco
                  </Text>
                  <Card className="overflow-hidden">
                    {orphanCards.map((c, i) => (
                      <Link key={c.id} href={`/card/${c.id}`} asChild>
                        <PressableScale
                          className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
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
                            </Text>
                            <Text className="text-[11px] text-muted-foreground">
                              Toque para vincular a um banco
                            </Text>
                          </View>
                          <ChevronRight size={15} color={colors.placeholder} />
                        </PressableScale>
                      </Link>
                    ))}
                  </Card>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
