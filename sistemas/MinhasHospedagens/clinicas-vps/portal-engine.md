# portal-engine — motor dos portais convertidos (clinicas-vps)

Gerador de site estático em Node puro, **sem dependências**, que substituiu o
WordPress em portais da rede. Roda nesta VPS (`31.97.162.199`, alias
`ssh clinicas-vps`) ao lado dos apps Next.js já documentados em [ACESSO.md](ACESSO.md).

Não é WordPress. **Não existe wp-admin, wp-cli, banco de dados nem PHP.** O
conteúdo são arquivos JSON em disco e o site publicado é HTML pronto.

## Onde fica

| Item | Valor |
|------|-------|
| Código | `/opt/portal-engine/src/` (`receiver.js`, `render.js`, `archs.js`, `tokens.js`) |
| Configuração | `/opt/portal-engine/sites.json` (modo 600, dono `portais`) |
| Conteúdo | `/srv/portais/<slug>/data/*.json` — um arquivo por artigo |
| Site publicado | `/srv/portais/<slug>/public/` — HTML estático servido pelo Nginx |
| Serviço | systemd `portal-engine`, usuário **`portais`**, `enabled` |
| Runtime | Node **v22.22.2** em `/usr/local/bin/node` |
| Portas | `127.0.0.1:8791` (receiver) e `127.0.0.1:8795` (beacon) |
| Vhosts | `/etc/nginx/conf.d/portal-<slug>.conf` |

`sites.json` é observado por `fs.watchFile`: alterar o arquivo recarrega a
configuração **sem reiniciar** o serviço. Alterar código em `src/` exige
`systemctl restart portal-engine`.

## Portais servidos hoje

| Portal | Arquitetura | Namespace da API | Documentação |
|--------|-------------|------------------|--------------|
| [boxnoticias.net](boxnoticias.net.md) | V | `e77a-api/v1` | conversão em 15/08/2026 |
| [agencianacionaldenoticias.com](agencianacionaldenoticias.com.md) | U | `3a1a-api/v1` | conversão em 14/08/2026 |

## Como o conteúdo chega

A plataforma do Antônio (`acesso.qmix.com.br`) entrega por
`POST https://<dominio>/wp-json/<ns>/artigos` com header `X-API-KEY`. A rota imita
o caminho do WordPress **de propósito**, para que o cadastro da plataforma continue
válido depois da migração.

Cadastro na plataforma: MySQL **`boot_qmixmarketplac`** no `hostinger-vps-srv1166087`,
tabelas `wp_sites`, `wp_categories` e `publish_schedule`. A chave é criptografada por
`/home/boot/web/acesso.qmix.com.br/public_html/<<REMOVIDO>>`.

## Operações comuns

```bash
# ver entregas e erros
ssh clinicas-vps "journalctl -u portal-engine -f"

# republicar tudo de um portal (indices + paginas)
# use readAllArticles/articleHtml/rebuildIndexes; ver runbook em D:\PORTAIS\CONVERSAO-TOTAL.md

# depois de qualquer republicacao, purgar o Cloudflare da zona
```

⚠️ **Heredoc por SSH come template literal de JavaScript.** `${...}` e crase são
expandidos pelo shell e quebram o `render.js`. Escreva o patch local e mande por
`scp`. Sempre copie um `.bak-<motivo>-<data>` antes.

## Impressão digital

O motor gera **nomes de classe CSS diferentes em cada portal**, derivados por hash
do slug do site (`_CLS_LIT`, `_clsMapa`, `_renomClasses` no `render.js`). Isso existe
porque a rede não pode ser identificada por vocabulário de classe idêntico.
Conferência esperada ao comparar dois portais: **nenhuma classe em comum**.

O mesmo vale para o resto: cada portal tem arquitetura visual própria (A a V),
paleta, fontes e marca distintas. **Nunca reaproveite markup de um portal em outro
sem renomear.**

## Runbook completo

O procedimento de conversão de WordPress para este motor, com as 13 fases e as
armadilhas conhecidas, está em **`D:\PORTAIS\CONVERSAO-TOTAL.md`**.
