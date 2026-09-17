---
name: fluxo-redatora-drive
description: "Como processar os textos da redatora (Google Drive) para atualizar artigos do drhenriquebufaical.com.br; quem faz links, imagem e o que entregar no fim"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 02220ae3-0b5b-43c7-9e50-8eb8b54528d1
  modified: 2026-09-11T13:04:23.842Z
---

A redatora do Dr. Henrique Bufaiçal entrega textos numa pasta do Google Drive
(`<<REMOVIDO>>`), lida pela service account `seoqmix` via
`scripts/drive-redatora.py`. Conversão para o post: `scripts/redatora-para-post.py`.

**Formato de cada doc (definido por Anderson em 11/09/2026):**
1. H1 = título.
2. A linha logo abaixo é a **linha fina** (vai para `subtitle`, entre H1 e data; não entra no corpo).
3. Corpo do artigo.
4. Observação sobre a imagem = **fim do artigo**, onde estiver; tudo depois dela é
   descartado (ela já colou pauta de outro cliente após a observação). **Nunca vai
   para o site.** Quando pede troca, ela aponta a foto exata do Pexels/Pixabay na
   própria observação; buscar pela API (id no fim da URL) e mostrar ao Anderson.
   🔴 **A observação pode vir SEM o prefixo "Observação:"**, só "trocar a imagem por
   https://...", e com a URL como hiperlink. Em 12/09/2026 três docs assim passaram
   e a instrução foi publicada no site, com link clicável. Detectar pelo CONTEÚDO
   (trocar/manter + imagem, ou URL de pexels/pixabay/unsplash), nunca pelo prefixo.
   Depois de publicar, **varrer a produção inteira** por esses termos antes de
   considerar concluído; o `redatora-para-post.py` bloqueia se algo chegar ao corpo.

**Divisão de trabalho, combinada de propósito:**
- A redatora **não coloca links**. Links internos (âncora variada, um por destino) e
  **links externos de referência** (diretrizes, estudos) são obrigação minha ao aplicar.
- Se a observação final disser que a **imagem precisa ser trocada**, avisar Anderson em
  destaque. A imagem vem de **banco de imagens por API** (Pixabay/Pexels, chaves em
  `C:/Users/User/Documents/APIs/`), **nunca de IA**.
- Ao finalizar, entregar **a URL clicável** do artigo para ele conferir.

**Why:** ele quer velocidade sem perder controle editorial: a redatora escreve, eu
faço a camada de SEO (links, referências, data, deploy, IndexNow) e ele confere o
resultado pelo link. A imagem é decisão dele porque envolve escolha visual e licença.

**Posts antigos sem link de entrada no corpo (33 em 14/09/2026):** decisão do Anderson
em 14/09/2026: **não fazer rodada de links para eles agora**. A redatora vai reescrever
todos; a linkagem interna entra quando cada texto novo chegar, junto com a aplicação.
A auditoria de links (`malha4.py`/`rel4.py`, corpo do artigo no HTML servido) fica só
para os artigos do lote em curso.

**How to apply:** `python scripts/drive-redatora.py baixar` → `python
scripts/redatora-para-post.py <html> <slug>` (simula; `--aplicar` grava; exit 3 = trocar
imagem) → inserir links internos e externos no corpo → build, deploy, IndexNow → mandar o
link. Ver também [[titulo-caixa-normal-sem-travessao]].
