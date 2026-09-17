# noticiasagoras.com

> **Convertido de WordPress em 16/08/2026.** Servido pelo `portal-engine` na
> **clinicas-vps**. Nao existe mais WordPress, PHP nem banco neste site.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Raiz | `/srv/portais/noticiasagoras/` |
| Vhost | `/etc/nginx/conf.d/portal-noticiasagoras.conf` |
| Arquitetura visual | **BA** (`d:\PORTAIS\NOTICIASAGORAS\infrarch-BA.js`) |
| Namespace da API | **`297a-api/v1`** (conferido ao vivo; a planilha do Antonio erra em 13 dos 20) |
| URL base | https://noticiasagoras.com |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## A conversao em numeros

| | |
|---|---:|
| Posts no WordPress de origem | 2299 |
| Publicados | **47** |
| Blocos de 410 no vhost | 228 |

O acervo ficou pequeno por tres motivos somados: trafego perto de zero no
Search Console, cerca de metade do acervo era funil de IPTV, e a regra de
**apagar artigo que chega sem imagem** (16/08/2026), que vale mesmo quando o
artigo tem link externo.

## Identidade visual

- Cor primaria **#b91c1c**
- Display "Bevan", Impact, serif
- Corpo "Readex Pro", system-ui, sans-serif

Nenhum nome de classe CSS, esqueleto de elementos, fonte ou cor se repete entre
os portais da rede. Isso e medido, e nao presumido: ver `fingerprint10.js`.

## Equipe editorial

| Autor | Editorias |
|---|---|
| Fausto Camargo Neto | noticias |
| Iolanda Rezende | entretenimento |
| HermÃ­nio Basto | saude, casa |
| Sueli Trindade | insights, geral, marketing, negocios, empreendedorismo |

Paginas de equipe, politica editorial e uma por autor, com as travas de sempre:
sem credencial, sem travessao, sem mencao a agencia, e com a declaracao de uso
de inteligencia artificial e de ilustracao gerada por computador.

## Pendencias para a revisao de conteudo

- Conteudo novo para trafego organico ainda nao produzido. Com o acervo neste
  tamanho, e aqui que esta o proximo ganho.
- A plataforma continua entregando artigos novos, e eles chegam **sem passar
  pela esteira**: podem vir com travessao, sem titulo de busca e sem link de
  entrada. Rodar `esteira.sh noticiasagoras` de tempos em tempos resolve.
- 🔴 **WordPress de origem ainda no ar.** Entra na lista de exclusao.

## Search Console

| | |
|---|---|
| Propriedade | `sc-domain:noticiasagoras.com` |
| Conta Google | **u/9** |
| Desempenho | https://search.google.com/u/9/search-console/performance/search-analytics?resource_id=sc-domain%3Anoticiasagoras.com |
| Usuarios | https://search.google.com/u/9/search-console/users?resource_id=sc-domain%3Anoticiasagoras.com |

Entrar pela conta errada mostra a propriedade como inexistente.

## Revisao de conteudo e layout

Levantado na conversao. O que esta marcado ja esta no ar; o resto depende de decisao sua.

- [x] Poda aplicada: dos 2299 posts da origem, 44 foram selecionados por backlink de cliente
- [x] Vocabulario de ancora exclusivo deste portal, 12 frases que nenhum outro usa
- [x] Assinatura distribuida entre os quatro nomes da redacao, nenhum autor sem artigo
- [x] Pacote editorial no ar: equipe, politica editorial e contato
- [ ] **44 artigos apagados por nao ter imagem nenhuma** (nem destacada, nem no corpo).
      Destes, **4 carregavam backlink de cliente** e **41 tinham impressao no Google**.
      A regra da casa manda apagar mesmo com link externo, e foi o que fiz. O WordPress
      de origem esta intacto, entao da para reverter: basta reimportar o slug e tirar a
      linha dele do bloco de 410 no vhost.

      Os que tinham backlink: ao-vivo-semifinal-do-campeonato-paraense-paysandu-x-castanhal, brandon-moreno-predestinado-com-kavanagh-antes-do-ufc-mexico-city, horoscopo-2026-previsao-do-dia-2-3-para-todos-os-signos, uma-thurman-em-pretty-lethal-luta-sanguinaria-de-bailarinas-no-prime-video
