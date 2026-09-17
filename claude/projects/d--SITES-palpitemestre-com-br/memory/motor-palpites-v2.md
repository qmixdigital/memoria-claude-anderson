---
name: motor-palpites-v2
description: Motor de palpites v2 (Poisson + ancoragem no mercado) nos sites de palpites — experimento iniciado 11/08/2026
metadata: 
  node_type: memory
  type: project
  originSessionId: 5b96686e-b85c-460a-b9b6-3fdfaec3533d
  modified: 2026-08-11T11:21:55.416Z
---

Em 11/08/2026 reescrevi o motor de palpites (`src/engine/rules.ts`, idêntico em palpitemestre e ptdf) para tentar melhorar a taxa de acerto. O antigo só ecoava a odd e a "confiança" saturava travada em <60.

**O que mudou (v2):**
- Probabilidade própria: Poisson (gols esperados a partir das médias marcadas/sofridas) para O/U e BTTS; matriz de placares Poisson para 1X2/DC.
- **Ignora `apiPrediction.percent`** — o dado da API-Football vem CORROMPIDO (subestima o mandante, tipicamente home≈10%), o que invertia os palpites de DC (escolhia X2 contra favoritos). Não voltar a confiar nesse campo.
- Ancoragem no mercado: `modelProb = (1-w)*implícita + w*Poisson`, w=0.25 para 1X2/DC (stats de time são finas em jogos europeus) e 0.40 para gols/BTTS. Evita absurdos tipo "82% contra mercado de 33%".
- Confiança = probabilidade do modelo (varia ~50–90, passa a significar algo). Só publica seleção com prob ≥50% (corta coin-flip/empates).
- Params ajustáveis no topo do arquivo: PROB_MIN, EDGE_MIN, wModel, MIN_ODD/MAX_ODD (1.4–3.5).

**Baseline ANTES da mudança (para comparar em ~1 semana, a partir de 18/08/2026):**
- palpitemestre: acerto 52,6% (701/1332), ROI −7,7%, odd média green 1,75. Breakeven ~57%.
- ptdf: acerto 52,0% (561/1078), ROI −8,5%.
- Piores vazamentos (motor antigo): DC/X2 43%, OU25/over 47,8%, 1X2/draw 31%.

**Como medir:** rodar o script de análise (groupBy `Prediction.result` GREEN/RED, ROI por odd) contando só picks liquidados DEPOIS de 11/08. O cron diário (run-engine → gen-content → settle-results) já aplica o motor novo em todas as rodadas futuras. Ver [[palpitemestre-deploy]] para rodar jobs via tsx.

**Aviso honesto registrado:** bater o mercado de apostas é difícil; a v2 melhora a honestidade da confiança e corta picks claramente errados, mas não há garantia de virar o ROI positivo — o −8% pode ir só até perto de 0. Trocar o LLM (OpenAI→Claude) NÃO afeta acerto (o LLM não decide palpite, só escreve texto).
