# Validação e Verificação Factual

Regras que entram entre a redação e a entrega da matéria.

---

## 1. Validação obrigatória antes de entregar

Depois de gerar o DOCX, rode nesta ordem:

```bash
python /mnt/skills/public/docx/scripts/office/validate.py [arquivo].docx
python /mnt/project/validador_materia.py [arquivo].docx --links N
```

`N` é a quantidade de links pedida no briefing.

Se aparecer bloqueio (marcado com `XX`), corrija no `.js` de origem, rode
`node gen.js` de novo e revalide. Não entregue com bloqueio pendente.

Se o score de humanização ficar abaixo de 70, reescreva os pontos apontados no
relatório antes de gerar o arquivo final. As métricas estruturais (variedade de
frases, abertura de parágrafos, diversidade lexical, estrutura consecutiva) são
as que mais pesam e exigem reescrita real, não troca de palavra.

### O que o validador checa

**Camada A, bloqueantes:** título ≤ 70 caracteres, sem exclamação, aviso se
"Google" aparecer no título, zero travessões, termos proibidos com o trecho onde
aparecem, contagem de palavras, quantidade de links igual à do briefing, âncoras
extraídas, link fora do primeiro e do último parágrafo, distância mínima de 3
parágrafos entre links, bullets no corpo, contagem de H2.

**Camada B, humanização (score 0 a 100):** dez métricas. Cada uma em estado ruim
tira 10 pontos, em alerta tira 5. Alvo mínimo 70.

| Métrica estrutural | O que mede | Alvo |
|---|---|---|
| Variedade de frases | variação do tamanho das frases | CV ≥ 0,45 |
| Abertura de parágrafos | % que começa com a mesma palavra | < 30% |
| Diversidade lexical | TTR médio em janelas de 100 palavras | ≥ 0,60 |
| Estrutura consecutiva | frases seguidas com mesma abertura | máx 2 |

O filtro de "soluç" reporta separadamente quando a origem é "resolução".

---

## 2. Verificação factual

Antes de gerar o DOCX, verifique via web search cada nome, data, número, cargo,
preço, credencial e estatística do texto.

Sem evidência, marque como não verificado e não corrija por conta própria.

Aplique apenas correções pontuais, trecho por trecho. Não reescreva o artigo nem
altere partes de estilo. Nunca insira nota de verificação dentro do artigo.

### Tipos de erro

| Tipo | O que é |
|---|---|
| `fabricated` | dado, fonte ou citação que não existe |
| `false_connection` | o título promete algo que o texto não entrega |
| `false_context` | informação verdadeira em contexto temporal ou causal errado |
| `misleading` | percentual sem base, comparação injusta |
| `temporal` | evento passado descrito no futuro, data errada |
| `unattributed` | alegação grave com "estudos mostram" sem citar o estudo |

### Severidade

- **high** — dado central, preço, data, pessoa ou cargo errado
- **medium** — dado secundário incorreto, fonte imprecisa
- **low** — arredondamento agressivo, desatualização não crítica

### Regras de segurança

- Se o trecho a corrigir aparece mais de uma vez, identifique a ocorrência certa
  pelo contexto antes de substituir.
- Falha na verificação nunca destrói o artigo. Na dúvida, mantenha o original e
  sinalize o ponto.
- Se houver problema detectado sem correção aplicável, o status é
  **needs_review**, nunca "pass". Isso precisa aparecer no resumo de entrega.

### Status no resumo de entrega

| Status | Significado |
|---|---|
| `pass` | nada a corrigir |
| `corrected` | todas as correções aplicadas |
| `partially_corrected` | parte aplicada, parte pendente |
| `needs_review` | problema detectado sem correção aplicável, precisa de decisão |

---

## 3. Preset de imagem para publicação

Ao subir imagem pelo MCP (`subir_imagem`):

- Formato WebP
- 1200x675 quando a imagem for horizontal
- Qualidade 75, método de compressão 6
- Nome do arquivo em slug da keyword
- Alt descritivo
