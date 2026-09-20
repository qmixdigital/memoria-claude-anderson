---
name: seo-aeo-best-practices
description: SEO and AEO best practices for metadata, Open Graph, sitemaps, robots.txt, hreflang, JSON-LD structured data, EEAT, and content optimized for search engines and AI answer surfaces. Use this skill when implementing page SEO, technical SEO, schema markup, international SEO, AI-overview readiness, or improving content for Google, ChatGPT, Perplexity, and similar assistants.
---

# SEO & AEO Best Practices

Principles for optimizing content for both traditional search engines (SEO) and AI-powered answer engines (AEO). Includes Google's EEAT guidelines and structured data implementation.

## When to Apply

Reference these guidelines when:
- Implementing metadata and Open Graph tags
- Creating sitemaps and robots.txt
- Adding JSON-LD structured data
- Optimizing content for featured snippets
- Preparing content for AI assistants (ChatGPT, Perplexity, etc.)
- Evaluating content quality using EEAT principles

## Core Concepts

### SEO (Search Engine Optimization)
Optimizing content to rank well in traditional search results (Google, Bing).

### AEO (Answer Engine Optimization)
Optimizing content to be selected as authoritative answers by AI systems.

### EEAT (Experience, Expertise, Authoritativeness, Trustworthiness)
Google's framework for evaluating content quality.

## References

Start with the one reference that matches the task, such as technical SEO, structured data, EEAT, or AI-answer readiness. See `references/` for detailed guidance:
- `references/eeat-principles.md` — EEAT implementation and author schema
- `references/structured-data.md` — JSON-LD patterns (Article, FAQ, Breadcrumb, Product)
- `references/technical-seo.md` — Technical SEO checklist (metadata, sitemaps, hreflang, robots.txt)
- `references/aeo-considerations.md` — AI/AEO considerations (AI Overviews, crawler management)

## Adaptação QMIX (17/09/2026)

Origem: github.com/sanity-io/agent-toolkit (skills.sh). Vale sobretudo pelas referências de
AEO (AI Overviews, ChatGPT, Perplexity) e E-E-A-T, que complementam a skill seo-optimizer e
o produto de GEO da QMIX (qmix.com.br/geo). Onde conflitar com o CLAUDE.md global (title de
60 caracteres, meta 150 a 160, schema por nicho, sem travessão), vale o CLAUDE.md.

## Regra do link mais forte (Anderson, 18/09/2026)

**O primeiro link do conteúdo é o link mais importante da página.** O Google trata o
primeiro link para cada destino como o que conta, e a ordem dos links no corpo é um
sinal de prioridade. Não precisa estar no primeiro parágrafo; precisa ser o **primeiro
`<a>` do corpo do texto**, antes de qualquer outro link interno ou externo. Vale para
artigo de blog, página institucional, matéria em portal parceiro e guest post.

**Antes de escrever qualquer conteúdo com esta skill, perguntar, em uma linha:**

> Qual é o link mais importante desta página, o que deve vir em primeiro?

O Anderson responde de um destes três jeitos, e cada um se resolve assim:

| resposta | o que fazer |
|---|---|
| uma URL | usar essa URL como primeiro link, com âncora de keyword da página de destino |
| um texto ("a página de comprar backlinks", "o produto X") | resolver para a URL correspondente e confirmar na entrega |
| "você escolhe" | escolher a página de dinheiro mais próxima do tema (no site da QMIX, quase sempre `/comprar-backlinks`; em matéria de cliente, a URL do cliente) e dizer qual foi na entrega |

Não perguntar de novo quando o briefing já diz qual é o link (ex.: matéria de cliente com
URL e âncora no pedido: o link do cliente é o primeiro, ver memória `qmix-regra-primeiro-link`).

**Ao entregar, listar os links na ordem em que aparecem**, com o primeiro marcado. Se o
validador ou a distância mínima entre links obrigar a mover algum, o que se move é o
secundário; o mais forte não sai da primeira posição.

Continuam valendo as regras de sempre: um link por destino por página, âncora com a
keyword do destino e variação entre páginas, nada de "clique aqui".
