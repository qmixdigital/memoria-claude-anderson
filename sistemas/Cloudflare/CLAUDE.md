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

## Diretórios em subdomínio (revistadeducao / desassossegada)

Os apps Next desses dois portais saem do Cloudflare Pages para subdomínio
(18/09/2026). Ordem: `python scripts/criar_dns_cert_subdominios.py` e depois
`bash scripts/ativar_subdominios_diretorios.sh`. Detalhes em
[docs/PULSO_REDIRECTS_FUNNEL.md](docs/PULSO_REDIRECTS_FUNNEL.md) §15.x e nas
pastas `d:\SITES\revistadeducao.com.br` e `d:\SITES\desassossegada.com.br`.

## Conta `medicosbh` ("Médicos BH", criada em 20/09/2026)

Conta Cloudflare **exclusiva para clientes** (ortopedistas de Belo Horizonte),
`account_id` `db7f7f1b755edba76754fd154439b50e`, cadastrada no `contas.json`
como `medicosbh` com o `CF_USER_TOKEN`. Separação é de conta e de par de
nameservers; **não existe IP dedicado** fora do plano Enterprise (IP da borda é
compartilhado em qualquer conta).

Zona criada em 20/09/2026: **korpem.com.br** (`cc514b9aba8e6271f2213b69dc823cc4`,
NS `evan` / `zariyah.ns.cloudflare.com`), status pending. Origem atual:
HostGator `69.6.248.143`, e-mail no Google Workspace. O scanner do Cloudflare
importou 0 registros; use `python importar_dns_cliente.py korpem.com.br`
(`--dry` para so listar) ANTES da troca de NS, senao site e e-mail caem na virada.

**Pré-visualização para aprovação do cliente (padrão dos três sites):** projeto
Pages `<dominio>-preview` na conta medicosbh, upload direto com
`wrangler pages deploy . --project-name <dominio>-preview --branch main`
(env `CLOUDFLARE_API_TOKEN` = token medicosbh, `CLOUDFLARE_ACCOUNT_ID`).
Existentes: `henriquecembranelli-preview`, `dreduardocembranelli-preview`,
`korpem-preview` (20/09/2026, repo `qmixdigital/korpem.com.br`).
🔴 **Não usar `wrangler pages project create` no wrangler 4.135+**: ele cria
um Worker com assets (e grava um `wrangler.jsonc` na pasta do site), não um
projeto Pages, e recusa `_redirects` com URL absoluta. Criar o projeto pela API
(`POST /accounts/{id}/pages/projects` com `name` e `production_branch`) e só
então rodar o `pages deploy`. O `_redirects` do Pages só aceita origem relativa:
www -> apex vai por Redirect Rule na zona (`cf_www_apex.py`), não pelo arquivo.

Para colocar um domínio de cliente nela:

```bash
python onboard_cliente.py dominio.com.br          # cria a zona e mostra os NS
python onboard_cliente.py dominio.com.br          # de novo, depois de trocar os NS: aplica segurança
```

Regras: essa conta **nunca entra** no `/opt/cf-bot` da VPS (pulso de redirects
e bloqueio em massa) e nunca recebe desafio ao visitante (o script já roda
`suavizar_conta.py`). Se o Anderson pedir IP exclusivo de verdade, é VPS
própria para a origem, não Cloudflare.
