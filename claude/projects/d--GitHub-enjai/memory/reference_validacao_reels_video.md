---
name: reference_validacao_reels_video
description: Causa raiz dos tickets de Reels no enjai — link /p/ (foto/carrossel) em produto de vídeo falha 52% no painel SMM; validação via post_info
metadata: 
  node_type: memory
  type: reference
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
---

**Problema (auditoria no banco enjai, 2026-06-16):** clientes colando link errado em produtos de visualização de Reels/vídeo, gerando tickets que não respondem.

**Causa raiz REAL (não era "perfil vs post"):** o cliente cola link **`/p/`** — que no Instagram costuma ser **foto ou carrossel** (media_type 1 ou 8) — num produto de **visualização de vídeo/Reels**. O painel SMM rejeita porque não há vídeo → status ERRO/CANCELADO.

**Números (produtos de vídeo/Reels IG):**
- link `/p/`: **52,5%** de falha (53 de 101)
- link `/reel/`: **7,3%** de falha (44 de 601)
- `/p/` falha ~7x mais que `/reel/`.

**Importante:** NÃO dá para forçar `/reel/` em tudo — o produto "Visualizações e impressões de fotos" usa `/p/` corretamente. A regra é por produto.

**Solução implementada** em `lib/validar-link.ts` (escolha do usuário: checagem via API):
- `produtoRequerVideo(nome)`: produto exige vídeo se nome tem (visualiz|view|salv|save) E (reel|vídeo|video|igtv), e NÃO tem (foto|stor).
- `/reel/` e `/tv/` → passam direto (vídeo por natureza, sem API).
- `/p/` em produto de vídeo → `GET <<REMOVIDO>> /v1/post_info?code_or_id_or_url=<code>`:
  - `is_video=true` ou `media_type==2` ou product_type clips/igtv/feed_video → **vídeo, aceita**
  - `media_type==1` → **imagem, bloqueia**
  - `media_type==8` → **carrossel, bloqueia**
  - API falhou/sem chave → **não bloqueia** (robusto: não barra por falha nossa)
- Bônus: corrigido regex em `checkout/route.ts` que rejeitava `/reels/` plural por engano.

**UI ciente do tipo de conteúdo (2026-06-17, nos 3 sites):** em `app/(loja)/produtos/[slug]/QuantidadeCalculadora.tsx` os rótulos do checkout (botão "+ Adicionar outro X", "Links dos X", "Por X", "Voltar aos X", resumo, placeholder) usam um derivado `unidade` ciente do conteúdo, por plataforma:
- Instagram com reel/vídeo/igtv/short no nome → **"reels/vídeo"** (placeholder `/reel/`)
- Plataformas sempre-vídeo (tiktok, youtube, kwai, snackvideo, kuaishou, twitch, kick) OU nome indica vídeo (ex: Facebook Reels) → **"vídeo"**
- Nome contém "foto" (ex: Instagram Visualizações e impressões de fotos) → **"foto"**
- Resto (curtidas/comentários genéricos, Telegram, LinkedIn, Twitter) → **"post"**

Verificado ao vivo nos 3 sites por tipo: foto→"Por foto", IG reels→"Por reels/vídeo", IG curtidas→"Por post", Facebook Reels→"Por vídeo", TikTok→"Por vídeo".

O componente DIFERE entre sites só no design (classes nb-* vs var(--hairline)) — o texto/lógica é idêntico, então aplica-se via patch em string (preserva o estilo de cada site): `d:\tmp\patch-qc.py` (1ª rodada) e `d:\tmp\patch-foto.py` (2ª, +foto +plataformas). Sempre validado: patch sobre o estado anterior == arquivo editado à mão (tsc+eslint limpos).

**Aplicado nos 3 sites (2026-06-16), todos verificados end-to-end (POST /api/checkout com /p/ carrossel → HTTP 400):**
- enjai (srv1166087), portuga (srv1166087), skipark (servidor antigo opengravity).
- `lib/validar-link.ts` é IDÊNTICO nos 3 → copiou-se o arquivo editado do enjai.
- `checkout/route.ts` difere por site (marca/email) → aplicou-se só o patch dos 2 regex `(p|reels?|tv)` (script `d:\tmp\patch-checkout.py`).

Ver [[reference_api_social]] (endpoint post_info) e [[project_migracao_enjai_srv1166087]] (DB local em 127.0.0.1:5436, server srv1166087).
