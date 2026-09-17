---
name: feedback_imagem_ia_generica
description: "Gerador de imagem da Runware erra anatomia: nada de pessoa em pose específica, mão ou dedo em destaque. Pedir cena genérica (objeto, ambiente, close sem mãos) e SEMPRE abrir a imagem para conferir antes de publicar."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-25T10:13:36.490Z
---

O modelo de imagem da Runware (`runware:100@1`) **erra anatomia com frequência**. Em
24/08/2026 o operador reprovou duas imagens seguidas do mesmo artigo: uma tinha
**três mãos**, outra tinha braço a mais, e uma terceira candidata trouxe **texto
inventado na parede** ("DISTAL HANE"). Palavras dele: *"essa ferramenta de imagens é
bem fraquinha, tem que memorizar para que ela faça as imagens o mais genérico possível"*.

**Regra: peça a cena mais genérica que ainda ilustre o assunto.**

Ordem de preferência do prompt, do mais seguro para o mais arriscado:

1. **Objeto sozinho** — joelheira, gesso, órtese, bengala, frasco, equipamento. Fundo
   neutro. É o que sai limpo quase sempre.
2. **Ambiente sem pessoa** — cadeira junto à mesa, escada, quarto, consultório vazio.
   Genérico e sem risco de anatomia.
3. **Close de parte do corpo vestida, sem mão no quadro** — joelho de calça jeans,
   pé com tênis. Ainda arriscado.
4. **Pessoa em pose específica** ("segurando o joelho", "levantando da cadeira com dor",
   "sacudindo a mão dormente") — **evitar**. É onde nascem o braço extra e o dedo a mais.

Acrescentar sempre ao prompt: `no text, no watermark, no hands, hands out of frame,
no fingers, natural anatomy`.

**Conferir com os próprios olhos antes de publicar.** Gerar de 2 a 3 candidatas, abrir
cada uma com a ferramenta de leitura de imagem e escolher. Publicar sem olhar é como
essas passaram.

**Ao trocar imagem já publicada, mudar o NOME do arquivo** (`-v2`, `-v3`). Substituir o
arquivo mantendo o nome não adianta: o cabeçalho da rede manda o navegador guardar por
30 dias (`Cache-Control: public, max-age=2592000`), e quem já viu a página continua com
a versão velha mesmo depois de purge no Cloudflare. Ver [[reference_litespeed_purge_arquivo_unico]],
que é a mesma armadilha em outro contexto.

Vale junto com a regra de nunca inserir texto dentro de imagem gerada por IA (CLAUDE.md)
e com [[feedback_imagem_alt_igual_nome_arquivo]].

**Desde 09/09/2026 a IA deixou de ser a primeira opção.** O padrão passou a ser foto real do Wikimedia Commons, com crédito no fim do artigo: ver [[reference_imagens_wikimedia_commons]]. Gerar na Runware só quando o Commons não tiver nada utilizável para o tema, o que acontece bastante em cena de saúde com pessoas.
