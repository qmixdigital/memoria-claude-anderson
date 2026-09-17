---
name: finalizacao-projeto
description: Checklist obrigatório de finalização de diretórios, ferramentas e plataformas web (Next.js + Prisma + PostgreSQL) antes de entregar ao Anderson. Use este skill sempre que estiver finalizando, concluindo, entregando ou revisando um projeto web, quando o usuário disser que o site está pronto, quando pedir revisão pré-lançamento, pré-AdSense ou pré-produção, ou quando mencionar deploy final de qualquer diretório (casasderecuperacao, bitcao, masterjuris, encontreleiloes, palpitemestre, facoqr, personalverificado ou similares). Também deve ser usado ao importar conteúdo de sites antigos para novos diretórios e ao configurar domínios expirados.
---

# Finalização de Projeto — Checklist QMIX Digital

Este skill define a verificação obrigatória antes de qualquer projeto ser considerado finalizado. O resultado final é sempre um relatório padronizado (ver seção "Relatório de saída") enviado ao Anderson.

Regra geral: nada é "assumido como ok". Cada item deve ser verificado de fato (via curl, script, consulta ao banco ou inspeção de código). Se um item não puder ser verificado, ele entra no relatório como PENDENTE com o motivo.

---

## Etapa 0 — Classificar o projeto (obrigatório antes de tudo)

Antes de rodar qualquer checagem, determine e registre no relatório qual dos cenários se aplica. Isso muda quais blocos do checklist são executados.

**Como classificar (verifique, não pergunte apenas):**

1. Rode `whois` no domínio e verifique a data de criação e histórico.
2. Consulte o Wayback Machine (`http://archive.org/wayback/available?url=DOMINIO`) para ver se o domínio teve conteúdo anterior.
3. Verifique no código/banco se há tabelas ou registros de conteúdo importado (posts migrados, URLs legadas, campos como `legacy_url`, `imported_at`, datas de publicação antigas).
4. Se ainda houver ambiguidade, pergunte ao Anderson: "Este projeto é construção nova, transformação de site existente, ou domínio expirado comprado em leilão?"

**Cenários possíveis:**

- **A) Construção nova em domínio novo** → executar blocos 1 a 6.
- **B) Transformação de site existente em diretório** (conteúdo antigo importado) → executar blocos 1 a 6 + bloco 7 (conteúdo importado).
- **C) Domínio expirado comprado em leilão** (masterjuris, bitcao e similares) → executar blocos 1 a 6 + bloco 8 (redirecionamentos e higiene do domínio).
- **B+C podem coexistir**: domínio expirado que também recebeu conteúdo importado → executar tudo.

**Além do cenário, registrar se o projeto é diretório**, ou seja, site cujo conteúdo vem de base de dados extraída (empresas, profissionais, estabelecimentos, leilões, plataformas). Sendo diretório, o bloco 9 passa a ser obrigatório, independente de o cenário ser A, B ou C.

Registre a classificação no topo do relatório com a evidência usada (ex.: "Wayback mostra 340 snapshots entre 2015 e 2023 → cenário C").

---

## Bloco 1 — Páginas essenciais para aprovação no AdSense

Verificar existência e resposta HTTP 200 de cada página. Verificar conteúdo real, não placeholder.

- [ ] **Sobre** — texto real explicando o que é o site, quem mantém. Nunca lorem ipsum ou texto genérico de template.
- [ ] **Contato** — com formulário funcional (testar envio) ou e-mail real visível.
- [ ] **Política de Privacidade** — deve citar explicitamente: uso de cookies, Google AdSense/parceiros de publicidade, LGPD, dados coletados e direitos do titular.
- [ ] **Termos de Uso** — adaptados ao tipo de site (diretório de dados públicos, ferramenta, etc.), incluindo isenção de responsabilidade sobre exatidão dos dados quando o site usa fontes governamentais (Receita Federal, CREF, DATASUS etc.).
- [ ] **Página 404 customizada** — com links de navegação de volta (home, categorias principais). Testar com URL inexistente e confirmar status HTTP 404 real (não 200 com aparência de 404, o que causa soft 404 no Google).
- [ ] **Banner de consentimento de cookies (CMP)** — presente e funcional. Para veicular AdSense, o Google exige CMP certificada em vários contextos; no mínimo o banner deve existir e registrar consentimento.
- [ ] Links para Privacidade e Termos presentes no rodapé de todas as páginas.

