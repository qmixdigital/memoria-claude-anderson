---
name: feedback_pauta_por_oportunidade_gsc
description: "Pauta de guest post nasce de OPORTUNIDADE no Search Console do portal que vai hospedar, não do banco de keywords. Duas contas de service account cobrem a rede inteira. Qualidade acima de velocidade, um artigo por vez."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-25T09:11:40.378Z
---

Ao escolher **onde** e **sobre o quê** escrever um guest post da rede, a ordem é:

1. **Primeiro: oportunidade no Google Search Console do próprio portal que vai hospedar.** Consulta com impressão relevante e posição ruim (fora do top 10) é conteúdo que o Google já mostra para aquele domínio, só não bem o suficiente. Escrever em cima disso multiplica a chance de o artigo trazer tráfego de verdade, em vez de nascer morto na posição 80.
2. **Depois, se não houver oportunidade boa:** banco de palavras-chave em `D:\PORTAIS\palavras-chave` (CSVs com volume/KD; preferir long tail 100-600 e KD<20; os arquivos `curadoria-*` já vêm com "slug livre na rede" e "rede já cobre o tema").

**Palavras do operador (24/08/2026):** *"buscar oportunidades de palavra-chave que encaixem o texto ou o link do cliente no próprio Google Console fará com que as chances de tráfego do conteúdo sejam bem maiores... oportunidades no Google Console é o mais incrível"*.

**As duas chaves cobrem a rede inteira** (uma sozinha via só ~47 de 103 domínios):
- `C:\Users\User\Documents\APIs\backlinkguard-google-sa.json`
- `C:\Users\User\Documents\APIs\enjai-493011-5bc78ff8f355.json`

Consultar as duas e unir os resultados. Padrão de leitura que funciona: `AuthorizedSession` + POST em `searchAnalytics/query`, testando a propriedade em três formas (`sc-domain:`, `https://dominio/`, `https://www.dominio/`). Dimensão `page` para achar artigo com tráfego; `query` para achar oportunidade de pauta; `["query","page"]` para saber qual URL já pega qual consulta.

**Ritmo:** o operador pediu explicitamente **qualidade acima de velocidade** — *"pode seguir sem pressa, conteúdo de qualidade, pode fazer um por um, não estou com pressa"*. Não espremer lote grande às custas do texto.

**Autonomia sobre âncora:** pode corrigir âncora com erro de ortografia ou que não faça sentido com a página de destino (caso real: âncora "hérnia de disco" apontando para página de "prótese de quadril" — ajustar a âncora ao conteúdo real do destino).

**Sugestões são bem-vindas:** o operador pediu para apresentar ideias novas quando surgirem durante o trabalho.

Ver [[reference_runbook_backlinks_clientes]], [[feedback_padrao_links_guest_post]], [[reference_pesquisa_palavras_chave_portais]] e [[feedback_registro_backlinks_por_dominio]].
