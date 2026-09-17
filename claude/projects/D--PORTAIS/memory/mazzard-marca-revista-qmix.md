---
name: mazzard-marca-revista-qmix
description: "Onde está a fonte Mazzard, que ela não traz licença, e as duas armadilhas de desenhar marca em curvas com ela"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-20T18:19:14.752Z
---

A **Mazzard H Black** está em `D:\SITES\qmix-next\mazzard-h-black_freefontdownload_org.zip`,
colocada lá pelo Anderson em 20/08/2026. É a fonte da logomarca e do favicon da
Revista QMIX (`qmixdigital.com.br`, arquitetura W na opengravity), ambos em
curvas dentro do SVG.

**Não procurar de novo antes de olhar aí.** Varri a máquina inteira três vezes
nesta ordem, e a fonte não aparece em nenhuma busca comum: não existe arquivo com
`mazz` no nome fora do zip, nenhum CSS a cita, e o `next/font/google` renomeia
todo `.woff2` para hash, então buscar por nome de arquivo sempre dá zero. O que
encontra é ler a tabela `name` de cada binário com fontTools.

**Licença:** o arquivo veio de um agregador, declara `All rights reserved` e os
campos 13 e 14 da tabela `name` estão vazios, ou seja, **não há concessão de uso
nenhuma**. Para marca comercial o certo é baixar a Mazzard H da Zetafonts, que
entrega a licença junto. Ir em curvas evita redistribuir o binário, mas não cura
a licença. Já avisei o Anderson uma vez; ele mandou seguir.

**Why:** o desenho da marca depende de dois detalhes que não são óbvios e que já
custaram retrabalho.

**How to apply:**
- **O kerning não está na tabela `kern`.** Ela existe no arquivo mas só devolve
  1 par para "REVISTA QMIX". O ajuste real mora na feature `kern` do GPOS, em
  PairPos **formato 2**, classe contra classe. Ler só o formato 1 deixa o texto
  com buraco, que é o que denuncia logomarca montada por script. O leitor está em
  `kern_gpos.py`, no scratchpad da sessão.
- **O vão entre palavras sai todo do valor manual**, porque o `A` final não tem
  folga nenhuma à direita. 250 unidades é o valor bom, perto de 1,2 talo do `I`.
  Herdar o vão de outra fonte fecha a ponto de as duas palavras lerem como uma só
  no tamanho do rodapé.
- Trocar a marca implica trocar o favicon junto: ver [[classes-css-nao-podem-repetir]]
  para o princípio, aqui o motivo é mais simples, ícone da aba e assinatura do
  topo têm que ser a mesma letra.
- Para forçar o favicon a regerar, apagar `favicon*`, `icon-*` e
  `apple-touch-icon*` do `public/` antes de reconstruir: o motor tem um
  `if (existsSync) return` que trava no primeiro desenho.
