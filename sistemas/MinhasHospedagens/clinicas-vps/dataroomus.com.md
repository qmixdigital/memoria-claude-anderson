# dataroomus.com

> **Convertido de WordPress em 16/08/2026.** Saiu da **Hostinger VPS1** e virou
> site estático servido pelo `portal-engine` na **clinicas-vps**.

| Item | Valor |
|---|---|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Tecnologia | portal-engine, HTML estático, sem WordPress, sem PHP, sem banco |
| Raiz | `/srv/portais/dataroomus/` (`data/` = JSON, `public/` = HTML servido) |
| Vhost | `/etc/nginx/conf.d/portal-dataroomus.conf` |
| SSL | certificado de origem autoassinado + Cloudflare em modo **Full** |
| Arquitetura visual | **AA** (`d:\PORTAIS\DATAROOMUS\infrarch-AA.js`) |
| Namespace da API | **`b3e8-api/v1`** |
| Chave IndexNow | `<<REMOVIDO>>` |
| Contador de acesso | `/3fa9c05e17.js` (hash próprio deste portal) |
| Contato entrega em | `gisellewagnerofc@gmail.com` |

## A conversão em números

| | |
|---|---:|
| Posts no WordPress de origem | 1881 |
| Importados e publicados | **114** |
| URLs devolvendo 410 | 1764 |

O corte foi duro porque a origem tinha **tráfego perto de zero** no Search
Console e cerca de metade do acervo era funil de IPTV. O critério foi backlink
de cliente **ou** impressão no Search Console, e depois a poda dos seis vetores
de IPTV no destino.

## Identidade visual

- **Conceito:** editorial analítico: o metadado faz parte do desenho, em monoespaçada
- **Tipografia:** Epilogue com Literata, e JetBrains Mono no contexto
- **Cor:** azul-marinho #14213d com mostarda #d4a017
- **Forma:** canto reto e borda completa de 1px

A arquitetura diverge das outras em cabeçalho, abertura da home, formato de
editoria, artigo, tipografia, cor e forma. Nenhum nome de classe CSS se repete
entre portais: o motor gera um hash por site.

## Equipe editorial

| Autor | Editoria |
|---|---|
| Bruno Salgueiro | Notícias |
| Nádia Portella | Entretenimento |
| Ricardo Vasconcelos | Análise, negócios e marketing |
| Juliana Estrela | Saúde e casa |

As páginas de equipe, política editorial e as quatro de autor passaram por
travas automáticas antes de gravar: **sem credencial** (nada de registro
profissional, formação, veículo anterior ou prêmio), sem travessão, sem menção
à agência, e **com a declaração de que o conteúdo é produzido com apoio de
inteligência artificial** e as ilustrações geradas por computador.

## Como mexer neste site

```bash
ssh clinicas-vps
ls /srv/portais/dataroomus/data/          # um JSON por artigo
sudo -u portais node -e "const c=require('/opt/portal-engine/sites.json');require('/opt/portal-engine/src/render.js').rebuildIndexes(c,c.sites.find(s=>s.slug==='dataroomus'))"
```

- Configuração: `/opt/portal-engine/sites.json`, objeto com `slug: dataroomus`
- **A arquitetura mora no arquivo local.** Patch feito só no `archs.js` do
  servidor se perde no próximo deploy. Deploy pelo script único:
  `node d:\PORTAIS\_infra\deploy-arch.js AA /opt/portal-engine/src/archs.js /tmp/arch-AA.js`
- **Não** procure wp-admin, wp-cli ou banco: não existem.

## Pendências

- 🔴 **Virada de DNS ainda não feita.** O domínio continua apontando para o
  WordPress na Hostinger VPS1.
- 🔴 **WordPress de origem ainda no ar**, em `~/domains/dataroomus.com/public_html` da
  `hostinger-vps1`.
- Conteúdo novo para tráfego orgânico ainda não produzido.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Uma manchete em ingles. Traduzida.
- [ ] Na home a coluna da direita termina muito antes da esquerda e deixa cerca de 800px de branco.
- [ ] O texto sob a marca muda entre paginas: '115 textos no acervo' na home e '6 editorias' no artigo.
