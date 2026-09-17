---
name: marcadores-de-texto-de-ia
description: "Repeticao de moldura de frase e o marcador de texto de IA que mais escapa numa revisao, mais que qualquer palavra isolada"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 63176e52-9a9d-4e57-aac7-20bb14f54992
  modified: 2026-08-11T21:06:52.832Z
---

**Ao escrever conteudo em escala, o que denuncia IA nao e o vocabulario, e a moldura de frase repetida.** Palavra batida ("vale ressaltar", "em suma", "cada vez mais") e facil de evitar e facil de achar com grep. O que passa despercebido e a mesma **estrutura sintatica** reaparecendo em dezenas de paginas.

**Why:** em 11/08/2026, ao revisar os 41 artigos do BitCão a pedido do Anderson, as palavras-clichê quase nao apareciam (17 ocorrencias em 318 mil caracteres, e duas delas eram uso legitimo). Os defeitos reais eram estruturais e eu nao os teria visto lendo artigo por artigo:

- **5 molduras de fecho girando entre 35 dos 41 artigos.** "Para decidir com critério, temos um X" x8, "Se ainda está decidindo onde levar seu animal, veja nosso X" x7, "Se a dúvida é onde atender, o X ajuda" x7, "Antes de contratar, vale ler o X" x6, "Complementa esta leitura o X" x7. Eu tinha variado a **âncora** dos links e me dado por satisfeito, sem notar que a frase ao redor era carbono.
- **Duas dessas molduras produziam frase quebrada** quando combinadas com a âncora: "temos um o que perguntar numa clínica veterinária", "o o que verificar antes de escolher uma clínica veterinária ajuda". Erro de gramatica gerado pelo proprio molde, invisivel enquanto eu olhava o molde e a ancora separados.
- **33 frases abrindo com "Vale ..."** em 41 artigos, tique meu, nao do idioma.

**How to apply:**

- Ao gerar N textos do mesmo tipo, **nunca reusar moldura de frase com ancora trocada**. Cada fecho parte do assunto do proprio texto.
- Na revisao, medir repeticao de estrutura, nao so de palavra. O que achou os tres defeitos acima:
  - `Counter` das **4 primeiras palavras de cada `<p>`** do corpus inteiro, e olhar tudo com contagem >= 3
  - `Counter` das **5 primeiras palavras do ultimo `<p>`** de cada texto, que expoe boilerplate de fecho
  - `Counter` de **palavra que abre frase** (`\bPalavra\s`), que expoe tique pessoal
- Quando uma moldura tem espaco para texto variavel no meio, **ler a frase montada**, nunca so o molde. E onde nasce concordancia quebrada.
- Vocabulario-clichê continua valendo checar, mas rende pouco: "vale ressaltar", "é importante ressaltar", "em suma", "por fim", "cada vez mais", "desempenha um papel", "vasta gama", "nos dias de hoje", "não apenas X mas também Y", "em última análise".
- Acentuacao pt-BR sai barata por **autoconsistencia do corpus**: se `clínica` aparece 50 vezes e `clinica` uma, a unica e erro. Compare cada palavra sem acento com as formas acentuadas de mesmo esqueleto e sinalize quando a acentuada domina. No BitCão isso deu 3 candidatos em 5.949 palavras distintas, e os 3 eram uso correto (`sabão de coco`, `se distancia` do verbo, `esta atividade` pronome), o que e o resultado esperado de um corpus limpo.

Relacionado: [[nunca-usar-travessao]]
