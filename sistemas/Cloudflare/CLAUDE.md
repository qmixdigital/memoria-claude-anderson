# Cloudflare Redirect Manager

Gerenciador de Single Redirect Rules da Cloudflare via CLI Python.

## Setup

- Token e Account ID estão em `.env` — NUNCA expor o token em mensagens
- Dependências: `pip install -r requirements.txt`

## Como usar

Quando o usuário pedir algo relacionado a redirects Cloudflare, execute o comando apropriado:

| Pedido do usuário | Comando |
|-------------------|---------|
| "liste os domínios" / "quais domínios têm redirect?" | `python cf_redirects.py listar` |
| "mostre as regras do X" | `python cf_redirects.py regras X` |
| "desative o redirect do X" | `python cf_redirects.py desativar X --all` ou com rule_id específico |
| "ative o redirect do X" | `python cf_redirects.py ativar X --all` ou com rule_id específico |
| "desative todos os redirects" | `python cf_redirects.py --yes desativar-todos` |
| "ative todos os redirects" | `python cf_redirects.py --yes ativar-todos` |
| "redirecione X para Y" | `python cf_redirects.py criar X Y` |
| "delete a regra Z do domínio X" | `python cf_redirects.py deletar X Z` |
| "redirecione esses domínios (lista)" | Criar CSV temporário e rodar `python cf_redirects.py criar-lote arquivo.csv` |

## Flags globais

- `--json`: saída em JSON (usar quando precisar parsear o resultado)
- `--yes` / `-y`: pular confirmação em operações em massa

## Notas

- Use `--json` quando precisar extrair IDs ou dados estruturados
- Para ativar/desativar uma regra específica, primeiro rode `regras <dominio>` para obter o rule_id
- O script usa `d:\SISTEMAS\Cloudflare` como diretório de trabalho

## Pulso de redirects funnel (agendamentos em massa)

Quando o usuário pedir para "redirecionar todos os domínios da lista", "dividir
entre essas URLs", "desfazer às X horas" ou agendar pulso de madrugada:

**Isso NÃO usa o `cf_redirects.py` deste diretório.** Roda na VPS `opengravity`,
em `/opt/cf-bot/`, agendado com `at` one-shot. A lista de origens é
[lista de domínios para redirecionamentos.txt](lista%20de%20domínios%20para%20redirecionamentos.txt)
(219 domínios), que precisa ser **sincronizada** com `/opt/cf-bot/dominios_funnel.txt`
depois de qualquer edição.

| Pedido | Script na VPS |
|--------|---------------|
| "redirecionar todos para <URL>" | `criar_url_agendado.py <URL>` |
| "dividir entre essas N URLs" | `criar_dividirN_agendado.py` (gerar novo, não reaproveitar antigo) |
| "desfazer" | `desfazer_agendado.py` |

Lembretes críticos: **VPS em UTC, somar +3h** ao horário de SP; `at` usa
`MM/DD/YYYY`; "desfazer às 22 horas" significa **às 22:00**, não daqui a 22h;
`curl` sem User-Agent de navegador leva 403 do WAF e dá falso negativo.

Procedimento completo, receitas e armadilhas: [docs/PULSO_REDIRECTS_FUNNEL.md](docs/PULSO_REDIRECTS_FUNNEL.md).

## Hardening de segurança contra DDoS

Quando o usuário pedir para "endurecer", "aplicar segurança", "proteger contra DDoS" ou "replicar configurações do lepur" em um ou mais sites:

```bash
python harden_site.py dominio1.com.br dominio2.com.br ...
```

Aplica pacote padronizado: SSL Full Strict, TLS 1.2+, HSTS 1 ano + preload, DNSSEC, Security Level HIGH, 5 WAF Custom Rules (AI bots, .env/.git, threat>30, challenge admin/login, sem UA), Rate Limit em rotas admin.

Detalhes completos: [docs/HARDENING_DDOS.md](docs/HARDENING_DDOS.md). Lista de sites já hardened: [sites_hardened.txt](sites_hardened.txt) — atualize manualmente após cada execução.

## Conta `cirurgiacoracao` (adicionada em 19/08/2026)

Conta Cloudflare que hospeda **cirurgiacoracao.com.br** e **notebookx.com.br**.
Ficou fora do `contas.json` por muito tempo: em 19/08/2026 uma varredura das 33
contas então cadastradas não achou a zona, e por isso a correção de redirect do
`www` ficou pendente. Agora está cadastrada com o nome `cirurgiacoracao`.

| Item | Valor |
|---|---|
| `account_id` | `47d685885d91e2c451f94027e9e3eb98` |
| Token | em `contas.json`, entrada `cirurgiacoracao` (prefixo `cfat_`, account-owned) |
| Zona `cirurgiacoracao.com.br` | `edb6a027196fd47b3b819e9d4920bcc6` |
| Zona `notebookx.com.br` | `fa477717d7142a3d0a02e8b2b20763ba` |

O token nasceu somente leitura e devolvia **403** no `PUT` do phase
`http_request_dynamic_redirect`. Em 19/08/2026 o Anderson adicionou a permissão
**Zone → Dynamic Redirect → Edit** e a escrita passou a funcionar. Se voltar a
dar 403, é essa permissão que caiu.

Sendo token *account-owned* (`cfat_`), ele também não serve para a API de Page
Rules, que responde `1011 Page Rules endpoint does not support account owned
tokens`. Use Redirect Rules, não Page Rules.

### R2

Credenciais S3 do R2 desta conta ficam em [r2-contas.json](r2-contas.json):
endpoint `https://47d685885d91e2c451f94027e9e3eb98.r2.cloudflarestorage.com`,
região `auto`. Nunca expor `access_key_id` nem `secret_access_key` em mensagem.

## `cf_www_apex.py` — www para o apex em um salto

Com "Always Use HTTPS" ligado, `http://www.dominio/x/` leva **dois** 301
(`http://www` → `https://www` → `https://apex`). Uma Redirect Rule no phase
`http_request_dynamic_redirect` resolve em um salto, porque roda antes do
Always Use HTTPS.

```bash
python cf_www_apex.py dominio.com.br --dry-run   # mostra o que faria
python cf_www_apex.py dominio.com.br             # aplica
```

Acha a zona sozinho varrendo o `contas.json`, preserva as regras que já existem
no phase e substitui só a que ele mesmo criou (casa pela descrição). Exige token
com **Zone → Dynamic Redirect → Edit**.

> **Propagação:** logo depois do `PUT`, a medição ainda mostra a cadeia antiga —
> o "Always Use HTTPS" responde primeiro até a regra propagar, o que leva de
> alguns segundos a cerca de um minuto. Meça de novo antes de concluir que a
> regra perdeu para o Always Use HTTPS. Foi o que aconteceu no
> cirurgiacoracao.com.br: a primeira medição deu 2 saltos e a seguinte, 1.
