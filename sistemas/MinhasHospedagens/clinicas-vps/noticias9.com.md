# noticias9.com

> **Convertido de WordPress em 16/08/2026.** Servido pelo `portal-engine` na
> **clinicas-vps**. Nao existe mais WordPress, PHP nem banco neste site.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Raiz | `/srv/portais/noticias9/` |
| Vhost | `/etc/nginx/conf.d/portal-noticias9.conf` |
| Arquitetura visual | **AV** (`d:\PORTAIS\NOTICIAS9\infrarch-AV.js`) |
| Namespace da API | **`zdln-api/v1`** (conferido ao vivo; a planilha do Antonio erra em 13 dos 20) |
| URL base | https://noticias9.com |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## A conversao em numeros

| | |
|---|---:|
| Posts no WordPress de origem | 393 |
| Publicados | **222** |
| Blocos de 410 no vhost | 20 |

O acervo ficou pequeno por tres motivos somados: trafego perto de zero no
Search Console, cerca de metade do acervo era funil de IPTV, e a regra de
**apagar artigo que chega sem imagem** (16/08/2026), que vale mesmo quando o
artigo tem link externo.

## Identidade visual

- Cor primaria **#0d9488**
- Display "Domine", Georgia, serif
- Corpo "Hanken Grotesk", system-ui, sans-serif

Nenhum nome de classe CSS, esqueleto de elementos, fonte ou cor se repete entre
os portais da rede. Isso e medido, e nao presumido: ver `fingerprint10.js`.

## Equipe editorial

| Autor | Editorias |
|---|---|
| Hamilton Veloso | noticias |
| Rejane Prata | entretenimento |
| Dulce Arantes | saude, casa |
| OtacÃ­lio Bastos | insights, marketing, negocios, empreendedorismo |

Paginas de equipe, politica editorial e uma por autor, com as travas de sempre:
sem credencial, sem travessao, sem mencao a agencia, e com a declaracao de uso
de inteligencia artificial e de ilustracao gerada por computador.

## Pendencias para a revisao de conteudo

- Conteudo novo para trafego organico ainda nao produzido. Com o acervo neste
  tamanho, e aqui que esta o proximo ganho.
- A plataforma continua entregando artigos novos, e eles chegam **sem passar
  pela esteira**: podem vir com travessao, sem titulo de busca e sem link de
  entrada. Rodar `esteira.sh noticias9` de tempos em tempos resolve.
- 🔴 **WordPress de origem ainda no ar.** Entra na lista de exclusao.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Bloco de compartilhar aparecia duas vezes no artigo, o segundo sem estilo. Unificado.
- [x] Ancora 'insights' repetida 321 vezes apontando para a mesma categoria. Reduzida a um link por artigo, com vocabulario proprio do portal.
- [x] 53 links internos apontavam para artigos apagados pela regra de imagem. Desfeitos.
- [ ] 169 dos 393 artigos de origem foram apagados por nao ter imagem. Se algum deles tinha backlink de cliente, precisa ser reescrito com imagem propria.
