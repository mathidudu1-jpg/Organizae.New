import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { currentMonthRef } from '@/lib/format';

import { listExpensesSince } from '../api/transactions';
import { addMonthsToMonthRef } from '../lib/invoice';

export interface MonthSpend {
  monthRef: string; // YYYY-MM-01
  total: number;
}

/** Gastos por mês nos últimos `months` meses (inclui o atual). */
export function useMonthlySpending(months = 6): {
  data: MonthSpend[];
  isLoading: boolean;
} {
  const current = currentMonthRef();
  const from = addMonthsToMonthRef(current, -(months - 1));

  const query = useQuery({
    // Fica sob o prefixo 'finance','transactions' → invalidações existentes cobrem.
    queryKey: ['finance', 'transactions', 'spending', from],
    queryFn: () => listExpensesSince(from),
  });

  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (let i = 0; i < months; i++) {
      totals.set(addMonthsToMonthRef(from, i), 0);
    }
    for (const t of query.data ?? []) {
      const ref = t.month_ref;
      if (ref && totals.has(ref)) {
        totals.set(ref, (totals.get(ref) ?? 0) + t.amount);
      }
    }
    return [...totals.entries()].map(([monthRef, total]) => ({ monthRef, total }));
  }, [query.data, from, months]);

  return { data, isLoading: query.isLoading };
}
