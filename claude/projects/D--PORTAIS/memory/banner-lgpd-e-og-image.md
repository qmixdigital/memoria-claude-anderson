---
name: banner-lgpd-e-og-image
description: "Todo projeto precisa de banner de cookies LGPD e og:image em todas as páginas, home inclusive"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T20:09:51.315Z
---

Regra do Anderson, dada em 15/08/2026 para **todos os projetos futuros**:

1. **Banner de consentimento de cookies (LGPD) sempre presente.** Fixo no rodapé
   na primeira visita, com "Aceitar todos" e "Apenas necessários", link para a
   política de privacidade, preferência gravada em `cookie_consent` por 1 ano
   (`max-age=31536000; SameSite=Lax`), e nunca reexibido depois da escolha.
   Analytics e scripts de terceiros só carregam se o usuário aceitar.
2. **`og:image` em todas as páginas, a home inclusive.** O erro que aconteceu nos
   portais foi ter imagem só nos artigos: a home compartilhada no WhatsApp saía
   sem imagem nenhuma.

Isso já estava no `CLAUDE.md` global, mas os portais convertidos foram ao ar sem
os dois. **Verificar explicitamente antes de considerar um site pronto**, porque
o checklist automático de SEO não pegava nem um nem outro.

## Conteúdo sem imagem

Regra complementar da mesma conversa: **artigo sem imagem não fica no ar.** Ou se
apaga, ou, se o conteúdo for importante, **gera-se uma imagem** (API da Runware,
WebP, sem texto embutido).

O Antônio já não entrega mais sem imagem, salvo quando a entrega vem com erro.
Então o caso passou a ser exceção, mas a varredura continua valendo.

Ver [[conversao-total]] e [[campos-novos-do-motor]].
