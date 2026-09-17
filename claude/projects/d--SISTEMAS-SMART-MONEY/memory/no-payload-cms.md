---
name: no-payload-cms
description: User dropped Payload CMS — prefers "NextPuro" stack (Next.js puro + Drizzle/Prisma + PostgreSQL, no CMS layer). Overrides global CLAUDE.md "Next.js + Payload" default.
type: feedback
originSessionId: 17875b33-1111-46e2-b234-32a7657ef8f0
---
User has dropped Payload CMS from the preferred stack. The replacement preference is **"NextPuro"** — Next.js puro, sem CMS, com banco direto via ORM.

**Stack confirmada:**
- Next.js (App Router, TypeScript)
- Drizzle ORM ou Prisma (escolha por projeto — ainda não fixada qual)
- PostgreSQL direto (sem camada de CMS administrativo)
- Server Actions / Route Handlers do próprio Next.js para a API
- Sem painel admin pronto — telas administrativas, se precisarem existir, são páginas custom no próprio Next.js

**Why:** Stated explicitly during the SMART MONEY brainstorming session (2026-05-04): "O que eu quero é usar NextPuro. Next.js puro, sem CMS — você quer só Next.js + banco direto (Drizzle/Prisma + PostgreSQL), sem camada de CMS por cima." User uses voice transcription, so "NextPuro" is their personal label for "Next.js puro" — not a real package/framework name. Treat it as shorthand, not a tool.

**How to apply:** When starting any new Next.js project after 2026-05-04:
- Do NOT propose Payload CMS, even though the global CLAUDE.md still references "Next.js 15 + Payload 3" as standard
- Default to Next.js + Drizzle (or Prisma) + PostgreSQL
- For admin/CRUD UIs, build custom pages in Next.js — do not pull in headless CMSs (Strapi, Directus, etc.) unless user explicitly asks
- Preserve other parts of the global CLAUDE.md stack (Tailwind v4, PostgreSQL via Neon when applicable, PM2, Nginx, zero-downtime deploy with two PM2 instances)
