---
name: nginx-keepalive-reset-502
description: "502 intermitente em qualquer rota dos apps Next na opengravity (smoke \"painel HTTP 502\" etc.) - reset de keepalive nginx x Node com a porta -b desligada; corrigido com keepalive_timeout 3s nos upstreams em 13/09/2026"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5b0e314b-e734-4943-99e2-3defe71f3ead
  modified: 2026-09-13T09:55:44.123Z
---

Sintoma: smoke tests avisando "GELADEIRASTOP/ARCONDI smoke FALHOU: <rota>: HTTP 502"
em rotas aleatorias, poucas vezes por dia. Em 13/09/2026 eram 64 502 reais/dia
na opengravity (consultarimovel 36, geladeirastop 14, notebookx 8...).

Assinatura no /var/log/nginx/error.log, sempre em par:
  recv() failed (104: Connection reset by peer) while reading response header from upstream
  no live upstreams while connecting to upstream  -> 502

Mecanismo: `keepalive 32` no upstream reaproveita conexao ociosa que o Node ja
fechou (keepAliveTimeout padrao 5s) -> reset. O nginx tenta o outro servidor
do upstream, a porta -b, que por regra fica DESLIGADA fora de deploy -> ninguem
-> 502. Fora do deploy cada requisicao tem uma chance so.

Correcao (13/09/2026): `keepalive_timeout 3s;` logo apos `keepalive N;` em
TODOS os blocos upstream de /etc/nginx/conf.d (12 arquivos, backups
*.bak-keepalive-*). Menor que os 5s do Node = nginx fecha primeiro, sem reset.
Teste: 30 requisicoes espacadas de 5,3s em /painel/ -> 30 ok, 0 resets.

**Why:** a arquitetura "-b efemera" (regra do CLAUDE.md) tira a rede de
seguranca do failover fora do deploy; qualquer reset vira 502.

**How to apply:** todo upstream novo com `keepalive` precisa de
`keepalive_timeout 3s` (ou subir o keepAliveTimeout do Node acima do nginx).
Vale para clinicas-vps e qualquer VPS com o mesmo padrao. Ver tambem
[[pm2-needrestart-dump-race]].
