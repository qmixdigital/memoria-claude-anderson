---
name: fontes-preferidas-implantado
description: o botão de Fonte Preferida do Google está nos 101 portais, e o gancho é instLinks mais _raw_articleHtml
metadata:
  type: project
---

Implantado em 24/08/2026 nos **101 portais** das três máquinas. O botão fica no
fim do corpo da matéria e no rodapé, nunca no cabeçalho.

Os dois ganchos, escolhidos para não tocar nas 135 arquiteturas:

- **`_raw_articleHtml`**, única função que chama `arch.article` nas três
  máquinas. O bloco entra numa **cópia** de `art.content`: escrever no original
  poria o texto na descrição, no resumo e na busca, e ele acabaria gravado no
  JSON.
- **`H.instLinks()`**, que toda arquitetura chama no rodapé.

🔴 **Nem toda arquitetura chama `instLinks()` só no rodapé.** A K, da hostinger,
chama também no cabeçalho, dentro do menu sanfonado. O corte fica no funil único
`_renomClasses`: o bloco vem entre `<!--fp-->` e `<!--/fp-->` e o que estiver
antes do `</header>` sai. **Os marcadores têm que envolver o `<style>` e o
`<script>` também**, senão eles continuam saindo no cabeçalho e só o auditor
pega.

**Why:** qualquer bloco novo que se queira pôr em todos os portais tem esses dois
mesmos ganchos disponíveis, e a mesma armadilha do `instLinks` no cabeçalho.

**How to apply:** os scripts estão em
`D:\SISTEMAS\MinhasHospedagens\Opengravity` (`patch_fontes.py`, `rollout_fp.py`,
`aceite_fp.py`, `lista_fp.py`) e a lista entregue em
`D:\PORTAIS\FONTES-PREFERIDAS-IMPLANTADO.tsv`. A variação por hash do domínio
segue a regra de [[classes-css-nao-podem-repetir]]: 101 classes distintas.
