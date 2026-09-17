---
name: feedback_sem_backup_site_sem_trafego
description: Não fazer backup de site morto sem tráfego antes de apagar; o operador prefere deletar direto
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-17T10:03:11.343Z
---

Quando o site a ser removido é resíduo sem tráfego (WordPress órfão pós-migração, cópia morta, domínio já servido por outro motor), **apagar direto, sem backup**. Em 17/08/2026 o operador interrompeu a rotina de dump + tar dos WordPress órfãos do jornalconceito e do ocontraditorio na hostverge: "não perca tempo fazendo backup desses dois sites, eles não têm tráfego nenhum e se eu perder tudo não faz a mínima diferença".

**Why:** backup de 1,4 GB por site custa tempo de execução e disco para proteger conteúdo que já foi migrado ou descartado de propósito. O valor está no portal novo, não na origem.

**How to apply:** para resíduo sem tráfego, remover arquivos e dropar o banco na mesma passada, capturando `DB_NAME`/`DB_USER`/`DB_PASSWORD` do `wp-config.php` **antes** de apagar os arquivos (ver [[reference_orphan_wp_cleanup]]). Continuar exigindo backup, ou confirmação, apenas quando o alvo tiver tráfego, backlink de cliente, ou for a única cópia de algum conteúdo, como foi o caso dos 4 WordPress que guardavam os 100 artigos apagados por falta de imagem.
