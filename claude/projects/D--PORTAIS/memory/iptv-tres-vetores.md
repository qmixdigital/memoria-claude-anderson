---
name: iptv-tres-vetores
description: Buscar IPTV só pela sigla deixa passar; são três vetores e o pior é o link sem a palavra
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T16:32:29.335Z
---

A regra da rede é apagar **todo** conteúdo de IPTV. Buscar por `\biptv\b`
**não basta**: no piloto do agencianacional isso deixou passar **9 artigos**, que
o Anderson foi achando um a um enquanto navegava. Constrangedor e evitável.

**Os três vetores:**

1. **Sigla junta.** `\biptv\b`. Pegou 236 artigos.
2. **Sigla mascarada.** Âncoras como "teste IP TV" e "IP TV grátis", com espaço,
   ponto, hífen ou tag HTML entre as letras. Pegou mais 4.
   ```python
   SEP = r'[\s\.\-–—_/]{0,3}'
   RX = re.compile(r'(?<![a-zà-ÿ])i'+SEP+r'p'+SEP+r't'+SEP+r'v(?![a-zà-ÿ])', re.I)
   ```
   Varrer também o texto **sem tags**, para pegar `IP<strong>TV</strong>`.
3. **Sem a sigla, linkando para site de IPTV.** O artigo fala de cinema e a
   âncora é só "teste grátis". **Não existe pista no texto.** Pegou mais 5.

**A solução do vetor 3:** classificar o destino. Baixar a home de cada domínio
linkado e contar menções à sigla. A separação é limpa e dispensa julgamento: os
sites de IPTV tinham de **928 a 1.239 menções**, e os outros 56 domínios tinham
**zero**. Corte em 8.

**Domínios de IPTV já identificados na rede:** `rblc.com.br`, `leiaagora.com.br`,
`pinaunaeditora.com.br`, `quatrode15.com.br`, `criexp.com.br`.

**Why:** todos esses artigos são backlink pago, então o texto é sobre outro
assunto de propósito, para o link parecer natural. Quem escreveu queria que não
parecesse IPTV, e é exatamente por isso que a busca por palavra falha.

**How to apply:** rodar os três vetores em sequência, sempre. Ao apagar, remover
os destinos mortos do `autoLink.map` e aplicar 410. Depois rodar de novo os três
até dar zero.

Relacionado: [[conversao-total]], [[linkagem-interna-automatica]]

## Agora são cinco vetores

O nome deste arquivo ficou desatualizado. Além dos três originais, existem:

- **4º, template de afiliado sem a sigla:** `setup`, `travamentos`,
  `qualidade do sinal`, `lista de canais`, `teste rápido`, `provedor`, `roteador`.
  Duas ocorrências na mesma seção `<h2>` indica bloco enxertado.
- **5º, o funil escrito com TV no lugar de IPTV**, achado pelo Anderson em
  15/08/2026: "teste grátis TV", "teste de TV", "TV grátis", "lista de TV",
  "servidor de TV". Passa por todos os quatro anteriores, porque não tem a sigla,
  não tem link para domínio de IPTV e não tem vocabulário de setup.

Cuidado com falso positivo no quinto: artigo técnico sobre vídeo diz
"faça um teste de 1 a 2 minutos em 30 e 60 fps". Ler o trecho antes de apagar.

## Sexto vetor (16/08/2026): a sigla colada

`iptv` **não pega `SSIPTV`**: não há fronteira de palavra antes da sigla.
O primeiro vetor perdeu o `` e virou `/iptv/i`. Rodando o vetor corrigido nos
três portais já convertidos, apareceu resíduo em **todos**.

⚠️ E a verificação tem que ser `grep -ril 'iptv' data/ public/`. Script de
checagem escrito dentro de heredoc aninhado por SSH perde as barras invertidas,
o `` vira literal e o resultado é um "0 restantes" falso. Já me enganou.

