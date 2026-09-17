---
name: project_limpeza_conteudo_ingles_pt
description: "Limpeza (hard delete definitivo) de conteúdo em INGLÊS e de PORTUGAL (pt-PT) nas categorias específicas listadas pelo operador, mantendo as categorias vazias. Iniciada 28/07/2026."
metadata: 
  node_type: memory
  type: project
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
  modified: 2026-07-29T23:18:59.239Z
---

# Limpeza de conteúdo inglês + Portugal (pt-PT) — 28/07/2026

Operador pediu apagar **DEFINITIVAMENTE** (nunca lixeira) todo o conteúdo de categorias específicas (English + pt-PT), **mantendo as categorias** (esvaziadas, para reuso futuro). Motivo: o conteúdo em inglês/pt-PT pode estar atrapalhando a indexação. "São conteúdos meus, não se preocupe."

## Categorias-alvo (slugs), por site (lista EXPLÍCITA do operador)
- **Inglês:** `lifestyle`, `wellness`, `life`
- **Portugal (pt-PT):** `noticias-pt`, `atualidade`, `pais`, `mundo-pt`, `actualidade`, `portugal-noticias`
- Cada site tem 1 categoria inglesa + 1 pt-PT. (Confirmado antes: conteúdo inglês = artigos importados com título "Brazil ..."; "Insights" é pt-BR, NÃO tocar.)

## Método (validado, hard delete via SQL)
Função `site_delete <public_html> <slugs...>`: resolve term_taxonomy_id por slug → backup dos IDs/títulos em `~/cleanup-eng-pt-20260728/<dom>-<slug>.tsv` → deleta post + postmeta + revisões + term_relationships + comments/commentmeta (temp table `_del`) → recount de todas as categorias/tags. Categoria PRESERVADA (fica count=0). Sites seguem 200. Backups por host em `$HOME/cleanup-eng-pt-20260728/` (anderson: /home/u400588174/, qmix: /home/u463007860/, vps1: /home/u651115354/).

## FEITO (verificado, restantes=0, categorias preservadas)
- **anderson-gna (17 sites):** adonline(wellness 162/atualidade 3), advivo(lifestyle 90/atualidade 2), azulmagazine(lifestyle 93/noticias-pt 2), blogse(wellness 161/noticias-pt 2), cameracotidiana(lifestyle 86/atualidade 2), curiosododia(lifestyle 92/mundo-pt 2), diariopernambucano(wellness 162/pais 2), divirto(lifestyle 91/pais 2), ebookcult(wellness 162/noticias-pt 2), incast(lifestyle 92/mundo-pt 2), jornaldobairroalto(lifestyle 94/noticias-pt 2), opopularjornal(lifestyle 92/atualidade 2), publisherbrasil(lifestyle 92/pais 2), qmixdigital(lifestyle 92/pais 2), revistarumo(lifestyle 92/noticias-pt 2), saberdefato(wellness 162/noticias-pt 2), universoneo(wellness 134/atualidade 2).
- **vps1:** euvo (wellness 163/pais 2).
- **qmix (u463):** barranews(wellness 169/mundo-pt 2), folhadonoroeste(wellness 162/mundo-pt 2), folhar(life 76/mundo-pt 2), desassossegada(life 74/actualidade 2), oiempreendedores(life 76/actualidade 2). [SSH instável pelo flap; funcionou no retry]

## CONCLUÍDO (28/07)
- **hostverge (6 sites):** df8(life 76/actualidade 2), revistadeducao(life 79/actualidade 2), exquisito(life 63/portugal-noticias 0), sabedoriaglobal(life 80/portugal-noticias 2), pontonaturalbrasil(life 79/portugal-noticias 2), viajenodetalhe(life 80/portugal-noticias 2). SSH do 20i destravou no retry (era rate-limit temporário).
- **wtw19.com.br** (portal-engine, opengravity /srv/portais/wtw19, flatUrl): **49 artigos** apagados (life 47 + actualidade 2), backup em `/srv/portais/wtw19/_deleted-life-actualidade-20260728`, `rebuildIndexes` como portais (2979→2930), categorias preservadas. cfPurge 401 esperado (token CF read-only).
- ~~setorenergetico.com.br~~ **DESCONSIDERADO pelo operador:** virou diretório de energia — NÃO tocar.

## TOTAL: ~3.230 posts apagados definitivamente em 30 sites (29 WP + wtw19). Todas as categorias preservadas (vazias). Backups por servidor em `cleanup-eng-pt-20260728/` (WP) e no dir do wtw19. OPERAÇÃO FECHADA.

Relacionado: [[reference_categorias_wp]], [[reference_hf_mu_plugin_esconde_acervo]], [[reference_portal_engine_html]].
