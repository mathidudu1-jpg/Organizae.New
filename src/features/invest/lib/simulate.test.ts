import { describe, expect, it } from 'vitest';

import {
  CDI_ANNUAL_PCT,
  effectiveAnnualRate,
  projectedValueInMonths,
  simulatedValue,
  simulatedYield,
} from './simulate';

describe('effectiveAnnualRate', () => {
  it('taxa fixa anual: 12.5% → 0.125', () => {
    expect(effectiveAnnualRate('fixed_annual', 12.5)).toBeCloseTo(0.125, 10);
  });

  it('% do CDI: 100% do CDI = premissa do CDI', () => {
    expect(effectiveAnnualRate('cdi_pct', 100)).toBeCloseTo(CDI_ANNUAL_PCT / 100, 10);
  });

  it('102% do CDI escala linearmente', () => {
    expect(effectiveAnnualRate('cdi_pct', 102)).toBeCloseTo((CDI_ANNUAL_PCT / 100) * 1.02, 10);
  });
});

describe('simulatedValue', () => {
  it('sem tempo decorrido → principal', () => {
    expect(
      simulatedValue({ principal: 5000, rateKind: 'fixed_annual', rate: 12 }, '2026-07-13', '2026-07-13')
    ).toBe(5000);
  });

  it('1 ano a 12% a.a. → +12% exato', () => {
    expect(
      simulatedValue({ principal: 100000, rateKind: 'fixed_annual', rate: 12 }, '2025-07-13', '2026-07-13')
    ).toBe(112000);
  });

  it('composto: 2 anos a 10% → 1.21×', () => {
    expect(
      simulatedValue({ principal: 1000, rateKind: 'fixed_annual', rate: 10 }, '2024-07-13', '2026-07-13')
    ).toBeCloseTo(1210, 0);
  });

  it('datas no futuro do início não quebram (clamp em 0 dias)', () => {
    expect(
      simulatedValue({ principal: 800, rateKind: 'fixed_annual', rate: 12 }, '2026-12-01', '2026-07-13')
    ).toBe(800);
  });
});

describe('simulatedYield', () => {
  it('rendimento = valor − principal', () => {
    const y = simulatedYield(
      { principal: 100000, rateKind: 'fixed_annual', rate: 12 },
      '2025-07-13',
      '2026-07-13'
    );
    expect(y).toBe(12000);
  });
});

describe('projectedValueInMonths', () => {
  it('12 meses (360 dias) a 12% a.a. ≈ ×1.1183', () => {
    const v = projectedValueInMonths(
      { principal: 10000, rateKind: 'fixed_annual', rate: 12 },
      '2026-07-13',
      12
    );
    expect(v).toBeCloseTo(10000 * Math.pow(1.12, 360 / 365), 0);
  });

  it('0 meses → principal', () => {
    expect(
      projectedValueInMonths({ principal: 999.99, rateKind: 'cdi_pct', rate: 100 }, '2026-07-13', 0)
    ).toBe(999.99);
  });
});
