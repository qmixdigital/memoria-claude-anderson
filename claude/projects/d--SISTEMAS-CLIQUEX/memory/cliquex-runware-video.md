---
name: cliquex-runware-video
description: Como gerar vídeo (image-to-video) na API Runware e embutir com SEO de vídeo (VideoObject) na rede
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-08-28T08:03:08.203Z
---

Gerar **vídeo a partir de imagem** na Runware (mesma API/chave das imagens, `<<REMOVIDO>>`). Usado 1º em cadernoseletronicosdisf (2026-08-20): a imagem da Smart TV virou vídeo da TV trocando de telas/apps.

**Chamada (POST https://api.runware.ai/v1):**
```json
[{"taskType":"videoInference","taskUUID":"<uuid>","model":"lightricks:ltx@2.5-fast",
  "positivePrompt":"... , cinematic, no text",
  "frameImages":[{"inputImage":"<URL da imagem ou base64>","frame":"first"}],
  "duration":6,"width":1280,"height":720,"numberResults":1,"outputFormat":"MP4","includeCost":true}]
```
**Armadilhas (todas custaram erro 400):** (1) image-to-video usa **`frameImages`** (NÃO `referenceImages`) no formato `[{"inputImage":..,"frame":"first"}]`; (2) `duration` só aceita **6, 8, 10, 12, 14, 16, 18, 20 ou "auto"** (5 dá erro); (3) resolução só do conjunto permitido — landscape **1280x720** (720x1280 retrato). **É ASSÍNCRONO:** o POST retorna só `{taskType, taskUUID}`; fazer **polling** com `[{"taskType":"getResponse","taskUUID":"<mesmo>"}]` a cada ~15s até vir `videoURL` (LTX-fast 6s fica pronto em ~1min). **Custo:** ~$0.54 por vídeo de 6s. Baixar o `videoURL` (mp4).

**Embutir com SEO de vídeo (pro Google indexar como vídeo):** 3 sinais —
1. `<video autoplay muted loop playsinline preload="metadata" poster="/imagens/hero.webp" width="1280" height="720"><source src="/imagens/xxx.mp4" type="video/mp4"></video>` (autoplay+loop = efeito de "TV ligada"; poster mantém o LCP e é fallback).
2. **VideoObject JSON-LD** no `<head>`: name, description (com a keyword ex "teste IPTV"), thumbnailUrl, contentUrl (mp4), uploadDate, duration "PT6S", publisher. **`uploadDate` PRECISA ser datetime ISO 8601 COM FUSO** (ex `2026-08-27T10:00:00-03:00`), NÃO só a data — data-only (`2026-08-27`) dá aviso no GSC "uploadDate inválido / falta fuso" (não crítico, mas corrigir). Corrigido nos 4 money sites em 2026-08-27; os sites de embed do cadernos podem ter o mesmo (data-only) — corrigir se aparecer no GSC.
3. **Sitemap de vídeo**: no sitemap.xml add `xmlns:video` + `<video:video>` com thumbnail_loc/title/description/content_loc/duration.

Guardar o mp4 em `imagens/` do site (Pages serve como `video/mp4`). Ver [[cliquex-conta-bruna]].


**TÁTICA DE LINK BUILDING POR VÍDEO (2026-08-20):** hospedar 1 vídeo em UM site (cadernoseletronicosdisf) e **incorporar o MESMO vídeo (mesma URL do mp4) em vários outros sites da rede** → cada site que incorpora gera backlink pro host. Implementado nos 16 sites da Bruna apontando pro cadernos: cada um recebe uma `<section id="video-iptv">` antes do `<footer>` com (1) `<video autoplay muted loop><source src="{cadernos}/imagens/teste-iptv-smart-tv.mp4">` + poster do cadernos, (2) **link dofollow** `<a href="{cadernos}/" rel="noopener">{âncora única}</a>` (âncoras variadas com "teste IPTV"), (3) **VideoObject JSON-LD** com contentUrl/publisher = cadernos. Efeito: cadernos = host autoritativo do vídeo + 16 backlinks temáticos de vídeo (embed+link+schema). Reusável: 1 vídeo, N embeds = N backlinks pro dono. Token deploy cfut_DxKj.

**ROLLOUT COMPLETO (2026-08-20): 26 backlinks de vídeo pro cadernoseletronicosdisf.** Vídeo hospedado no cadernos, incorporado (embed + link dofollow âncora única + VideoObject apontando pro cadernos) em TODOS os sites recentes que fiz no Pages: 16 Bruna + 8 estáticos (agroshopacamargo, compdistribuidora, consultoriaflorapura, conviteriadaline, replicasderelogiostop, jcrgs, cabecadagua, ciadetalentosproducoes — contas b7618ea1/c86b1054/596a5e4f/23077979) + 2 Endrick (estudiounidesign, ticketson — conta 011fa32b, master token cfut_reEz ACESSA a Endrick via GET/deploy direto mesmo não listando ela em /accounts). Motor `scratchpad/video_embed2.py` (re-fetch pasta completa + insere bloco antes do <footer> + VideoObject). **Pulei leilopora (silo/flagship — re-fetch derrubaria as 94 subpáginas) e cordeiropolisemfoco (zona removida).** **TRUQUE p/ sites em pulso de redirect (funil→cliquex.click):** re-fetchar de `<slug>.pages.dev` (o redirect é regra de ZONA no domínio custom; o pages.dev serve o conteúdo real direto). WordPress: usuário pediu pra NÃO fazer (piloto revertido). Usuário NÃO quer vídeo nos portais WP, só nos sites recentes do Pages.

**EXPANDIDO PARA 46 BACKLINKS (2026-08-20):** +20 landing pages da conta ENDRICK (011fa32b): cieh, jornalcidademg, faesfpi, anufoodbrazil, educacaoniteroi, festivalfeirapreta, tendenciaconcursos, revistabforest, aesupar, serpes, radioitaboraisantos, federapars, endipe2024, expoind2025, fcpge, fnem, cienciadotreinamento, elfolivre, falaseriocanaa, inteligenciacompetitivarev. Motor `scratchpad/video_embed_pagesdev.py` (busca do `<slug>.pages.dev`). O master token cfut_reEz ACESSA cada projeto Endrick por NOME (GET/deploy) mas NÃO lista (`/pages/projects` dá 400 e Endrick não sai em /accounts) — usar a lista de domínios do dash. **cieh tinha hero-teste-iptv.webp em 0 BYTES (quebrado)** → gerei imagem nova Runware + redeploy completo. **PULADOS: hotec, jornaldejales, meupratosaudavel, pinaunaeditora (76-88 assets, sites de conteúdo pesados — mirror HTTP incompleto quebraria; NÃO deployados).** LIÇÃO do motor de mirror: conferir que assets baixados não estão VAZIOS (0 bytes) antes do deploy, senão o site fica com imagem quebrada.

**GOTCHA (2026-09-02) — `insufficientCredits` no videoInference:** o saldo da Runware acabou e o `videoInference` (LTX, ~US$ 0,54 por vídeo) passou a responder **HTTP 400 `insufficientCredits`**, enquanto o `imageInference` barato ainda passava. Pior: o erro sai no POST, mas o `getResponse` do mesmo taskUUID continua devolvendo `status: processing` para sempre, então quem só olha o polling fica horas achando que está renderizando. **Sempre logar a resposta do POST.** Top-up em https://my.runware.ai/wallet.

**Fallback que resolve sem crédito:** animar o próprio poster com ffmpeg (já instalado na máquina, Gyan build). Zoom lento + deriva horizontal, 6s, 1280x720, ~380KB, e o arquivo é MP4 de verdade, então VideoObject e video sitemap continuam válidos:

```
ffmpeg -y -loop 1 -i hero-tv.webp -vf "scale=2560:-2:flags=lanczos,zoompan=z='min(zoom+0.00045,1.12)':d=150:x='iw/2-(iw/zoom/2)+sin(on/60)*40':y='ih/2-(ih/zoom/2)':s=1280x720:fps=25,format=yuv420p" -t 6 -c:v libx264 -preset slow -crf 25 -movflags +faststart -an hero-tv.mp4
```
