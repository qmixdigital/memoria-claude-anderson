---
name: reference_imagens_wikimedia_commons
description: "Substituir imagem de IA por foto real do Wikimedia Commons: script commons_img.py busca, filtra licença, recorta e monta o bloco de crédito no fim do artigo"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 11d63bfc-1400-4f76-816e-cd634e1dbc24
  modified: 2026-09-10T00:22:56.122Z
---

Decisão do operador em 09/09/2026: **parar de ilustrar artigo com imagem gerada
por IA** (o Google não gosta) e passar a usar foto real do
<https://commons.wikimedia.org/>, com crédito e link no fim do artigo.

**Ferramenta:** `C:\Users\User\.claude\skills\guest-post-rede\scripts\commons_img.py`

```
python commons_img.py buscar "termo em ingles" --n 8
python commons_img.py pegar "File:Nome.jpg" --slug SLUG --saida DIR
```

`buscar` lista só o que passa no filtro e mostra o motivo de cada recusa.
`pegar` baixa, recorta em "cover" para 1216x640 (foco 0.40, puxando para cima),
grava WebP 82 e devolve a ficha. `bloco_credito(fichas)` monta o HTML.

**A API entrega licença estruturada**, então não é preciso adivinhar: o
`extmetadata` traz `LicenseShortName`, `LicenseUrl`, `Artist`, `Restrictions` e
`AttributionRequired`. O filtro recusa NC, ND, fair use, arquivo sem licença
declarada, largura abaixo de 900px e **qualquer `Restrictions`**, que é o campo
onde aparece `personality` (foto com pessoa identificável) e marca registrada.
A ordenação prefere domínio público e CC0, depois CC BY, depois CC BY-SA.

**São DOIS textos, não um.** Ordem do operador em 09/09/2026:

1. **Legenda logo abaixo da imagem**, com `commons_img.legenda()`, que devolve
   `<p class="credito-imagem"><em>Imagem: Wikimedia Commons (Créditos e link no
   final do artigo)</em></p>`. **Sem link de propósito**: em guest post, qualquer
   `<a>` aqui apareceria antes do link do cliente e quebraria a regra de que ele é
   o primeiro link do conteúdo. Em destino que não tem campo de legenda para a
   imagem de destaque (o Next do medicinageriatrica não tem), ela entra como o
   primeiro parágrafo do `conteudo` e cai exatamente sob a imagem.
2. **Bloco de crédito completo no fim**, com `bloco_credito()`.

**No medicinageriatrica a legenda tem campo próprio desde 09/09/2026.** O
template usava `imagemAlt` nos dois lugares, no atributo `alt` da `<img>` e no
`<figcaption>` visível, então não dava para pôr o crédito na legenda sem destruir
o alt descritivo. Foi acrescentada a coluna `imagem_legenda` (nullable) e o
`figcaption` passou a ser `imagemLegenda ?? imagemAlt`, o que deixa os 1195
artigos antigos exatamente como estavam. Deploy pelo `scripts/deploy.sh` do
projeto, que builda em `-build`, troca por `mv` e reinicia em rolagem.

Pôr a legenda como primeiro parágrafo do `conteudo` **não funciona**: ela fica
dentro do corpo, abaixo da legenda de verdade, e ainda pega a capitular do tema.

**O crédito vai no FIM do artigo**, com `target="_blank"` e **`rel="nofollow
noopener"`** (leitura de "no follow" no pedido do operador; se ele quiser passar
autoridade para o Commons é só trocar o parâmetro `rel`). Formato:
nome legível, autor, "via Wikimedia Commons", licença e a nota "recortada para
este artigo", que é o que a CC BY-SA exige de quem faz obra derivada.

## Armadilhas medidas na prática

- **Busca específica demais devolve zero**, sem erro. "clinical thermometer
  hypothermia elderly" não achou nada; "clinical thermometer" achou seis. Buscar
  pelo OBJETO, não pela cena inteira.
- **O link do autor costuma ser um redlink** (`User:Fulano&action=edit&redlink=1`),
  página que não existe. O script agora descarta e deixa só o nome.
- **O nome do arquivo é péssimo como texto âncora**
  (`<<REMOVIDO>>+Hartmann-0123-Lot3499`). Passar
  `ficha["nome_exibido"] = "descrição curta em português"`.
- **A licença vem em inglês.** Há um `TRADUZ_LICENCA` para "Public domain" virar
  "domínio público"; sigla de Creative Commons fica como está.
- **OLHAR a imagem continua obrigatório, e por motivo novo.** A primeira escolhida
  era CC0 e linda, e marcava **98.6 °F**: unidade errada para o leitor brasileiro
  e temperatura normal num artigo sobre hipotermia. Foto real erra o CONTEXTO
  onde a IA errava a anatomia.
- **O Commons é forte em documental, técnico, histórico, natureza e objeto, e
  fraco em foto de estilo de vida da saúde.** Cena de cuidador, paciente idoso em
  casa e afins quase não existe em licença livre e, quando existe, cai no filtro
  de `personality`. Para esses temas, ilustrar com o OBJETO da cena resolve.

Primeiro artigo publicado com o método:
<https://medicinageriatrica.com.br/hipotermia-em-idosos/> (imagem em domínio
público, crédito no fim). Ver [[feedback_imagem_ia_generica]], que continua
valendo para quando não houver foto livre, e
[[reference_reescrever_guest_post_no_lugar]].
