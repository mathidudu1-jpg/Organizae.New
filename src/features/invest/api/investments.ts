import { supabase } from '@/lib/supabase';
import type { Investment, TableInsert } from '@/types/database';

export type InvestmentInsert = TableInsert<'investments'>;

export async function listInvestments(): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createInvestment(input: InvestmentInsert): Promise<Investment> {
  const { data, error } = await supabase.from('investments').insert(input).select().single();
  if (error) throw error;
  return data;
}

/** Resgate simulado: arquiva (histórico preservado). */
export async function archiveInvestment(id: string): Promise<void> {
  const { error } = await supabase.from('investments').update({ is_archived: true }).eq('id', id);
  if (error) throw error;
}
