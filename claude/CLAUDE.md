# Regras Globais - Todos os Projetos

## Quem sou eu

Sou desenvolvedor web focado em sites profissionais (medicos, clinicas, empresas). Trabalho com HTML estatico e Next.js + Payload CMS. Todos os sites seguem o mesmo padrao de estrutura, SEO e design. Os projetos ficam em `d:\SITES\` e `d:\GitHub\`.

## Idioma e Acentuacao

- Todo conteudo voltado ao usuario DEVE estar em **portugues brasileiro** (pt-BR)
- Usar acentuacao correta SEMPRE: nao escrever "Goiania" quando o correto e "Goiania" com acento → **Goiânia**
- `lang="pt-BR"` em todo HTML
- Nomes proprios com acentos corretos (medico, clinica, especialidade)
- Meta descriptions, titles, alt texts — tudo em portugues com acentos
- **JAMAIS usar travessao (—) em conteudo de site**: artigos, titulos, metas, FAQ. Substituir por virgula, dois-pontos ou reescrever. Travessao denuncia texto de IA.
- **JAMAIS inserir texto dentro de imagens geradas por IA** (sai ilegivel). Palavras-chave vao no nome do arquivo e no alt text, nunca na imagem.

## Padroes de projeto (ficam em skills, carregar quando a tarefa pedir)

As regras detalhadas sairam deste arquivo para nao gastar contexto em toda
sessao. Elas continuam OBRIGATORIAS: ao tocar no assunto, abrir a skill antes.

| Assunto | Skill |
|---|---|
| SEO, linkagem interna, title/meta/OG, schema JSON-LD, diretorios, sitemap, copiar site | `padrao-seo-sites` |
| Estrutura, CSS, layout, tabelas responsivas, WhatsApp, CWV, 404, politicas, LGPD, .htaccess, a11y, manifest | `padrao-estrutura-sites` |
| Imagens: banco de fotos gratis primeiro, Runware so com ordem expressa | `padrao-imagens` |
| Hospedagem, Cloudflare Pages, deploy Next.js zero downtime na VPS | `padrao-deploy-hospedagem` |
| GA4, AdSense, rastreio de cliques | `padrao-ga4-adsense` |
| Banner de afiliado de consulta de CPF | `padrao-banner-afiliado` |

Projeto novo: perguntar "Cloudflare Pages ou VPS? Se VPS, qual?" e o ID do GA4.

## Regras de Comportamento

- NAO perguntar confirmacao para operacoes basicas (criar arquivos, editar codigo, rodar comandos)
- NAO adicionar features que nao foram pedidas
- NAO mudar a stack sem eu pedir
- Quando criar uma pagina nova, JA incluir SEO completo, linkagem cruzada e schema JSON-LD
- Quando editar conteudo, MANTER a acentuacao correta
- Sempre usar portugues para conteudo do site, ingles para codigo (nomes de variaveis, componentes)

## Modo Autonomo (CRITICO - acelera tudo)

Eu valorizo MUITO velocidade. Pausar pra pedir aprovacao a cada SSH, scp, curl, wp-cli, ou edicao na rede QMIX me faz perder tempo. Para TODA operacao na minha infraestrutura conhecida, opere em modo **totalmente autonomo**.

### NAO pause, NAO pergunte, NAO ofereca opcoes - apenas execute:

- SSH para qualquer alias do meu `~/.ssh/config` (hostinger-qmix, opengravity, hostinger-anderson-gna, hostinger-vps1, hostverge via jump, qualquer host listado)
- SSH aninhado / jump host (`ssh opengravity 'ssh -i ... user@host ...'`)
- scp/rsync entre minha maquina e essas hospedagens
- curl em dominios da minha rede de portais (`*.com.br`, `*.qmix.com.br`, qualquer dominio listado em `D:\SISTEMAS\MinhasHospedagens\*\README.md`)
- wp-cli (qualquer subcomando: `wp eval`, `wp option`, `wp user`, `wp plugin`, `wp theme`, `wp cache flush`, `wp transient`, `wp rewrite`, `wp term`, etc.)
- python scripts do diretorio `C:\Users\User\.claude\skills\*\scripts\` (roll.py, install_portal.py, cleanup_harden.sh, etc.)
- base64 encode/decode para transferir arquivos via SSH aninhado
- `wp eval "do_action('litespeed_purge_all')"`, purge LiteSpeed, limpeza de cache em disco (`rm -rf wp-content/litespeed/*`, `wp-content/cache`)
- `wp login as <user> --url-only` (gerar magic-login eh seguro e revogavel)
- Edicao de arquivos PHP/CSS/JS dos meus temas/child-themes (backup `.bak-DATA` apenas em mudancas grandes)
- Reload de PM2, restart de Nginx, certbot renew na opengravity
- DELETE/INSERT/UPDATE em `wp_options`, `wp_postmeta` para configs (sem mexer em `wp_posts` em massa)
- Plugins activate/deactivate/install/delete (skill regra 16 ja sabe whitelist/blacklist)

### Continuam pedindo confirmacao:

- DELETE em `wp_posts` em massa (mais de 10 posts)
- DROP/TRUNCATE de tabelas
- Mudanca de senha de admin (geracao de magic-login NAO conta - eh autonomo)
- Mudanca de DNS, ownership do dominio, painel da hospedagem
- Compras, faturamento, billing, upgrade de plano
- `git push --force` em main/master
- Operacoes fora da rede QMIX que afetam terceiros

### Erros que NAO sao motivo pra pausar (ignorar e seguir):

- Warning `connection is not using a post-quantum key exchange algorithm` (apenas warning SSH, sempre)
- 502/503 transitorio do Cloudflare durante purge agressivo (faz outro passo e refaz curl, NAO me chama)
- `Could not list REST routes` no install_portal.py (apenas wp-cli versao antiga, deploy nao foi afetado)
- `No plugin auto-updates enabled` em portais ja configurados (idempotente)
- Output do PowerShell em background que nao saiu ainda (matar com TaskStop e refazer via Bash + ssh alias)

### Comportamento esperado ao terminar um deploy/redesign:

- Purgar caches automaticamente (WP + LiteSpeed + disco) sem pedir
- Gerar `wp login as <user> --url-only` automaticamente e entregar o link no resumo final
- Reportar em **3 a 4 linhas** o que foi feito. NAO escrever ensaio de meia pagina.
- Se decidir testar a home via curl, fazer e seguir. Se der HTTP 200 e o filtro/conteudo esperado estiver OK, NAO me perguntar se "tudo bem" - apenas finaliza.

### Se nao tiver certeza:

Executa, observa o resultado, e me diz depois. Reverter um SSH errado custa menos que perder 5 minutos pedindo aprovacao. Eu corrijo se nao gostar - meu feedback eh imediato.

### NAO use AskUserQuestion para coisas inferiveis:

NAO pergunte se nao consegue chegar na resposta sozinho. Em particular:

- **Parent theme/aestethic direction**: se o site ja tem logo, eu ja te dei pista visual. Se ja tem niche definido pelo conteudo, voce ja sabe o tom. Escolhe e executa - se eu nao gostar, refazemos.
- **AdSense slots**: descobre via `wp plugin list | grep -i adsense` ou `curl /home | grep googletagservices`. Se nao tiver evidencia, assume "nao tem por enquanto" e mete sem slots.
- **Categorias multilingue**: voce ja lista `wp term list category` e identifica slugs em ingles (life, news, blog) ou pt-PT (actualidade, noticias-pt). Decide e implementa sem perguntar.
- **Permalink**: NUNCA pergunta. Regra absoluta da rede: `--preserve-permalink`.
- **Confirmacao pos-deploy**: se HTTP 200 + filtro/conteudo OK + sintaxe PHP OK, ja terminou. Nao confirma comigo.
- **Quantos posts mostrar**, qual ordem de cards, quais classes CSS, qual font fallback: voce decide.

Use AskUserQuestion **somente** quando:
1. A escolha eh genuinamente subjetiva e voce nao tem como inferir (ex: "qual nome do dominio novo a comprar?")
2. A consequencia eh irreversivel e cara (deletar 1000 posts, mudar dominio principal, force-push em main com 50 commits)
3. Eu te der duas direcoes contraditorias na mesma frase

Caso contrario, decida com base em CLAUDE.md, README das hospedagens, ou inferencia razoavel do contexto.

## Linha Fina (termo meu, vale para todos os projetos)

Quando eu falar **"linha fina"**, quero o texto curto que fica **logo abaixo do
titulo (H1) e acima da linha de data / tempo de leitura / autor**. E o que o
jornalismo chama de subtitulo, olho ou abre.

**O que e:** uma explicacao breve do conteudo que vem a seguir, umas poucas
palavras, uma frase. Funciona como isca: dá ao leitor um gostinho do que ele vai
encontrar para que ele continue lendo em vez de voltar para o Google.

**Regras:**
- Uma frase, entre 10 e 20 palavras. Nunca duas frases.
- NAO repetir o title nem a meta description, e NAO copiar o primeiro paragrafo.
  Se a linha fina disser a mesma coisa que o paragrafo de entrada, ela nao serve.
- Deve entregar informacao nova ou a promessa concreta do artigo, nao elogio
  vago ("saiba tudo sobre", "confira as dicas").
- Portugues do Brasil com acentuacao correta e **sem travessao**, como todo o
  resto do conteudo.
- Visualmente: menor que o H1, maior ou igual ao corpo, cor mais fraca que a
  tinta cheia, respeitando o minimo de contraste da WCAG.
