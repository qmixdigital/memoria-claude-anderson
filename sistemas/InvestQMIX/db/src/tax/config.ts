// Parâmetros fiscais — parametrizáveis porque podem mudar por lei.
// A isenção de R$20k foi ameaçada pela MP 1303/2025, que caducou em 08/10/2025,
// então segue válida. O LIMITE_LEGAL (20.000) é o da lei; o LIMITE_ISENCAO (19.900)
// é o teto OPERACIONAL de segurança usado nas RECOMENDAÇÕES de venda, pra absorver
// variação de preço entre o cálculo e a execução. A APURAÇÃO usa o limite legal.

export const TAX_CONFIG = {
  LIMITE_LEGAL: 20000.0, // limite legal de isenção mensal (ações à vista, swing)
  LIMITE_ISENCAO: 19900.0, // teto de segurança usado nas recomendações
  ALIQUOTA_SWING: 0.15, // 15% sobre lucro (ações, acima do teto)
  ALIQUOTA_FII: 0.20, // FII: 20% sempre, sem isenção
  ALIQUOTA_ETF_BDR: 0.15, // ETF de ação e BDR: 15% sem isenção
  ALIQUOTA_DAYTRADE: 0.20, // day trade (fora do escopo atual)
  DEDO_DURO_SWING: 0.00005, // 0,005% retido na venda swing (antecipação abatível, recuperável)
  DARF_MINIMO: 10.0, // imposto < R$10 acumula até atingir o piso
  // Alerta de oportunidade ao longo do mês: só avisar se o lucro livre de imposto
  // da operação superar este valor (evita aviso de troco).
  MIN_LUCRO_ALERTA: 50.0,
  // Custos de transação (giro = vender + recomprar).
  CUSTO_CORRETAGEM: 0.0, // C6 Bank não cobra corretagem nem custódia em ações
  TAXA_B3: 0.0003, // 0,03% por operação (liquidação + emolumentos da bolsa)
  // Avisos de teto: alerta ao passar deste % do limite de isenção.
  LIMITE_ALERTA_PCT: 0.9, // 90% de R$19.900 = R$17.910
  // Lembretes (em dias úteis).
  DIAS_UTEIS_RECOMPRA: 2, // lembra de recomprar se passar disso sem registrar a recompra
  DIAS_UTEIS_LEMBRETE_DARF: 3, // lembra do DARF este nº de dias úteis antes do vencimento
  // Liquidez: abaixo deste volume financeiro médio diário, a ação é "pouco negociada".
  LIQUIDEZ_MINIMA_BRL: 500000.0,
  // Avisa de dividendo/JCP a caminho se a data-com estiver dentro desta janela (dias corridos).
  PROVENTO_AVISO_DIAS: 30,
} as const;

export type TaxConfig = typeof TAX_CONFIG;

// Glossário padronizado (fonte única em @qmix-invest/db, compartilhada com o app).
export { GLOSSARIO } from '../glossario.js';

