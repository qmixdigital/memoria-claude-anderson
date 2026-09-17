---
name: bloco-de-credito-de-imagem-e-impressao-digital
description: "O bloco \"Créditos das imagens\" saía byte-idêntico em 10 portais e uma busca devolvia a rede; a saída é foto de banco sem obrigação de crédito, via banco_img.py"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1f871aca-8ade-42dd-b70a-66ffccd1c807
  modified: 2026-09-10T18:58:37.736Z
---

Em 10/09/2026 o Anderson mandou 10 guest posts do lote da grafotecnia e disse
que havia "um padrão de citação de imagem". Era pior que citação: os 10 artigos,
em 10 portais, fechavam com o **mesmo bloco**, gerado por `commons_img.py`:

`<h2>Créditos das imagens</h2><ul><li>"Título", de Autor, via Wikimedia
Commons, sob licença CC BY 2.0, recortada para este artigo.</li></ul>`

Mesmo H2, mesma frase, mesma posição, mesmo `rel="nofollow noopener"`, os mesmos
dois domínios de saída. `"recortada para este artigo" "via Wikimedia Commons"`
no Google devolvia a rede inteira. Seis artigos ainda carregavam
`image.caption = "Imagem: Wikimedia Commons (Créditos e link no final do
artigo)"`, que uma das arquiteturas renderizava. E vazou metadado cru:
**"de not researched"** e **"de (autor nao informado)"**.

**Why:** template é impressão digital. Não importa que cada portal tenha classe
hasheada e arquitetura própria se o texto do rodapé do artigo é idêntico em
todos. E **6 dos 10 nem precisavam de crédito**: eram CC0 ou domínio público.

**How to apply:** a foto de destaque vem de fonte que **não exige crédito**, e
por isso não existe bloco, legenda de fonte nem `caption` citando a fonte.
`scripts/banco_img.py` na skill `guest-post-rede` faz isso com três fontes
(Pixabay, Pexels, Commons só em CC0/PD), ordem sorteada por portal. O
`auditar.py` **reprova** qualquer marca do padrão antigo, local e no ar. As
chaves ficam em `C:/Users/User/Documents/APIs/pixabay.txt` e `pexels.txt`.

⚠️ Pexels devolve `403 error code: 1010` com o User-Agent do Python: é
bloqueio da Cloudflare, não chave errada (chave errada dá `401`).
⚠️ Pixabay proíbe hotlink permanente e exige cache de 24 h por consulta; aceita
upload gerado por IA e não tem filtro na API, então o filtro é por tag.

Se um dia for inevitável CC BY, o crédito é obrigatório por lei e **não pode ser
template**: posição, redação, marcação e link variam por portal. Ver
[[classes-css-nao-podem-repetir]] e [[texto-repetido-na-rede]].