**NÃO solicitar o código do AdSense e NÃO cobrar ads.txt.** Nem todo site da rede é monetizado, então pedir o publisher ID trava a entrega por um dado que pode nem existir. A regra é criar todas as páginas exigidas para aprovação e deixar o site pronto para receber o código depois, sem inserir nada.

Deixar preparado significa:

- [ ] Páginas obrigatórias acima publicadas e com conteúdo real.
- [ ] Política de privacidade já redigida citando publicidade de terceiros, cookies de parceiros e link de opt-out, mesmo sem anúncio no ar.
- [ ] Banner de consentimento funcionando, com a categoria de publicidade e terceiros já prevista.
- [ ] `robots.txt` sem bloquear `Mediapartners-Google` nem `AdsBot-Google`.
- [ ] Espaços de anúncio definidos no layout (onde entrariam, com altura reservada para não gerar CLS depois), sem nenhum código.
- [ ] Raiz do site servindo arquivos estáticos corretamente, para o ads.txt funcionar quando for inserido.
- [ ] Regra de anúncio desligado em 404, tela de erro, `/admin` e painel logado já prevista no código, valendo a partir do momento em que o código entrar.

O Anderson insere o ads.txt e o código do AdSense manualmente, depois, se e quando o site for monetizado. Não listar isso como pendência.

---

## Bloco 2 — Sitemap e indexação

- [ ] `sitemap.xml` acessível com status 200 e content-type XML válido.
- [ ] Se o site tiver mais de 50.000 URLs (caso de diretórios grandes como agregadores de leilões), verificar uso de sitemap index com sitemaps segmentados de até 50.000 URLs / 50MB cada.
- [ ] Amostrar 20 a 30 URLs do sitemap com curl e confirmar que todas retornam 200 (nenhuma 404, 500 ou redirect em cadeia).
- [ ] Confirmar que URLs no sitemap são canônicas (https, host correto, sem parâmetros de filtro).
- [ ] `robots.txt` acessível, liberando o conteúdo indexável e bloqueando rotas de filtro/busca interna/parâmetros que geram duplicação. Confirmar que o robots.txt referencia o sitemap (`Sitemap: https://...`).
- [ ] Propriedade verificada no Google Search Console e sitemap enviado (se o Guilherme tiver acesso; senão, marcar como pendência para o Anderson).
- [ ] Ensinar/registrar a verificação de indexação: buscar `site:dominio` no Google, usar Ferramentas > filtro de data. Indexado nas últimas 24h é excelente. Sem nada indexado na última semana, investigar.

---

## Bloco 3 — Crosslinking interno

Objetivo: nenhuma página órfã, profundidade máxima de 3 a 4 cliques da home.

- [ ] Breadcrumbs em todas as páginas de detalhe e listagem (com BreadcrumbList em schema, ver Bloco 5).
- [ ] Links entre entidades relacionadas: página de cidade linka para o estado e cidades vizinhas; página de item linka para a categoria e itens próximos/similares; categoria linka para categorias irmãs.
- [ ] Rodar o script de verificação de órfãs: comparar o conjunto de URLs do sitemap com o grafo de links internos partindo da home (crawl simples). Toda URL do sitemap deve ser alcançável por links internos.
- [ ] Links contextuais no corpo do conteúdo, não apenas em menus e rodapés.
- [ ] Paginação com links reais (`<a href>`), navegável sem JavaScript, para o Googlebot descobrir páginas profundas.
- [ ] Âncoras de links internos descritivas e variadas (não repetir "clique aqui" ou a mesma âncora exata em escala).

**Rastreamento de links internos quebrados (obrigatório antes de entregar):**

