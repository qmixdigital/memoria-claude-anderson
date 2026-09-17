# Padrão editorial do guest post

As medidas abaixo não são sugestão: são o que `scripts/auditar.py` mede. Escrever
fora delas significa reescrever depois.

## Medidas

| Item | Alvo | Por quê |
|---|---|---|
| Palavras | 1.100 a 1.400 | 644 palavras foi o que o operador reprovou em 02/09/2026. Abaixo de 1.100 o artigo não sustenta 9 H2. |
| H2 | 9 no mínimo | Cada H2 é uma entrada possível na SERP. Oito passa, mas fica na borda. |
| H3 | 6 no mínimo | Cinco viram as perguntas do FAQ, uma sobra para subdividir uma seção. |
| Tabela | exatamente 1 | Featured snippet de comparação. Sempre com `data-rotulo` em cada `<td>`. |
| Lista ordenada | exatamente 1 | Featured snippet de passo a passo. |
| Title | 60 caracteres **com o sufixo do portal** | O portal-engine acrescenta " | Nome do Portal". Contar isso é o erro mais fácil de cometer. |
| Meta description | 150 a 160 | Precisa conter a keyword do **portal hospedeiro**, não a do cliente. |
| Densidade | 0,4% a 3% | Abaixo de 0,4% o artigo não compete pelo termo que justificou a pauta. |
| Links internos | exatamente 2 | Só no bloco `pe-leia-meio`. |
| Link do cliente | o primeiro link do conteúdo, antes do 3º H2 | Regra do operador: nada de link interno antes dele. |

## Estrutura

1. Abertura de dois parágrafos, com a keyword nas 100 primeiras palavras.
2. Primeiro H2, contexto.
3. Segundo H2 com a tabela. O link do cliente cai aqui ou antes.
4. Terceiro H2 com a lista ordenada.
5. Cinco H2 de desenvolvimento, três parágrafos cada.
6. H2 de FAQ, com seis H3 de pergunta e resposta de uma a duas frases.
7. H2 "Resumo", um parágrafo que recapitula sem introduzir tema novo.
8. `<aside class="pe-leia-meio">` no fim, com os dois links internos.

## Linha fina (dek)

Uma frase, 10 a 20 palavras, com acentuação. **Não pode ecoar o texto**: escreva
três candidatas e escolha por similaridade medida contra o corpo já expandido,
descartando qualquer uma acima de 55% (`difflib.SequenceMatcher`). Se o dek não
for informado, o motor usa o começo do artigo como resumo, e aí ele repete o
primeiro parágrafo na página inteira.

## Escrita

- Português do Brasil com acentuação correta. Verificar o dek separadamente: é
  onde o acento some com mais frequência.
- **Zero travessão.** Vírgula, dois-pontos ou reescrever.
- Nada de "clique aqui", "saiba mais", "veja mais" como âncora.
- A âncora do cliente é a que ele mandou, ao pé da letra. Nunca ajustar por
  gosto, nem para caber melhor na frase.
- Cada artigo do lote atende a uma âncora diferente quando o cliente mandou
  várias, e o assunto tem que sustentar aquela âncora sem forçar.

## Imagem

- Runware, modelo barato `runware:100@1`, WebP, `outputType: "URL"`.
- Objeto ou ambiente, **sem gente**. Anatomia é onde o modelo barato erra.
- Gerar só depois do conteúdo pronto, nunca a partir de rascunho.
- Nome do arquivo com o slug, alt descritivo com acento, `width`/`height`
  presentes.
- Abrir e olhar antes de publicar.

## Schema

`NewsArticle` + `FAQPage` + `BreadcrumbList`, canonical apontando para a própria
URL, seis Open Graph e três Twitter. No portal-engine isso sai pronto do
template, mas a auditoria no ar confere: já apareceu portal com
`schemaArticleType: "Article"` em vez de `NewsArticle`.
