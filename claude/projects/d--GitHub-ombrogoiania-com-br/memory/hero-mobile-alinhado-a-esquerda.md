---
name: hero-mobile-alinhado-a-esquerda
description: "Todo pedido de alinhamento (\"a esquerda\", \"ao centro\") que o Anderson manda e SO para o celular (ate 480px); tablet e desktop ficam como estao"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dac55fc5-0b53-42ff-87c9-3a320ad11434
  modified: 2026-09-12T15:36:36.021Z
---

Em 12/09/2026, no ombrogoiania.com.br, o Anderson mandou uma serie de pedidos do tipo "a esquerda: [trecho]" e "ao centro: [trecho]". Depois esclareceu: **"Todos que eu enviar para voce otimizar e so a versao mobile"** e **"Tablet tambem pode deixar como estavel. Otimize somente mobile."**

Dois erros meus que geraram retrabalho:
1. Li "otimize esse texto a esquerda" como "o texto que fica a esquerda" e reescrevi o conteudo. Era alinhamento.
2. Apliquei o alinhamento em todas as larguras. Ele queria so no celular e mandou reverter desktop e tablet.

**Why:** ele revisa no celular e manda o trecho que viu. A tabela de alinhamento do CLAUDE.md global diz "Hero mobile: centralizado", mas o gosto dele no celular e caso a caso, e ele manda explicitamente.

**How to apply:**
- Pedido no formato "[a esquerda | ao centro] + trecho de texto" = mudar `text-align` daquele bloco, sem tocar no texto.
- Colocar a regra em `@media (max-width: 480px)`, nunca em 768px: tablet segue o desktop.
- Nao mexer no desktop nem no tablet a menos que ele diga.
- Filete do `.section-heading::after` acompanha: `margin-left: 0` quando a esquerda, `margin: 18px auto 0` quando ao centro.
- Ver [[cloudflare-pages-redirects-sem-exclamacao]] para o fluxo de publicacao deste site.
