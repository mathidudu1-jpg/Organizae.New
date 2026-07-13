// ============================================================
// Simulador de investimentos — funções PURAS.
//
// Modelo: juros compostos contínuos por dia corrido,
//   valor = principal × (1 + taxaAnual)^(dias / 365)
// É uma SIMULAÇÃO (não considera IR, IOF, dias úteis/252 nem
// variação do CDI). O CDI usado é uma premissa constante.
// ============================================================

/** Premissa de CDI anual (a.a.). Ajustável num só lugar. */
export const CDI_ANNUAL_PCT = 10.65;

export type RateKind = 'cdi_pct' | 'fixed_annual';

export interface SimInput {
  principal: number;
  rateKind: RateKind;
  /** cdi_pct → % do CDI (ex: 102). fixed_annual → % a.a. (ex: 12.5). */
  rate: number;
}

function daysBetween(fromISO: string, toISO: string): number {
  const ms = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.max(0, Math.round((ms(toISO) - ms(fromISO)) / 86_400_000));
}

/** Taxa anual efetiva (fração, ex: 0.1086) a partir do tipo de taxa. */
export function effectiveAnnualRate(rateKind: RateKind, rate: number): number {
  return rateKind === 'cdi_pct' ? (CDI_ANNUAL_PCT / 100) * (rate / 100) : rate / 100;
}

/** Valor simulado do investimento em `onDate`, aplicado desde `startDate`. */
export function simulatedValue(input: SimInput, startDate: string, onDate: string): number {
  const annual = effectiveAnnualRate(input.rateKind, input.rate);
  const days = daysBetween(startDate, onDate);
  const value = input.principal * Math.pow(1 + annual, days / 365);
  return Math.round(value * 100) / 100;
}

/** Rendimento acumulado (valor − principal). */
export function simulatedYield(input: SimInput, startDate: string, onDate: string): number {
  return Math.round((simulatedValue(input, startDate, onDate) - input.principal) * 100) / 100;
}

/** Projeção: valor daqui a N meses (30 dias/mês, a partir de `fromDate`). */
export function projectedValueInMonths(
  input: SimInput,
  fromDate: string,
  months: number
): number {
  const annual = effectiveAnnualRate(input.rateKind, input.rate);
  const days = daysBetween(fromDate, fromDate) + months * 30;
  const value = input.principal * Math.pow(1 + annual, days / 365);
  return Math.round(value * 100) / 100;
}
