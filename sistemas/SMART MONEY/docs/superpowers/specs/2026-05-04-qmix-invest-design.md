# QMIX Invest — Design Specification

| Campo | Valor |
|---|---|
| **Projeto** | QMIX Invest |
| **Data do design** | 2026-05-04 |
| **Status** | Aguardando revisão final do usuário |
| **Owner** | qmixdigital@gmail.com |
| **Working dir local** | `d:\SISTEMAS\SMART MONEY\` |
| **Diretório de produção** | `/opt/qmix-invest/` na VPS srv1166087 |
| **Subdomínio** | `qf.qmix.digital` (a configurar) |
| **Próximo passo após aprovação** | Plano de implementação via skill `superpowers:writing-plans` |

---

## 1. Resumo executivo

QMIX Invest é uma ferramenta pessoal de inteligência financeira que monitora o mercado brasileiro (B3) para identificar movimentos coordenados de "smart money" — insiders, fundos institucionais brasileiros e estrangeiros — em ações listadas, com foco em small caps. O sistema cruza fontes públicas oficiais (CVM, SEC, B3, Anbima) com sinais técnicos para gerar **scores determinísticos auditáveis** de entrada e saída. Uma camada de IA gera teses de investimento e relatórios consolidados em linguagem natural. Alertas e relatório matinal são entregues via bot Telegram. Sistema é totalmente encapsulado em Docker Compose na VPS Hostinger srv1166087, sem qualquer impacto sobre os outros sites/bots já hospedados.

### Decisões macro consolidadas

| Decisão | Escolha |
|---|---|
| Uso | Pessoal (sem multi-tenant, sem billing, sem auth complexo) |
| Horizonte de investimento | Misto: filtro estrutural longo prazo (B+C) + timing semanal de entrada |
| Universo monitorado | B3 inteira (~400 tickers), viés analítico para small caps |
| Direcionalidade | Bidirecional: sinais de entrada (compra) + sinais de saída (venda) |
| Provider de IA | DeepSeek inicialmente (testes); migração para top-tier (Claude Opus 4.7 ou equivalente) quando maduro — abstração de provider permite troca sem refactor |
| Canal de entrega | Bot Telegram (webhook) |
| Frequência | Relatório matinal diário + alertas pontuais quando IA detecta convergência |
| VPS | Hostinger srv1166087 (KVM 8: 8 vCPU, 32 GB RAM, 400 GB SSD, São Paulo) |
| Encapsulamento | Docker Compose total — uninstall em uma linha, sem afetar outros sites |
| Stack | Next.js 15 + Drizzle ORM + PostgreSQL 17 + pg-boss + grammY + Anthropic SDK / OpenAI SDK / DeepSeek (via abstração) |
| Custo de dados | R$ 0/mês (todas fontes gratuitas; proxies opcionais ~US$ 50/mês para SEC) |
| Custo de IA estimado | R$ 30-80/mês (DeepSeek) → R$ 300-510/mês (Opus 4.7 quando migrar) |

---

## 2. Stack técnica consolidada

| Camada | Escolha | Razão |
|---|---|---|
| Framework web | Next.js 15 (App Router, TypeScript, Tailwind v4) | Padrão do usuário; "NextPuro" sem CMS |
| ORM | Drizzle | Type-safe, leve, migrations limpas |
| Banco | PostgreSQL 17 (container dedicado) | Único banco para dados + filas |
| Fila de jobs | pg-boss | Usa Postgres como fila — sem Redis |
| Worker | Node.js + TypeScript (mesmo monorepo, processo separado) | Processo dedicado para jobs longos sem bloquear app |
| IA | Abstração `AIProvider` com implementações para Anthropic, OpenAI, Google, DeepSeek, Mock | Provider trocável via env var |
| Bot Telegram | grammY | Lib moderna TS, melhor DX que `node-telegram-bot-api` |
| Scraping HTML | `cheerio` + `undici` | Performance e simplicidade |
| Scraping PDF | `pdf-parse` + IA `fast` como fallback | Layouts variados de fatos relevantes |
| Logging | `pino` | JSON estruturado, performant |
| Schedules | pg-boss `schedule()` | Cron centralizado na fila, sem `node-cron` solto |
| Tests | `vitest`, `testcontainers`, `playwright`, `msw` | Stack TS nativa |
| Container runtime | Docker + Docker Compose | Encapsulamento total |
| Reverse proxy | Nginx do host (já existe) | Single config file isolado em `conf.d/` |

---

## 3. Topologia de containers e isolamento

### Diagrama

```
+------------------------- Host srv1166087 -----------------------------+
|                                                                       |
|  Nginx (host)                                                         |
|  /etc/nginx/conf.d/qmix-invest.conf                                   |
|  upstream: 127.0.0.1:3010 + 127.0.0.1:3011                            |
|       |                                                               |
|       v                                                               |
|  +--- Rede Docker privada: qmix_invest_internal -----------------+    |
|  |                                                               |    |
|  |   qmix-invest-app    (Next.js, 127.0.0.1:3010)                |    |
|  |   qmix-invest-app-b  (Next.js, 127.0.0.1:3011)                |    |
|  |   qmix-invest-worker   (pg-boss consumer)                     |    |
|  |   qmix-invest-worker-b (pg-boss consumer, redundância)        |    |
|  |   qmix-invest-postgres (5432 interno, NÃO publicado)          |    |
|  |                                                               |    |
|  +---------------------------------------------------------------+    |
|                                                                       |
|  Volumes:                                                             |
|   - qmix-invest-postgres-data (named volume Docker)                   |
|   - /opt/qmix-invest/backups   (bind mount)                           |
|   - /opt/qmix-invest/logs      (bind mount, opcional)                 |
|                                                                       |
+-----------------------------------------------------------------------+
```

### Garantias de isolamento (REQUISITO INVIOLÁVEL)

1. **Postgres NUNCA exposto no host.** Acessível apenas dentro de `qmix_invest_internal`. Os 4 bots WhatsApp existentes (`bot-rest-1`, `bot-sae-1`, `bot-sae-1b`, `bot-afiliado-1`) e os 4 sites QMix não têm rota de rede para esse banco.
2. **Apps Next.js bindam em `127.0.0.1`** (não `0.0.0.0`) — apenas Nginx local enxerga.
3. **Limites cgroups por container:**

   | Container | RAM máx | CPU máx |
   |---|---|---|
   | `app` | 1 GB | 0.5 |
   | `app-b` | 1 GB | 0.5 |
   | `worker` | 4 GB | 2.0 |
   | `worker-b` | 4 GB | 2.0 |
   | `postgres` | 4 GB | 2.0 |
   | **Teto total** | **14 GB** de 32 (44%) | **7** de 8 vCPU |

   Vazamento em qualquer container → contém-se nos limites; outros sites/bots continuam intactos.

4. **Filesystem único** sob `/opt/qmix-invest/`. Nada criado/modificado fora.
5. **Nginx do host:** apenas um arquivo novo `/etc/nginx/conf.d/qmix-invest.conf`. Qualquer mudança aplicada com `nginx -t && systemctl reload nginx` (nunca `restart`).
6. **Cron jobs com `nice -n 19` e `ionice -c 3`** dentro do container — evita starvation de I/O em pregão.
7. **Comando de remoção total deixa VPS limpa:**
   ```bash
   cd /opt/qmix-invest && docker compose down -v
   rm -rf /opt/qmix-invest
   rm /etc/nginx/conf.d/qmix-invest.conf
   nginx -t && systemctl reload nginx
   ```
   Após esses 4 comandos, **não sobra absolutamente nada do projeto na VPS.**

### Layout do filesystem

```
/opt/qmix-invest/
├── docker-compose.yml
├── .env                  # secrets (perm 600, fora do git)
├── .env.example          # template versionado
├── app/                  # código Next.js (Dockerfile próprio)
├── worker/               # código worker (Dockerfile próprio)
├── db/migrations/        # SQL gerado pelo Drizzle Kit
├── backups/              # dumps automáticos (bind mount)
├── logs/                 # logs rotacionados (opcional)
└── scripts/
    ├── deploy.sh
    ├── rollback.sh
    ├── setup-telegram-webhook.sh
    └── bootstrap-historical-data.sh
