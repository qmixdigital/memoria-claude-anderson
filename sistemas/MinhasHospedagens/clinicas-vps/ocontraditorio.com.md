# ocontraditorio.com

> **Convertido de WordPress em 16/08/2026.** Servido pelo `portal-engine` na
> **clinicas-vps**. Nao existe mais WordPress, PHP nem banco neste site.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Raiz | `/srv/portais/ocontraditorio/` |
| Vhost | `/etc/nginx/conf.d/portal-ocontraditorio.conf` |
| Arquitetura visual | **AL** (`d:\PORTAIS\OCONTRADITORIO\infrarch-AL.js`) |
| Namespace da API | **`ff05-api/v1`** (conferido ao vivo; a planilha do Antonio erra em 13 dos 20) |
| URL base | https://ocontraditorio.com |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## A conversao em numeros

| | |
|---|---:|
| Posts no WordPress de origem | 2302 |
| Publicados | **25** |
| Blocos de 410 no vhost | 230 |

O acervo ficou pequeno por tres motivos somados: trafego perto de zero no
Search Console, cerca de metade do acervo era funil de IPTV, e a regra de
**apagar artigo que chega sem imagem** (16/08/2026), que vale mesmo quando o
artigo tem link externo.

## Identidade visual

- Cor primaria **#4338ca**
- Display "Newsreader", Georgia, serif
- Corpo "Figtree", system-ui, sans-serif

Nenhum nome de classe CSS, esqueleto de elementos, fonte ou cor se repete entre
os portais da rede. Isso e medido, e nao presumido: ver `fingerprint10.js`.

## Equipe editorial

| Autor | Editorias |
|---|---|
| Heitor Vasconcellos | noticias |
| Bruna Saraiva | entretenimento |
| OlÃ­via Tostes | saude, casa |
| Waldemar Pinho | insights, marketing, negocios, empreendedorismo |

Paginas de equipe, politica editorial e uma por autor, com as travas de sempre:
sem credencial, sem travessao, sem mencao a agencia, e com a declaracao de uso
de inteligencia artificial e de ilustracao gerada por computador.

## Pendencias para a revisao de conteudo

- Conteudo novo para trafego organico ainda nao produzido. Com o acervo neste
  tamanho, e aqui que esta o proximo ganho.
- A plataforma continua entregando artigos novos, e eles chegam **sem passar
  pela esteira**: podem vir com travessao, sem titulo de busca e sem link de
  entrada. Rodar `esteira.sh ocontraditorio` de tempos em tempos resolve.
- 🔴 **WordPress de origem ainda no ar.** Entra na lista de exclusao.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Duas ilustracoes com texto embutido: 'Homenagens de 100 %' e o letreiro 'TARYIONI' no lugar de Tarantino. Ambas regeradas.
