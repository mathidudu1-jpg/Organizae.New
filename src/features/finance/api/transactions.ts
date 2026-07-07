import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate, Transaction } from '@/types/database';

// Tipos gerados do schema: colunas com default (user_id, currency, status…)
// são opcionais; month_ref (coluna gerada) nem aparece.
export type TransactionInsert = TableInsert<'transactions'>;
export type TransactionUpdate = TableUpdate<'transactions'>;

export async function getTransaction(id: string): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

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
