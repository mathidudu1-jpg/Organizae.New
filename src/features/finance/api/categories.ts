import { supabase } from '@/lib/supabase';
import type { Category, Insert } from '@/types/database';

export type CategoryInsert = Insert<Category>;

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: CategoryInsert): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert(input).select().single();
  if (error) throw error;
  return data;
}
