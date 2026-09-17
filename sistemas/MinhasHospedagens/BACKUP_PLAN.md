# Plano de Backup — Hospedagens QMIX

## Como solicitar

Para o assistente executar backup, basta dizer:
- **"Faça backup do hostverge"**
- **"Faça backup das VPS (opengravity)"**
- **"Faça backup dos Hostinger (h-vps1/h-anderson/h-qmix)"**
- **"Faça backup de tudo (exceto Renato)"** → executa hostverge → opengravity → 3 Hostinger em sequência

Os backups **NÃO incluem sites do cliente Renato** (seguidores.digital, comprarlikes.com.br, impulsionagram.com, seguidoresbrasil.com.br — nem VPS antigo/novo dele).

## Destino local

```
D:\SISTEMAS\MinhasHospedagens\backups\
├── hostverge\YYYY-MM-DD\
│   ├── site1_files.tar.gz
│   ├── site1_db.sql.gz
│   └── manifest.json
├── opengravity\YYYY-MM-DD\
├── h-vps1\YYYY-MM-DD\
├── h-anderson\YYYY-MM-DD\
└── h-qmix\YYYY-MM-DD\
```

## O que é incluído

### Arquivos WP (tar.gz)
- Todo conteúdo exceto:
  - `wp-content/cache/` (recria sozinho)
  - `wp-content/ai1wm-backups/` (plugin backups redundantes)
  - `wp-content/upgrade/` (arquivos temporários)
  - `wp-content/updraft/` (outro plugin backup)
  - `*.log`
  - `node_modules/` (se existir)

### Banco de dados (sql.gz)
- `mariadb-dump` com `--single-transaction --quick --no-tablespaces`
- Compressão gzip

### Manifest (manifest.json)
- Lista de sites, tamanho, MD5, timestamp
- Credenciais do banco (para facilitar restore)

## Scripts envolvidos (no opengravity)

- `/tmp/backup_site.sh` — gera backup de 1 site WP local
- `/tmp/backup_dispatch.sh` — itera em todos WP de uma hospedagem

## Restore

Ver arquivo `RESTORE_GUIDE.md` (criar quando necessário).
Resumo: no server destino, criar DB vazio, importar `db.sql.gz`, extrair `files.tar.gz`, ajustar wp-config.

## Histórico

| Data | Hospedagens | Total | Observações |
|------|-------------|-------|-------------|
| 2026-04-22 | hostverge | 29 sites | Primeiro backup |
