import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { todayISO } from '@/lib/format';
import type { Card, InvoicePayment, Transaction } from '@/types/database';

import {
  createInvoicePayment,
  listInvoicePayments,
  type InvoicePaymentInsert,
} from '../api/invoice-payments';
import { listCardTransactions } from '../api/transactions';
import {
  invoiceForMonth,
  invoiceStatus,
  openInvoice,
  type Invoice,
  type InvoiceStatus,
} from '../lib/invoice';
import { financeKeys } from '../keys';

export interface CardInvoiceData {
  /** Config incompleta (sem fechamento/vencimento) → null. */
  invoice: Invoice | null;
  status: InvoiceStatus | null;
  transactions: Transaction[] | undefined;
  payments: InvoicePayment[] | undefined;
  /** Soma das compras do ciclo. */
  total: number;
  /** Soma dos pagamentos registrados para a fatura. */
  paid: number;
  /** Quanto falta pagar. */
  remaining: number;
  /** credit_limit − fatura ABERTA (null sem limite ou fora da fatura aberta). */
  limitAvailable: number | null;
  isLoading: boolean;
}

/**
 * Fatura de um cartão. Sem `monthRef`, a fatura ABERTA hoje;
 * com `monthRef` (YYYY-MM-01), a fatura daquele mês (passada ou futura).
 */
export function useCardInvoice(
  card: Card | null | undefined,
  monthRef?: string
): CardInvoiceData {
  const hasCycle = !!card?.closing_day && !!card?.due_day;
  const today = todayISO();

  const invoice = useMemo(() => {
    if (!card || !hasCycle) return null;
    const config = { closingDay: card.closing_day!, dueDay: card.due_day! };
    return monthRef ? invoiceForMonth(monthRef, config) : openInvoice(today, config);
  }, [card, hasCycle, monthRef, today]);

  const txQuery = useQuery({
    queryKey: financeKeys.cardInvoice(
      card?.id ?? '',
      invoice?.cycleStart ?? '',
      invoice?.cycleEnd ?? ''
    ),
    queryFn: () => listCardTransactions(card!.id, invoice!.cycleStart, invoice!.cycleEnd),
    enabled: !!card && !!invoice,
  });

  const payQuery = useQuery({
    queryKey: financeKeys.invoicePayments(card?.id ?? '', invoice?.monthRef ?? ''),
    queryFn: () => listInvoicePayments(card!.id, invoice!.monthRef),
    enabled: !!card && !!invoice,
  });

  const total = useMemo(
    () =>
      (txQuery.data ?? [])
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [txQuery.data]
  );

  const paid = useMemo(
    () => (payQuery.data ?? []).reduce((sum, p) => sum + p.amount, 0),
    [payQuery.data]
  );

  const status = invoice ? invoiceStatus(invoice, today, total, paid) : null;
  const isOpenInvoice = !!invoice && status === 'open';
  const limitAvailable =
    card?.credit_limit != null && isOpenInvoice
      ? Math.max(0, card.credit_limit - total)
      : null;

  return {
    invoice,
    status,
    transactions: txQuery.data,
    payments: payQuery.data,
    total,
    paid,
    remaining: Math.max(0, Math.round((total - paid) * 100) / 100),
    limitAvailable,
    isLoading: (txQuery.isLoading || payQuery.isLoading) && !!card && !!invoice,
  };
}

export function useCreateInvoicePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InvoicePaymentInsert) => createInvoicePayment(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.invoicePaymentsRoot }),
  });
}
