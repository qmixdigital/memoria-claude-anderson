---
name: design-direcao-b-aprovada
description: O Anderson aprovou a direcao B (claro industrial) para o eletricistasemgoiania.com.br em 11/09/2026; foi aplicada e publicada
metadata:
  type: project
---

Em 11/09/2026 o Anderson escolheu, entre dois mockups gerados pelo Fable, a **direcao B "claro industrial"**: fundo claro frio (#F3F4F6), tinta quase preta, laranja do logo (#FF9F1C) so como sinalizacao (faixas, numeros, marcadores), verde do WhatsApp nos CTAs, header escuro, Barlow Condensed 600/700/800 (local) nos titulos e Poppins no corpo, raio 6px, filetes 1px, sem sombra. Aplicada no build em `src/` e publicada (commit d6cea74). PageSpeed depois: mobile 95, desktop 99, CLS 0 e 0,078.

A direcao A (escuro eletrico, marinho + amarelo) foi rejeitada por parecer com o site anterior. Os mockups ficaram na pasta scratchpad da sessao e a comparacao no artefato https://claude.ai/code/artifact/b1b90256-769d-47c1-9798-864293aec8df.

**Why:** ele reprovou duas vezes o site "igual ao anterior"; a B foi a que mais se afastou.
**How to apply:** qualquer ajuste de design segue esse sistema (tokens em src/critical.css, CSS em src/styles.css). Nao voltar ao tema escuro. Ver [[hero-mobile-alinhado-esquerda]] e [[nao-trocar-imagens-do-cliente]].
