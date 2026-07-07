import { supabase } from '@/lib/supabase';
import type { Card, TableInsert, TableUpdate } from '@/types/database';

export type CardInsert = TableInsert<'cards'>;
export type CardUpdate = TableUpdate<'cards'>;

export async function listCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCard(input: CardInsert): Promise<Card> {
  const { data, error } = await supabase.from('cards').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateCard(id: string, patch: CardUpdate): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Arquiva (não deleta — preserva o histórico de lançamentos). */
export async function archiveCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').update({ is_archived: true }).eq('id', id);
  if (error) throw error;
}
