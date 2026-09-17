# rumourisnews.com

> **Convertido de WordPress em 16/08/2026.** Servido pelo `portal-engine` na
> **clinicas-vps**. Nao existe mais WordPress, PHP nem banco neste site.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Raiz | `/srv/portais/rumourisnews/` |
| Vhost | `/etc/nginx/conf.d/portal-rumourisnews.conf` |
| Arquitetura visual | **AU** (`d:\PORTAIS\RUMOURISNEWS\infrarch-AU.js`) |
| Namespace da API | **`arfa-api/v1`** (conferido ao vivo; a planilha do Antonio erra em 13 dos 20) |
| URL base | https://rumourisnews.com |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## A conversao em numeros

| | |
|---|---:|
| Posts no WordPress de origem | 1872 |
| Publicados | **7** |
| Blocos de 410 no vhost | 189 |

O acervo ficou pequeno por tres motivos somados: trafego perto de zero no
Search Console, cerca de metade do acervo era funil de IPTV, e a regra de
**apagar artigo que chega sem imagem** (16/08/2026), que vale mesmo quando o
artigo tem link externo.

## Identidade visual

- Cor primaria **#57534e**
- Display "Lora", Georgia, serif
- Corpo "Jost", system-ui, sans-serif

Nenhum nome de classe CSS, esqueleto de elementos, fonte ou cor se repete entre
os portais da rede. Isso e medido, e nao presumido: ver `fingerprint10.js`.

## Equipe editorial

| Autor | Editorias |
|---|---|
| Ariovaldo Nunes | noticias |
| Melina Fraga | entretenimento |
| SÃ´nia Quadros | saude, casa |
| Leandro Vidigal | insights, marketing, negocios, empreendedorismo |

Paginas de equipe, politica editorial e uma por autor, com as travas de sempre:
sem credencial, sem travessao, sem mencao a agencia, e com a declaracao de uso
de inteligencia artificial e de ilustracao gerada por computador.

## Pendencias para a revisao de conteudo

- Conteudo novo para trafego organico ainda nao produzido. Com o acervo neste
  tamanho, e aqui que esta o proximo ganho.
- A plataforma continua entregando artigos novos, e eles chegam **sem passar
  pela esteira**: podem vir com travessao, sem titulo de busca e sem link de
  entrada. Rodar `esteira.sh rumourisnews` de tempos em tempos resolve.
- 🔴 **WordPress de origem ainda no ar.** Entra na lista de exclusao.
