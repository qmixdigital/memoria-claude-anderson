---
name: reference_dois_validadores_guest_post
description: auditar.py e validador_materia.py validam coisas diferentes e se contradizem em dois pontos; a Camada C foi incorporada ao auditar.py em 07/09/2026
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-07T19:33:37.866Z
---

As duas skills de guest post têm validadores, e **não é questão de escolher um**:

- **`auditar.py`** (guest-post-rede) valida a **publicação**: schema, canonical, Open
  Graph, imagem com alt e dimensão, contagem de links internos, extras injetados pelo
  autoLink, sitemap. Sem substituto para a rede própria.
- **`validador_materia.py`** (matérias jornalísticas) valida a **escrita**: variedade de
  frases, trigramas repetidos, diversidade lexical, frases longas, vocabulário proibido.

Um cuida de como o post nasce no servidor, o outro de como o texto está escrito.

## A Camada C agora está nos dois (07/09/2026)

O `auditar.py` media só **densidade percentual**, métrica que aprova artigo cuja keyword
aparece no title, no H1 e no dek e **some do corpo**. Foi o que deixou passar o lote do
arlaproducao. Incorporei a correspondência exata:

keyword obrigatória no title, nas 100 primeiras palavras, em pelo menos um H2 e na meta;
**3 a 8 ocorrências exatas no corpo**; cada palavra forte da keyword **3x** no texto.

Teste que confirmou: os 10 do bitcao (feitos com os dois validadores) passam limpos; o
primeiro do arlaproducao passa a ser **reprovado**, pelo mesmo motivo que o outro
validador já apontava.

**Efeito na escolha de pauta:** keyword de 7-8 palavras não fecha — as 3 ocorrências no
corpo estouram os 3% de densidade. Usar keyword de **3 a 5 palavras**.

**Vício que ela pega:** escrever com sinônimo demais. Artigo sobre "cachorro comendo
grama" que só diz "cães", "animal", "mato" fica bonito e não disputa o termo.

## Os dois pontos em que se contradizem

| Item | rede própria (auditar.py) | parceiros (validador_materia.py) |
|---|---|---|
| `<ol>` | **exige** 1 | proíbe (conta como bullet) |
| bloco `pe-leia-meio` | **exige** (entrega os 2 internos) | proíbe (link no último parágrafo) |

Ao rodar o `validador_materia.py` num artigo da rede própria, esses dois bloqueios
aparecem e **devem ser ignorados**; o resto vale. O wrapper que os separa dos erros reais,
em vez de silenciar tudo, está em `skills/guest-post-rede/scripts/val2.py`.

Backup do arquivo anterior: `auditar.py.bak-camadaC-20260907`.

Ver [[feedback_backlink_sempre_artigo_novo]], [[reference_runbook_backlinks_clientes]].

## A Camada C do auditar.py aprova artigo no piso (07/09/2026)

Ela conta a keyword em **`h1 + dek + corpo`**. Artigo com a keyword só **2 vezes no corpo**
soma 3 com o H1 e passa no mínimo de 3, com densidade colada em 1%. Foi o caso de 8 dos 10
do lote enjai, aprovados pelo portão e frágeis na prática: qualquer edição posterior
derrubaria abaixo da régua, e 2 ocorrências no corpo disputam mal o termo.

A régua da skill de matérias é mais apertada e melhor: **3 a 6 ocorrências no corpo**, e ela
cobra dois itens que o `auditar.py` **não checa**:

- keyword no **slug**;
- keyword no **alt da imagem destacada**.

**Alvo prático que fecha as duas:** 3 a 4 ocorrências no corpo, 4 a 5 no artigo inteiro,
densidade entre 1,3% e 2,1%, e cada palavra forte 4x ou mais. Escrever mirando o mínimo de 3
entrega artigo no limite.

**Para republicar corrigindo só o texto:** `atualiza_conteudo.py` troca apenas o campo
`content` do JSON e preserva `date`, autor e imagem, para o post não parecer republicação.
Depois é rebuild + restart + re-ping do IndexNow (que não sai sozinho, ver
[[reference_indexnow_rede]]).

## Terceira contradição: o mínimo de 1.200 palavras (07/09/2026)

O `validador_materia.py` bloqueia abaixo de **1.200 palavras** contando **só a prosa**: ele
remove tabela, lista e heading antes de contar. O contrato da rede própria
(`reference/padrao-editorial.md`) é **1.100 a 1.400 palavras da página renderizada**, que é
o que o `auditar.py` mede.

O mesmo artigo aparece como **1.150 no ar e ~960 no validador**. Rodando o portão de escrita
num lote da rede própria, esse bloqueio dispara em **todos** e esconde os erros reais no
meio do ruído. Entrou como terceiro item do `IGNORAR` do `scripts/val2.py`, ao lado do
`<ol>` e do `pe-leia-meio`, com o motivo escrito no cabeçalho do arquivo.

**Rodar o portão de escrita ANTES de publicar, e de novo depois de qualquer edição.** No
lote iq (testeiptv.wales) ele foi rodado tarde e achou, em artigo já no ar, o termo proibido
`soluç` em 6 pontos, keyword exata 2x no corpo em 2 artigos (a ponta cega acima), 4 frases
seguidas abrindo com "O" e trigramas repetidos até 14x. Tudo corrigível, mas custou
republicação, rebuild e reauditoria dos 10.

**Trigramas em artigo curto de tema único:** o alvo de no máximo 2 trigramas repetidos 3x é
calibrado para matéria de 1.500 a 2.000 palavras. Em how-to de 1.150 palavras o termo do
domínio repete naturalmente. O que realmente vale cortar é a repetição mecânica: percentual
escrito por extenso ("vinte e cinco por cento" vira 25%), a mesma construção usada como
muleta e a frase do resumo copiada do corpo.
