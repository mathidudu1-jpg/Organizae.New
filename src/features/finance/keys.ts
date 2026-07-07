// Query keys centralizadas (React Query) — evita string solta espalhada.
export const financeKeys = {
  all: ['finance'] as const,
  // Raiz das listas — use em invalidateQueries (prefixo pega todos os meses).
  transactionsRoot: ['finance', 'transactions'] as const,
  transactions: (monthRef?: string) => ['finance', 'transactions', monthRef ?? 'all'] as const,
  transaction: (id: string) => ['finance', 'transaction', id] as const,
  accounts: () => ['finance', 'accounts'] as const,
  categories: () => ['finance', 'categories'] as const,
};
