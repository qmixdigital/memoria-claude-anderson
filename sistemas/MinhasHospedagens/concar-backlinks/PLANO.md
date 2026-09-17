# Backlinks: rede QMIX → home do Concar (kw "consulta placa")

**Alvo:** `https://www.concar.com.br/` (home) · **KW-cabeça:** consulta placa / consulta de placa
**Fonte:** rede QMIX (`../qmix_endpoints_atual.csv`, 111 sites) via endpoint `/artigos` (sistema Antônio).
**Objetivo:** ranquear a home no termo-cabeça. O SERP mostra que dá: placafipe.com.br rankeia **#2 com Domain AS 16 e 551 backlinks**. Poucos links bons já sobem.

> ⚠️ Manter **fora do repositório do Concar** (pegada de PBN). Conteúdo 100% original por site (regra CLAUDE.md) — nunca o mesmo texto em 2 sites (duplicate content penaliza).

## Regras anti-pegada (importante)
- **1 link contextual por artigo**, dentro do corpo (NUNCA footer/sidebar/sitewide).
- **Âncora variada** — cada âncora no máximo **2×** em toda a campanha (lista abaixo).
- **Frase ao redor do link varia** (não repetir o mesmo período).
- **Drip:** ~3–5 sites/dia, não os 111 de uma vez.
- **Relevância:** priorizar portais de **notícia geral** + auto-adjacentes (ex: pneusemgoiania). **Evitar** nichos de saúde/educação/filmes (link de placa lá fica artificial). O script já filtra esses.
- **Tema do artigo:** trânsito / compra de usado / golpe de placa / IPVA / Detran — onde o link cai natural.
- Conteúdo gerado **único por site** via DeepSeek.

## Âncoras (rotacionar; máx. 2× cada)
1. consulta de placa
2. consulta de placa do carro
3. consultar a placa do veículo
4. consulta veicular pela placa
5. consulta de placa completa
6. consultar placa online
7. consulta de placa de veículos
8. consultar placa de carro
9. consulta da placa do automóvel
10. consulta de placa rápida
11. consulta veicular por placa
12. consulta de placa com débitos e leilão

## Como rodar (drip)
```bash
# pré-requisito: chave DeepSeek no ambiente (a mesma do Concar, troque depois)
export DEEPSEEK_API_KEY="sk-..."

# simulação (não posta) — mostra sites-alvo e âncoras:
python enviar_backlink.py --limit 5 --dry-run

# drip real de 5 sites a partir do índice 0:
python enviar_backlink.py --limit 5 --offset 0

# próximos 5 (dia seguinte):
python enviar_backlink.py --limit 5 --offset 5
```
O script: filtra off-topic → gera artigo único (DeepSeek) → injeta 1 link contextual com a próxima âncora → publica no site via `/artigos` (X-API-KEY do CSV). Loga cada envio em `enviados.log` (evita repetir site).

## Reforço on-site (já feito no Concar)
- Home: title/H1/1º parágrafo/JSON-LD na KW "consulta placa".
- `/consulta-placa` pivotada p/ "planos/preços" + link âncora → home (anti-canibalização).
