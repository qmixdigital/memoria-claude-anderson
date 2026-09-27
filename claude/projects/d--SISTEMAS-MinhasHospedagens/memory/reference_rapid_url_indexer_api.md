---
name: reference_rapid_url_indexer_api
description: "API do Rapid URL Indexer para forçar indexação de URLs; USO RESTRITO, só com autorização explícita do operador em cada uso, porque gasta crédito pago"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-17T09:07:15.833Z
---

**USO RESTRITO. Só chamar quando o operador autorizar explicitamente naquela conversa.** Cada URL enviada consome 1 crédito pago, então nunca disparar por iniciativa própria, nem "de brinde" ao publicar artigo, nem em lote de varredura. Autorização dada uma vez não vale para a próxima.

Serviço: <https://rapidurlindexer.com/> (serviço externo de indexação, não é IndexNow nem API do Google). Chave: `<<REMOVIDO>>` (header `X-API-Key`).

Base: `https://rapidurlindexer.com/wp-json`

| Ação | Chamada |
|---|---|
| Saldo | `GET /api/v1/credits/balance` → `{"credits":N}` |
| Enviar URLs | `POST /api/v1/projects` com `{"project_name":"...","urls":[...],"notify_on_status_change":false}` → `{"message":"Project created and submitted","project_id":N}` |
| Status | `GET /api/v1/projects/{id}` → traz `status`, `submitted_links`, `indexed_links` |
| Relatório | `GET /api/v1/projects/{id}/report` |

**Pegadinha:** o site roda LiteSpeed e devolve **403 para o User-Agent padrão do curl**. Sempre mandar `-A` com UA de navegador, senão parece que a chave está errada quando o problema é o WAF. Limite de 100 requisições por minuto por chave.

Uso registrado: 17/08/2026, projeto 1107835 com os 2 guest posts da Vaga Automática (saldo caiu de 639 para 637).

Uso registrado: 01/09/2026, projeto 1148110 com os 5 guest posts do danfemax (saldo 965 → 960).

Para indexação que não gasta crédito existe o IndexNow, automático na rede via mu-plugin (ver [[reference_indexnow_rede]]). Leitura de dados do Search Console é por outra via, ver [[reference_api_google_indexacao_autorizada]].

Uso registrado: 07/09/2026, projeto **1164360** com os 10 guest posts do enjai.com.br (saldo 711 -> 701). Enviado depois de corrigir a densidade, para submeter a versão final.

Uso registrado: 09/09/2026, projeto **1170423** com o guest post da TTAC (cliente Daiane) no saudevitalidade (saldo 651 -> 650).

Uso registrado: 09/09/2026, projeto **1170559** com **apenas a URL de categoria** https://publisherbrasil.com.br/categoria/livros/ (saldo 650 -> 649). Teste de indexacao por categoria: os 10 artigos novos de /livros/ foram deixados de FORA de proposito, para medir se o Google chega neles pela categoria.

Uso registrado: 10/09/2026, projeto **1172934** com os 20 guest posts do figa2023.com.br (saldo 523 -> 503).

Uso registrado: 10/09/2026, projeto **1173092** com os 10 guest posts do peritodicas.com (saldo 503 -> 493).

Uso registrado: 10/09/2026, projeto **1173315** com os 20 guest posts do rotaambiental.com.br (saldo 490 -> 470).

Uso registrado: 11/09/2026, projeto **1174187** com as 5 matérias da advdobrasil na rede do Jean (saldo 467 -> 462).

Uso registrado: 11/09/2026, projeto **1174595** com os 10 guest posts do goiania.pro na rede própria (saldo 462 -> 452).

