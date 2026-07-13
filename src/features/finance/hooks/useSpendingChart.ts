import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { currentMonthRef, todayISO } from '@/lib/format';

import { listExpensesSince } from '../api/transactions';
import { addMonthsToMonthRef } from '../lib/invoice';

export type ChartPeriod = 'week' | 'month' | 'year';

export interface ChartPoint {
  key: string;
  label: string;
  total: number;
  /** Presente só no período 'month' — permite selecionar o mês na Home. */
  monthRef?: string;
  isCurrent: boolean;
}

function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function weekdayShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
    .slice(0, 3);
}

function monthShort(monthRef: string): string {
  const [y, m] = monthRef.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

/** Gastos agregados para o gráfico "Meus Gastos" (semana/mês/ano). */
export function useSpendingChart(period: ChartPeriod): {
  data: ChartPoint[];
  isLoading: boolean;
} {
  const today = todayISO();
  const current = currentMonthRef();

  const from =
    period === 'week'
      ? addDaysISO(today, -6)
      : period === 'month'
        ? addMonthsToMonthRef(current, -5)
        : `${Number(today.slice(0, 4)) - 4}-01-01`;

  const query = useQuery({
    // Sob o prefixo 'finance','transactions' → invalidações existentes cobrem.
    queryKey: ['finance', 'transactions', 'spending', period, from],
    queryFn: () => listExpensesSince(from),
  });

  const data = useMemo<ChartPoint[]>(() => {
    const rows = query.data ?? [];

    if (period === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const day = addDaysISO(today, i - 6);
        const total = rows.filter((r) => r.date === day).reduce((s, r) => s + r.amount, 0);
        return { key: day, label: weekdayShort(day), total, isCurrent: day === today };
      });
    }

    if (period === 'year') {
      const thisYear = Number(today.slice(0, 4));
      return Array.from({ length: 5 }, (_, i) => {
        const year = String(thisYear - 4 + i);
        const total = rows
          .filter((r) => r.date.startsWith(year))
          .reduce((s, r) => s + r.amount, 0);
        return { key: year, label: year, total, isCurrent: year === String(thisYear) };
      });
    }

    // month: últimos 6 meses
    return Array.from({ length: 6 }, (_, i) => {
      const ref = addMonthsToMonthRef(current, i - 5);
      const total = rows.filter((r) => r.month_ref === ref).reduce((s, r) => s + r.amount, 0);
      return {
        key: ref,
        label: monthShort(ref),
        total,
        monthRef: ref,
        isCurrent: ref === current,
      };
    });
  }, [query.data, period, today, current]);

  return { data, isLoading: query.isLoading };
}