- [ ] Rodar crawler no site inteiro partindo da home, seguindo todo `<a href>` interno, e registrar o status HTTP de cada destino. Nenhum link interno pode apontar para 404, 410, 500 nem para cadeia de redirect.
- [ ] **Corrigir na origem, não com redirect.** Link interno errado se conserta trocando o href para a URL final. Criar 301 para tapar link interno próprio queima crawl budget, atrasa o rastreamento do Google e ainda esconde o defeito. Redirect é para URL legada e link externo, que você não controla.
- [ ] Cobrir todos os pontos onde nascem links, não só o corpo do texto: menu, rodapé, breadcrumbs, seção de "veja também", paginação, cards de listagem, sitemap e links dentro de conteúdo importado.
- [ ] Conferir também as âncoras internas com `#` e os links para arquivos (PDF, imagem, download), que quebram calados e nunca aparecem em teste de navegação.
- [ ] Em diretório com dezenas de milhares de fichas, rastrear tudo se o crawler aguentar. Não aguentando, rastrear por template: todas as páginas fixas mais uma amostra de cada tipo de ficha. Link quebrado em diretório quase sempre vem do template, então aparece em milhares de páginas de uma vez.
- [ ] **Repetir o rastreamento depois das correções**, até zerar. Correção de link costuma criar link novo errado.
- [ ] Registrar no relatório: links internos rastreados, quebrados encontrados, corrigidos e o resultado da segunda passada.

---

## Bloco 4 — SEO on-page programático

- [ ] Title único por página, gerado por template com variáveis reais. Amostrar 20 páginas e confirmar que não há dois titles idênticos.
- [ ] Meta description única por página, mesmo critério.
- [ ] H1 único por página, coerente com o title, apenas um H1 no DOM.
- [ ] Canonical correto em todas as páginas, apontando para si mesma na versão canônica (https, host único). Verificar também nas páginas paginadas.
- [ ] Verificação de thin content: páginas programáticas precisam de conteúdo diferenciado além dos dados brutos (descrição, dados estruturados, contexto local). Amostrar páginas e avaliar se duas páginas do mesmo tipo diferem apenas por nome e endereço; se sim, marcar como risco.
- [ ] Sem em dashes em nenhum texto gerado. Ortografia PT-BR correta. Capitalização apenas em nomes próprios.
- [ ] URLs limpas, minúsculas, com hífen, sem acentos, sem parâmetros desnecessários.

---

## Bloco 5 — Dados estruturados e social

- [ ] Schema.org conforme o tipo de página: LocalBusiness/Organization para perfis, ItemList para listagens, BreadcrumbList em todas, FAQPage quando houver FAQ, WebSite com SearchAction na home se houver busca.
- [ ] Validar amostra de páginas no Rich Results Test (ou com parser local de JSON-LD, confirmando JSON válido e campos obrigatórios).
- [ ] Open Graph (og:title, og:description, og:image, og:url) e Twitter Cards em todas as páginas.
- [ ] og:image existente e acessível (testar a URL da imagem com curl).

---

## Bloco 6 — Técnico e infraestrutura

- [ ] HTTPS forçado: `http://` redireciona 301 para `https://`.
- [ ] Redirect www/non-www consistente em um único 301 (sem cadeia http→https→www).
- [ ] Trailing slash padronizado (com ou sem, mas consistente, com 301 da variante errada).
- [ ] Headers corretos: 200 nas páginas válidas, 404 real nas inexistentes, 410 onde aplicável.
- [ ] Core Web Vitals: rodar Lighthouse (ou PageSpeed) na home, numa listagem e numa página de detalhe. LCP < 2,5s, CLS < 0,1 como meta.
- [ ] Imagens via next/image com lazy loading e dimensões definidas (evitar CLS).
- [ ] Cache do Cloudflare configurado sem quebrar páginas dinâmicas (verificar header `cf-cache-status` e confirmar que conteúdo dinâmico não está sendo cacheado indevidamente).
- [ ] PM2 com restart automático configurado e processo salvo (`pm2 save`). Nginx com gzip/brotli ativo.
- [ ] **Índices no Postgres** para as colunas usadas em busca, filtro e ordenação (cidade, estado, categoria, slug). Sem índice, a listagem passa no teste com 200 registros e derrete com 40.000.
- [ ] Testar listagem e busca **com o volume real da base**, não com amostra. Medir a página de listagem mais pesada do site, no pior filtro.
- [ ] Paginação consultada no banco com limite e offset (ou cursor), nunca carregando tudo e cortando no código.
- [ ] Lembrar que Lighthouse na home não representa diretório: medir também uma listagem cheia e uma ficha.
- [ ] Favicon e webmanifest presentes.
- [ ] Analytics instalado e disparando (verificar request de coleta no carregamento da página).

