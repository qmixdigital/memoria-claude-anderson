# clickinfohub.com

> **Migrado de WordPress em 16/08/2026.** Saiu da **Hostinger VPS1** e virou
> site estático servido pelo `portal-engine` na **clinicas-vps**. Não existe
> mais WordPress, PHP nem banco de dados neste site.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Tecnologia | portal-engine, HTML estático, **sem WordPress, sem PHP, sem banco** |
| Raiz | `/srv/portais/clickinfohub/` (`data/` = JSON, `public/` = HTML servido) |
| Vhost | `/etc/nginx/conf.d/portal-clickinfohub.conf` |
| SSL | certificado de origem autoassinado + Cloudflare em modo **Full** |
| Arquitetura visual | **Y** (`d:\PORTAIS\CLICKINFOHUB\infra\arch-Y.js`) |
| Cloudflare zone | `a0901ceb2689071a7997d63b0797af09` |
| Cadastro na plataforma | `wp_sites` id **93**, MySQL `boot_qmixmarketplac` no `hostinger-vps-srv1166087` |
| Endpoint de entrega | `https://clickinfohub.com/wp-json/arfa-api/v1/artigos` |
| Namespace | **`arfa-api/v1`** (ver alerta abaixo) |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## ⚠️ O namespace estava documentado errado

O arquivo `antonio_COMPLETO.csv` diz que o namespace é **`qzms-api`**. Está
errado. O WordPress atendia em **`arfa-api`**, e foi assim que ficou no motor.

Como conferir, se a dúvida voltar: `POST` com chave errada devolve **401** na
rota certa e **404** na rota inexistente.

Usar o namespace errado quebra a entrega da plataforma na virada, sem erro
visível de fora: o site funciona e só o conteúdo novo para de chegar.

## De onde veio

Hostinger VPS1 (`ssh hostinger-vps1`), em
`~/domains/clickinfohub.com/public_html`. WordPress com tema
**quartzmoss-mag**, **1.639 posts** publicados, permalink `/%postname%/`,
`category_base` = `categoria`.

⚠️ **O WordPress de origem foi APAGADO em 16/08/2026**, pelo painel da
Hostinger. Não há mais de onde recuperar artigo podado, e o banco associado
some junto com a conta ou fica órfão no painel: conferir lá se sobrou algum.

## O que foi feito

1. **Seleção, não poda no WP.** Nada foi apagado na origem: foi montada uma
   lista do que importar.
2. **Critério:** backlink externo para site limpo **ou** qualquer impressão no
   Search Console. Dos 1.639, 241 selecionados.
3. **78 recusados por duplicata de rede.** O mesmo texto já pertencia a
   agoranoticias, barranews, boxnoticias ou agencianacional. O motor bloqueia
   por slug, e está certo: seria conteúdo duplicado entre portais.
4. **Poda de IPTV no destino**, com os seis vetores: 74 frases, 9 blocos e 16
   seções extirpadas; 4 artigos apagados por resíduo.
5. **11 artigos do Dr. Luiz Teixeira apagados**, conforme regra da rede.
6. **Restaram 148 artigos**, todos com imagem e assinatura. 83 imagens foram
   geradas, porque chegaram sem.
7. **410 em 1.485 URLs removidas**, em 149 blocos de `location` no nginx.

## Cluster Manutenção da Casa, publicado em 16/08/2026

**30 artigos novos** de manutenção doméstica, cobrindo cerca de 23 mil buscas
por mês. Motivo da escolha: os 3 artigos de entupimento que o site já tinha
estavam em **posição média 4,3** no Search Console, um deles em **1,5**, contra
35,1 do cluster de cinema com 70 páginas.

O tema é **manutenção**, e não limpeza, de propósito: o agoranoticias já tem 42
artigos de limpeza e mancha de roupa. Repetir poria dois portais da mesma rede
disputando a mesma busca. Aqui o assunto é hidráulica, eletrodoméstico, parede,
pintura e esquadria. **Nenhum slug e nenhuma keyword se repete** entre os dois,
o que foi conferido artigo a artigo e contra os 1.720 slugs do `owners.json`.

- Pilar: `/manutencao-da-casa-o-que-da-para-resolver-sozinho/`, que lista os 29
  filhos agrupados por cômodo
- Todo artigo tem FAQPage; **28 dos 30 têm HowTo** (os 2 de fora são guias de
  comparação, sem passo a passo, e não devem ter mesmo)
- 5 links externos para fonte oficial: Inmetro, Aneel, Anvisa e ABNT, cada um
  sustentando uma afirmação específica. Todas as URLs conferidas com curl antes
- Autora: Solange Bittar (Saúde e casa)
- Enviados ao Rapid URL Indexer no projeto **1106174** e ao IndexNow

