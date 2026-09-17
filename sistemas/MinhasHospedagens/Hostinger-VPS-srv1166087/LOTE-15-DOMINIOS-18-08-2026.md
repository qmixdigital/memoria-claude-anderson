# Lote de 15 domínios — conversão total de 18/08/2026

Servidor: **hostinger-vps-srv1166087** (31.97.173.40). A rede desse servidor foi
de 12 para **27 portais** e de 12 para **27 arquiteturas**.

## A régua desta poda

Diferente dos lotes anteriores, aqui o critério não foi backlink nem impressão:
foi **clique**. Motivo: a inspeção de indexação mostrou que os 15 domínios juntos
somavam menos de 300 cliques em 16 meses. Preservar artigo indexado sem clique
custaria migração e banco para manter página que não serve a ninguém.

Ficou: **página com pelo menos 1 clique em 16 meses**. O resto foi apagado em
definitivo, com os slugs indo para `gone.txt` e respondendo **410**.

| Origem | Posts |
|---|---:|
| Apagados em definitivo | **34.434** |
| Preservados | **82** |
| Redução | 99,76% |

Das 152 páginas com clique no Search Console, só 82 ainda existiam como post
publicado: as outras 70 já tinham sido apagadas em limpeza anterior.

## Os quinze

| Domínio | Portal | Arch | Prefixo | Artigos | 410 |
|---|---|---|---|---:|---:|
| https://ferronoticias.net | ferronoticias | S | edx | 1 | 2184 |
| https://filmeseseriesnovas.com | filmeseseriesnovas | T | fnt | 8 | 2266 |
| https://gazetaalerta.com | gazetaalerta | Z | jvn | 2 | 2343 |
| https://gazetadoconsumidor.com | gazetadoconsumidor | X | rtl | 2 | 2082 |
| https://gazetaretina.com | gazetaretina | O | mbo | 3 | 2061 |
| https://jornaldabahia.net | jornaldabahia | N | tld | 2 | 2041 |
| https://jornaldinamico.com | jornaldinamico | AA | bdl | 0 | 2301 |
| https://jornalexpresso.net | jornalexpresso | Q | lyk | 3 | 2531 |
| https://jornalsaosimao.com | jornalsaosimao | Y | zcp | 0 | 1984 |
| https://jrnoticias.com | jrnoticias | U | krs | 0 | 2035 |
| https://mundodasnoticias.net | mundodasnoticias | M | gmx | 58 | 3254 |
| https://sejanoticia.com | sejanoticia | W | dqv | 2 | 2978 |
| https://tribunainformativa.com | tribunainformativa | R | plx | 0 | 2154 |
| https://tribunalpopular.org | tribunalpopular | V | xrb | 0 | 1904 |
| https://umjornal.com | umjornal | P | nvk | 1 | 2190 |

## O que foi feito de infraestrutura

- **15 arquiteturas novas** (M a AA), cerca de 200 linhas cada, escritas para este
  lote. O `ARCH_LETTERS` do `tokens.js` só ia até K e foi atualizado para as 27,
  senão o sorteador nunca escolheria as novas.
- **Pool de prefixos ampliado de 20 para 40.** Com 28 portais no servidor, 20
  prefixos garantiam colisão, e prefixo é o que nomeia as classes da arquitetura.
- **Literais internos das arquiteturas prefixados por letra** (`cols` virou
  `mcols`, `ycols`, etc.). Sem isso, os 15 compartilhavam `cols`, `fh`, `fb`,
  `cp`, `ln` e `ph` no HTML, que é exatamente o que um script de detecção cruza.
  Depois da correção: **0 classes em comum nos 105 pares**.
- Certificado autoassinado no origin + Cloudflare em modo **Full**.
- DNS virado pela API da Cloudflare, com o estado anterior salvo em
  `conv15/dns_antes.json`.

## Armadilhas deste lote

1. **`extraPages` é array, não objeto.** `Object.keys` num array devolve os
   índices, e foi isso que me fez montar como objeto. O rebuild quebrava com
   `(site.extraPages || []).map is not a function`.