---

## Bloco 7 — Conteúdo importado de site antigo (apenas cenário B)

Quando o projeto transforma um site existente em diretório, o conteúdo antigo importado precisa de auditoria própria.

- [ ] **Imagens do conteúdo importado**: rodar script que percorre todo conteúdo importado no banco, extrai as URLs de imagem (tags img no HTML armazenado e campos de imagem destacada) e testa cada uma com HTTP HEAD. Relatar: total de conteúdos, quantos têm imagem, quantas imagens estão quebradas (404/timeout), quantas ainda apontam para o domínio antigo.
- [ ] Imagens que apontam para o domínio/host antigo devem ser baixadas e re-hospedadas localmente (ou no storage do projeto), nunca hotlink do site antigo.
- [ ] Conteúdos importados sem nenhuma imagem: listar no relatório para o Anderson decidir (adicionar imagem ou aceitar sem).
- [ ] URLs antigas dos conteúdos: se a estrutura de URL mudou na migração, mapear URL antiga → URL nova e criar 301 para cada uma (não deixar as antigas caírem em 404).
- [ ] Links internos dentro do corpo dos textos importados: verificar se apontam para URLs antigas quebradas e atualizar para as novas.
- [ ] Datas de publicação preservadas na migração (não zerar tudo para a data do import).
- [ ] Encoding correto (sem caracteres corrompidos tipo "Ã§" no lugar de "ç") — amostrar conteúdos e verificar.

---

## Bloco 8 — Domínio expirado comprado em leilão (apenas cenário C)

Domínios expirados têm histórico, backlinks e URLs indexadas herdadas. Ignorar isso desperdiça a autoridade que motivou a compra e pode importar problemas.

**Levantamento do legado:**

- [ ] Levantar URLs antigas do domínio: Wayback Machine (CDX API: `http://web.archive.org/cdx/search/cdx?url=dominio/*&output=json&collapse=urlkey&limit=2000`) e, se houver acesso, GSC (relatório de páginas e de links).
- [ ] Levantar as URLs antigas que recebem backlinks externos (Ahrefs/DataForSEO, que o Anderson já usa). Essas são as prioritárias.

**Estratégia de redirecionamento (regra de decisão):**

- [ ] URL antiga com backlinks E com equivalente temático no site novo → **301 para a página equivalente** (nunca tudo para a home).
- [ ] URL antiga com backlinks mas sem equivalente específico → 301 para a categoria mais próxima; só em último caso para a home. Redirecionamento em massa de tudo para a home é tratado como soft 404 pelo Google e desperdiça o link equity.
- [ ] URL antiga sem backlinks e sem relevância (conteúdo lixo, spam, idioma diferente, tags/feeds antigos) → **410 Gone**, para o Google desindexar rápido.
- [ ] Implementar os redirects no Next.js (`next.config` redirects ou middleware para volume grande via lookup em banco/JSON), e testar amostra com curl confirmando 301 em um salto único.

**Higiene do domínio:**

- [ ] Verificar histórico no Wayback: o domínio teve conteúdo em outro nicho, spam, cassino/pirataria/farmácia? Registrar no relatório, pois afeta expectativa de recuperação.
- [ ] Verificar backlinks tóxicos herdados; se houver volume relevante de spam, preparar lista para eventual disavow (decisão do Anderson).
- [ ] No GSC: verificar se há ações manuais pendentes, solicitações de remoção antigas ativas e disavow herdado de dono anterior.
- [ ] Confirmar que o domínio não está em blacklists de segurança (Google Safe Browsing: `https://transparencyreport.google.com/safe-browsing/search?url=dominio`).
- [ ] E-mail: configurar SPF/DMARC mínimos para o domínio não ser usado em spoofing enquanto não tem e-mail ativo.

---

## Bloco 9 — Qualidade dos dados extraídos (apenas projetos de diretório)

Diretório vive do dado extraído, e dado extraído vem sujo: registro duplicado, empresa que fechou, nome truncado, telefone inválido, endereço no campo errado, texto com encoding corrompido. Publicar sem conferir gera thin content em escala, reclamação de terceiro e risco de reprovação no AdSense.

**Conferência dupla, obrigatória. Uma passada só não serve:**

