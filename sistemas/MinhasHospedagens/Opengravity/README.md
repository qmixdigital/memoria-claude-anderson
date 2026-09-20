# Opengravity (77.37.69.175)

Acesso: `ssh opengravity`. Motor em `/opt/portal-engine`, conteudo em
`/srv/portais/<slug>`, servico `portal-engine` rodando como usuario `portais`.

## Portais (40)

wtw19.com.br, girodasnoticias.com, jornaldebarcelos.com, nerddahora.com,
noticiasgoias.com, osertaoenoticia.com, portalnoticiasbh.com, blogse.com.br,
euvo.com.br, qmixdigital.com.br, adonline.com.br, viajenodetalhe.com.br,
advivo.com.br, azulmagazine.com.br, cameracotidiana.com.br, curiosododia.com.br,
ebookcult.com.br, revistadeducao.com.br, sabedoriaglobal.com.br,
exquisito.com.br, desassossegada.com.br, oiempreendedores.com.br,
jornaldobairroalto.com.br, folhadonoroeste.com.br,
diariopernambucano.com.br, df8.com.br,
divirto.com.br, incast.com.br,
opopularjornal.com.br, revistarumo.com.br,
universoneo.com.br, pontonaturalbrasil.com.br,
folhar.com.br, publisherbrasil.com.br, saberdefato.com.br

> **wtw19 e o unico portal da rede onde IPTV e legitimo.** Em qualquer outro,
> mencao a IPTV e enxerto de afiliado e deve ser podada.


## Cinco portais de saude, convertidos em 24/08/2026

Vieram do `hostverge` (quatro) e do `hostinger-vps1` (um), pela skill
`conversao-parcial-com-backlinks`. Somam **903 artigos preservados** de 3.052
inventariados.

| dominio | arch | prefixo | artigos | URL do artigo | listagem | canonico |
|---|---|---|---:|---|---|---|
| saudeacessivel.com.br | AW | `sac` | 265 | `/<editoria>/<slug>/` | `/category/<slug>/` | apex |
| saudicas.com.br | AX | `sdc` | 195 | `/<editoria>/<slug>/` | `/category/<slug>/` | apex |
| saudeemalta.net.br | AY | `sem` | 252 | `/<slug>/` | `/categoria/<slug>/` | apex |
| revistatopsaude.com.br | AZ | `rts` | 146 | `/<editoria>/<slug>/` | `/category/<slug>/` | apex |
| matogrossosaude.com.br | BA | `mgs` | 45 | `/<slug>/` | `/categoria/<slug>/` | **www** |

🔴 **Tres deles servem a listagem em `/category/`, em INGLES.** O `category_base`
da origem estava **vazio**, e no WordPress vazio significa `category`. Os outros
dois usam `/categoria/`. Copiar a configuracao de um para o outro poe a editoria
inteira em 404.

🔴 **O matogrossosaude e canonico no `www`**, ao contrario de todos os outros
portais da rede: quem redireciona ali e o apex. E o `if` que faz esse
redirecionamento roda **antes** de o nginx escolher a location, entao ele precisa
liberar o caminho do ACME numa variavel, senao a emissao do certificado falha
para o nome do apex.

🔴 **O acervo do matogrossosaude tinha sido apagado na origem.** Das 47 paginas
com clique no Search Console, 46 respondiam 404 e levavam 303 dos 304 cliques do
site. Foram recuperadas 44 do backup de 23/04/2026 em
`D:\SISTEMAS\MinhasHospedagensackups\h-vps1\`.

⚠️ **As assinaturas foram trocadas de proposito.** Os quatro da hostverge
assinavam todo o acervo com os mesmos dois nomes, o que e impressao digital de
rede. O mapeamento artigo/autor foi mantido; so os nomes mudaram, e cada portal
tem os seus.

⚠️ **Nenhum dos cinco tinha AdSense** na origem: nao ha receita a atravessar, e
eles nasceram sem os campos.

Relato completo em `D:\PORTAIS\CONVERSAO-SAUDE-5-PORTAIS.md`.

## Auditoria do pacote editorial

`audita_editorial.py` roda no servidor e imprime uma linha por portal com:
quem-somos, equipe, politica editorial, paginas de autor, avatar, og:image na
home, banner LGPD, `rel="author"` nos artigos, `ProfilePage` no schema e
travessao na pagina de contato.

```bash
scp audita_editorial.py opengravity:/tmp/
ssh opengravity "python3 /tmp/audita_editorial.py"
```

## Correcoes aplicadas em 19/08/2026

1. **og:image na home e nas listas.** O `homeMeta` e o `listMeta` tinham
   `image: null`, entao a home compartilhada saia sem miniatura.
2. **`ProfilePage` + `Person` + `worksFor`** nas paginas de autor.
3. **Avatar no topo da pagina de autor**, lido de `/img/autores/<slug>.webp`.
4. **154 artigos** assinados com o nome do portal foram reatribuidos a assinatura
   da editoria, entao agora nenhum artigo fica sem `rel="author"`.
5. **Formulario de contato:** acento quebrado na fronteira de chunk, `replyTo`
   faltando na chamada do Resend e travessao no assunto do e-mail.

## Armadilhas desta maquina

- A variavel da home no `rebuildIndexes` se chama **`homeFallback`**, e nao
  `arts` como nos outros motores. Patch por texto exato quebra aqui.
- O `public/` do **girodasnoticias** estava com dono `root` e o rebuild falhava
  com EACCES. Corrigir com `chown -R portais:portais /srv/portais/<slug>/public`.
- Nao ha nginx em `sites-enabled` nem servidor em `127.0.0.1:80`, entao teste de
  origem por `curl -H Host:` nao funciona aqui: conferir pelo dominio publico.

## Quem Somos: os 16 portais tem texto proprio (22/08/2026)

O motor tem um texto de reserva para essa pagina e ele e **identico em todo
portal que nao preenche o campo**. O campo e **`site.about`** no `sites.json`,
existe desde sempre e nunca era preenchido nas conversoes.

Os 16 daqui foram escritos um a um, cada um citando as editorias e as
assinaturas que existem naquele acervo, e linkando para `/equipe/`,
`/politica-editorial/` e `/contato/`.

⚠️ **Faltam 29 dos 34 da clinicas-vps e 22 dos 28 da hostinger.** Para achar:

```bash
python3 -c "
import json
c=json.load(open('/opt/portal-engine/sites.json'))
print([s['slug'] for s in c['sites'] if not s.get('about')])"
```

⚠️ Trocar um texto igual por N parecidos nao resolve. A conferencia que fecha e
mecanica: nenhum trecho de 40 caracteres repetido entre dois portais e nenhum
titulo de secao igual, como `assert` antes de gravar. Ela reprovou a primeira
versao em tres dos sete.

## blogse.com.br (Blog-Se), migrado em 19/08/2026

Conversão parcial com backlinks, vindo da Hostinger `anderson.gna`. Arquitetura U,
`flatUrl: true`, apex sem www. Poda deixou 588 de 2.766 artigos publicados: sobrou
só o que tem backlink de cliente ou clique no Search Console.

- vhost: `/etc/nginx/conf.d/portal-blogse.conf`
- 410 dos 2.172 slugs apagados: `/etc/nginx/gone/blogse.conf`
- recebimento do Antônio inalterado: ns `a9cd-api/v1`, mesma apikey, mesmo endpoint
- inventário da poda em `D:\PORTAIS\BLOGSE\inventario`
- o WordPress antigo continua na Hostinger, com o acervo já podado

## euvo.com.br (EUVO News), migrado em 20/08/2026

Conversao parcial com backlinks, vindo da Hostinger `hostinger-vps1`. Arquitetura
**V** (PAINEL), `flatUrl: true`, apex sem www. Poda deixou **311 de 4.669**: so o
que tem backlink de cliente ou clique no Search Console. Link para veiculo de
imprensa **nao** conta como backlink de cliente, por decisao do Anderson.

- vhost: `/etc/nginx/conf.d/portal-euvo.conf`, certificado **Let's Encrypt**
  (`/etc/letsencrypt/live/euvo.com.br/`), renovacao por webroot em `/var/www/acme`
- 410 dos 4.354 slugs apagados: `/etc/nginx/gone/euvo.conf`, 436 blocos de regex
- tres assinaturas: Gean Oliveira (cultura), Vitor Anhaia (servico e negocios,
  tambem o padrao) e Cleide Sarmento (shows e eventos)
- Search Console: os 16 sitemaps do WordPress foram removidos, ficou so
  `https://euvo.com.br/sitemap.xml`
- inventario da poda em `D:\PORTAIS\EUVO\inventario`
- o WordPress antigo continua na `hostinger-vps1`, aguardando ordem de apagar

### A zona esta em Full (strict)

Virar o DNS com certificado auto-assinado na origem derruba o site com 526. A
sequencia que funciona: baixar a zona para `full`, virar o A, emitir o Let's
Encrypt por webroot, apontar o vhost, e so entao voltar para `strict`.

## adonline.com.br (AdOnline), migrado em 20/08/2026

Conversao parcial com backlinks. Runbook completo em
`D:\PORTAIS\ADONLINE\CONVERSAO.md`.

- 688 artigos preservados, 720 paginas, 691 imagens, 17 editorias, 5 autores
- arquitetura **X** ("PAINEL"), exclusiva deste portal, com classes hasheadas
- `flatUrl: true`: o WordPress servia `/slug/` e nenhuma URL podia mudar
- vhost: `/etc/nginx/conf.d/portal-adonline.conf`, certificado **Let's Encrypt**
  (`/etc/letsencrypt/live/adonline.com.br/`), valido ate 18/11/2026, renovacao
  por webroot em `/var/www/acme`
- 410 dos 3.509 slugs podados: `/etc/nginx/gone/adonline.conf`, 351 blocos
- zona da Cloudflare `ef5c8c46746d9fceeaaa2448e0db1732`, em **Full (strict)**
- recebimento da plataforma do Antonio no namespace **`fad0-api`**, testado no ar
- contato entrega em `gisellewagnerofc@gmail.com`, testado de ponta a ponta
- AdSense ligado, `pub-3880875536722698`
- o mapa do site deste portal e **`/navegacao/`**, e nao `/todos-os-artigos/`:
  o slug sai de um hash do nome do portal e muda de um para outro
- **o WordPress antigo ainda esta de pe**

## viajenodetalhe.com.br (Viaje no Detalhe), convertido em 21/08/2026

Conversao parcial com backlinks. Runbook completo em
`D:\PORTAIS\VIAJENODETALHE\CONVERSAO.md`.

- 211 artigos preservados de 1.590, 236 paginas, 226 imagens, 13 editorias,
  3 assinaturas (no WordPress 209 dos 211 tinham a mesma, o que nao sustenta autoria)
- arquitetura **Y** ("REVISTA DE BORDO"), exclusiva deste portal, classes hasheadas
- `flatUrl: false` e **sem `categoryBase`**: o WordPress servia `/<editoria>/<slug>/`
  e o motor reproduz exatamente esse formato
- vhost: `/etc/nginx/conf.d/portal-viajenodetalhe.conf`, **etapa 2, HTTPS**,
  certificado Let's Encrypt (`/etc/letsencrypt/live/viajenodetalhe.com.br/`),
  valido ate 19/11/2026, renovacao por webroot em `/var/www/acme`
- 410 dos 1.374 slugs podados: `/etc/nginx/gone/viajenodetalhe.conf`, 138 blocos
- zona da Cloudflare `6a84252bd9b5c1b2f5c76fab5c9cd5a8`, em **Full (strict)**
- recebimento do Antonio no namespace **`ivgm-api/v1`**, testado no ar de ponta a ponta,
  inclusive com categoria vindo como numero
- contato entrega em `gisellewagnerofc@gmail.com`, testado
- AdSense ligado, `pub-3880875536722698`
- Search Console: a propriedade existe **so** na chave `backlinkguard-google-sa.json`
- o mapa do site deste portal e **`/indice-de-artigos/`**
- **virado em 21/08/2026**, de 185.146.167.195 para 77.37.69.175. Search Console
  com 2 sitemaps do motor e os 3 do Yoast removidos. **O WordPress antigo ainda
  esta de pe.**

## Sitemap do Yoast: o 410 nao pegava `<tipo>-sitemap.xml` (22/08/2026)

A regra de 410 cobria `wp-sitemap*.xml`, `sitemap_index.xml` e
`sitemap-<x>.xml`, mas o Yoast nomeia ao contrario: **`post-sitemap.xml`**,
`category-sitemap.xml`, `page-sitemap.xml`. Eles respondiam **404**. Os dois tiram
do indice, mas o 410 tira mais rapido, e o `sitemap_index.xml` que o Google
conhece aponta justamente para esses.

Corrigido em **10 vhosts**, com a negativa que evita o desastre:

```nginx
|sitemap-[a-z0-9-]+\.xml|(?!news-)[a-z0-9_-]+-sitemap\.xml|
```

🔴 Sem o `(?!news-)`, a expressao casaria **`news-sitemap.xml`**, que e do proprio
motor, e o patch derrubaria o sitemap do Google News de todo portal da rede.
Conferir depois de aplicar: `news-sitemap.xml` em 200 e `post-sitemap.xml` em 410.

