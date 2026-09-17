---
name: reference_pesquisa_palavras_chave_portais
description: Banco de palavras-chave em D:\PORTAIS\palavras-chave é a fonte para escolher keyword de guest post e pauta nos portais
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-17T10:17:37.878Z
---

Quando o operador pedir pesquisa de palavra-chave para conteúdo nos portais, consultar **`D:\PORTAIS\palavras-chave`** antes de qualquer outra fonte. São exportações de ferramenta com o cabeçalho `Keyword,Volume,Keyword Difficulty,CPC (BRL),SERP Features,Number of Results`, mais arquivos `curadoria-*.csv` já agrupados por tema.

Filtro rápido por volume e dificuldade:

```bash
awk -F',' 'tolower($1) ~ /termo/ && $2+0>0 {printf "%-55s vol=%-6s kd=%s\n",$1,$2,$3}' *.csv | sort -t= -k2 -rn
```

Preferir **long tail** com volume de 100 a 600 e KD abaixo de 20, que é onde os portais da rede conseguem posicionar.

O banco cobre temas gerais (casa, carreira, cálculo, loteria, filme, saúde). **Não há praticamente nada de IPTV**: a única entrada útil no primeiro uso foi "como assistir tv sem internet". Para projeto de IPTV, o caminho que funcionou foi atacar o cluster vizinho de TV e streaming ("qual melhor aparelho para transformar tv em smart", "como colocar internet na tv que não é smart") e inserir o link do cliente como complemento natural.

Relacionado: [[reference_portal_engine_publish_articles]], [[reference_dados_cliques_trafego_sites]].
