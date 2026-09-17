---
name: project_truenet_backlinks_lote1
description: "truenet.com.br (painel SMM) lote 1 de backlinks para 20 paginas de venda, FECHADO 13/09/2026, Apex 1181427"
metadata: 
  node_type: memory
  type: project
  originSessionId: 11d63bfc-1400-4f76-816e-cd634e1dbc24
  modified: 2026-09-13T23:29:50.529Z
---

Lote 1 de backlinks do truenet.com.br (painel SMM: seguidores, curtidas, views por PIX):
20 guest posts na rede propria (portal-engine), 1 por pagina de venda, publicados em
13/09/2026. Destinos escolhidos pelo GSC do cliente (SA enjai, 90 dias) entre as paginas
"comprar-..." com impressao alta e posicao 5 a 33 (paginas "gratis", /blog e /ferramentas
ficaram de fora por nao venderem).

Fonte da verdade: `D:/PORTAIS/BACKLINKS/truenet.com.br.xlsx` (21 linhas, aba Notas).
Pipeline em `D:/tmp/tru/` (art/*.py, plano_build.py, lote_ar.json, fichas.json, usados.json,
gsc_portais.py que varre o GSC de N portais por termo social).
Lista para indexacao: `D:/SISTEMAS/INDEXADORES/urls/truenet-lote1.txt`.

**Status: FECHADO.** Publicado, auditado (0 erros reais) e enviado ao Apex em 13/09/2026,
projeto **1181427** (20 URLs, 60 creditos, saldo 4519->4459).

**Achado para o cliente:** www.truenet.com.br responde 200 sem 301 para a raiz; canonical
aponta a raiz, mas o Google indexa as duas versoes e divide impressoes. Sugerir 301.

**Why:** o banco de palavras-chave (D:\PORTAIS\palavras-chave) quase nao tem termo de
redes sociais; as pautas vieram do acervo social de cada portal + GSC dos hospedeiros.
Portais com mais acervo social (por slug): wtw19, todossomosgeek, romanceseleituras,
advivo, curiosododia, adonline, opopularjornal, cameracotidiana, incast, qmixdigital.

**How to apply:** proximo lote nao repete estes 20 portais para este cliente (coluna Portal
da planilha); restam ~20 portais elegiveis com acervo social (ex.: divirto, desassossegada,
euvo, exquisito, gpnoticias, jornalacapital, olharmoderno, manacultura, portalr5,
viajenodetalhe, saberdefato, oiempreendedores, universoneo). Ver
[[reference_rapid_url_indexer_api]] e [[feedback_registro_backlinks_por_dominio]].