⚠️ **9 vhosts antigos nunca tiveram essa regra** e respondem 404: wtw19,
girodasnoticias, jornaldebarcelos, nerddahora, noticias9, noticiasdasemana,
noticiasgoias, osertaoenoticia e portalnoticiasbh.

## `xmlrpc.php` e `wp-login.php` dao 403, e esta certo

O 410 do vhost funciona: medido **direto no origin**, sai 410. O 403 vem do **WAF
da Cloudflare**, que bloqueia esses caminhos antes de chegarem ao servidor. Vale
para toda a rede, e nao e defeito.

## 🔴 O AdSense apagava o banner de LGPD (22/08/2026)

O motor injeta o banner com este guard:

```js
if (html.indexOf('cookie_consent') < 0 && html.indexOf('</body>') > 0) {
```

O **Consent Mode do AdSense**, que o proprio motor escreve no `<head>` quando o
portal tem `adsense`, tambem cita a palavra:

```js
var _ok=document.cookie.indexOf("cookie_consent=todos")>=0;
```

Entao o guard encontrava `cookie_consent` e **pulava o banner**. Eram **10 dos 20
portais** desta maquina. O estrago e duplo e invisivel numa conferencia de HTTP:
falta o aviso que a LGPD exige, e sem banner ninguem aceita nada, entao o
consentimento fica `denied` para sempre e o anuncio serve despersonalizado.

A marca certa e o id do proprio banner:

```js
const _marcaLgpd = 'id="lgpd-' + String((site && site.slug) || 'p') + '"';
```

⚠️ A clinicas-vps tem outra implementacao, mais antiga, sem esse guard. A
hostinger-vps-srv1166087 tem o mesmo guard e recebeu a correcao, mas nenhum
portal de la usa AdSense hoje.

⚠️ **Conferir sempre pelo dominio real**, com `curl | grep "Aceitar todos"`. Por
`--resolve` no IP os portais atras da Cloudflare devolvem vazio, e parece que o
banner sumiu quando nao sumiu.

## Quem Somos: os 20 portais tem texto proprio (22/08/2026)

Dez ainda usavam o padrao do motor ou um molde compartilhado. Foram reescritos, e
a conferencia mecanica hoje mostra **nenhum trecho de 40 caracteres repetido entre
dois portais** e nenhum texto abaixo de 700 caracteres.

## 🔴 O "Leia tambem" do motor concentrava tudo em tres URLs (22/08/2026)

O bloco `pe-leia-meio`, que o motor injeta no meio do corpo, entregava **sempre
os 3 mais recentes da editoria a TODOS os artigos dela**. Como e montado no
render e nao na publicacao, o efeito e o oposto do pretendido: em vez de espalhar
autoridade, concentra tudo em tres URLs, com o **mesmo texto ancora**.

Medido nos 21 portais antes do conserto:

| portal | pico de usos da mesma ancora |
|---|---|
| jornaldebarcelos | 641 |
| noticiasgoias | 597 |
| osertaoenoticia | 586 |
| portalnoticiasbh | 578 |
| girodasnoticias | 407 |

**592 ancoras acima do teto de 8**, somando os 21. A regua da rede e no maximo 8
usos do mesmo texto ancora, e ela existe justamente contra isso.

O conserto **nao foi tirar o bloco**, que e bom para SEO: link no meio do texto
vale mais que bloco de navegacao. Foi **deslizar a janela por artigo**, com o
deslocamento tirado de um hash do proprio slug. Deterministico, entao a
reconstrucao nao embaralha a pagina a cada rodada, e uniforme, entao cada alvo
passa a receber cerca de 6 links.

```js
function _relacionados(pool, slug) {
  if (!Array.isArray(pool) || pool.length <= 6) return pool || [];
  let h = 2166136261;
  const s = String(slug || '');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  const off = (h >>> 0) % pool.length;
  return pool.slice(off).concat(pool.slice(0, off)).slice(0, 6);
}
```

⚠️ **O rodizio troca recencia por distribuicao, de proposito.** Uma janela menor,
so nos mais novos, nao resolve: para o teto de 8 valer numa editoria de N
artigos, a janela precisa ter pelo menos 0,75*N, ou seja, quase o acervo todo.

Aplicado nas duas chamadas, a do rebuild e a do publish, e os 21 portais foram
reconstruidos. **As outras duas maquinas nao tem o bloco**: o `render.js` de la e
anterior a ele.

## 🔴 Imagem gerada por cima da imagem do cliente (22/08/2026)

O gerador de imagem da Fase 7 olha **so o campo `image`** do artigo. Artigo que
tinha foto no corpo mas nunca teve destacada aparece como "sem imagem", ganha uma
cena gerada, e passa a mostrar a foto generica no topo e a **foto que o cliente
mandou** la no meio do texto. No desassossegada eram **18 artigos**, e quem viu
foi o Anderson, abrindo a pagina.

O certo e o contrario: a imagem propria sobe para destacada e **sai do corpo**,
senao a mesma foto aparece duas vezes.

⚠️ **O alt do corpo quase nunca serve.** Nos 18 era o titulo do artigo, o nome do
arquivo (`harmonizacao-facial-no-rj`) ou um subtitulo (`4. Aposte em acessorios`).
Nenhum dos tres descreve a foto, que e para o que o alt existe. Os 18 foram vistos
um a um numa folha de contato montada com PIL no proprio servidor.

## 🔴 "no text" no prompt nao impede texto na imagem (22/08/2026)

Quando a cena pede um objeto que no mundo real carrega texto (rotulo de frasco,
tela ligada, caderno aberto, jornal, lombada de livro), o FLUX desenha garatuja
mesmo com `no text, no words, no letters` no prompt. No desassossegada sairam
frascos escritos "POWELE", "PONETET" e "SAMEGASE", e isso foi para a home.

**A correcao nao e repetir a proibicao, e tirar o objeto que pede texto**: frasco
sem rotulo, caderno fechado, tela apagada, livro de capa fechada. Das 95 cenas do
gerador, **36 tinham esse risco**; 51 imagens foram refeitas.

⚠️ Para refazer so as certas, e preciso separar a imagem gerada da imagem da
origem. Nao serve o nome: **38 imagens vindas da origem tambem tinham o nome
igual ao slug**. O que separa e a data do arquivo.

## universoneo.com.br (UniversOneo), convertido em 23/08/2026

- arquitetura **AR**, "MODULO", 44a da maquina, prefixo `uni`. Cada secao e um
  **modulo assimetrico**: a materia principal na coluna larga a esquerda e tres
  menores empilhadas a direita, com miniatura quadrada. Nome da editoria em bloco
  roxo cheio. Roxo `#5B2AB5` com amarelo `#FFD400`, Red Hat Display e Red Hat Text
- **514 mantidos de 42.576**: 512 por backlink, 4 por clique
- origem: `hostinger-anderson-gna`,
  `/home/u400588174/domains/universoneo.com.br/public_html`, **2,0 GB**
- namespace da plataforma: `unvn-api` | **AdSense herdado**
- 410 de 4.865 caminhos podados
- o mapa do site que o motor gera aqui chama-se **`/indice-geral/`**

### 🔴 Lixeira de 37 mil posts

Este portal tinha **37.185 posts em `trash`**, sete vezes o acervo publicado e o
maior volume da rede. Duas decisoes:

1. **O inventario guarda os 37 mil so com metadado** (id, slug, titulo, data,
   status), 7,8 MB em vez de 180 MB. `trash` cai pela regra 1 sem que nenhuma
   decisao dependa do texto, e post na lixeira ja estava fora do ar.
2. **Os 37 mil slugs NAO entram no 410.** O WordPress acrescenta `__trashed` ao
   slug ao mandar para a lixeira: essas URLs **nunca existiram em publico**.
   Mandar 410 nelas incharia o vhost em 3.700 blocos de `location` a toa.

### 🔴 O script do vhost le dois arquivos de /tmp que nao levam o slug no nome

`vivos` e `slugs` saem de `/tmp/<pre>-publicos.txt` e `/tmp/<pre>-slugs410.txt`, e
esses caminhos **sobrevivem a copia** do script do portal anterior. Na primeira
tentativa aqui o 410 saiu com a lista do **diariopernambucano**, e nada acusou:
`nginx -t` passou, o vhost subiu. So a **contagem** denunciou, 3.892 em vez de
4.865. Conferir os dois caminhos antes de rodar.

### ⚠️ Pagina do WordPress preservada que o motor regenera

`home` e `contato` foram preservadas por clique. **Nenhuma das duas se importa**:
o motor gera as duas, a `/home/` redireciona para a raiz. E as duas ficam fora do
410.

## pontonaturalbrasil.com.br (PN Brasil), convertido em 23/08/2026

- arquitetura **AS**, "SINAL", 45a da maquina, prefixo `pnb`. Cada secao tem um
  **rotulo lateral estreito preso na rolagem**, com os arcos da marca por cima do
  nome da editoria, e a coluna de materias a direita. Embaixo da materia de
  abertura, trio de colunas separadas por filete vertical. Verde profundo
  `#0B6B31` com verde vivo `#00FF30`, Darker Grotesque e Rubik
- **261 mantidos de 2.096**: 259 por backlink, 5 por clique
- origem: **hostverge**,
  `/home/sites/18a/7/7672b9147f/public_html/pontonaturalbrasil`, **1,1 GB**,
  alcancada pelo salto `ssh opengravity` e dali `ssh -i /root/.ssh/id_hostverge`
- namespace da plataforma: `f4ef-api` | **sem AdSense**, e a origem tambem nao tinha
- artigo em `/<editoria>/<slug>/`, listagem em `/categoria/<slug>/`
- 410 de 1.833 podados, 1.831 respondendo
- o mapa do site que o motor gera aqui chama-se **`/todo-o-conteudo/`**

### ⚠️ Slug podado fora do ASCII nao casa no bloco generico

Um dos 1.833 e `...galpao-de-8m%c2%b2`. O nginx compara o URI **ja decodificado**,
entao `[a-z0-9-]` nunca casaria com ele. Ele ganhou bloco proprio com o caractere
literal. O `vhost_pnb.py` ja detecta e gera esses blocos sozinho.

### 🔴 A listagem de editoria repetia o primeiro artigo, na AS e na AR

`asList` e `arList` abrem com o destaque e logo abaixo montavam a grade com
`itens.map`, que inclui o proprio destaque. Duas fotos e dois titulos iguais
seguidos, e dois links para a mesma URL na mesma pagina. Corrigido nas duas, com
o universoneo reconstruido.

⚠️ A **AN parece ter o mesmo defeito e nao tem**: la nao existe destaque
separado, o mosaico e a pagina inteira. Trocar por `resto.map` faria a materia
mais recente sumir da propria editoria.

### ⚠️ A classe do bloco "Veja tambem" sai do `fp.prefix`

O `malha_portal.py` montava a classe com as tres primeiras letras do **slug**.
Aqui daria `pon-veja` enquanto a arquitetura estiliza `.pnb-veja`, e o bloco
subiria **sem estilo nenhum**, o que nao aparece em auditoria de HTML. O script
foi corrigido para ler o `fp.prefix` do `sites.json`.

### ⚠️ `sweep-flag` do arco SVG

Os dois lados da curva sao geometricamente validos: o `node` carrega, o HTML sai
inteiro, o console fica limpo, e o simbolo aparece como um gancho. So a captura
de tela mostra.

### ⚠️ A Darker Grotesque tem ascendente alto

Com `line-height:1.07`, herdado da AR, o titulo de duas linhas transborda a caixa
e a assinatura fica **por cima** do `h1`. A AS usa 1,16 com margem de 15px. Vale
para qualquer arquitetura que venha a usar essa familia.

### ⚠️ O PNG da marca da origem e paletizado com pontilhado

Recolorir por `1-lum` direto deixa a letra chapiscada. A mascara passa por
fechamento morfologico, dilata e volta, que tapa o furo do dither sem engordar o
traco. E o corte entre simbolo e palavra sai da coluna vazia entre os dois, nunca
cravado: aqui o "P" comeca antes de x=150 em 600px de largura.

## folhar.com.br (Folha R), convertido em 23/08/2026

- arquitetura **AT**, "MANCHETE", 46a da maquina, prefixo `flr`. 🔴 **A unica com
  cabecalho e rodape escuros**, e a unica com **lista numerada** de secao, com o
  numeral em contorno prata. Materia de abertura horizontal com imagem a
  esquerda. Chumbo `#141A21` com brasa `#FF4D19`, Oswald e Barlow
- **206 mantidos de 4.657**: todos por backlink. O site teve **zero cliques** em
  90 dias, entao o criterio de trafego nao preservou nada
- origem: `hostinger-qmix`,
  `/home/u463007860/domains/folhar.com.br/public_html`, **1,4 GB**, tema `jannah`
- namespace da plataforma: `db8d-api` | **AdSense herdado**, `pub-3880875536722698`
- artigo em `/<slug>/` (plano), listagem em `/categoria/<slug>/`
- 410 de 4.451 podados, 4.445 respondendo
- o mapa do site que o motor gera aqui chama-se **`/todas-as-noticias/`**

