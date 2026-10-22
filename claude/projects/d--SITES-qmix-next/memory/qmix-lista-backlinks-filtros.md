---
name: qmix-lista-backlinks-filtros
description: Filtros da /lista-de-backlinks (área logada) recriados em 21/10/2026; a /comprar-backlinks pública não tem grade nem filtros de propósito
metadata:
  type: project
---

A grade pública de portais saiu da /comprar-backlinks (expunha nomes de parceiros no Google) e a lista vive em
/lista-de-backlinks, atrás do login. O componente antigo `MarketplaceFilters.tsx` (1.011 linhas) ficou órfão no código.

Em 21/10/2026, a pedido do Anderson, `ListaBacklinks.tsx` ganhou: região (Sul, Sudeste, Centro-Oeste, Nordeste, Norte,
Nacional, que restringe o select de praça), praça (UF), nicho, faixa de preço (até 100, 100-200, 200-500, 500-1.000, 1.000+),
DA mínimo (20/30/40/50/60/80), tráfego mínimo (1 mil a 1 milhão), ordenação por select (indicados e maior DA = padrão,
custo-benefício = DA por real, menor/maior preço, tráfego, DA, prazo) e chips "Em promoção", "QMIX Indica", "Publica em até
7 dias", com contador e "Limpar (n)". Tudo roda no cliente sobre a lista completa; CSS `.filtros-grid` em lista-cards.css.
Clicar numa coluna da tabela zera a ordenação do select para "maior DA" e vale só a coluna.

**Why:** cliente pediu "DA 30, tráfego 3 mil, Sul e Sudeste" e a lista só tinha busca, nicho e praça.
**How to apply:** o DR não existe no cadastro (16 de 425 portais), então não há filtro de DR; se ele pedir, primeiro
preencher `produtos.domain_rating`. Deploy pelo `./deploy.sh` ([[qmix-deploy-atomico]]); arquivos locais e da VPS estavam
idênticos antes da mudança (conferir md5 antes de sobrescrever).
