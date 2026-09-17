// Glossário fiscal — explicações padronizadas (SEMPRE as mesmas para o mesmo termo).
// Compartilhado entre o worker (mensagens dos alertas) e o app (comando /ajuda do bot),
// pra a explicação de cada termo nunca divergir.

export const GLOSSARIO = {
  swing: 'compra e venda em dias diferentes',
  dayTrade: 'compra e venda da mesma ação no mesmo dia, que paga imposto sempre',
  isento: 'não paga imposto sobre o lucro',
  teto: 'o quanto você pode vender no mês sem pagar imposto (R$ 19.900)',
  precoMedio: 'o valor médio que você pagou por cada ação',
  darf: 'a guia para pagar o imposto',
  prejuizoCompensar: 'perdas guardadas que abatem imposto de lucros futuros',
  dedoDuro: 'um adiantamento de imposto retido na venda que volta pra você como crédito (não é custo)',
} as const;

export type Glossario = typeof GLOSSARIO;

// Termos prontos pra exibição no comando /ajuda, em ordem de utilidade.
export const GLOSSARIO_AJUDA: Array<{ termo: string; explicacao: string }> = [
  { termo: 'Operação normal (swing)', explicacao: GLOSSARIO.swing },
  { termo: 'Day trade', explicacao: GLOSSARIO.dayTrade },
  { termo: 'Isento', explicacao: GLOSSARIO.isento },
  { termo: 'Limite do mês', explicacao: GLOSSARIO.teto },
  { termo: 'Preço médio', explicacao: GLOSSARIO.precoMedio },
  { termo: 'DARF', explicacao: GLOSSARIO.darf },
  { termo: 'Prejuízo a compensar', explicacao: GLOSSARIO.prejuizoCompensar },
  { termo: 'Dedo-duro', explicacao: GLOSSARIO.dedoDuro },
];
