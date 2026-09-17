---
name: diretorios-do-zero
description: Guia completo de ponta a ponta para criar um diretório web do zero (Next.js + Drizzle/Prisma + PostgreSQL), da concepção à finalização e pós-lançamento. Use sempre que for iniciar, construir, evoluir, curar dados, ou finalizar um site de diretório da rede QMIX (casasderecuperacao, casasderecuperacaosaopaulo, vidracariaperto, bitcao, masterjuris, encontreleiloes, palpitemestre, personalverificado ou similares), ou quando o usuário disser "criar diretório", "diretório do zero", "novo diretório", "ingestão de dados", "importar base", "limpar base de diretório", "site de listagem/agregador", além de finalização/revisão pré-AdSense/pré-produção. Absorve e estende a skill finalizacao-projeto (a finalização é a última fase deste guia).
---

# Diretórios do Zero — Guia de Ciclo Completo (QMIX Digital)

Este skill conduz um projeto de **diretório** do início ao fim: um site cujo conteúdo principal vem de uma **base de dados extraída** (empresas, profissionais, estabelecimentos, leilões, plataformas) organizada em fichas + listagens por hierarquia geográfica ou temática.

Ele **substitui e estende** a skill `finalizacao-projeto`: tudo que era checklist de entrega virou a **Fase 9 (Finalização)**; as fases anteriores cobrem a construção, a ingestão de dados, a curadoria durável, a UGC e o SEO técnico, com os padrões já validados em produção (casasderecuperacao.com.br, clinicasrecuperacaosaopaulo.com, vidracariaperto.com.br).

**Regra-mãe (herdada da finalização):** nada é "assumido como ok". Cada item é verificado de fato (curl, script, banco, inspeção de código). O que não puder ser verificado entra no relatório como PENDENTE com o motivo.

**Arquivos de referência** (leia quando for executar a fase):
- `references/ingestao-e-curadoria.md` — pipeline de ingestão, filtros de tema, CNAE, dedup, blocklist, overrides, detecção de falsos positivos.
- `references/ugc-e-interacao.md` — botão de informar erro (HTML + modal acessível), API de correções, moderação, reviews, e-mail (SMTP do Gmail; a rede não usa mais Resend).
- `references/diretorio-sobre-site-existente.md` — quando um site NOSSO vira diretório: dois motores num hostname só, montagem por path, e a medição do que o site já tinha perdido.
- `references/medir-ui-com-playwright.md` — armadilhas de medir UI com Playwright: instrumento que mente, alvo ausente como falso negativo, caixa que corta SVG, acessibilidade por comportamento.
- `references/seo-e-render.md` — schema JSON-LD por tipo, sitemap-index, FAQPage automático, botão copiar frase, tabelas responsivas, cidade vazia 404, ordenação por contato.
- `references/design-diretorio.md` — **a UI densa que as skills de design não cobrem**: tabela no celular, tabular-nums, paginação de 126 páginas, busca dentro da listagem, tradução do dado bruto, ficha em duas colunas. Ler antes de desenhar listagem ou ficha.
- `references/gsc-api.md` — Search Console pela API com a conta de serviço da rede: enviar sitemap, conferir se o Google leu, inspecionar URL e puxar consultas, sem abrir o painel. Ferramenta em `scripts/gsc.py`.

---

## Fase 0 — Concepção e decisões iniciais

Antes de escrever código, decidir e registrar (perguntar ao Anderson só o que não der para inferir):

1. **Hospedagem:** "Cloudflare Pages ou VPS? Se VPS, qual?" (regra global). Diretório com dezenas de milhares de fichas e SSR/ISR quase sempre vai para **VPS** (opengravity ou clinicas-vps/srv1166087).
2. **Nicho e entidade da ficha:** o que cada ficha representa (clínica, profissional, empresa, leilão). Define o `@type` do schema (ver Fase 6).
3. **Fonte de dados:** base pública (CNES/DATASUS, Receita Federal/CNPJ, conselhos de classe, editais) ou raspagem própria. Anotar CNAE/filtros de origem.
4. **Cenário do domínio** (classificação da finalização, faça já): (A) construção nova, (B) transformação de site existente, (C) domínio expirado de leilão. Use `whois` + Wayback + banco. B e C podem coexistir.
5. **Hierarquia de navegação:** normalmente Estado → Cidade → Ficha, com listagens em cada nível. Profundidade máxima 3-4 cliques da home.

---

## Fase 1 — Stack e infraestrutura

