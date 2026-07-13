import { Link } from 'expo-router';
import {
  ArrowDownRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Plus,
} from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
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

import { Button, Card } from '@/components/ui';
import { CreditCardVisual } from '@/features/finance/components/CreditCardVisual';
import {
  useCardInvoice,
  useCreateInvoicePayment,
} from '@/features/finance/hooks/useCardInvoice';
import { useCards } from '@/features/finance/hooks/useCards';
import { addMonthsToMonthRef } from '@/features/finance/lib/invoice';
import { formatCurrency, todayISO } from '@/lib/format';
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

const STATUS_UI = {
  upcoming: { label: 'Futura', cls: 'bg-muted text-muted-foreground' },
  open: { label: 'Aberta', cls: 'bg-accent text-primary' },
  closed: { label: 'Fechada', cls: 'bg-warning/15 text-warning' },
  overdue: { label: 'Vencida', cls: 'bg-danger/10 text-danger' },
  paid: { label: 'Paga', cls: 'bg-success/10 text-success' },
} as const;

/** Fatura do cartão ativo com navegação entre meses, status e pagamento. */
function InvoicePanel({ card }: { card: CardRow }) {
  // offset em meses a partir da fatura aberta (0 = atual)
  const [offset, setOffset] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payRaw, setPayRaw] = useState('');
  const [payError, setPayError] = useState<string | null>(null);

  const open = useCardInvoice(card); // fatura aberta (referência do offset)
  const browsedRef = open.invoice
    ? addMonthsToMonthRef(open.invoice.monthRef, offset)
    : undefined;
  const { invoice, status, transactions, total, paid, remaining, limitAvailable, isLoading } =
    useCardInvoice(card, offset === 0 ? undefined : browsedRef);
  const createPayment = useCreateInvoicePayment();

  if (!invoice || !status) {
    return (
      <Card className="p-6 items-center">
        <Text className="text-sm text-muted-foreground text-center">
          Cadastre fechamento e vencimento deste cartão para acompanhar a fatura.
        </Text>
      </Card>
    );
  }

  const statusUi = STATUS_UI[status];

  const submitPayment = async () => {
    setPayError(null);
    const parsed = payRaw.trim()
      ? Number(payRaw.replace(/\./g, '').replace(',', '.'))
      : remaining;
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setPayError('Valor inválido.');
      return;
    }
    try {
      await createPayment.mutateAsync({
        card_id: card.id,
        month_ref: invoice.monthRef,
        amount: Math.round(parsed * 100) / 100,
        paid_at: todayISO(),
      });
      setPaying(false);
      setPayRaw('');
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Não foi possível registrar.');
    }
  };

  return (
    <View>
      {/* Fatura */}
      <Card className="p-5">
        {/* Navegação de meses + status */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => setOffset((o) => o - 1)}
              hitSlop={8}
              className="w-7 h-7 rounded-full items-center justify-center active:bg-muted"
              testID="invoice-prev"
            >
              <ChevronLeft size={15} color={colors.mutedForeground} />
            </Pressable>
            <Text
              className="text-sm font-bold text-foreground capitalize min-w-[110px] text-center"
              testID="invoice-month"
            >
              {monthName(invoice.monthRef)}
            </Text>
            <Pressable
              onPress={() => setOffset((o) => o + 1)}
              hitSlop={8}
              className="w-7 h-7 rounded-full items-center justify-center active:bg-muted"
              testID="invoice-next"
            >
              <ChevronRight size={15} color={colors.mutedForeground} />
            </Pressable>
            {offset !== 0 && (
              <Pressable onPress={() => setOffset(0)} hitSlop={8} testID="invoice-today">
                <Text className="text-[11px] text-primary font-semibold ml-1">atual</Text>
              </Pressable>
            )}
          </View>
          <View className={`px-2.5 py-1 rounded-full ${statusUi.cls.split(' ')[0]}`}>
            <Text
              className={`text-[10px] font-bold uppercase tracking-wide ${statusUi.cls.split(' ')[1]}`}
              testID="invoice-status"
            >
              {statusUi.label}
            </Text>
          </View>
        </View>

        <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Total da fatura
        </Text>
        <Text className="text-3xl font-bold text-foreground" testID="invoice-total">
          {formatCurrency(total)}
        </Text>
        {paid > 0 && (
          <Text className="text-xs text-success mt-1" testID="invoice-paid">
            {formatCurrency(paid)} pago{remaining > 0 ? ` · falta ${formatCurrency(remaining)}` : ''}
          </Text>
        )}

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

        {/* Pagamento */}
        {remaining > 0 && status !== 'open' && (
          <View className="mt-4">
            {!paying ? (
              <Button
                title="Registrar pagamento"
                size="sm"
                onPress={() => setPaying(true)}
                testID="btn-pay"
              />
            ) : (
              <View className="rounded-2xl bg-muted/60 p-3">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Valor pago (padrão: {formatCurrency(remaining)})
                </Text>
                <View className="flex-row gap-2">
                  <View className="flex-1 h-10 rounded-xl bg-surface border border-border px-3 justify-center">
                    <TextInput
                      className="text-foreground text-sm"
                      placeholder={String(remaining).replace('.', ',')}
                      placeholderTextColor={colors.placeholder}
                      keyboardType="decimal-pad"
                      value={payRaw}
                      onChangeText={setPayRaw}
                      testID="pay-amount"
                    />
                  </View>
                  <Button
                    title="Confirmar"
                    size="sm"
                    loading={createPayment.isPending}
                    onPress={submitPayment}
                    testID="btn-pay-confirm"
                  />
                </View>
                {payError ? <Text className="text-danger text-xs mt-2">{payError}</Text> : null}
              </View>
            )}
          </View>
        )}
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
              <View className="flex-1">{active && <InvoicePanel key={active.id} card={active} />}</View>
            </View>
          ) : (
            /* Mobile: empilhado */
            <View>
              {carousel}
              <View className="px-5 mt-6">{active && <InvoicePanel key={active.id} card={active} />}</View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
