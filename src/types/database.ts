// Tipos do banco (Supabase / Postgres).
// Escritos à mão a partir das migrations em supabase/migrations.
// Regenerar com: supabase gen types typescript --project-id <ref> (precisa de access token)
// Obs: usamos `type` (não `interface`) porque o supabase-js exige que os Row sejam
// atribuíveis a Record<string, unknown> — interfaces não são (falta index signature).

export type AccountType = 'checking' | 'savings' | 'wallet' | 'cash' | 'investment' | 'other';
export type EntryType = 'income' | 'expense' | 'transfer';
export type CategoryKind = 'income' | 'expense';
export type TxnStatus = 'pending' | 'cleared';
export type TaskPriority = 'low' | 'medium' | 'high';

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Profile = Timestamps & {
  id: string;
  name: string | null;
  avatar_url: string | null;
  currency: string;
  locale: string;
};

export type Account = Timestamps & {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  institution: string | null;
  color: string | null;
  initial_balance: number;
  currency: string;
  is_archived: boolean;
};

export type Card = Timestamps & {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  brand: string | null;
  last4: string | null;
  credit_limit: number | null;
  closing_day: number | null;
  due_day: number | null;
  color: string | null;
  is_archived: boolean;
};

export type Category = Timestamps & {
  id: string;
  user_id: string;
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  sort_order: number;
};

export type Transaction = Timestamps & {
  id: string;
  user_id: string;
  type: EntryType;
  amount: number;
  currency: string;
  description: string | null;
  notes: string | null;
  date: string; // YYYY-MM-DD (date, sem timezone)
  month_ref: string; // gerada (primeiro dia do mês)
  account_id: string | null;
  card_id: string | null;
  category_id: string | null;
  transfer_account_id: string | null;
  status: TxnStatus;
  installment_group: string | null;
  installment_no: number | null;
  installment_total: number | null;
  is_recurring: boolean;
  recurrence: string | null;
};

export type Budget = Timestamps & {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  month_ref: string;
};

export type Goal = Timestamps & {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  due_date: string | null;
  color: string | null;
  is_archived: boolean;
};

export type Task = Timestamps & {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: TaskPriority;
  is_completed: boolean;
  completed_at: string | null;
};

export type CalendarEvent = Timestamps & {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  date: string;
  time: string | null;
  end_time: string | null;
  location: string | null;
  color: string | null;
  is_completed: boolean;
};

// Colunas gerenciadas pelo servidor (não enviadas no insert do cliente).
type Managed = 'id' | 'user_id' | 'created_at' | 'updated_at';

export type Insert<T> = Omit<T, Managed>;
export type Update<T> = Partial<Insert<T>>;

// Shape de tabela que o supabase-js espera (inclui Relationships).
type Table<Row, Ins, Upd> = {
  Row: Row;
  Insert: Ins;
  Update: Upd;
  Relationships: [];
};

// Formato compatível com createClient<Database> do supabase-js.
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Partial<Profile> & { id: string }, Partial<Profile>>;
      accounts: Table<Account, Insert<Account>, Update<Account>>;
      cards: Table<Card, Insert<Card>, Update<Card>>;
      categories: Table<Category, Insert<Category>, Update<Category>>;
      transactions: Table<Transaction, Omit<Insert<Transaction>, 'month_ref'>, Update<Transaction>>;
      budgets: Table<Budget, Insert<Budget>, Update<Budget>>;
      goals: Table<Goal, Insert<Goal>, Update<Goal>>;
      tasks: Table<Task, Insert<Task>, Update<Task>>;
      events: Table<CalendarEvent, Insert<CalendarEvent>, Update<CalendarEvent>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      account_type: AccountType;
      entry_type: EntryType;
      category_kind: CategoryKind;
      txn_status: TxnStatus;
      task_priority: TaskPriority;
    };
    CompositeTypes: Record<string, never>;
  };
};
