---
name: regua-de-meta-description-escapada
description: Medir a description direto do atributo HTML conta &quot; como 6 e faz cortar texto que estava certo
metadata:
  type: feedback
---

Auditoria que le `<meta name="description" content="...">` e mede `len()` do que
veio esta medindo a **forma escapada**: cada aspa vira `&quot;` e conta seis
caracteres, cada `&` vira `&amp;` e conta cinco.

**Why:** por causa disso truncei uma linha fina de 164 caracteres que estava
correta, e o corte ainda quebrou o par de aspas, deixando `opção "Adicionar.` no
Google. O mesmo erro ja tinha aparecido antes contando `&amp;` como 5 num alarme
falso de 3.392 titulos longos.

**How to apply:** `html.unescape()` antes de medir, sempre. O Google mede o texto
que o leitor ve. Vale para title, description e og:description.

Ver [[padrao-seo-do-lote]] e [[title-separado-do-h1]].
