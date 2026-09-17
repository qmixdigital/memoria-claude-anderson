# Conversão total — relatório final

30 portais no ar no `clinicas-vps` (31.97.162.199), servidos pelo `portal-engine`.
Cada um com arquitetura visual própria, nomes de classe próprios, fonte, cor e
vocabulário de texto âncora exclusivos.

## Portais em produção

| Portal | URL | Arq. | Artigos | Blocos 410 |
|---|---|---|---|---|
| agencianacional | https://agencianacionaldenoticias.com | U | 60 | 38 |
| boxnoticias | https://boxnoticias.net | V | 103 | 126 |
| barranews | https://barranews.com.br | W | 171 | 188 |
| agoranoticias | https://agoranoticias.net | X | 146 | 218 |
| clickinfohub | https://clickinfohub.com | Y | 179 | 155 |
| gpnoticias | https://gpnoticias.com | Z | 203 | 183 |
| dataroomus | https://dataroomus.com | AA | 116 | 181 |
| jornalconceito | https://jornalconceito.com | AB | 86 | 222 |
| jornalacapital | https://jornalacapital.com | AC | 52 | 223 |
| jornalimigrantes | https://jornalimigrantes.com | AD | 37 | 203 |
| olharmoderno | https://www.olharmoderno.com | AE | 135 | 201 |
| portalr5 | https://portalr5.com | AF | 64 | 223 |
| noticiasdodia | https://noticiasdodia.net | AG | 68 | 218 |
| jornalistanofato | https://jornalistanofato.com | AH | 41 | 257 |
| maragoginoticias | https://maragoginoticias.com | AI | 43 | 219 |
| rsnoticias | https://rsnoticias.net | AJ | 37 | 228 |
| nodiario | https://nodiario.com | AK | 33 | 226 |
| ocontraditorio | https://ocontraditorio.com | AL | 25 | 230 |
| noticiasdojogo | https://noticiasdojogo.com | AM | 27 | 201 |
| topsulnoticias | https://topsulnoticias.com | AN | 7 | 204 |
| tempusnoticias | https://tempusnoticias.com | AO | 28 | 216 |
| semtedio | https://semtedio.com | AP | 31 | 208 |
| mgnoticias | https://mgnoticias.net | AQ | 24 | 198 |
| riachonoticias | https://riachonoticias.net | AR | 26 | 216 |
| r10noticias | https://r10noticias.com | AS | 13 | 223 |
| professortic | https://www.professortic.com | AT | 39 | 219 |
| rumourisnews | https://rumourisnews.com | AU | 7 | 189 |
| noticias9 | https://noticias9.com | AV | 222 | 20 |
| noticiasdasemana | https://noticiasdasemana.com | AW | 285 | 13 |
| noticiasdiarios | https://noticiasdiarios.com | AX | 14 | 63 |

Total: **2322 artigos** publicados.

## WordPress de origem, para deletar

Os 25 domínios abaixo já estão 100% servidos pelo motor novo e o WordPress de
origem não recebe mais tráfego. As URLs antigas que não foram reaproveitadas já
respondem 410 no servidor novo, então apagar a origem não muda nada para o Google.

### Hostinger Cloud Professional (VPS1) — `92.113.35.186` (16 sites)

- dataroomus.com
- gpnoticias.com
- jornalacapital.com
- jornalimigrantes.com
- maragoginoticias.com
- mgnoticias.net
- nodiario.com
- noticiasdiarios.com
- noticiasdodia.net
- noticiasdojogo.com
- portalr5.com
- r10noticias.com
- riachonoticias.net
- rsnoticias.net
- rumourisnews.com
- topsulnoticias.com

### Hostinger anderson.gna — `147.79.91.52` (5 sites)

- jornalistanofato.com
- olharmoderno.com
- professortic.com
- semtedio.com
- tempusnoticias.com

### servidor nao identificado na documentacao — `185.146.167.195` (2 sites)

- jornalconceito.com
- ocontraditorio.com

### VPS OpenGravity — `77.37.69.175` (2 sites)

- noticias9.com
- noticiasdasemana.com

Além desses, os 5 primeiros da rede já haviam sido convertidos antes e o
WordPress deles também pode sair: agencianacionaldenoticias.com, agoranoticias.net,
barranews.com.br, boxnoticias.net, clickinfohub.com.
## Pendências que dependem de você

### Acesso
- **Bancos órfãos** no hPanel / StackCP: as bases dos sites convertidos continuam ocupando
  espaço nas hospedagens antigas. A remoção é pelo painel, que eu não acesso.
- **Regra de redirecionamento apex → www** em `olharmoderno.com` e `professortic.com`: está
  fora da zona que meu token alcança. Enquanto isso, o `baseUrl` dos dois aponta para `www`,
  então os canônicos não caem em 301. Se você liberar, eu inverto para o apex.

### Decisão sua
- **RapidURLIndexer**: não enviei nada. A regra é só quando você pedir, no modo barato e no
  máximo 30 URLs por projeto.
- **Revisão de conteúdo**: cada portal tem, no fim da documentação dele, uma seção
  "Revisao de conteudo e layout" com o que eu já corrigi e o que ficou esperando decisão sua.

## O que foi corrigido nesta rodada, além da conversão

| Defeito | Alcance |
|---|---|
| Vocabulário de texto âncora igual em até 22 domínios | 30 portais, 360 frases exclusivas |
| Âncora repetida no corpo (uma delas 321 vezes) | 2.102 links excedentes desfeitos |
| Artigos sem nenhuma assinatura de autor | 19 portais, 1.600+ artigos |
| Um único autor assinando 100% do acervo | noticias9 e noticiasdasemana |
| Linha fina repetida palavra por palavra no corpo | 1.410 artigos, 27 portais |
| Três blocos de "leia também" no mesmo artigo | 724 artigos |
| Classe CSS literal compartilhada (`lt-bloco`, `cp`) | rede inteira, agora zero |
| Links internos apontando para artigo apagado | 579 links |
| Manchete em inglês em portal pt-BR | 37 manchetes |
| Legenda com alt em inglês ou nome de arquivo | 18 legendas |
| Imagem de IA com texto embutido | 17 imagens regeradas |
| Título acima de 60 caracteres | 1.077 corrigidos, agora zero |
| Home mostrando parte do acervo por vitrine mal configurada | 9 portais |
| Link para propriedade do dono no conteúdo | 1 artigo (regex antigo não pegava "qmiximoveis") |

## Hostverge — dados para a exclusão

Identificado pelo DNS reverso `185-146-167-195.ptr4.stackcp.net` e confirmado por SSH.
Acesso pelo jump do OpenGravity, como está no README da hostverge.

| Site | Caminho | Banco | Host do banco | Tamanho |
|---|---|---|---|---|
| jornalconceito.com | `/home/sites/18a/7/7672b9147f/public_html/jornalconceito.com` | `wordpress-35303936f534` | `sdb-84.hosting.stackcp.net` | 635 MB |
| ocontraditorio.com | `/home/sites/18a/7/7672b9147f/public_html/ocontraditorio.com` | `wordpress-353130301810` | `sdb-86.hosting.stackcp.net` | 739 MB |

São 1,4 GB de arquivos mais dois bancos. A pasta eu apago por SSH quando você mandar; o
banco sai pelo StackCP, que é painel e eu não acesso.