```

---

## 4. Modelo de dados

### Schemas Postgres

- **`qmix_invest`** — todas as tabelas de domínio.
- **`pgboss`** — criado automaticamente pelo pg-boss; isolado, não tocado manualmente.

### Extensions habilitadas

- `pg_trgm` — busca fuzzy de nomes de empresas/fundos (CVM e SEC escrevem com pequenas variações).
- `btree_gin` — índices compostos para filtros analíticos.
- `pgcrypto` — `digest()` para `source_hash` determinístico (idempotência de scrapers).

### Tabelas de referência

| Tabela | Propósito | PK | Volume estimado |
|---|---|---|---|
| `companies` | Emissoras (1 por CNPJ) | `cnpj` | ~600 |
| `tickers` | Tickers B3 (várias por empresa: ON/PN/UNT) | `ticker` | ~800 |
| `funds` | Fundos rastreados (CVM CDA + SEC 13F) | `id` | ~5.000 |

### Tabelas de série temporal

| Tabela | Granularidade | Volume em 5 anos | Particionamento |
|---|---|---|---|
| `prices_daily` | OHLCV por ticker por dia | ~500k linhas | Não |
| `btc_lending_daily` | Saldo aluguel BTC por ticker por dia | ~500k linhas | Não |
| `foreign_flow_daily` | Fluxo agregado B3 (1 linha/dia útil) | ~1.250 linhas | Não |

Coluna `(ticker, date)` UNIQUE com índice composto.

### Tabelas de eventos discretos

| Tabela | Fonte | Volume estimado |
|---|---|---|
| `insider_transactions` | CVM Resolução 44 | ~2k/mês × 60 meses = ~120k |
| `material_disclosures` | B3 + CVM (≥5%, fatos relevantes) | ~5k-10k/ano |
| `fund_holdings_cvm` | CVM CDA mensal (delay 90d) | **maior tabela**, ~1-2M linhas/mês × 24 meses = 30-50M (candidata a particionamento por `reference_month`) |
| `fund_holdings_sec_13f` | SEC 13F trimestral | ~100k/trimestre × 8 = 800k |

Cada uma tem `source_hash` UNIQUE (`pgcrypto.digest`) → idempotência de scraper.

### Tabelas de usuário (single-user)

| Tabela | Propósito |
|---|---|
| `user_portfolio` | Posições atuais (ticker, qty, preço médio, data compra) — alvo de alertas de saída sensíveis |
| `user_watchlist` | Tickers acompanhados sem posse — alvo de alertas de entrada |
| `user_preferences` | Limiares de alerta, horário do relatório, chat_id Telegram, exclusões setoriais, limite de gasto IA |

### Tabelas de saída do motor

| Tabela | Propósito |
|---|---|
| `signals` | Score agregado por (ticker, date, direction). Inclui `convergence_count` |
| `signal_factors` | Factors individuais que compõem cada signal (1:N) |
| `ai_analyses` | Teses geradas (provider, model, tokens, cost_brl, validated, markdown_text) |
| `alerts_sent` | Histórico de alertas Telegram (idempotência + auditoria) |
| `alert_feedback` | Feedback do usuário (👍/👎) por alerta |
| `daily_reports` | Relatórios matinais em Markdown |

### Tabelas operacionais

| Tabela | Propósito |
|---|---|
| `signal_factor_weights` | Pesos configuráveis dos factors F1-F23 por direção e categoria |
| `cusip_to_ticker` | Mapeamento CUSIP (SEC) → ticker brasileiro |
| `scraper_runs` | Histórico de execuções (timestamp, source, items, errors, duration) |
| `metrics_daily` | Agregados diários para dashboards (sem Prometheus) |
| `pgboss.*` | Schema próprio do pg-boss (não tocado manualmente) |

### Política de retenção

| Dado | Retenção |
|---|---|
| `prices_daily`, `btc_lending_daily` | Forever |
| `insider_transactions`, `material_disclosures` | Forever |
| `fund_holdings_cvm` | 24 meses ativo, ≥24 meses → tabela `_archive` (mesmo schema, sem índices pesados) |
| `signals`, `signal_factors`, `ai_analyses` | Forever |
| `alerts_sent`, `alert_feedback` | Forever |
| `scraper_runs` | 90 dias rolling |
| `metrics_daily` | Forever |
| `pgboss.archive` | 30 dias (default da lib) |

### Backup

- Job pg-boss diário 3h BRT → `pg_dump -Fc | gzip` em `/opt/qmix-invest/backups/qmix_invest_YYYY-MM-DD.sql.gz`.
- Retenção: 14 diários + 1º de cada mês para 12 meses.
- Off-site opcional: `rclone` para Cloudflare R2 ou Backblaze B2 (~R$ 1/mês para esse volume).

### Migrations

- Drizzle Kit gera SQL em `db/migrations/`.
- Migration runner roda no startup do worker com `pg_advisory_lock(123456789)` — `worker-b` espera o primeiro terminar.
- Migrations destrutivas (drop column/table) são manuais — Drizzle não emite por padrão, devem ser revisadas.

---

## 5. Fontes de dados e scrapers

### Inventário das 8 fontes

| # | Fonte | Tipo | Frequência | Proxy? | Custo |
|---|---|---|---|---|---|
| 1 | CVM Resolução 44 (insiders) | CSV aberto | Mensal | Não | R$ 0 |
| 2 | B3/CVM Fatos Relevantes (≥5%) | RSS + PDF | 30 min em pregão | Opcional | R$ 0 |
| 3 | CVM CDA (carteira fundos BR) | CSV aberto | Mensal (delay 90d) | Não | R$ 0 |
| 4 | SEC EDGAR 13F | XML/JSON | Trimestral | Sim (residencial) | R$ 0 |
| 5 | B3 Investidores Estrangeiros (agregado) | CSV | Diária | Não | R$ 0 |
| 6 | B3 Aluguel BTC (stock lending) | CSV | Diária | Não | R$ 0 |
| 7 | B3 Cotações OHLCV (COTAHIST) | TXT/CSV | Diária | Não | R$ 0 |
| 8 | Yahoo Finance (fallback) | API não-oficial | Sob demanda | Sim | R$ 0 |

### Endpoints

| # | URL/origem |
|---|---|
| 1 | `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/VLMO/DADOS/vlmo_cia_aberta_YYYY.csv` |
| 2 | `https://www.rad.cvm.gov.br/` (lista de comunicados) + scraping de PDFs |
| 3 | `https://dados.cvm.gov.br/dados/FI/DOC/CDA/DADOS/cda_fi_YYYYMM.zip` |
| 4 | `https://efts.sec.gov/LATEST/search-index?forms=13F-HR&...` + `https://www.sec.gov/cgi-bin/browse-edgar` |
| 5 | `https://arquivos.b3.com.br/` ou scraping da página de movimentação financeira |
| 6 | `https://arquivos.b3.com.br/apinegocios/aro/securitiesinfundsstocks/{date}` |
| 7 | `https://bvmf.bmfbovespa.com.br/InstDados/SerHist/COTAHIST_DYYYYMMDD.ZIP` (legado) |
| 8 | Lib `yahoo-finance2` (npm) |

