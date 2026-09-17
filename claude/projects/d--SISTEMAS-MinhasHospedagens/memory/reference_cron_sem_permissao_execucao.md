---
name: reference-cron-sem-permissao-execucao
description: 10 tarefas do cron do srv1166087 nunca rodavam por falta do bit de execucao; como detectar esse tipo de falha silenciosa
metadata:
  type: reference
---

Em 01/09/2026, **10 scripts do crontab do root no srv1166087 estavam com modo
600** — sem permissao de execucao. O cron os chamava todo dia, recebia
`Permission denied` e gravava isso num log que ninguem lia. As tarefas
simplesmente nunca aconteciam.

Entre elas, **cinco backups de banco** (enjai, portuga, palpite, radar, smspix).
Os arquivos mais recentes eram de 24 dias antes. Depois do `chmod 700`, os cinco
rodaram e produziram dump com marca de conclusao.

Os outros cinco eram avisos para o Telegram do operador (uptime do radar,
relatorio de ferramentas, relatorio de fornecedores, refresh mensal de
leiloeiros e o lembrete de vendas pausadas). Nenhum manda mensagem para cliente,
por isso religar foi seguro. Ironia util: **`VENDAS_PAUSADAS` continua "1"** no
SMS Pix, e o script que existe para lembrar disso era um dos desligados.

Opengravity e clinicas-vps nao tinham o problema.

**Como achar:** varrer o crontab e testar `-x` em cada script.

```bash
crontab -l | grep -vE "^\s*#" | grep -oE "/[a-zA-Z0-9/_.-]+\.(sh|mjs|js|py)" \
  | sort -u | while read -r s; do [ -f "$s" ] && [ ! -x "$s" ] && echo "$s"; done
```

**Regra geral:** a existencia da linha no crontab nao prova que a tarefa roda.
Tres coisas precisam ser verdade e cada uma ja falhou nesta rede no mesmo dia:
o script existe, tem permissao de execucao, e o resultado dele e valido. Ver
tambem [[reference_backup_opengravity_era_local]] (backup gravando so local e
gzip vazio de 20 bytes) e [[reference_poda_isr_pasta_errada]] (cron rodando
certo, mas apontado para a pasta errada).
