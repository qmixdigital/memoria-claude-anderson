# barranews.com.br

> **Migrado de WordPress em 15/08/2026.** Saiu da Hostinger `qmix` e virou site
> estático gerado pelo [portal-engine](portal-engine.md) na **clinicas-vps**.

## Onde o site está hoje

| Item | Valor |
|------|-------|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Tecnologia | portal-engine, HTML estático, **sem WordPress, sem PHP, sem banco** |
| Conteúdo | `/srv/portais/barranews/data/*.json` |
| HTML publicado | `/srv/portais/barranews/public/` |
| Vhost | `/etc/nginx/conf.d/portal-barranews.conf` |
| DNS | Cloudflare, zona `5e5b9ce91ae796c18a72c9ab76c71215`, A para `31.97.162.199`, proxied, SSL Full |
| Arquitetura visual | **arch W** (boletim regional: verde `#0f6b4f` sobre papel quente, Bitter + IBM Plex Sans) |
| Endpoint de entrega | `POST /wp-json/brnw-api/v1/artigos` com `X-API-KEY` |
| Cadastro na plataforma | `wp_sites` id **8**, MySQL `boot_qmixmarketplac` no `hostinger-vps-srv1166087` |
| Contato | formulário, Resend, `gisellewagnerofc@gmail.com` |
| Search Console | `sc-domain:barranews.com.br` |
| IndexNow | chave `<<REMOVIDO>>` |

⚠️ Aqui o `categoryBase` é **`categoria` minúsculo**, diferente do boxnoticias.
A URL com maiúscula redireciona 301.

## Onde ficava antes

Hostinger **qmix** (`u463007860@82.112.247.158`), em
`~/domains/barranews.com.br/`, WordPress com tema **jannah**, 1.946 posts.
**O diretório ainda existe** e pode ser apagado quando você quiser.

## O que foi feito

1. **Seleção, não poda no WP.** Como o WordPress inteiro será descartado, nada
   foi apagado lá: migraram **414 dos 1.946** posts e os outros 1.532 viram 410.
2. **Critério da seleção:** 147 com backlink de cliente e sem IPTV, 245 com
   backlink **e** IPTV (para extirpar no destino) e 22 sem link mas com impressão
   no Search Console. Ficaram de fora os que tinham IPTV no título ou no slug.
3. **Limpeza no destino:** 198 seções de IPTV extirpadas, 2 artigos apagados por
   não sobreviverem ao corte, 2 links removidos (dominios de IPTV e boxnoticias).
   **Zero IPTV no portal.**
4. **53 artigos chegaram sem imagem** e viraram rascunho pela trava do motor.
   Todos tinham backlink ou tráfego, então ganharam imagem gerada e foram
   publicados. Cenas simbólicas: imagem de IA não retrata pessoa real.
5. **8 imagens com texto embutido** foram substituídas, incluindo a da capa.
6. **Sobras do WordPress limpas:** trilha de navegação colada no texto, hífen
   solto no fim de 33 títulos e 51 títulos cortados em pontuação natural.
7. **Pacote editorial** com 4 assinaturas exclusivas deste portal.

## Estado atual

| Métrica | Valor |
|---------|-------|
| Artigos | **143** |
| Editorias | Insights 70, Negócios 28, Notícias Agora 24, Saúde 10, Entretenimento 8, Estilo de vida 3 |
| Sem imagem | 0 |
| Com IPTV | 0 |
| Travessões | 0 |
| Títulos acima de 62 | 12 |
| Sem link externo | 0 |


## Segunda poda (15/08/2026, a pedido do Anderson)

Depois de o portal já estar no ar com 366 artigos, o critério foi endurecido:
**fica só quem tem backlink de cliente e nunca teve IPTV.**

- 198 saíram por terem tido IPTV, mesmo já extirpado, por serem conteúdo de
  filme construído em volta do funil
- 24 saíram por não ter link externo nenhum
- 1 saiu depois, por ter só link que eu havia desfeito

Sobraram **143 artigos**, todos com backlink real. As 223 URLs entraram no 410.
O que foi apagado será reescrito com qualidade mais tarde.

## Marca

Refeita em 15/08/2026. Logotipo em **caixa alta**, sem serifa, com "BARRA" em
tinta e "NEWS" em verde, precedido de uma barra vertical, que é o próprio
significado do nome e casa com o domínio, escrito junto.

Favicon em **âmbar `#f5a623` com barras verdes**: fundo de alta luminância salta
na barra de abas ao lado dos favicons escuros da maioria dos sites. A família
completa está gerada: `.ico` com 16, 32 e 48 dentro, PNG de 192 e 512, maskable
de 512 com zona segura de 80% e **apple-touch-icon de 180**, que estava linkado
no `<head>` e devolvia 404 desde o provisionamento.

## Anti-impressão digital

Os slugs `tie-business`, `tie-life-style`, `tie-world` e `tie-tech` vinham do tema
**Jannah** e denunciavam a origem comum dos sites da rede. Viraram `negocios`,
`estilo-de-vida`, `mundo` e `tecnologia`, com **301** das URLs antigas no nginx.

## Cuidados

- **Não** procure wp-admin, wp-cli ou banco: não existem.
- Editar `sites.json` recarrega sozinho; editar `src/` exige restart do serviço.
- Depois de qualquer republicação, **purgar o Cloudflare**.
- Correção em arquitetura vai no arquivo local `D:\PORTAIS\BARRANEWS\infrarch-W.js`,
  nunca só no servidor: o deploy da arch substitui o bloco inteiro.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Legenda em ingles na foto de abertura. Removida.
- [x] Miniatura de IA com tela de cotacao e numeros deformados (BC deve manter juros). Regerada.
- [ ] Ainda ha uma miniatura de tela de dados na secao Noticias Agora (Maduro / Chevron) com numeros ilegiveis.
- [ ] No topo do artigo a imagem da direita comeca acima do bloco de titulo e deixa um vao. Alinhar o topo dos dois blocos.
