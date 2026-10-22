# Análise SEO e GEO de clientes (QMIX Digital)

Pipeline padrão para diagnosticar um site de cliente a partir do Search Console (API), rastreio do próprio site, Moz e PageSpeed, e gerar um relatório HTML pronto para enviar.

## Estrutura

```
clientes/<dominio>/
  dados/gsc_dump.json      bruto da API do Search Console (16 meses, query+page, device, país)
  dados/crawl.json         rastreio das URLs do sitemap (title, meta, H1, links, schema, alt)
  dados/analise.json       cruzamento GSC x crawl (classes de poda, buckets, canibalização, links)
  dados/moz.json           DA, spam, domínios de referência, top links (Moz via VPS)
  dados/pagespeed.txt      saída do psi.py (mobile e desktop)
  dados/narrativa.json     texto específico do cliente: veredito, excelente, oscilações, plano
  RELATORIO-GSC-<data>.md  relatório em prosa (skill google-console-analise)
  <cliente>-REVISITA-<data>.md   query + página das páginas comerciais (revisita.py)
  RELATORIO-SEO-GEO-<cliente>-<data>.html   relatório final, abre no navegador
scripts/
  crawl_site.py     rastreia o sitemap e extrai sinais on-page
  build_analise.py  cruza gsc_dump + crawl e gera analise.json
  build_html.py     monta o HTML a partir de analise + narrativa + moz + pagespeed
```

## Passo a passo (novo cliente)

1. Cliente concede acesso no Search Console a uma das service accounts de `C:\Users\User\Documents\APIs\` (seoqmix, enjai ou backlinkguard).
2. Exportar as chaves e baixar o dump (script da skill `google-console-analise`, `gsc_api.py`): `date` 480 dias, `page` 90/180/480, `query` 90/180, `query+page` 90/480, `device`, `country`, `page+date` 480.
3. `python scripts/crawl_site.py DOMINIO clientes/DOMINIO/dados/crawl.json` (UA de navegador; sem `-I`, precisa do requests).
4. `python C:\Users\User\.claude\skills\pagespeed-audit\scripts\psi.py URL1 URL2 URL3 --strategy both > dados/pagespeed.txt` (home, página comercial principal, post mais forte).
5. Moz pela VPS (`ssh hostinger-vps-srv1166087`, `.env` em `/var/www/qmix-next/`): `url_metrics` e `linking_root_domains` com `sort: source_domain_authority`, `limit: 25`. Gasta 1 linha por domínio consultado ou devolvido. Preencher `dados/moz.json`.
6. `revisita.py` da skill nas páginas comerciais, salvando o `.md` na pasta do cliente (o build_html lê as tabelas Reforçar, Expandir e Grafia das páginas comerciais).
7. Escrever `dados/narrativa.json` (veredito, excelente, oscilações, plano) com base na análise.
8. `python scripts/build_analise.py clientes/DOMINIO DOMINIO` e `python scripts/build_html.py clientes/DOMINIO clientes/DOMINIO/RELATORIO-SEO-GEO-<cliente>-<data>.html`.

## Arquivos por cliente (nada de cliente fica nos scripts)

- `dados/config.json`: `base` (com www se a propriedade tiver), `tipos` (prefixo → comercial | produto | post | utilitaria), `comercial_exatas`, `comercial_prefixos`, `cidade`, `offtopic`, `img` (páginas que aparecem em carrossel de imagem), `local_regex`, `marca_regex`, `min_imp_bucket`, `min_imp_locais`, `min_imp_canib`, `thresholds`. Copiar o de um cliente parecido e ajustar.
- `dados/narrativa.json`: `veredito`, `excelente[]`, `oscilacoes[]`, `posicao_cards[]`, `canib_cards[]`, `textos{}` (device_sub, locais_titulo, plataforma, poda_titulo, poda_texto, links_leitura, geo_intro, impressoes_sub, paginas_sub), `moz_leitura[]`, `geo_sinais[]` (t, ok true/false/null, d), `geo_cards[]`, `plano[]`.
- Site com menos de 60 dias de dados: gráficos viram diários, tiles de comparação somem e nenhuma página recebe classe "podar".

## Regras de classificação (build_analise.py)

- Excelente: 8+ cliques em 90 dias e dentro do tema. Atualizar: 300+ impressões e posição 4 a 30. Podar: menos de 150 impressões e até 1 clique em 16 meses, ou fora do tema sem retorno. Fundir: página de cidade sem tráfego. Fora do sitemap: tag ou URL antiga com impressão.
- Links internos "de corpo": exclui pares (destino, âncora) presentes em 50%+ das páginas (menu e rodapé) e links em imagem para páginas de menu.
- Páginas com impressão de imagem (carrossel) são marcadas pela lista `IMG` no build_html; revisar por cliente.

## Fontes e limites

- OpenPageRank foi abandonado (chave antiga inválida, serviço migrou para Keywords Everywhere). Autoridade vem da Moz.
- Mod_Security de alguns hosts bloqueia UA `curl` puro; o crawl usa UA de navegador.
- GSC atrasa 2 a 3 dias; o dump usa fim = hoje menos 3.

## Conferência visual antes de entregar

`python scripts/shots.py clientes/DOMINIO/RELATORIO.html prefixo` gera em `tmp/` capturas de desktop (1366), modo escuro, tablet (820, via iframe) e celular (390, via iframe; o Chrome sem interface não abre janela menor que 500). Olhar as quatro antes de abrir para o Anderson: coluna vazia, buraco em grade de cards e rótulo de eixo sobreposto são os erros que já apareceram.

## Alerta destacado (opcional, por cliente)

Em `narrativa.json`, a chave `alerta` ({k, t, d, acao, dados:[[rótulo, valor, nota]]}) gera um bloco vermelho no topo do resumo executivo. No texto do `veredito`, trechos entre `[[` e `]]` ficam marcados em vermelho. Usar só quando há um problema que o cliente precisa ver de cara (ex.: domínio reaproveitado com backlinks tóxicos no perfumearabe.com).
