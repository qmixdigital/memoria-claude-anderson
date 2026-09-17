# SITES.md — Relação oficial dos portais (portal-engine)

> **Fonte da verdade da config = `/opt/portal-engine/sites.json` na VPS** (o `sites.json` local é uma cópia sincronizada). Este arquivo é o resumo legível da rede de portais estáticos.
> ⚠️ **MANUTENÇÃO OBRIGATÓRIA:** sempre que criar um portal novo, mudar tema/arquétipo, domínio ou endpoint, **atualize esta tabela + o `sites.json`** (ver regra no `CLAUDE.md`).
> Última atualização: 2026-06-07.
> **⭐ A rede usa SÓ este motor para portais novos** (não mais WordPress). Metodologia anti-fingerprint portada da skill `wp-news-frontpage` para `src/tokens.js`.

## Onde ficam os dados
- **Código (motor):** `D:\SISTEMAS\portal-engine\` (local) e `/opt/portal-engine/` (VPS, é o que roda).
- **Conteúdo de cada site (artigos JSON + HTML gerado):** **só na VPS** `hostinger-vps-srv1166087`, em `/srv/portais/<slug>/{data,public}`. NÃO fica local.
- **VPS:** `ssh hostinger-vps-srv1166087` (31.97.173.40). Receptor systemd `portal-engine` (porta 127.0.0.1:8791), roda como user `portais`.

## Portais no ar

| Slug | Nome | Domínio (canônico) | Arquétipo / identidade (classes) | Artigos | Status |
|---|---|---|---|---|---|
| `romanceseleituras` | Romances e Leituras | romanceseleituras.com | **A** — editorial clássico (Fraunces + IBM Plex, vermelho, light; classes `rml-*`) | 20 | no ar |
| `projetob` | Projeto B News | **www.projetob.net** | **B** — magazine (Syne + Manrope, âmbar `#f2b84b`, dark; classes `pjb-*`) | 14 | no ar |
| `todossomosgeek` | Todos Somos Geek | todossomosgeek.com | **C** — newsroom (Chakra Petch + Mulish, violeta `#a07bff`, dark; classes `tsg-*`) | 28 | no ar |
| `jornaldiario` | Jornal Diário | jornaldiario.net | **E** — minimal/zine (Playfair + Source Sans, navy `#1c5f8c`, light; classes `svn-*`) | 10 fictícios | no ar (HTTPS via CF Full; 10 notícias fictícias c/ imagens Runware p/ trabalhar layout — substituir quando o Antônio enviar reais) |
| `teste` | Portal Teste | teste.local | A (interno) | — | dummy/dev (ignorar) |

## Cadastro no Antônio (endpoint + chave por site)

| Slug | Endpoint (POST, header `X-API-KEY`) | X-API-KEY | Categorias (ID→nome) |
|---|---|---|---|
| romanceseleituras | `https://romanceseleituras.com/romanceseleituras-api/v1/artigos` | `<<REMOVIDO>>` | 1=Notícias · 2=Entretenimento |
| projetob | ⚠️ `https://www.projetob.net/projetob-api/v1/artigos` **(com `www`)** | `<<REMOVIDO>>` | 1=Notícias · 2=Entretenimento |
| todossomosgeek | `https://todossomosgeek.com/todossomosgeek-api/v1/artigos` | `<<REMOVIDO>>` | 1=Notícias · 2=Games · 3=Tecnologia · 4=Cultura Pop |
| jornaldiario | `https://jornaldiario.net/jornaldiario-api/v1/artigos` | `<<REMOVIDO>>` | 1=Notícias |

- **Autor padrão:** `1` em todos. **Categoria padrão:** Notícias.
- **⚠️ projetob:** o apex `projetob.net` **redireciona 301 → www** no Cloudflare, e POST não sobrevive a 301 → o endpoint no Antônio **tem que ser `www.projetob.net`**. (romanceseleituras e todossomosgeek usam apex direto, sem redirect.)

## Contato / e-mail (todos os sites)
- Form de contato → Resend. `resendFrom = marketing@qmix.com.br` (domínio verificado). `contactTo = fatimawatanabe36@gmail.com`.
- Nenhum e-mail aparece no HTML (invisível ao Google).

## Anti-fingerprint (resumo)
Cada portal recebe um **fingerprint roll** (`src/tokens.js`, salvo como `fp` no `sites.json`): **arquétipo (A-E)**, **prefixo de classe por portal** (dois portais do mesmo arch têm classes diferentes), **paleta** (16), **fontes** (15), **tokens** de raio/sombra/espaçamento/largura/fonte-base/proporções, **ordem do `<head>`** (3) e **variante de schema** (3). DOM, classes, cor, tipografia e computed-style divergem entre vizinhos. `newsite.sh` roda o roll automaticamente. Detalhes no `CLAUDE.md`.