URLs exatas serão validadas durante implementação; alguns endpoints da B3 mudam de quando em quando.

### Schedule consolidado

| Job | Cron | Razão |
|---|---|---|
| `scrape-prices-daily` | 18:30 BRT, dias úteis | Após pregão (17:55) + delay para arquivos |
| `scrape-foreign-flow` | 19:00 BRT, dias úteis | T+1 |
| `scrape-btc-lending` | 19:00 BRT, dias úteis | T+1 |
| `scrape-material-disclosures-active` | A cada 30 min, 9-18 BRT | Pregão |
| `scrape-material-disclosures-idle` | A cada 1h, fora pregão | Cobertura sem alta frequência |
| `scrape-cvm-44-insiders` | Semanal segunda 5h BRT | Mensal pública mas reload incremental |
| `scrape-cvm-cda-funds` | Diário 3h BRT (HEAD-check antes) | Calendário CVM ~dia 25 do mês X+3 |
| `scrape-sec-13f` | Diário 4h BRT | Apenas fundos com último 13F > 90d |
| `compute-signals-full` | Reativo (após scrapers) + diário 5:30 BRT (full scan) | |
| `generate-daily-report` | 6:30 BRT, dias úteis | Antes da abertura |
| `backup-database` | 3:00 BRT | Antes da carga pesada do dia |
| `prune-pgboss-archive` | 4:00 BRT | Limpeza |

