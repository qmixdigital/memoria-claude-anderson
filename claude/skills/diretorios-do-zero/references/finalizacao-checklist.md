# Finalização — Checklist Completo (Fase 9, verbatim)

Detalhe integral dos blocos de finalização (herdado da skill `finalizacao-projeto`). A Fase 9 do SKILL.md resume; aqui está cada item por extenso. Nada é assumido como ok: cada item é verificado de fato (curl, script, banco, código). O que não puder ser verificado entra no relatório como PENDENTE com o motivo.

## Bloco 1 — Páginas essenciais para aprovação no AdSense

Verificar existência e HTTP 200, com conteúdo real (não placeholder).

- [ ] **Sobre** — texto real explicando o que é o site e quem mantém. Nunca lorem ipsum.
- [ ] **Contato** — formulário funcional (testar envio) ou e-mail real visível.
- [ ] **Política de Privacidade** — cita: cookies, Google AdSense/parceiros, LGPD, dados coletados e direitos do titular.
- [ ] **Termos de Uso** — adaptados ao tipo de site, com isenção sobre exatidão de dados de fontes governamentais (Receita, CREF, DATASUS).
- [ ] **404 customizada** — links de navegação; status HTTP 404 real (não soft 404).
- [ ] **Banner de consentimento (CMP)** — presente e funcional, registrando consentimento.
- [ ] Links para Privacidade e Termos no rodapé de todas as páginas.

**Não** solicitar o código do AdSense nem cobrar ads.txt. Deixar pronto: páginas publicadas, política citando publicidade de terceiros/opt-out, banner com categoria de publicidade prevista, robots sem bloquear `Mediapartners-Google`/`AdsBot-Google`, slots reservados sem código (altura reservada p/ não gerar CLS), raiz servindo estáticos (p/ ads.txt futuro), anúncio desligado em 404/erro/admin já previsto. O Anderson insere ads.txt e código depois. Não listar como pendência.

## Bloco 2 — Sitemap e indexação

- [ ] `sitemap.xml` 200 e content-type XML válido.
- [ ] > 50.000 URLs → sitemap index segmentado, **10 mil URLs por arquivo** (não as 50 mil do protocolo: ver `seo-e-render.md`, "Sitemap com milhões de URLs").
- [ ] **Medir tempo com `curl -w '%{time_total}'`, e com a máquina ocupada.** Índice > 1s ou segmento > 10s é defeito. Um sitemap que só responde na hora calma passa em teste feito na hora calma e devolve 504 ao Googlebot na hora cheia.
- [ ] Amostrar 20-30 URLs do sitemap por curl: todas 200 (sem 404/500/redirect em cadeia).
- [ ] URLs canônicas (https, host correto, sem parâmetros de filtro).
- [ ] `robots.txt` liberando indexável e bloqueando filtro/busca/parâmetros; referencia o sitemap.
- [ ] Propriedade no GSC e sitemap enviado **por API** (`scripts/gsc.py enviar`, ver `gsc-api.md`). Criar/verificar a propriedade continua manual.
- [ ] Confirmar que o Google **baixou** o sitemap (`gsc.py sitemaps`): `último download: nunca` é pendência.
- [ ] `gsc.py inspecionar` numa amostra de cada tipo de página (ficha, cidade, estado, artigo): canônica escolhida pelo Google, robots e estado de indexação.

## Bloco 2b — Produto pago e paywall

- [ ] **Cada item com preço percorrido ponta a ponta com um pedido real**: checkout coleta → schema guarda o que o formulário promete → pagamento marca pago (webhook E cron) → algo produz o entregável → algo avisa o comprador → o link abre. Aponte o arquivo que faz cada passo; se não souber apontar, não existe. (Achado real: produto vendido, rota de download pronta, e nada mandava o link.)
- [ ] Rodar duas vezes: a segunda não reenvia nem recobra.
- [ ] Pago e ainda não gerado responde "está sendo gerado", não 404.
- [ ] Conteúdo pago gerado a partir de rota HTML precisa de assinatura (HMAC), senão qualquer um imprime de graça.
- [ ] Limite de visualizações: testar com User-Agent do Googlebot, N+5 acessos, N+5 respostas 200. Listagens livres. Página de limite explica o que houve.
- [ ] O que a página de planos promete é o que o código faz.

