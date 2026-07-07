import { describe, expect, it } from 'vitest';

import {
  invoiceForMonth,
  invoiceForPurchase,
  invoiceLabel,
  openInvoice,
  validateCycleConfig,
  type CardCycleConfig,
} from './invoice';

// Cenário real C6: fecha dia 25, vence dia 3 (do mês seguinte).
const C6: CardCycleConfig = { closingDay: 25, dueDay: 3 };
// Cenário invertido: fecha dia 5, vence dia 15 (mesmo mês).
const INV: CardCycleConfig = { closingDay: 5, dueDay: 15 };

describe('invoiceForPurchase — cenário C6 (fecha 25, vence 03)', () => {
  it('compra 03/07 entra na fatura de agosto (fecha 25/07, vence 03/08)', () => {
    const inv = invoiceForPurchase('2026-07-03', C6);
    expect(inv.cycleStart).toBe('2026-06-26');
    expect(inv.cycleEnd).toBe('2026-07-25');
    expect(inv.dueDate).toBe('2026-08-03');
    expect(inv.monthRef).toBe('2026-08-01');
  });

  it('compra NO dia do fechamento (25/07) ainda entra na fatura de agosto', () => {
    const inv = invoiceForPurchase('2026-07-25', C6);
    expect(inv.cycleEnd).toBe('2026-07-25');
    expect(inv.monthRef).toBe('2026-08-01');
  });

  it('compra no dia SEGUINTE ao fechamento (26/07) cai na fatura de setembro', () => {
    const inv = invoiceForPurchase('2026-07-26', C6);
    expect(inv.cycleStart).toBe('2026-07-26');
    expect(inv.cycleEnd).toBe('2026-08-25');
    expect(inv.dueDate).toBe('2026-09-03');
    expect(inv.monthRef).toBe('2026-09-01');
  });

  it('melhor dia de compra = dia seguinte ao fechamento', () => {
    const inv = invoiceForPurchase('2026-07-03', C6);
    expect(inv.bestBuyDate).toBe('2026-07-26');
  });

  it('virada de ano: compra 26/12/2026 vence 03/02/2027', () => {
    const inv = invoiceForPurchase('2026-12-26', C6);
    expect(inv.cycleEnd).toBe('2027-01-25');
    expect(inv.dueDate).toBe('2027-02-03');
    expect(inv.monthRef).toBe('2027-02-01');
  });
});

describe('invoiceForPurchase — vencimento no mesmo mês (fecha 5, vence 15)', () => {
  it('compra 04/03 fecha 05/03 e vence 15/03', () => {
    const inv = invoiceForPurchase('2026-03-04', INV);
    expect(inv.cycleEnd).toBe('2026-03-05');
    expect(inv.dueDate).toBe('2026-03-15');
    expect(inv.monthRef).toBe('2026-03-01');
  });

  it('compra 06/03 fecha 05/04 e vence 15/04', () => {
    const inv = invoiceForPurchase('2026-03-06', INV);
    expect(inv.cycleEnd).toBe('2026-04-05');
    expect(inv.dueDate).toBe('2026-04-15');
    expect(inv.monthRef).toBe('2026-04-01');
  });
});

describe('clamp de meses curtos', () => {
  const EOM: CardCycleConfig = { closingDay: 31, dueDay: 10 };

  it('fechamento dia 31 em fevereiro clampa pra 28 (2026 não bissexto)', () => {
    const inv = invoiceForPurchase('2026-02-28', EOM);
    expect(inv.cycleEnd).toBe('2026-02-28');
    expect(inv.dueDate).toBe('2026-03-10');
  });

  it('compra 01/03 (após o clamp de fev) cai na fatura que fecha 31/03', () => {
    const inv = invoiceForPurchase('2026-03-01', EOM);
    expect(inv.cycleStart).toBe('2026-03-01');
    expect(inv.cycleEnd).toBe('2026-03-31');
  });

  it('ciclo após fevereiro começa no dia certo (01/03, sem buracos)', () => {
    const inv = invoiceForPurchase('2026-03-15', EOM);
    expect(inv.cycleStart).toBe('2026-03-01');
  });

  it('vencimento dia 31 clampa em meses de 30 dias', () => {
    const cfg: CardCycleConfig = { closingDay: 15, dueDay: 31 };
    // compra 10/04 → fecha 15/04 → vence "31/04" → clamp 30/04
    const inv = invoiceForPurchase('2026-04-10', cfg);
    expect(inv.dueDate).toBe('2026-04-30');
  });
});

describe('openInvoice', () => {
  it('a fatura aberta hoje é a do ciclo corrente', () => {
    const inv = openInvoice('2026-07-07', C6);
    expect(inv.cycleStart).toBe('2026-06-26');
    expect(inv.cycleEnd).toBe('2026-07-25');
    expect(inv.monthRef).toBe('2026-08-01');
  });
});

describe('invoiceForMonth (inverso)', () => {
  it('fatura de agosto (C6) fecha 25/07', () => {
    const inv = invoiceForMonth('2026-08-01', C6);
    expect(inv.cycleStart).toBe('2026-06-26');
    expect(inv.cycleEnd).toBe('2026-07-25');
    expect(inv.dueDate).toBe('2026-08-03');
  });

  it('fatura de março (fecha 5, vence 15) fecha 05/03', () => {
    const inv = invoiceForMonth('2026-03-01', INV);
    expect(inv.cycleEnd).toBe('2026-03-05');
    expect(inv.dueDate).toBe('2026-03-15');
  });

  it('roundtrip: toda compra pertence à fatura do seu monthRef', () => {
    for (const cfg of [C6, INV, { closingDay: 31, dueDay: 10 }]) {
      for (const date of ['2026-01-05', '2026-02-28', '2026-07-25', '2026-07-26', '2026-12-31']) {
        const inv = invoiceForPurchase(date, cfg);
        const same = invoiceForMonth(inv.monthRef, cfg);
        expect(same.cycleStart).toBe(inv.cycleStart);
        expect(same.cycleEnd).toBe(inv.cycleEnd);
        expect(date >= inv.cycleStart && date <= inv.cycleEnd).toBe(true);
      }
    }
  });
});

describe('invoiceLabel', () => {
  it('gera "Fatura de agosto"', () => {
    const inv = invoiceForPurchase('2026-07-03', C6);
    expect(invoiceLabel(inv)).toBe('Fatura de agosto');
  });
});

describe('validateCycleConfig', () => {
  it('aceita config válida', () => {
    expect(validateCycleConfig(C6)).toBeNull();
  });
  it('rejeita dias fora de 1–31', () => {
    expect(validateCycleConfig({ closingDay: 0, dueDay: 3 })).toBeTruthy();
    expect(validateCycleConfig({ closingDay: 25, dueDay: 32 })).toBeTruthy();
  });
  it('rejeita vencimento igual ao fechamento', () => {
    expect(validateCycleConfig({ closingDay: 10, dueDay: 10 })).toBeTruthy();
  });
});