- **Stack padrão:** Next.js 15/16 (App Router) + Drizzle ORM (ou Prisma) + PostgreSQL + Tailwind + next/font. TypeScript.
- **Deploy zero-downtime na VPS (obrigatório):** duas entradas PM2 efêmeras (portas ex. 3013/3014), Nginx upstream com **`max_fails=0`**, `deploy.sh` que sobe o B, recarrega o A e derruba o B. **Nunca** `output: 'standalone'`, nunca `pm2 restart`/`pm2 update`. Ver regras completas no CLAUDE.md ("Deploy Next.js na VPS"). Fora do deploy roda só a instância principal.
- **Cloudflare** proxied, SSL Full, token por conta em `D:/SISTEMAS/Cloudflare/contas.json`. Purge por `purge_everything` após deploy.
- **Rota de trabalho:** editar local, transferir por `base64 -w0 arquivo | ssh host 'base64 -d > destino'` (scp costuma estar desabilitado; caminhos com `()[]` precisam de aspas no destino). Rodar scripts Node de manutenção com `node` do nvm (`export PATH=/root/.nvm/versions/node/vXX/bin:$PATH`).
- **Gotcha de heredoc:** SQL/JS com aspas simples dentro de `ssh host '...'` quebra. Prefira **escrever o script local e transferir por base64**, depois `node /tmp/script.mjs`.

---

## Fase 2 — Ingestão de dados

O diretório vive do dado extraído. A ingestão precisa ser **reprodutível, versionada e idempotente**. Padrão validado (casas): scripts numerados em `scripts/ingest/` (`00-prepare` cria staging + carrega municípios IBGE; `10-<fonte>`, `20-<fonte>` populam staging; `30-merge` resolve cidade, deduplica e grava as fichas).

**Ponto mais importante e mais perigoso:** o merge costuma fazer `TRUNCATE clinics ... CASCADE` e **reconstruir tudo do staging** a cada rodada. Isso significa que **toda edição manual, remoção e curadoria é apagada na próxima ingestão**, a menos que seja protegida por mecanismos duráveis (Fase 4). Registrar versão/data do dataset de cada rodada e rodar em **modo diff** antes de aplicar.

Detalhes de código (staging, merge, resolução de cidade, dedup): **`references/ingestao-e-curadoria.md`**.

---

## Fase 2b — Normalização da base da Receita (passo OBRIGATÓRIO)

O mesmo defeito pegou os três diretórios do lote: **99 ordinais quebrados** no cartório, **2.750 endereços colados** no goiânia, **12.412 fichas** no ebookcult, que é **54% da base**. Não é polimento: é mais da metade do site saindo errado. A base da Receita vem em caixa alta, abreviada e sem espaço depois da pontuação, e publicar assim é thin content com cara de raspagem.

Rode a normalização **antes do merge gravar a ficha**, nunca depois na camada de exibição.

**a) Dicionário de abreviações, com regra de exclusão.** O dicionário troca token a token, e a regra de exclusão é o que impede estrago:

```js
const ABREV = { R: "Rua", AV: "Avenida", TV: "Travessa", PC: "Praça", ROD: "Rodovia",
  JD: "Jardim", VL: "Vila", PQ: "Parque", CJ: "Conjunto", ST: "Setor", QD: "Quadra", LT: "Lote" };
// NUNCA expandir quando o token faz parte do nome proprio nem quando ja esta por extenso.
const NAO_EXPANDIR = /\b(RUA|AVENIDA|TRAVESSA|PRACA|PRAÇA|RODOVIA)\b/i;
```

Sem a exclusão, "AVENIDA R DOM PEDRO" vira "AVENIDA Rua DOM PEDRO".

**b) Ordinal com concordância de gênero, LIGADO no nome e DESLIGADO em logradouro.** É a pegadinha que gerou os 99 casos:

```js
// "2 OFICIO" -> "2o Oficio" (masculino) | "3 VARA" -> "3a Vara" (feminino)
// Em LOGRADOURO, "1000" e numero de porta, nao ordinal: "RUA 1000" nao vira "1000a Rua".
normalizaNome(t)       // ordinal: SIM
normalizaLogradouro(t) // ordinal: NAO
```

**c) A armadilha que fez isso reaparecer depois de corrigido: existem DUAS funções de formatação, e só uma tem o dicionário.** Uma no pipeline de ingestão, outra no render (ou no admin, ou no gerador de slug). Corrige-se uma, a outra continua publicando errado. **Antes de dar por resolvido:**

```bash
grep -rn "toUpperCase\|titleCase\|formataEndereco\|capitalize" src/ scripts/ | grep -v node_modules
```

Se aparecer mais de uma, ou elas passam a chamar a MESMA função, ou o defeito volta.

**d) Medir depois, sempre.** Contar quantas fichas ainda têm token abreviado, ordinal cru ou palavra colada, e **gravar o número em disco**. Sem contagem, "normalizei" é opinião.

---

## Fase 3 — Filtro de tema na ingestão (só fica o que é do nicho)

