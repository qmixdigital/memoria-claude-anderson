# gnd-motor — Hetzner Cloud (Google News Discovery)

VPS **dedicada** ao motor de pautas (pipeline alternativo e redundante à
plataforma de conteúdo). Não hospeda portal nenhum da rede: publica por HTTP nos
receptores, então fica isolada de propósito para o processamento em lote não
degradar tempo de resposta de site que serve tráfego.

Provisionada em **20/08/2026**, inteiramente via API da Hetzner Cloud.

## Acesso

| Item | Valor |
|------|-------|
| Alias SSH | `ssh gnd-motor` (root) · `ssh gnd-motor-deploy` (operação) |
| IPv4 | `62.238.112.87` |
| IPv6 | `2a01:4f9:c015:4a7a::/64` |
| Chave privada | `<<REMOVIDO>>` (reusada; era `cliquex-migration`) |
| Fingerprint MD5 | `be:4b:f7:6e:25:b2:2b:83:bf:57:67:98:c2:e2:21:59` |
| Login por senha | **DESABILITADO** (`PasswordAuthentication no`) |
| root | só por chave (`PermitRootLogin prohibit-password`) |
| Console de recuperação | painel Hetzner → servidor `gnd-motor` → Console |

## Recursos na Hetzner (projeto cliquex)

| Recurso | Nome | ID |
|---------|------|-----|
| Servidor | `gnd-motor` | **162881386** |
| Firewall | `gnd-fw` | **11493524** |
| Chave SSH | `cliquex-migration` | **115812875** |

Conta/token da API: ver `TOKEN.md` nesta pasta.

## Máquina

| Item | Valor |
|------|-------|
| Tipo | **cx33** — 4 vCPU (shared, x86_64), 8 GB RAM, 80 GB disco |
| Localização | **hel1** — Helsinki DC Park 1 (FI), network zone `eu-central` |
| Imagem | Ubuntu 24.04 LTS |
| Backups automáticos | **ligados**, janela 02–06 UTC |
| Tráfego incluso | 22 TB/mês |
| Custo | EUR 9,99/mês + EUR 2,00 de backup = **EUR 11,99/mês** líquido |
| Swap | swapfile de 2 GB, `vm.swappiness=10` |
| Timezone | America/Sao_Paulo |

> ⚠️ **`cx32` não existe** no catálogo da Hetzner. A família atual é
> cx23/cx33/cx43/cx53. O `cx33` é o que bate com a especificação pedida
> (4 vCPU / 8 GB / 80 GB).
>
> ⚠️ **`fsn1` estava com zero disponibilidade** no dia (0 tipos ofertados de 24
> suportados) e **`nbg1` não oferta `cx33`**. Por isso `hel1`, terceira opção da
> ordem de preferência. Em `nbg1` as alternativas de 4 vCPU/8 GB eram `cax21`
> (ARM64, quebraria a paridade x86 da rede) e `cpx32` (EUR 41,99, 4× o preço).

## Firewall (`gnd-fw`, id 11493524)

Entrada: **somente TCP 22**, de `0.0.0.0/0` e `::/0`.
Saída: **irrestrita** — regra de saída não foi declarada, e na Hetzner isso
significa saída liberada, que é o necessário (Google News, veículos, APIs de IA,
Runware, receptores dos portais).

> ⚠️ A porta 22 está **aberta ao mundo**. Não havia IP fixo de gestão
> documentado na pasta de hospedagens. Restringir quando houver um:
> `PUT /v1/firewalls/11493524/actions/set_rules` com `source_ips` do IP.
> O `fail2ban` cobre o SSH enquanto isso (5 tentativas / 10 min → ban de 1 h).

`ufw` está instalado mas **inativo** de propósito: o firewall é o da Hetzner, na
borda. Não ligar os dois.

## PostgreSQL

