import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createAccount, listAccounts, type AccountInsert } from '../api/accounts';
import { financeKeys } from '../keys';

export function useAccounts() {
  return useQuery({
    queryKey: financeKeys.accounts(),
    queryFn: listAccounts,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AccountInsert) => createAccount(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.accounts() }),
  });
}
