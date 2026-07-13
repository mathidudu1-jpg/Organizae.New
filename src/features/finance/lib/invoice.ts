// ============================================================
// Motor de fatura de cartão de crédito — funções PURAS.
//
// Convenções (únicas e canônicas — não divergir!):
//  · Datas são strings YYYY-MM-DD, sem timezone.
//  · Uma fatura é identificada pelo MÊS DO VENCIMENTO
//    ("Fatura de agosto" = a que vence em agosto).
//  · Compra até o dia de fechamento (inclusive) entra na fatura
//    que fecha naquele mês; depois disso, na seguinte.
//  · Dias 29/30/31 são clampados ao último dia de meses curtos.
//  · A fatura ABERTA hoje é a do ciclo que contém a data de hoje.
// ============================================================

export interface CardCycleConfig {
  /** Dia de fechamento (1–31). */
  closingDay: number;
  /** Dia de vencimento (1–31). */
  dueDay: number;
}

export interface Invoice {
  /** Mês do vencimento, YYYY-MM-01 — identifica a fatura. */
  monthRef: string;
  /** Primeiro dia do ciclo (inclusive). */
  cycleStart: string;
  /** Dia de fechamento (inclusive). */
  cycleEnd: string;
  /** Data de vencimento. */
  dueDate: string;
  /** Melhor dia de compra (dia seguinte ao fechamento). */
  bestBuyDate: string;
}

// ---------- helpers de data (puros) ----------

interface YM {
  y: number;
  m: number; // 1–12
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate(); // dia 0 do mês seguinte
}

