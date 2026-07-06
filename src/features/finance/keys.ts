// Query keys centralizadas (React Query) — evita string solta espalhada.
export const financeKeys = {
  all: ['finance'] as const,
  transactions: (monthRef?: string) => ['finance', 'transactions', monthRef ?? 'all'] as const,
  accounts: () => ['finance', 'accounts'] as const,
  categories: () => ['finance', 'categories'] as const,
};
