---
name: project_advdobrasil_backlinks_rodada2
description: "advdobrasil.com.br rodada 2 (13/09/2026) - 20 guest posts na rede propria para paginas de conversao (credito rural, multas ambientais, reserva legal, licenciamento, advogado ambiental Goiania); Apex 1180153 enviado, rodada fechada"
metadata: 
  node_type: memory
  type: project
  originSessionId: 11d63bfc-1400-4f76-816e-cd634e1dbc24
  modified: 2026-09-13T13:36:50.470Z
---

Rodada 2 do advdobrasil.com.br em 13/09/2026: 20 guest posts na rede propria (17 opengravity, 2 clinicas-vps,
1 srv1166087), pipeline em D:/tmp/ab. Rodada 1 (11/09) foi na rede de parceiros do Jean, 5 posts, tudo para
/alongamento-de-divida-rural/ (Apex 1174187). O cliente e escritorio de direito ambiental e credito rural em
Goiania; o blog migrou de blog.advdobrasil.com.br para /blog/ (301), por isso o operador mandou medir o GSC em
24 horas (gsc24.py, dimensao HOUR, SA enjai; a SA backlinkguard da 403 nesse dominio).

Destinos: juros-abusivos-em-cedula-de-credito-rural (o exemplo que o operador deu), cedula-de-credito-rural,
cedula-de-produto-rural, embargos-a-execucao (nao indexada), impenhorabilidade, recuperacao-judicial-do-produtor,
securitizacao, contrato-de-arrendamento (nao indexada), /alongamento-de-divida-rural/, /defesa-de-multas-ambientais/,
requisitos-para-anular, como-recorrer, pedido-de-reducao, multa-ambiental-herdeiros, defesa-de-embargo,
quem-ja-recebeu-da-samarco, compensacao-de-reserva-legal, venda-de-terra-para-reserva-legal,
/assessoria-juridica-para-licenciamento-ambiental/, /advogado-ambiental-em-goiania/.

Portais usados (nenhum repetir para este cliente): sabedoriaglobal, wtw19, df8, incast, adonline, saberdefato,
opopularjornal, diariopernambucano, viajenodetalhe, azulmagazine, desassossegada, pontonaturalbrasil,
jornaldobairroalto, publisherbrasil, advivo, revistarumo, curiosododia (og), agencianacional, jornalacapital (cv),
jornaldiario (srv). advivo e revistarumo entraram no lugar de exquisito e folhadonoroeste (acervo sem tema).

Armadilhas: gate.py/verif.py prefixam o dominio ao campo dest, entao plano.json guarda dest como caminho;
o Bash do Windows quebra heredoc com aspas em scripts longos, usar Write; palavra proibida dentro de <li> nao e
pega pelo val2 (grep separado); "proporcion" e "resolução" apareceram em textos juridicos e foram trocados.

**Estado:** no ar, verif/seo_check/auditar ar 20/20 OK, IndexNow disparado, planilha
D:/PORTAIS/BACKLINKS/advdobrasil.com.br.xlsx com 25 linhas. **Apex enviado em 13/09/2026, project 1180153** (60 creditos, saldo 5008 -> 4948). Rodada FECHADA. Lista em D:/SISTEMAS/INDEXADORES/urls/advdobrasil-rodada2.txt.

**Why:** proxima rodada precisa saber os 25 portais ja usados (5 parceiros + 20 proprios) e que o Apex ja foi enviado. **How to apply:** ler a planilha antes de nova rodada; ideias nao usadas nas Notas.
