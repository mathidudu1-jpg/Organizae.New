import { supabase } from '@/lib/supabase';
import type { InvoicePayment, TableInsert } from '@/types/database';

export type InvoicePaymentInsert = TableInsert<'invoice_payments'>;

export async function listInvoicePayments(
  cardId: string,
  monthRef: string
): Promise<InvoicePayment[]> {
  const { data, error } = await supabase
    .from('invoice_payments')
    .select('*')
    .eq('card_id', cardId)
    .eq('month_ref', monthRef)
    .order('paid_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createInvoicePayment(
  input: InvoicePaymentInsert
): Promise<InvoicePayment> {
  const { data, error } = await supabase
    .from('invoice_payments')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}
