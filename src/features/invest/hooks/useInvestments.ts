import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { todayISO } from '@/lib/format';
import type { Investment } from '@/types/database';

import {
  archiveInvestment,
  createInvestment,
  listInvestments,
  type InvestmentInsert,
} from '../api/investments';
import { simulatedValue } from '../lib/simulate';

const investKeys = {
  all: ['invest'] as const,
  list: () => ['invest', 'list'] as const,
};

export interface InvestmentWithValue extends Investment {
  currentValue: number;
  yieldValue: number;
}

export function useInvestments(): {
  data: InvestmentWithValue[];
  totalPrincipal: number;
  totalValue: number;
  totalYield: number;
  isLoading: boolean;
} {
  const query = useQuery({
    queryKey: investKeys.list(),
    queryFn: listInvestments,
  });

  const today = todayISO();

  const data = useMemo<InvestmentWithValue[]>(
    () =>
      (query.data ?? []).map((inv) => {
        const currentValue = simulatedValue(
          { principal: inv.principal, rateKind: inv.rate_kind, rate: inv.rate },
          inv.start_date,
          today
        );
        return {
          ...inv,
          currentValue,
          yieldValue: Math.round((currentValue - inv.principal) * 100) / 100,
        };
      }),
    [query.data, today]
  );

  const totalPrincipal = data.reduce((s, i) => s + i.principal, 0);
  const totalValue = Math.round(data.reduce((s, i) => s + i.currentValue, 0) * 100) / 100;

  return {
    data,
    totalPrincipal,
    totalValue,
    totalYield: Math.round((totalValue - totalPrincipal) * 100) / 100,
    isLoading: query.isLoading,
  };
}

export function useCreateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InvestmentInsert) => createInvestment(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: investKeys.all }),
  });
}

export function useArchiveInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveInvestment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: investKeys.all }),
  });
}
