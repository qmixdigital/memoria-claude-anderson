# Marcas dos portais

Os arquivos de logotipo e os ícones em vetor dos portais que têm marca própria,
resgatada do WordPress da origem.

⚠️ **Por que a cópia mora aqui.** O logotipo vive em
`/srv/portais/<slug>/public/img/_marca.webp` no servidor, e um `rm -rf public/*/`
de reimportação leva a pasta `img/` junto. Sem esta cópia a marca se perderia e
o portal voltaria ao símbolo genérico da arquitetura sem ninguém notar.

| arquivo | onde vai |
|---|---|
| `<slug>-_marca.webp` | `/srv/portais/<slug>/public/img/_marca.webp`, o cabeçalho |
| `<slug>-_marca-branca.webp` | `/srv/portais/<slug>/public/img/_marca-branca.webp`, o rodapé escuro |
| `<slug>-icone.svg` | o campo `iconSvg` do `sites.json`, de onde o motor gera as sete medidas de PNG e o `.ico` |

Campos no `sites.json`: `logoImg`, `logoImgDark`, `logoW`, `logoH`, `iconSvg`.

`icones.py` desenha os dois ícones. `monta_logos.py` prepara os WebP, inclusive a
versão clara do Diário Pernambucano, que a origem não tinha: ela sai trocando
**só o grafite por branco**, porque pintar tudo de branco apagaria a metade
carmim do nome.

## As paletas, tiradas dos pixels

| portal | cores | de onde |
|---|---|---|
| folhadonoroeste | marinho `#012552` + lima `#E1FC00` | do favicon de rosa dos ventos |
| diariopernambucano | carmim `#DA3444` + grafite `#1E1F23` | do logotipo, 51% e 44% dos pixels |

⚠️ A lima dá **1,16:1** sobre branco: é cor de bloco e filete, e só vira texto
sobre o marinho, onde dá 13,1:1. A arquitetura AK tem um `--tinta` separado para
chapéu sobre papel.
