import { Link } from 'expo-router';
import {
  ArrowDownRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Plus,
  Sparkle,
} from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import { CreditCardVisual } from '@/features/finance/components/CreditCardVisual';
import { useCardInvoice } from '@/features/finance/hooks/useCardInvoice';
import { useCards } from '@/features/finance/hooks/useCards';
import { formatCurrency } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { Card as CardRow } from '@/types/database';

const CARD_W = 180;
const CARD_GAP = 16;

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function monthName(monthRef: string): string {
  const [y, m] = monthRef.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
}

/** Detalhes da fatura aberta + transações do ciclo do cartão ativo. */
function InvoicePanel({ card }: { card: CardRow }) {
  const { invoice, transactions, total, limitAvailable, isLoading } = useCardInvoice(card);

  if (!invoice) {
    return (
      <Card className="p-6 items-center">
        <Text className="text-sm text-muted-foreground text-center">
          Cadastre fechamento e vencimento deste cartão para acompanhar a fatura.
        </Text>
      </Card>
    );
  }

  return (
    <View>
      {/* Fatura aberta */}
      <Card className="p-5">
        <View className="flex-row items-center gap-2 mb-1">
          <Sparkle size={13} color={colors.primary} />
          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Fatura aberta · {monthName(invoice.monthRef)}
          </Text>
        </View>
        <Text className="text-3xl font-bold text-foreground" testID="invoice-total">
          {formatCurrency(total)}
        </Text>

        <View className="h-px bg-border my-4" />

        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted-foreground">Vence em</Text>
            <Text className="text-sm font-semibold text-foreground" testID="invoice-due">
              {toBRShort(invoice.dueDate)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted-foreground">Melhor dia de compra</Text>
            <Text className="text-sm font-semibold text-foreground" testID="invoice-best">
              {toBRShort(invoice.bestBuyDate)}
            </Text>
          </View>
          {limitAvailable != null && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Limite restante</Text>
              <Text className="text-sm font-semibold text-primary" testID="invoice-limit">
                {formatCurrency(limitAvailable)}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Transações do ciclo */}
      <View className="flex-row items-center justify-between mt-6 mb-3">
        <Text className="text-base font-bold text-foreground">Transações</Text>
        <Text className="text-[11px] text-muted-foreground">
          {toBRShort(invoice.cycleStart)} – {toBRShort(invoice.cycleEnd)}
        </Text>
      </View>

      {isLoading ? (
        <View className="py-10 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (transactions ?? []).length === 0 ? (
        <Card className="p-6 items-center">
          <CalendarClock size={22} color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground mt-2 text-center">
            Nenhuma compra neste ciclo ainda.
          </Text>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {(transactions ?? []).map((t, i) => (
            <Link key={t.id} href={`/transaction/${t.id}`} asChild>
              <Pressable
                className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-muted ${
                  i > 0 ? 'border-t border-border' : ''
                }`}
              >
                <View className="w-9 h-9 rounded-xl items-center justify-center bg-danger/10">
                  <ArrowDownRight color={colors.danger} size={16} />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {t.description ?? 'Compra'}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5">
                    {toBRShort(t.date)}
                    {t.installment_total ? ` · ${t.installment_no}/${t.installment_total}` : ''}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-foreground">
                  {formatCurrency(t.amount)}
                </Text>
              </Pressable>
            </Link>
          ))}
        </Card>
      )}
    </View>
  );
}

export default function Cards() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { data: cards, isLoading } = useCards();
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const list = cards ?? [];
  const safeIdx = Math.min(activeIdx, Math.max(0, list.length - 1));
  const active = list[safeIdx] ?? null;

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, list.length - 1));
    setActiveIdx(clamped);
    scrollRef.current?.scrollTo({ x: clamped * (CARD_W + CARD_GAP), animated: true });
  };

  const carousel = useMemo(
    () => (
      <View>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 24, gap: CARD_GAP }}
          onMomentumScrollEnd={(e) =>
            setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / (CARD_W + CARD_GAP)))
          }
        >
          {list.map((c, i) => (
            <Pressable key={c.id} onPress={() => goTo(i)}>
              <CreditCardVisual card={c} width={CARD_W} dimmed={i !== safeIdx} />
            </Pressable>
          ))}
        </ScrollView>

        {/* legenda + navegação */}
        <View className="flex-row items-center justify-center gap-3 mt-4">
          {list.length > 1 && (
            <Pressable onPress={() => goTo(safeIdx - 1)} hitSlop={8}>
              <ChevronLeft size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
            {active ? `${active.name}${active.last4 ? ` · ${active.last4}` : ''}` : ''}
          </Text>
          {list.length > 1 && (
            <Pressable onPress={() => goTo(safeIdx + 1)} hitSlop={8}>
              <ChevronRight size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* dots */}
        {list.length > 1 && (
          <View className="flex-row justify-center gap-1.5 mt-2">
            {list.map((c, i) => (
              <Pressable
                key={c.id}
                onPress={() => goTo(i)}
                className={`h-1.5 rounded-full ${
                  i === safeIdx ? 'w-4 bg-primary' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </View>
        )}
      </View>
    ),
    [list, safeIdx, active]
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="pb-10"
        style={{ paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[960px] mx-auto">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 mb-6">
            <Text className="text-xl font-bold text-foreground">Cartões</Text>
            <Link href="/card-new" asChild>
              <Pressable
                className="flex-row items-center gap-1.5 bg-primary rounded-full px-4 py-2 active:opacity-90"
                testID="btn-add-card"
              >
                <Plus color="#FFFFFF" size={15} />
                <Text className="text-primary-foreground font-semibold text-xs">Novo cartão</Text>
              </Pressable>
            </Link>
          </View>

          {isLoading ? (
            <View className="py-24 items-center">
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : list.length === 0 ? (
            <View className="px-5">
              <Card className="p-8 items-center">
                <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-4">
                  <CreditCard color={colors.primary} size={26} />
                </View>
                <Text className="text-lg font-bold text-foreground text-center">
                  Seus cartões, sob controle
                </Text>
                <Text className="text-sm text-muted-foreground text-center mt-1.5 leading-5">
                  Cadastre um cartão com fechamento e vencimento pra acompanhar a fatura em tempo
                  real.
                </Text>
                <Link href="/card-new" asChild>
                  <Pressable
                    className="mt-6 flex-row items-center gap-2 bg-primary rounded-full px-6 py-3 active:opacity-90"
                    testID="btn-add-card-empty"
                  >
                    <Plus color="#FFFFFF" size={18} />
                    <Text className="text-primary-foreground font-semibold text-sm">
                      Adicionar cartão
                    </Text>
                  </Pressable>
                </Link>
              </Card>
            </View>
          ) : isDesktop ? (
            /* Desktop: carrossel à esquerda, fatura à direita */
            <View className="flex-row gap-8 px-5">
              <View className="w-[340px]">{carousel}</View>
              <View className="flex-1">{active && <InvoicePanel card={active} />}</View>
            </View>
          ) : (
            /* Mobile: empilhado */
            <View>
              {carousel}
              <View className="px-5 mt-6">{active && <InvoicePanel card={active} />}</View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
