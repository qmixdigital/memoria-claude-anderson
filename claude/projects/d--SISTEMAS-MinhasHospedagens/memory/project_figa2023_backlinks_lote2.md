---
name: project_figa2023_backlinks_lote2
description: figa2023.com.br lote 2 (12/09/2026): 26 guest posts IPTV para a home, nos mesmos 27 portais do lote 7 do rblc (menos oiempreendedores), ancoras todas distintas; pipeline em d:/tmp/figa2
metadata:
  type: project
---

**Lote 2 do figa2023.com.br (12/09/2026)**: 26 guest posts, **todos para a home** https://figa2023.com.br/ com 26 âncoras distintas (nenhuma repete as 20 do lote 1), nos mesmos portais do lote 7 do rblc; **oiempreendedores ficou fora** porque já tinha link do figa no lote 1. Temas diferentes dos que cada portal recebeu para o rblc (Chromecast, dados no celular, instável, futebol, iPhone, Fire Stick, tablet, TV LG, cidades: Brasília, Maceió, BH, Goiânia, SP, Recife, Porto Alegre, Rio, Curitiba, etc.). Planilha D:/PORTAIS/BACKLINKS/figa2023.com.br.xlsx linhas 22–47, Notas "Lote 2 - bloco 1/2/3". Apex enviado em 12/09/2026, projeto 1177722, 26 URLs (saldo 385 -> 359); lote encerrado.

**Why:** o Anderson pediu "todos para home com âncoras variadas" e os mesmos portais do rblc; cada post ganhou como link interno o guest post do rblc do mesmo portal (nicho) + 1 artigo do nicho, e como links de entrada o post do rblc + 2 hospedeiros. Imagens Pexels com exclusão dos IDs já usados na rede (usados.json) para não repetir foto entre portais.

**How to apply:** pipeline em d:/tmp/figa2 (plano.json com bloco 1/2/3, art_b1/art_b2/art, pub_figa.js, entrada2.py com MAPA, planilha.py N). Armadilhas: montar_lote.py NÃO limpa payload/ (rm antes); entrada2.py precisa de `portal not in pub: continue`; auditar densidade mínima 1% para kw de 2 palavras exige 7+ ocorrências em body+h1+dek sem passar de 8 no corpo local (tirar a kw de um H3 resolve). Ver [[project_rblc_backlinks_lote7_iptv28]] e [[project_figa2023_backlinks_lote1]].
