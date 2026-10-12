---
name: project_receita_situacao
description: "Rotina mensal de situação cadastral da Receita (scripts/receita-*), fichas encerradas, limpeza de nome/telefone trocados e o passo manual de baixar os arquivos"
metadata:
  node_type: memory
  type: project
  originSessionId: bf5f6c7b-623b-4092-bc48-366d1a308f25
  modified: 2026-10-10T10:26:09.710Z
---

Desde 10/10/2026 cada ficha guarda `situacao` (01 nula, 02 ativa, 03 suspensa, 04 inapta, 08 baixada), `situacao_desde` e `oculto_motivo` ('encerrada' ou 'sem-localidade').

Rotina mensal, no VPS, em `/var/www/distribuidoras`:
1. **Passo manual:** baixar Estabelecimentos0-9.zip e Empresas0-9.zip da Receita para uma pasta. Os usados em 10/10/2026 estão em `/root/casas-data` (são do projeto casas, baixados em 03/08/2026; não apagar nem sobrescrever). A Receita mudou o endereço para um compartilhamento do SERPRO (Nextcloud); `arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/` dá 404. Disco do VPS em 90%: cada mês tem ~7 GB.
2. `python3 scripts/receita-snapshot.py /pasta` → tabela `receita_snapshot` (dá GRANT ao distribuidoras_user; sem isso o anuário esconde o parágrafo).
3. `sudo -u postgres psql distribuidoras_db -f scripts/receita-aplicar.sql` → aplica situação, oculta encerradas (página continua no ar com aviso, noindex), reexibe reabertas, recalcula contagens.
4. Rebuild + purge do Cloudflare para os números da vitrine mudarem.

`scripts/corrigir-contaminacao.py` (simulação sem `--aplicar`) só deve rodar depois de um novo enriquecimento por Google Maps, e com `/tmp/gsc_cliques.csv` atualizado: sem ele a proteção de tráfego de marca não existe e o script tira o nome da ficha que o Google associa à marca. Não colocar em cron.

**Why:** a base de abril nunca tinha sido conferida. Em agosto 11,4% dos CNPJs não estavam ativos e 15% das fichas tinham nome e telefone de outra empresa (caso HZ, Veranópolis; pior caso Multifoods em 631 CNPJs). Resultado da aplicação: 1.437 encerradas fora, 12.120 fichas corrigidas com 301 da URL antiga para a dona do nome, vitrine em 92.115.

**How to apply:** ao falar em atualizar estudos, anuário ou "base da Receita", seguir os 4 passos. Backups em `/root/backups/distribuidoras_antes_receita_*` e `..._antes_contaminacao_*` (10/10/2026). Ver também [[reference_nginx_ratelimit]].
