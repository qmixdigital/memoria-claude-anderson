# Plano de Implementação — Módulo de Planejamento Tributário (InvestQMIX)

Adaptado ao estado real do código (junho/2026). Ledger alimentado manualmente pelo
usuário via Claude Code (VS Code). Lógica fiscal a ser revisada por terceiro.

## 0. Arquitetura no monorepo (o que já existe)

- **DB**: PostgreSQL, schema `qmix_invest`, Drizzle ORM (`db/src/schema.ts`). Migrations
  são **SQL puro à mão** aplicadas manualmente (`docker exec ... psql < arquivo.sql`) — o
  journal do Drizzle está congelado em 0005; NÃO usar `drizzle-kit generate`.
- **Worker**: Node + pg-boss (`worker/src/handlers.ts`), jobs agendados em cron UTC.
  Telegram pronto (`worker/src/telegram.ts` → `sendTelegramMessage`).
- **App**: Next.js 15, bot Telegram (grammY) em `app/src/lib/telegram/bot.ts`.
- **Posições**: `qmix_invest.user_portfolio` (ticker, quantity, purchase_price_brl, purchase_date).
- **Cotações**: `qmix_invest.tickers.last_quote_brl` (atualizadas a cada 5 min no pregão).

A lógica de **cálculo fiscal é pura** (sem I/O) → fica em local compartilhado importável por
app e worker. Proposta: `db/src/tax/` (pacote `@qmix-invest/db` já é importado pelos dois) OU
um novo workspace `tax/`. Recomendo `db/src/tax/` pela simplicidade.

## 1. Schema novo (migração SQL `0021_tax_module.sql`)

```sql
-- Ledger de operações (escrituração manual)
create table qmix_invest.trades (
  id            integer primary key generated always as identity,
  ticker        varchar(12) not null references qmix_invest.tickers(ticker),
  side          text not null check (side in ('buy','sell')),
  trade_date    date not null,
  quantity      integer not null check (quantity > 0),
  price_brl     numeric(12,4) not null,            -- preço unitário
  fees_brl      numeric(12,4) not null default 0,  -- corretagem + emolumentos
  nature        text not null check (nature in ('swing','day')),
  nature_inferred boolean not null default false,  -- true = day trade inferido automaticamente
  is_opening    boolean not null default false,    -- true = trade sintético de saldo de abertura
  notes         text,
  created_at    timestamptz not null default now()
);
create index trades_date_idx on qmix_invest.trades (trade_date);
create index trades_ticker_date_idx on qmix_invest.trades (ticker, trade_date);

-- Estoque de prejuízo a compensar, por natureza (não vence, carrega pra frente)
create table qmix_invest.tax_loss_carryforward (
  nature      text primary key check (nature in ('swing','day')),
  amount_brl  numeric(14,2) not null default 0,    -- prejuízo acumulado disponível
  updated_at  timestamptz not null default now()
);
insert into qmix_invest.tax_loss_carryforward (nature, amount_brl)
  values ('swing', 0), ('day', 0);
```

**Saldo de abertura:** ao ativar o módulo, gerar **1 trade sintético `buy` por posição** do
`user_portfolio` (qty e PM atuais, `fees_brl=0`, `is_opening=true`, `trade_date` = data de
ativação, `notes='saldo de abertura'`). Assim o ledger é a **única fonte** e a reconstrução de
preço médio fica uniforme. Se houver **prejuízo de anos anteriores**, o usuário informa o valor
e a gente faz `update tax_loss_carryforward`.

## 2. Config fiscal parametrizável (`db/src/tax/config.ts`)

```ts
export const TAX_CONFIG = {
  LIMITE_ISENCAO: 19900.00,   // teto de segurança (lei = 20.000)
  ALIQUOTA_SWING: 0.15,
  ALIQUOTA_DAYTRADE: 0.20,
  DEDO_DURO: 0.00005,          // 0,005% retido na venda swing
  DIA_ALERTA: 'penultimo_dia_util',
} as const;
// Comentário no código: isenção de R$20k foi ameaçada pela MP 1303/2025,
// que caducou em 08/10/2025 → segue válida. Mantido parametrizável p/ mudança por lei.
```

Custos de corretagem/emolumentos vêm de `trades.fees_brl` (informados no registro).

## 3. Fluxo de REGISTRO (manual, via Claude Code)

Formato fixo que o usuário envia:
```
[data] [compra|venda] [qtd] [ticker] a [preço] | corretagem [R$] | [swing|day]
ex.: 30/06 venda 100 BBDC4 a 18,50 | corretagem 4,90 | swing
```
Campos obrigatórios: data, side, qtd, ticker, preço, corretagem, natureza.

**Inferência de day trade (NÃO confiar na marcação manual):** ao gravar, se já existir no mesmo
`trade_date` um trade do MESMO ticker com side oposto, marcar AMBOS como `nature='day'` e
`nature_inferred=true`. O usuário pode corrigir depois. Day trade = 20%, sem isenção.

