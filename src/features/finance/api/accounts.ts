import { supabase } from '@/lib/supabase';
import type { Account, AccountBalance, TableInsert, TableUpdate } from '@/types/database';

export type AccountInsert = TableInsert<'accounts'>;
export type AccountUpdate = TableUpdate<'accounts'>;

/** Saldos derivados por conta (view account_balances). */
export async function listAccountBalances(): Promise<AccountBalance[]> {
  const { data, error } = await supabase.from('account_balances').select('*');
  if (error) throw error;
  return data ?? [];
}

/** Arquiva (não deleta — preserva o histórico). */
export async function archiveAccount(id: string): Promise<void> {
  const { error } = await supabase.from('accounts').update({ is_archived: true }).eq('id', id);
  if (error) throw error;
}

export async function listAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createAccount(input: AccountInsert): Promise<Account> {
  const { data, error } = await supabase.from('accounts').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateAccount(id: string, patch: AccountUpdate): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