### 🔴 `--skip-plugins` NAO pula mu-plugin, e o export veio incompleto

O `qmix-ocultar-cat-en.php` filtra a categoria em ingles em `pre_get_posts`, e a
`WP_Query` do export devolveu **4.506 de 4.658**. Os 152 que faltavam eram 149
posts publicados da categoria `life`, mais 2 de status `nao` e 1 rascunho.

Eles existem no banco e podiam carregar backlink: ficar de fora do inventario
significaria apaga-los sem classificacao. Recuperados por SQL direto com
`get_post()`, no mesmo formato do acervo (`exporta_falta_flr.php`).

**Conferir sempre** a contagem do export contra
`SELECT COUNT(*) FROM wp_posts WHERE post_type IN ('post','page')`.

### 🔴 O `cria_at.py` apagou a AS

Copiado do `cria_as.py`, ele manteve o par de caminhos `O`/`N` do anterior: leu a
AR e **gravou por cima da AS**, terminada horas antes. O que salvou foi a copia
instalada no `archs.js` do servidor, de onde a AS foi extraida de volta.

Depois de rodar um `cria_*`, conferir que o arquivo NOVO existe **e que o antigo
nao mudou de tamanho**.

### 🔴 A versao "preta" do logotipo tem o simbolo BRANCO

Nas duas versoes da origem, o R da seta e branco: na dita "preta" so a palavra e
preta. Sobre papel o simbolo some e a marca fica sem o icone. Dai a barra escura
da AT.

⚠️ E os dois arquivos vem com o **nome trocado**: `logo-portal-folha-r.webp` e o
branco. A escolha sai da luminancia media dos pixels opacos, nunca do nome.

### ⚠️ Residuo de raspagem no corpo

Quatro artigos traziam a **trilha de navegacao do site copiado**
(`evte-breadcrumbs`), com `BreadcrumbList` em microdados e link para
`auto.docsbrasil.work`, mais `Watch CBS News`, um paragrafo em ingles e a foto de
abertura repetida dentro do `content`. Tudo markup valido: nenhuma auditoria de
HTML acusa.

### ⚠️ Editorias renomeadas, com 301

`tie-tech` -> `tecnologia`, `tie-life-style` -> `estilo-de-vida`, `tie-world` ->
`mundo`, e as vazias `life` e `mundo-pt` dobradas em editoria de verdade. Como o
permalink e plano, nenhuma URL de artigo depende disso.

## publisherbrasil.com.br (Publisher Brasil), convertido em 23/08/2026

- arquitetura **AU**, "ANEL", 47a da maquina, prefixo `pub`. O **anel da marca
  abre cada secao** e as **miniaturas da lista sao circulares**, com anel limao
  em volta: nenhuma das 46 vizinhas usa foto redonda. Preto `#0D0D0D` com limao
  `#DFFB00`, Bricolage Grotesque e Public Sans
- **314 mantidos de 2.993**: 299 por backlink, 16 por clique
- origem: `hostinger-anderson-gna`, **1,9 GB**, tema `smart-mag-child`
- namespace da plataforma: `ntfd-api` | **sem AdSense**, igual a origem
- artigo em `/<editoria>/<slug>/`, listagem em `/categoria/<slug>/`
- 410 de 2.679 podados, 2.527 respondendo
- o mapa do site que o motor gera aqui chama-se **`/conteudo/`**

### 🔴 Slug da lixeira precisa do `__trashed` DESFEITO

O WordPress acrescenta `__trashed` ao slug ao mandar para a lixeira. A URL que
existiu em publico e a **sem** o sufixo: e ela que precisa de 410. Sem desfazer,
o vhost cobre um endereco que nunca existiu e deixa o real de fora. Foram 140
aqui e 55 no saberdefato.

⚠️ E a URL registrada para post na lixeira e `/?p=NNNN`, que responde 404 e esta
certo assim: nunca foi link publico.

### 🔴 A origem nao tem wordmark utilizavel

O `logo-BLOG-Publisher` e uma lampada com a palavra "Blog", **sem o nome do
portal**; o `Publisher-Brasil.png` e quadrado e so funciona sobre preto. Este
portal e o primeiro da maquina **sem `logoImg`**: o cabecalho usa o crescente
desenhado em vetor mais o nome em texto.

⚠️ E o favicon da origem tem a palavra "Publisher" no centro do anel, que em 16px
vira borrao. O icone novo mantem so os dois crescentes.

## saberdefato.com.br (Saber de Fato), convertido em 23/08/2026

- arquitetura **AV**, "SELO", 48a da maquina, prefixo `sab`. O nome da editoria
  vem num **bloco laranja levemente girado**, como carimbo: nenhuma das 47
  vizinhas usa rotacao de bloco. Abaixo, **dois cartoes grandes por linha** com
  filete marinho no topo. Marinho `#000F2C` com laranja-mel `#F9AE2C`, Rokkitt e
  Cabin
- **503 mantidos de 3.385**: 497 por backlink, 7 por clique
- origem: `hostinger-anderson-gna`, **1,3 GB**, tema `smart-mag-child`
- namespace da plataforma: `qzfd-api` | **sem AdSense**, igual a origem
- 🔴 artigo em `/<slug>/` (plano), listagem em **`/category/<slug>/`, em INGLES**
- 410 de 2.882 podados, 2.818 respondendo
- o mapa do site que o motor gera aqui chama-se **`/todas-as-noticias/`**

### 🔴 `category_base` VAZIO significa `category`

Na origem o campo estava vazio, e o WordPress trata vazio como `category`.
Cravar "categoria" por analogia com os vizinhos poria a editoria inteira em 404.
No vhost, quem **redireciona** aqui e a forma em portugues, ao contrario de todos
os vizinhos desta leva.

### 🔴 Recolorir o mascote inteiro o transforma num fantasma

A marca nao tinha versao para fundo escuro, e o mascote e feito de **contorno
marinho**: clareando o marinho ele perde todos os tracos. O que funciona e
recolorir **so a palavra**, que e chapada. O mascote continua igual e se le sobre
o marinho pelo circulo laranja e pelo branco da camisa.

⚠️ E o `site_icon` da origem e um recorte quadrado que **ainda pega um pedaco do
"S"** do wordmark: em 48px vira uma barra laranja solta. O favicon novo recorta
so o mascote, do proprio logotipo.

### 🔴 Um nome de arquivo de imagem colide entre dois meses

`Consorcio-de-Moto.jpg` existe em `2023/09` e em `2023/11`, com conteudo
diferente. No motor tudo mora numa pasta so, entao a copia de novembro virou
`Consorcio-de-Moto-2.jpg`. Sem isso o segundo artigo rouba a foto do primeiro,
sem erro em lugar nenhum.

## revistarumo.com.br (Revista Rumo), convertido em 23/08/2026

- arquitetura **AQ**, "REVISTA", 43a da maquina, prefixo `rev`. Cada secao abre
  com o proprio desenho da marca: a palavra REVISTA entre filetes, o nome da
  editoria em **italico grande** e um ponto coral embaixo. Abertura em **21/9**,
  formato de capa, e grade de tres colunas sem moldura nenhuma. Petroleo
  `#003844` com coral `#E29578`, Playfair Display e Urbanist
- **532 mantidos de 2.996**: 524 por backlink, 8 por clique. A amostra mais limpa
  da leva: **nenhum dos 60 apagados tinha link externo**
- origem: `hostinger-anderson-gna`,
  `/home/u400588174/domains/revistarumo.com.br/public_html`, **4,8 GB**, a maior
- namespace da plataforma: `a628-api`
- **AdSense herdado**: `pub-3880875536722698`
- 410 de 2.456 caminhos podados
- o mapa do site que o motor gera aqui chama-se **`/conteudo/`**

### 🔴 O coral da marca nao serve para texto

`#E29578` sobre branco da **2,4:1**. Ele e cor de filete, ponto e bloco. Para
chapeu e etiqueta a arquitetura usa `tinta`, `#B54F31`, com 5,1:1. O campo `tinta`
existe no tema desde a AK e vale para qualquer marca de cor clara.

### 🔴 Icone que e uma LETRA nao se desenha a mao

A marca e um R italico serifado. Nem vetor desenhado nem `<text>` com fonte
servem: o primeiro sai errado, o segundo depende de a fonte existir na maquina
que renderiza.

O caminho: as sete medidas de PNG e o `.ico` saem do arquivo de 512px da origem,
e o `favicon.svg` que o `<head>` declara **embrulha um PNG de 192 em base64**. E
SVG valido e o navegador desenha igual. Script em [`marcas/favicon_rev.py`](marcas/favicon_rev.py).

⚠️ **O `iconSvg` do `sites.json` fica AUSENTE de proposito.** Se existir, o motor
tenta converter o SVG com o ImageMagick, cujo renderizador interno **nao desenha
imagem embutida**: sairia um icone vazio. Sem `iconSvg` e com o `favicon.svg` ja
no disco, o motor encontra o arquivo e nao mexe.

## opopularjornal.com.br (Popular Blog), convertido em 23/08/2026

- arquitetura **AP**, "TELA", 42a da maquina, prefixo `pop`. O nome da editoria
  vem dentro de uma **moldura com pe**, silhueta de monitor, e cada cartao tem
  filete grosso **so no topo**, como a borda superior de uma tela. Foto em 16/9.
  Vinho `#8C1F15` e tijolo `#B82A1F`, Kanit no titulo e Signika no texto
- **1.066 mantidos de 3.727**: 1.059 por backlink, 7 por clique
- origem: `hostinger-anderson-gna`,
  `/home/u400588174/domains/opopularjornal.com.br/public_html`, **2,0 GB**
- namespace da plataforma: `mrpp-api`
- **AdSense herdado**: `pub-3880875536722698`
- 410 de 2.649 caminhos podados
- o mapa do site que o motor gera aqui chama-se **`/indice-de-materias/`**
- 🔴 **permalink PLANO com `categoryBase` em INGLES**: artigo em `/<slug>/`,
  listagem em `/category/<slug>/`, porque o `category_base` da origem estava
  VAZIO. O vhost redireciona `/categoria/<slug>/` **para** a forma em ingles

### ⚠️ `<img>` sem `src` nenhum

Um artigo trazia 16 tags `<img alt="" />` vazias, resto de raspagem. Nao mostram
nada e ainda contam como imagem sem alt em toda auditoria, o que empurra o numero
para cima e **esconde os casos reais**. Saem junto com o `<figure>` que as
embrulhava.

### ⚠️ Seis colisoes de nome de imagem, o maior numero ate agora

`Design-sem-nome` repetido em tres meses diferentes. No motor tudo mora numa
pasta so, entao a segunda copia rouba a foto da primeira **sem erro em lugar
nenhum**. As extras ganharam o mes no fim do nome.

### ⚠️ Recolorir logotipo por faixa de cor salpica a palavra

A versao clara do logotipo tem que separar por **luminancia**, e nao por faixa de
RGB: a borda suavizada das letras cai no meio da faixa e vira mancha. Aqui o
vinho profundo virou branco por luminancia, e o vermelho mais claro do "Blog" so
foi realcado.

## incast.com.br (In Cast), convertido em 23/08/2026, DNS virado em 24/08/2026

- arquitetura **AO**, "PAUTA", 41a da maquina, prefixo `inc`. Cada secao e uma
  **linha do tempo vertical**, com filete continuo e marcador redondo por
  materia, eco do microfone da marca. Marinho `#054A91` e vermelho `#E30D13`,
  Geologica no titulo e Wix Madefor Text no texto
- **843 mantidos de 6.677**: 793 por backlink, 43 por clique, 7 pelos dois. O
  maior trafego da leva: **208 cliques e 28.059 impressoes** em 90 dias
- origem: `hostinger-anderson-gna`,
  `/home/u400588174/domains/incast.com.br/public_html`, **3,3 GB**
- namespace da plataforma: `b6f1-api`
- **AdSense herdado**: `pub-3880875536722698`
- o mapa do site que o motor gera aqui chama-se **`/indice-de-materias/`**

### 🔴 `category_base` VAZIO significa `category`, em INGLES

A listagem mora em `/category/<slug>/`. Cravar "categoria" por analogia com os
vizinhos poria a editoria inteira em 404. O vhost redireciona
`/categoria/<slug>/` **para** a forma em ingles, e nao o contrario.

### 🔴 `<script>` aberto e nunca fechado dentro do corpo importado

A raspagem trouxe um `<script type="application/ld+json">` com o JSON truncado e
sem `</script>`. Na pagina publicada o navegador **engole todo o HTML seguinte**:
compartilhar, relacionados e **rodape somem da tela**, e o `</footer>` continua no
arquivo, entao nenhum auditor de HTML acusa.

**77 artigos nas tres maquinas**: 17 aqui, 34 na clinicas-vps, 26 na hostinger.
`script_solto.py` limpa o dado; `confere_script.py` mede o sinal certo na pagina
montada, que e `<script` em numero diferente de `</script>`.

### 🔴 A listagem da API devolvia a zona como `pending`

A virada ficou bloqueada um dia por isso: o `acha_zona.py` percorre as contas com
`?name=<dominio>` e a zona do incast aparecia como **`pending`**, o que parecia
zona nao confirmada. Lendo a zona **direto pelo id**
(`/zones/eb6fe552caae44f4fe0f4260cb23abc6`), ela esta **`active`**, na conta
`Incast`, e o **token master alcanca**.