## Bloco 3 — Crosslinking interno

Nenhuma órfã; profundidade máxima 3-4 cliques da home.

- [ ] Breadcrumbs em todas as páginas (BreadcrumbList em schema).
- [ ] Links entre entidades relacionadas (cidade↔estado↔vizinhas; item↔categoria↔similares).
- [ ] Script de órfãs: toda URL do sitemap alcançável por links internos da home.
- [ ] Links contextuais no corpo, não só menu/rodapé.
- [ ] Paginação com `<a href>` navegável sem JS.
- [ ] Âncoras descritivas e variadas.

Links quebrados (obrigatório antes de entregar):
- [ ] Crawler no site inteiro seguindo todo `<a href>` interno; nenhum aponta para 404/410/500 nem cadeia de redirect.
- [ ] **Corrigir na origem, não com redirect** (301 para link próprio queima crawl budget e esconde o defeito).
- [ ] Cobrir menu, rodapé, breadcrumbs, "veja também", paginação, cards, sitemap, conteúdo importado; conferir âncoras `#` e links para arquivos.
- [ ] Diretório grande: rastrear por template (fixas + amostra de cada tipo de ficha).
- [ ] **Repetir o rastreamento após as correções** até zerar.

## Bloco 4 — SEO on-page programático

- [ ] Title único por página (template com variáveis reais); amostrar 20, sem duplicados.
- [ ] Meta description única.
- [ ] H1 único, coerente com o title, um só no DOM.
- [ ] Canonical correto (https, host único), inclusive em paginadas.
- [ ] Thin content: páginas programáticas com conteúdo diferenciado além do dado bruto; se duas do mesmo tipo diferem só por nome/endereço, marcar risco.
- [ ] Sem travessão em texto gerado. Ortografia PT-BR. Capitalização só em nomes próprios.
- [ ] URLs limpas, minúsculas, com hífen, sem acentos/parâmetros desnecessários.

## Bloco 5 — Dados estruturados e social

- [ ] Schema.org por tipo (LocalBusiness/Organization, ItemList, BreadcrumbList, FAQPage, WebSite+SearchAction na home se houver busca).
- [ ] Validar amostra no Rich Results Test (ou parser local de JSON-LD).
- [ ] Open Graph + Twitter Cards em todas as páginas.
- [ ] og:image acessível (testar a URL por curl).

## Bloco 6 — Técnico e infraestrutura

- [ ] HTTPS forçado (http→https 301).
- [ ] www/non-www em um único 301 (sem cadeia).
- [ ] Trailing slash padronizado com 301 da variante errada.
- [ ] Headers: 200 nas válidas, 404 real nas inexistentes, 410 onde aplicável.
- [ ] Core Web Vitals: Lighthouse/PageSpeed na home, numa listagem e numa ficha (LCP < 2,5s, CLS < 0,1).
- [ ] next/image com lazy loading e dimensões (evitar CLS).
- [ ] Cache Cloudflare sem cachear dinâmico indevidamente (checar `cf-cache-status`).
- [ ] PM2 com restart automático e `pm2 save`. Nginx gzip/brotli.
- [ ] **Índices no Postgres** para busca/filtro/ordenação (cidade, estado, categoria, slug).
- [ ] Testar listagem e busca com **volume real**, na página mais pesada e pior filtro.
- [ ] Paginação com limit/offset (ou cursor), nunca carregar tudo e cortar no código.
- [ ] Favicon e webmanifest.
- [ ] Analytics disparando (request de coleta no load).

## Bloco 7 — Conteúdo importado (cenário B)

- [ ] Imagens do importado: script testa cada URL (HEAD); relatar total, com imagem, quebradas, apontando pro domínio antigo.
- [ ] Imagens do host antigo: baixar e re-hospedar (nunca hotlink).
- [ ] Conteúdos sem imagem: listar para decisão do Anderson.
- [ ] URLs antigas → novas: 301 para cada (não deixar cair em 404).
- [ ] Links internos no corpo dos textos importados: atualizar para as novas.
- [ ] Datas de publicação preservadas (não zerar para a data do import).
- [ ] Encoding correto (sem "Ã§" no lugar de "ç").

## Bloco 8 — Domínio expirado de leilão (cenário C)

