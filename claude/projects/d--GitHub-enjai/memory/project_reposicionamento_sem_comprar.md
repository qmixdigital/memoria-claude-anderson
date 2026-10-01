---
name: project_reposicionamento_sem_comprar
description: Estratégia 2026-09-29 (Anderson): tirar o verbo "comprar" dos 4 sites SMM (vitrine primeiro), só substantivo neutro (Curtidas/Seguidores/Serviços), sem verbo substituto, URLs intactas; corpo das 52 landings = fase 2
metadata:
  type: project
---

**Decisão do Anderson em 2026-09-29, após o Google August 2026 Spam Update derrubar 99% do orgânico do enjai:** remover **tudo relacionado a "comprar"** dos 4 sites (enjai, portuga, truenet, skipark). "Comprar seguidores" é o gancho de fake engagement que o spam update caça.

**Regras que ele fixou (seguir à risca):**
- **Nenhum verbo no lugar de "comprar"** (nada de pedir/começar/garantir). Fica só o **substantivo neutro**: onde era "Comprar Seguidores" vira "Seguidores"; "Comprar Curtidas" vira "Curtidas"; CTA genérico ("Comprar agora", "Comprar →") vira "Serviços". "Bem neutro."
- **Escopo fase 1 = vitrine:** home inteira (title, H1, description, cards do hero, seção "como funciona"), header/menu, footer, botões, e **title/description/H1 de todas as páginas** (incluindo as 52 landings `comprar-*`). É o que visitante e Google veem primeiro.
- **URLs NÃO mudam** (52 slugs `comprar-*` ficam; sem 301). Renomear no meio da recuperação = churn de indexação. Se um dia mexer nas landings, o certo é CONSOLIDAR (rede de doorway), não renomear.
- **Fase 2 (depois):** corpo de texto das 52 landings, blog, `lib/categoria-content.ts` (3.352 ocorrências em 140 arquivos só no enjai).
- Isso REVOGA, para os sites SMM, a regra antiga de [[feedback_seo_keyword_principal_home]] / [[feedback_seo_loja_vs_plataforma]] de mirar a keyword transacional "comprar seguidores".

**Método:** mapa explícito frase→frase (python, idempotente), não regex cega (quebra gramática: "Como comprar X" precisa reescrita, não deleção). Onde só deletar "Comprar/Compre" fica gramatical, deletar; senão reescrever neutro ("Como Comprar Seguidores no Instagram" → "Seguidores no Instagram: como funciona").

Ver [[feedback_redesign_enjai]] e [[reference_bug_partial_check_smm]] (contexto do spam update).

**FASE 1 FEITA E NO AR nos 4 sites em 2026-09-29.** Scripts idempotentes em `/tmp/sem_comprar_v1..v5.py` (srv1166087 e opengravity; cópia em scratchpad da sessão). Backup de cada arquivo tocado: `<arquivo>.bak-semcomprar` ao lado do original (só a 1ª vez). O que foi aplicado:
- Home: title "Seguidores e Curtidas Instagram TikTok via PIX", H1 sem a linha COMPRAR, FAQ e "Como funciona" reescritos, keywords sem "comprar", JSON-LD ("TrueNet: Loja de Curtidas e Seguidores").
- Header/MobileMenu/Footer: botão "Comprar"/"Comprar agora" → **"Serviços"**; links do footer sem o verbo.
- Título/H1/OG/description de TODAS as páginas: verbo inicial removido ("Comprar Curtidas Instagram | Via PIX" → "Curtidas Instagram | Via PIX"); casos não-gramaticais reescritos ("Como Comprar Seguidores Instagram 2026" → "Seguidores Instagram: Como Funciona"; "Faz Sentido Comprar Pouco?" → "Começar Pequeno?"). **Travessão trocado por " - " (title) e ": " (description/H1)** de passagem.
- Botões das landings: "Comprar agora"/"Comprar" solto → **"Ver pacote"**; "Comprar X agora"/"Comprar X <Chevron>" → **"X"** capitalizado (Seguidores, Curtidas, 1000 seguidores...). Botão de compra do produto (`QuantidadeCalculadora`) → **"Pagamento via PIX"**, "Compra 100% segura" → "Pagamento 100% seguro". Garantia: "Ver serviços com garantia".
- `app/layout.tsx`: description padrão e alt da OG sem "Compre".
- Categoria: H1 "Seguidores para X", "POR QUE COMPRAR X AQUI?" → "X: POR QUE AQUI?".
- Verificado ao vivo (curl `?nc=`): home/landing/categoria dos 4 sites com 0 "Comprar/Compre" visível; URLs intactas.

**Fase 2 pendente (corpo):** parágrafos das landings ("Comprar seguidores Kick é uma estratégia..."), FAQ h3 ("Comprar com PIX é seguro?"), cards `texto:`/`titulo:` ("Selo azul não se compra", "NAO faz sentido comprar para vender"), `lib/categoria-content.ts` respostas, blog. Descrição de `/comprar-seguidores-instagram` do skipark ainda diz "Loja online de seguidores" (ok, sem verbo).
