// Helpers de formatação e datas. Datas são strings YYYY-MM-DD (sem timezone)
// para bater com as colunas `date` do banco e evitar shift de fuso.

export function formatCurrency(value: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

/** Data local de hoje como YYYY-MM-DD (sem UTC). */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Primeiro dia do mês (YYYY-MM-01) de uma data YYYY-MM-DD. Bate com transactions.month_ref. */
export function monthRefOf(dateISO: string): string {
  return `${dateISO.slice(0, 7)}-01`;
}

/** month_ref do mês atual. */
export function currentMonthRef(): string {
  return monthRefOf(todayISO());
}
