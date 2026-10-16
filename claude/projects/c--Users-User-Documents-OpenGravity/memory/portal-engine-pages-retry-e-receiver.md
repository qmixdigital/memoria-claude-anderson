---
name: portal-engine-pages-retry-e-receiver
description: "Motor dos portais (portal-engine nas 3 VPS) - Pages deploy tenta 2x antes de alertar (12/10/2026), pages_pack roda como usuario portais, e o bug de site nulo no receiver.js que derrubava o servico"
metadata:
  node_type: memory
  type: project
  originSessionId: 5b0e314b-e734-4943-99e2-3defe71f3ead
  modified: 2026-10-16T00:48:56.910Z
---

**Alerta "[srvX] deploy no Pages FALHOU: <portal> (1)"** com `Failed to publish your
Function. Got error: Unknown internal error occurred.` = instabilidade do
Cloudflare Pages (19/09: edenoticias, folhaum; 12/10: advivo, curiosododia).
O log do wrangler mostra upload completo e o status do deployment voltando
erro. Refazer passa. Correcao de fundo (12/10/2026): `pagesDeploy()` em
`/opt/portal-engine/src/render.js` (as 3 VPS) tenta de novo em ~90 s e so manda
alerta se a 2a falhar (`_pagesRetentou`). Backup `render.js.bak-20261012-retry`.

**Token do Cloudflare Pages expirou (15-16/10/2026):** alerta com `Invalid access
token [code: 9109]` em varios portais ao mesmo tempo, seguido de `Too many
authentication failures [code: 10502]` (bloqueio temporario por tentativas com
token ruim). Nao e instabilidade: o token em `/opt/portal-engine/.cf-pages-token`
(pages.json -> tokenFile) venceu. Foi trocado (backup `.cf-pages-token.bak-expired-20261015`),
novo sem expiracao. Conferir: `curl -H "Authorization: Bearer $(cat
/opt/portal-engine/.cf-pages-token)" https://api.cloudflare.com/client/v4/user/tokens/verify`
(`expires_on`). Depois de trocar, republicar os portais afetados um a um com
`sleep 6` entre eles, senao o 10502 volta.

**pages_pack.js recusa root** (guarda de 18/09). Chamador root (bicho.service,
scripts manuais) cai em `sudo -n -u portais env HOME=/opt/portal-engine node
pages_pack.js <slug>`; o render.js da opengravity ja faz isso sozinho
(patch 19/09/2026). Manual: usar o mesmo comando.

**Reiniciar `portal-engine` (receiver.js, porta 8791):** carrega o codigo do disco
de novo. Em 12/10/2026 o restart expôs um bug latente em `receiver.js`:
`_goneSet(site)` com `site` nulo (requisicao de Host desconhecido via `@oldredir`
do nginx) derrubava o processo, 3 quedas em ~40 s antes de eu corrigir. Guard
`if (!site) return new Set();` aplicado na opengravity e na srv1166087
(`receiver.js.bak-20261012-nullsite`). clinicas-vps tem outra versao do arquivo
(sem esse trecho). Depois de qualquer restart do motor: conferir `NRestarts`
em `systemctl show portal-engine` e mandar uma requisicao com Host inexistente
para 127.0.0.1:8791.

**Why:** alerta de Pages repetido treina a ignorar o canal do Telegram.
**Ver tambem:** [[pm2-needrestart-dump-race]] (outros restarts de servico).
