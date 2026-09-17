# noticiasdodia.net

> **Convertido de WordPress em 16/08/2026.** Servido pelo `portal-engine` na
> **clinicas-vps**. Nao existe mais WordPress, PHP nem banco neste site.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Raiz | `/srv/portais/noticiasdodia/` |
| Vhost | `/etc/nginx/conf.d/portal-noticiasdodia.conf` |
| Arquitetura visual | **AG** (`d:\PORTAIS\NOTICIASDODIA\infrarch-AG.js`) |
| Namespace da API | **`f889-api/v1`** (conferido ao vivo; a planilha do Antonio erra em 13 dos 20) |
| URL base | https://noticiasdodia.net |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## A conversao em numeros

| | |
|---|---:|
| Posts no WordPress de origem | 2226 |
| Publicados | **67** |
| Blocos de 410 no vhost | 218 |

O acervo ficou pequeno por tres motivos somados: trafego perto de zero no
Search Console, cerca de metade do acervo era funil de IPTV, e a regra de
**apagar artigo que chega sem imagem** (16/08/2026), que vale mesmo quando o
artigo tem link externo.

## Identidade visual

- Cor primaria **#4d7c0f**
- Display "Saira Condensed", Impact, sans-serif
- Corpo "Nunito Sans", system-ui, sans-serif

Nenhum nome de classe CSS, esqueleto de elementos, fonte ou cor se repete entre
os portais da rede. Isso e medido, e nao presumido: ver `fingerprint10.js`.

## Equipe editorial

| Autor | Editorias |
|---|---|
| Teodoro Albuquerque | noticias |
| Rosana Figueira | entretenimento |
| Gilmar Peixoto | saude, casa |
| NoÃªmia Rangel | insights, marketing, negocios, empreendedorismo |

Paginas de equipe, politica editorial e uma por autor, com as travas de sempre:
sem credencial, sem travessao, sem mencao a agencia, e com a declaracao de uso
de inteligencia artificial e de ilustracao gerada por computador.

## Pendencias para a revisao de conteudo

- Conteudo novo para trafego organico ainda nao produzido. Com o acervo neste
  tamanho, e aqui que esta o proximo ganho.
- A plataforma continua entregando artigos novos, e eles chegam **sem passar
  pela esteira**: podem vir com travessao, sem titulo de busca e sem link de
  entrada. Rodar `esteira.sh noticiasdodia` de tempos em tempos resolve.
- 🔴 **WordPress de origem ainda no ar.** Entra na lista de exclusao.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [ ] A secao 'A hora de hoje' exibe horarios fora de ordem (05:05, 07:19, 10:22, 09:57...) como elemento mais forte da pagina, enquanto a lista esta ordenada por data.
- [ ] Na assinatura do artigo a editoria aparece duas vezes em quatro linhas de distancia.
- [ ] Os numeradores de secao estao em verde muito claro sobre fundo creme, contraste abaixo de 4.5:1.
