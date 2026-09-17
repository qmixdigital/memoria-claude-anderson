---
name: linha-fina-nao-pode-repetir-a-abertura
description: "Gerar descrição do primeiro parágrafo resolve o SEO e cria a repetição na tela; os dois campos precisam de origens diferentes"
metadata:
  node_type: memory
  type: feedback
---

Artigo importado sem resumo ganha descrição extraída do corpo. Tirar do
**primeiro** parágrafo é o certo para o resultado de busca e o errado para a
página: a linha fina fica logo acima do texto, e o leitor lê a mesma frase duas
vezes seguidas. No curiosododia foram **125 artigos** assim, e o defeito foi
criado pela própria correção anterior.

Os dois campos precisam de origens diferentes:

| campo | de onde sai | onde aparece |
|---|---|---|
| `metaDescription` | primeiro parágrafo | `<head>`, resultado de busca |
| `dek` / `excerpt` | um parágrafo **posterior** | na tela, acima do corpo |

Descartar parágrafo que comece por conector ou em minúscula, porque lê como
pedaço solto. Quando não há segundo parágrafo aproveitável, **tirar a linha fina**:
nenhuma é melhor que uma repetida.

⚠️ A comparação é por prefixo normalizado (sem acento, sem pontuação), e não por
igualdade: o resumo do WordPress é o primeiro parágrafo **cortado**, então nunca
bate exato. Ver [[regua-de-meta-description-escapada]].
