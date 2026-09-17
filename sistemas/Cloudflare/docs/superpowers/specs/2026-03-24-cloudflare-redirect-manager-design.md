# Cloudflare Redirect Manager — Design Spec

## Objetivo

Script Python CLI para gerenciar Single Redirect Rules de todas as zonas da conta Cloudflare, operado via Claude Code no VS Code. O usuário pede em linguagem natural e o Claude Code executa os comandos internamente.

## Estrutura do projeto

```
d:\SISTEMAS\Cloudflare\
├── .env                    # Token e Account ID (não commitado)
├── .gitignore
├── requirements.txt        # Dependências Python
├── cf_redirects.py         # Script principal
├── CLAUDE.md               # Instruções para Claude Code
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-03-24-cloudflare-redirect-manager-design.md
```

## Configuração

### `.env`

```env
CF_API_TOKEN=<token_da_api_cloudflare>
CF_ACCOUNT_ID=9ecbf885a61a34c6ac4d73033fa0f497
```

### `.gitignore`

```
.env
```

## Comandos

### `listar`

Lista todas as zonas da conta e para cada uma verifica se existem redirect rules, mostrando status (ativa/inativa).

```bash
python cf_redirects.py listar
```

Saída esperada:

```
cinemateca.com.br          | 2 regras (2 ativas, 0 inativas)
consultaplacabrasil.com    | 0 regras
folhaum.com                | 1 regra (0 ativas, 1 inativa)
...
```

### `regras <dominio>`

Mostra detalhes das redirect rules de um domínio.

```bash
python cf_redirects.py regras cinemateca.com.br
```

Saída esperada:

```
Zona: cinemateca.com.br (ID: 2d77df771939a7e5325247b035d4dd83)

  #1 [ATIVA] Redirecionar da raiz para WWW
     cinemateca.com.br/* → www.cinemateca.com.br/${1}
     Status: 301 | ID: a711178582794c22ba0054e304dea34d

  #2 [ATIVA] Redirecionar para domínio diferente
     www.cinemateca.com.br → agendatarsila.com.br
     Status: 301 | ID: f16cb69e56dd4577b750e2db3ffcefb4
```

### `ativar <dominio> [rule_id|--all]`

Ativa uma rule específica pelo ID ou todas do domínio com `--all`.

```bash
python cf_redirects.py ativar cinemateca.com.br f16cb69e56dd4577b750e2db3ffcefb4
python cf_redirects.py ativar cinemateca.com.br --all
```

### `desativar <dominio> [rule_id|--all]`

Desativa uma rule específica ou todas do domínio.

```bash
python cf_redirects.py desativar cinemateca.com.br --all
```

### `ativar-todos`

Ativa todos os redirects de todas as zonas da conta. Pede confirmação antes.

```bash
python cf_redirects.py ativar-todos
```

### `desativar-todos`

Desativa todos os redirects de todas as zonas. Pede confirmação antes.

```bash
python cf_redirects.py desativar-todos
```

### `criar <dominio> <destino> [--status-code 301]`

Cria um Single Redirect para redirecionar todo o tráfego de um domínio para outro.

```bash
python cf_redirects.py criar cinemateca.com.br https://agendatarsila.com.br
python cf_redirects.py criar cinemateca.com.br https://agendatarsila.com.br --status-code 302
```

Template do redirect criado (usa wildcard_replace, compatível com a API):

```
Expression: (http.request.full_uri wildcard r"https://<dominio>/*" or http.request.full_uri wildcard r"https://www.<dominio>/*")
Target: wildcard_replace(http.request.full_uri, r"https://*.<dominio>/*", r"https://<destino>/${2}")
Status: 301 (ou conforme --status-code)
Preserve query string: true
```

Nota: Se `concat()` funcionar na API (testar na implementação), preferir:
```
Expression: (http.host eq "<dominio>" or http.host eq "www.<dominio>")
Target: concat("https://<destino>", http.request.uri.path)
```

### `deletar <dominio> <rule_id>`

Remove uma redirect rule de um domínio.

```bash
python cf_redirects.py deletar cinemateca.com.br f16cb69e56dd4577b750e2db3ffcefb4
```

### `criar-lote <arquivo.csv>`

Cria redirects em massa a partir de CSV.

```bash
python cf_redirects.py criar-lote redirects.csv
```

Formato do CSV:

