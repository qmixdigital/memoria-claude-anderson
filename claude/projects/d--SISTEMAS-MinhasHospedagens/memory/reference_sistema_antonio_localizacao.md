---
name: reference_sistema_antonio_localizacao
description: "Sistema Antônio (acesso.qmix.com.br) fica no srv1166087 em /home/boot/web, usuário boot; documentação completa em D:\\SISTEMAS\\QMIX ANTONIO"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-17T15:19:46.646Z
---

A plataforma **Antônio** (painel "QMIX Digital Marketplace", <https://acesso.qmix.com.br/dashboard>) roda no **srv1166087** (`31.97.173.40`, `ssh hostinger-vps-srv1166087`), em `/home/boot/web/acesso.qmix.com.br/public_html` — usuário **`boot`** do HestiaCP, não `qmix`. São 4,3 GB, PHP 8.3, MySQL. Espelho: `acesso2.qmix.com.br`, mesmo IP. Zona `qmix.com.br` na **conta23** do `contas.json`.

**Por que é difícil de achar:** o diretório fica sob `/home/boot/web/`, e não em `/var/www` nem sob o usuário `qmix`. Procurar por `/var/www` ou por nome com "antonio"/"acesso" nas pastas de `qmix` não encontra nada. O caminho rápido é resolver o DNS pela API da Cloudflare e depois listar `/home/*/web/`.

Documentação completa gerada em 17/08/2026 em **`D:\SISTEMAS\QMIX ANTONIO`**: README (acesso, estrutura, tabelas, crons), ENVIO-DE-CONTEUDO (contrato dos 3 tipos de receptor com payload e respostas), DESTINOS (111 WP + 54 portal-engine + diretórios Next) e ARMADILHAS (10 incidentes conhecidos). O CSV de destinos WordPress está copiado lá.

Credenciais do banco em `public_html/includes/dbh.inc.php` (não versionar). Chave de cada destino fica cifrada na tabela `wp_sites`, decifrada por `<<REMOVIDO>>`. Transferência: `article-transfer-qmix-news.php`, disparada por cron de minuto via `/usr/local/bin/qmix-cron-runner`.

Relacionado: [[reference_antonio_endpoint_recovery]], [[reference_antonio_destino_next_contrato]], [[reference_receptor_antonio_kses_origem]], [[reference_portal_engine_publish_articles]].
