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

**NÃO verificar ads.txt.** O Anderson insere o ads.txt manualmente depois da aprovação. Não criar, não cobrar, não listar como pendência. Apenas confirmar que a raiz do site serve arquivos estáticos corretamente (para que ele funcione quando for inserido).

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

## Observação fixa
ads.txt NÃO foi criado — será inserido manualmente pelo Anderson após aprovação.
```

Regras do relatório:

- Nunca marcar um item como aprovado sem ter executado a verificação.
- Gravidade BLOQUEANTE é reservada para: páginas essenciais ausentes, sitemap quebrado, robots bloqueando o site, noindex acidental em produção, soft 404 em massa.
- Sem em dashes no relatório. Marca sempre escrita como "QMIX Digital".
