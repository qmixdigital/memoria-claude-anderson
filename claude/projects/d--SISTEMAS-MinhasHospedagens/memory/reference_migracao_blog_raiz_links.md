---
name: reference-migracao-blog-raiz-links
description: "Blogs de clientes migraram de blog.DOMINIO para DOMINIO/blog; como achar e trocar os backlinks antigos na rede, no Jean e nos diretórios, e onde está o catálogo"
metadata:
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-10-03T12:16:35.357Z
---

Em 03/10/2026 os backlinks que apontavam para os blogs antigos de clientes foram trocados para o domínio raiz. Padrão da migração: `blog.DOMINIO/slug/` responde 301 para `DOMINIO/blog/slug` (alguns slugs mudaram, então o destino novo se descobre seguindo o redirecionamento, nunca montando a URL na mão).

Migrados: cirurgiadojoelhogoiania.com, ombrogoiania.com.br, coegoiania.com.br, drthiagotredicci.com.br, drtiagobernardes.com.br, camilafarias.com.br, nutricionista.digital, drhenriquebufaical.com.br, advdobrasil.com.br. Sem resposta (DNS morto): blog.cirurgiadojoelho.com.br, blog.drbrunoair, blog.clinicasrecuperacaosaopaulo, blog.qmix.

**Resultado:** 259 links catalogados; 178 atualizados (120 no Jean, 40 no portal-engine, 13 em diretórios Next, 5 no revistamsaude); 77 pendentes em portais de terceiros sem acesso de edição (seguem funcionando pelo 301).

**Catálogo:** `D:/PORTAIS/BACKLINKS/_CATALOGO-links-blog-migrado.xlsx` (Resumo, Todos os links, Pendentes com parceiros) e aba "Catálogo de links" na planilha de cada cliente (camilafarias.com.br.xlsx e drtiagobernardes.com.br.xlsx foram criadas). Scripts e backups em `D:/PORTAIS/BACKLINKS/migracao-blog-raiz/`.

**Onde os links vivem (a rede WordPress compartilhada quase não existe mais):**
- portal-engine nos 3 hosts: `pe_swap2.js mapa.json [--aplicar]` troca no JSON com guarda de hrefs, backup em `/root/bak-blog-raiz/`; depois rebuild_site.js por portal e restart do serviço.
- Diretórios Next (srv1166087, Postgres): casasderecuperacao.blog_posts.content, cirurgiacoracao_db.blog_posts.content, cirurgiadecancer.noticias.conteudo, medicinageriatrica_db.artigos.conteudo. UPDATE com replace(); ISR de 1 hora, atualiza sozinho.
- revistamsaude (opengravity, Payload): materias.conteudo é jsonb, `replace(conteudo::text, ...)::jsonb` e POST /api/revalidate na 3004 (a 3008 fica desligada fora de deploy).
- Jean: `bun run scripts/swap-links.ts plano.json --aplicar` em gnd-motor:/opt/wp-mcp usa o cofre do conector e troca no conteúdo BRUTO (context=edit), preservando os blocos Gutenberg. Muito melhor que `atualizar_post`, que exige reenviar o HTML inteiro. Os posts antigos do Jean são do mesmo autor do conector, por isso a edição passa.

**BacklinkGuard é o catálogo central de backlinks de clientes** (srv1166087, banco `backlinkguard`, tabela `Backlink`: articleUrl, expectedAnchor, expectedTarget, targetDomain; 2.371 linhas, 11 clientes). Ele compara o link encontrado com `expectedTarget`, então toda troca de destino exige UPDATE nesse campo, senão o link vira "problema". Foi feito para os 87 trocados; os 81 de terceiros ficaram com o alvo antigo. cirurgiadojoelhogoiania.com não é cliente cadastrado lá.

Relacionado: [[feedback_registro_backlinks_por_dominio]], [[reference_publicar_parceiros_jean_mcp]], [[project_migracao_blogs_clientes]].

## Rodada 2 (03/10/2026): catálogo completo de backlinks de clientes

Além do `blog.X`, vários clientes mudaram artigos da raiz para `/blog/` (ex.: `coegoiania.com.br/slug/` e `drthiagotredicci.com.br/tratamentos/slug/` viraram `/blog/slug`), então o endereço antigo só aparece testando o destino de cada link. Foram catalogados 3.305 links para 26 clientes (rede própria, Jean e terceiros do BacklinkGuard): 482 atualizados no dia, 389 com endereço antigo pendentes (329 em portais de terceiros e 60 links em 34 posts do Jean de outro autor, que dão 403 no conector), 14 não alterados de propósito (qmix.com.br), 234 com destino quebrado e 10 que caem na home.

**Catálogo:** `D:/PORTAIS/BACKLINKS/_CATALOGO-backlinks-clientes.xlsx` (Resumo, Todos os links, Atualizados, Pendentes, Destinos quebrados, Sem equivalente) e aba "Catálogo de links" na planilha de cada cliente. O `_CATALOGO-links-blog-migrado.xlsx` da primeira rodada foi absorvido. Na aba Backlinks, "Destino no cliente" é o que está NO AR hoje; o destino correto fica no catálogo.

**Pipeline reutilizável** (em `D:/PORTAIS/BACKLINKS/migracao-blog-raiz/`): `clientes.json` (lista de domínios) → `pe_links.js` (links externos do portal-engine) + `pg_scan3.sh` (bancos) + `scan_jean2.py` (REST pública) → `coleta.py` (junta e testa destinos) → `plano2.py` (planos) → `pe_swap3.js`, `swap-links.ts` e SQL → `situacao.py` → `planilhas2.py`.

**Armadilhas:** reconstruir 28 portais na opengravity leva cerca de 30 min, rodar destacado no servidor (`rebuild3.sh` com nohup); o filtro de tabela `!~ 'log'` escondia `blog_posts`; casasderecuperacao e cirurgiacoracao guardam Markdown e o revistamsaude guarda Lexical JSON, então exigir `href=` perde links; `qmix.com.br` é site próprio e NÃO foi alterado (só catalogado); artigos dentro de sites de cliente também não.

**Quebrados que pedem ação no site do cliente:** pneusemgoiania.com.br fora do ar (HTTP 525, 48 links), cirurgiadecolunagoiania (54 links em 404, ex. /hernia-de-disco/), drthiagotredicci (38, /cirurgias/x/ redireciona para /blog/x/ que não existe), peritodicas (13), advogado-conta-bloqueada.advdobrasil.com.br (19, redireciona para outro domínio).

**Decisão do Anderson (03/10/2026) sobre links antigos para qmix.com.br:** quando o endereço antigo (ex.: `marketing.qmix.com.br/...`) redireciona para `/comprar-backlinks`, NÃO trocar o destino: remover o link e manter o texto. Motivo dele: link de portal para a página de comprar backlinks "pode ser perigoso". Feito em 5 posts do Jean com `scripts/unlink-links.ts` (gnd-motor:/opt/wp-mcp); 9 links em 8 posts de outros autores e 129 em portais de terceiros ficaram pendentes com a orientação de remover.