- [ ] **Primeira passada, automatizada**: rodar script sobre a base inteira medindo campos vazios, duplicatas (mesmo CNPJ, telefone, ou nome mais endereço), telefone fora do padrão, CEP inválido, encoding corrompido, nomes truncados e registros sem dados suficientes para virar ficha. Registrar os números no relatório.
- [ ] **Segunda passada, manual por amostra**: abrir no mínimo 30 fichas já publicadas, sorteadas e em cidades diferentes, e comparar com a fonte original. Conferir se o negócio existe de fato, se o endereço bate e se o nome está legível.
- [ ] As duas são obrigatórias porque pegam coisas diferentes: script não detecta "existe no cadastro mas fechou em 2019", e conferência manual não varre 40.000 registros.
- [ ] Registro reprovado sai da publicação ou entra como `noindex`. Nunca publicar sujo com a intenção de arrumar depois.
- [ ] **Não aplicar corte automático de ficha por quantidade de campos preenchidos.** Isso o Anderson decide manualmente quando começa a trabalhar no site, depois da entrega. O que a entrega precisa fazer é **medir e listar**: quantas fichas têm poucos dados e quais são, para ele avaliar caso a caso. Reprovação automática aqui vale só para dado **errado** (duplicado, corrompido, inexistente), não para dado **escasso**.
- [ ] Se a amostra manual reprovar mais de 10% das fichas, **parar a entrega**: o defeito está na extração, e a correção é refazer a importação, não remendar ficha a ficha.

**Duplicatas: eleger a ficha canônica:**

- [ ] Mesma entidade cadastrada mais de uma vez (IDs diferentes, mas mesmo CNPJ, telefone, ou nome mais endereço): eleger como canônica a ficha mais completa e apontar as demais para ela com `rel="canonical"`. Se a duplicata não acrescenta nada, remover com 410.
- [ ] Nunca deixar duas fichas iguais indexadas. Elas competem pela mesma busca, o Google escolhe sozinho qual mostrar, e às vezes escolhe a mais pobre.
- [ ] Registrar no relatório quantas duplicatas foram encontradas e qual critério decidiu a canônica.

**Reimportação sem perder o trabalho de curadoria:**

Este é o item que mais custa retrabalho em diretório: a base é atualizada, o script roda de novo, e volta tudo que tinha sido removido por report procedente, por pedido de titular ou corrigido à mão. Meses de curadoria desfeitos em um comando.

- [ ] Script de importação **reproduzível e versionado no repositório**, nunca comando solto rodado uma vez na VPS e esquecido.
- [ ] Registrar a versão e a data do dataset de cada rodada, para saber o que entrou quando.
- [ ] Tabela de **exceções que a importação respeita**: registros removidos (report procedente, pedido LGPD) e campos corrigidos manualmente. A importação nunca sobrescreve o que está marcado ali.
- [ ] Rodar a importação seguinte em modo diff primeiro: quantos registros entram, saem e mudam, **antes** de aplicar.
- [ ] **Testar o ciclo completo antes de entregar**: importar, remover uma ficha, reimportar, e confirmar que ela não voltou. Sem esse teste, a proteção é só intenção.

**Botão de informar erro na ficha (obrigatório em diretório):**

Como sempre passa lixo, a própria página precisa oferecer o caminho da correção. Isso reduz reclamação direta, ajuda a limpar a base com a ajuda do visitante e mostra ao Google que o site tem curadoria.

- [ ] Toda página de ficha (profissional, empresa, estabelecimento) DEVE ter botão de informar erro, **visível e com cor destacada**, dentro do bloco de dados. Nunca escondido no rodapé nem em cinza claro.
- [ ] Texto no formato pergunta mais ação, citando a entidade da ficha: "Esta vidraçaria não existe? Informar erro". Ícone de alerta junto ao texto ajuda a leitura.
- [ ] Padrão já em produção para copiar: `vidracariaperto.com.br`, nas páginas de ficha.

```html
<button type="button" class="rep-trigger">
  <svg viewBox="0 0 20 20" class="rep-trigger__ic" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
    <path d="M10 7v4M10 14h.01" stroke-linecap="round"></path>
    <path d="M10 2.5 1.8 16.5a1 1 0 00.9 1.5h14.6a1 1 0 00.9-1.5L10 2.5z" stroke-linejoin="round"></path>
  </svg>Esta vidraçaria não existe? Informar erro
</button>
```

