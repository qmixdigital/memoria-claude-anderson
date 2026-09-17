# boxnoticias.net

> **Migrado de WordPress em 15/08/2026.** Saiu da Hostinger `anderson.gna` e virou
> site estático gerado pelo [portal-engine](portal-engine.md) na **clinicas-vps**.
> O WordPress antigo **foi apagado** — não existe mais para onde voltar.

## Onde o site está hoje

| Item | Valor |
|------|-------|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Tecnologia | portal-engine — HTML estático, Node, **sem WordPress, sem PHP, sem banco** |
| Conteúdo | `/srv/portais/boxnoticias/data/*.json` |
| HTML publicado | `/srv/portais/boxnoticias/public/` |
| Vhost | `/etc/nginx/conf.d/portal-boxnoticias.conf` |
| DNS | Cloudflare, zona `69f36f1dc7b81ea2d6a42e2e642fb31c`, A → `31.97.162.199`, **proxied**, SSL **Full** |
| Arquitetura visual | **arch V** (revista de cultura: creme `#faf7f2` + oxblood `#8c2f39`, Fraunces + Archivo) |
| Endpoint de entrega | `POST /wp-json/e77a-api/v1/artigos` com `X-API-KEY` |
| Cadastro na plataforma | `wp_sites` id **61**, MySQL `boot_qmixmarketplac` no `hostinger-vps-srv1166087` |
| Contato | formulário → Resend → `gisellewagnerofc@gmail.com` |
| Search Console | propriedade `sc-domain:boxnoticias.net` |
| IndexNow | chave `<<REMOVIDO>>` |

## Onde ficava antes

Hostinger **anderson.gna** (`u400588174@147.79.91.52:65002`), em
`~/domains/boxnoticias.net/`, WordPress com tema `evte-news`.

**Diretório apagado em 15/08/2026.** O banco `u400588174_awyvb` ficou órfão e
precisa ser removido pelo hPanel: as credenciais estavam no `wp-config.php`, que
foi apagado junto.

## O que foi feito

1. **Poda do WordPress** — de 2.260 posts para 664: removidos os de backlink puro,
   os efêmeros (abaixo de 3.000 caracteres) e os que linkavam para domínios de IPTV.
2. **Importação** — 665 enviados, 609 aceitos (56 recusados pela guarda de conteúdo
   duplicado entre portais), depois 106 apagados por não terem imagem.
3. **Segunda varredura de IPTV, já no destino** — 277 artigos ainda tinham a palavra
   no corpo. Em vez de apagar todos, foi extirpada a seção `<h2>` enxertada:
   **245 artigos salvos, 32 apagados.** Mais 13 com o mesmo template de afiliado sem
   a palavra-chave (`setup`, `travamentos`, `qualidade do sinal`).
4. **Pacote editorial** — 4 jornalistas com página de perfil (Helena Brandão,
   Otávio Serra, Clara Vasques, Miguel Antunes), `/equipe/` e `/politica-editorial/`
   declarando o uso de IA. Texto original, **não copiado** de outro portal da rede.
5. **10 artigos novos** na editoria **Sonhos**, cauda longa de baixa dificuldade.
6. **Virada** — DNS para a VPS e troca imediata da chave criptografada em `wp_sites`.
7. **Poda por tráfego (15/08/2026)** — a pedido do Anderson, apagado todo conteúdo
   sem link externo e sem tráfego no Search Console. Dos 480 vivos, só 52 tinham
   impressão e 1 tinha clique. Ficaram **62 artigos** (os 52 mais os 10 de Sonhos,
   poupados por serem do mesmo dia). Ver detalhes abaixo.

## Layout do single post

Refeito em 15/08/2026 depois de o Anderson reprovar o conteúdo centralizado
("layout americano"). Hoje o artigo tem:

- **abertura dividida** — kicker, título, resumo e assinatura à esquerda; imagem à
  direita, os dois blocos fechando na mesma linha
- **corpo em duas colunas** — trilho fixo à esquerda com sumário "Neste artigo",
  gerado automaticamente dos `<h2>`, mais compartilhamento; texto ao lado em medida
  de leitura
- abaixo de 1000px empilha: imagem no topo, sumário some
- **nada centralizado** além do masthead e do bloco de marca do rodapé

## Estado atual

| Métrica | Valor |
|---------|-------|
| Artigos | **62** |
| Editorias | Entretenimento 31, Geral 14, Sonhos 10, Notícias 4, Saúde 2, Insights 1 |
| Sem imagem | 0 |
| Com IPTV | 0 |
| Com link externo | **0** (todos removidos na conversão) |
| Órfãos | 0 |
| Travessões | 0 |

## URLs antigas

**Toda URL que não existe mais responde 410**, não 404 — incluindo as que o Search
Console conhecia (havia 350 nessa situação, entre elas a de maior tráfego histórico
do site, uma Mega-Sena com 519 impressões, cortada por ser notícia datada).

Os permalinks **nunca mudaram**: o motor usa `flatUrl` e a base de categoria é
`Categoria`, com **C maiúsculo**, igual ao WordPress. `/categoria/` minúsculo
redireciona 301.

## Cluster Bastidores (15/08/2026)

Nicho escolhido cruzando o Search Console do portal com as planilhas de
palavra-chave. O Search Console já mostrava o site em **posição 56 a 70** para
"método stanislavski", "método para atores" e "o que é uma versão do diretor",
e as planilhas confirmaram com "como ser um ator" (320/KD14), "como tirar drt de
ator" (210/KD7) e, no lote novo, "qual equipamento era usado para montagem de
filmes no cinema" (**1.410 somando variações, KD 9**).

- **30 artigos**, 1 página pilar mais 29 clusters, todos assinados por Otávio Serra
- categoria nova **Bastidores**, que virou a vitrine principal da home (`heroFrom`)
- cada texto linka para o pilar com âncora diferente e para dois irmãos
- 8 links de entrada partindo do acervo antigo, inclusive do artigo de Stanislavski
  que já ranqueava, para irrigar o cluster novo
- todos com imagem gerada, FAQ com schema, 4 ou mais seções e meta na faixa

Portal passou de 63 para **93 artigos**.

## Conformidade

| Item | Estado |
|------|--------|
| Banner LGPD | ativo em todas as páginas, cookie `cookie_consent` por 1 ano |
| og:image | home, categorias e artigos, imagem de marca em `/img/og-marca.webp` |
| Artigo sem imagem | bloqueado no motor: entra como rascunho, não vai ao ar |

## Cuidados

- **Não** procure wp-admin, wp-cli ou banco: não existem.
- Editar `sites.json` recarrega sozinho; editar `src/` exige restart do serviço.
- Depois de qualquer republicação, **purgar o Cloudflare**.
- O portal tem 62 artigos e editorias magras (Insights com 1, Saúde com 2). O
  Antônio continua entregando nelas, então se recompõem sozinhas.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Cartao do hero e rodape estavam centralizados, contra a regra de que so a marca centraliza. Alinhados a esquerda.
- [ ] Na primeira grade da home os dois cartoes tem imagens de alturas diferentes e as bases nao batem. Resolve com aspect-ratio fixo na miniatura.
- [ ] No artigo, a coluna lateral esquerda ('Neste artigo' + 'Compartilhar') acaba cedo e deixa cerca de 1000px de vazio. Resolve com position:sticky.