### Scraper architecture (template comum)

Cada scraper é um job pg-boss com:
- **Idempotência:** `source_hash` UNIQUE em cada tabela alvo, `INSERT ... ON CONFLICT DO NOTHING`.
- **Retry:** exponential backoff `[30s, 2min, 10min, 1h, 6h]` — 5 tentativas. Após isso, `pgboss.archive` + alerta Telegram.
- **Timeout:** 30 min para CSVs grandes (CDA), 5 min para os pequenos.
- **Concorrência:** 1 instância por scraper (singleton via pg-boss `singletonKey`).
- **User-Agent:** `QMIX Invest scraper - contato@qmix.com.br`.
- **Logging:** pino estruturado (latência, status, bytes recebidos).

### Pool de proxies (SEC 13F + Yahoo fallback)

- Provider: a definir (Bright Data, Oxylabs, Smartproxy ou similar). Plano básico residencial rotativo (~US$ 50/mês).
- Configuração via env `PROXY_POOL` (lista CSV de URLs com auth).
- `https-proxy-agent` + round-robin com health check.
- Failover: proxy com 3 falhas em 1h é removido temporariamente.

### Fontes deliberadamente não usadas

| Fonte | Motivo |
|---|---|
| Tape reading B3 (FIX/Nelogica) | R$ 2-15k/mês, e B3 mascara broker ID intraday |
| Anbima | Redundante com CVM CDA, exige login |
| Bloomberg/Refinitiv | Caríssimo, sem ROI para uso pessoal |
| Status Invest / Fundamentus (scraping) | Dados derivados; preferir fonte primária |

---

## 6. Motor de sinais (regras determinísticas)

### Princípios

1. **Auditável:** todo signal explicado pela soma de seus factors.
2. **Determinístico:** dado de entrada igual → score igual.
3. **Configurável sem deploy:** pesos em `signal_factor_weights`.
4. **Backtestable:** histórico de signals + prices_daily permite replay.
5. **Bidirecional simétrico:** mesmo motor, lados entrada e saída.

### Catálogo de factors — ENTRADA

| ID | Factor | Trigger | Peso base | Categoria |
|---|---|---|---|---|
| F1 | Insider compra significativa | Compra > R$ 100k em 30d | +15 | Insider |
| F2 | Cluster de insiders | 2+ insiders comprando em 30d | +10 | Insider |
| F3 | Controlador comprando | Acionista controlador | +20 | Insider |
| F4 | Participação ≥ 5% disclosed | Aquisição relevante em 14d | +25 | Institucional |
| F5 | Participação ≥ 10% disclosed | Tier maior em 14d | +30 | Institucional |
| F6 | Fundo BR aumentou posição | CDA: posição cresceu >50% MoM (sinal lag ~90d) | +10/fundo (cap +30) | Institucional |
| F7 | Fundo US tier-1 entrou | 13F: fundo flagged `is_tier_one` (lista inicial em glossário, configurável) | +15/fundo (cap +30) | Institucional |
| F8 | Drawdown prévio | Queda ≥25% em 90d | +15 | Técnico |
| F9 | Volume anômalo | Vol médio 5d > 200% média 30d | +10 | Técnico |
| F10 | Cobertura de short | Saldo BTC caindo ≥20% em 5d | +15 | Técnico |
| F11 | Reversão técnica | Fechamento > MA21 após drawdown | +10 | Técnico |
| F12 | Vento favorável macro | Fluxo estrangeiro positivo 5d | +5 | Macro |

### Catálogo de factors — SAÍDA

| ID | Factor | Trigger | Peso base | Categoria |
|---|---|---|---|---|
| F13 | Insider venda significativa | Venda > R$ 100k em 30d, **excluindo exercício de opção** | +15 | Insider |
| F14 | Cluster de insiders vendendo | 2+ vendendo em 30d | +10 | Insider |
| F15 | Controlador vendendo | Mais raro = mais relevante | +25 | Insider |
| F16 | Saída de participação | Disclosure caindo abaixo de 5/10/15% | +20 | Institucional |
| F17 | Fundo BR reduziu | CDA: posição caiu >50% MoM (sinal lag ~90d) | +10/fundo (cap +30) | Institucional |
| F18 | Fundo US tier-1 saiu | 13F: fundo flagged `is_tier_one` zerou/reduziu posição | +15/fundo (cap +30) | Institucional |
| F19 | Quebra técnica | Quebra MA200 para baixo após topo | +10 | Técnico |
| F20 | Volume anômalo de venda | Vol negativo 5d > 200% média | +10 | Técnico |
| F21 | Shorts montando | Saldo BTC subindo ≥30% em 5d | +15 | Técnico |
| F22 | Drawdown sem notícia | Queda ≥5% intraday sem fato relevante | +10 | Técnico |
| F23 | Vento contrário macro | Fluxo estrangeiro negativo 5d | +5 | Macro |

### Regras de agregação

