---
name: qmix-plano-melhorias-2026-09
description: Lista priorizada de melhorias da plataforma QMIX (análise de 13/09/2026) para resolver uma por uma; marcar o status conforme avança
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-13T15:54:51.590Z
---

Análise feita em 13/09/2026 (dados do banco). Anderson pediu para resolver um por um, na ordem.

1. **Gerador de artigo invisível** — FEITO 13/09 (e-mails, pedido-confirmado, minha-conta "Gerar artigo", enviar-dados com passo 2 no topo, cron lembrete-artigo 20h). Medir adoção em outubro. Desde junho 52 entregas e 0 usaram o
   gerador; e-mail "pagamento confirmado", e-mail "dados recebidos" e página pedido-confirmado
   diziam "nossa equipe cria o artigo" e o botão era "Enviar dados" (já enviados no checkout).
   Caso gatilho: Pablo (cliente 209, pedido 103, entrega 153).
2. **Tickets parados** — FEITO 13/09: conversa criada pelo admin nasce "respondido"; "faltam dados"
   fecha sozinho quando os dados chegam; cron diário tickets-auto-resolver (7 dias sem resposta);
   badge de tickets na sidebar; filtro padrão "Precisam de resposta". Sobrou só #12 (Extreme Parts,
   "não indexado", link já indexado) esperando resposta humana. DESCOBERTA: todos os crons do
   qmix estavam bloqueados pelo Cloudflare (403) desde maio; agora rodam via /usr/local/bin/qmix-cron.sh
   (127.0.0.1:3020/3021, log /var/log/qmix-cron.log).
3. **Funil / tráfego** — REFORMULADO 13/09: o gargalo é tráfego, não a página do portal
   (portais exigem login; GSC 90d: 13k cliques nas ferramentas, 481 nas páginas comerciais+blog;
   /comprar-backlinks posição 18 para "comprar backlinks", on-page ok, falta autoridade).
   FEITO: rodapé das 87 ferramentas com 3 links (home "agência de backlinks", /comprar-backlinks
   "comprar backlinks brasileiros", /geo "otimização para IA (GEO)"), autorizado pelo Anderson.
   PENDENTE de decisão: links da rede própria (111 portais) para /comprar-backlinks e /geo.
   Medir posição de "comprar backlinks" em outubro.
4. **Zero avaliações** — FEITO 13/09: cartão "Sua opinião vale R$ 20" no topo de Minha Conta
   (um toque na estrela grava; sem texto entra aprovada, com texto vai para moderação); cada
   avaliação gera cupom pessoal AVALIA-XXXXX de R$ 20 (pedido mínimo R$ 60, 90 dias, 1 uso;
   colunas novas em cupons: desconto_valor, pedido_minimo, cliente_id, origem). E-mail ficou de
   fora (Resend mostra 0 aberturas). WhatsApp com link por token: adiado, Anderson decide depois.
5. **Recorrência** — FEITO 13/09: monitor semanal de links (lib monitor-links + cron
   monitor-links diário, 25 por lote, cada link 1x/semana, Serper para "site:"), selos
   No ar/Link ativo/Indexado em Meus Links, alerta Telegram quando link cai; cartão
   "Próximo passo" (3 portais de notícias via /api/recomendacoes, sem nicho) quando tudo
   está publicado; e-mail relatorio-30d (cron diário, 30 a 45 dias após publicação).
   Primeira rodada: 94 links, 28 NÃO indexados (30%), 1 link removido pelo portal
   (saojoaquimonline, pedido CC20822D, cliente tarotconsulta). gazetadasemana bloqueia
   robô (403) e fica como "não conferido". Só 2 de 94 tinham ido ao Rapid Indexer.
6. **Cadastros sem compra** — FEITO (parte 1) 13/09: cartão "Primeira compra: 10% com
   PRIMEIRA10" no topo de Minha Conta para quem nunca pagou um pedido (+ 3 portais sugeridos),
   e no checkout um botão "Aplicar" com o cupom para cliente logado sem compra. Sequência de
   e-mail de boas-vindas NÃO feita (Anderson desconfia de e-mail; ver aberturas na Resend).
7. **Publishers pendentes** — DESCARTADO por Anderson (sites ruins). Esquecer.
8. **Blog** — RETOMADO 13/09: Anderson manda transcrições de vídeos/posts do Instagram que gosta e eu
   converto em artigo original (não copiar; citar fontes primárias). Pipeline: scratchpad
   `artigo_<slug>.py` + `montar_generico.py <modulo> "<kw>"` (valida A/B/C) → `<slug>.json` →
   VPS `scripts/publicar-artigo.mjs scripts/<slug>.json` + imagem em public/blog-images/<slug>.webp
   (banco_img.py, foto real) → **precisa de ./deploy.sh** para o Next servir a imagem nova
   (public/ é lido no build) → purge + IndexNow. Publicados: /blog/site-penalizado-pelo-google (129), /blog/geo-vs-seo (130, na série de /geo), /blog/primeiro-link (131, prática QMIX: link do cliente sempre é o primeiro da matéria), /blog/posicao-no-google (132, 14/09: personalização/local/hora; fontes = páginas de ajuda do Google; foto Pexels 35969). Exemplos sempre adaptados ao Brasil (diretórios BR, dados do simulador da QMIX).
   REGRAS DO ANDERSON para esses artigos: mostrar a pauta ANTES de escrever (ele reprovou o
   primeiro por não ter sido consultado); a transcrição é referência, não roteiro: sem metáforas/
   fábulas do vídeo (rejeitou 'menino que gritava lobo' e a foto de pastor); só fatos técnicos,
   datados, com fonte primária. Slug permanente + fatos datados no texto + 'Atualizado em'.
   REGRA (13/09): o PRIMEIRO link do corpo é o mais forte e deve ser interno, para a página comercial
   alvo (/geo, /comprar-backlinks), antes de qualquer link externo; pode repetir mais abaixo.
   Trocar imagem de artigo exige NOME DE ARQUIVO NOVO (cache de imagem do Next/edge segura o antigo).
   Indexação automática de publicações novas: ADIADA (sistema de geração+publicação automática em
   implantação; testar quando estiver pronto).
9. **Receita** R$ 1k a 4,6k/mês, ticket ~R$ 300; GEO + afiliados de tráfego pago são a aposta.

Já feito no mesmo dia: PayPal desativado (nunca teve credencial), simulador de IA em /geo,
rastreio de cliques de afiliado + relatório admin.

**How to apply:** ao retomar, ler este arquivo, pegar o próximo item não concluído e atualizar
o status aqui ao terminar.
