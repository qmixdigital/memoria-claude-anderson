import { describe, it, expect } from 'vitest';
import { custoGiro, beneficioPotencial, checarLimiteMes, seriaDayTrade } from '@qmix-invest/db/tax/custos';

describe('custo do giro (item 1)', () => {
  it('soma a taxa da B3 (0,03%) nas duas pontas; corretagem zero no C6', () => {
    // ITUB3: 447 ações a ~44,50 = R$ 19.891,50; recompra ao mesmo valor
    const c = custoGiro(19891.5, 19891.5);
    // 19891,50 × 0,0003 × 2 = 11,9349 → 11,93
    expect(c.toFixed(2)).toBe('11.93');
  });

  it('benefício potencial é 15% do lucro travado', () => {
    expect(beneficioPotencial(2990).toFixed(2)).toBe('448.50');
  });

  it('valores pequenos arredondam a 2 casas sem erro de float', () => {
    expect(custoGiro(1000, 1000).toFixed(2)).toBe('0.60'); // 1000×0,0003×2 = 0,60
  });
});

describe('limite do mês (item 3)', () => {
  it('passar de 90% do teto (R$17.910) aciona o aviso, sem estourar', () => {
    const r = checarLimiteMes(17000, 1000); // 18.000
    expect(r.perto90).toBe(true);
    expect(r.vaiEstourar).toBe(false);
    expect(r.margemRestante.toFixed(2)).toBe('1900.00'); // 19.900 − 18.000
  });

  it('ultrapassar R$20.000 marca estouro', () => {
    const r = checarLimiteMes(19000, 1500); // 20.500
    expect(r.vaiEstourar).toBe(true);
    expect(r.perto90).toBe(true);
  });

  it('exatamente R$20.000 NÃO estoura; R$20.000,01 estoura', () => {
    expect(checarLimiteMes(20000, 0).vaiEstourar).toBe(false);
    expect(checarLimiteMes(20000, 0.01).vaiEstourar).toBe(true);
  });

  it('bem abaixo do teto não aciona nada', () => {
    const r = checarLimiteMes(5000, 1000); // 6.000
    expect(r.perto90).toBe(false);
    expect(r.vaiEstourar).toBe(false);
    expect(r.margemRestante.toFixed(2)).toBe('13900.00');
  });
});

describe('regra do mesmo-dia / day trade (item 2)', () => {
  const existentes = [
    { ticker: 'BBDC4', side: 'sell', tradeDate: '2026-07-01' },
    { ticker: 'PETR4', side: 'buy', tradeDate: '2026-07-01', isOpening: true },
  ];

  it('recomprar a MESMA ação no MESMO dia da venda é day trade', () => {
    expect(seriaDayTrade('BBDC4', 'buy', '2026-07-01', existentes)).toBe(true);
  });

  it('recomprar no dia seguinte NÃO é day trade', () => {
    expect(seriaDayTrade('BBDC4', 'buy', '2026-07-02', existentes)).toBe(false);
  });

  it('mesmo lado no mesmo dia (duas vendas) não é day trade', () => {
    expect(seriaDayTrade('BBDC4', 'sell', '2026-07-01', existentes)).toBe(false);
  });

  it('operação oposta contra o saldo de abertura não conta como day trade', () => {
    expect(seriaDayTrade('PETR4', 'sell', '2026-07-01', existentes)).toBe(false);
  });

  it('outra ação no mesmo dia não é day trade', () => {
    expect(seriaDayTrade('VALE3', 'buy', '2026-07-01', existentes)).toBe(false);
  });
});
