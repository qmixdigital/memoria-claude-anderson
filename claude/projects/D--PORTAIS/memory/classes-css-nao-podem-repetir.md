---
name: classes-css-nao-podem-repetir
description: "Regra dura do Anderson: nenhum nome de classe CSS pode se repetir entre portais da rede, nem os que vêm do motor"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T19:15:15.447Z
---

**Nenhum nome literal de classe CSS pode aparecer igual em dois portais da rede.**
O Anderson tratou isso como problema sério em 15/08/2026: o Google não pode
identificar que os sites são uma rede, e a impressão digital tem que ser diferente
em cada um. Ele sabe que é difícil e quer o máximo possível.

Isso vale para as três origens:

1. **Markup escrito à mão** (páginas de equipe, perfil de autor, páginas extras).
   Antes de reaproveitar HTML de outro portal, conferir e renomear.
2. **CSS das arquiteturas** em `archs.js`. As classes passadas por `s()` / `ctx.c()`
   já são hasheadas pelo slug do site; classes literais escritas direto no CSS não.
3. **O próprio `render.js`**, que é o pior caso, porque sai igual nos 22 portais.

Conferência: `curl -s <portal>/equipe/ | grep -oE 'class="[a-z0-9_-]+"' | sort -u`
e comparar entre dois portais. Qualquer nome legível que apareça nos dois é falha.

**Why:** a rede existe para backlinks. Duas arquiteturas visuais diferentes não
adiantam nada se o vocabulário de classes é idêntico, porque isso é comparável
por script em segundos.

**How to apply:** tudo que for nome de classe deve derivar do hash do slug do site,
não de palavra legível. Ver [[nunca-citar-a-agencia-nos-portais]],
[[patches-motor-clinicas-vps]] e [[conversao-total]].
