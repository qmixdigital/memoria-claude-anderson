---
name: qmix-pagina-conteudo-para-blog
description: "Página de serviço /comprar-conteudo-para-blog (16/10/2026): pacotes de artigos da redatora, preços, promessas feitas e premissas que o Anderson não ditou"
metadata:
  type: project
---

Criada em 16/10/2026 para gerar clientes para a redatora (6+ anos na QMIX). Arquivo
`src/app/(frontend)/comprar-conteudo-para-blog/page.tsx`, linkada no card "Produção de Conteúdo"
de `/servicos` e no sitemap. Mesmo desenho da página de sites (H1 curto, mock, passos, pacotes).

**Pacotes ditados pelo Anderson:** 10 artigos R$ 439; 20 artigos com 10% de desconto arredondado
para baixo = R$ 790 (R$ 39,50/un); 50 artigos "a R$ 40 cada" = R$ 2.000; 100 artigos R$ 2.987 (R$ 29,87/un; acima disso, valor combinado na proposta); o R$ 35 inicial foi substituído em 16/10.
**Preço do lote de 50 fixado pelo Anderson em 16/10/2026: R$ 37,50 cada = R$ 1.875** (o R$ 40 inicial ficaria mais caro por unidade que o lote de 20).

**Processo prometido na página (dito por ele):** pauta pelo Search Console do cliente + Semrush,
texto com IA humanizado e finalizado pela redatora, otimizado (title, meta, H2, keyword exata,
linkagem interna e externa), entrega em documento ou publicado no blog do cliente sem custo extra.
**Premissas que EU assumi e ele não ditou:** 1 rodada de ajustes por artigo; tamanho em geral de
1.000 a 1.500 palavras conforme a intenção; imagem de destaque de banco gratuito só quando
publicamos; sem backlinks externos (à parte); agências recebem texto sem marca; CTA "pautas de
teste": 5 pautas grátis com acesso de leitura ao GSC. Confirmar com ele se algum desses não vale.

**Why:** serviço da redatora não tinha página indexável nem preço público.
**How to apply:** preço só na constante `pacotes` (schema Service.offers lê dela). Ver também
[[qmix-pagina-sites-pequenas-empresas]].