```
score = min(100, sum(factor_weights))

if categorias_distintas_presentes >= 3:
    score += 10                    # bônus de convergência

if ticker.is_small_cap:
    score *= 1.2                   # multiplicador small cap

score = min(100, round(score))
```

### Triggers de alerta

| Condição | Ação |
|---|---|
| Score entrada ≥ 70 em watchlist | Alerta Telegram imediato |
| Score entrada ≥ 80 em qualquer ticker | Alerta Telegram imediato |
| Score entrada ≥ 60 (qualquer ticker) | Entra no relatório matinal |
| Score saída ≥ 80 em portfólio | **Alerta crítico imediato** + repete em 4h se não confirmado |
| Score saída ≥ 60 em portfólio | Entra no relatório matinal |
| Score saída ≥ 70 (qualquer ticker) | Entra no relatório matinal |

### Anti-spam

- Mesmo alerta (mesmo ticker + direção + score-band) não envia 2x em 24h (idempotência via `alerts_sent`).
- Máximo 5 alertas críticos/dia. Acima disso, agrega num super-alerta resumido.

### Pipeline de computação

```
[scraper termina] -> recalculate-factors:{ticker}
                          |
                          v
                   recalcula F1..F23 desse ticker
                          |
                          v
                   aggregate-signals:{ticker, date}
                          |
                          v
                   evaluate-alerts:{signal_id}
                          |
            +-------------+-------------+
            |                           |
            v                           v
       send-alert (Telegram)    ai-analysis (se score >= 70)
```

Cron paralelo `generate-daily-report` 6:30 BRT lê top 10 entry + top 5 exit signals e chama IA `powerful` para relatório consolidado.

### Backtest mode

Job `backtest`:
- Input: range de datas + conjunto de pesos.
- Para cada dia, recalcula scores **usando apenas dados disponíveis naquela data** (simula latência real das fontes).
- Compara contra prices_daily nos 30/60/90 dias seguintes.
- Output: hit rate, retorno médio, distribuição de scores.

### Performance computacional

- 1 ticker: ~50ms (queries indexadas).
- B3 inteira (~400 tickers): ~5s paralelizado em 8 workers.
- Volume diário: ~400 signals + 2-5k signal_factors.

### Fora do escopo v1

- Análise fundamentalista (P/L, ROE, dividend yield).
- Sinais técnicos puros (RSI, MACD, candlestick).
- Sentiment de notícias / redes sociais (candidato a Seção 6 futura).

---

## 7. Camada de IA

### Princípio: provider-agnostic

Sistema **nunca chama API de IA diretamente**. Toda chamada passa por interface `AIProvider`. Trocar de provider = mudar 2 variáveis de ambiente, sem refactor.

### Tiers abstratos → modelos concretos

| Tier | Anthropic | OpenAI | Google | DeepSeek | Mock (testes) |
|---|---|---|---|---|---|
| `fast` | Haiku 4.5 | GPT-5 mini | Gemini Flash | DeepSeek-V3 | Texto canned |
| `balanced` | Sonnet 4.6 | GPT-5 | Gemini Pro | DeepSeek-V3 | Texto canned |
| `powerful` | Opus 4.7 | GPT-5 Pro / o3 | Gemini Ultra | DeepSeek-R1 | Texto canned |

### Configuração

```env
AI_PROVIDER=deepseek                  # anthropic | openai | google | deepseek | mock
AI_API_KEY=<rotated_key_in_dotenv>
AI_FALLBACK_PROVIDER=mock
AI_MONTHLY_BUDGET_BRL=500             # alerta se ultrapassar
```

**Rotação inicial planejada:** começar com DeepSeek-V3/R1 (custo ~10× menor que Opus) durante validação; migrar para Claude Opus 4.7 ou GPT-5 Pro quando o sistema estiver maduro.

### Estrutura de código

```
lib/ai/
├── types.ts                  # interface AIProvider, AIInput, AIOutput
├── providers/
│   ├── anthropic.ts          # @anthropic-ai/sdk + prompt caching
│   ├── openai.ts             # openai SDK + prompt caching
│   ├── google.ts             # @google/generative-ai
│   ├── deepseek.ts           # compatível com SDK OpenAI
│   └── mock.ts               # texto fixo para testes/CI
├── factory.ts                # lê AI_PROVIDER, instancia o certo
├── cost-tracker.ts           # grava em ai_analyses
├── pricing.ts                # tabela de preços por provider
└── retry.ts                  # retry/failover
```

### Papéis por tier

| Job | Tier | Razão |
|---|---|---|
| Extração estruturada de PDF de fato relevante | `fast` | Output JSON curto |
| Tese individual (signal score ≥ 70) | `powerful` | Análise nuançada |
| Relatório matinal consolidado | `powerful` | Síntese top 10 |
| Resumo curto Telegram (160 chars) | `fast` | Compressão |
| Validador anti-alucinação | `balanced` | Verificador independente |
| Classificação de tipo de transação insider | `fast` | Compra normal vs. exercício de opção |

### Estrutura do prompt com caching

```
[CACHED]
1. System prompt: papel, tom, formato
2. Metodologia: explicação dos 23 factors, regras de agregação
3. Glossário: B3, CVM, smart money 101
4. Few-shot examples: 3-4 teses de referência

[NÃO CACHED]
5. Dados estruturados do ticker:
   - JSON do signal atual
   - Histórico de preços últimos 90d
   - Insider transactions últimos 6 meses
   - Fund holdings (CDA + 13F) últimos 12 meses
   - Fatos relevantes últimos 30d
6. Pergunta: "Gere a tese para este ticker"
```

