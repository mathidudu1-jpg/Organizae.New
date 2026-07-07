import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { todayISO } from '@/lib/format';
import type { Card } from '@/types/database';

import { listCardTransactions } from '../api/transactions';
import { openInvoice, type Invoice } from '../lib/invoice';
import { financeKeys } from '../keys';

export interface CardInvoiceData {
  /** Config incompleta (sem fechamento/vencimento) → null. */
  invoice: Invoice | null;
  transactions: ReturnType<typeof useQuery<Awaited<ReturnType<typeof listCardTransactions>>>>['data'];
  /** Soma das saídas do ciclo (a fatura em si). */
  total: number;
  /** credit_limit − fatura aberta (null se sem limite cadastrado). */
  limitAvailable: number | null;
  isLoading: boolean;
}

/** Fatura ABERTA de um cartão: ciclo derivado do motor + compras do período. */
export function useCardInvoice(card: Card | null | undefined): CardInvoiceData {
  const hasCycle = !!card?.closing_day && !!card?.due_day;

  const invoice = useMemo(() => {
    if (!card || !hasCycle) return null;
    return openInvoice(todayISO(), {
      closingDay: card.closing_day!,
      dueDay: card.due_day!,
    });
  }, [card, hasCycle]);

  const query = useQuery({
    queryKey: financeKeys.cardInvoice(
      card?.id ?? '',
      invoice?.cycleStart ?? '',
      invoice?.cycleEnd ?? ''
    ),
    queryFn: () => listCardTransactions(card!.id, invoice!.cycleStart, invoice!.cycleEnd),
    enabled: !!card && !!invoice,
  });

  const total = useMemo(
    () =>
      (query.data ?? [])
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [query.data]
  );

  const limitAvailable =
    card?.credit_limit != null ? Math.max(0, card.credit_limit - total) : null;

  return {
    invoice,
    transactions: query.data,
    total,
    limitAvailable,
    isLoading: query.isLoading && !!card && !!invoice,
  };
}
