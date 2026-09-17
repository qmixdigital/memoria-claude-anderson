# agoranoticias.net

> **Migrado de WordPress em 16/08/2026.** Saiu da **Hostverge** e virou site
> estático servido pelo `portal-engine` na **clinicas-vps**. Não existe mais
> WordPress, PHP nem banco de dados neste site.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Tecnologia | portal-engine, HTML estático, **sem WordPress, sem PHP, sem banco** |
| Raiz | `/srv/portais/agoranoticias/` (`data/` = JSON, `public/` = HTML servido) |
| Vhost | `/etc/nginx/conf.d/portal-agoranoticias.conf` |
| SSL | certificado de origem autoassinado + Cloudflare em modo **Full** |
| Arquitetura visual | **X** (`d:\PORTAIS\AGORANOTICIAS\infra\arch-X.js`) |
| Cloudflare zone | `4f6e70319f10d7c5223d7c251486ad4c` |
| Cadastro na plataforma | `wp_sites` id **98**, MySQL `boot_qmixmarketplac` no `hostinger-vps-srv1166087` |
| Endpoint de entrega | `https://agoranoticias.net/wp-json/afcc-api/v1/artigos` |
| Namespace | `afcc-api/v1` (o **mesmo** do WordPress, de propósito) |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## De onde veio

Hostverge (StackCP compartilhado), acesso por salto:

```bash
ssh opengravity
ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com
cd ~/public_html/agoranoticias.net
```

Era WordPress multisite com **2.234 posts publicados**, permalink `/%postname%/`,
`category_base` = `categoria`, tema `vellumknot-folio`.

**O WordPress de origem continua no ar naquele caminho.** Ele é a testemunha da
poda: enquanto existir, qualquer artigo apagado pode ser recuperado com conteúdo,
imagem e categoria originais.

## O que foi feito

1. **Seleção, não poda no WP.** Como o WordPress seria descartado, nada foi
   apagado lá: foi montada uma lista do que importar.
2. **Critério de seleção:** artigo com backlink externo para site limpo **ou**
   com alguma impressão no Search Console. Dos 2.234, **147 selecionados**.
3. **Classificação dos 64 domínios linkados.** 34 eram funil de IPTV. A pista:
   23 deles carregavam o **mesmo widget de WhatsApp**, com o mesmo número
   (`5598935000865`) e a mesma frase "teste de IPTV gratuito". Um site com esse
   widget é IPTV, mesmo que a home mencione a sigla só 3 vezes.
4. **Poda de IPTV no destino.** 59 seções `<h2>` de CTA extirpadas em 40
   artigos, preservando o texto que ranqueia; 10 artigos apagados por resíduo.
5. **Deduplicação da rede.** 18 artigos foram recusados porque o mesmo texto já
   pertence a barranews, boxnoticias ou agencianacional. É o motor evitando
   conteúdo duplicado entre os portais, e está correto.
6. **Restaram 119 artigos**, todos com imagem e publicados.
7. **410 em 2.114 URLs removidas**, em 212 blocos de `location` no nginx.

## Distribuição do acervo

| Editoria | Artigos |
|---|---|
| Notícias | 45 |
| Entretenimento | 34 |
| Marketing | 27 |
| Saúde | 13 |

## Equipe editorial

Quatro assinaturas, com avatar ilustrado gerado por computador e página própria:

| Autor | Editoria |
|---|---|
| Elisa Sarmento | Notícias e cotidiano |
| Márcio Bevilacqua | Entretenimento e cultura |
| Denise Quintela | Saúde e bem-estar |
| Fábio Mainardi | Negócios, marketing e empreendedorismo |

A política editorial **declara o uso de inteligência artificial** e que as
ilustrações são geradas por computador. Nenhuma bio afirma credencial.

## Backlinks preservados

30 domínios recebem link dos artigos mantidos. Os principais:
`portugaldigital.com.br` (9), `enjai.com.br` (8), `concar.com.br`,
`skipark.com.br`, `desentupidora.pro`, `qmiximoveis.com.br`.

⚠️ **4 backlinks apontam para páginas que já não existem no destino:**
`heldermoura.com.br` (3 URLs) e `band.com.br` (1). O link está no ar, mas cai em
404 do outro lado. Quem cuida daqueles sites precisa repor as páginas.

## Como mexer neste site

```bash
ssh clinicas-vps
ls /srv/portais/agoranoticias/data/          # um JSON por artigo
sudo -u portais node -e "const fs=require('fs');const c=JSON.parse(fs.readFileSync('/opt/portal-engine/sites.json','utf8'));require('/opt/portal-engine/src/render.js').rebuildIndexes(c,c.sites.find(s=>s.slug==='agoranoticias'))"
```

- Configuração: `/opt/portal-engine/sites.json`, objeto com `slug: agoranoticias`
- **A arquitetura X mora no arquivo local** `d:\PORTAIS\AGORANOTICIAS\infra\arch-X.js`.
  Patch feito só no `archs.js` do servidor **se perde** no próximo deploy.
  Deploy: `node deploy-arch-X.js /opt/portal-engine/src/archs.js /tmp/arch-X.js`
- **Não** procure wp-admin, wp-cli ou banco: não existem.
- Purga de cache: API da Cloudflare com a zone acima.

## Pendência

O acervo tem **9 artigos assinados "por Dr. Luiz Teixeira da Silva Júnior"** na
editoria de Saúde. No barranews o Anderson mandou apagar todos os artigos desse
autor; aqui a ordem não foi dada, e eles têm backlink. Ficaram no ar aguardando
decisão.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Legenda em ingles na foto de abertura. Removida.
- [x] Travessao encontrado em uma materia. Substituido.
- [ ] Corpo do texto em marrom claro sobre fundo creme, contraste no limite de 4.5:1. Escurecer a cor do corpo.
- [ ] Coluna lateral do artigo vazia por mais de 800px. Fixar como sticky.
- [ ] No hero o painel de texto e mais largo que a foto e sobra faixa branca. Dar mais peso a imagem ou acrescentar linha de apoio.