Providers sem caching (DeepSeek atual, Google v1) pagam preço cheio sem refactor.

### Anti-alucinação

Após cada geração `powerful`, job `balanced` recebe (tese + dados brutos) e classifica cada afirmação como `OK` ou `UNSOURCED`. Se houver `UNSOURCED`, regenera com prompt mais estrito (max 2 retries). Após falha final, marca `validated: false` e envia alerta com factors brutos sem narrativa.

### Cost tracking

Cada chamada grava em `ai_analyses`: `provider`, `model_used`, `tier`, `tokens_in`, `tokens_out`, `cache_read_tokens`, `cache_write_tokens`, `cost_brl`, `latency_ms`, `validated`.

Dashboard `/admin/costs` mostra: custo dia/semana/mês, custo por tier, custo por job, cache hit rate, latência p50/p95.

Alerta Telegram quando atinge `AI_MONTHLY_BUDGET_BRL`.

### Estimativas de custo mensal

Premissas: 5 teses `powerful`/dia × 22 dias = 110 + 22 relatórios + 1100 extrações `fast` + 110 validações `balanced`.

| Provider | Estimativa |
|---|---|
| DeepSeek-R1 | R$ 30-80 |
| Anthropic Sonnet 4.6 | R$ 80-150 |
| Anthropic Opus 4.7 | R$ 300-510 |
| OpenAI GPT-5 Pro | R$ 280-480 |
| Google Gemini Ultra | R$ 200-400 |

### Modos de falha

| Cenário | Ação |
|---|---|
| Provider primário 5xx | Retry exponencial 3x |
| Provider down 5min+ | Fallback para `AI_FALLBACK_PROVIDER` |
| Latência > 60s | Cancela, registra, alerta |
| Validador detecta alucinação 2x | Envia alerta sem narrativa |
| Limite mensal atingido | Pausa geração de teses (mantém signals brutos), avisa |
| JSON malformado | Retry com `temperature: 0` e schema explícito |

### Fora do escopo v1

- Fine-tuning ou treinamento próprio.
- RAG sobre histórico de relatórios.
- Multi-agent debate.
- Sentiment de notícias (provavelmente Seção 6 futura).

---

## 8. Bot Telegram

### Modelo: webhook (não polling)

- URL: `https://qf.qmix.digital/api/telegram/webhook`
- Route handler: `app/api/telegram/webhook/route.ts`
- Validação: header `X-Telegram-Bot-Api-Secret-Token` contra `TELEGRAM_WEBHOOK_SECRET`.

### Configuração (env)

```env
TELEGRAM_BOT_TOKEN=<from_BotFather>
TELEGRAM_WEBHOOK_SECRET=<random_64_chars>
TELEGRAM_OWNER_CHAT_ID=<your_personal_chat_id>
```

### Filtro de autorização

Webhook só processa mensagens de `chat_id === TELEGRAM_OWNER_CHAT_ID`. Outras são silenciosamente ignoradas (200 vazio, sem leak).

### Setup inicial

1. BotFather: `/newbot` → token + handle.
2. Mandar `/start` ao bot → captura chat_id.
3. Setup do webhook:
   ```bash
   curl -F "url=https://qf.qmix.digital/api/telegram/webhook" \
        -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
        -F "drop_pending_updates=true" \
        "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook"
   ```

### Catálogo de comandos

**Geral**
- `/start`, `/ajuda`

**Portfólio**
- `/portfolio`, `/portfolio_add TICKER QTY PRECO_MEDIO`, `/portfolio_remove TICKER`

**Watchlist**
- `/watchlist`, `/watchlist_add TICKER`, `/watchlist_remove TICKER`

**Consulta**
- `/score TICKER`, `/tese TICKER`, `/sinais [entrada|saida] [N]`, `/insiders TICKER`, `/fundos TICKER`

**Relatórios**
- `/relatorio`, `/relatorio AAAA-MM-DD`

**Configuração**
- `/config`, `/limiar TIPO VALOR`, `/pausar 4h`, `/retomar`, `/custo`

**Admin**
- `/recalcular TICKER`, `/scrapers`, `/jobs`, `/diag`

### Inline buttons

| Botão | Callback |
|---|---|
| `Ver tese completa` | Envia mensagem com markdown completo |
| `+ Watchlist` | Adiciona à watchlist |
| `Confirmar ciência` | Marca alerta como visto (suprime repetição 4h) |
| `👍 Útil` / `👎 Não útil` | Grava em `alert_feedback` |

### Mensagens longas

- Limite Telegram: 4096 chars/mensagem.
- Relatório matinal: split em chunks numerados ("1/3", "2/3").
- Alternativa para relatórios > 12k chars: gera PDF (puppeteer) e envia como `sendDocument`.

### Resiliência

| Cenário | Estratégia |
|---|---|
| API Telegram 5xx | Retry exponencial 3x via pg-boss |
| API 429 | Respeita `retry_after`, reagenda |
| Webhook timeout | Job pesado vai para fila; webhook responde 200 imediato |
| Bot bloqueado (improvável) | Detecta 403, grava status, pausa envios |

### Estrutura de código

```
app/api/telegram/
├── webhook/route.ts
├── lib/
│   ├── bot.ts
│   ├── commands/
│   │   ├── portfolio.ts
│   │   ├── watchlist.ts
│   │   ├── score.ts
│   │   ├── tese.ts
│   │   └── ...
│   ├── callbacks/
│   ├── format/
│   │   ├── escape.ts          # escapeMarkdownV2
│   │   ├── alert.ts
│   │   └── report.ts
│   └── send.ts
```