- [ ] Ao clicar, abrir formulário curto: motivo (não existe, dados errados, fechou, é duplicado), campo livre e contato opcional. Nunca `mailto:` puro, que morre em quem não tem cliente de e-mail configurado.
- [ ] O report precisa chegar em lugar que o Anderson leia e ficar gravado junto com a URL da ficha. Report que se perde é o mesmo que botão sem função.
- [ ] Testar o envio de ponta a ponta antes de entregar, e anexar a evidência no relatório.
- [ ] Adaptar o texto ao nicho de cada diretório ("Este profissional não atende mais?", "Esta clínica não existe?"), mantendo a mesma estrutura.

---

**Dados pessoais e LGPD (quando o diretório lista pessoa física):**

Ficha com nome de pessoa é tratamento de dado pessoal, mesmo vindo de fonte pública. A LGPD garante ao titular pedir correção e remoção, e o site precisa oferecer esse caminho de forma explícita. É o maior risco jurídico desse tipo de projeto, e o botão de informar erro cobre só parte dele: quem reporta ali costuma ser visitante, não o titular do dado.

- [ ] **Canal de solicitação de remoção ou correção pelo próprio titular**, separado do botão de informar erro, acessível pelo rodapé de todas as páginas e citado na política de privacidade.
- [ ] Política de privacidade DEVE declarar: a origem dos dados (Receita Federal, conselho de classe, órgão público, nome da base), a base legal do tratamento, quais dados são exibidos e como o titular pede a remoção.
- [ ] Prazo de resposta declarado e realmente cumprível. Prazo declarado e descumprido é pior que prazo não declarado.
- [ ] Solicitação atendida gera remoção de verdade: ficha fora do ar, URL devolvendo 410, e o registro marcado na base para **não voltar na próxima importação**.
- [ ] Publicar apenas o que a fonte pública publica. Nunca exibir CPF completo, endereço residencial de pessoa física ou qualquer dado que não veio da fonte.
- [ ] E-mail do responsável pelos dados funcionando, testado com envio real antes da entrega.

**Ficha removida devolve 410, nunca 404:**

- [ ] Quando um report procede ou o titular pede remoção, a URL da ficha DEVE devolver **410 Gone**. O 410 diz "removido de propósito" e o Google desindexa em dias; o 404 pode ficar meses sendo re-rastreado e aparecendo na SERP com a ficha que você tirou do ar.
- [ ] Manter lista das URLs removidas, com data e motivo. Serve para bloquear o retorno na próxima importação e como evidência se houver reclamação.
- [ ] Remover a URL do sitemap junto. Ficha em 410 dentro do sitemap vira erro de cobertura no Search Console.

**Página de metodologia dos dados (obrigatória em diretório):**

- [ ] Criar página explicando de onde vem a base, quando foi extraída, com que frequência é atualizada, o que o site acrescenta ao dado bruto e como pedir correção.
- [ ] Linkar no rodapé de todas as páginas e a partir das fichas, com âncora descritiva.
- [ ] Exibir em cada ficha a data da última atualização do dado.
- [ ] Conta como página de valor para o AdSense: mostra critério e curadoria, e afasta a leitura de que o site é raspagem republicada.

---

## Bloco 10 — Backlinks apontando para o domínio (todos os cenários)

Vale para projeto novo também, não só para domínio expirado: o domínio pode ter recebido links de citação, imprensa ou diretório antes do site atual existir.

- [ ] **Pedir ao Anderson a planilha completa de backlinks do domínio** (Ahrefs ou DataForSEO, que ele já usa). Sem a planilha, esta etapa não é feita por estimativa: entra no relatório como PENDENTE, com o motivo.
- [ ] Agrupar os backlinks pela URL de destino e ordenar por força e quantidade de domínios de origem.
- [ ] Para cada URL de destino que recebe link, decidir uma das três saídas:
  - **Criar página** quando o link aponta para um tema relevante ao projeto e ainda não existe página equivalente. É a saída de maior retorno: aproveita a autoridade e gera conteúdo com demanda já comprovada.
  - **301 para o equivalente** quando a página correspondente já existe no site novo.
  - **410** quando o destino não faz sentido nenhum no projeto atual.
