// Query keys centralizadas (React Query) — evita string solta espalhada.
export const financeKeys = {
  all: ['finance'] as const,
  // Raiz das listas — use em invalidateQueries (prefixo pega todos os meses).
  transactionsRoot: ['finance', 'transactions'] as const,
  transactions: (monthRef?: string) => ['finance', 'transactions', monthRef ?? 'all'] as const,
  transaction: (id: string) => ['finance', 'transaction', id] as const,
  accounts: () => ['finance', 'accounts'] as const,
  accountBalances: () => ['finance', 'account-balances'] as const,
  categories: () => ['finance', 'categories'] as const,
  cards: () => ['finance', 'cards'] as const,
  cardInvoice: (cardId: string, from: string, to: string) =>
    ['finance', 'transactions', 'card', cardId, from, to] as const,
  invoicePayments: (cardId: string, monthRef: string) =>
    ['finance', 'invoice-payments', cardId, monthRef] as const,
  invoicePaymentsRoot: ['finance', 'invoice-payments'] as const,
};
