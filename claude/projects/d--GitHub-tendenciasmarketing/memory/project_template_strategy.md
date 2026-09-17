---
name: Portal como template multi-nicho
description: tendenciasmarketing.news é o portal piloto que serve de base para outros portais em diversos segmentos
type: project
---

Este projeto é o **portal piloto/template** para uma família de portais de notícias automatizados.

**Why:** O usuário pretende criar múltiplos portais (saúde, entretenimento, esporte, futebol, marketing, etc.) todos baseados neste mesmo código. Mudar apenas pequenos detalhes (cores, nome, categorias, feeds RSS) para cada novo portal.

**How to apply:**
- O código deve ser projetado com theming em mente: um arquivo `site.config.ts` central com todas as configurações de marca (nome, cores, domínio, categorias, slogan)
- Cores e fontes via variáveis CSS / Tailwind config — nunca hardcoded
- Quando o usuário iniciar um novo portal, ele fornecerá a URL de um site de referência. A IA deve acessar essa URL, extrair paleta de cores e estilo visual, e gerar um novo `site.config.ts` + ajustes de Tailwind baseados nessa inspiração
- Documentar claramente quais arquivos mudam entre portais e quais são idênticos
- Manter `DOCUMENTACAO.md` sempre atualizada com o "checklist de novo portal"
