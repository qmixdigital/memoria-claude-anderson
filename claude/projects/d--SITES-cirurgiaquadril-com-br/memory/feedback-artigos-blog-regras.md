---
name: feedback-artigos-blog-regras
description: "Como publicar os artigos da redatora no blog do cirurgiaquadril: não editar texto, sem Goiânia no título, fotos de banco, links internos e externos verificados"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fb846b32-49fb-4a5f-beff-ea387b445c50
  modified: 2026-10-13T23:37:09.822Z
---

Ao publicar artigos da redatora (pasta Drive, ver [[referencia-artigos-drive]]): NÃO alterar o texto, o H1 nem o lead dela. Só são aceitos ajustes mínimos: title tag ≤60 caracteres (encurtar), meta description 150 a 160 caracteres (ajuste mínimo da meta dela) e links/fotos por cima do texto existente.

**Why:** em 13/10/2026 publiquei os 6 primeiros artigos reescrevendo H1/title/meta com "Goiânia" e trocando "a melhor opção" por "a mais adequada"; o usuário reprovou ("não era pra alterar nada"). Artigo de blog não é página de serviço, então não leva Goiânia no título/H1.

**How to apply:**
- Rodar `_build/importar_artigos.py` (META tem slug, title, desc, links, imgs de cada artigo; texto vem do Doc exportado em HTML). O validador do build não exige Goiânia nem barra "melhor" em `site/blog/*` (só em páginas de serviço).
- Imagens: banco gratuito (Pixabay/Pexels, módulo `guest-post-rede/scripts/banco_img.py`, termo em inglês, sem crédito, olhar a foto antes). 2 fotos por artigo em `_build/img/blog/` (1200x800 e -600, OG jpg da primeira), alt em pt-BR. Wikimedia devolve 429 em downloads seguidos, preferir Pixabay/Pexels.
- Link para a HOME em todo artigo, sobre frase natural do texto ("especialista em quadril", "ortopedista especialista em quadril", "cirurgia de quadril"), destino `home` no META. Reprovado: rótulo/kicker artificial com link para a home antes do texto ("ficou forçado, o Google não passa autoridade"); a página /equipe não recebe mais essa âncora.
- Links: a ÂNCORA TEM QUE DESCREVER O DESTINO (palavra-chave da página de destino: "osteotomia periacetabular" → /osteotomia-do-quadril, "reembolso" → página de reembolso da ANS). Reprovado em 13/10/2026: "acetábulo" → artigo de fratura, "ortopedista" → home da SBOT, "polietileno" → AAOS, "cirurgias anteriores" → revisão. Primeiro link do corpo = página de serviço do tema; um link por destino; âncoras só sobre trechos que já existem no texto. Externos em português e específicos do assunto, testados com curl (200): textos para pacientes da SBQ (sbquadril.org.br/<slug>/), artigos SciELO em pt (`?lang=pt`), gov.br (ANS reembolso, SUS). Evitar homepages genéricas e páginas em inglês; Thieme não dá para verificar (bot wall). Cuidado: `/tmp` no Python do Windows é `D:\tmp`, não o /tmp do Git Bash.
- Depois de publicar: IndexNow + reenviar sitemap.
- Fluxo que funcionou no lote 2: exportar Docs em HTML, ler com grep as frases-âncora, escrever META (links como (destino, âncora, trecho) sobre texto existente), rodar `DRY=1 python importar_artigos.py` para listar trechos que faltam, escolher 2 fotos únicas por artigo numa folha de contato (ver a foto antes), `build.py` (validador exige âncora ≤2 por destino; "Veja também" usa rodízio de variantes), conferir 1º link e externos 200, deploy, IndexNow e sitemap.
