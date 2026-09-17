# jornalconceito.com

> **Convertido de WordPress em 16/08/2026.** Saiu da **Hostinger VPS1** e virou
> site estático servido pelo `portal-engine` na **clinicas-vps**.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Tecnologia | portal-engine, HTML estático, sem WordPress, sem PHP, sem banco |
| Raiz | `/srv/portais/jornalconceito/` (`data/` = JSON, `public/` = HTML servido) |
| Vhost | `/etc/nginx/conf.d/portal-jornalconceito.conf` |
| SSL | certificado de origem autoassinado + Cloudflare em modo **Full** |
| Arquitetura visual | **AB** (`d:\PORTAIS\JORNALCONCEITO\infrarch-AB.js`) |
| Namespace da API | **`sistema-qmix/v1`** |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contador de acesso | `/8d2c61b4af.js` (hash próprio deste portal) |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## ⚠️ O namespace estava documentado errado

O `antonio_COMPLETO.csv` diz **`e73c-api`**. Está errado: o WordPress atendia em
**`sistema-qmix`**, e foi assim que ficou no motor.

Como conferir, se a dúvida voltar: `POST` sem chave devolve **401** na rota que
existe e **404** (`rest_no_route`) na que não existe. Vale calibrar com um
namespace inventado, para ter certeza de que o 404 é mesmo "não existe".

Usar o namespace errado quebra a entrega da plataforma na virada **sem erro
visível de fora**: o site funciona e só o conteúdo novo para de chegar.

## A conversão em números

| | |
|---|---:|
| Posts no WordPress de origem | 2260 |
| Importados e publicados | **85** |
| URLs devolvendo 410 | 2172 |

O corte foi duro porque a origem tinha **tráfego perto de zero** no Search
Console e cerca de metade do acervo era funil de IPTV. O critério foi backlink
de cliente **ou** impressão no Search Console, e depois a poda dos seis vetores
de IPTV no destino.

## Identidade visual

- **Conceito:** jornal impresso: colunas verticais separadas por fio, versalete, capitular
- **Tipografia:** Crimson Pro no display e no corpo, Mulish na meta
- **Cor:** papel quente #f7f4ee com verde profundo #14532d
- **Forma:** canto reto, zero sombra, fio como único separador

A arquitetura diverge das outras em cabeçalho, abertura da home, formato de
editoria, artigo, tipografia, cor e forma. Nenhum nome de classe CSS se repete
entre portais: o motor gera um hash por site.

## Equipe editorial

| Autor | Editoria |
|---|---|
| Eduardo Caldeira | Notícias |
| Simone Tavares | Entretenimento |
| Paula Menegatti | Saúde e casa |
| Nelson Aragão | Economia e negócios |

As páginas de equipe, política editorial e as quatro de autor passaram por
travas automáticas antes de gravar: **sem credencial** (nada de registro
profissional, formação, veículo anterior ou prêmio), sem travessão, sem menção
à agência, e **com a declaração de que o conteúdo é produzido com apoio de
inteligência artificial** e as ilustrações geradas por computador.

## Como mexer neste site

```bash
ssh clinicas-vps
ls /srv/portais/jornalconceito/data/          # um JSON por artigo
sudo -u portais node -e "const c=require('/opt/portal-engine/sites.json');require('/opt/portal-engine/src/render.js').rebuildIndexes(c,c.sites.find(s=>s.slug==='jornalconceito'))"
```

- Configuração: `/opt/portal-engine/sites.json`, objeto com `slug: jornalconceito`
- **A arquitetura mora no arquivo local.** Patch feito só no `archs.js` do
  servidor se perde no próximo deploy. Deploy pelo script único:
  `node d:\PORTAIS\_infra\deploy-arch.js AB /opt/portal-engine/src/archs.js /tmp/arch-AB.js`
- **Não** procure wp-admin, wp-cli ou banco: não existem.

## Pendências

- 🔴 **Virada de DNS ainda não feita.** O domínio continua apontando para o
  WordPress na Hostinger VPS1.
- 🔴 **WordPress de origem ainda no ar**, em `~/domains/jornalconceito.com/public_html` da
  `hostinger-vps1`.
- Conteúdo novo para tráfego orgânico ainda não produzido.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [ ] Titulo com aspa de fechamento orfa: 'Na Trilha dos Sonhos": peca infantil...'. Corrigir no dado, aparece no H1, na trilha e no cartao.
- [ ] Na home a coluna da direita acaba cedo e deixa cerca de 480px de branco.
- [ ] No celular a capitular empurra as tres primeiras linhas do primeiro paragrafo. Desligar a capitular abaixo de 768px.
