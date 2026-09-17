---
name: google-console-analise
description: Análise especializada de exportações do Google Search Console para diagnóstico SEO de clientes e projetos próprios. Use sempre que o usuário enviar arquivos zip ou CSV exportados do Google Search Console, mencionar "GSC", "Search Console", "relatório de desempenho na pesquisa", pedir análise de evolução de cliques/impressões/posição de um site, diagnóstico de queda de tráfego orgânico, detecção de canibalização de keywords, ou análise de oportunidades de link building baseada em dados de posição. Também use quando o usuário pedir relatório SEO mensal de cliente da QMIX Digital com base em dados do Search Console.
---

# Análise Especializada de Google Search Console

Framework de análise baseado na metodologia query + página. Métricas macro do GSC (cliques totais, CTR médio, posição média do site) são inúteis isoladas. Todo diagnóstico deve descer ao nível de página individual e query individual.

## Contexto do usuário

O usuário (Anderson) é fundador da QMIX Digital, agência de SEO e link building. Ele mesmo faz as análises de SEO dos clientes. As saídas devem:
- Nunca usar travessão (em dash) em nenhum texto gerado
- Escrever a marca sempre como "QMIX Digital", nunca "QMIX" sozinha
- Conectar diagnósticos de autoridade a oportunidades de link building quando fizer sentido (backlinks editoriais em portais de notícias são o produto da agência)
- Ser escritas em português brasileiro

## Formato dos arquivos de entrada

Exportação padrão do GSC é um zip contendo (nomes em pt-BR):
- `Consultas.csv`: colunas `Top consultas, Cliques, Impressões, CTR, Posição` (máximo 1000 linhas)
- `Páginas.csv`: colunas `Páginas principais, Cliques, Impressões, CTR, Posição`
- `Gráfico.csv`: colunas `Data, Cliques, Impressões, CTR, Posição` (série diária)
- `Países.csv`, `Dispositivos.csv`, `Aspecto da pesquisa.csv`, `Filtros.csv`

Notas de parsing:
- `Filtros.csv` informa o período ("Últimos 3 meses", "Últimos 6 meses" etc). Sempre ler primeiro para identificar cada arquivo.
- CTR vem como string com "%". Posição usa ponto decimal. Cliques e impressões são inteiros sem separador.
- Nomes de arquivo podem vir em inglês (`Queries.csv`, `Pages.csv`, `Chart.csv`) se a conta estiver em inglês. Detectar pelo cabeçalho.
- Se o usuário enviar múltiplos zips, provavelmente são janelas sobrepostas (3m, 6m, 12m). Não são períodos adjacentes.

## Fluxo de análise (executar nesta ordem)

### Passo 0: Identificação e sanidade
Extrair todos os zips, ler `Filtros.csv` de cada um, identificar períodos. Agregar `Gráfico.csv` do período mais longo por mês para ver a trajetória. Procurar anomalias: picos ou vales abruptos de impressões podem indicar invasão de site (hack com redirects, comum inflar impressões em milhões antes do colapso), penalização, migração ou core update. Perguntar ao usuário sobre anomalias antes de tratá-las como problema de SEO.

### Passo 1: Perdas e ganhos concentrados
Se houver janelas sobrepostas (ex: 3m e 6m), derivar o período anterior por subtração: anterior = valor_6m menos valor_3m, página a página. Ordenar por delta de cliques. Reportar:
- Total agregado e variação percentual período contra período
- Top 10 páginas que perderam e top 10 que ganharam
- Atenção: página que caiu a zero enquanto uma quase idêntica ganhou é consolidação de índice, não perda real. Verificar antes de alarmar.

### Passo 2: Gap de queries ocultas
Somar cliques do `Consultas.csv` (top 1000) e comparar com a soma do `Páginas.csv`. A diferença é o tráfego de cauda longa oculto pelo Google. Em sites de conteúdo informacional (sintomas, dúvidas) o oculto costuma ser 60 a 85% do total. Reportar o percentual e explicar que otimizar só pela lista de queries visíveis subestima o valor das páginas.

