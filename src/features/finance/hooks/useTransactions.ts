import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
  type TransactionInsert,
  type TransactionUpdate,
} from '../api/transactions';
import { financeKeys } from '../keys';

export function useTransactions(monthRef?: string) {
  return useQuery({
    queryKey: financeKeys.transactions(monthRef),
    queryFn: () => listTransactions(monthRef),
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: financeKeys.transaction(id ?? ''),
    queryFn: () => getTransaction(id!),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInsert) => createTransaction(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TransactionUpdate }) =>
      updateTransaction(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: (_data, id) => {
      // A linha não existe mais: remover do cache (refetch daria erro),
      // e só então invalidar as listas.
      qc.removeQueries({ queryKey: financeKeys.transaction(id) });
      qc.invalidateQueries({ queryKey: financeKeys.transactionsRoot });
    },
  });
}
