---
name: conteudo-publicado-2026-09-11
description: Lote de 28 matérias publicadas em 11/09/2026 (3 perdidas recriadas, 16 pilares reescritos, 9 novas) com datas de 2025 nas novas para não entrar na home; fluxo de produção com agentes + validador
metadata:
  type: project
---

Em 11/09/2026 foram publicadas 28 matérias pelo importador Markdown (ver [[importar-materia-markdown]]), a pedido do Anderson, sem aparecer na home: **as novas receberam `data:` entre fev e out/2025** (a home ordena por publishedAt); as reescritas mantiveram a data original e mostram "Atualizado em".

- 3 recriadas com o slug antigo: depoimentos prótese no joelho, cirurgia de quadril, coluna cervical.
- 16 reescritas (`--atualizar --reenviar-imagem`): barriga na gravidez, tendão do ombro, rybelsus x ozempic, intestino irritável, câmara hiperbárica, haloterapia, biorressonância, ginástica de condicionamento, dois planos de saúde, anticoncepcional e queda de cabelo, nutricionista unimed goiânia, ortognática unimed, reflexo de gag, pessário, bariátrica sleeve, acupuntura unimed/ipasgo.
- 9 novas: rybelsus em quanto tempo, tendão do ombro volta ao normal, nutricionista pela unimed, reembolso em dois planos, crise de intestino irritável, ortopedista/dermatologista/nutrólogo unimed goiânia, nutricionista ipasgo goiânia.
- Páginas /especialidade/{ortopedia,acupuntura,nutricao,dermatologia,nutrologia} ganharam texto, FAQ e schema (`src/lib/especialidadeConteudo.ts`).
- `materia/[slug]` gera FAQPage JSON-LD sozinho a partir do H2 "Perguntas frequentes" + H3.

**Como foi produzido (repetir para próximos lotes):** briefings em JSON (keyword, buscas reais do GSC, links de especialidade e fichas, termo de imagem em inglês, texto antigo) + `plano/REGRAS.md` + agentes redatores em paralelo + `validar_md.py` (validador da skill materias-jornalisticas-linkbuilding com `--kw`, mais `subir-md.py --validar`). Imagens do banco gratuito (`banco_img.py pegar`). Sem profissional como autor (campo vazio); fichas linkadas no corpo. Armadilhas: o validador da skill não confere o tamanho da meta_description (o importador confere: 140-160); agentes estouram o limite de sessão da API e param no meio, então validar tudo de novo antes de publicar.

**Why:** a migração de abril zerou esses pilares ([[gsc-migracao-abril-2026]]); reconstruir com estrutura era o passo 1 do plano.

**How to apply:** acompanhar no Search Console a partir de out/2026 as impressões de "depoimentos... prótese no joelho", "tendão do ombro rompido", "rybelsus emagrece", "nutricionista unimed goiânia". Próximo passo pendente: vincular profissionais e relacionadas reais ([[pendencias-seo-2026-09]]).

**Segundo lote, mesmo dia (COE):** 20 matérias a partir do Search Console da COE (ver [[gsc-coe-acesso]]): 17 novas com data de 2025 (dor no pescoço lado direito, dor no braço esquerdo, dor na costela esquerda, dor na lombar lado esquerdo, dor no calcanhar, exercícios para fortalecer o joelho, esporão no pé, dor nas costas ao respirar, água no joelho, dormência no braço esquerdo, RPG fisioterapia, formigamento nos pés, câncer nos ossos, tenossinovite, pata de ganso, câimbra na perna, tendinite no ombro) e 3 reescritas (condropatia-patelar, artrose-no-quadril com keyword coxartrose, osteonecrose do quadril). Cada uma linka a ficha do médico da COE da subárea (Aurélio/Daniel Labres coluna, Leonardo Moraes/Thiago Caixeta ombro, Bufaiçal mão, Bruno Air pé, Hugo Ximenes/Tiago Bernardes quadril, Ulbiramar joelho, Leonardo Jorge geral, Carlos Thomé acupuntura). Regra de unicidade de âncora (máx. 2 usos por texto) auditada nas 48 e corrigida. Evitados os termos em que a COE está no top 3 para não concorrer com o cliente. Duas páginas reescritas ficaram em cache do ISR após o `--atualizar`: resolvido com `POST /api/revalidate` (header `x-revalidate-secret`).

**Assinatura (11/09, fim do dia):** os 24 artigos de ortopedia dos dois lotes têm `profissional_id` do médico da COE por subárea (Aurélio coluna 6, Ulbiramar joelho 6, Thiago Caixeta ombro 4, Bruno Air pé 3, Tiago Bernardes quadril 3, Bufaiçal mão 2), definido por SQL + `POST /api/revalidate`. As demais 24 seguem sem autor. Auditoria final: 48/48 dentro do padrão (title, meta, H1 com keyword, 6 a 9 H2, Article+FAQPage+Breadcrumb, alt, canonical, OG). Mais 3 duplicatas consolidadas (intestino irritável, dormência gestantes, alongamento ósseo): cópia em rascunho + 301 no middleware. 73 mídias órfãs no banco (imagens antigas substituídas pelo `--reenviar-imagem`), sem efeito público; limpar quando conveniente. 28 das 48 não recebem link de nenhuma outra matéria nova: é a pendência das relacionadas reais.

**Linkagem e estrutura do acervo (11/09, noite):**
- `materia/[slug]` "Mais Matérias" agora pontua relacionadas (autor 5, tag 3, palavra do título 2, categoria 1, cidade 1) sobre até 60 candidatas; completa com recentes da cidade.
- 556 matérias antigas ganharam H2 (agentes sonnet propuseram títulos a partir de `h2/loteN.json`, `validar_h2.py`, aplicação por `aplicar-h2.mjs` com backup em `materias_bak_h2_20260911`). Restam 38 notas curtas (<4 parágrafos) sem H2.
- Links internos em texto âncora inseridos como frase-ponte no fim de um parágrafo do meio (backup `materias_bak_links_20260911`): as 48 novas recebem 2 ou 3 links de outras matérias; 401 + 224 links em matérias antigas com afinidade real (2 termos de título, tag, mesmo autor ou tokens raros bidirecionais). Pareamentos por um único termo genérico foram removidos (832) por darem links sem sentido. Regra de âncora ≤2 usos mantida.
- Mídias órfãs apagadas (23 linhas, 80 arquivos; lista em /root/media-orfas-20260911.json).
- Lição: matching por token de título gera pareamento absurdo ("quantos jalecos" x "quantos meses a barriga"); exigir afinidade forte antes de inserir link.