- [ ] URL que recebe backlink e hoje devolve 404 é força jogada fora. Nenhuma pode ficar assim ao fim da entrega.
- [ ] Nunca redirecionar tudo para a home: o Google trata redirecionamento em massa sem equivalência como soft 404 e descarta o link equity.
- [ ] Conferir uma amostra com curl e confirmar 301 em salto único, sem cadeia.
- [ ] Registrar no relatório: quantas URLs recebem backlink, quantas viraram página nova, quantas foram redirecionadas, quantas receberam 410.

---

## Bloco 11 — Acompanhamento pós-entrega (7 e 30 dias)

A entrega não termina no deploy. Diretório só revela o perfil real de indexação dias depois: no dia da subida o Search Console não tem dado nenhum, e é exatamente aí que os problemas de escala aparecem.

- [ ] **7 dias após a subida**: no Search Console, comparar URLs enviadas no sitemap com as indexadas. Conferir erros de cobertura, soft 404 e se as fichas começaram a entrar.
- [ ] **30 dias após a subida**: repetir a comparação. Avaliar a proporção indexada e, principalmente, o volume de "descoberta, mas não indexada", que é o sinal clássico de thin content em diretório.
- [ ] Nas duas datas, olhar o relatório de desempenho: quais consultas já aparecem e em que posição.
- [ ] Repetir o rastreamento de links quebrados (Bloco 3) depois de qualquer alteração em massa feita nesse período.
- [ ] **Registrar as duas datas no relatório de entrega**, com dia certo, como compromisso agendado. "Acompanhar depois" não é acompanhamento.

---

## Relatório de saída (obrigatório)

Ao final, gerar um relatório em Markdown com este formato e enviar ao Anderson:

```
# Relatório de Finalização — [nome do projeto] ([dominio])
Data: [data]
Classificação: [A / B / C / B+C] — evidência: [...]

## Resumo
- Itens verificados: X
- Aprovados: X
- Pendências: X (sendo Y bloqueantes para AdSense)

## Aprovados
[lista curta por bloco]

## Pendências
| Item | Bloco | Gravidade | O que falta | Quem resolve |
|------|-------|-----------|-------------|--------------|
(Gravidade: BLOQUEANTE = impede aprovação AdSense ou indexação / ALTA / MÉDIA / BAIXA)

## Números do conteúdo importado (se cenário B)
- Conteúdos importados: X | Com imagem: X | Imagens quebradas: X | Re-hospedadas: X

## Redirecionamentos (se cenário C)
- URLs legadas mapeadas: X | 301 criados: X | 410 aplicados: X | URLs com backlinks tratadas: X

## Links internos
- Rastreados: X | Quebrados encontrados: X | Corrigidos: X | Quebrados na segunda passada: X

## Conferência de dados (se diretório)
- Registros na base: X | Reprovados na passada automática: X | Duplicatas removidas: X
- Amostra manual: X fichas conferidas, X reprovadas (Y%)
- Botão de informar erro: presente nas fichas e envio testado (sim/não)
- Fichas com poucos campos preenchidos: X (listadas em anexo, para decisão manual do Anderson)
- Página de metodologia publicada: sim/não | Canal LGPD de remoção: sim/não | Ficha removida devolvendo 410: sim/não
- Duplicatas encontradas: X | Canonical aplicado: X | Removidas com 410: X
- Ciclo de reimportação testado (remove ficha, reimporta, não volta): sim/não

## Backlinks
- URLs de destino com backlink: X | Páginas criadas para aproveitar: X | 301: X | 410: X | Sem tratamento: X

## Acompanhamento agendado
- Checagem de 7 dias: [data] | Checagem de 30 dias: [data]

## Observação fixa
ads.txt NÃO foi criado e o código do AdSense NÃO foi solicitado nem inserido. As páginas exigidas para aprovação estão prontas e o site está preparado para receber o código quando o Anderson decidir monetizar.
```

Regras do relatório:

- Nunca marcar um item como aprovado sem ter executado a verificação.
- Gravidade BLOQUEANTE é reservada para: páginas essenciais ausentes, sitemap quebrado, robots bloqueando o site, noindex acidental em produção, soft 404 em massa.
- Sem em dashes no relatório. Marca sempre escrita como "QMIX Digital".
