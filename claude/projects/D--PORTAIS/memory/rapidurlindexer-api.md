---
name: rapidurlindexer-api
description: "API de indexação que o Anderson usa - Rapid URL Indexer, com chave, endpoints e a armadilha do 403"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T23:17:49.093Z
---

**Rapid URL Indexer** (https://rapidurlindexer.com/) é a API que o Anderson usa
para **enviar URLs para indexação**. É esta, e não a SerpAPI.

Chave: `<<REMOVIDO>>`
Conta: qmixdigital@gmail.com

## Endpoints

Base: `https://rapidurlindexer.com/wp-json`, header `X-API-Key`.

| Caminho | Método | Para quê |
|---|---|---|
| `/api/v1/credits/balance` | GET | saldo de créditos |
| `/api/v1/projects/list` | GET | projetos já enviados |
| `/api/v1/projects` | POST | **enviar URLs** |
| `/api/v1/projects/{id}` | GET | status do projeto |
| `/api/v1/projects/{id}/report` | GET | relatório, CSV ou JSON pelo `Accept` |

Corpo do POST: `project_name`, `urls` (1 a 9999), `notify_on_status_change`,
`apex_mode_enabled`. Limite de 100 requisições por minuto.

## Regras dadas pelo Anderson

1. **Sempre o modo mais barato.** `apex_mode_enabled: false`, que custa
   **1 crédito por URL**. O modo Apex custa 3 e devolve 1 se não indexar, e
   **não deve ser usado**, nem quando o saldo estiver folgado.
2. **Só enviar quando ele solicitar.** Nunca submeter por iniciativa própria ao
   publicar conteúdo novo, nem como parte de uma rotina de fim de projeto.
   Publicar e indexar são passos separados, e o segundo é decisão dele.
3. **No máximo 30 URLs por projeto** (16/08/2026). Lote maior tem que ser
   quebrado. Eu tinha dividido por tipo de conteúdo e mandei um lote de 32.
4. **Antes de enviar, perguntar quais URLs entram.** Ele não quer gastar
   crédito com página que não interessa, e notícia perecível é o caso típico:
   jogo já disputado, sorteio já realizado, resumo de novela da semana passada.
   Só vale indexar o que tem busca recorrente.

Consultar saldo, listar projetos e ver status **não gastam crédito** e podem ser
feitos quando fizer sentido.

## ⚠️ Armadilha: 403 do LiteSpeed

Sem `User-Agent` de navegador, **todos os endpoints devolvem 403 Forbidden** do
LiteSpeed, mesmo com a chave certa. Sempre mandar
`User-Agent: Mozilla/5.0 ... Chrome/...`. O mesmo vale para a SerpAPI e para o
IndexNow via `urllib` do Python.

## Como isso se encaixa

Indexação de verdade tem três canais no fluxo da rede, e eles se somam:

1. **Rapid URL Indexer**, para empurrar URL específica
2. **IndexNow**, já configurado com chave própria em cada portal, que atinge Bing,
   Yandex, Seznam e Naver
3. **Sitemap no Search Console**, que é o canal do Google

A SerpAPI **não indexa**, ela lê a SERP. Ver [[serpapi-chave]].


## Histórico

| Data | Projeto | URLs | Custo | Saldo depois |
|---|---|---|---|---|
| 15/08/2026 | 1105399, boxnoticias Bastidores | 30 | 30 créditos | 933 |
| 15/08/2026 | 1105553, barranews Umbanda | 32 | 32 créditos | 901 |
| 16/08/2026 | 1106049, agoranoticias Casa (novos) | 30 | 30 créditos | 871 |
| 16/08/2026 | 1106050, agoranoticias atualizados | 32 | 32 créditos | 839 |
| 16/08/2026 | 1106174, clickinfohub Manutenção (novos) | 30 | 30 créditos | 809 |
