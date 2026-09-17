# Indexadores - Rapid URL Indexer

Pasta destinada ao envio de conteudos para indexacao via API do Rapid URL Indexer.

## Credenciais

- API Key: `<<REMOVIDO>>`
- Header obrigatorio: `X-API-Key: <chave>`
- Base URL: `https://rapidurlindexer.com/wp-json/api/v1`
- Rate limit: 100 requisicoes por minuto
- ATENCAO: o LiteSpeed do site bloqueia o User-Agent padrao do curl (403).
  Sempre enviar `-A "Mozilla/5.0 ..."`.

## Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/credits/balance` | Saldo de creditos |
| GET | `/projects/list` | Lista todos os projetos |
| POST | `/projects` | Cria projeto e envia URLs |
| GET | `/projects/{id}` | Status de um projeto |
| GET | `/projects/{id}/report` | Relatorio (CSV padrao, JSON com `Accept: application/json`) |

## Exemplos

Saldo:
```bash
curl -s -A "Mozilla/5.0" -H "X-API-Key: <<REMOVIDO>>" \
  https://rapidurlindexer.com/wp-json/api/v1/credits/balance
```

Enviar URLs:
```bash
curl -s -X POST -A "Mozilla/5.0" \
  -H "X-API-Key: <<REMOVIDO>>" \
  -H "Content-Type: application/json" \
  -d '{"project_name":"nome do lote","urls":["https://exemplo.com/a","https://exemplo.com/b"],"notify_on_status_change":false,"apex_mode_enabled":false}' \
  https://rapidurlindexer.com/wp-json/api/v1/projects
```

## Creditos

- 1 credito = 1 URL (modo normal)
- Apex Mode = 3 creditos por URL (crawl em ~5 min, ate 3 tentativas, 1 credito devolvido se nao indexar)
- Creditos nao expiram
- URLs nao indexadas em 14 dias tem os creditos devolvidos automaticamente
- Ate 9.999 URLs por projeto

---

# SerpApi - Verificacao de Indexacao

Usada para checar se uma URL ja esta indexada no Google (busca `site:URL`).

- API Key: `<<REMOVIDO>>`
- Conta: qmixdigital@gmail.com | Plano Developer ($75/mes, 5.000 buscas/mes)
- Renovacao: dia 15 de cada mes
- Rate limit: 1.000 buscas por hora
- 1 busca = 1 credito = 1 URL verificada

## Saldo
```bash
curl -s "https://serpapi.com/account?api_key=<<REMOVIDO>>"
```

## Verificar se uma URL esta indexada
```bash
curl -s -G "https://serpapi.com/search.json" \
  --data-urlencode "engine=google" \
  --data-urlencode "q=site:https://exemplo.com/pagina" \
  --data-urlencode "google_domain=google.com.br" \
  --data-urlencode "gl=br" --data-urlencode "hl=pt-br" \
  --data-urlencode "api_key=<<REMOVIDO>>"
```
Se `organic_results` vier vazio (ou com `error`), a URL nao esta indexada.
