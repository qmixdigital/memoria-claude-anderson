# jornalacapital.com

> **Convertido de WordPress em 16/08/2026.** Saiu da **Hostinger VPS1** e virou
> site estatico servido pelo `portal-engine` na **clinicas-vps**.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Raiz | `/srv/portais/jornalacapital/` |
| Vhost | `/etc/nginx/conf.d/portal-jornalacapital.conf` |
| Arquitetura visual | **AC** (`d:\PORTAIS\JORNALACAPITAL\infrarch-AC.js`) |
| Namespace da API | **`a9df-api/v1`** |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contador de acesso | `/e57a2b9c14.js` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## A conversao em numeros

| | |
|---|---:|
| Posts no WordPress de origem | 2259 |
| Publicados | **51** |
| Blocos de 410 no vhost | 223 |

O acervo ficou pequeno por tres motivos somados: tráfego perto de zero no
Search Console, cerca de metade do acervo era funil de IPTV, e a **regra nova
de 16/08/2026** manda **apagar artigo que chega sem imagem**, mesmo com link
externo, em vez de gerar ilustracao. So por essa regra sairam dezenas de
artigos aqui.

## Identidade visual

- **Conceito:** jornal de capital: institucional e sobrio, feito para politica, economia e cidade
- **Tipografia:** Petrona com Barlow
- **Cor:** vinho #7f1d1d sobre papel #faf9f7
- **Forma:** canto de 6px com sombra sutil

## Equipe editorial

| Autor | Editoria |
|---|---|
| Roberta Villaca | Noticias e cidade |
| Anselmo Prado | Entretenimento e cultura |
| Regina Dourado | Saude e casa |
| Fernando Quirino | Economia, negocios e analise |

Paginas de equipe, politica editorial e quatro de autor, com as travas de
sempre: sem credencial, sem travessao, sem mencao a agencia, e com a declaracao
de uso de inteligencia artificial e de ilustracao gerada por computador.

## Pendencias

- 🔴 **Virada de DNS ainda nao feita.**
- 🔴 **WordPress de origem ainda no ar** na `hostinger-vps1`.
- Conteudo novo para trafego organico ainda nao produzido. Com o acervo neste
  tamanho, e aqui que esta o proximo ganho.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [ ] O hero e imagem de largura total com o titulo em caixa escura sobreposta, enquanto o resto da pagina fica num conteiner de 1200px. O texto esta a esquerda, entao nao e o hero centralizado que a regra proibe, mas o alinhamento com o resto da pagina se perde.
- [ ] No artigo o corpo tem 756px e o bloco 'Leia tambem' abre para 1120px: a borda esquerda nao alinha com nada acima.
- [ ] No celular a manchete rotativa do topo vira tres linhas de texto corrido, sem estilo de ticker.
