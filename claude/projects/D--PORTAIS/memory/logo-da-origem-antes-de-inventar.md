---
name: logo-da-origem-antes-de-inventar
description: O WordPress da origem quase sempre tem logotipo e favicon próprios, e eles são melhores do que o badge que o motor gera
metadata:
  type: feedback
---

Antes de desenhar qualquer marca, **procurar a que a origem já tem**. O motor
gera um badge com a letra inicial, e a arquitetura desenha um símbolo genérico de
barras. Nos dois portais convertidos em 23/08/2026 a origem tinha logotipo e
favicon feitos por designer, e os dois eram melhores.

**Why:** o Anderson disse por extenso, "resgate a logomarca e o favicon que eram
mais bonitos do que o que você criou. Você precisa ser mais criativo, pois está
ficando tudo igual". Inventar identidade quando ela já existe joga fora trabalho
pago e deixa os portais parecidos entre si, que é o oposto do que uma rede de
backlinks precisa.

**How to apply:** na origem, antes de desligar o WordPress:

```bash
wp option get site_icon        # ID do anexo do favicon
wp option get site_logo        # ID do logotipo, e tambem `options_logo` no ACF
wp theme mod get custom_logo   # o caminho do customizer
wp post meta get <ID> _wp_attached_file
find wp-content/uploads -iname "*logo*" -o -iname "*favicon*" -o -iname "*marca*"
```

O `_wp_attached_file` dá o caminho real; o `guid` mente quando o site trocou de
domínio. Procurar também a **versão branca**, que costuma vir com sufixo
`_branca` ou `_white` e é a que vai no rodapé escuro.

**A paleta sai do arquivo, não da minha cabeça.** Contar os pixels do logotipo e
do favicon com PIL dá as duas ou três cores da marca. No folhadonoroeste vieram
marinho `#012552` e lima `#E1FC00`; no diariopernambucano, carmim `#DA3444` e
grafite `#1E1F23`.

⚠️ **Marca de duas cores, versão clara.** Para o rodapé escuro, trocar **só** o
tom escuro por branco e deixar o colorido intacto. Pintar tudo de branco apaga
metade do nome. Ver [[marca-tem-duas-cores]].

⚠️ **O favicon da origem nem sempre serve.** O do diariopernambucano era um
círculo azul com o nome em três linhas: vira borrão em 48px, que é a medida que o
Google lê, e repetia a lima do portal vizinho. Nesse caso o certo é vetorizar o
**símbolo do próprio logotipo**, que carrega a marca sem nenhum dos dois
problemas. Ver [[favicon-para-a-serp-do-google]].

O logotipo entra como `<img>` com `width` e `height` declarados, e a arquitetura
cai no símbolo desenhado quando o portal não tem arquivo. Ver
[[wordmark-svg-pode-faltar-letra]], que é por que não vale traçar o logotipo em
SVG à mão.