### Os 3 artigos de entupimento mudaram de editoria

Estavam em **Empreendedorismo**, o que era errado e os deixava fora da editoria
Casa. Passaram para **Casa** e foram ligados nos dois sentidos ao cluster novo.
A URL não mudou: o site usa permalink plano, sem categoria no caminho.

`casa` foi acrescentada ao `homeSections`, então a editoria agora aparece na
home, logo depois de Notícias.

## Distribuição do acervo, depois do cluster

| Editoria | Artigos |
|---|---|
| Notícias | 53 |
| Insights | 45 |
| Entretenimento | 34 |
| **Casa** | **34** |
| Saúde | 5 |
| Marketing | 4 |
| Negócios, Empreendedorismo | 2 |

Total: **177 artigos**.

## ⚠️ A editoria Insights não existe na plataforma

O WordPress tinha 498 posts em **Insights** (id 10), mas essa categoria **não
está no `wp_categories`** da plataforma do Antônio. Conteúdo entregue para ela
cai na categoria padrão. Ficou no `categoryMap` do motor para o acervo
importado cair no lugar certo, mas **a plataforma não sabe entregar nela**.

## Equipe editorial

| Autor | Editoria |
|---|---|
| Lívia Peçanha | Notícias e cotidiano |
| Vicente Aymoré | Entretenimento e cultura |
| Solange Bittar | Saúde e casa |
| Gustavo Rondelli | Negócios, marketing e insights |

Nomes conferidos contra os 16 já usados na rede: nenhum se repete. A política
editorial declara o uso de inteligência artificial e que as ilustrações são
geradas por computador.

## Como mexer neste site

```bash
ssh clinicas-vps
ls /srv/portais/clickinfohub/data/          # um JSON por artigo
sudo -u portais node -e "const fs=require('fs');const c=JSON.parse(fs.readFileSync('/opt/portal-engine/sites.json','utf8'));require('/opt/portal-engine/src/render.js').rebuildIndexes(c,c.sites.find(s=>s.slug==='clickinfohub'))"
```

- Configuração: `/opt/portal-engine/sites.json`, objeto com `slug: clickinfohub`
- **A arquitetura Y mora no arquivo local** `d:\PORTAIS\CLICKINFOHUB\infra\arch-Y.js`.
  Patch feito só no `archs.js` do servidor **se perde** no próximo deploy.
  Deploy: `node deploy-arch-Y.js /opt/portal-engine/src/archs.js /tmp/arch-Y.js`
- **Não** procure wp-admin, wp-cli ou banco: não existem.

## ⚠️ titleMax vale 60, e o motivo importa

O campo estava em **62**. Com 62, o motor acrescentava " - Click Infohub" a
títulos que ficavam com 61 e 62 caracteres, e o Google corta em torno de 60.
Baixar para 60 faz o motor só acrescentar a marca quando o resultado couber.

Mexer nesse número muda o `<title>` de **todo o acervo** de uma vez, então
conferir depois com uma varredura no HTML publicado, não só nos artigos novos.

## Pendências

- ~~WordPress de origem~~ **resolvido**: apagado em 16/08/2026 pelo painel da
  Hostinger. Vale conferir no painel se o banco associado foi removido junto,
  para não ficar órfão.
- A editoria **Insights** precisa ser cadastrada na plataforma, se for para
  continuar recebendo conteúdo.
- ~~109 artigos com `<title>` igual ao `<h1>`~~ **resolvido em 16/08/2026**:
  `metaTitle` escrito à mão para os 109 herdados do WordPress. Varredura no HTML
  publicado das **178 páginas de artigo** devolve zero título vazio, zero acima
  de 60 caracteres, zero igual ao `<h1>` e zero duplicado entre páginas.
- ~~Resíduo do Dr. Luiz Teixeira~~ **resolvido**: um artigo daqui, três do
  agoranoticias e um do barranews ainda carregavam link de saída para uma
  matéria sobre ele. Os artigos não eram dele, então saiu só o parágrafo do
  link. A rede inteira, `data` e `public`, está sem menção.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Travessao em paragrafo de materia. Substituido.
- [x] Miniatura de IA com rotulo de lata em letras deformadas. Regerada.
- [x] Duas manchetes em ingles. Traduzidas.
- [ ] Legenda com erro de digitacao: 'Catalogo' sem acento, 'karolyne' em minuscula e um hifen solto depois do ponto.
- [ ] Na secao Noticias, as linhas com miniatura a direita deixam cerca de 380px de vao entre texto e imagem, diferente das linhas com miniatura a esquerda.
- [ ] Corpo do texto com contraste baixo sobre o fundo creme.