- [ ] Levantar URLs antigas (Wayback CDX API) e, se houver, GSC.
- [ ] Levantar URLs com backlinks externos (Ahrefs/DataForSEO) — prioritárias.
- [ ] Estratégia: URL com backlink + equivalente → 301 para o equivalente; com backlink sem equivalente → 301 para categoria próxima (home só em último caso); sem backlink e irrelevante → **410 Gone**.
- [ ] Implementar no Next (`next.config` redirects ou middleware por lookup) e testar amostra (301 em salto único).
- [ ] Higiene: histórico Wayback (nicho anterior/spam), backlinks tóxicos (disavow?), ações manuais/remoções/disavow herdados no GSC, Safe Browsing, SPF/DMARC mínimos.

## Bloco 9 — Qualidade dos dados (diretório)

- [ ] **Passada automática**: script na base inteira medindo campos vazios, duplicatas (mesmo CNPJ/telefone/nome+endereço), telefone/CEP inválido, encoding, nomes truncados, registros sem dados p/ ficha. Registrar números.
- [ ] **Passada manual por amostra**: ≥ 30 fichas publicadas, cidades diferentes, comparar com a fonte (existe? endereço bate? nome legível?).
- [ ] Registro **errado** (duplicado/corrompido/inexistente) sai ou vira noindex. Dado **escasso** (poucos campos): só **medir e listar** para o Anderson decidir, sem corte automático.
- [ ] Amostra manual reprovando > 10% → **parar a entrega** (defeito na extração).
- [ ] **Duplicatas**: eleger canônica (mais completa), demais com `rel=canonical` ou 410. Nunca duas iguais indexadas.
- [ ] **Reimportação sem perder curadoria**: script versionado, dataset datado, **tabela de exceções que a importação respeita** (blocklist/overrides da Fase 4), rodar diff antes, e **testar o ciclo** (remove/reimporta não volta; enriquece/reimporta permanece).
- [ ] **Botão de informar erro** presente e testado (Fase 7).
- [ ] **LGPD** (lista pessoa física): canal de remoção do titular no rodapé + na política; política declara origem/base legal/dados/como remover; prazo cumprível; remoção real (410/404 + blocklist + fora do sitemap); publicar só o que a fonte pública publica; e-mail do responsável testado.
- [ ] Ficha removida devolve **410 Gone** (ou 404 real) e sai do sitemap.
- [ ] **Página de metodologia dos dados**: origem, data de extração, frequência, o que o site acrescenta, como pedir correção; linkada no rodapé; data da última atualização em cada ficha.

## Bloco 10 — Backlinks do domínio (todos os cenários)

- [ ] Pedir ao Anderson a planilha de backlinks (Ahrefs/DataForSEO). Sem ela: PENDENTE com motivo.
- [ ] Agrupar por URL de destino, ordenar por força/domínios de origem.
- [ ] Por destino: **criar página** (tema relevante sem equivalente), **301** (equivalente existe), **410** (sem sentido).
- [ ] Nenhuma URL com backlink pode ficar em 404. Nunca tudo para a home. Conferir amostra (301 salto único).

## Bloco 11 — Acompanhamento 7 e 30 dias

- [ ] **7 dias**: GSC, comparar enviadas x indexadas, erros de cobertura, soft 404, fichas entrando.
- [ ] **30 dias**: repetir; avaliar proporção indexada e "descoberta, mas não indexada" (thin content).
- [ ] Nas duas datas: relatório de desempenho (consultas e posições).
- [ ] Repetir rastreamento de links quebrados após qualquer alteração em massa.
- [ ] **Registrar as duas datas no relatório** como compromisso agendado.

## Relatório de saída

Markdown padronizado ao Anderson. Regras: nunca marcar aprovado sem verificar; BLOQUEANTE só para páginas essenciais ausentes, sitemap quebrado, robots bloqueando, noindex em produção, soft 404 em massa; sem travessão; marca "QMIX Digital". Incluir: classificação (A/B/C) + evidência; aprovados; pendências (tabela item/bloco/gravidade/o que falta/quem resolve); números do importado (B); redirects (C); links internos; conferência de dados (diretório) incluindo **ciclo de reimportação testado**; backlinks; acompanhamento 7/30 dias; observação fixa de que ads.txt/código AdSense não foram inseridos e o site está preparado.