Uso registrado: 11/09/2026, projeto **1175065** com os 10 guest posts do eletricistasemgoiania.com.br na rede própria (saldo 452 -> 442).
Uso registrado: 11/09/2026, projeto **1175230** com os 10 guest posts do consultarimovel.ia.br na rede própria (saldo 442 -> 432).
Uso registrado: 11/09/2026, projeto **1175287** com os 10 guest posts da rodada 2 do facoqr.com.br na rede própria (saldo 432 -> 422).
Uso registrado: 11/09/2026, projeto **1175561** com os 10 guest posts do certificadodigital.seg.br na rede própria (saldo 422 -> 412).
Uso registrado: 11/09/2026, projeto **1176198** com os 10 guest posts do bloco 1 do rblc.com.br (lote 7, 28 temas IPTV) na rede própria (saldo 412 -> 402).
Uso registrado: 11/09/2026, projeto **1176380** com os 17 guest posts dos blocos 2 e 3 do rblc.com.br (lote 7) na rede própria (saldo 402 -> 385).
Uso registrado: 12/09/2026, projeto **1177722** com os 26 guest posts do lote 2 do figa2023.com.br (todos para a home, âncoras variadas) na rede própria (saldo 385 -> 359).
Uso registrado: 12/09/2026, projeto **1177933** com os 36 guest posts do lote 8 do rblc.com.br (7 home + 29 páginas internas) na rede própria (saldo 359 -> 323).
- 12/09/2026: personalverificado rodada 2, 20 URLs Apex, project 1178409, saldo 323 -> 263.
- 12/09/2026: ferramentas.qmix rodada 2, 20 URLs Apex, project 1178623, saldo 263 -> 203.

- 12/09/2026 saudevitalidade rodada1: project 1178717, 20 URLs, 60 creditos, saldo 203 -> 143

- 12/09/2026 vidracariaperto rodada2: project 1178844, 20 URLs, 60 creditos, saldo 159 -> 99
- 13/09/2026: project 1179756, marmorariasperto rodada 2, 20 URLs, 60 creditos (saldo 99 -> 39).
- 13/09/2026: pacote novo comprado (saldo 5068). project 1180048, encontreleiloes rodada 2, 20 URLs, 60 creditos (saldo 5008).
- 13/09/2026: advdobrasil rodada 2, project 1180153, 20 URLs, 60 creditos, saldo 5008 -> 4948.

- 13/09/2026 rblc lote 9: projeto 1180458, 20 URLs, 60 créditos, saldo 4948→4888
- 13/09/2026 cartorio lote 1: projeto 1180560, 20 URLs, 60 créditos, saldo 4888→4828
- 13/09/2026 certificadodigital rodada 2: projeto 1180875, 20 URLs, 60 créditos, saldo 4828→4768
- 13/09/2026 sitegratis lote 1: projeto 1181007, 20 URLs, 60 créditos, saldo 4768→4708
- 13/09/2026 projeto 1181193: setorenergetico lote 1 (20 URLs, 60 creditos, saldo 4579->4519)
- 13/09/2026 projeto 1181427: truenet lote 1 (20 URLs, 60 creditos, saldo 4519->4459)
- 15/09/2026 projeto 1184713: instagram-drthiagocaixeta rodada 1 (20 URLs; cobrou 20 creditos, nao 60 — a tarifa caiu para 1/URL; saldo 4454->4434)
- 15/09/2026 projeto 1184910: instagram-josemario rodada 1 (20 URLs, 20 creditos, saldo 4434->4414)

- 18/09/2026: projeto 1194404 (medicinageriatrica.com.br, 20 URLs). Conta recarregada: saldo 4.039 antes; cobrou 1 crédito por URL (20), não mais 3. Saldo 4.019.
- 19/09/2026: projeto 1194526 (revistamsaude.com.br, 20 URLs, 20 créditos). Saldo 3996.
- 1195438 (19/09/2026): personalverificado rodada 2, 20 URLs, 20 créditos (saldo ~3.974)
- 20/09/2026: projeto 1196577, rotaambiental.com.br lote 2 (20 guest posts industriais na rede própria), 20 créditos, saldo 3964 -> 3944.

20/09/2026: projeto 1196788, drthiagocaixeta Instagram rodada 2, 20 créditos, saldo 3941 -> 3921.

20/09/2026: projeto 1197018, advdobrasil rodada 3 (10 Jean + 10 rede), 20 créditos, saldo 3921 -> 3901.

21/09/2026: projeto 1197988, Casa da Toalha tier 2 (6 posts -> matéria do r7), 6 créditos, saldo 3901 -> 3895.
- projeto 1201075 (22/09/2026): Jose Mario rodada 2, 20 URLs, 20 creditos (3951 -> 3931)
