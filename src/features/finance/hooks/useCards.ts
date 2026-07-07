import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { archiveCard, createCard, listCards, updateCard, type CardInsert, type CardUpdate } from '../api/cards';
import { financeKeys } from '../keys';

export function useCards() {
  return useQuery({
    queryKey: financeKeys.cards(),
    queryFn: listCards,
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CardInsert) => createCard(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.cards() }),
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CardUpdate }) => updateCard(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.cards() }),
  });
}

export function useArchiveCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.cards() }),
  });
}