### Passo 3: Diagnóstico por posição (buckets)
Classificar cada query com 500+ impressões:
- **OK**: posição <= 3 e CTR >= 1,5%, ou posição <= 3 com CTR razoável para o nicho
- **Problema de conteúdo/title**: posição <= 3 e CTR < 1,5%. ATENÇÃO: em queries informacionais (médicas, definições, "o que é"), CTR baixo no top 3 frequentemente é AI Overview, featured snippet ou painel do Google absorvendo cliques, não title ruim. Recomendar verificação manual da SERP antes de reescrever qualquer coisa.
- **Porta da click zone**: posição entre 4 e 15. É a principal alavanca de crescimento e o principal argumento de link building: subir 3 ou 4 posições aqui multiplica cliques. Ordenar por impressões e listar as top 10 a 15 como alvos prioritários de backlinks.
- **Falta de autoridade**: posição > 30. A página não consegue entrar no índice. Recomendar retarget para cauda longa ou plano de link building mais pesado. Se este bucket estiver vazio, destacar: significa que o domínio tem autoridade e as batalhas são todas vencíveis.

A "click zone" é posição 1 a 3 para termos pequenos e 1 a 7 (até 16) para termos de altíssimo volume. Fora dela, o title é irrelevante porque ninguém vê.

### Passo 4: Detecção de canibalização
Duas páginas do mesmo site disputando o mesmo índice de keyword se bloqueiam em rotação e nenhuma consolida posição. Método com dados de exportação (que não têm o cruzamento query x página):

1. Tokenizar slugs removendo stopwords pt-BR (de, da, do, na, no, a, o, e, em, que, para, das, dos, nas, nos, ao, pode, ser, com, um, uma, por)
2. Calcular similaridade Jaccard entre pares de páginas com 1000+ impressões
3. Pares com similaridade >= 60% são candidatos
4. FILTRAR FALSOS POSITIVOS manualmente: páginas de graus/estágios/tipos diferentes do mesmo tema (grau 1, 2, 3, 4; tipo A, tipo B) são conteúdos legítimos distintos, não canibalização. Slugs com "-2" no final são duplicatas de WordPress e quase sempre canibalização real.
5. Para cada par confirmado, indicar a vencedora (mais cliques e melhor posição) e a ação: redirect 301 da perdedora para a vencedora, ou despublicar a perdedora e remover o termo conflitante do title dela.

Sinais de canibalização nos dados: par de slugs quase idênticos (variação do/de/no/na), ambos com posição mediana (6 a 10) sem nenhum consolidar top 3, ou um par onde um zerou e o outro absorveu os cliques (já resolvido pelo Google, só confirmar redirect).

Se o usuário puder exportar da interface o filtro de uma query específica com a aba Páginas, isso dá o dado direto de quais páginas rotacionam naquela query. Sugerir para os 5 a 10 casos mais importantes.

### Passo 5: Oportunidades de CTR
Páginas com posição <= 8, impressões altas (definir corte pelo porte do site, ex: 100 mil+) e CTR < 1%. Calcular o ganho absoluto de cliques por 0,1 ponto de CTR para priorizar. Ações: teste de title, verificação de AI Overview na SERP.

### Passo 6: Relevância x autoridade
Páginas cujo title/slug não batem com o índice dominante desperdiçam autoridade (relevância de 50% usa só 50% da autoridade). Identificar páginas ranqueando para queries que não estão no slug/title e recomendar republicação com alinhamento total, desindexando a versão antiga.

## Formato do relatório de saída

Estrutura em prosa com seções numeradas, sem excesso de bullets:
1. Trajetória geral (com contexto de anomalias)
2. Estrutura do tráfego (incluindo gap de queries ocultas)
3. Diagnóstico por posição (com destaque para o bucket vazio ou cheio de autoridade)
4. Canibalizações confirmadas (lista com ação por caso)
5. Oportunidades de CTR
6. Plano de ação em ordem de prioridade (custo baixo primeiro)

Quando for relatório para cliente da QMIX Digital, incluir a conexão entre o bucket "porta da click zone" e a recomendação de campanha de backlinks nas páginas específicas listadas, com o dado que justifica.

## Regras de interpretação importantes

- Dados do GSC atrasam 24 a 72 horas e são amostra parcial. Nunca tratar ausência de dado recente como queda.
- Impressão conta mesmo quando o usuário não viu o resultado (posição 90 numa SERP que ninguém rolou). Posição média com poucas impressões é ruído.
- Query com uma palavra a mais é outro índice com outra posição. "dor nas costas lado direito" e "dor nas costas do lado direito" são competições separadas.
- Gaps (dias sem impressão) no histórico de uma página para uma query indicam que outra página do site a bloqueou naquela rotação.
- Nunca prometer resultado de posição. Reportar probabilidade e mecânica.
