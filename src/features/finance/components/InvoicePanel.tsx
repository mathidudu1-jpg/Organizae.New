import { Link } from 'expo-router';
import { ArrowDownRight, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { Button, Card, Chip } from '@/components/ui';
import { useAccounts } from '@/features/finance/hooks/useAccounts';
import {
  useCardInvoice,
  useCreateInvoicePayment,
} from '@/features/finance/hooks/useCardInvoice';
import { addMonthsToMonthRef } from '@/features/finance/lib/invoice';
import { formatCurrency, todayISO } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { Card as CardRow } from '@/types/database';

const STATUS_UI = {
  upcoming: { label: 'Futura', box: 'bg-muted', text: 'text-muted-foreground' },
  open: { label: 'Aberta', box: 'bg-accent', text: 'text-primary' },
  closed: { label: 'Fechada', box: 'bg-warning/15', text: 'text-warning' },
  overdue: { label: 'Vencida', box: 'bg-danger/10', text: 'text-danger' },
  paid: { label: 'Paga', box: 'bg-success/10', text: 'text-success' },
} as const;

function toBRShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function monthName(monthRef: string): string {
  const [y, m] = monthRef.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
}

/** Fatura de um cartão de CRÉDITO: navegação entre meses, status, pagamento. */
export function InvoicePanel({ card }: { card: CardRow }) {
  const [offset, setOffset] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payRaw, setPayRaw] = useState('');
  const [payAccountId, setPayAccountId] = useState<string | null>(card.account_id);
  const [payError, setPayError] = useState<string | null>(null);

  const { data: accounts } = useAccounts();
  const open = useCardInvoice(card);
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
        account_id: payAccountId,
      });
      setPaying(false);
      setPayRaw('');
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Não foi possível registrar.');
    }
  };

  return (
    <View>
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
              className="text-sm font-bold text-foreground capitalize min-w-[100px] text-center"
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
          <View className={`px-2.5 py-1 rounded-full ${statusUi.box}`}>
            <Text
              className={`text-[10px] font-bold uppercase tracking-wide ${statusUi.text}`}
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
            {formatCurrency(paid)} pago
            {remaining > 0 ? ` · falta ${formatCurrency(remaining)}` : ''}
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
            <Text className="text-sm font-semibold text-foreground">
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
        {remaining > 0 && status !== 'open' && status !== 'upcoming' && (
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
                  Valor (padrão: {formatCurrency(remaining)})
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
                {(accounts ?? []).length > 0 && (
                  <View className="mt-2.5">
                    <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Debitar de
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      <Chip
                        label="Nenhuma conta"
                        selected={payAccountId === null}
                        onPress={() => setPayAccountId(null)}
                      />
                      {(accounts ?? []).map((a) => (
                        <Chip
                          key={a.id}
                          label={a.name}
                          selected={payAccountId === a.id}
                          onPress={() => setPayAccountId(a.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}
                {payError ? <Text className="text-danger text-xs mt-2">{payError}</Text> : null}
              </View>
            )}
          </View>
        )}
      </Card>

      {/* Transações do ciclo */}
      <View className="flex-row items-center justify-between mt-5 mb-3">
        <Text className="text-base font-bold text-foreground">Transações</Text>
        <Text className="text-[11px] text-muted-foreground">
          {toBRShort(invoice.cycleStart)} – {toBRShort(invoice.cycleEnd)}
        </Text>
      </View>

      {isLoading ? (
        <View className="py-8 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (transactions ?? []).length === 0 ? (
        <Card className="p-6 items-center">
          <CalendarClock size={22} color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground mt-2 text-center">
            Nenhuma compra neste ciclo.
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
