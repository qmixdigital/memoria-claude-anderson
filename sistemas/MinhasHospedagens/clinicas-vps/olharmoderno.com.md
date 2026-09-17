# olharmoderno.com

> **Convertido de WordPress em 16/08/2026.** Servido pelo `portal-engine` na
> **clinicas-vps**. Nao existe mais WordPress, PHP nem banco neste site.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Raiz | `/srv/portais/olharmoderno/` |
| Vhost | `/etc/nginx/conf.d/portal-olharmoderno.conf` |
| Arquitetura visual | **AE** (`d:\PORTAIS\OLHARMODERNO\infrarch-AE.js`) |
| Namespace da API | **`2c71-api/v1`** (conferido ao vivo; a planilha do Antonio erra em 13 dos 20) |
| URL base | https://www.olharmoderno.com |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## A conversao em numeros

| | |
|---|---:|
| Posts no WordPress de origem | 2120 |
| Publicados | **134** |
| Blocos de 410 no vhost | 201 |

O acervo ficou pequeno por tres motivos somados: trafego perto de zero no
Search Console, cerca de metade do acervo era funil de IPTV, e a regra de
**apagar artigo que chega sem imagem** (16/08/2026), que vale mesmo quando o
artigo tem link externo.

## Identidade visual

- Cor primaria **#9f1239**
- Display "Instrument Serif", Georgia, serif
- Corpo "Work Sans", system-ui, sans-serif

Nenhum nome de classe CSS, esqueleto de elementos, fonte ou cor se repete entre
os portais da rede. Isso e medido, e nao presumido: ver `fingerprint10.js`.

## Equipe editorial

| Autor | Editorias |
|---|---|
| MarÃ­lia Vasquez | noticias |
| OtÃ¡vio Lemos | entretenimento |
| Clarice Pontes | saude, casa |
| Murilo BraganÃ§a | insights, marketing, negocios, empreendedorismo |

Paginas de equipe, politica editorial e uma por autor, com as travas de sempre:
sem credencial, sem travessao, sem mencao a agencia, e com a declaracao de uso
de inteligencia artificial e de ilustracao gerada por computador.

## Pendencias para a revisao de conteudo

- Conteudo novo para trafego organico ainda nao produzido. Com o acervo neste
  tamanho, e aqui que esta o proximo ganho.
- A plataforma continua entregando artigos novos, e eles chegam **sem passar
  pela esteira**: podem vir com travessao, sem titulo de busca e sem link de
  entrada. Rodar `esteira.sh olharmoderno` de tempos em tempos resolve.
- 🔴 **WordPress de origem ainda no ar.** Entra na lista de exclusao.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Ilustracao com 'BET DA SORTE' desenhado na tela do celular. Regerada.
- [ ] No artigo o terco esquerdo fica vazio por cerca de 990px e o bloco de metadados so aparece la embaixo, o que desloca o H1 para a direita.
- [ ] Na home a coluna da direita termina antes da esquerda e deixa cerca de 180px de branco.
- [ ] No celular a data fica na mesma linha da marca, colada nela.