⚠️ Antes de concluir que a zona esta fora de alcance, ler a zona pelo id. E
`conta11` e `conta25` continuam devolvendo `401 Invalid API Token`, o que nao tem
relacao com este caso.

### 🔴 O dominio estava FORA DO AR: erro 1000 da Cloudflare

Os quatro registros A e os quatro AAAA do apex e do www apontavam para **IPs da
propria Cloudflare** (`104.21.16.153`, `172.67.213.169`). Ela recusa isso com
**"DNS points to prohibited IP"**, e o dominio respondia **403 para qualquer
visitante**. A virada nao trocou site velho por novo: religou um dominio
quebrado.

### 🔴 Cada nome tinha DOIS registros A, e o script troca so o primeiro

O `virada_<portal>.py` dos outros portais atualiza o **primeiro** A de cada nome.
Com dois, o segundo continuaria no IP proibido e o resolvedor devolveria os dois:
metade das visitas cairia no erro. O `virada_incast.py` **apaga todos** os A,
AAAA e CNAME do apex e do www antes de criar um unico A.

### ⚠️ O 403 sobreviveu a virada, por cache da propria Cloudflare

Com o A ja correto, o apex seguia em 403 enquanto o `www` respondia 200: a
pagina do erro 1000 estava em cache. Purga total nao bastou. O que resolveu foi
**development mode** ligado, confirmar o 200 e desligar em seguida.

## divirto.com.br (Divirto), convertido em 23/08/2026

- arquitetura **AN**, "MOSAICO", 40a da maquina, prefixo `dvt`. **Segundo portal
  ESCURO da rede**, e nao se parece com o primeiro: o wtw19 e ciano-neon sobre
  grafite frio, aqui e grafite quente com ambar `#FFC93C`. Syne no titulo e
  Rethink Sans no texto
- **719 mantidos de 5.273**: 715 por backlink, 3 por clique, 1 pelos dois.
  **1.999 dos apagados estavam na lixeira**, o maior volume desta leva
- origem: `hostinger-anderson-gna`,
  `/home/u400588174/domains/divirto.com.br/public_html`, **2,3 GB**
- namespace da plataforma: `d852-api`
- **sem AdSense**
- 410 de 4.546 caminhos podados, sem nenhuma excecao
- o mapa do site que o motor gera aqui chama-se **`/todos-os-artigos/`**
- `flatUrl: false` com `categoryBase`: artigo em `/<editoria>/<slug>/`, listagem
  em `/categoria/<slug>/`

### 🔴 `defaultCategory` apontando para editoria que nao existe

Veio "Noticias" da copia do portal anterior, e o divirto nunca teve essa
editoria. O conteudo que a plataforma publica **sem categoria** caia em
`/noticias/<slug>/`: sem listagem, fora do menu e fora de toda auditoria. E o
jeito silencioso de fabricar editoria orfa.

So apareceu no **teste real de entrega**, que foi parar numa URL que nao existia
no mapa. Conferir sempre com `confere_defcat.py`, que valida o campo contra o
`categoryMap` do proprio portal. Os outros 88 portais das tres maquinas estao
certos.

### 🔴 A editoria sai da URL da origem, e nao de `cats[0]`

Quinze artigos aqui tem mais de uma categoria, e a primeira da lista **nao** e a
que estava na URL. Conferir por `cats[0]` acusa URLs faltando que estao certas, e
importar por `cats[0]` mudaria a URL de paginas com backlink.

## df8.com.br (DF8 News), convertido em 23/08/2026

- arquitetura **AM**, "BANCA", 39a da maquina, prefixo `df8`. **Unico portal
  monocromatico da rede**: preto e branco com azul eletrico `#1B4DFF` de acento,
  Anton no titulo e Chivo no texto
- **414 mantidos de 2.294**: 413 por backlink de cliente, 1 por clique
- origem: **hostverge**, conta `qmix.com.br`,
  `/home/sites/18a/7/7672b9147f/public_html/df8.com.br`, **1,2 GB**. Acesso por
  jump pelo opengravity, chave `/root/.ssh/id_hostverge`
- namespace da plataforma: `wkfd-api`
- **sem AdSense**: a origem nao tinha `ads.txt` nem `pub-`
- 410 de 1.870 caminhos podados
- o mapa do site que o motor gera aqui chama-se **`/arquivo-de-noticias/`**
- **`flatUrl: true` MAIS `categoryBase`**, o terceiro portal da maquina com esse
  par. `contato`, `politica-de-privacidade` e `indice-do-site` ficaram **fora do
  410**, porque o motor regenera as tres

### 🔴 O `fp` do sites.json nunca chegava as arquiteturas

`fpOf(site)` devolvia so `{arch, prefix, paletteMode, T}`. As 39 arquiteturas leem
`fp.container`, `fp.baseFs`, `fp.corpoFs`, `fp.medida`, `fp.medidaLarga`,
`fp.heroAr`, `fp.cardAr`, `fp.kickerLs` e `fp.radius` **direto**, e todos vinham
`undefined`: cada portal renderizava com a medida de reserva escrita na propria
arquitetura, e nao com a que estava configurada.

Portais que dividem arquitetura ficavam identicos em largura de contentor, medida
da coluna, proporcao de foto e raio de canto. E `fp.radius === 'sharp'` nunca era
verdadeiro, entao nao existia portal de canto reto na rede.

```js
return Object.assign({}, base, { arch, prefix, paletteMode: mode, T: tok });
```

O `T` continua onde estava: o `render.js` usa `ctx.fp.T.headOrder` e
`ctx.fp.T.schemaVariant`. Corrigido nas tres maquinas, com reconstrucao dos 88
portais.

### ⚠️ Fonte de um peso so

A **Anton** tem apenas o peso 400. Pedir `font-weight:700` faz o navegador
fabricar o negrito borrando o desenho, e o titulo sai com fantasma atras de cada
letra. Toda regra que usa a fonte de titulo desta arquitetura fica em 400.

## diariopernambucano.com.br (Diario Pernambucano), convertido em 23/08/2026

- arquitetura **AL**, "ALMANAQUE", 38a da maquina, prefixo `dpe`. O nome da
  editoria sai escrito na **vertical**, numa coluna estreita a esquerda
- **598 mantidos de 4.501**: 577 por backlink de cliente, 16 por clique, 5 pelos
  dois. Nenhum preservado sem criterio
- origem: `hostinger-anderson-gna`,
  `/home/u400588174/domains/diariopernambucano.com.br/public_html`, **2,9 GB**
- namespace da plataforma: `a500-api`
- **AdSense herdado**: `pub-3880875536722698`
- 410 de 3.889 caminhos podados
- o mapa do site que o motor gera aqui chama-se **`/indice-do-site/`**
- **`flatUrl: true` MAIS `categoryBase`**: artigo em `/<slug>/` na raiz, editoria
  em `/categoria/<slug>/`. Segundo portal da maquina com esse par, depois do
  desassossegada. Como tudo divide a raiz, `contato`,
  `politica-de-privacidade` e `termos-de-uso` ficaram **fora do 410**

### 🔴 A marca ja existia na origem, e era melhor

O motor gera um badge com a letra inicial e a arquitetura desenha um simbolo
generico. Os dois portais convertidos em 23/08/2026 tinham logotipo e favicon
proprios no WordPress, feitos por designer. **Procurar antes de desenhar:**

```bash
wp option get site_icon        # ID do anexo do favicon
wp option get site_logo        # e tambem options_logo, do ACF
wp theme mod get custom_logo
wp post meta get <ID> _wp_attached_file   # o guid mente quando o dominio mudou
find wp-content/uploads -iname "*logo*" -o -iname "*favicon*" -o -iname "*marca*"
```

**A paleta sai dos pixels do arquivo.** Aqui vieram carmim `#DA3444` e grafite
`#1E1F23` do logotipo. No folhadonoroeste, marinho `#012552` e lima `#E1FC00` do
favicon de rosa dos ventos.

⚠️ **Versao clara de marca de duas cores:** trocar **so** o tom escuro por
branco. Pintar tudo de branco apaga metade do nome.

⚠️ **Contraste antes de usar a cor viva como texto.** A lima do folhadonoroeste
da 1,16:1 sobre branco. A arquitetura AK ganhou um `--tinta` legivel para chapeu
sobre papel, e a lima ficou em filete, bloco e **texto sobre o marinho**, onde da
13,1:1.

⚠️ **O favicon da origem nem sempre serve.** O do diariopernambucano tinha o nome
em tres linhas: borrao nos 48px que o Google le, e repetia a lima do vizinho. Foi
trocado pelo **simbolo do proprio logotipo**, vetorizado.

O logotipo entra como `<img>` com `width` e `height`, e a arquitetura cai no
simbolo desenhado quando o portal nao tem arquivo. Os campos no `sites.json` sao
`logoImg`, `logoImgDark`, `logoW` e `logoH`.

⚠️ **Os arquivos ficam em [`marcas/`](marcas/)**, e nao so no servidor: um
`rm -rf public/*/` de reimportacao leva a pasta `img/` junto, e a marca se
perderia sem ninguem notar.

### 🔴 A linha fina repetia um paragrafo do corpo

Medido em 23/08/2026: **7.851 artigos** nesta maquina, 6.556 na hostinger e 1.643
na clinicas-vps. A importacao gravou o `dek` copiando o comeco do texto, e na
pagina do artigo o leitor lia a mesma frase duas vezes.

⚠️ **Nao da para apagar o campo no dado**: as 18 arquiteturas que usam `a.dek` o
usam **tambem no cartao** da home e da listagem. Apagar deixaria a rede com
cartao so de titulo.

A decisao mora no `articleHtml` do `render.js`, e vale para as 38 arquiteturas de
uma vez. Tres detalhes que custaram tres passadas:

  - ⚠️ a decisao tem que sair do artigo **original**: o bloco "Leia tambem" e a
    unidade de anuncio entram antes e **empurram a numeracao dos paragrafos**
  - a janela e de **6 paragrafos**, e nao 4
  - a linha fina as vezes e a **colagem de dois paragrafos seguidos**, e ai a
    frase nao cabe inteira em nenhum deles: precisa comparar tambem contra os
    seis emendados num texto so

A meta description nao e afetada: ela sai de `excerpt`, campo separado.

### 🔴 Lista de duas colunas preenchia por linha, e a data pulava

Com `grid-template-columns:1fr 1fr` e fluxo padrao, o segundo item mais recente
vai para o **topo da coluna da direita**. Quem le descendo a coluna da esquerda ve
04/ago, 31/jul, e ao lado 04/set do ano anterior.

O numero de linhas nao da para cravar no CSS: muda de 3, no bloco da home, a
dezenas, na listagem de editoria. Vai numa variavel CSS calculada no render:

```css
.lista{display:grid;grid-template-columns:1fr 1fr;
  grid-auto-flow:column;grid-template-rows:repeat(var(--l,3),auto)}
@media(max-width:900px){.lista{grid-template-columns:1fr;
  grid-auto-flow:row;grid-template-rows:none}}
```

```js
<div class="lista" style="--l:${Math.ceil(resto.length / 2)}">
```

O mesmo defeito estava na **AK do folhadonoroeste**, ja no ar. Corrigido nas duas.

### O `deploy_a*.py` so sabe INSERIR arquitetura

Para corrigir uma que ja esta no ar era preciso recortar na mao, que e o gesto
que ja apagou a vizinha nesta rede. Usar o `atualiza_arch.py <LETRA> <prefixo>`,
que tem as duas pontas do recorte explicitas: o cabecalho
`* Arquitetura XX, arquetipo` do proprio bloco e o cabecalho da arquitetura
seguinte, ou `const ARCHS` se for a ultima. Ele confere que a contagem de `*Css`
**nao mudou** e que a linha da tabela continua apontando para o proprio prefixo.

## folhadonoroeste.com.br (Folha do Noroeste), convertido em 23/08/2026

- arquitetura **AK**, "BOLETIM", 37a da maquina, prefixo `fnr`
- **209 mantidos de 4.549**: 208 por backlink de cliente, 1 por clique. Corte de
  **95%**, o maior da leva
- origem: `hostinger-qmix`,
  `/home/u463007860/domains/folhadonoroeste.com.br/public_html`, **3,9 GB**
- namespace da plataforma: `flnr-api`
- **AdSense herdado**: `pub-3880875536722698`
- 410 de 4.333 caminhos podados
- o mapa do site que o motor gera aqui chama-se **`/navegacao/`**

### 🔴 Status inventado nao sai nem com `any` nem com a lista por extenso

O `WP_Query` filtra status que **nao estao registrados no WordPress**. Esta rede
tem posts com `nao` e `sim`, inventados por algum plugin antigo: eles nao
aparecem em consulta nenhuma do WP_Query. So por SQL direto:

```sql
SELECT ID FROM wp_posts
 WHERE post_type IN ('post','page')
   AND post_status NOT IN ('publish','draft','pending','private','future','inherit')
```

