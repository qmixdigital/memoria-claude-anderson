---
name: any-nao-traz-a-lixeira
description: O post_status "any" do WP_Query exclui trash e auto-draft, e o inventário da conversão sai incompleto sem avisar
metadata:
  type: reference
---

No `WP_Query`, `post_status => 'any'` **exclui todo status marcado com
`exclude_from_search => true`**, e isso inclui **`trash` e `auto-draft`**. O
exportador da Fase 0 usa `any` justamente para trazer tudo, e sai sem eles.

No jornaldobairroalto o inventário saiu com 3.438 registros e a contagem depois
da poda mostrou **32 na lixeira e 1 auto-draft** que nunca foram inventariados.

**Why:** eles caem na regra 1 e são apagados de qualquer jeito, mas o inventário
é a única prova do que sumiu e a única chance de republicar no mesmo slug. Sair
incompleto derrota o propósito da fase.

**How to apply:** ou listar os status explicitamente
(`['publish','draft','pending','private','future','trash','auto-draft']`), ou
exportar num segundo passe com `post_status => ['trash','auto-draft']` antes de
apagar. A conferência que pega isso já está na skill: rodar
`wp post list --post_status=any` **depois** de apagar e olhar o que sobrou. Ver
[[registro-de-donos-de-slug]].