Base pública vem com muito ruído fora do nicho. No caso saúde/recuperação, o filtro CNES "serviço 115" e o CNAE da Receita trouxeram UBS, hospitais gerais, APAE/escolas, universidades, associações, clínicas médicas, psicologia geral e **profissionais individuais (pessoa física)**. Publicar isso gera thin content, reclamação de terceiro e risco no AdSense.

O merge aplica um **filtro de tema em camadas**, sempre com um **guard de nicho** que protege o que é relevante (no caso saúde mental: `caps`, `psicossocial`, `saude mental`, `comunidade terapeutica`):

1. Por **nome** (`OFFTOPIC_RE`): UBS/posto, hospital/maternidade, APAE/escola, universidade, sindicato/cooperativa, estética/comércio.
2. Por **CNAE** (`KEEP_CNAE_RE`): mantém só CNAE de saúde/assistência (86/87/88 + associações genéricas 9430/9491/9499); descarta educação/esporte/negócios.
3. Por **nome não-recuperação** (`NONREC_NAME_RE`): cultural, esportivo, animais, rural, associação de pacientes (cegos/câncer/autismo/diabéticos), etc., **protegendo CNAE de comunidade terapêutica** (8720/8730/8800).
4. **Zona cinza** (unidades genéricas): saúde pública, clínica médica geral, psicologia geral, guardado por `NICHE_RE`.
5. **Pessoa física** (profissional individual): heurística por padrão de nome próprio (conector da/de/dos, 3-6 palavras, sem palavra de instituição/nicho).

As regex completas e os scripts de varredura (dry-run obrigatório antes de qualquer remoção) estão em **`references/ingestao-e-curadoria.md`**. Regra de ouro: **sempre dry-run + amostra antes de deletar em lote**, e proteger o nicho com o guard.

---

## Fase 4 — Curadoria durável (sobrevive à reimportação)

Como o merge faz TRUNCATE+rebuild, remoções e enriquecimentos manuais precisam ser reaplicados a cada ingestão. Dois mecanismos de tabela lateral que o merge respeita (o modelo do "Bloco 9 / tabela de exceções" da finalização, agora com implementação concreta):

- **`clinic_blocklist`** (`cnpj`, `cnes`, `name`, `reason`): estabelecimentos removidos por report procedente, pedido LGPD do titular, ou falso positivo. O merge **pula** qualquer CNPJ/CNES da blocklist. É o que garante que a ficha removida **não volta**.
- **`clinic_overrides`** (`cnpj` PK + `website`, `description`, `full_description`, `phone`, `email`, `address`, ...): enriquecimento editorial manual (dados que a ingestão não traz, como site oficial e descrição). O merge **reaplica por CNPJ após o insert** (coalesce, só sobrescreve o que o override tem).

**DADO DERIVADO NUNCA MORA NO BLOCO PROTEGIDO.** No cartório, o texto de busca (o campo concatenado que alimenta a busca interna) tinha ido parar dentro do `overrides`, que a reimportação preserva. Consequência: **toda ficha reivindicada sumiria da busca a cada carga**, porque o texto congelado ficaria velho enquanto os dados mudavam. E em silêncio: a ficha continua no ar, só para de ser encontrada.

Separe os dois, explicitamente:

- **Editável pelo dono** (vai no bloco protegido, a reimportação respeita): site oficial, descrição, telefone corrigido, e-mail.
- **Derivado** (a reimportação RECALCULA sempre, nunca preserva): texto de busca, slug, contagens, campos normalizados, qualquer coisa montada a partir de outro campo.

Na dúvida, pergunte: "se o dado de origem mudar, este campo tem que mudar junto?" Se sim, é derivado e **não pode** estar no bloco protegido.

**UPSERT QUE SÓ INSERE MATA MELHORIA DE NORMALIZAÇÃO.** No cartório, bairro já cadastrado nunca era atualizado: o merge fazia `ON CONFLICT DO NOTHING`. Resultado, a correção da Fase 2b entrou só nos bairros novos, e os antigos ficaram abreviados para sempre. Para tabela de apoio (bairro, cidade, categoria), o upsert **atualiza os campos derivados**:

```sql
INSERT INTO bairro (slug, nome, nome_normalizado) VALUES (...)
ON CONFLICT (slug) DO UPDATE SET nome_normalizado = EXCLUDED.nome_normalizado;
-- DO NOTHING aqui congela o dado velho e a melhoria nunca alcanca quem ja existe.
```

**Teste do ciclo antes de entregar (obrigatório):** importar → remover uma ficha → reimportar → confirmar que **não voltou**; enriquecer uma ficha → reimportar → confirmar que o enriquecimento **permaneceu**; e **mudar a regra de normalização → reimportar → confirmar que a ficha ANTIGA foi corrigida** (é o que pega o upsert que só insere). Sem esses três, a proteção é só intenção.

