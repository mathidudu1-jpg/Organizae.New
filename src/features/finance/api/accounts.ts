import { supabase } from '@/lib/supabase';
import type { Account, Insert, Update } from '@/types/database';

export type AccountInsert = Insert<Account>;
export type AccountUpdate = Update<Account>;

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
