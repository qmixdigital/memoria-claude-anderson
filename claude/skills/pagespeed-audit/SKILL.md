---
name: pagespeed-audit
description: Roda o Google PageSpeed Insights (Core Web Vitals) em qualquer site e interpreta os resultados com correções acionáveis. Use quando o usuário pedir "rodar PageSpeed", "medir PageSpeed", "Core Web Vitals", "CWV", "medir velocidade/performance do site", "checar LCP/CLS/INP", "PageSpeed com a API", "auditar performance", ou perguntar por que um site está lento no Google. Tem a chave da API embutida e um script pronto.
---

# PageSpeed Audit (Core Web Vitals)

Auditoria de performance via **PageSpeed Insights API** (Lighthouse laboratório + CrUX campo real), com veredito por Core Web Vitals e playbook de correções focado em Next.js/WordPress.

## Chave da API

`<<REMOVIDO>>` (Google, restrita à PageSpeed Insights API). O script já usa por padrão; para sobrescrever, `export PSI_API_KEY=...`.

## Como rodar

Script pronto em `scripts/psi.py` (só stdlib, sem dependências):

```bash
# uma ou várias URLs, mobile (base do ranking do Google)
python3 <skill-dir>/scripts/psi.py https://site.com/ https://site.com/pagina

# mobile E desktop
python3 <skill-dir>/scripts/psi.py https://site.com/ --strategy both

# JSON bruto (para processar)
python3 <skill-dir>/scripts/psi.py https://site.com/ --json
```

Sempre auditar **mobile** primeiro (o Google indexa e rankeia por mobile). Rode a **home + 1 página representativa de cada template** (ex: listagem e detalhe), não só a home. Se um script inline for preferível, replicar o endpoint:
`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=URL&key=KEY&strategy=mobile&category=performance`

## Limiares Core Web Vitals (oficiais)

| Métrica | Bom | Precisa melhorar | Ruim | O que é |
|---|---|---|---|---|
| **LCP** | ≤2,5s | 2,5–4,0s | >4,0s | maior elemento visível (ranking) |
| **CLS** | ≤0,1 | 0,1–0,25 | >0,25 | estabilidade visual (ranking) |
| **INP** | ≤200ms | 200–500ms | >500ms | responsividade a interações (ranking) |
| FCP | ≤1,8s | 1,8–3,0s | >3,0s | primeiro conteúdo |
| TTFB | ≤0,8s | 0,8–1,8s | >1,8s | resposta do servidor |

**Score Lighthouse:** ≥90 verde, 50–89 laranja, <50 vermelho. Os 3 CWV (LCP/CLS/INP) são o que realmente pesa no ranking; o score é resumo.

## Laboratório × Campo (importante)

- **LAB (Lighthouse):** simulação controlada. Sempre disponível. Bom para debugar e comparar antes/depois.
- **CAMPO (CrUX):** usuários reais dos últimos 28 dias. É o que o Google usa no ranking. Só aparece com tráfego suficiente. **Site novo não tem dados de campo** — nesse caso, guie-se pelo laboratório e re-meça em algumas semanas.
- INP só é medido em campo (não no laboratório). Sem CrUX, estime pelo TBT (TBT baixo ~ INP bom).

## Playbook de correções (falha → fix)

**LCP alto:**
- Imagem hero: `next/image` com `priority` + `fetchpriority="high"` + preload; dimensões fixas. Em WordPress, remover lazy-load da primeira imagem.
- LCP de texto (sem imagem): é atraso de fonte/render → ver CLS/fonte abaixo; `preconnect` para origens de fonte; CSS crítico inline.
- TTFB alto: cache (ISR/CDN/Cloudflare), reduzir trabalho no servidor.

**CLS alto (causa nº1 em Next.js: troca de fonte / FOUT):**
- Migrar para **`next/font`** (local ou google) — injeta `size-adjust`/métricas de fallback e **zera o CLS de fonte** automaticamente. Substitui `@font-face` manual + `<link rel=preload>`.
- Imagens/embeds/anúncios sem dimensão: sempre `width`+`height` (ou aspect-ratio) para reservar espaço.
- Nada de inserir conteúdo acima do que já renderizou.

**INP/TBT alto:**
- `next/dynamic` para componentes pesados client-side; reduzir JS não usado; adiar scripts de terceiros (GA/AdSense com `strategy="afterInteractive"` ou lazy pós-interação).
- Menos `'use client'` — Server Components não mandam JS.

**Score baixo geral:**
- JS/CSS não usado, render-blocking, terceiros. As "Oportunidades" do output listam a economia em ms de cada uma.

## Fluxo recomendado

1. Rodar mobile na home + páginas-template representativas.
2. Ler os 3 CWV (campo se houver, senão laboratório) contra os limiares.
3. Para cada métrica laranja/vermelha, aplicar o fix do playbook.
4. Re-medir (laboratório muda na hora; campo/CrUX leva ~28 dias de tráfego).
5. Reportar tabela antes/depois.

## Relacionadas
- `seo-optimizer` — CWV é sinal de ranking; parte do SEO técnico.
- `react-best-practices` / `nextjs-best-practices` — fixes de LCP/INP no código.