Implementação (DDL, inserts em lote, passo no merge): **`references/ingestao-e-curadoria.md`**.

---

## Fase 5 — Modelo de dados, rotas e listagens

- **Rotas:** `/[slug]` resolve UF (estado) ou `cidade-uf` (cidade); `/[slug]/[itemSlug]` é a ficha. ISR `revalidate` (ex. 24h), `dynamicParams: true`. Sitemap índice em `/sitemap-index.xml` → `/sitemap/[id].xml`.
- **A ficha `/[slug]/[itemSlug]` precisa de teto de cache decidido AQUI.** `revalidate` + `dynamicParams: true` + `generateStaticParams()` vazio é a combinação certa para não ter build gigante, mas ela move o custo para o disco em runtime: cada URL visitada grava `.html` + `.rsc` + `.meta` em `.next/server/app`, e o cache padrão do Next **não tem teto nem expulsão**. Com centenas de milhares de fichas, o Googlebot transforma o cache numa cópia do banco em disco (13,6 GB numa rota só, num app cujo build ocupava 602 MB). Escolha uma: `cacheHandler` no `next.config` com limite e expulsão; ficha `force-dynamic` com cache na borda da Cloudflare por `s-maxage`; ou ISR só em UF e município (finitos, milhares) com a ficha dinâmica. **A rota de UF e de município pode ser ISR à vontade — o problema é só a de cardinalidade ilimitada.**
- **Se a saída for podar o cache em disco, pode por TAMANHO, não por idade** — e o script vive em `app/scripts/`, versionado. Podar por `mtime` não garante teto nenhum: não tem relação com o tamanho da partição, e a fatia quente do cache é reescrita a cada revalidação, então envelhece só a cauda fria. O que funciona é medir a rota (`du -xsm`), e se passar do teto, apagar da mais antiga até caber. Dois detalhes que custaram tentativa perdida: **ignorar caminho com `[colchetes]`** (é código de rota, não cache) e **usar o `mtime` do `.next/BUILD_ID` como corte** para não apagar o que saiu do build. Apagar cache é seguro com `dynamicParams: true`: a ficha é regerada no próximo acesso, sem perder URL nem indexação.
- **Cidade sem ficha → 404:** quando a curadoria esvazia uma cidade, marque `active=false` e faça o `getCity` retornar `null` para cidade inativa, para a página dar **404** em vez de página fina 200 indexável. As listagens (estado, vizinhas) já devem filtrar `active=true` para não criar link interno quebrado.
- **Ordenar fichas com contato primeiro:** na listagem da cidade, ordenar por destaque, plano pago, **depois quem tem telefone/WhatsApp/site**, depois alfabético. Ficha sem contato tem valor de SEO (nome+endereço) mas é fraca; não remover, despriorizar (e prioridade menor no sitemap).
- **Índices no Postgres** para slug, cidade, estado, categoria (a listagem derrete com volume real sem índice). Testar sempre com o **volume real** da base.
- **Desenho da listagem e da ficha:** ver `references/design-diretorio.md`. O `taste-skill` diz no próprio escopo que não cobre tabela de dados, e é justamente aí que o design de diretório costuma ser reprovado: número grande no celular, paginação, busca dentro da listagem e tradução do dado bruto.

**URL LEGADA COM BACKLINK NUNCA VIRA 410.** A ordem certa é: **levantar as legadas ANTES de decidir**, medir o tema delas contra a base, e então escolher. No ebookcult, várias URLs antigas eram exatamente o tema de uma categoria que o diretório novo teria de qualquer jeito. A saída barata: **a URL antiga vira o slug da categoria**. Isso dá continuidade de graça, sem redirect, sem cadeia e sem perder link equity, e ainda entrega uma página melhor do que a antiga.

Ordem de decisão, sempre nesta sequência:

1. Levantar legadas (Wayback CDX + GSC + planilha de backlinks do dono).
2. Medir: quantas fichas da base novas casam com o tema de cada URL antiga.
3. Casou e tem volume? **A URL antiga vira o slug** da categoria/listagem. Zero redirect.
4. Casou mas sem volume? 301 para a listagem mais próxima.
5. Não casou e não tem backlink? Aí sim, 410.

410 em URL com backlink é jogar fora autoridade que já foi paga.

**CATEGORIA DE CNAE GUARDA-CHUVA GERA LISTAS QUASE IDÊNTICAS.** CNAE largo (as associações genéricas, os "outros serviços") joga o mesmo conjunto de fichas em duas ou três categorias irmãs, e o Google escolhe uma e trata as outras como duplicata. **Meça a sobreposição antes de publicar:**

