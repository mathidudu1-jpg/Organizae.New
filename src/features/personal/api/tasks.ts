import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate, Task } from '@/types/database';

export type TaskInsert = TableInsert<'tasks'>;
export type TaskUpdate = TableUpdate<'tasks'>;

/** Pendentes primeiro (por prazo), concluídas por último (mais recentes primeiro). */
export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('is_completed', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(input: TaskInsert): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, patch: TaskUpdate): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}
