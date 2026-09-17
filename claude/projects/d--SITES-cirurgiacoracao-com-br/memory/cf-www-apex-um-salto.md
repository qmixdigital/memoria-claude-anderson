---
name: cf-www-apex-um-salto
description: "Por que http://www leva dois 301 mesmo com o nginx correto, e qual script resolve"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-08-19T10:33:10.878Z
---

Quando `http://www.dominio/x/` leva **dois** 301 (`http://www` → `https://www` → `https://apex`), a causa não é o nginx da origem: é o **"Always Use HTTPS" do Cloudflare**, que responde na borda preservando o host. A origem nunca vê essa requisição, então ajustar o vhost não muda nada.

A correção é uma **Redirect Rule** no phase `http_request_dynamic_redirect`, que roda antes do Always Use HTTPS:

```
expressão: (http.host eq "www.DOMINIO")
destino:   concat("https://DOMINIO", http.request.uri)   # 301, preserve_query_string = false
```

Escrevi `D:\SISTEMAS\Cloudflare\cf_www_apex.py` para isso: acha a zona sozinho no `contas.json`, tem `--dry-run`, preserva as regras que já existem no phase e substitui só a própria (casa pela descrição). Exige token com **Zone → Dynamic Redirect → Edit**.

**Cuidado com a propagação:** logo depois do `PUT`, a medição ainda mostra a cadeia antiga, porque o Always Use HTTPS responde primeiro até a regra propagar (de alguns segundos a cerca de um minuto). No cirurgiacoracao.com.br a primeira medição deu 2 saltos e a seguinte deu 1. Meça de novo antes de concluir que a regra perdeu.

**Why:** perdi tempo procurando no nginx antes de perceber que o primeiro salto nem chega ao servidor, e quase concluí que a regra não funcionava quando era só propagação.

**How to apply:** em qualquer domínio da rede com esse sintoma, rodar `python cf_www_apex.py dominio.com.br --dry-run` e depois sem a flag, em vez de investigar o vhost. Esperar e medir de novo antes de julgar o resultado.
