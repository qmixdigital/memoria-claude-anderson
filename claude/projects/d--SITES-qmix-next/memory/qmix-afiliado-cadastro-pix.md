---
name: qmix-afiliado-cadastro-pix
description: Afiliado só é aprovado e só saca com cadastro completo (nome, CPF, endereço, chave PIX) e chave confirmada por PIX de teste de centavos (29/09/2026)
metadata:
  type: project
---

Ordem do Anderson (29/09/2026): cadastro total obrigatório antes de liberar o afiliado.

- Tabela `afiliado_cadastros` (1 por cliente; migration `drizzle/20260929_afiliado_cadastros.sql`). Regras sem banco em `src/lib/afiliado-cadastro-regras.ts` (CPF com dígito, CEP, UF, chave por tipo: cpf/email/telefone/aleatória, sem CNPJ), servidor em `src/lib/afiliado-cadastro.ts`.
- Fluxo: afiliado preenche em Minha conta > Afiliados (`CadastroAfiliado.tsx`, CEP pelo ViaCEP) → vira "solicitado" → Telegram mostra o valor sorteado (R$ 0,01 a 0,99) → Anderson manda o PIX **manualmente pelo banco**, confere o nome do recebedor e toca "💸 PIX de teste enviado" (ou "Marquei o PIX enviado" em /admin/afiliados) → afiliado recebe e-mail e digita o valor → confirmado → Telegram com botão Aprovar.
- 3 valores errados = bloqueado; admin "Gerar novo valor". Trocar a chave desfaz a confirmação.
- Aprovar (admin e Telegram `aff_ok`) e saque recusam sem chave confirmada; o e-mail/Telegram de saque já leva a chave. O valor de teste nunca vai para o navegador do afiliado.
- Os 11 afiliados ativos antes da regra seguiram ativos, mas só sacam depois de confirmar; os 2 pendentes precisam preencher.
- Não há envio automático de PIX pelo Asaas (só cobrança); se quiser automatizar, é a API `/v3/transfers`.