E a segunda camada do mesmo problema do portal anterior, onde o `any` deixou a
**lixeira** de fora. Listar os status por extenso resolve a lixeira e **nao
resolve** o status inventado.

### Seis sitemaps velhos no Search Console, dois deles no host `www`

Alem do `sitemap.xml` novo, a propriedade tinha `sitemap-news.xml`, tres
`wp-sitemap-*` e **dois cadastrados em `https://www.`**. Listar antes de apagar e
o que pega os do `www`, que nao aparecem em nenhuma varredura pelo apex.

## jornaldobairroalto.com.br (Jornal do Bairro Alto), convertido em 23/08/2026

- arquitetura **AJ**, "GAZETA", 36a da maquina, prefixo `jba`
- **566 mantidos de 3.471**: 565 por backlink de cliente, 2 por clique
- origem: `hostinger-anderson-gna`,
  `/home/u400588174/domains/jornaldobairroalto.com.br/public_html`, 1,5 GB
- namespace da plataforma: `b2d2-api`
- **AdSense herdado**: `pub-3880875536722698`, slots dos irmaos da mesma conta
- 410 de 2.868 caminhos podados

### 🔴 `category_base` vazio significa `category`, em ingles

A origem tinha o campo vazio, e vazio **nao** e "sem base": e `category`.
Conferido ao vivo antes de provisionar, que e o unico jeito de nao errar:

```
/category/noticias/   200
/categoria/noticias/  404
```

### 🔴 O `post_status => 'any'` nao traz a lixeira

No `WP_Query`, `any` exclui todo status com `exclude_from_search => true`, e isso
inclui **`trash` e `auto-draft`**. O inventario da Fase 0 saiu com 3.438
registros, e a contagem depois da poda mostrou **32 na lixeira e 1 auto-draft**
que nunca foram inventariados. Eles caem na regra 1 de qualquer jeito, mas o
inventario e a unica prova do que sumiu: exportar antes.

A conferencia que pega isso e a que a skill ja manda fazer: rodar
`wp post list --post_status=any` **depois** de apagar e olhar os status que
sobraram.

### Registro sem permalink herda os cliques da home

Post sem permalink sai como `?p=NNN`, e o caminho normalizado vira `/`. Sem
guarda ele casa com a HOME no Search Console: aqui eram **9 registros levando 41
cliques cada**, e o relatorio dizia "11 artigos com clique" quando so 2 tinham.
Nenhum era `publish`, entao ninguem foi preservado por engano, mas um `publish`
nessa situacao seria.

### O site de demonstracao do tema conta como backlink de cliente

A pagina `home` guardava 104 KB de conteudo de demo do SmartMag, com um link para
`smartmag.theme-sphere.com` e ancora "Mais sobre Tecnologia". Pela regra pura
isso e backlink de cliente, e a pagina seria preservada. Entrou uma lista
`TEMA_DEMO` no classificador: theme-sphere, themeforest, envato, elementor,
wordpress.org e afins.

### O mapa do site tem o slug de uma pagina podada

O mapa que o motor gera **neste** portal chama-se `/todas-as-noticias/`, que era
tambem o slug de uma pagina do WordPress podada por zero clique. Ficou fora do
410 e fora do 301. O slug do mapa sai de um hash do nome do portal e muda de um
para outro: conferir sempre antes de escrever as regras.

## oiempreendedores.com.br (Oi Empreendedores), convertido em 22/08/2026

- arquitetura **AI**, "BALCAO", 35a da maquina, prefixo `oie`
- **251 mantidos de 2.722**: 243 por backlink de cliente, 8 por clique
- origem: `hostinger-qmix`,
  `/home/u463007860/domains/oiempreendedores.com.br/public_html`, 661 MB
- namespace da plataforma: `b61b-api`
- **sem AdSense**, igual a origem
- 410 de 2.465 caminhos podados: `/etc/nginx/gone/oiempreendedores.conf`

### 🔴 O 410 por slug teria matado uma editoria inteira

Um dos slugs podados era **`beleza`**, que neste portal e **nome de editoria**. A
regra usada nas conversoes anteriores casa o slug com prefixo opcional:

```nginx
location ~ "^/(?:[a-z0-9-]+/)?(beleza|...)/?$" { return 410; }
```

Isso casaria `/beleza/`, e a listagem da editoria morreria em 410. Aqui o 410 vai
pelo **caminho exato** de cada podado. Vale para todo portal com
`flatUrl: false`: o slug de artigo e o slug de editoria vivem no mesmo espaco de
nomes assim que o prefixo e opcional.

### Duas herancas de script que quase passaram

**O prompt do avatar** veio do portal anterior: uma das tres assinaturas sairia
com o genero trocado (`man in his sixties` para uma mulher) e os tres retratos na
paleta do desassossegada.

**O rodizio de cenas do gerador de imagem** trazia as editorias do portal
anterior. Sete que nao existem aqui, e cinco que existem cairiam todas na cena de
reserva. Ao copiar `imgs_<portal>.py`, trocar o `POOL` inteiro, e nao so o slug
do portal no caminho.

## desassossegada.com.br (Desassossegada), convertido em 22/08/2026

- arquitetura **AH**, "CADERNO", 34a da maquina, prefixo `des`
- **576 mantidos de 4.175**: 557 por backlink de cliente, 19 por clique
- origem: `hostinger-qmix`,
  `/home/u463007860/domains/desassossegada.com.br/public_html`, 1,4 GB, `blocksy`
- namespace da plataforma: `sbwc-api/v1`
- **sem AdSense**, igual a origem
- 410 dos 3.596 slugs podados: `/etc/nginx/gone/desassossegada.conf`, 360 blocos

### 🔴 `flatUrl: true` MAIS `categoryBase`, ao mesmo tempo

E o unico par assim das tres maquinas. O artigo mora em `/<slug>/`, na raiz, e a
editoria em `/categoria/<slug>/`, nos dois lados. Duas consequencias:

1. **Nao existe aqui o 403 de diretorio sem indice.** `/dicas/` nunca foi
   diretorio de artigo. O 301 das 15 editorias entrou so como rede de seguranca
2. ⚠️ **Tres slugs podados sao pagina que o motor regenera** e colidem na raiz:
   `contato`, `politica-de-privacidade` e `termos-de-uso`. Ficaram fora do 410;
   entrassem, a pagina de contato nova morreria e ninguem descobriria

### A malha interna nasceu apontando para o formato do portal anterior

O `malha_des.py` veio de copia e montava `/<editoria>/<slug>/`. Como este portal
e plano, foram **1.728 links internos apontando para 404**, criados de uma vez, e
so a auditoria depois do rebuild acusou. O script passou a ler `flatUrl` do
`sites.json` em vez de assumir o formato do vizinho.

## exquisito.com.br (Exquisito), convertido em 22/08/2026

Conversao parcial com backlinks. Runbook em `D:\PORTAIS\EXQUISITO\CONVERSAO.md`.

- 388 preservados de 4.006, corte de 90%, o maior da leva. 413 URLs no sitemap,
  14 editorias com artigo, 3 assinaturas novas
- arquitetura **AG** ("VITRINE"), exclusiva deste portal, a 33a da maquina. A
  assinatura visual e a **secao em vitrine**: um destaque grande a esquerda e tres
  menores numerados em romano a direita, com **etiqueta de editoria em tarja
  inclinada** sobre a foto do destaque
- 🔴 **`flatUrl: false` MAIS `categoryBase: "categoria"`, EM PORTUGUES.** O
  portal anterior tinha o campo **vazio**, que significa `category` em ingles: os
  dois casos apareceram na mesma leva. Ler o campo na origem, sempre
- 410 dos 3.614 slugs podados: `/etc/nginx/gone/exquisito.conf`, 362 blocos, mais
  regra literal para os dois slugs com `8m²`
- vhost etapa 2, HTTPS, certificado Let us Encrypt valido ate 20/11/2026
- zona da Cloudflare `306a54388fa08f98e58067aab0db3c2b`, em **Full (strict)**
- recebimento do Antonio no namespace **`xnpr-api/v1`**, testado antes da virada
- 🔴 **a origem TEM AdSense**, sem slot manual: `adsense` sem `adsSlots`
- **favicon proprio**: um retangulo grande a esquerda e tres pequenos a direita,
  sobre campo oceano `#0F3A4B`, que e o proprio arranjo da vitrine
- Search Console: `/sitemap.xml` enviado e **quatro cadastros velhos removidos**,
  entre eles um `post-sitemap.xml` com 2 erros. A propriedade existe **nas duas
  contas de servico**
- **origem antiga: `hostverge`, em `~/public_html/exquisito`** (1,3 GB), ja podada

### 🔴 A letra da arquitetura apontava para as funcoes da vizinha

O `deploy_ag.py` nasceu de uma copia do `deploy_af.py`, e a substituicao da
constante `LINHA` **nao casou**: a linha instalada na tabela `ARCHS` ficou
`AG: { letter: 'AG', css: afCss, ... }`. As funcoes `ag*` foram para o arquivo e
**ninguem as chamava**: o portal inteiro subiu com a cara do vizinho.

Nao da erro em lugar nenhum. O `archs.js` carrega, o motor sobe, o site responde
200. So aparece **na captura de tela**.

**Conferir sempre depois do deploy:**

```bash
grep -n "<LETRA>: {" /opt/portal-engine/src/archs.js
```

A linha tem que citar as funcoes da propria letra, e nao as da anterior.

## sabedoriaglobal.com.br (Sabedoria Global), convertido em 22/08/2026

Conversao parcial com backlinks. Runbook em `D:\PORTAIS\SABEDORIAGLOBAL\CONVERSAO.md`.

- 639 preservados de 2.538 (636 posts mais 3 paginas), 662 URLs no sitemap,
  15 editorias com artigo, 3 assinaturas novas
- arquitetura **AF** ("COMPENDIO"), exclusiva deste portal, a 32a da maquina. A
  assinatura visual e o **titulo corrido de secao**, com filete que atravessa ate
  a borda e a contagem de verbetes na ponta, mais **verbete com texto a esquerda
  e miniatura a direita** e **capitular** na chamada de abertura
- 🔴 **`flatUrl: false` MAIS `categoryBase: "category"`, EM INGLES.** O
  `category_base` da origem esta **vazio**, e o padrao do WordPress e `category`.
  O revistadeducao tinha o campo preenchido em portugues: cravar `categoria` aqui
  por analogia poria a editoria inteira em 404
- 410 dos 1.898 slugs podados: `/etc/nginx/gone/sabedoriaglobal.conf`, 190 blocos,
  mais uma regra literal para o slug com `8m²`
- vhost etapa 2, HTTPS, certificado Let us Encrypt valido ate 20/11/2026
- zona da Cloudflare `71e80ee7997f38d43776579a329141b7`, em **Full (strict)**
- recebimento do Antonio no namespace **`emfc-api/v1`** (conferido no
  `qmix-receiver.php` da origem e no `antonio_COMPLETO.csv`), testado publicando
  de verdade antes da virada
- ⚠️ **a origem NAO tem AdSense**: sem `ads.txt` e sem `ca-pub-` no tema. O portal
  nasceu sem, reproduzindo o que ela fazia
- **favicon proprio**, no campo `iconSvg`: tres cadernos empilhados em escada,
  dois em papel `#FBF9F6` e o do meio em oliva `#6E8F2A`, sobre campo ameixa
  `#3A2E39`. A escada e o que o diferencia do advivo e do revistadeducao
- o mapa do site deste portal e **`/indice-geral/`**
- Search Console: `/sitemap.xml` enviado. Havia **dois cadastros velhos**, o
  `sitemap_index.xml` e um `http://www.` com 2 erros; os dois removidos
- **origem antiga: `hostverge`, em `~/public_html/sabedoriaglobal`** (1,2 GB). O
  WordPress ainda esta de pe, ja com o acervo podado em 636 posts

### A legenda que repetia o h1

Em **338 dos 636** artigos o `alt` da imagem destacada e copia do titulo, porque a
origem preenchia os dois com a mesma coisa. A legenda embaixo da imagem de
abertura entao repetia o `h1` palavra por palavra, logo abaixo dele. A `AF` e a
`AE` passaram a so mostrar a legenda quando o `alt` **descreve a foto**. Vale
conferir nas outras arquiteturas que tem legenda de abertura.

## revistadeducao.com.br (Revista de Educação), convertido em 22/08/2026

Conversao parcial com backlinks. Runbook em `D:\PORTAIS\REVISTADEDUCAO\CONVERSAO.md`.

- 822 preservados de 3.551 (821 posts mais a pagina de contato), 848 URLs no
  sitemap, 16 editorias com artigo, 3 assinaturas novas
- arquitetura **AE** ("SUMARIO"), exclusiva deste portal, a 31a da maquina. A
  assinatura visual e o **rotulo da secao numa coluna estreita de margem** ao lado
  das entradas, mais fichas horizontais de miniatura a esquerda
- 🔴 **`flatUrl: false` MAIS `categoryBase: "categoria"`**, igual ao ebookcult:
  artigo em `/<editoria>/<slug>/`, editoria em `/categoria/<slug>/`
