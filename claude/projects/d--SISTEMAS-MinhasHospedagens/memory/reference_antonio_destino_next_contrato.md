---
name: reference_antonio_destino_next_contrato
description: "O que quebra quando um destino do Antônio deixa de ser WordPress e vira diretório Next - trailingSlash 308, rtrim do endpoint, id vs post_id e a chave QMIX_API_KEY"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-09T21:36:41.203Z
---

Plataforma Antônio = `acesso.qmix.com.br` no **srv1166087** (`hostinger-vps-srv1166087`), user `boot`, pasta `/home/boot/web/acesso.qmix.com.br/public_html`, banco `boot_qmixmarketplac`. Destinos ficam em `wp_sites` (`domain`, `endpoint_url`, `api_key` **cifrada**), fila de notícias em `news_items` + `news_sources`, falhas em `wp_transfer_errors`, execuções em `cron_logs`.

Quando um destino vira diretório Next, quatro coisas quebram — resolvidas em 09/08/2026:

1. **308 em todo POST.** Os apps Next usam `trailingSlash: true` e `getWpEndpointUrl()` (em `includes/wp-sites-helper.php`) faz `rtrim($url,'/')`. Sem `CURLOPT_FOLLOWLOCATION` o POST morre no 308. Corrigido nos 5 transfers ativos (`article-transfer.php`, `-scheduled`, `-qmix-news`, `lc-article-transfer*`) com FOLLOWLOCATION + MAXREDIRS=3 — 307/308 preservam o método.
2. **Rota diferente por app.** Não existe padrão: catarata e câncer usam `/api/qmix/noticias/`; **cirurgiacoracao usa `/api/wp-json/sistema-qmix/v1/artigos`** e ainda aceita o caminho WP antigo (`/wp-json/f1b0-api/v1/artigos`) por rewrite. Confira `find /var/www/<app>/src/app/api -path '*qmix*'` antes de editar o `endpoint_url`.
3. **`id` em vez de `post_id`.** As rotas Next respondem `201 {"ok":true,"id":...,"url":...}`. Os transfers só aceitavam `post_id`, então **publicação bem-sucedida era contada como erro** e o artigo era reenviado. Agora aceitam `$result['post_id'] ?? $result['id']`, e como o id pode ser UUID, `wp_post_id` (int) guarda 0 nesse caso. As rotas são idempotentes por slug, o que evitou duplicata enquanto o bug existiu — não conte com isso.
4. **`QMIX_API_KEY` do app tem que ser a chave DECIFRADA.** `wp_sites.api_key` guarda ~168 chars cifrados; `getWpApiKey()` devolve 64 chars. Um app estava com o texto cifrado colado no `.env` e outro com `staging-…`: 401 em tudo. Jeito seguro de sincronizar: script PHP no próprio srv1166087 que lê `getWpApiKey()` e escreve no `/var/www/<app>/.env`, depois `pm2 reload <app> --update-env` (par `-web` e `-web-b`, um de cada vez).

5. **Imagem não chega por URL.** O Antônio manda o binário em `image_base64` (data URI) + `imagem` (nome do arquivo) — ele **não** mandava nenhum campo com URL. Receptor que espera URL (`featured_image`) recebia nada e o artigo entrava sem foto. Agora o `article-transfer-qmix-news.php` manda **os dois**: `image_base64` e `featured_image` (a URL pública em `acesso.qmix.com.br/uploads/...`, que responde 200). Cada receptor usa o que entende. Cuidado extra: se o `onConflictDoUpdate` do app não incluir a imagem, reentregar **nunca** preenche a foto de um artigo já existente — foi o caso do catarata.

Diagnóstico rápido sem publicar nada: POST com a chave certa e corpo `{}` — **400 "title obrigatório" = tudo certo**; 401 = chave; 308 = barra final; 404 = rota errada.

Detalhe da fila: `article-transfer-qmix-news.php` só pega itens com `wp_tentativa <= 2`. Itens que falharam 3× ficam presos para sempre — depois de corrigir a causa, zerar `wp_tentativa` para devolvê-los à fila.

Ver também [[reference_dominios_saude_viraram_diretorio_next]] e [[reference_antonio_endpoint_recovery]].