```sql
SELECT a.slug, b.slug, COUNT(*) AS comuns
FROM ficha_categoria a JOIN ficha_categoria b ON a.ficha_id = b.ficha_id AND a.slug < b.slug
GROUP BY 1,2 HAVING COUNT(*) > 20 ORDER BY comuns DESC;
```

Irmãs com sobreposição alta: ou fundem, ou a listagem **ordena por aderência ao termo** (ficha cujo nome ou serviço contém o termo da categoria vem primeiro), de modo que as duas páginas abram diferente mesmo compartilhando fichas.

**LISTA LONGA PRECISA DE BUSCA DENTRO DELA, E SEM JAVASCRIPT.** Cidade com centenas de fichas não se navega por paginação. A busca dentro da listagem é `<form method="get">` puro, e cinco cuidados que já custaram retrabalho:

- **Filtro na URL** (`?q=termo`), para funcionar sem JS, ser compartilhável e o botão voltar do navegador fazer o esperado.
- **Resultado NÃO indexável**: `noindex` quando há `?q=`, e o `q` fora do sitemap. Senão o diretório gera uma página fina por termo digitado, que é o caminho mais curto para "descoberta, mas não indexada" em massa.
- **Canonical do resultado aponta para a listagem sem filtro.**
- **Consulta com índice** (`pg_trgm` com índice GIN, ou coluna `tsvector` com GIN). Sem índice, `ILIKE '%termo%'` faz varredura completa e derrete com o volume real.
- **Não derrubar o cache da rota inteira.** Se a listagem é ISR, a variante com `?q=` precisa ser dinâmica **sem** tornar a rota toda dinâmica; senão a página principal, que é a que ranqueia, perde o cache por causa de uma busca.

Snippets (getCity null, ordenação): **`references/seo-e-render.md`**.

---

## Fase 5b — O campo derivado de busca precisa conter o que a pessoa DIGITA

A skill já diz que dado derivado é recalculado e não mora no bloco protegido.
Falta a outra metade: **ele tem que conter os termos que o usuário real usa.**

Buscar "soluti goiania" devolvia zero porque o nome da cidade nunca entrou no
texto de busca, só a marca. O campo estava correto pela definição e inútil na
prática.

**Antes de entregar, escreva as três buscas que o usuário real faria e rode as
três:**

1. só a marca ("soluti")
2. marca mais cidade ("soluti goiania")
3. um pedaço do documento ou identificador ("5208707", "12.345.678")

Zero em qualquer uma das três é defeito do campo derivado, não do usuário.

E junto, a armadilha do filtro: `contains: termo.replace(/\D/g,"")` vira
`contains: ""` quando o termo é texto, e string vazia casa com TODO registro. A
busca de dois painéis já devolveu a base inteira assim. Todo `contains`/`LIKE`
montado de entrada precisa de teste com termo que zera o campo, e o **esperado é
zero, não tudo**.

---

## Fase 5c — Meça o ACERVO antes de desenhar a listagem

O defeito mais caro de uma entrega de blog não foi de código. A home aplicava
foto grande em toda editoria, e **264 das 600 matérias (44%) não tinham foto de
verdade**, com a falta muito desigual:

| editoria | com foto | sem foto |
|---|---|---|
| Fama (a maior, 155 artigos) | 14 | 141 |
| Guias | 93 | 39 |
| Fatos do Dia | 16 | 29 |
| Moda | 38 | 7 |

A maior editoria do site imprimia **141 retângulos cinzas**, e essa era a queixa
principal do dono. Nenhum teste de status pega isso, e a média do site (44%)
esconde a editoria que quebra (91%).

- [ ] Antes de desenhar qualquer listagem, **meça quantos itens do acervo têm o
  ativo que o layout pressupõe** (foto, linha fina, autor, data, avaliação, preço)
  e **meça POR CATEGORIA, nunca no total**.
- [ ] Distribuição desigual: a escolha de layout **por seção sai do material, com
  limiar declarado**, nunca de posição fixa no template.
- [ ] **Toda família de card que usa foto recebe só item COM foto, por
  construção.** Faltando material, ela degrada para a tipográfica em vez de
  imprimir buraco.
- [ ] O mesmo vale para **campo opcional**. Sete das 600 matérias não tinham linha
  fina, e uma delas caiu na abertura no dia da subida, deixando metade da tela
  vazia. **Sete em seiscentos é 1%, e foi visível na home no primeiro dia**:
  amostre o pior caso, não o caso médio.

---

## Fase 6 — SEO técnico e dados estruturados