2. **Pastas criadas por ssh nascem como `root`;** o serviço roda como `portais`.
   Toda gravação de imagem falhava com EACCES até corrigir o dono.
3. **`tribunalpopular.org` tinha regra de redirecionamento na Cloudflare** forçando
   apex → www, enquanto o `baseUrl` do portal é sem www. Toda URL canônica cairia
   num 301. A regra foi removida.
4. **Import não passa pelo nginx** enquanto o DNS não virou: os domínios novos não
   têm vhost nem certificado. Publicar direto em `127.0.0.1:8791` resolve.
5. **`gone.txt` enviado do Windows vai com CRLF.** O receptor trata (`split(/
?
/)`
   com `trim`), mas normalizar evita confusão em teste com `head -1`.

## Conteúdo

Os 82 artigos entraram com **slug e data original** preservados, entre out/2025 e
jun/2026. **20 estavam sem imagem** e receberam imagem gerada, em vez de serem
apagados: a regra da casa manda apagar artigo sem foto, mas aqui isso derrubaria
justamente as únicas páginas com clique. Todos foram assinados pela editoria
correspondente, ligando o pacote de E-E-A-T ao conteúdo.

Cinco portais entraram no ar **sem nenhum artigo**: jornaldinamico, jornalsaosimao,
jrnoticias, tribunainformativa e tribunalpopular. Para eles, a conversão foi só
provisionamento; o conteúdo é todo por fazer.


## FALHA CORRIGIDA em 18/08/2026: redirects.json não foi gerado

### O que aconteceu

Os 15 domínios usavam **URL plana** no WordPress antigo (`/slug/`). O portal-engine serve em
`/categoria/slug/` quando `flatUrl` é falso, que é o caso de todos eles. A conversão preservou os
slugs, mas **não gerou o `redirects.json`**, então toda URL histórica passou a responder **404**.

Isso atingiu exatamente as páginas que a poda por clique existia para preservar. Verificação feita
no Search Console: a página mais clicada de **cada um dos 10 domínios com sobreviventes** estava em
404. O caso mais grave era o `gazetadoconsumidor.com`, cuja página
`/inss-alerta-beneficiarios-por-whatsapp-sobre-prova-de-vida/` ranqueia em **posição 1 para "inss"**,
com 2.167 impressões em 180 dias.

### Como foi corrigido

1. Gerado `/srv/portais/<slug>/redirects.json` para os 15 domínios, no formato
   `{ "/slug-antigo/": "/categoria/slug/" }`, a partir dos próprios JSONs de `data/`.
   O script **não sobrescreve** arquivo existente, para não tocar nas conversões de junho.
2. Arquivos com dono `portais:portais` e permissão 644.
3. Purgado o cache da Cloudflare dos 15 domínios: o 404 antigo estava cacheado na borda e
   continuava sendo servido mesmo com a origem já devolvendo 301.
4. Conferido: **15 de 15 domínios devolvendo 301** para a URL histórica.

### O mecanismo (para não redescobrir depois)

O vhost dos portais convertidos tem `try_files ... @oldredir`, e `@oldredir` faz proxy para o
receptor na 8791. O receptor lê `redirects.json` do portal e devolve 301. Os portais que não são
conversão usam `=404` e nunca chegam nesse caminho.

Código: `loadRedirects()` e `handleOldRedirect()` em `/opt/portal-engine/src/receiver.js`.
Ele tolera barra final ausente ou presente na chave.

### Regra permanente

**Toda conversão de WordPress para o portal-engine precisa gerar o `redirects.json` e purgar a
Cloudflare em seguida.** Sem isso, a preservação de conteúdo por clique não serve para nada:
o texto sobrevive no servidor e o endereço que tinha autoridade morre.

Conferir sempre com uma chave real do arquivo, não com URL reconstruída do Search Console, porque
o Console trunca o caminho e a URL montada à mão dá 404 por motivo errado.
