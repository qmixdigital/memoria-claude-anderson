---
name: qmix-ferramentas-lotes-2026-10
description: "22/10/2026 - 60+ ferramentas novas em ferramentas.qmix.com.br criadas em lotes; como o gerador funciona, armadilhas (Cloudflare Permissions-Policy, tabelas 2026, deploy_lote.sh)"
metadata:
  node_type: memory
  type: project
  originSessionId: 87bf0b54-5114-498b-8472-92aefb2139f1
  modified: 2026-10-22T18:58:08.072Z
---

Anderson aprovou ("siga com todos") criar as ferramentas da pesquisa em [[qmix-ferramentas-pesquisa-novas-2026-10]]. Feitas em 22/10/2026, em lotes com deploy atômico e teste real no navegador (Playwright).

**Como foi montado:** `D:\tmp\ferr\gen.py` gera `page.tsx` + `layout.tsx` a partir de specs (`batch1.py` a `batch6.py`) e registra em `tool-slugs.ts` e no índice (`page.tsx`, ícone Wrench). Widgets em `src/app/(tools)/ferramentas/_shared/`: `ui.tsx` (peças), `docs.tsx`, `texto.tsx`, `sorteio.tsx`, `testes.tsx`, `trabalhista.tsx` + `trab.ts` (tabelas), `geral.tsx`, `saude.tsx`, `calendario.tsx` (servidor), `documentos.tsx`. Páginas usam `PaginaTool`. `deploy_lote.sh slug...` envia e roda `deploy.sh`; `smoke.mjs slug...` abre, clica e lista erros de console. O gerador impõe title <= 53 caracteres (o template soma " | QMIX") e meta 140 a 160.

**Armadilhas:**
- O Cloudflare (ruleset http_response_headers_transform da zona qmix.com.br) força `Permissions-Policy: camera=(), microphone=()` em tudo. Criei regra extra só para /teste-de-webcam e /teste-de-microfone no ferramentas (camera=(self), microphone=(self)). Teste novo que use câmera, mic ou localização exige regra igual.
- `deploy_lote.sh` precisa copiar `_shared/*.ts*` (um `trab.ts` esquecido derrubou o build; o deploy atômico manteve o site no ar).
- Tabela do INSS: a calculadora de salário líquido e a de férias estavam com a de 2025; atualizadas para 2026 (faixas até 1.621,00 / 2.902,84 / 4.354,27 / 8.475,55; teto de contribuição 988,09). Seguro-desemprego 2026: 80% até 2.222,17; 1.777,74 + 50% do excedente até 3.703,99; teto 2.518,65; piso 1.621. Rever em janeiro de 2027 (`trab.ts`).
- Não feito de propósito: conversor de tamanho de calçado/roupa (fontes divergem: BR 40 = US 8 ou 9), leitor de QR code (sem biblioteca jsQR no projeto; BarcodeDetector não cobre Safari/Firefox), contrato de aluguel (documento jurídico longo).

**Reescrita GEO (22/10/2026, a pedido: "texto SEO extremamente fraco"):** `PaginaTool` ganhou `resposta` (bloco de resposta direta logo abaixo da ferramenta, 40 a 80 palavras, começa definindo a coisa), `passos` (lista numerada + schema HowTo), `fontes` (lei/norma/órgão com link + `citation` no schema) e `atualizado` ("Revisado em" visível + `dateModified`, autor Anderson Alves). `gen.py` exige 550+ palavras nos blocos, 6+ FAQ, 1+ fonte; blocos aceitam h3, lista, passos e tabela. Specs em `batch1..6.py` + complementos em `run1..run56.py` (rodar o `runN.py`, não o `batchN.py`). Páginas ficaram com 950 a 1.100 palavras visíveis (ferramenta + texto + FAQ), 5 a 7 H2, tabelas e fontes primárias (Planalto, gov.br, Unicode, MDN, OMS).

**Why:** o domínio ganha onde a SERP é de sites pequenos de ferramenta.
**How to apply:** re-medir no GSC em ~19/11/2026 (4 semanas); começar por gerador-de-rg/cnh/titulo, espaco-invisivel, sorteador, calculadoras trabalhistas. Páginas existentes com title/meta novos (cep, contador-de-dias, headlines, números aleatórios, rescisão, cronômetro, horas) entram na mesma medição.
