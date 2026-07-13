// Aliases convenientes derivados do schema gerado automaticamente.
// O schema canônico vive em `database.generated.ts` — NÃO edite aquele arquivo à mão.
// Regerar após mudar o schema:
//   SUPABASE_ACCESS_TOKEN=... supabase gen types typescript --project-id nnowzgzpoobvdgkwrtoc > src/types/database.generated.ts

import type { Database } from './database.generated';

export type { Database };

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

// Enums
export type AccountType = Enums['account_type'];
export type CardKind = Enums['card_kind'];
export type EntryType = Enums['entry_type'];
export type CategoryKind = Enums['category_kind'];
export type TxnStatus = Enums['txn_status'];
export type TaskPriority = Enums['task_priority'];

// Linhas (Row)
export type Profile = Tables['profiles']['Row'];
export type Account = Tables['accounts']['Row'];
export type Card = Tables['cards']['Row'];
export type Category = Tables['categories']['Row'];
export type Transaction = Tables['transactions']['Row'];
export type Budget = Tables['budgets']['Row'];
export type Goal = Tables['goals']['Row'];
export type Task = Tables['tasks']['Row'];
export type CalendarEvent = Tables['events']['Row'];
export type InvoicePayment = Tables['invoice_payments']['Row'];
export type Investment = Tables['investments']['Row'];
export type InvestmentType = Enums['investment_type'];
export type AccountBalance = Database['public']['Views']['account_balances']['Row'];

// Inserts/Updates por tabela — SEMPRE use estes (vêm do schema gerado:
// colunas com default são opcionais, colunas geradas nem aparecem).
export type TableInsert<K extends keyof Tables> = Tables[K]['Insert'];
export type TableUpdate<K extends keyof Tables> = Tables[K]['Update'];