- **Schema JSON-LD por tipo** (emitir via `<script type="application/ld+json">`, nunca microdata no conteúdo editável, que o Google marca como duplicado):
  - Ficha: `@type` do nicho (MedicalClinic/LocalBusiness/Physician/Service...) + **`GeoCoordinates`** quando houver lat/lng + `PostalAddress` + `BreadcrumbList`.
  - Listagem (estado/cidade/categoria): `CollectionPage` + `ItemList` + `BreadcrumbList`.
  - Artigo de blog: `Article` (com `datePublished`, `dateModified`, `mainEntityOfPage`, `image` default) + `FAQPage` quando houver seção de perguntas.
- **FAQPage automático:** extrair do HTML do artigo a seção "Perguntas frequentes" (pares `<h3>Pergunta?</h3><p>Resposta</p>`) e montar o `FAQPage` em JSON-LD. Um helper (`extractFaqJsonLd`) faz isso no template do blog. Decodificar entidades e trocar `&#8211;/&#8212;` por hífen.
- **Sitemap:** índice + segmentos (um por estado, +1 para estáticas/blog/testes/categorias). Gerar em **runtime** (`dynamic = "force-dynamic"`) porque o banco pode não responder no build. Incluir testes e categorias de blog. `robots.txt` apontando o sitemap-index e com `disallow: ["/api"]`.
- **Canonical, title ≤60, meta 150-160, H1 único**: ver Bloco 4 da finalização (Fase 9).
- **Envio e conferência do sitemap são por API**, não pelo painel: `python scripts/gsc.py enviar <propriedade> <url do sitemap>` e depois `sitemaps` para confirmar que o Google **baixou** o arquivo. `último download: nunca` é pendência, não detalhe. Ver `references/gsc-api.md`, inclusive o que a conta de serviço **não** faz (criar e verificar propriedade continua manual).
- **Mapa é Google, sem chave, atrás de porta de consentimento.** O embed do Google Maps funciona **sem API key** por duas vias: link (`https://www.google.com/maps/search/?api=1&query=<endereco+urlencoded>`) e iframe (`https://maps.google.com/maps?q=<endereco>&output=embed`). Não use provedor alternativo só para evitar chave: o usuário brasileiro espera Google, e mapa que ele não reconhece reduz confiança na ficha.

  O iframe **não carrega sozinho**: ele entra atrás de uma **porta de consentimento**, porque é terceiro que grava cookie e a LGPD se aplica. O padrão: mostra um bloco estático (endereço + botão "Ver no mapa") com altura reservada; ao clicar, troca pelo iframe. Isso resolve três coisas de uma vez: consentimento, CLS zero (a altura já estava reservada) e nada de terceiro carregando em página que ninguém vai usar o mapa.

- **Tabelas responsivas** (viram card < 640px) e **botão copiar frase** em artigos de listas de frases/mensagens: ver `references/seo-e-render.md` (inclui o gotcha do sanitize).

---

## Fase 7 — UGC e interação (report, correções, avaliações)

**Botão "Informar erro" na ficha (obrigatório em diretório).** Visível, com cor destacada (chip âmbar), dentro do bloco de contato, nunca no rodapé em cinza. Texto pergunta + ação citando a entidade. HTML de referência (rede QMIX):

```html
<button type="button" class="group flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:border-amber-400 hover:bg-amber-100">
  <svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.9">
    <path d="M10 7v4M10 14h.01" stroke-linecap="round"></path>
    <path d="M10 2.5 1.8 16.5a1 1 0 00.9 1.5h14.6a1 1 0 00.9-1.5L10 2.5z" stroke-linejoin="round"></path>
  </svg>Este lugar não existe? Informar erro
</button>
```

- Abre **modal acessível** (fecha com ESC, foco entra ao abrir e volta ao fechar, Tab preso), com tipo do problema (não existe / fechou / dados errados / duplicado), campo livre e contato opcional. Nunca `mailto:` puro.
- O report grava em `clinic_corrections` (status pending) **e** notifica o Anderson (e-mail e/ou Telegram), sempre junto com a URL da ficha. Report que se perde é botão sem função. Testar ponta a ponta.
- **Avaliações (reviews) moderadas** (IA + humano via Telegram) quando o nicho pedir prova social.

**E-mail: SMTP do Gmail, e a rede não usa mais Resend.** Todo envio sai por
`smtp.gmail.com` autenticado com **senha de app** e chega em
**qmixdigital@gmail.com**, que também é o endereço publicado no site. Isso resolve
os dois defeitos do arranjo anterior: não há domínio para verificar (domínio novo
nunca está verificado no dia 1, e o Resend devolvia 403 com o form respondendo
200) e não há chave para vencer (a do Resend venceu e matou o e-mail de quatro
portais em silêncio). **O pedido grava no banco primeiro; o e-mail é só o aviso.**
Detalhes e as cinco armadilhas em `references/ugc-e-interacao.md`.

