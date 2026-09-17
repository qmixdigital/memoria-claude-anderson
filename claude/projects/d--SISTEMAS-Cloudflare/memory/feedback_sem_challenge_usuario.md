---
name: feedback-sem-challenge-usuario
description: "Hardening Cloudflare nunca deve inserir desafio/fricção ao usuário final (derruba conversão), sobretudo em sites de tráfego pago/estáticos"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7b5fb01c-7a66-4d11-9626-4adca9d96e91
---

Ao endurecer sites na Cloudflare, **nunca** aplicar nada que apareça/atrapalhe o usuário final: sem **Managed Challenge** em rotas, **Security Level** alto que desafie por reputação, nem **Browser Integrity Check**. Em sites de tráfego pago, qualquer desafio derruba bastante a conversão.

**Why:** os sites do Anderson na conta TRAFEGOPAGO (conta3, 101 zonas) são majoritariamente **estáticos** — pouca superfície de invasão — então a proteção deve ser invisível ao visitante; o risco real é perder conversão de tráfego pago, não invasão.

**How to apply:** o pacote `harden_site.py`/`harden_conta.py` aplica Security HIGH + managed challenge — depois rodar `suavizar_conta.py <conta>` (Security Level → essentially_off, Browser Integrity Check → off, deleta regras WAF com ação de desafio). Manter só proteções invisíveis: SSL Full Strict, HSTS, DNSSEC, block .env/.git/wp-config, block AI bots, block sem User-Agent, block threat_score>30 (barra clique-fraude/bot e protege o orçamento de ads), rate limit e Leaked Credentials Detection. Relacionado: [[project-tokens-limitados]].