- 410 dos 2.723 slugs podados: `/etc/nginx/gone/revistadeducao.conf`, 273 blocos.
  **`politica-de-privacidade` e `termos-de-uso` foram subtraidos da lista**: sao
  slugs que o motor gera, e no 410 matariam as proprias institucionais
- vhost etapa 2, HTTPS, certificado Let us Encrypt valido ate 20/11/2026
- zona da Cloudflare `da86f67c740da6aae45ea4b64f69f8a3`. **Ela estava em `full`, e
  nao em strict**: subiu para **Full (strict)** depois da emissao
- recebimento do Antonio no namespace **`d506-api/v1`** (portal id 19 na
  plataforma), testado publicando de verdade antes e depois da virada
- **a origem TEM AdSense**, sem slot manual: `adsense` sem `adsSlots`
- **favicon proprio**, no campo `iconSvg`: coluna de margem em papel `#F7F5F1`
  sobre campo ardosia `#3E5C76`, com a entrada em ambar `#D97A2B` ao lado. As duas
  formas tem **direcoes diferentes** de proposito, para nao virar barra paralela
  como a do advivo
- o mapa do site deste portal e **`/mapa-de-navegacao/`**
- **origem antiga: `hostverge`, em `~/public_html/revistadeducao`** (1,2 GB, IP
  `185.151.30.195`). O WordPress ainda esta de pe, ja com o acervo podado em 821
  posts. Salvar a credencial do banco **antes** de apagar

### A editoria vem da URL, e nao da lista de categorias

63 dos preservados tinham mais de uma editoria. Usar `cats[0]`, que e o obvio,
mudaria a URL de todos eles e mataria backlink e posicao. A editoria sai do
**caminho da URL de origem**, e a prova e mecanica: as 821 URLs da origem existem
no motor, uma a uma.

### Imagem hospedada por terceiro no corpo

283 `<img>` em 154 artigos apontavam para `s3.cointelegraph.com`,
`images.cointelegraph.com` e `lh7-us.googleusercontent.com`: chegaram por raspagem
do site de origem. Consomem banda alheia, podem sumir a qualquer hora e nenhuma
tinha `alt`. Todas removidas. Vale procurar o mesmo nos vizinhos com acervo de
cripto.

### Editoria vazia deixa listagem velha para tras

`rebuildIndexes` so reescreve a listagem de editoria **que tem artigo**. Ao apagar
o ultimo artigo de uma editoria, o `/categoria/<slug>/index.html` antigo fica no
disco servindo conteudo que nao existe mais: foi assim que um artigo de teste
apagado continuou aparecendo na listagem de Noticias depois de tres rebuilds. A
pasta precisa ser apagada na mao.

## ebookcult.com.br (EbookCult), convertido em 22/08/2026

Conversao parcial com backlinks. Runbook em `D:\PORTAIS\EBOOKCULT\CONVERSAO.md`.

- 604 preservados de 2.721 (603 posts mais a pagina de contato), 630 URLs no
  sitemap, 16 editorias, 3 assinaturas novas
- arquitetura **AD** ("ESTANTE"), exclusiva deste portal. A assinatura visual e a
  **capa em retrato, 3 por 4**: nenhuma vizinha usa proporcao vertical
- 🔴 **`flatUrl: false` MAIS `categoryBase: "categoria"`.** Primeiro da leva com
  categoryBase: o artigo mora em `/<editoria>/<slug>/` e a editoria em
  `/categoria/<slug>/`. Sem o segundo campo, todo link de editoria do site antigo
  morreria em 404
- 410 dos 2.109 slugs podados: `/etc/nginx/gone/ebookcult.conf`, 211 blocos
- vhost etapa 2, HTTPS, certificado Let's Encrypt valido ate 20/11/2026
- zona da Cloudflare `140f134854688bac1e0a4f91111a3bc9`, em **Full (strict)**
- recebimento do Antonio no namespace **`knfo-api/v1`**, testado publicando de
  verdade antes e depois da virada (portal id 35 na plataforma)
- **a origem TEM AdSense**, por Auto Ads do Site Kit, sem slot manual: o `adsense`
  sem `adsSlots` reproduz exatamente o que ela fazia
- **favicon proprio** (22/08/2026), no campo `iconSvg`: livro aberto, campo verde
  `#2F4A3C`, paginas em papel e lombada em latao, da marca da arch AD. O latao NAO
  virou campo de proposito: ficaria perto demais do ambar do azulmagazine
- o mapa do site deste portal e **`/indice-de-materias/`**
- Search Console: `/sitemap.xml` enviado, 0 erros. O `sitemap_index.xml` estava
  cadastrado **duas vezes**, em https e em http: listar antes de apagar foi o que
  pegou o segundo
- **origem antiga: `hostinger-anderson-gna`, em
  `/home/u400588174/domains/ebookcult.com.br`. O WordPress ainda esta de pe, ja
  com o acervo podado em 603 posts.**

### O 403 que o categoryBase cria, e que era da rede inteira

Com o artigo em `/<editoria>/<slug>/`, a pasta `/dicas/` e **diretorio sem
index.html**, e o `try_files $uri $uri/ ...` faz o nginx tentar listar, com a
listagem desligada: sai **403**. Na origem essa URL respondia 200 e o canonical
dela ja apontava para `/categoria/dicas/`.

⚠️ **Tirar o `$uri/` do try_files NAO serve**: sem ele o endereco sem barra final
passa a responder 200 em vez de 301, e cada pagina ganha uma URL duplicada.
Medido no ebookcult antes de desfazer.

O conserto sem efeito colateral, aplicado nos **19 vhosts desta maquina**:

```nginx
error_page 403 =404 /404.html;
error_page 404 /404.html;
```

Mais, so neste portal, o 301 de `/<editoria>/` para `/categoria/<editoria>/`.

⚠️ **Falta conferir a clinicas-vps**, onde 34 portais tem `categoryBase`.

⚠️ Ao editar esses vhosts, **sem comentario na mesma linha**: o bloco
`location / { ... }` e uma linha so, e um `#` ali engole a chave de fechamento. O
nginx recusa com "named location can be on the server level only".

## curiosododia.com.br (Curioso do Dia), convertido em 22/08/2026

Conversao parcial com backlinks. Runbook em `D:\PORTAIS\CURIOSODODIA\CONVERSAO.md`.

- 898 artigos preservados de 3.452, 924 URLs no sitemap, 15 editorias,
  3 assinaturas novas (o WordPress assinava 844 dos 898 com um nome so)
- arquitetura **AC** ("ALMANAQUE"), exclusiva deste portal, classes hasheadas.
  A assinatura visual e a **entrada numerada**, e nao grade de cartoes
- 🔴 **`flatUrl: false` e sem `categoryBase`**: a origem serve
  `/%category%/%postname%/`. **63 preservados tem mais de uma editoria, e para 40
  deles o WordPress usou no permalink outra que nao a primeira da lista**: a
  editoria tem que sair da URL de origem, nunca de `cats[0]`
- 410 dos 2.548 slugs podados: `/etc/nginx/gone/curiosododia.conf`, 255 blocos.
  ⚠️ **3 slugs institucionais tiveram de sair da lista**: `contato`,
  `politica-de-privacidade` e `termos-de-uso` existiam como pagina no WordPress e
  o 410 matava a pagina que o proprio motor gera
- vhost etapa 2, HTTPS, certificado Let's Encrypt valido ate 20/11/2026
- zona da Cloudflare `16d33d43d1c57cdc3bfed3e5b47ed03d`, em **Full (strict)**
- recebimento do Antonio no namespace **`dd4c-api/v1`**, rota `/artigos`,
  conferido no `qmix-receiver.php` da origem E no `endpoint_url` da plataforma
  (portal id 23). Testado publicando de verdade depois da virada
- **a origem nao tinha AdSense nenhum**: sem `ads.txt` e sem publisher no tema.
  Entrou com o publisher da rede
- 468 dos preservados chegaram sem imagem e ganharam imagem gerada. Nenhum ficou sem
- o mapa do site deste portal e **`/conteudo/`**
- Search Console: propriedade so na chave `backlinkguard-google-sa.json`.
  `/sitemap.xml` enviado, o `sitemap_index.xml` do Yoast removido
- **origem antiga: `hostinger-anderson-gna`, em
  `/home/u400588174/domains/curiosododia.com.br`. O WordPress ainda esta de pe, ja
  com o acervo podado.**

### Duas correcoes de motor saidas desta conversao

1. 🔴 **O menu escondia a maior editoria.** O `buildMenu` ficava com as 8
   editorias de artigo mais recente, entao **Games, com 298 dos 898 artigos, nao
   aparecia nem no menu nem no rodape**, com a pagina respondendo 200 e sem um
   link para ela no site inteiro. Passou a ordenar por quantidade, nas tres
   maquinas. ⚠️ O desempate precisa da posicao guardada **antes** do `sort`: ler
   `indexOf` no array que o `sort` reordena deixa o comparador inconsistente.
2. **Duas formas do `buildMenu` na rede**: a hostinger nao tem o parametro `hide`.

### Lixo de tema que so aparece olhando o corpo cru

| achado | artigos |
|---|---|
| `[ad_1]` aparecendo **na tela**, resto de plugin de anuncio | 288 |
| comentario de tema viajando em todo HTML servido | 624 |
| corpo **sem nenhum `<p>`**, so `<span>` soltos | 42 |

O terceiro e o mais caro: o bloco de anuncio do motor entra depois de um
paragrafo inteiro, entao esses 42 ficariam sem anuncio nenhum.

## cameracotidiana.com.br (Câmera Cotidiana), convertido em 22/08/2026

Conversao parcial com backlinks. Runbook em `D:\PORTAIS\CAMERACOTIDIANA\CONVERSAO.md`.

- 1.117 artigos preservados de 3.195, 1.147 URLs no sitemap, 19 editorias,
  3 assinaturas novas (a do WordPress ja era de outro portal da rede)
- arquitetura **AB** ("FOLHA DE CONTATO"), exclusiva deste portal, classes hasheadas
- 🔴 **`flatUrl: true`**: primeiro portal desta leva com permalink **plano**. A
  origem servia `/%postname%/`. A editoria, que morava em `/category/<slug>/`,
  passou a morar em `/<slug>/`, e a antiga redireciona com 301
- 410 dos 2.072 slugs podados: `/etc/nginx/gone/cameracotidiana.conf`, 208 blocos
- vhost etapa 2, HTTPS, certificado Let's Encrypt valido ate 20/11/2026
- zona da Cloudflare `abe879787da463f06a5e14704c55c0ab`, em **Full (strict)**
- recebimento do Antonio no namespace **`e3a3-api/v1`**, testado publicando de
  verdade antes da virada. `location /wp-json/` e prefixo **simples, sem `^~`**
- 494 dos preservados chegaram sem imagem e ganharam imagem gerada. Nenhum artigo
  ficou sem
- **favicon proprio**, no campo `iconSvg` do `sites.json` (nao nos arquivos: o
  motor deriva todos os tamanhos desse campo a cada rebuild). Campo vermelho
  `#D3222A`, quadro creme, lente escura, sangrado e opaco, com o quadro em 26 da
  grade de 48 para caber na zona segura do icone maskable. ⚠️ Icone tem
  `expires 30d`: trocar exige **purgar a zona**, senao o Google segue vendo o velho
- contato entrega em `gisellewagnerofc@gmail.com`, testado
- AdSense ligado, `pub-3880875536722698`
- Search Console: propriedade so na chave `backlinkguard-google-sa.json`.
  `/sitemap.xml` enviado, **0 erros e 1.147 URLs**, os tres do Yoast removidos.
  **O `news-sitemap.xml` fica de fora** ate a plataforma publicar conteudo novo
