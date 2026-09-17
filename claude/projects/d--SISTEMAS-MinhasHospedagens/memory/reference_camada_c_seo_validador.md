---
name: reference_camada_c_seo_validador
description: O validador das matérias ganhou checagem de SEO on-page que bloqueia a entrega; sem --kw o SEO não é conferido
metadata:
  type: reference
---

`validador_materia.py` da skill `materias-jornalisticas-linkbuilding` tem três camadas:
A (bloqueios editoriais), B (humanização, mínimo 70) e **C (SEO on-page)**, adicionada em
05/09/2026.

A Camada C só roda com `--kw "palavra-chave"` e `--resumo "linha fina"`, e **bloqueia** a
entrega. Ela cobra: keyword exata no título, nas 100 primeiras palavras, em pelo menos um
H2, de 3 a 8 vezes no corpo, no resumo (que vira a meta description) e cada palavra forte
da keyword com no mínimo 3 usos. Sem `--kw`, o script avisa que o SEO não foi verificado.

**Por que existe:** medi os 10 primeiros artigos da campanha rblc e encontrei **zero
ocorrência exata da keyword no corpo em nove deles**, nenhuma no primeiro parágrafo e
nenhuma em H2. A skill era só anti-detecção de IA e o script aprovava tudo com 90 e 100 de
humanização.

**Armadilha resolvida junto:** repetir uma keyword longa fazia a Camada B acusar trigramas
repetidos e reprovar. Os trigramas contidos na keyword deixaram de contar.

**Conferir update no ar:** a API REST do WordPress serve resposta em cache. Depois de um
`atualizar_post`, checar sempre com `?nc=aleatorio`, senão parece que a alteração não pegou.

Backup do validador anterior: `validador_materia.py.bak-2026-09-05`.