Detalhes (schema corrections, API, notify, webhook Telegram, componente do modal): **`references/ugc-e-interacao.md`**.

**Reports viram limpeza:** cada report procedente de "não existe / não é do nicho" deve ser tratado como na Fase 3/4 (remover + blocklist), e alimenta os padrões de falso positivo. Pessoa física pedindo remoção é LGPD, atender sempre.

---

## Monetização direta: venda de banner no diretório

Além do AdSense, vender **espaço de banner direto** ao anunciante (rende mais no nível local). Slots nas páginas de **listagem** (cidade, estado, categoria, serviço): quando vendido, mostra o banner do anunciante; quando vazio, mostra "Seu banner aqui" com CTA para o WhatsApp comprar o espaço (o próprio anunciante se apresenta = prospecção).

Regras que não podem faltar (detalhe e código em **`references/monetizacao-banner.md`**):
- **Link pago com `rel="sponsored nofollow"`** (link pago sem marcação é esquema de link, risco de ação manual no Google).
- Rótulo **"Publicidade"** no vendido, **"Anuncie aqui"** no vazio (transparência + não confundir com conteúdo/AdSense).
- **Placeholder CHAMATIVO, na paleta do site** (não discreto). O espaço vazio é o que vende o espaço: fundo sólido/gradiente com as cores da marca, título em negrito, ícone e botão de CTA contrastante. Nunca tracejado apagado/cinza. (O banner vendido é a arte do anunciante, sóbria.)
- **Altura fixa reservada** no slot (CLS 0), imagem `loading="lazy"` com width/height.
- Placeholder → **WhatsApp com contexto** (cidade/categoria no texto).
- **Tabela própria** (`ad_banners`), fora da base ingerida (o merge não apaga). Escopo específico vence o geral.
- Densidade baixa (1-2 por listagem), não colar ao AdSense. Nunca em ficha thin, 404 ou admin. Começar manual (Anderson cadastra e cobra por fora); autoatendimento é evolução futura.

## Fase 8 — Conteúdo editorial e blog (autoridade + AdSense)

- **Blog com clusters temáticos:** pilar + satélites, interligados com âncora-keyword variada (regras de linkagem cruzada do CLAUDE.md). Conteúdo 100% original, sem travessão, pt-BR correto.
- **Workflow de publicação:** conteúdo HTML em `blog_posts` (dollar-quote ou insert parametrizado por arquivo transferido em base64; nunca escapar string gigante). Capa WebP na pasta pública de uploads servida pelo Nginx. Rebuild para o post entrar no sitemap. IndexNow após publicar.
- **FAQ em todo artigo de serviço** (vira FAQPage automático, Fase 6).
- **Loop de otimização via GSC** (Fase 10): transformar keywords reais em novos H2/H3 ou artigos.

---

## Fase 9 — Finalização (checklist de entrega)

Esta é a antiga skill `finalizacao-projeto`, agora como fase final. Executar todos os blocos aplicáveis ao cenário (A/B/C) e ao fato de ser diretório. O **detalhe integral de cada item** (verbatim da skill antiga) está em **`references/finalizacao-checklist.md`** — usar como o checklist de entrega. Resumo dos blocos:

