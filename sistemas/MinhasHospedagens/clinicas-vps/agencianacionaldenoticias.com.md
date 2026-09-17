# agencianacionaldenoticias.com

> **Migrado de WordPress em 14/08/2026.** Foi o **piloto** da conversão. Saiu da
> Hostinger `anderson.gna` e virou site estático gerado pelo
> [portal-engine](portal-engine.md) na **clinicas-vps**. O WordPress antigo **foi
> apagado** em 15/08/2026 — não existe mais para onde voltar.

## Onde o site está hoje

| Item | Valor |
|------|-------|
| Servidor | **clinicas-vps** (`ssh clinicas-vps`, `31.97.162.199`) |
| Tecnologia | portal-engine — HTML estático, Node, **sem WordPress, sem PHP, sem banco** |
| Conteúdo | `/srv/portais/agencianacional/data/*.json` |
| HTML publicado | `/srv/portais/agencianacional/public/` |
| Vhost | `/etc/nginx/conf.d/portal-agencianacional.conf` |
| DNS | Cloudflare, zona `e47012a020ea59e8c2656e127ab5bbd5`, A → `31.97.162.199`, **proxied**, SSL **Full** |
| Arquitetura visual | **arch U** (agência de notícias: azul sobre cinza, Source Serif + Public Sans) |
| Endpoint de entrega | `POST /wp-json/3a1a-api/v1/artigos/` com `X-API-KEY` |
| Cadastro na plataforma | `wp_sites` id **62**, MySQL `boot_qmixmarketplac` no `hostinger-vps-srv1166087` |
| Contato | formulário → Resend → `gisellewagnerofc@gmail.com` |
| Search Console | propriedade `sc-domain:agencianacionaldenoticias.com` |
| IndexNow | chave `<<REMOVIDO>>` |

## Onde ficava antes

Hostinger **anderson.gna** (`u400588174@147.79.91.52:65002`), em
`~/domains/agencianacionaldenoticias.com/`, WordPress com tema `evte-news`.

**Diretório apagado em 15/08/2026.** O banco `u400588174_4ho6i` ficou órfão e
precisa ser removido pelo hPanel: as credenciais estavam no `wp-config.php`, que
foi apagado junto.

## O que foi feito

1. **Poda pesada** — de 1.732 posts para poucas dezenas, mantendo só o que tinha
   valor. Removido todo o conteúdo de IPTV pelos três vetores de detecção (sigla
   junta, sigla mascarada com separadores, e link para domínio de IPTV sem citar a
   palavra).
2. **Pacote editorial** — 4 assinaturas com página de perfil (Marina Alencar,
   Rafael Duarte, Beatriz Novaes, Caio Bittencourt), `/equipe/` e
   `/politica-editorial/` declarando o uso de IA.
3. **Conteúdo novo** — 20 artigos na editoria **Documentos**, cauda longa de
   serviço (cartório, documentos, benefícios), com imagem, FAQ e SEO completo.
   A vitrine da home foi trocada: **Documentos ocupou o lugar de Insights**.
4. **Linkagem interna automática** — `autoLink` ligado, com rotação de texto âncora
   e orçamento por âncora em `/srv/portais/agencianacional/anchors.json`.
5. **Virada** — DNS para a VPS e troca imediata da chave criptografada em `wp_sites`.

## Estado atual

| Métrica | Valor |
|---------|-------|
| Artigos | **50** |
| Editorias | Documentos 20, Insights 14, Geral 11, Notícias 3, Saúde 2 |
| Vitrine da home | `documentos, geral, entretenimento, saude` |

## URLs antigas

**Toda URL removida responde 410**, não 404. Os permalinks nunca mudaram e a base
de categoria é `Categoria`, com **C maiúsculo**, igual ao WordPress.

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
- `titleMax: 62` já está aplicado (15/08/2026): nenhum título passa mais do limite.
  Falta avaliar `heroFrom`, que o boxnoticias usa para fixar de qual editoria sai
  a capa da home.
- O single post deste portal (arch U) ainda tem o cabeçalho **centralizado**, que o
  Anderson reprovou no boxnoticias. Refazer com solução visual própria, para as duas
  arquiteturas não convergirem.

## Revisao de conteudo e layout

Levantado na revisao das capturas de tela feita depois da virada de DNS.
O que esta como corrigido ja esta no ar. O que esta como pendente depende
de decisao sua, porque mexe em texto, em foto de terceiro ou em desenho.

- [x] Duas ilustracoes de IA com texto embutido ilegivel (Proclamas de Casamento, Cartorio Abre no Sabado). Imagens regeradas sem texto.
- [x] Legenda da foto saia com o alt cru em ingles ('colombia earthquake aftermath') e com nome de arquivo ('img 4717'). Legendas invalidas removidas.
