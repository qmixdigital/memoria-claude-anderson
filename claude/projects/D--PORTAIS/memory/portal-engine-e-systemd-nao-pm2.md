---
name: portal-engine-e-systemd-nao-pm2
description: "O motor é o serviço systemd portal-engine; 'pm2 reload all' na opengravity recarrega 15 apps de clientes que nada têm a ver"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T18:48:01.534Z
---

Na opengravity o motor é **`systemctl restart portal-engine`**. Não é
`portal-receiver` (esse nome não existe) e não é pm2.

**Why:** em 21/08/2026 usei uma cadeia de reserva,
`systemctl restart portal-receiver || pm2 reload all`, e como o primeiro falhou o
segundo recarregou **15 apps que nada têm a ver com a rede de portais**:
revistamsaude, peritodicas, notebookx, skipark, geladeiras-top, arcondicionado-top,
euvo-agenda e outros. Todos voltaram `online`, sem prejuízo, mas foi um reinício
de produção alheia por engano meu.

**How to apply:** nunca encadear `|| pm2 reload all` como plano B. Se o nome do
serviço estiver em dúvida, descobrir antes:

```bash
systemctl list-units --type=service --no-pager | grep -iE 'portal|motor'
```

E `runuser -u portais -- node /tmp/reb.js <slug>` para reconstruir. `su - portais`
não funciona: a conta tem shell desabilitado e responde "This account is currently
not available".

Ver [[motor-serve-da-memoria]] e [[reiniciar-motor-depois-de-editar]].
