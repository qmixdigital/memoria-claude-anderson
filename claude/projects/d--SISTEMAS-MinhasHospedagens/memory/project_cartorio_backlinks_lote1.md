---
name: project_cartorio_backlinks_lote1
description: cartorio.srv.br lote 1 (13/09/2026): primeiro lote do cliente, 20 guest posts para as 10 categorias de conversão (home, /certidao-online/, 8 /servicos/), 2 por página; FECHADO, Apex 1180560
metadata:
  type: project
---

cartorio.srv.br é diretório de cartórios (Next, 16 mil serventias, sitemaps por
estado/cidade/atribuição/serviço). GSC quase zerado em 09/2026 (164 impressões,
2 cliques em 28 dias; SA backlinkguard lê, enjai dá 403). Nunca tinha recebido
backlink antes deste lote (planilha criada agora).

Lote 1, 13/09/2026: 20 posts, tema cartório, 2 por destino: /, /certidao-online/,
/servicos/{registro-de-imoveis, registro-civil, cartorio-de-notas, protesto,
procuracao, reconhecimento-de-firma, autenticacao-de-documentos,
titulos-e-documentos}. Hospedeiros por acervo jurídico/imobiliário, fora dos 31
vetados e da saúde: 17 opengravity (cameracotidiana, curiosododia, opopularjornal,
jornaldobairroalto, azulmagazine, diariopernambucano, incast, revistadeducao,
advivo, divirto, universoneo, saberdefato, blogse, df8, revistarumo, qmixdigital,
adonline), 2 clinicas-vps (agencianacional, jornalacapital), 1 srv1166087
(jornaldiario). Pautas usadas: cartório competente, diferença cartório x
tabelionato, matrícula atualizada, averbação de construção, 2ª via certidão de
nascimento, documentos casamento civil, escritura de compra e venda, ata notarial,
nome protestado, cancelamento de protesto, procuração p/ venda de imóvel,
revogação de procuração, firma por autenticidade, abertura de firma, cópia
autenticada, autenticação digital, notificação extrajudicial, registro de
contrato, certidão de inteiro teor, apostila de Haia.

Estado: 20/20 no ar, 3 links de entrada cada, verif/seo_full/auditar ar OK,
planilha D:/PORTAIS/BACKLINKS/cartorio.srv.br.xlsx criada (21 linhas).
URLs em D:/SISTEMAS/INDEXADORES/urls/cartorio-lote1.txt. **Apex NÃO enviado**:
aguardando autorização (20 URLs = 60 créditos, saldo 4888).

Pipeline em D:/tmp/cart (plano_build.py, art/, stock_img.py, pub.sh, verif.py,
seo_full.py, planilha.py). Armadilha: cameracotidiana tinha 2 hospedeiros sem
`<p>` (conteúdo antigo) → entrada.py pula ("sem paragrafos"); trocar hosts.

**Why:** não repetir pauta/portal no lote 2 e fechar o Apex quando autorizado.
**How to apply:** lote encerrado; para o lote 2 não repetir pautas/portais acima. Comando Apex usado: `cd D:/SISTEMAS/INDEXADORES/scripts && python
submit_index.py ../urls/cartorio-lote1.txt "cartorio lote 1" --apex`, anotar
projeto em [[reference_rapid_url_indexer_api]] e na aba Notas do xlsx.
Ver [[feedback_registro_backlinks_por_dominio]].
