import { supabase } from '@/lib/supabase';
import type { Insert, Transaction, Update } from '@/types/database';

// user_id e month_ref são preenchidos pelo banco (default auth.uid() / coluna gerada).
export type TransactionInsert = Omit<Insert<Transaction>, 'month_ref'>;
export type TransactionUpdate = Update<Transaction>;

export async function listTransactions(monthRef?: string): Promise<Transaction[]> {
  let query = supabase.from('transactions').select('*').order('date', { ascending: false });
  if (monthRef) query = query.eq('month_ref', monthRef);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createTransaction(input: TransactionInsert): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, patch: TransactionUpdate): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}