UX (cores, ícones, layout dos cards) é polimento final declarado pelo usuário — modificações ficam isoladas em `format/*.ts`.

---

## 9. Deploy zero-downtime

### Topologia que viabiliza

- 2× `qmix-invest-app` em portas 127.0.0.1:3010 e 3011.
- 2× `qmix-invest-worker`.
- Nginx upstream com `max_fails=2 fail_timeout=10s` + `proxy_next_upstream error timeout http_502 http_503`.

### Script `scripts/deploy.sh`

Etapas (resumo):
1. Snapshot do estado atual (tag `:previous`, `.deploy-prev-commit`).
2. `git pull` + `docker compose build`.
3. Roll `app` → aguarda healthcheck → roll `app-b`.
4. Roll `worker` → roll `worker-b`.
5. **Verificação crítica:** `curl -I` aos 4 outros sites da VPS (acesso, acesso2, chatbotbrx, editor) — se algum responde fora de 200/301/302/401/403, rollback automático.
6. `pm2 jlist` checa se os 4 bots WhatsApp continuam `online`.
7. Sucesso → `prune` imagens antigas, tag `:previous`, notifica Telegram.

### Script `scripts/rollback.sh`

Reverte tags de imagens, recria containers, `git reset --hard` ao commit anterior, notifica Telegram.

### Migrations zero-downtime

| Tipo | Estratégia |
|---|---|
| Coluna nullable / com default | Direto |
| `NOT NULL` sem default | 2 deploys (nullable + backfill, depois NOT NULL) |
| Rename | 3 deploys (add new, dual-write, drop old) |
| Drop | 2 deploys (stop using, depois drop) |
| Adicionar índice | `CREATE INDEX CONCURRENTLY` |

Migration runner usa `pg_advisory_lock(123456789)` — segundo worker espera o primeiro terminar.

### CI/CD

- Pre-push hook local: `vitest run` + `tsc --noEmit`.
- GitHub Actions (push para `main`): lint + tests + build (sem deploy).
- Deploy: **manual via SSH** rodando `./scripts/deploy.sh`. Automatização futura opcional.

---

## 10. Observabilidade

### Logging

- pino JSON estruturado em cada container.
- Docker `json-file` driver com rotação (`max-size: 50m`, `max-file: 5`).
- Acesso: `docker compose logs -f --tail=100 worker`.

### Health endpoints

- `GET /api/health` (público) — JSON com `database`, `queue`, `ai_provider`, `telegram` checks.
- `GET /api/admin/diag` (autenticado) — detalhado.

### Métricas em SQL

Tabela `metrics_daily` agregada por job pg-boss diário:
- `scrapers_run_count`, `scrapers_success_rate`
- `ai_calls_count`, `ai_total_cost_brl`, `ai_avg_latency_ms`
- `signals_generated`, `alerts_sent`
- `db_size_mb`, `disk_usage_pct`

Painel `/admin/metrics` no Next.js renderiza com Recharts. Sem Prometheus/Grafana (overkill).

### Alertas operacionais (Telegram)

| Condição | Severidade |
|---|---|
| Scraper falhou 5x consecutivas | Crítico |
| AI provider erro 2 chamadas seguidas | Crítico |
| Disco > 85% | Crítico |
| RAM container > 90% por 5 min | Aviso |
| Queue pg-boss > 1000 pending | Aviso |
| Outros sites VPS retornando 5xx (poll 5min) | Crítico |
| Custo IA mês > limite | Aviso |
| Backup diário falhou | Crítico |

---

## 11. Plano de testes

### Stack

`vitest` + `@testcontainers/postgresql` + `playwright` + `msw`.

### Pirâmide

| Nível | Velocidade | Cobertura mínima |
|---|---|---|
| Unit | <10ms | `lib/signals/factors/*` 100%, `lib/signals/aggregate.ts` 100%, `lib/ai/providers/*` 90%+ |
| Integration (DB) | 100ms-1s | Lógica + Postgres real |
| Integration (scraper) | 1-5s | Snapshot CSV/PDF + parsing |
| Integration (AI) | <100ms (mock) | Geração com `MockProvider` |
| E2E | 5-30s | Fluxos críticos do dashboard |
| Smoke (pós-deploy) | <30s | curl /api/health + 4 outros sites |

### Backtest contínuo

Job pg-boss `backtest-regression` semanal (domingo):
1. 30 signals aleatórios dos últimos 6 meses.
2. Re-executa motor contra mesmos dados.
3. Confirma reprodução com ±5%.
4. Desvio → alerta Telegram.

### Fixtures

```
tests/fixtures/
├── cvm/vlmo_2025_03.csv
├── cvm/cda_fi_BLC_4_202601.csv
├── sec/13f_brk_2025q1.xml
├── b3/cotahist_20260301.txt
└── pdfs/material-disclosure-vitt3.pdf
```

---

## 12. Bootstrap inicial

| Etapa | Duração | Volume |
|---|---|---|
| Companies + Tickers + Funds | 1h | ~6k linhas |
| Cotações OHLCV últimos 5 anos | 4-8h | ~500k |
| Insider transactions últimos 3 anos | 2h | ~30k |
| Material disclosures últimos 2 anos | 6h (PDFs + IA) | ~5k eventos |
| CDA fundos últimos 24 meses | 8-12h | ~30-50M |
| 13F SEC top-200 fundos × 4 trimestres | 4h (com proxy) | ~100k |
| BTC lending últimos 2 anos | 1h | ~200k |
| Foreign flow agregado últimos 2 anos | 30min | ~500 |

