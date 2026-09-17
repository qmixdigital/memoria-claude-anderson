---
name: cirurgiadojoelhogoiania - site ativo Next.js
description: Site do Dr. Ulbiramar Correia (ortopedista joelho Goiania) - Next.js 15 na VPS 77.37.69.175, Nginx + PM2 porta 3003. Repo antigo arquivado em D:\SITES.
type: project
---

Site cirurgiadojoelhogoiania.com esta **finalizado e em producao**.

- **Repositorio ativo:** `d:\GitHub\cirurgiadojoelhogoiania-next`
- **Stack:** Next.js 15, TypeScript, Tailwind CSS v4
- **Hospedagem:** VPS opengravity (77.37.69.175), Nginx + PM2, porta 3003
- **SSH:** `ssh opengravity`
- **Deploy:** `bash deploy.sh` (build + scp)
- **Nginx config:** `/etc/nginx/conf.d/domains/cirurgiadojoelhogoiania.com.ssl.conf`
- **Diretorio VPS:** `/var/www/cirurgiadojoelhogoiania`
- **Blog:** WordPress em blog.cirurgiadojoelhogoiania.com (separado)

**Site antigo (HTML estatico):** arquivado em `D:\SITES\cirurgiadojoelhogoiania` — nao editar.

**Why:** Migração do Cloudflare Pages para VPS concluida. Site bem posicionado no Google.

**How to apply:** Qualquer alteracao deve ser feita no repo Next.js. Redirects no Nginx da VPS.
