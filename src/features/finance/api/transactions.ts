import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate, Transaction } from '@/types/database';

import {
  installmentAmounts,
  installmentSlots,
  type CardCycleConfig,
} from '../lib/invoice';

// Tipos gerados do schema: colunas com default (user_id, currency, status…)
// são opcionais; month_ref (coluna gerada) nem aparece.
export type TransactionInsert = TableInsert<'transactions'>;
export type TransactionUpdate = TableUpdate<'transactions'>;

function uuidv4(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  // Fallback (agrupamento, não segurança)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export interface InstallmentPurchaseInput {
  /** Valor TOTAL da compra (será dividido nas parcelas). */
  amount: number;
  description: string;
  /** Data da compra (parcela 1). */
  date: string;
  category_id: string | null;
  card_id: string;
  cycleConfig: CardCycleConfig;
  installments: number;
}

/**
 * Compra parcelada: cria N lançamentos (um por fatura consecutiva),
 * com divisão exata de centavos e installment_group comum.
 */
export async function createInstallmentPurchase(
  input: InstallmentPurchaseInput
): Promise<Transaction[]> {
  const amounts = installmentAmounts(input.amount, input.installments);
  const slots = installmentSlots(input.date, input.cycleConfig, input.installments);
  const group = uuidv4();

  const rows: TransactionInsert[] = slots.map((slot, i) => ({
    type: 'expense' as const,
    amount: amounts[i],
    description: input.description,
    date: slot.date,
    category_id: input.category_id,
    card_id: input.card_id,
    installment_group: group,
    installment_no: i + 1,
    installment_total: input.installments,
  }));

  const { data, error } = await supabase.from('transactions').insert(rows).select();
  if (error) throw error;
  return data ?? [];
}

/** Exclui TODAS as parcelas de uma compra parcelada. */
export async function deleteInstallmentGroup(group: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('installment_group', group);
  if (error) throw error;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

/** Compras de um cartão dentro de um ciclo de fatura (from/to inclusivos). */
export async function listCardTransactions(
  cardId: string,
  from: string,
  to: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('card_id', cardId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
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