- **origem antiga: `hostinger-anderson-gna`, em
  `/home/u400588174/domains/cameracotidiana.com.br`. O WordPress foi REMOVIDO em
  22/08/2026.** Copia de seguranca em
  `/home/u400588174/backup-conversao/`: `cameracotidiana.sql.gz` (164 MB de banco,
  32 comprimido) e `cameracotidiana-uploads.tgz` (1,39 GB, 47.645 arquivos). O
  dump tambem esta em `D:\PORTAIS\CAMERACOTIDIANA\backup-origem\`.
  ⚠️ **O banco `u400588174_N3L85` ficou orfao**: o `public_html` foi apagado antes
  de guardar a senha do `wp-config.php`, entao derruba-lo agora so pelo hPanel.

### Cinco correcoes de motor saidas desta conversao

Valem para a rede toda, e nenhuma dava erro visivel:

1. **Conteudo da plataforma nascia sem assinatura.** A plataforma do Antonio nao
   manda `author`, e o motor caia no nome do site: todo artigo novo de todo portal
   ficava sem `rel=author` e fora da pagina de qualquer editor. A assinatura passou
   a sair do `equipe`, pelo campo `cats`. Corrigido nas **tres** maquinas. A
   hostinger tem uma segunda forma do trecho, que le `author_name` antes.
2. **Pessoa marcada como `Organization` no schema.** O `schemaVariant` sorteava o
   tipo do autor; 6 dos 15 portais daqui publicavam
   `"author":{"@type":"Organization","name":"<nome de gente>"}`. O tipo passou a
   sair do fato, e quem consta da equipe ganha `url` para a propria pagina.
3. **`/favicon-48.png` e `/favicon-144.png` eram declarados no `<head>` e nunca
   gerados** por este motor. Dois 404 por pagina, nos 15 portais. O de 48 e o
   tamanho que o Google le para o favicon do resultado de busca. A clinicas-vps e
   a hostinger ja geravam os quatro.

4. **`<title>` de listagem saia cru**, tipo `<title>Beleza</title>`: sem marca e
   sem contexto, em ~19 editorias por portal mais indice, busca e paginas de
   autor. Corrigido nas tres. A clinicas-vps nem cortava o titulo, usava
   `opts.title` direto, entao la a forma e outra (`tituloArt`).

5. **Lacunas de icone no `<head>`**: o 512 nao era declarado, o bloco fixado no
   Windows nao tinha imagem nem cor, e a cor do bloco saia sempre do primario do
   tema, o que erra em portal com `iconSvg` proprio. Agora le `theme.tileColor`,
   com o primario como padrao. ⚠️ Campo novo em `theme` precisa ser **declarado
   tambem na funcao `theme()`**, que monta o objeto campo a campo: o que nao esta
   na lista some sem erro.

⚠️ **As correcoes 2 a 5 so aparecem depois de reconstruir.** Os outros 14
portais daqui continuam servindo o HTML antigo ate rodarem o rebuild, e o mesmo
vale para os 62 das outras duas maquinas.

## azulmagazine.com.br (Azul Magazine), convertido em 21/08/2026

Conversao parcial com backlinks. Runbook em `D:\PORTAIS\AZULMAGAZINE\CONVERSAO.md`.

- 886 artigos preservados de 3.654, 915 paginas, 969 imagens, 17 editorias,
  3 assinaturas novas (a do WordPress ja era de outro portal da rede)
- arquitetura **AA** ("CADERNO"), exclusiva deste portal, classes hasheadas
- `flatUrl: false` e **sem `categoryBase`**: o WordPress servia `/<editoria>/<slug>/`
- vhost etapa 2, HTTPS, certificado Let's Encrypt valido ate 19/11/2026
- 410 dos 2.757 slugs podados: `/etc/nginx/gone/azulmagazine.conf`, 276 blocos
- zona da Cloudflare `c98cbd5faa7adc577f3653eca891fc4b`, em **Full (strict)**
- recebimento do Antonio no namespace **`fndm-api/v1`**, testado no ar
- contato entrega em `gisellewagnerofc@gmail.com`, testado
- AdSense ligado, `pub-3880875536722698`. **A origem nao tinha `ads.txt`**: so o
  publisher no tema, o que nao serve anuncio. O motor cria o arquivo
- Search Console: propriedade so na chave `backlinkguard-google-sa.json`.
  **So o `sitemap.xml` foi enviado**: o `news-sitemap.xml` estava vazio, porque o
  artigo mais recente do acervo e anterior a janela do Google News
- **favicon proprio** (22/08/2026), no campo `iconSvg`: pagina com canto dobrado,
  campo ambar `#FFB020` e pagina azul `#1B3FA0`, da marca da arch AA. Antes era o
  padrao do motor, quadrado azul com "A", **identico ao do advivo**
- o mapa do site deste portal e **`/arquivo-de-noticias/`**
- **origem antiga: `hostinger-anderson-gna`, em
  `/home/u400588174/domains/azulmagazine.com.br`. O WordPress antigo ainda esta de pe.**

## advivo.com.br (AdVivo), convertido em 21/08/2026

Conversao parcial com backlinks. Runbook completo em `D:\PORTAIS\ADVIVO\CONVERSAO.md`.

- 931 artigos preservados de 4.141, 961 paginas, 957 imagens, 18 editorias,
  3 assinaturas novas (as do WordPress ja eram de outros portais da rede)
- arquitetura **Z** ("MURAL"), exclusiva deste portal, classes hasheadas
- `flatUrl: false` e **sem `categoryBase`**: o WordPress servia `/<editoria>/<slug>/`
- vhost etapa 2, HTTPS, certificado Let's Encrypt valido ate 19/11/2026
- 410 dos 3.198 slugs podados: `/etc/nginx/gone/advivo.conf`, 320 blocos
- zona da Cloudflare `c6659ca218517345ce8ab06c26318650`, em **Full (strict)**
- recebimento do Antonio no namespace **`b490-api/v1`**, testado no ar
- contato entrega em `gisellewagnerofc@gmail.com`, testado
- AdSense ligado, `pub-3880875536722698`
- Search Console: propriedade so na chave `backlinkguard-google-sa.json`
- o mapa do site deste portal e **`/indice-geral/`**
- **favicon proprio** (22/08/2026), no campo `iconSvg`: barra de manchete
  ferrugem `#D8452B` e linha de texto mais curta, sobre campo marinho `#123A5C`,
  da marca da arch Z. Antes era o padrao do motor, quadrado azul com "A",
  **identico ao do azulmagazine**
- **origem antiga: `hostinger-anderson-gna`, em `/home/u400588174/domains/advivo.com.br`.
  O WordPress antigo ainda esta de pe.**

⚠️ **Com a zona em `strict` e a origem sem certificado, o intermediario e
`flexible`, e nao `full`.** Com `full` a borda passa a falar HTTPS com a origem,
cai no `default_server` do painel e o dominio devolve laco de redirecionamento; o
desafio ACME tambem nao chega na porta 80.

## Correcoes de motor aplicadas em 21/08/2026 (a partir do viajenodetalhe)

**Auto Ads do AdSense dentro da navegacao.** O Google injeta
`div.google-auto-placed` sozinho, e escolheu a barra de editorias: como item do
flex, ele ocupa a largura toda e joga o botao de busca para a linha de baixo. Nao
aparece em revisao de codigo: o elemento e criado pelo script do Google e so
existe no navegador de quem visita. HTML e CSS da home e do artigo davam iguais
byte a byte. Regra no CSS base, nas tres maquinas:

```css
header :has(> nav) > .google-auto-placed,nav .google-auto-placed,
footer .google-auto-placed{display:none!important}
```

O `:has(> nav)` e proposital: mira so a faixa que contem o menu, sem depender de
nome de classe, que muda de arquitetura para arquitetura. **Nao vale para o
cabecalho inteiro**: no euvo ha uma unidade preenchida de 280px logo abaixo da
marca, que e leaderboard normal e continua faturando.

**`autoLinkContent` passou a pular `script`, `style`, `code` e `pre`.** Ela ja se
protegia de entrar em outro link e em titulo, mas nao em script: um artigo do
viajenodetalhe trazia do WordPress um `<script type="application/ld+json">` com um
`VideoObject`, o termo casou dentro da descricao e as aspas do `href` quebraram o
bloco. Nenhuma pagina quebra, so o dado estruturado deixa de ser lido.

## Correcoes de motor aplicadas em 20/08/2026 (a partir do adonline)

**As arquiteturas U, V, W e X nao abriam o `<body>`.** O `buildHead` fecha em
`</head>` e quem abre o corpo e a funcao de cabecalho de cada arquitetura. O
navegador conserta sozinho, entao nada quebrava na tela, mas o documento era
invalido. Afetava blogse, euvo, qmixdigital e adonline.

> Na srv1166087 o mesmo defeito estava em 15 arquiteturas. Ali, **N e R chamam
> `nRail` e `rNav` direto** de `*Home`, `*Article` e `*List`, e nunca passam pelo
> `*Header`: corrigir o `*Header` so pegava a pagina institucional.

**A pagina 404 tambem nao fechava o `<body>`**, e o link dela para a home era
"Voltar para a pagina inicial", ancora generica. Corrigido nas 3 maquinas, 73
portais.

**A pagina de busca nao fechava o `<body>` nem tinha `og:image`.** Mesmo caminho
de renderizacao que ja tinha esse defeito em `pageHtml` e no mapa do site.
Corrigido aqui e na clinicas-vps. A srv1166087 roda um motor anterior, que ainda
nao tem pagina de busca.

## AdSense (desde 20/08/2026)

O motor desta maquina nao tinha AdSense e passou a ter. Por portal, no
`sites.json`:

```json
"adsense": "pub-XXXXXXXXXXXXXXXX",
"adsSlots": { "artigo": "...", "artigo2": "...", "lista": "..." }
```

O motor normaliza o publisher: `ca-pub-` no `client=` e na meta, cru no ads.txt.
Com a forma errada no `client=` o script carrega, responde 200 e nao serve
anuncio nenhum, sem erro visivel.

Unidade de artigo so entra em paragrafo de primeiro nivel; `div` de embrulho nao
conta como contentor, mas lista, tabela, citacao e resposta de FAQ contam.
Artigo e pagina recebem; a 404 chama `pauseAdRequests=1`. Unidade sem anuncio
para servir recolhe por `ins.adsbygoogle[data-ad-status="unfilled"]`.

Usa hoje so o **euvo**. O blogse chegou a ser ligado por engano em 20/08 e foi
desligado no mesmo dia: ao desligar, **apagar o `ads.txt` a mao**, porque o
rebuild so grava arquivo e nunca remove o que deixou de ser gerado.

Dominio novo precisa ser cadastrado no painel do AdSense, senao a unidade sobe e
fica vazia para sempre, sem erro nenhum.

## Meta de verificacao de propriedade (desde 20/08/2026)

Rede de anuncio e ferramenta de busca pedem uma meta no `<head>` para provar que
o dominio e nosso. Como o motor regrava todo HTML a cada rebuild, **editar o
arquivo publicado nao adianta**: sai do `sites.json`.

```json
"verificacoes": { "impact": "d74f96f6-...", "google": "...", "bing": "..." }
```

Provedores mapeados no `render.js`: `impact`, `google`, `bing`, `pinterest`,
`facebook`, `yandex`. Chave desconhecida vira o proprio nome da meta.

⚠️ **A Impact usa `value=` no lugar de `content=`**, que nao e o atributo padrao
de `<meta>`. O verificador dela procura a string exata, entao o motor emite com
`value=` so para ela. Os demais saem com `content=`.

A tag sai **logo depois do `charset`**, no byte ~149. Se ficasse no fim do
`<head>`, cairia depois dos 22 KB de CSS embutido, no byte 22.059, e
verificador que le so o inicio do documento nao acharia.

Usa hoje so o **euvo**, com a Impact.

## Agenda de eventos do euvo.com.br (desde 20/08/2026)

App Next separado, no mesmo dominio do portal estatico, servido por proxy
reverso em `/agenda/` e `/evento/`. O site estatico nao foi tocado.

| item | valor |
|---|---|
| diretorio | `/var/www/euvo-agenda` |
| repositorio | `qmixdigital/euvo-agenda`, privado, chave de deploy somente leitura |
| alias SSH da chave | `github-euvo` no `/root/.ssh/config` |
| porta | 3040 (3041 reservada para a segunda instancia) |
| banco | `euvoagenda` no Postgres local, pool limitado a 5 conexoes |
| apps PM2 | `euvo-agenda` (web) e `euvo-agenda-crawler` (termina e morre) |
| crawler | Ticketmaster, Discovery API, 04h20 diario |
| especificacao | `D:\SITES\euvo.com.br` |

### O watchdog foi alterado

`/opt/pm2-watchdog.sh` agora **ignora nomes terminados em `-crawler`**. Sem
isso, um app com `autorestart:false` fica `stopped` entre execucoes e o
watchdog o ressuscitaria a cada 2 minutos, o que faria o crawler rodar 720
vezes por dia contra a fonte externa. Backup em `.bak-20260820`.

A regra vale para qualquer crawler futuro desta maquina: basta o nome terminar
em `-crawler`.

### O build roda contido em cgroup

`/var/www/euvo-agenda/deploy.sh` roda o `next build` dentro de um escopo
systemd com `MemoryMax=1800M` e `MemorySwapMax=0`.

Motivo: faltando memoria, o OOM killer escolhe o **maior processo da maquina**,
que aqui seria o notebookx ou o arcondicionado-top, e nao o build. Com o
escopo, quem estoura o teto e morto pelo cgroup e a conta fica dentro do
escopo. Vizinho nao entra na lista de candidatos.

Medido: pico de 1,11 GB com a arvore vazia. **Refazer a medicao quando a
arvore crescer.** Se o teto ficar apertado, a saida nao e aumenta-lo, e sim
mover o build para o GitHub Actions.

### Aviso de consumo da API, e a premissa que ele carrega

`/etc/cron.d/euvo-gasto-api` roda `src/crawlers/alerta-gasto.ts` todo dia as
6h30 e avisa por **bot do Telegram** a cada **US$ 5** de consumo acumulado.

**Esta maquina nao depende de e-mail para aviso nenhum**, igual ao motor de
pautas na Hetzner. O aviso de gasto e o relatorio semanal usam o mesmo bot
`@euvonews_bot` e os mesmos campos `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`
do `.env`. Sem eles, nenhum dos dois se perde: cai na saida padrao e vai para o
log do cron.

O degrau nao repete: `gasto-avisado.json` guarda o ultimo patamar avisado, e o
estado **so e gravado se o envio der certo**, entao falha de rede nao consome o
aviso.

