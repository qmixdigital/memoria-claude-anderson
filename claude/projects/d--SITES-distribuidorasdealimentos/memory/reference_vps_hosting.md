---
name: vps-hosting
description: Where distribuidorasdealimentos.com.br lives in production — srv1166087 since 22/06/2026 (migrated from clinicas-vps)
metadata: 
  node_type: memory
  type: reference
  originSessionId: bf5f6c7b-623b-4092-bc48-366d1a308f25
---

## Distribuidoras de Alimentos — hospedagem atual

**VPS:** `hostinger-vps-srv1166087` (`31.97.173.40`) — alias SSH no `~/.ssh/config`
**Stack:** Next.js 16.2.1 + Drizzle + PostgreSQL local + PM2 (2 instâncias, failover)

| Recurso | Localização |
|---------|-------------|
| Código | `/var/www/distribuidoras/` |
| PM2 | `distribuidoras`:3019 + `distribuidoras-b`:3030 |
| Banco | `distribuidoras_db` / user `distribuidoras_user` / senha `<<REMOVIDO>>` |
| Uploads | `/var/www/distribuidoras/public/uploads/blog/` |
| nginx | `/etc/nginx/conf.d/distribuidoras.conf` |
| SSL | `/etc/ssl/portais/distribuidorasdealimentos.com.br/origin-cf.{pem,key}` |
| Node | nvm v20.20.2 (`/root/.nvm/versions/node/v20.20.2/bin`) |
| Cloudflare zona | `fc69977f878137ae764e1048570223e8` |
| Cloudflare conta | `75a81880f2e1e1a7300ef71d7a4bc4e1` |

## Acesso

- SSH direto: `ssh hostinger-vps-srv1166087`
- mgmt-api foi descontinuado (existia no servidor antigo quando não havia SSH)

## Deploy

```bash
cd D:\SITES\distribuidorasdealimentos
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf /tmp/deploy.tar.gz .
ssh hostinger-vps-srv1166087 "cat > /tmp/deploy.tar.gz" < /tmp/deploy.tar.gz
ssh hostinger-vps-srv1166087 "cd /var/www/distribuidoras && tar xzf /tmp/deploy.tar.gz && \
  export PATH=/root/.nvm/versions/node/v20.20.2/bin:\$PATH && \
  npm install --no-audit --no-fund && npm run build && \
  pm2 reload distribuidoras --update-env && sleep 3 && pm2 reload distribuidoras-b --update-env"
```

## Diagnóstico

Origem direto (bypassa CF): `curl -sk --resolve distribuidorasdealimentos.com.br:443:31.97.173.40 https://distribuidorasdealimentos.com.br/ | head`. Fora da rede Cloudflare retorna **403** (intencional — `if ($cf_trusted = 0) return 403`).

## Migração (histórico)

22/06/2026: migrado de `clinicas-vps` (`31.97.162.199`, HestiaCP user `user`, app em `/home/user/web/distribuidorasdealimentos.com.br/app`). Cópia antiga **deletada** no mesmo dia (PM2, DB, dir, domínio Hestia, templates customizados `nextjs-distribuidoras`).

Documentação completa: [`D:\SISTEMAS\MinhasHospedagens\<<REMOVIDO>>\CONEXAO.md`](D:\SISTEMAS\MinhasHospedagens\<<REMOVIDO>>\CONEXAO.md) e [`D:\SITES\distribuidorasdealimentos\CLAUDE.md`](D:\SITES\distribuidorasdealimentos\CLAUDE.md).
