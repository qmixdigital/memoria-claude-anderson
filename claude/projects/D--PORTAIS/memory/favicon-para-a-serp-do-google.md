---
name: favicon-para-a-serp-do-google
description: "As três restrições que decidem o desenho do favicon: recorte em círculo no celular, zona segura do maskable e o cache de 30 dias dos ícones"
metadata:
  node_type: memory
  type: reference
---

Desenhar favicon para a SERP não é escolher um símbolo bonito: três restrições
técnicas eliminam a maioria das ideias antes do gosto entrar.

**1. O Google recorta em círculo no celular.** Canto arredondado com fundo
transparente aparece com o canto furado. A arte tem que ser **sangrada e opaca**,
sem `rx` e sem alpha. Cada superfície aplica a própria máscara: círculo no
Google móvel, superelipse no iOS, recorte livre no maskable do Android. Arte
quadrada cheia resolve as três de uma vez.

**2. A zona segura do ícone maskable é o círculo central de 80%.** Na grade de
48, o raio seguro é 19,2. Um quadrado centrado de lado L tem o canto a
`L/2 × √2` do centro, então **L ≤ 27**. Um quadrado de 28 já é cortado no
Android, e nada acusa. Provar em código, não no olho:

```python
assert (LADO / 2) * (2 ** 0.5) < 48 * 0.4
```

**3. Cor: nem o escuro nem o lamacento.** A SERP tem fundo branco no modo claro e
`#202124` no noturno. Cor escura da marca some no noturno; sepia e marrom ficam
lamacentos no branco. A cor de acento saturada sobrevive nos dois e é a que
chama. Conferir renderizando sobre os dois fundos, mais o recorte em círculo,
mais 16px com `-filter point`.

**No motor:** o campo é **`iconSvg` no `sites.json`**, nunca o arquivo direto. O
`generateFavicons` deriva 512, 192, 144, 96, 48, o apple-touch e o `.ico`
multi-tamanho desse campo **a cada rebuild**; arquivo trocado na mão volta ao
antigo no próximo deploy. Ver [[favicon-48-declarado-e-nunca-gerado]].

⚠️ **Os ícones têm `expires 30d` no vhost, então a Cloudflare os cacheia.** Depois
de trocar, a página nova sai na hora e **o ícone continua o velho**, inclusive
para o Google. Purgar a zona faz parte da troca, não é opcional. Conferir por
md5, borda contra disco, e não pelo olho.

⚠️ E o `open_file_cache` do nginx segura o descritor por 60s: logo depois do
rebuild o próprio origin ainda entrega o HTML antigo. Ver
[[open-file-cache-serve-arquivo-apagado]].

Requisitos do Google que já são atendidos pelo motor: quadrado, múltiplo de 48,
declarado no `<head>` da **home**, URL estável e alcançável pelo `Googlebot-Image`.

## O padrão do motor faz portais gêmeos

O favicon padrão é um quadrado da cor primária com **a primeira letra do nome**.
Portais cujos nomes começam com a mesma letra e têm paleta parecida saem
**idênticos na prática**: o azulmagazine e o advivo tinham os dois um "A" branco
sobre azul, distinguíveis só pelo tom, e a 16px na SERP eram o mesmo ícone. Isso
é ruim de duas maneiras: não identifica, e é impressão digital de rede, como
[[classes-css-nao-podem-repetir]].

Ao dar `iconSvg` a um portal, derivar da **marca da própria arquitetura**, que já
existe no cabeçalho e já é única por portal. Os três feitos em 22/08/2026:

| portal | arch | desenho | campo |
|---|---|---|---|
| cameracotidiana | AB | quadro, quadro, lente | vermelho `#D3222A` |
| azulmagazine | AA | página com canto dobrado | âmbar `#FFB020` |
| advivo | Z | manchete e linha de texto | marinho `#123A5C` |
| ebookcult | AD | livro aberto com lombada | verde `#2F4A3C` |
| curiosododia | AC | marcador de página | indigo `#3B2C63` |

Duas regras que saíram daí:

- **A cor de acento de um portal não pode virar campo do favicon de outro.** O
  ferrugem do advivo ficaria perto demais do vermelho do cameracotidiana, e o
  latão do ebookcult ficaria perto demais do âmbar do azulmagazine: a 16px os
  dois viram "quadrado amarelo com forma escura".
- **Contraste dentro do ícone importa tanto quanto o campo.** No curiosododia a
  primeira versão tinha fita magenta sobre indigo e ficava lamacenta a 16px. A
  fita passou a ser clara, com o magenta como acento dentro dela.
- **Duas barras iguais leem como sinal de igual ou menu sanfonado.** Assimetria
  resolve: barra inteira em cima, barra curta embaixo.

E `theme.tileColor` acompanha o campo do ícone sempre que ele difere do primário,
senão o bloco fixado no Windows mostra o ícone sobre a cor errada.
