import { supabase } from '@/lib/supabase';
import type { CalendarEvent, TableInsert } from '@/types/database';

export type EventInsert = TableInsert<'events'>;

/** Próximos compromissos a partir de uma data (inclusive). */
export async function listUpcomingEvents(fromDate: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', fromDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function createEvent(input: EventInsert): Promise<CalendarEvent> {
  const { data, error } = await supabase.from('events').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
