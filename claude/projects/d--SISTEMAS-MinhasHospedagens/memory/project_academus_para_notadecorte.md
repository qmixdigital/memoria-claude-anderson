---
name: academus-para-notadecorte
description: "academus.pro.br (histórico IPTV) migra para notadecorte.ia.br; estático pronto no Pages, falta NS no Registro.br e virar o domínio antigo"
metadata:
  node_type: memory
  type: project
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-19T14:54:36.920Z
---

Em 19/10/2026 o operador comprou notadecorte.ia.br para substituir academus.pro.br (domínio expirado com histórico de IPTV: a home tem ~81 mil cliques em 16 meses, todos de busca por IPTV, e o conteúdo atual de faculdades/saúde não rankeia). O site já é estático: Academus foi convertido e removido da clinicas-vps no mesmo dia.

**Estado:** projeto Pages `notadecorte` (BYTX) publicado a partir de D:/SITES/notadecorte.ia.br/site; zona criada com CNAME/www/hardening, zona ATIVA e site no ar desde 19/10/2026. Domínio antigo já virado: projeto Pages `academus` serve só o pacote D:/SITES/notadecorte.ia.br/academus-antigo (197 redirects 301 página a página; home e URLs de IPTV em 404 noindex). Instruções em D:/SITES/notadecorte.ia.br/LEIA-ME.md.

**How to apply:** CONCLUÍDO. Se precisar mexer no domínio antigo, republicar `academus-antigo/` no projeto Pages `academus` (conta Anderson Alves). NÃO dar 301 na home antiga (passaria o sinal de IPTV). Marca "Academus" mantida até o operador decidir.

Relacionado: [[contadoria-estatico-pages]], [[geladeirastop-estatico-pages]]