**Confirmação obrigatória após cada registro** (resposta ao usuário):
```
✅ Registrado: venda 100 BBDC4 a R$ 18,50 (swing)
Total vendido (swing) em jun/2026: R$ 14.300,00 de R$ 19.900,00
Margem isenta restante: R$ 5.600,00
```

**Atualização de posição:** após gravar, recalcular `user_portfolio` (posição viva) — compra =
PM ponderado + qty↑; venda = qty↓ (PM mantido); qty→0 remove a linha. (O resto do sistema usa
`user_portfolio` pro P/L dos alertas, então mantém sincronizado.) A APURAÇÃO fiscal, porém,
reconstrói tudo a partir do ledger (fonte de verdade), não do `user_portfolio`.

## 4. Apuração mensal (`db/src/tax/apuracao.ts`) — usar `decimal`, nunca float

Para o mês M, reconstruindo cronologicamente PM por ticker a partir do ledger:
- `vendido_swing_bruto` = Σ(preço×qty) das vendas swing do mês.
- `margem_isenta_restante` = max(0, LIMITE_ISENCAO − vendido_swing_bruto).
- `lucro_swing_mes` = Σ[(preço_venda − PM_no_momento)×qty − fees] das vendas swing.
- **Se `vendido_swing_bruto` ≤ 20.000** (regra legal): lucro swing **isento** → vai pro código 20.
- **Se > 20.000**: IR = 15% × max(0, lucro_swing_mes − prejuízo_swing_acumulado); abater dedo-duro retido.
- **Day trade** (sempre, à parte): IR = 20% × max(0, lucro_day_mes − prejuízo_day_acumulado).
- Atualizar `tax_loss_carryforward` quando o mês fechar com prejuízo (por natureza). **Prejuízo de
  mês isento (≤20k) NÃO entra no estoque.**
- Por posição: qty, PM, preço atual, ganho não realizado (R$ e %).

## 5. Recomendação de venda isenta ("fazer patrimônio")

- `margem` = LIMITE_ISENCAO − vendido_swing_bruto do mês.
- Ordenar posições por **ganho não realizado % desc**.
- Greedy: para cada posição (maior % primeiro), sugerir vender o nº de cotas cujo **valor bruto**
  caiba na `margem` restante; subtrair da margem; seguir até esgotar.
- Para cada sugestão: simular recompra ao mesmo preço → **novo PM = preço de recompra** (step-up,
  sem wash sale no Brasil) e **imposto futuro economizado** = 15% × ganho realizado isento.
- **Filtro de viabilidade:** não sugerir se custo do giro (2× fees + spread estimado) ≥ imposto
  economizado.

## 6. Modo "estouro" (vender > R$ 20 mil no mês)

- Acima do teto, todo o lucro swing do mês é tributável (15%). Estratégia **lucro × prejuízo**:
  parear ganhos com posições no prejuízo realizáveis (mesma natureza) para minimizar a base.
- Sugerir quais posições no prejuízo vender; calcular IR final (15%/20%), abater dedo-duro +
  prejuízo acumulado; **gerar DARF** (valor + vencimento = último dia útil do mês seguinte).

## 7. Alerta de fim de mês (job pg-boss no worker)

- Novo handler `tax-monthly-planning` agendado no `DIA_ALERTA` (penúltimo dia útil), reaproveitando
  o padrão de `watchlist-daily-report`. Mensagem (formato do prompt):
```
📊 InvestQMIX — Planejamento do mês (06/2026)
Já vendido no mês: R$ 14.300 / Teto: R$ 19.900
Margem isenta restante: R$ 5.600
✅ Sugestão de venda isenta (subir preço médio):
• PETR4 — vender 80 (R$ 3.060) | ganho R$ 410 | novo PM R$ 38,20
Total sugerido: R$ 5.520 (dentro da isenção)
⚠️ DARF do mês: R$ ___ (vence DD/MM)  [só se houver]
```

## 8. Export para declaração de IR

- Consolidar por mês: lucro **isento** (Rendimentos Isentos **código 20**), lucro tributável
  swing e day trade, IR retido (dedo-duro), prejuízos a compensar acumulados.
- Exportar CSV/JSON (comando no Claude Code ou rota/endpoint).

## 9. Testes (Vitest, já configurado)

Cobrir os pontos onde erro fiscal dói:
- Step-up de preço médio (compra ponderada, venda+recompra).
- Apuração mensal isento vs tributável (limite 20k, teto 19.900).
- Inferência de day trade (compra+venda mesmo dia/ticker).
- Compensação de prejuízo por natureza (e bloqueio de prejuízo isento).
- Arredondamento monetário com `decimal` (2 casas).

## 10. Ordem de implementação

1. Migração `0021_tax_module.sql` (mostrar antes de aplicar) + seed de abertura + prejuízo anterior.
2. `db/src/tax/` (config + apuração + recomendação) com testes — núcleo puro.
3. Fluxo de registro via Claude Code (parser do formato + inferência day + confirmação + sync user_portfolio).
4. Job de alerta de fim de mês no worker.
5. Export IR.

## 11. Pontos para o revisor fiscal focar