**A premissa, que precisa ser conferida se algo divergir:** o gasto e medido
**na origem**, somando os tokens que cada resposta da API informa aos precos
publicados do modelo, e gravados em `/var/www/euvo-agenda/uso-api.jsonl`.

Isso e feito assim porque **a chave comum nao le o relatorio de custo**:
`/v1/organizations/cost_report` responde **401**, pois exige chave de **Admin**.
Criar uma chave de Admin so para isso nao compensa o risco.

Consequencia direta: **a medicao local so e fiel enquanto a chave for exclusiva
deste servidor.** Se a mesma chave passar a ser usada em outro lugar, o numero
daqui fica ABAIXO do real, e o alerta chega tarde.

**Em caso de qualquer divergencia, a fonte de verdade e o console da Anthropic**,
nao este arquivo de log. Vale manter tambem o alerta de cobranca do proprio
console ligado, que e independente e autoritativo.

Precos usados no calculo estao em `PRECO` dentro de `alerta-gasto.ts`. Se a
tabela de precos mudar, muda ali.

Custo medido em 20/08/2026: **US$ 0,0006 por evento classificado**, com Haiku
4.5. US$ 5 equivalem a cerca de 8.100 classificacoes.

### Alteracao no Portal Engine: destaque no topo de editoria

Feita em 20/08/2026 para a editoria `/categoria/eventos/` do euvo apontar para
a agenda em `/agenda/`.

**Onde:** `/opt/portal-engine/src/archs.js`, funcao nova `vDestaque` mais uma
linha dentro de `vList`. Backup em `archs.js.bak-agenda-20260820`.

**Raio de alcance: zero para os outros portais.** A arch V e usada **so pelo
euvo.com.br** (conferido em `sites.json`), e a funcao devolve string vazia se o
site nao tiver `destaqueCategoria`. Nenhuma outra arch foi tocada.

**Como ligar em qualquer portal**, sem mexer em codigo, desde que ele use a
arch V:

```json
"destaqueCategoria": {
  "<slug-da-editoria>": {
    "rotulo": "Agenda",
    "titulo": "...",
    "texto": "...",
    "url": "/agenda/"
  }
}
```

**Para aplicar depois de editar `archs.js`:**

```bash
systemctl restart portal-engine.service   # archs.js so e lido na inicializacao
cd /opt/portal-engine && node -e '
  const cfg=require("./sites.json"), R=require("./src/render.js");
  R.rebuildIndexes(cfg, cfg.sites.find(s=>s.domain==="euvo.com.br"));'
```

O `sites.json` **nao** precisa de restart: o receptor tem `fs.watchFile` e
recarrega sozinho em ate 2 segundos.

Depois do rebuild, purgar a URL na Cloudflare, senao a borda serve a versao
antiga por 30 minutos.

⚠️ O `rebuildIndexes` **regrava** `robots.txt`, `sitemap.xml`, `ads.txt`,
`404.html` e `site.webmanifest`. Conferido apos esta alteracao: todos sairam
corretos, inclusive a linha do AdSense com `pub-3880875536722698`.

**Regressao achada em 19/09/2026:** o `sites.json` do euvo estava com
`destaqueCategoria.eventos.url` e os links de `rodapeExtra` apontando para
`/categoria/eventos/` e `/categoria/shows/`, e nao para `/agenda/`. Todos os
backups desde 03/09 ja estavam assim, entao a troca aconteceu entre 20/08 e
03/09, sem registro. Efeito: **nenhuma pagina do portal linkava para a
agenda**, e as paginas de cidade ficaram na posicao 50 a 73 no Google.
Restaurado: destaque para `/agenda/`, rodape com `/agenda/`,
`/agenda/sao-paulo/shows/` e `/agenda/rio-de-janeiro/`, e `sitemapsExtra`
com `https://euvo.com.br/agenda/sitemap.xml` (entra no `robots.txt`). Backup
`sites.json.bak-agenda-links-20260919-*`. Se algum script regravar o
`sites.json` do euvo, conferir esses tres campos.

### Credencial do Search Console e relatorio semanal da agenda

**Arquivo:** `/etc/euvo-agenda/searchconsole-sa.json`, `600`, `root:root`, em
diretorio `700`. **Fora da arvore web e fora do repositorio**, entao nao ha como
ser servido nem versionado por descuido.

**De onde veio:** copiado em 20/08/2026 da maquina do Anderson,
`C:\Users\User\Desktop\backlinkguard-google-sa.json`.

**Para que serve:** ler o Search Console da propriedade `sc-domain:euvo.com.br`,
onde a conta `backlinkguard@backlinkguard.iam.gserviceaccount.com` tem
permissao `siteOwner`. O relatorio usa o escopo **`webmasters.readonly`**; o
escopo de escrita so foi usado uma vez, na submissao do sitemap.

ATENCAO: a outra conta de servico da rede, a `enjai`, **nao enxerga este
dominio**.

**Relatorio semanal:** `/etc/cron.d/euvo-relatorio-semanal`, segunda as 9h,
`src/crawlers/relatorio-semanal.ts`. Vai por **bot do Telegram**, lendo
`TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` do `.env` do proprio servidor. O bot e
unico e o mesmo token atende tambem a Hetzner, com os alertas do motor de
pautas.

Sem os dois valores no `.env`, o relatorio nao se perde: cai na saida padrao e
vai para `/var/log/euvo-relatorio.log`.

**Duas decisoes tecnicas que valem saber:**

1. **Sem biblioteca do Google.** O servidor nao tem `google-auth` em Python, e
   instalar pacote de sistema numa maquina com dez portais nao compensa. O JWT
   e assinado com `node:crypto` em `src/crawlers/lib/google.ts`, umas 20 linhas.
2. **A semana medida termina em D-3.** O Search Console atrasa de dois a tres
   dias; medir ate ontem traria dado incompleto e a comparacao com a semana
   anterior sairia torta.

ATENCAO: **o campo `indexed` da API de sitemaps nao serve de metrica.** Ele
devolve zero ate para o sitemap do portal, que tem 323 URLs cadastradas. Foi
descontinuado pelo Google. A medida de verdade e o Search Analytics: quantas
paginas tiveram ao menos uma impressao.

ATENCAO: **o relatorio de melhorias, o de rich results, nao tem API publica.** O
acompanhamento e por amostra, inspecionando URLs uma a uma pela API de
inspecao, cuja cota e baixa. Isso fica dito dentro do proprio relatorio.

**Crons da agenda nesta maquina:**

| arquivo | quando | o que faz |
|---|---|---|
| `euvo-memoria` | diario 9h | RAM, swap e PSI em `/var/log/euvo-memoria.csv` |
| `euvo-gasto-api` | diario 6h30 | consumo da API, Telegram a cada US$ 5 |
| `euvo-relatorio-semanal` | segunda 9h | indexacao da agenda, por Telegram |

### 17/09/2026: euvo.com.br foi para o Cloudflare Pages, e a agenda ficou para tras

O DNS do euvo passou de `A 77.37.69.175` para `CNAME euvo.pages.dev`. O portal
estatico foi junto; a agenda, que e app Node nesta VPS, ficou **dois dias em
404 na borda** sem monitor nenhum perceber.

**Como esta agora:** Worker `euvo-agenda-proxy` nas rotas `/agenda*`,
`/evento/*` e `/_next/*`, mandando para `origem.euvo.com.br` (A para esta VPS,
proxied) por `resolveOverride`. Host segue `euvo.com.br`, entao o vhost
`portal-euvo.conf` e o certificado continuam valendo. **O Nginx desta VPS
ainda precisa servir `euvo.com.br`**: nao apagar o vhost achando que o portal
foi embora.

Origin Rule nao serviu: plano Free nao inclui override de origem.

**Regra que fica para toda a rede:** antes de migrar qualquer dominio para o
Pages ou mudar DNS, conferir se ha app dinamico nesta VPS pendurado nele.
Hoje: euvo.com.br tem a agenda. Lista de portas em uso no PM2 e o lugar de
olhar.

**Vigia:** `/etc/cron.d/euvo-vigia`, a cada 10 minutos, bate no dominio
publico e avisa por Telegram ao cair e ao voltar. Existe por causa deste
incidente.

### Cloudflare: duas armadilhas confirmadas

1. O ruleset de **cache** e `f0b6460d8fe74656b9473533dab0f47b`. O
   `1662ce2214a24e2a958186756034c14e` e o de **firewall**. Resolver pela fase,
   nunca por id decorado.
2. Num ruleset, **todas as regras que casam sao aplicadas em ordem e a ultima
   vence**. Regra de bypass tem de vir **depois** da regra generica de cache
   everything, e nao antes.

### Nginx: o `^~` nao e estilo

O vhost `portal-euvo.conf` carrega 436 blocos `location ~` de regex, vindos de
`/etc/nginx/gone/euvo.conf`. Regex e avaliado **antes** de prefixo comum, entao
`location /agenda/` sem `^~` seria atropelado e a agenda inteira responderia
410. As tres locations usam `^~`. O `/_next/` precisa da propria, senao o regex
de estaticos por extensao tenta servir os chunks do disco do portal.

## qmixdigital.com.br (Revista QMIX), migrado em 20/08/2026

Conversao parcial com backlinks, vindo da Hostinger `anderson.gna`. Arquitetura
**W** (revista). Relato completo em `D:\PORTAIS\QMIXDIGITAL\CONVERSAO.md`.

**Primeiro portal da rede com `flatUrl: false`.** O WordPress servia
`/%category%/%postname%/`, entao artigo mora em `/<categoria>/<slug>/` e lista em
`/categoria/<slug>/`. Conferir isso no `render.js` antes de provisionar qualquer
outro portal de permalink nao plano.

Poda deixou **394 de 2.962** artigos, mais **38 ferramentas**. As ferramentas sao
98,6% do trafego do dominio: 5.611 cliques em 90 dias contra 79 do acervo
editorial inteiro.

- vhost: `/etc/nginx/conf.d/portal-qmixdigital.conf`, certificado **Let's Encrypt**
- 410: `/etc/nginx/gone/qmixdigital.conf`, 258 blocos
- Antonio: namespace `cb8f-api/v1`, chave e endpoint inalterados
- AdSense **desligado**, o dominio ainda nao tem licenca
- **nao cita a agencia**: sem "QMIX Digital", sem link para `qmix.com.br` nem
  para `ferramentas.qmix.com.br`, que segue no ar e nao foi tocado
- lote de conteudo publicado: **"quanto custa"**, 12 artigos, 22.100 buscas/mes
- malha de links internos: 788 links, **100% dos artigos recebem link**
- `autoLink` ligado, 17 entradas no mapa, mirando as ferramentas e a pagina pilar

### Dois consertos de vhost achados na conferencia da skill

**`/wp-content/uploads/` respondia 410 em vez de 301.** As duas regras existiam e
na ordem certa de leitura, mas o nginx **nao decide por ordem no arquivo**:
prefixo `^~` tem precedencia sobre regex, entao `^~ /wp-content/` engolia as
uploads. Cada imagem indexada no Google Imagens morria. Corrigido com um
`^~ /wp-content/uploads/` mais especifico, com `rewrite` dentro. Sao 1.025
arquivos em `/img/`.

**`/home/` respondia 404** e ainda ranqueava na posicao 2,6. E a home antiga do
WordPress; as regras de 410 casam `/categoria/slug/`, com dois segmentos, e
deixavam passar tudo de um segmento so. Agora 301 para a raiz. Junto entrou o 301
de `/page/N/`, que tambem dava 404.

### Campo novo no motor: `contentFile` em extraPages

Pagina extra pode guardar o HTML em arquivo, em vez de dentro do `sites.json`:

```json
{ "slug": "ferramentas/gerador-de-cpf", "contentFile": "gerador-de-cpf.html" }
```

O arquivo mora em `/srv/portais/<portal>/paginas/`. Existe porque as 38
ferramentas somam 1,68 MB de HTML com CSS e JavaScript embutidos, e o
`sites.json` e lido em toda renderizacao dos 15 portais desta maquina.

### Favicon nao regenera sozinho

Sem `iconSvg` no `sites.json`, o motor tem um `if (fs.existsSync(favicon.svg))
return` que trava no primeiro desenho **para sempre**. Trocar a paleta do portal
nao troca o icone. Com `iconSvg` presente, todas as versoes sao regeradas a cada
rebuild.

O motor passou a gerar tambem `favicon-96.png` e a declarar o `.ico` com
`sizes="48x48"`: o Google exige quadrado e **multiplo de 48px** para mostrar o
favicon na SERP.

### mime.types: manifest

`application/manifest+json  webmanifest` foi acrescentado ao
`/etc/nginx/mime.types`. Antes o `site.webmanifest` saia como
`application/octet-stream` em **todos** os portais, e alguns navegadores recusam.

## Fonte unica das arquiteturas

`D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\<LETRA>.js`. Patch aplicado
direto no `archs.js` do servidor **e desfeito no proximo deploy da arquitetura**,
que foi o que aconteceu com os acabamentos da V em 20/08.

O deploy usa `ins_arch_og.py`, que corta da primeira funcao com o prefixo da
letra ate a primeira funcao de OUTRO prefixo. Cortar ate `const ARCHS` apagaria
a arquitetura vizinha.