```csv
origem,destino,status_code
cinemateca.com.br,https://agendatarsila.com.br,301
folhaum.com,https://diariodegoiania.com,302
```

## Arquitetura do script

### Dependências

- `requests` — chamadas HTTP à API da Cloudflare
- `python-dotenv` — leitura do `.env`
- Bibliotecas padrão: `argparse`, `json`, `csv`, `sys`, `concurrent.futures`

### `requirements.txt`

```
requests>=2.31.0
python-dotenv>=1.0.0
```

### API Cloudflare utilizada

| Operação | Método | Endpoint |
|----------|--------|----------|
| Listar zonas (paginado) | GET | `/client/v4/zones?account.id={account_id}&per_page=50&page={n}` |
| Listar rulesets da zona | GET | `/client/v4/zones/{zone_id}/rulesets` |
| Detalhes do ruleset | GET | `/client/v4/zones/{zone_id}/rulesets/{ruleset_id}` |
| Atualizar rule (ativar/desativar) | PATCH | `/client/v4/zones/{zone_id}/rulesets/{ruleset_id}/rules/{rule_id}` |
| Criar rule | POST | `/client/v4/zones/{zone_id}/rulesets/{ruleset_id}/rules` |
| Criar ruleset (se não existir) | POST | `/client/v4/zones/{zone_id}/rulesets` |
| Deletar rule | DELETE | `/client/v4/zones/{zone_id}/rulesets/{ruleset_id}/rules/{rule_id}` |

### Paginação de zonas

A listagem de zonas usa `per_page=50`. Se `result_info.total_pages > 1`, iterar com `page=2`, `page=3`, etc. até obter todas as zonas.

### Paralelismo na listagem

O comando `listar` faz 1 + N chamadas (1 para zonas + N para rulesets). Com 42+ zonas, usar `concurrent.futures.ThreadPoolExecutor(max_workers=10)` para paralelizar as chamadas de rulesets.

### Fluxo de ativar/desativar

1. Buscar zone_id pelo nome do domínio (`GET /zones?name=<dominio>`)
2. Buscar rulesets da zona, filtrar por phase `http_request_dynamic_redirect`
3. Buscar rules dentro do ruleset
4. `PATCH` na rule com `{"enabled": true}` ou `{"enabled": false}`
5. Fallback: se PATCH individual falhar, `GET` o ruleset completo, modificar o campo `enabled` em memória, e `PUT` o ruleset inteiro de volta

### Fluxo de criar redirect

1. Buscar zone_id pelo nome do domínio
2. Buscar rulesets da zona, filtrar por phase `http_request_dynamic_redirect`
3. Se ruleset não existir: `POST /zones/{zone_id}/rulesets` com phase `http_request_dynamic_redirect`
4. `POST /zones/{zone_id}/rulesets/{ruleset_id}/rules` com a rule de redirect

### Tratamento de erros

- Token inválido ou expirado → mensagem clara pedindo para atualizar `.env`
- Domínio não encontrado → mensagem com sugestões de domínios similares
- Permissão negada → mensagem indicando qual permissão falta
- Rate limiting (429) ou erro transiente (500/502/503) → retry com backoff exponencial (delay inicial 1s, multiplicador 2x, max 3 tentativas)
- Limite de regras por zona excedido → mensagem clara informando o limite do plano

## CLAUDE.md

O arquivo `CLAUDE.md` na raiz do projeto conterá instruções para que o Claude Code saiba:

1. O projeto é um gerenciador de redirects Cloudflare
2. O token está em `.env` — nunca expor em mensagens
3. Como mapear pedidos do usuário para comandos do script
4. Exemplos de mapeamento:
   - "liste os domínios" → `python cf_redirects.py listar`
   - "mostre as regras do cinemateca.com.br" → `python cf_redirects.py regras cinemateca.com.br`
   - "desative tudo" → `python cf_redirects.py desativar-todos`
   - "redirecione X para Y" → `python cf_redirects.py criar X Y`

## Segurança

- `.env` no `.gitignore`, nunca commitado
- Token nunca exibido em outputs do script
- Operações em massa pedem confirmação (`--yes` para skip)
- Quando chamado via Claude Code, o Claude passa `--yes` explicitamente (o script nunca auto-detecta quem o está chamando)
- Todos os comandos suportam `--json` para saída estruturada (facilita parsing pelo Claude Code)
