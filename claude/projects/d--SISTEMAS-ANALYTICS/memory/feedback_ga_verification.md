---
name: GA verification — não mencionar lazy-load
description: Ao verificar instalação de GA4 nos sites, NÃO comentar sobre lazy-load nem sugerir mudanças
type: feedback
originSessionId: 2f71a995-147c-4ebd-b85e-7e3f37aef25d
---
Quando o usuário pede para conferir se um código GA4 está instalado num site (via fetch do HTML), apenas confirmar se o ID está presente e correto. NÃO mencionar lazy-load, Core Web Vitals, ou sugerir trocar o snippet pela versão otimizada.

**Why:** Apesar da regra global em CLAUDE.md exigir lazy-load, neste fluxo de verificação em massa (vários sites de uma rede) o usuário só quer um check rápido — está validando instalação, não otimizando. Já avisou explicitamente: "Não interessa o Lazy Load, não importa, quero apenas que confira se está correto."

**How to apply:** Em qualquer pedido de verificação de instalação de GA4 nesta rede de sites (nexoplay, playbrasil, e outros do dashboard `D:\SISTEMAS\ANALYTICS`), responder de forma objetiva: ID encontrado, status correto/incorreto, próximo. Sem alertas sobre lazy-load.