function clampDay(y: number, m: number, day: number): number {
  return Math.min(day, daysInMonth(y, m));
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

function addMonths({ y, m }: YM, n: number): YM {
  const total = y * 12 + (m - 1) + n;
  return { y: Math.floor(total / 12), m: (total % 12) + 1 };
}

function addDaysISO(iso: string, n: number): string {
  const { y, m, d } = parseISO(iso);
  const date = new Date(y, m - 1, d + n);
  return toISO(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Data de fechamento efetiva num dado mês (clampada). */
function closingDateIn(ym: YM, closingDay: number): string {
  return toISO(ym.y, ym.m, clampDay(ym.y, ym.m, closingDay));
}

// ---------- núcleo ----------

/**
 * A fatura cujo ciclo FECHA no mês `closingYM`.
 * Ciclo: (fechamento do mês anterior)+1 … fechamento deste mês.
 * Vencimento: dueDay no mesmo mês se dueDay > closingDay, senão no seguinte.
 */
function invoiceClosingIn(closingYM: YM, config: CardCycleConfig): Invoice {
  const { closingDay, dueDay } = config;

  const cycleEnd = closingDateIn(closingYM, closingDay);
  const prevMonth = addMonths(closingYM, -1);
  const cycleStart = addDaysISO(closingDateIn(prevMonth, closingDay), 1);

  const dueYM = dueDay > closingDay ? closingYM : addMonths(closingYM, 1);
  const dueDate = toISO(dueYM.y, dueYM.m, clampDay(dueYM.y, dueYM.m, dueDay));

  return {
    monthRef: toISO(dueYM.y, dueYM.m, 1),
    cycleStart,
    cycleEnd,
    dueDate,
    bestBuyDate: addDaysISO(cycleEnd, 1),
  };
}

/**
 * Em qual fatura cai uma compra feita em `purchaseDate`?
 * Até o fechamento do mês (inclusive) → fecha neste mês; depois → no seguinte.
 */
export function invoiceForPurchase(purchaseDate: string, config: CardCycleConfig): Invoice {
  const { y, m } = parseISO(purchaseDate);
  const closesThisMonth = purchaseDate <= closingDateIn({ y, m }, config.closingDay);
  return invoiceClosingIn(closesThisMonth ? { y, m } : addMonths({ y, m }, 1), config);
}

/** A fatura ABERTA em `today` (o ciclo que contém a data). */
export function openInvoice(today: string, config: CardCycleConfig): Invoice {
  return invoiceForPurchase(today, config);
}

/**
 * Fatura identificada pelo mês do VENCIMENTO (monthRef YYYY-MM-01).
 * Inverso de: vencimento no mesmo mês do fechamento (dueDay > closingDay)
 * ou no mês seguinte (dueDay <= closingDay).
 */
export function invoiceForMonth(monthRef: string, config: CardCycleConfig): Invoice {
  const { y, m } = parseISO(monthRef);
  const dueYM: YM = { y, m };
  const closingYM = config.dueDay > config.closingDay ? dueYM : addMonths(dueYM, -1);
  return invoiceClosingIn(closingYM, config);
}

/** Rótulo humano: "Fatura de agosto". */
export function invoiceLabel(invoice: Invoice, locale = 'pt-BR'): string {
  const { y, m } = parseISO(invoice.monthRef);
  const name = new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'long' });
  return `Fatura de ${name}`;
}

// ---------- status de fatura ----------

export type InvoiceStatus = 'upcoming' | 'open' | 'closed' | 'overdue' | 'paid';

/**
 * Status DERIVADO de uma fatura:
 *  · upcoming — o ciclo ainda nem começou (fatura futura)
 *  · open     — o ciclo contém hoje (acumulando compras)
 *  · paid     — ciclo encerrado e pagamentos cobrem o total (fatura zerada conta como paga)
 *  · overdue  — passou do vencimento sem quitar
 *  · closed   — fechada, aguardando pagamento (entre fechamento e vencimento)
 */
export function invoiceStatus(
  invoice: Invoice,
  today: string,
  total: number,
  paid: number
): InvoiceStatus {
  if (today < invoice.cycleStart) return 'upcoming';
  if (today <= invoice.cycleEnd) return 'open';
  if (paid >= total - 0.005) return 'paid';
  if (today > invoice.dueDate) return 'overdue';
  return 'closed';
}

// ---------- parcelamento ----------

/** monthRef (YYYY-MM-01) deslocado n meses. */
export function addMonthsToMonthRef(monthRef: string, n: number): string {
  const { y, m } = parseISO(monthRef);
  const next = addMonths({ y, m }, n);
  return toISO(next.y, next.m, 1);
}

/**
 * Divide um total em N parcelas que somam EXATAMENTE o total.
 * Base = arredondado pra baixo no centavo; a 1ª parcela absorve a diferença.
 * Ex: 1159.52 em 12x → [96.70, 96.62 × 11].
 */
export function installmentAmounts(total: number, count: number): number[] {
  if (count < 1) return [];
  const totalCents = Math.round(total * 100);
  const baseCents = Math.floor(totalCents / count);
  const firstCents = totalCents - baseCents * (count - 1);
  return [firstCents / 100, ...Array.from({ length: count - 1 }, () => baseCents / 100)];
}

export interface InstallmentSlot {
  /** Data registrada da parcela (dentro do ciclo da fatura alvo). */
  date: string;
  /** Fatura em que a parcela cai (mês do vencimento). */
  invoice: Invoice;
}

/**
 * Datas das N parcelas de uma compra no cartão, GARANTINDO faturas
 * consecutivas (monthRef da compra + k−1 meses), mesmo nos edges de clamp
 * (ex: compra 31/01 com fechamento dia 30 → fevereiro curto).
 * Estratégia: desloca a data k−1 meses e, se ela escapar do ciclo da
 * fatura alvo, prende ao início/fim do ciclo.
 */
export function installmentSlots(
  purchaseDate: string,
  config: CardCycleConfig,
  count: number
): InstallmentSlot[] {
  const first = invoiceForPurchase(purchaseDate, config);
  const { d: purchaseDay } = parseISO(purchaseDate);

  return Array.from({ length: count }, (_, i) => {
    if (i === 0) return { date: purchaseDate, invoice: first };

    const invoice = invoiceForMonth(addMonthsToMonthRef(first.monthRef, i), config);
    // dia "intuitivo": mesmo dia da compra, no mês do fim do ciclo alvo
    // (ex: ciclo 26/07–25/08 e compra dia 3 → 03/08); se não couber,
    // tenta no mês do início (compra dia 30 → 30/07); senão prende ao ciclo.
    const end = parseISO(invoice.cycleEnd);
    const start = parseISO(invoice.cycleStart);
    const inEndMonth = toISO(end.y, end.m, clampDay(end.y, end.m, purchaseDay));
    const inStartMonth = toISO(start.y, start.m, clampDay(start.y, start.m, purchaseDay));

    let date: string;
    if (inEndMonth >= invoice.cycleStart && inEndMonth <= invoice.cycleEnd) {
      date = inEndMonth;
    } else if (inStartMonth >= invoice.cycleStart && inStartMonth <= invoice.cycleEnd) {
      date = inStartMonth;
    } else {
      date = inStartMonth < invoice.cycleStart ? invoice.cycleStart : invoice.cycleEnd;
    }
    return { date, invoice };
  });
}

// ---------- padrões do mercado brasileiro ----------

/**
 * Dias "sem juros" do marketing dos bancos ("ATÉ N dias"): comprando no
 * MELHOR dia (dia seguinte ao fechamento), quantos dias até o vencimento?
 * O valor varia com o mês (fevereiro encurta), então devolvemos o MÁXIMO
 * do ano — é assim que os bancos anunciam.
 * Ex: fecha 25 / vence 3 → até 38 dias; fecha 5 / vence 15 → até 40 dias.
 */
export function interestFreeDays(config: CardCycleConfig): number {
  const ms = (iso: string) => {
    const { y, m, d } = parseISO(iso);
    return Date.UTC(y, m - 1, d);
  };
  let max = 0;
  for (let m = 1; m <= 12; m++) {
    const best = invoiceClosingIn({ y: 2026, m }, config).bestBuyDate;
    const inv = invoiceForPurchase(best, config);
    max = Math.max(max, Math.round((ms(inv.dueDate) - ms(best)) / 86_400_000));
  }
  return max;
}

/**
 * Sugestão de dia de fechamento para um vencimento escolhido.
 * Prática comum no Brasil: fechamento 7–10 dias antes do vencimento
 * (C6/Nubank/Santander ≈ 7). Wrap em mês genérico de 30 dias.
 */
export function suggestedClosingDay(dueDay: number, gapDays = 7): number {
  const day = dueDay - gapDays;
  return day >= 1 ? day : day + 30;
}

/** Valida config de cartão. Retorna mensagem de erro ou null. */
export function validateCycleConfig(config: CardCycleConfig): string | null {
  const { closingDay, dueDay } = config;
  if (!Number.isInteger(closingDay) || closingDay < 1 || closingDay > 31) {
    return 'Dia de fechamento deve ser entre 1 e 31.';
  }
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    return 'Dia de vencimento deve ser entre 1 e 31.';
  }
  if (dueDay === closingDay) {
    return 'Vencimento não pode ser no mesmo dia do fechamento.';
  }
  return null;
}
