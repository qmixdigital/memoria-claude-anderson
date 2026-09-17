---
name: pendencias-seo-2026-09
description: Itens da análise de 11/09/2026 que o Anderson mandou deixar para depois (linkagem de profissionais, relacionadas reais, tags, H1, needrestart, profissionais sem matéria)
metadata:
  type: project
---

Análise completa feita em 11/09/2026 (GSC: cliques caíram de 735 para 434 por 28 dias em um ano; 508 páginas com impressão, 143 com clique). Já resolvidos: resumo/meta/title em todas as matérias, LGPD + páginas legais, travessões, duplicatas, deploy com B efêmera, Cloudflare proxy + hardening, shuffle de profissionais no servidor.

**Pendentes, em ordem de retorno esperado (o Anderson disse "vamos ajustar depois"):**
1. Vincular os ~250 matérias sem `profissional_id` cujo corpo cita o nome de um profissional ativo, e inserir link com âncora no corpo. Fichas de profissionais são as páginas que mais rankeiam (210 cliques/28d em 167 páginas).
2. Trocar o bloco "Mais Matérias" (hoje: 5 mais recentes da mesma cidade, iguais em todas) por relacionadas reais (mesmo profissional, especialidade, tag) e inserir 2 a 3 links contextuais no corpo. ~500 matérias antigas estão órfãs (só o sitemap aponta para elas; paginação tem canonical para a página 1).
3. Tags: 499 matérias sem nenhuma.
4. H1 da home é `sr-only` (escondido).
5. `unattended-upgrades` às 07:00 reinicia Postgres e o app com SIGKILL (aconteceu em 07/09 e 11/09, gera 57P01 e uncaughtException nos logs). Configurar `needrestart` para não tocar no PM2, ou aceitar a janela.
6. 137 dos 170 profissionais ativos não têm matéria vinculada; última edição da revista é de maio/2026.

Ver [[seo-titles-e-checagens]] e [[deploy-workflow]].