| Item | Valor |
|------|-------|
| Versão | **17.11**, do repositório **PGDG oficial** (`apt.postgresql.org`), não do Ubuntu |
| Escuta | `127.0.0.1:5432` apenas |
| Banco | `gnd` |
| Usuário | `gnd` |
| Senha | `<<REMOVIDO>>` |
| Conexão | `<<REMOVIDO>> |

Túnel do notebook: `ssh -L 5432:127.0.0.1:5432 gnd-motor`

## Usuários

| Usuário | Papel | Shell |
|---------|-------|-------|
| `motorpautas` (uid 999) | usuário do serviço, sem login | `/usr/sbin/nologin` |
| `deploy` (uid 1000) | operação, `sudo` NOPASSWD | `/bin/bash` |

## Estrutura de diretórios

```
/opt/motor-pautas/          750 motorpautas:motorpautas   código + .venv
/opt/motor-pautas/config/   700 motorpautas:motorpautas   sites.json, credenciais (600)
/srv/motor-pautas/          750 motorpautas:motorpautas   estado
/srv/motor-pautas/cache/    750    cache de extração
/srv/motor-pautas/img/      750    imagens temporárias
/srv/motor-pautas/logs/     750    logs
```

## Serviço systemd

`/etc/systemd/system/motor-pautas.service` — **esqueleto, `disabled`**, porque
ainda não há código. `User=motorpautas`, `Restart=always`, `RestartSec=10`,
`MemoryMax=6G` (proteção contra vazamento; a máquina é dedicada, então **não**
leva os cgroups restritivos que estavam planejados para o srv1166087).
`EnvironmentFile=-/opt/motor-pautas/config/motor-pautas.env` (opcional, o `-`
faz não falhar se ausente). `ExecStart` aponta para
`/opt/motor-pautas/.venv/bin/python -m motor_pautas`.

Habilitar só depois do primeiro deploy: `systemctl enable --now motor-pautas`.

## Software instalado

Python 3.12.3 (+ `venv`, `pip`, `python3-dev`), `build-essential`, `pkg-config`,
`libxml2-dev`, `libxslt1-dev`, `zlib1g-dev`, `libffi-dev`, `libssl-dev` (as
dependências de build de `lxml` e Trafilatura), `git`, ImageMagick 6.9.12,
`jq`, `unzip`, `fail2ban`.

## Conectividade verificada (20/08/2026, de dentro da máquina)

| Destino | Resultado |
|---------|-----------|
| `news.google.com/rss/search` | HTTP 200 · 0,51 s |
| `api.anthropic.com/v1/models` | HTTP 401 · 0,22 s (esperado sem chave; prova alcance) |
| `agencianacionaldenoticias.com/wp-json/3a1a-api/v1/artigos` (POST sem chave) | HTTP **401** · 0,74 s · `{"success":false,"message":"X-API-KEY ausente ou invalida"}` |
| `barranews.com.br/wp-json/brnw-api/v1/artigos` (POST sem chave) | HTTP **401** · 0,64 s · idem |
| `api.runware.ai/v1` | HTTP 400 · 0,38 s (esperado em GET sem corpo) |

## ⚠️ PENDENTE antes da primeira publicação real

**Criar skip rule no Bot Fight Mode da Cloudflare para o IP `62.238.112.87`**
nas zonas dos portais que vão receber publicação. Sem isso, o POST vindo deste
IP de datacenter pode passar a ser desafiado quando a proteção for endurecida.
Hoje passa limpo, como mostram os 401 acima.

## Estado

Máquina **pronta e testada**. Nada do motor de pautas instalado ainda — por
decisão, esta etapa termina aqui.

---

# Motor de Pautas instalado (20/08/2026)

Codigo em `/opt/motor-pautas`, venv em `.venv`, estado em `/srv/motor-pautas`.
Documentacao completa do servico em `/opt/motor-pautas/README.md` (copia em
`d:\SISTEMAS\GOOGLE NEWS DISCOVERY\README.md`).

## Escala

3 materias por semana por portal, 150 portais: 450/semana, 1.950/mes, ~65/dia.
Producao 100% `claude-sonnet-5` via Batch API. Mecanicos em `claude-haiku-4-5`.
Teto de R$ 500/mes, alvo ~US$ 61. Custo projetado: **US$ 62,72 a 67,12/mes**.

## Banco

Esquema `gnd` com 10 tabelas: `fatos`, `artigos_fonte`, `agenda`, `materias`,
`publicacoes`, `gasto`, `lotes`, `teste_cego`, `motor_estado`, `cache_decode`.

## Painel

`ssh -L 3400:127.0.0.1:3400 gnd-motor` e abrir http://127.0.0.1:3400
Mostra gasto do mes por componente, projecao contra o teto, estado da pausa,
metricas de rampa e fila do pipeline.

## Servico

`systemctl status motor-pautas` — **ainda desabilitado** ate as credenciais dos
provedores e o primeiro lote de portais entrarem.

```bash
systemctl enable --now motor-pautas
journalctl -u motor-pautas -f
```

## Chaves que faltam em /opt/motor-pautas/config/motor-pautas.env

`ANTHROPIC_API_KEY`, `RUNWARE_API_KEY`, `OPENAI_API_KEY` (teste cego e
embeddings). Sem elas o motor coleta, decodifica, extrai e agrupa, mas nao gera
nem publica.

## Alertas por Telegram (desde 20/08/2026)

| Item | Valor |
|------|-------|
| Bot | **@googlend_bot** — "Google News Discovery", id `8823687048` |
| Chat destino | `<<REMOVIDO>>` (Anderson Alves QMIX, @qmixdigital) |
| Canal | `MP_CANAL_ALERTA=telegram` (SMTP fica como alternativa no codigo) |

Tres gatilhos, todos testados e entregues: degrau de US$ 5 acumulados por
provedor (sem repetir), corte do teto de R$ 500 (uma vez por pausa) e
credito/auth esgotado (no maximo 1 por provedor por hora).

Chaves ja instaladas no `config/motor-pautas.env`: Anthropic, OpenAI, Runware
(veio de `D:\SISTEMAS\QMIX-VIDEOS\.env`) e Telegram.
