---
name: vivid-como-filete-sobre-papel
description: "A cor vivid da marca usada como filete, anel ou borda sobre fundo claro fica invisível, e nenhuma auditoria de contraste da rede pega, porque todas medem só par de texto"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1f871aca-8ade-42dd-b70a-66ffccd1c807
  modified: 2026-09-09T19:04:11.889Z
---

Em 09/09/2026 o Anderson mandou captura do publisherbrasil dizendo que o amarelo
atrapalhava a leitura. Ele estava certo, e o defeito não era texto: era o
**limão `#DFFB00` usado como elemento gráfico sobre papel**, medindo **1,17:1**
quando o mínimo da WCAG para gráfico é **3:1**. Sobre o `surface` `#F7F8F3` dá
1,10:1. Não é fraco, é invisível.

Eram sete usos na mesma arquitetura: fio das seções, fio sob o nome da editoria,
anel da miniatura circular, anel da foto do autor e filete da citação.

**Why:** `contraste_tema.py` e a auditoria da rede medem **pares de texto**
(`muted`/`paper`, `primary`/`paper`, `onPrimary`/`primary`). Filete, anel,
`box-shadow` e `border` não entram em nenhum par, então um portal inteiro passa
na régua com a cor da marca sumida da tela. Ver
[[contraste-do-tema-abaixo-da-regua]].

**How to apply:** a regra que ficou valendo, e que vale para qualquer `vivid`
claro da rede:

> A cor vivid só entra como **preenchimento atrás de tinta preta**, ou como
> **tinta sobre fundo escuro**. Nunca como filete, anel, borda ou texto sobre
> claro.

Sobre papel, filete e anel viram `--ink`. Onde o gesto da marca é a própria
forma, o conserto rentável é **virar o bloco inteiro para fundo escuro**: no
publisherbrasil o bloco final virou faixa preta e o anel limão saltou de 1,10:1
para 16,60:1, levando junto o número, o fio e o hover. O rodapé ganhou filete
limão de 5px no topo, então a página abre e fecha na cor da marca com o miolo em
papel.

⚠️ Antes de trocar cor, **fazer a conta**, não olhar. Um script de 10 linhas com
a fórmula de luminância relativa resolve, e separa em segundos o que passa do
que só parece passar. A azeitona `#5C6B00` do mesmo portal parecia igualmente
suspeita e mede **5,90:1**: passa, e ficou como estava.
