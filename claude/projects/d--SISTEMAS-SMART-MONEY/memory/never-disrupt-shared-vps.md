---
name: never-disrupt-shared-vps
description: Hard rule — new projects on a shared VPS must be fully encapsulated (Docker Compose) so that any action on them cannot affect other folders/sites on the same machine.
type: feedback
originSessionId: 17875b33-1111-46e2-b234-32a7657ef8f0
---
When working on a VPS that hosts other sites (clients, portals, bots), the SMART MONEY workload — and any other new app — MUST be **fully encapsulated** so that any action on it (build, deploy, restart, crash, package install, dependency upgrade, schema migration) cannot reach or affect other sites/folders on the same VPS.

**Why:** User reported recurring incidents where past deployments knocked other sites offline. Quotes (2026-05-04):
- "Sempre que vou trabalhar em alguma aplicação, acontece de derrubar os outros sites no ar ao fazer deploy. Não quero que isso aconteça de forma alguma."
- "Se possível, encapsule este projeto para que qualquer ação nele não faça efeito nas outras pastas da VPS."

**Encapsulation strategy — default for all new apps on shared VPSs: Docker Compose.**

The app, its database (dedicated Postgres container), its workers, and any auxiliary services all live inside a single `docker-compose.yml` under `/opt/<app-name>/`. No system-wide installs, no shared services, no apt/npm operations that touch the host. The only host-level integration is a single Nginx vhost file in `/etc/nginx/conf.d/<app>.conf` that proxies into the container.

**How to apply (technical guardrails):**

1. **Single project root.** All app code, configs, data volumes, logs, and backups live under `/opt/<app-name>/`. Nothing outside that path is created or modified by the app itself.
2. **Docker Compose is the runtime.** Container network is private (`networks: [<app>_internal]`). The only host-published port is the one Nginx proxies to. All inter-service traffic (app ↔ Postgres ↔ workers) stays inside the Compose network.
3. **Resource ceilings (cgroups via Docker `deploy.resources`).** Every container declares `mem_limit` and `cpus` so that a runaway process inside the project cannot consume host RAM/CPU and starve the other sites. Reserve ≤50% of total host RAM/CPU for the entire project as a hard ceiling.
4. **Dedicated database.** A Postgres **container** with a private port (or no published port — Compose-internal only). Never use the host's MySQL/Postgres or HestiaCP's panel database.
5. **Never touch shared host services in place.**
   - Do not restart Nginx with `systemctl restart` — use `systemctl reload nginx`, only after `nginx -t` passes.
   - Do not edit existing vhost files — add a new file at `/etc/nginx/conf.d/<app>.conf`.
   - Do not change PHP-FPM, Apache, MySQL, or HestiaCP configs.
6. **Non-conflicting host ports.** Check `ss -ltnp` before binding. App publishes a single high port (e.g., 3010) for Nginx to proxy.
7. **Zero-downtime deploys** (preserved from global CLAUDE.md, adapted to Compose):
   - Two app containers behind Nginx upstream with `max_fails=2 fail_timeout=10s` and `proxy_next_upstream`.
   - `docker compose up -d --no-deps --build app` rebuilds only the app service. Roll one container at a time after healthchecks pass.
   - Never `docker compose down` during deploy.
8. **No global package operations during work.** No `apt upgrade`, no `npm install -g`, no global Node version changes. Node, Python, etc. live only inside the container.
9. **Heavy workers run with internal niceness.** Inside the container, scrapers and AI workers use `nice -n 19` and `ionice -c 3`. Combined with cgroup limits, the host I/O and CPU stays available for other sites.
10. **Backups stay inside the project.** `/opt/<app-name>/backups/` — never `/var/backups` or anywhere shared.
11. **Verification before claiming a deploy succeeded:** `curl -I` every other site on the VPS and confirm 200/301/302. Never just check that the new app is up.
12. **One-line uninstall.** Removing the project must be `docker compose down -v && rm -rf /opt/<app-name> && rm /etc/nginx/conf.d/<app>.conf && systemctl reload nginx` — and that command must leave every other site untouched. If it doesn't, the encapsulation is broken.
