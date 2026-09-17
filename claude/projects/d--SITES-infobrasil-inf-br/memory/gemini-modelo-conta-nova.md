---
name: gemini-modelo-conta-nova
description: gemini-2.5-flash responde 404 para chaves novas; a API manda usar gemini-3.6-flash
metadata:
  type: reference
---

Chave nova da API do Google (`generativelanguage.googleapis.com`) recebe **404**
ao chamar `models/gemini-2.5-flash`, com a mensagem "no longer available to new
users. Please update your code to use models/gemini-3.6-flash".

`gemini-flash-latest` respondeu **503** ("high demand") no mesmo teste, entao nao
serve como apelido estavel.

**Why:** custou um ciclo de depuracao no Cortes IA em 19/08/2026. O nome do
modelo parece uma escolha livre, mas conta criada depois de certa data so
enxerga a geracao nova.

**How to apply:** testar a chave com um `curl` de uma linha ANTES de escrever
codigo em volta dela. Fixar o nome do modelo (`gemini-3.6-flash`) em vez de usar
apelido `-latest`. Ver [[cascata-download-regras]] para a regra geral de medir
antes de assumir.
