---
name: cliquex-cloudflare-optimization
description: Otimizações de velocidade/segurança aplicadas via API em todas as zonas Cloudflare da conta
metadata: 
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-07-18T21:38:42.253Z
---

Otimização de velocidade+segurança da conta Cloudflare (account id `011fa32b46296a88d9ec00fc1b136f64`, ~22 zonas) aplicada via API em 2026-07-18. O token é fornecido pelo usuário na hora (NÃO guardar; ele rotaciona depois).

APLICAR EM TODAS as zonas (PATCH `/zones/{id}/settings/{nome}` value): brotli=on, http3=on, early_hints=on, opportunistic_encryption=on, automatic_https_rewrites=on, always_use_https=on, min_tls_version=1.2, tls_1_3=on, rocket_loader=**off** (crítico: on quebra o JS inline que monta o ranking), browser_check=on, email_obfuscation=on. (0rtt aceita PATCH mas fica off — ignorar, é micro-otimização.)

NÃO forçar em zonas de TERCEIROS (a conta tem ~15 domínios que não são nossos): modo `ssl` e `security_level` — mudar poderia quebrar origem sem cert válido (525/526). Só os NOSSOS sites ficam SSL Full (strict).

Bot Fight Mode (só nos NOSSOS sites): `PUT /zones/{id}/bot_management` com `{"fight_mode":true,"enable_js":true}` — PRECISA dos dois campos juntos (só fight_mode dá Bad Request). Verificado: navegador real carrega 200 normal com tudo ligado.

Polish/Mirage/Argo/Tiered Cache = plano Pro (pago), não disponível no Free. Loop de PATCH em 22 zonas passa de 2min — rodar em lote/background ou paginar.
