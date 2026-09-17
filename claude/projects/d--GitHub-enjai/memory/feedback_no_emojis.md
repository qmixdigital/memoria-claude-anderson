---
name: feedback_no_emojis
description: "NUNCA usar emojis em conteúdo/design de site (nem UI, nem páginas, nem e-mails). Usuário considera amador."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-09-02T08:51:12.041Z
---

**O usuário NÃO gosta de emojis, de forma alguma, em nada voltado ao público.** Considera "muito pobre e amador". Vale para: UI de site (botões, banners, badges), páginas (títulos, boxes), e-mails de campanha, e qualquer peça que o cliente final veja.

**Why:** identidade profissional. Emoji em site sério passa amadorismo e denuncia texto gerado por IA (mesma lógica do travessão proibido no CLAUDE.md).

**How to apply:**
- Nunca inserir emoji em texto/markup de site que eu criar (nem 📲🎉🥉🏆💲, nem cifrão estilizado como "moeda", nem coroa).
- Substituir por tipografia forte, cor de marca, ícones SVG minimalistas/geométricos, ou nada.
- Tiers VIP: o `ConfigVip` guarda um campo `emoji` (🥉🥈🏆). NÃO renderizar esse emoji na página; usar a cor do tier (`t.cor`) como acento (barra/círculo) em vez do emoji.
- Isso afeta coisas que já criei com emoji e precisam limpeza: AppVipBanner (cifrão), InstallBar ("$" dourado + "10% OFF"), AppWelcome (🎉), InstallHelp (📲 e chips com emoji), página /vip. Varrer e remover quando tocar em cada uma.
- Erro cometido em 2026-09-02: enchi a /vip e os e-mails de campanha de emoji; usuário reprovou. Não repetir.

Ver [[project_app_pwa]] e [[project_campanha_app_lancamento]].
