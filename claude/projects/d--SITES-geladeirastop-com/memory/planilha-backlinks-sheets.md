---
name: planilha-backlinks-sheets
description: Como escrever na planilha de backlinks do geladeirastop no Google Sheets (qual service account funciona e o layout das colunas)
metadata:
  type: reference
---

Planilha de backlinks do geladeirastop.com no Google Sheets:
`https://docs.google.com/spreadsheets/d/1nxuv4uUkMlq6WNUlwOk5EUWaCh0UB-pbtH1uzrRi0Sk/`
aba única `BACKLINKS geladeirastop.com` (gid 368752481).

**Só a service account `seoqmix@seoqmix.iam.gserviceaccount.com`**
(`C:\Users\User\Documents\APIs\seoqmix-024e9465e9d9.json`) consegue escrever:
é a única com a API do Sheets ativa no projeto dela, e a planilha está
compartilhada com ela como editor. As outras (`backlinkguard`, `qmix-seo`) têm o
projeto sem a API, e a conta Google do Anderson não é dona desses projetos para
ativar (o console devolve "acesso adicional necessário").

Colunas: A=NR, B=Domínio do portal, C=Custo, D=Link do guest post,
**E=Âncora, F=Link no cliente, G=Data (não preencher), H=Tema da pauta**.
Linha a preencher = tem B e não tem E. Antes de escrever, ler a planilha inteira
e montar o conjunto de F já usados e E já usadas, para não repetir destino nem
âncora entre rodadas. Script: `scratchpad/preencher.py` desta sessão; cópia do
resultado em `D:\PORTAIS\BACKLINKS\geladeirastop-rodada-AAAAMMDD.json`.