- Regra do teto: limite é sobre **valor bruto vendido no mês (todas as ações somadas)**, não por ativo nem sobre lucro. ✔ implementado assim.
- Prejuízo de **mês isento não compensa** — confirmar tratamento.
- Day trade 20% **sem isenção** e **separado** do swing — confirmar segregação do estoque de prejuízo.
- Dedo-duro 0,005% como **antecipação abatível** do devido — confirmar onde abate.
- DARF: vencimento último dia útil do mês seguinte — confirmar cálculo de dia útil.
- Custo de aquisição = preço + corretagem + emolumentos — confirmar que fees entram no PM na compra.

---

# v2 — Correções incorporadas após revisão fiscal (PREVALECEM sobre o acima)

**Escopo de day trade:** o usuário NÃO faz day trade. A apuração de day trade (20%, dedo-duro
1%, estoque separado) fica **FORA do escopo**. Mantém-se apenas a **inferência como trava de
segurança**: se houver compra+venda do mesmo ticker no mesmo dia, o sistema **avisa** ("isso é
day trade, tem tributação diferente e não está coberto") e não calcula isenção sobre ele — não
implementa a apuração de 20%. (Reabrir escopo se ele começar a operar day trade.)

### Ponto 1 — Estouro tributa o lucro do mês INTEIRO (crítico, com teste dedicado)
Se as vendas de ações comuns passarem de R$ 20.000 no mês, **perde-se a isenção de TODO o ganho
do mês**, não só da parcela acima do teto. `IR = ALIQUOTA_SWING × max(0, lucro_liquido_swing_do_mes_inteiro − prejuizo_swing_acumulado)`.
Teste obrigatório: mês com R$ 20.001 de vendas e lucro X → imposto = 15%·X (todo o lucro), não 15% sobre a parcela marginal.

### Ponto 2 — Isenção é SÓ para ações à vista (crítico — a carteira TEM FIIs)
A carteira já contém FIIs: **HGLG11, KNCR11, RBRR11, XPML11**. FII/ETF/BDR **não têm** a isenção
de R$ 20k e **não contam** pro teto. Tratamento: FII = 20% sempre; ETF de ação e BDR = 15% sem
isenção. Implementar:
- Nova coluna `qmix_invest.tickers.asset_class text` ∈ (`acao`,`fii`,`etf`,`bdr`,`outro`),
  classificada por lista/curadoria (NÃO inferir só pelo sufixo 11 — BPAC11/ALUP11/SANB11 são
  units de AÇÃO; HGLG11/KNCR11 são FII).
- A isenção de R$ 20k e o teto consideram **apenas `asset_class='acao'`**. Demais classes apuradas à parte.
- Teste: FII vendido no mês não entra no teto nem na isenção das ações.

### Ponto 3 — Fees: compra entra no PM, venda abate da venda (explícito + teste)
`trades.fees_brl` é o custo do próprio trade. Tratamento na reconstrução:
- trade `buy`: `custo_total += price×qty + fees_brl` → PM embute a corretagem da compra.
- trade `sell`: `lucro = (price×qty − fees_brl) − PM×qty` → fee da venda reduz o valor da venda.
- Nunca somar o fee duas vezes nem ignorar. Teste: compra com fee → PM correto; venda com fee → lucro líquido correto.

### Ponto 4 — Dedo-duro de day trade (fora de escopo) — N/A enquanto não houver day trade.

### Ponto 5 — DARF mínimo de R$ 10 (acumula)
Imposto apurado < R$ 10 num mês **não gera DARF**: acumula e soma aos meses seguintes até atingir
R$ 10, então emite. Guardar saldo de imposto pendente (ex.: coluna em `tax_loss_carryforward` ou
tabela `tax_due_pending`). Teste: 3 meses de R$ 4 → DARF só no 3º mês (R$ 12).

### Ponto 6 — "Dia útil" com calendário de feriados B3
Vencimento do DARF (último dia útil do mês seguinte) e `DIA_ALERTA` (penúltimo dia útil) devem
pular feriados nacionais/B3, não só fim de semana. Usar tabela/lista de feriados B3 (carregar
calendário anual) — não calcular só com `dia da semana`.

### Ponto 7 — Eventos corporativos (lançamento de ajuste)
Desdobramento, grupamento, bonificação e subscrição mudam qty e PM sem ser compra/venda. Adicionar
tipo de lançamento de evento no ledger (ex.: `trades.side` aceita `event` + colunas/notes com
fator, OU tabela `corporate_events`): split (qty×fator, PM÷fator), grupamento (inverso),
bonificação (qty↑, PM recalculado), subscrição (compra a preço definido). A reconstrução do PM
aplica o evento na data. Sem isso, PM do ledger diverge do real e a apuração erra.

### Fora de escopo (registrar): dividendos e JCP
Este módulo cuida só de **ganho de capital**. Dividendo/JCP têm apuração própria (incl. a regra
nova de 10% na fonte sobre dividendos > R$ 50k/mês da mesma empresa — reforma sancionada nov/2025).
Não misturar aqui; os proventos já têm tabela própria (`qmix_invest.proventos`).