**Total: 1-2 dias rodando como jobs pg-boss prioridade baixa, sem bloquear nada.**

Após bootstrap, full-scan inicial gera signals "iniciais" — usuário revisa em modo dry-run antes de ativar Telegram.

### Modo dry-run

Variável `MODE=dry-run`:
- Scrapers, motor, IA rodam normalmente.
- **Telegram NÃO envia** — apenas loga o que enviaria.

Recomendação: 1-2 semanas em dry-run, ajusta pesos via `signal_factor_weights`, depois `MODE=live`.

---

## 13. Checklist de produção

Antes de declarar "rodando":

- [ ] Migrations aplicadas
- [ ] Bootstrap histórico completo
- [ ] Scrapers rodaram ≥1 ciclo full sem erro
- [ ] Motor de signals gerou ≥1 batch
- [ ] IA respondeu ≥5 chamadas com sucesso (incl. validador)
- [ ] Telegram bot responde a `/start` e `/portfolio`
- [ ] Webhook configurado e validado
- [ ] Backup diário rodou ≥1 vez
- [ ] Alertas operacionais testados (forçar 1 falha de scraper)
- [ ] Modo dry-run rodou ≥7 dias com signals coerentes
- [ ] Verificação automática dos outros 4 sites pós-deploy: OK
- [ ] PM2 dos 4 bots WhatsApp existentes: todos `online` após deploy

---

## 14. Glossário

| Termo | Significado |
|---|---|
| **Smart money** | Investidores institucionais e insiders cujo comportamento tende a anteceder movimentos de preço |
| **Insider** | Diretor, conselheiro ou controlador de empresa listada (CVM Resolução 44) |
| **CVM CDA** | Composição da Carteira de Fundos (mensal, delay 90d) |
| **SEC 13F** | Filing trimestral obrigatório para fundos US ≥ US$ 100mi |
| **Fato relevante** | Comunicado obrigatório de mudança material (incl. participação ≥5%) |
| **BTC** | Banco de Títulos da B3 — mercado de aluguel de ações |
| **COTAHIST** | Arquivo legado da B3 com cotações históricas |
| **Factor** | Sinal individual binário (presente/ausente) com peso |
| **Signal** | Score agregado de factors para um (ticker, date, direction) |
| **Convergence** | Quando 3+ categorias diferentes (insider/inst./técnico/macro) apontam mesmo lado |
| **NextPuro** | Apelido pessoal do usuário para "Next.js puro sem CMS" (não é um produto) |
| **Small cap** | Para este projeto, ticker com capitalização de mercado abaixo de R$ 10 bi. Coluna `is_small_cap` em `tickers` é recalculada mensalmente a partir de `prices_daily.close × shares_outstanding`. Threshold é configurável em `signal_factor_weights.notes` ou em uma constante derivada. |
| **Tier-1 fund** | Lista configurável de fundos cujo movimento amplifica F7/F18. Lista inicial: Berkshire Hathaway, Bridgewater, Capital Group, Soros Fund Management, Tiger Global, Renaissance Technologies, Two Sigma, AQR. Mantida em tabela `funds` via flag `is_tier_one`. |

---

## 15. O que está fora do escopo da v1

- Análise fundamentalista (P/L, ROE etc.)
- Sinais técnicos puros (RSI, MACD)
- Sentiment de notícias / redes sociais (candidata a v2)
- Multi-tenant / billing / SaaS (uso pessoal apenas)
- Mobile app (Telegram supre)
- Alertas via WhatsApp/SMS/Email (Telegram supre)
- Trading automatizado (sistema é informativo, não executor)
- RAG sobre histórico (candidato a v2)
- Multi-agent debate

---

## 16. Memórias do projeto referenciadas

Decisões registradas em `C:\Users\User\.claude\projects\d--SISTEMAS-SMART-MONEY\memory\`:

- **`no-payload-cms.md`** — User dropped Payload CMS. Stack é "NextPuro" (Next.js puro + Drizzle/Prisma + PostgreSQL).
- **`never-disrupt-shared-vps.md`** — Encapsulamento total via Docker Compose; ações no projeto não podem afetar outros sites/pastas da VPS.

---

## 17. Próximos passos

Após aprovação desta spec:

1. Invocar skill `superpowers:writing-plans` para gerar plano detalhado de implementação (passo-a-passo, com checkpoints de revisão).
2. Plano será dividido em fases:
   - **Fase 0:** infraestrutura (Docker Compose, Postgres, Nginx vhost, Drizzle setup, pg-boss setup).
   - **Fase 1:** scrapers (8 fontes) + tabelas de dados + bootstrap histórico.
   - **Fase 2:** motor de sinais (factors F1-F23, agregação, persistência).
   - **Fase 3:** camada de IA (abstração + provider DeepSeek + prompts + validador).
   - **Fase 4:** bot Telegram (comandos + alertas + relatório matinal + inline buttons).
   - **Fase 5:** dashboard Next.js (admin + métricas + costs + signals).
   - **Fase 6:** testes (unit + integration + E2E + smoke + backtest contínuo).
   - **Fase 7:** deploy, observabilidade, dry-run de 7 dias, go-live.
3. Cada fase tem critérios de pronto e checkpoint de revisão pelo usuário.
