---
name: footprint-portais-do-motor
description: A auditoria de 17/09/2026 achou texto idêntico nos 104 portais (institucionais, 404, 410, robots, forma do JSON-LD); o conserto é src/variacoes.js nas 3 VPS e a skill portal-engine-footprint
metadata:
  type: project
---

Os 104 portais do motor saíam com a MESMA política de privacidade, termos, contato,
quem-somos padrão, 404, 410 e robots.txt, e com a mesma forma de JSON-LD. Classes
CSS e rótulos já variavam (hash do slug), mas o detector compara texto fixo primeiro.

**Why:** a skill wp-news-portal-fullsetup cobre só WordPress; no motor a variação
tem de ser gerada pelo código, por portal, e ninguém tinha medido o resultado.

**How to apply:** rodar `footprint_audit.py` (skill `portal-engine-footprint`) depois
de qualquer mudança no render.js/archs.js/pages_pack.js e ler o que aparece em 100+
portais. Texto fixo novo entra com 6+ redações em `_VOC_OPC` ou `variacoes.js`,
nunca uma string só. Tudo resolvido em 17/09 (fontes locais, cabeçalhos por portal, RUM apagado, variáveis
CSS e direitos do rodapé por portal). AdSense só nos 14 liberados: portal fora da lista
do Anderson não leva `ca-pub`. Relatório: D:\PORTAIS\pages\RELATORIO-FOOTPRINT-20260917.md.
Ver [[portais-no-cloudflare-pages]] e [[classes-hasheadas-no-motor]].
