# LEIA-PRIMEIRO — Portal Engine (handoff)

Bem-vindo. Esta pasta é o **motor oficial de portais de notícia da rede QMIX** (HTML estático, Node puro,
sem WordPress). Os portais novos da rede são feitos **só com este motor**. Esta é a superfície de trabalho
(VS Code/edição); **a execução roda numa VPS** acessada por SSH.

## Por onde começar (nesta ordem)

1. **[ACESSO.md](./ACESSO.md)** — como acessar a infra na sua máquina (SSH, chave, pré-requisitos), além das
   chaves de API (Resend, Runware, X-API-KEY) e dados de Cloudflare/Antônio. **Comece por aqui** e faça o
   sanity check do final do arquivo.
2. **[CLAUDE.md](./CLAUDE.md)** — o **runbook completo** de operação. É autossuficiente e escrito para ser
   usado com o Claude Code (mas serve de manual para humano também). Regras de ouro, deploy, criar portal,
   integração com o Antônio, gerenciar conteúdo, SEO, segurança, troubleshooting.
3. **[SITES.md](./SITES.md)** — a relação oficial dos portais no ar (domínio, arquétipo, endpoint, X-API-KEY).
4. **[CONVERSAO-WORDPRESS.md](./CONVERSAO-WORDPRESS.md)** — passo a passo para converter um site WordPress da
   rede para este motor (migra conteúdo, imagens e datas; preserva URLs com 301). Usa `scripts/import-wp.js`.
5. **[README.md](./README.md)** — visão técnica curta da arquitetura.

## O que cada tarefa usa

| Quero... | Leia | Ferramenta |
|---|---|---|
| Acessar a hospedagem na máquina nova | ACESSO.md | `~/.ssh/config` + chave |
| Criar conteúdo (artigos) / imagens | CLAUDE.md (Antônio, Imagens) + ACESSO.md (Runware) | endpoint + X-API-KEY; Runware p/ imagem |
| Criar um portal novo | CLAUDE.md → "Criar um portal novo" | `newsite.sh` (na VPS) |
| Converter um WordPress | CONVERSAO-WORDPRESS.md | `scripts/import-wp.js` |
| Mexer no design/código do motor | CLAUDE.md → arquétipos + deploy | `src/render.js`, `src/archs.js`, `src/tokens.js` |
| Editar/excluir um artigo | CLAUDE.md → "Gerenciar conteúdo" | editar `data/<slug>.json` + rebuild |

## Mapa rápido do código

- `src/render.js` — núcleo/orquestrador (decode, SEO, sitemap, favicons, publish/rebuild).
- `src/archs.js` — os **5 arquétipos estruturais** A–E (DOM/CSS divergentes).
- `src/tokens.js` — **fingerprint roll** (paletas, fontes, tokens, prefixo de classe por portal) anti-PBN.
- `src/receiver.js` — servidor HTTP que recebe do Antônio + formulário de contato.
- `sites.json` — registro dos sites (inclui `fp` por portal). **Espelha o da VPS** (fonte da verdade é a VPS).
- `newsite.sh` — provisiona um portal novo. `portal-engine.service` — unit systemd.
- `scripts/import-wp.js` — importador WordPress → motor. `scripts/oneoff/` — scripts já usados (histórico).

## Regras que evitam dor de cabeça (resumo — detalhe no CLAUDE.md)

- Depois de editar qualquer arquivo de `src/`, **reinicie o serviço**: `ssh hostinger-vps-srv1166087 "systemctl restart portal-engine"`.
- **Nunca** rode comandos como root em `/srv/portais` (use `runuser -u portais -- ...`).
- Transferir arquivo pra VPS: `cat local | ssh host "cat > remoto"` (o `scp` falha nesta VPS).
- Ao criar/mudar/converter um portal, **atualize SITES.md + sites.json + Status do CLAUDE.md** na mesma tarefa.
- A pasta tem **segredos** — não suba pra repositório público (ver `.gitignore`).
