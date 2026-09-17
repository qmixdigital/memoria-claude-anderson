---
name: verificacao-pos-publicacao-antonio
description: "A plataforma do Antônio passou a conferir se a URL anunciada existe; só 404 e 410 alertam, e nada é reenviado"
metadata:
  node_type: memory
  type: project
---

O `201` do destino nunca provou que a página existe. Duas armadilhas produzem
sucesso com página morta: a dedup do portal-engine devolve 201 com a URL **do
portal que pediu**, sem criar nada (404), e slug batendo na lista de poda dava
410 (ver [[410-da-poda-sombreia-artigo-novo]]).

Montado em 28/08/2026 no `acesso.qmix.com.br` (alias `hostinger-vps-srv1166087`,
app em `/home/boot/web/acesso.qmix.com.br/public_html`):

- `includes/verifica-publicacao.php` → `verificarUrlPublicada()`, GET com furo de
  cache e `FOLLOWLOCATION` (o WordPress devolve `?p=ID`)
- `cron-verifica-publicadas.php`, no crontab do **boot**, `*/10` com `sleep 40`
- guarda em `cron-alert-publicacoes-editores.php`, que roda no crontab do **root**
- colunas novas `seo_articles.wp_post_url` e `news_items.wp_post_url`, mais o
  bloco que as preenche nos 3 scripts de envio (os `lc-*` já tinham desde 17/08)

**Duas decisões que não se devem reverter sem pensar:**

1. **Nada é reenviado.** O destino já aceitou; reenviar cria duplicata ou volta
   como `skipped`. O papel da camada é só tornar a falha visível.
2. **Só 404 e 410 alertam.** 403, 5xx e timeout viram `inconclusivo` e ficam
   registrados sem alerta: são WAF, origem ocupada ou rede, e alertar neles
   ensina a ignorar o alerta.

Registro em `qmix_publicacao_verificada`; desiste após 12 tentativas. O verdito
`existe` sai da fila de conferência, então rodar de novo não repete o trabalho.

⚠️ Patch por SSH nesses arquivos: **heredoc come uma contrabarra**, mesmo com
`<<'PY'`. Onde o PHP precisaria de `"\n"`, use `PHP_EOL`. Ver [[heredoc-come-contrabarra]].