- **Bloco 0 — Provar o INSTRUMENTO antes de medir o site** (bloco integral em `finalizacao-projeto`): auditor só entra depois de ter sido visto REPROVANDO; três estados, nunca dois (passou, falhou, **não encontrei o alvo**); **dois números que medem a mesma coisa por caminhos diferentes têm de fechar, e divergência é bloqueio, não observação**; todo script que GRAVA exige nome de saída **sem default**, senão a linha-base anterior é sobrescrita em silêncio e a comparação antes/depois morre junto; lista fechada de termos revisada item a item ANTES de rodar (uma palavra errada numa lista de 60 respondeu por 12 dos 14 "achados").
- **Bloco 1 — Páginas para AdSense:** Sobre, Contato (form testado), Privacidade (cita AdSense/cookies/LGPD/origem dos dados), Termos, 404 real, banner de consentimento, links legais no rodapé. **Não** criar ads.txt nem pedir o código; deixar pronto (robots não bloqueia AdSense; Consent Mode v2 default denied antes das tags; slots reservados sem código; anúncio desligado em 404/admin).
- **Bloco 2 — Sitemap e indexação:** 200, XML válido, index segmentado (10 mil URLs por arquivo, não 50 mil), **tempo medido com a máquina ocupada**, amostra de URLs 200, canônicas, robots referenciando o sitemap. Envio e conferência por API (`scripts/gsc.py`).
- **Bloco 2b — Produto pago e paywall:** cada item com preço percorrido ponta a ponta com pedido real, incluindo quem **avisa o comprador**; limite de visualizações testado com User-Agent do Googlebot.
- **Bloco 3 — Crosslinking:** sem órfãs, breadcrumbs, links contextuais, paginação com `<a href>`, **rastrear links quebrados e corrigir na origem** (não com redirect), repetir até zerar.
- **Bloco 4 — SEO on-page:** title/description/H1 únicos, canonical, thin content, sem travessão, URLs limpas.
- **Bloco 5 — Dados estruturados e social:** schema por tipo (Fase 6), validar no Rich Results, OG/Twitter com og:image acessível.
- **Bloco 6 — Técnico:** HTTPS forçado, www/non-www único 301, headers corretos, Core Web Vitals (medir home + listagem cheia + ficha), next/image dimensionado, índices no Postgres, PM2 salvo, favicon/manifest, analytics disparando.
- **Bloco 7 — Conteúdo importado (cenário B):** imagens quebradas/hotlink, re-hospedar, 301 de URLs antigas, encoding, datas preservadas.
- **Bloco 8 — Domínio expirado (cenário C):** levantar URLs/backlinks legados (Wayback CDX, Ahrefs), 301 para equivalente / 410 para lixo (nunca tudo para a home), higiene (Safe Browsing, ações manuais, SPF/DMARC).
- **Bloco 9 — Qualidade dos dados (diretório):** dupla conferência (script + amostra manual de 30 fichas em cidades diferentes); duplicatas com canônica eleita; **botão de informar erro** (Fase 7); reimportação sem perder curadoria (Fase 4); LGPD (canal de remoção do titular, metodologia dos dados, ficha removida devolve **410/404** e sai do sitemap). Se a amostra manual reprovar >10%, **parar a entrega** (defeito na extração).
- **Bloco 10 — Backlinks do domínio:** planilha do Anderson, agrupar por destino, criar página / 301 / 410. Nenhuma URL com backlink em 404.
- **Bloco 11 — Acompanhamento 7 e 30 dias:** comparar enviadas x indexadas no GSC, soft 404, "descoberta não indexada" (sinal de thin content), datas agendadas no relatório.

---

## Fase 10 — Pós-lançamento contínuo

- **GSC como motor:** `python scripts/gsc.py consultas <propriedade> <inicio> <fim> query` traz as keywords reais e `... page` diz qual página ranqueia para cada uma. Cruzar as duas é o que separa "criar artigo novo" de "melhorar o que já existe". Um bot semanal puxa keywords novas do Search Console e envia oportunidades. Fluxo: verificar posição e **qual página** ranqueia (API `searchAnalytics` dims query+page) → cruzar com o conteúdo publicado → decidir **criar** (lacuna real) ou **otimizar** (artigo existente fino em striking distance pos 8-15, expandir; ou já cobre e é só autoridade, não mexer). Buscas por nome de estabelecimento são navegacionais, não viram artigo, mas revelam falsos positivos a remover.
- **Curadoria contínua a partir dos reports** (Fase 7 → Fase 4): cada report vira remoção+blocklist ou correção, e realimenta os filtros da Fase 3.
- **Autoridade sobe com foco:** remover ruído (off-topic) concentra autoridade nas fichas reais; páginas boas presas na pos 8-10 sobem com linkagem interna + tempo, não com mais texto.

---

## Relatório de saída

Manter o formato da finalização (ver `references/relatorio.md` se destacado; senão, o modelo abaixo), acrescentando os números de curadoria durável:

- Classificação (A/B/C) + evidência.
- Aprovados / Pendências (BLOQUEANTE reservado a: páginas essenciais ausentes, sitemap quebrado, robots bloqueando, noindex em produção, soft 404 em massa).
- **Pendência sai em DUAS listas separadas, nunca numa só** (Bloco 18 da `finalizacao-projeto`): "Falta fazer (agente)" com o que destrava cada linha, e "Falta decidir ou fornecer (dono)" com o que destrava **e desde quando**. É do dono só o que exige decisão de negócio, insumo que só ele tem, reversão de decisão deliberada, ou alcance maior que o projeto; todo o resto é trabalho do agente e não vira pendência.
- Diretório: registros na base, reprovados na passada automática, duplicatas, amostra manual (% reprovado), botão de report testado, metodologia publicada, LGPD, **ciclo de reimportação testado (remove/reimporta não volta; enriquece/reimporta permanece)**.
- Ingestão: fonte, versão/data do dataset, quantos filtrados por tema (por camada), blocklist e overrides ativos.
- Links internos, backlinks, importado (B), redirects (C).
- Acompanhamento 7 e 30 dias com datas.
- Observação fixa: ads.txt e código AdSense **não** inseridos; site preparado.

Sem travessão no relatório. Marca sempre "QMIX Digital".
