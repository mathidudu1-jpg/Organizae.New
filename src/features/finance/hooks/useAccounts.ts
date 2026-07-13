import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  archiveAccount,
  createAccount,
  listAccountBalances,
  listAccounts,
  updateAccount,
  type AccountInsert,
  type AccountUpdate,
} from '../api/accounts';
import { financeKeys } from '../keys';

export function useAccounts() {
  return useQuery({
    queryKey: financeKeys.accounts(),
    queryFn: listAccounts,
  });
}

/** Saldos derivados: Map account_id → saldo, e o total geral. */
export function useAccountBalances(): {
  balanceOf: (accountId: string) => number;
  total: number;
  isLoading: boolean;
} {
  const query = useQuery({
    queryKey: financeKeys.accountBalances(),
    queryFn: listAccountBalances,
  });

  const map = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of query.data ?? []) {
      if (row.account_id) m.set(row.account_id, row.balance ?? 0);
    }
    return m;
  }, [query.data]);

  const total = useMemo(() => [...map.values()].reduce((s, v) => s + v, 0), [map]);

  return {
    balanceOf: (accountId: string) => map.get(accountId) ?? 0,
    total,
    isLoading: query.isLoading,
  };
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AccountInsert) => createAccount(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AccountUpdate }) => updateAccount(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
  });
}

export function useArchiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
  });
}
