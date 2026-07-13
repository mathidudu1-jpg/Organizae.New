import { describe, expect, it } from 'vitest';

import {
  addMonthsToMonthRef,
  installmentAmounts,
  installmentSlots,
  interestFreeDays,
  invoiceForMonth,
  invoiceForPurchase,
  invoiceLabel,
  invoiceStatus,
  openInvoice,
  suggestedClosingDay,
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

describe('installmentAmounts — divisão exata de centavos', () => {
  it('1159,52 em 12x → 1ª 96,70 + 11× 96,62, somando exato', () => {
    const parts = installmentAmounts(1159.52, 12);
    expect(parts[0]).toBe(96.7);
    expect(parts.slice(1).every((p) => p === 96.62)).toBe(true);
    expect(Math.round(parts.reduce((s, p) => s + p, 0) * 100)).toBe(115952);
  });

  it('100 em 3x → [33.34, 33.33, 33.33]', () => {
    expect(installmentAmounts(100, 3)).toEqual([33.34, 33.33, 33.33]);
  });

  it('1x devolve o total', () => {
    expect(installmentAmounts(59.9, 1)).toEqual([59.9]);
  });

  it('soma sempre exata (varredura)', () => {
    for (const total of [0.03, 10, 99.99, 1234.56, 7777.77]) {
      for (const n of [2, 3, 5, 7, 12, 24]) {
        const parts = installmentAmounts(total, n);
        expect(parts.length).toBe(n);
        expect(Math.round(parts.reduce((s, p) => s + p, 0) * 100)).toBe(Math.round(total * 100));
      }
    }
  });
});

describe('addMonthsToMonthRef', () => {
  it('avança meses e vira o ano', () => {
    expect(addMonthsToMonthRef('2026-08-01', 1)).toBe('2026-09-01');
    expect(addMonthsToMonthRef('2026-11-01', 3)).toBe('2027-02-01');
  });
});

describe('installmentSlots — faturas consecutivas garantidas', () => {
  it('C6: compra 03/07 em 3x → faturas ago/set/out', () => {
    const slots = installmentSlots('2026-07-03', C6, 3);
    expect(slots.map((s) => s.invoice.monthRef)).toEqual([
      '2026-08-01',
      '2026-09-01',
      '2026-10-01',
    ]);
    expect(slots[0].date).toBe('2026-07-03');
    expect(slots[1].date).toBe('2026-08-03');
    expect(slots[2].date).toBe('2026-09-03');
  });

  it('INVARIANTE: a data de cada parcela deriva a própria fatura alvo', () => {
    const configs: CardCycleConfig[] = [
      C6,
      INV,
      { closingDay: 30, dueDay: 10 },
      { closingDay: 31, dueDay: 5 },
      { closingDay: 1, dueDay: 15 },
    ];
    const dates = ['2026-01-31', '2026-01-26', '2026-02-28', '2026-07-25', '2026-12-31'];
    for (const cfg of configs) {
      for (const date of dates) {
        const slots = installmentSlots(date, cfg, 12);
        slots.forEach((slot, i) => {
          // fatura alvo = fatura da compra + i meses
          expect(slot.invoice.monthRef).toBe(
            addMonthsToMonthRef(invoiceForPurchase(date, cfg).monthRef, i)
          );
          // a data registrada pertence ao ciclo dessa fatura (derivação bate)
          expect(invoiceForPurchase(slot.date, cfg).monthRef).toBe(slot.invoice.monthRef);
        });
      }
    }
  });

  it('caso patológico: compra 31/01 com fechamento dia 30 NÃO colide parcelas', () => {
    const cfg: CardCycleConfig = { closingDay: 30, dueDay: 10 };
    const slots = installmentSlots('2026-01-31', cfg, 3);
    const refs = slots.map((s) => s.invoice.monthRef);
    expect(new Set(refs).size).toBe(3); // três faturas distintas
    expect(refs).toEqual(['2026-03-01', '2026-04-01', '2026-05-01']);
  });
});

describe('invoiceStatus', () => {
  // Fatura de agosto (C6): ciclo 26/06–25/07, vence 03/08.
  const inv = invoiceForMonth('2026-08-01', C6);

  it('futura antes do ciclo começar', () => {
    expect(invoiceStatus(inv, '2026-06-25', 0, 0)).toBe('upcoming');
  });

  it('aberta enquanto o ciclo contém hoje', () => {
    expect(invoiceStatus(inv, '2026-06-26', 500, 0)).toBe('open');
    expect(invoiceStatus(inv, '2026-07-13', 500, 0)).toBe('open');
    expect(invoiceStatus(inv, '2026-07-25', 500, 0)).toBe('open');
  });

  it('fechada entre o fechamento e o vencimento sem pagamento', () => {
    expect(invoiceStatus(inv, '2026-07-26', 500, 0)).toBe('closed');
    expect(invoiceStatus(inv, '2026-08-03', 500, 0)).toBe('closed');
  });

  it('vencida após o vencimento sem quitar', () => {
    expect(invoiceStatus(inv, '2026-08-04', 500, 0)).toBe('overdue');
    expect(invoiceStatus(inv, '2026-08-04', 500, 499.99)).toBe('overdue');
  });

  it('paga quando pagamentos cobrem o total (tolerância de centavo)', () => {
    expect(invoiceStatus(inv, '2026-07-26', 500, 500)).toBe('paid');
    expect(invoiceStatus(inv, '2026-09-01', 500, 500)).toBe('paid');
    expect(invoiceStatus(inv, '2026-08-04', 500, 499.996)).toBe('paid');
  });

  it('fatura sem compras, após fechar, conta como paga', () => {
    expect(invoiceStatus(inv, '2026-07-26', 0, 0)).toBe('paid');
  });
});

describe('padrões brasileiros (prazo sem juros / sugestão de fechamento)', () => {
  it('fecha 25 / vence 3 → até 39 dias sem juros (janela jul→set)', () => {
    expect(interestFreeDays(C6)).toBe(39);
  });

  it('fecha 5 / vence 15 → 40 dias (o clássico "até 40 dias")', () => {
    expect(interestFreeDays(INV)).toBe(40);
  });

  it('gap fechamento→vencimento de 7 dias dá até 37 dias', () => {
    expect(interestFreeDays({ closingDay: 10, dueDay: 17 })).toBe(37);
  });

  it('sugestão de fechamento = vencimento − 7 (com wrap de mês)', () => {
    expect(suggestedClosingDay(15)).toBe(8);
    expect(suggestedClosingDay(10)).toBe(3);
    expect(suggestedClosingDay(3)).toBe(26); // wrap: 3-7 → mês anterior
    expect(suggestedClosingDay(20, 10)).toBe(10);
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
