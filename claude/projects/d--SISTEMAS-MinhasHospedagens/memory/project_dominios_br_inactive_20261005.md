---
name: dominios-br-inactive-20261005
description: "INCIDENTE ABERTO: 11 domínios .br ficaram \"inactive\" no Registro.br em 05/10/2026 (rblc, enjai, etc.); zonas sumiram do Cloudflare; sites de pé na origem"
metadata:
  node_type: memory
  type: project
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T18:51:31.308Z
---

Descoberto em 18/10/2026 por varredura do Search Console. Em 05/10/2026, 11 domínios mudaram para status `inactive` no Registro.br, todos no mesmo dia, com registro válido até 2027: rblc.com.br (3,8 mi impressões / 429 mil cliques em 16 meses), enjai.com.br (2,8 mi / 133 mil), postoscombustivel.ia.br, vidracariaperto.com.br, portugaldigital.com.br, cineterreiro.com.br, truenet.com.br, figa2023.com.br, radarvolt.com.br, sitegratis.app.br e skipark.com.br (este já foi apagado de propósito). Delegam para NS do Cloudflare (pares elsa/grant = conta BYTX, sky/titan, kay/lennon, ainsley/grant), mas as zonas NÃO existem em nenhuma das 34 contas do `contas.json`. Só truenet (conta latariasemgoiania.com) e radarvolt (BYTX) ainda existem, em status `moved`, com backup em `D:/SISTEMAS/cloudflare/dns_backup_zonas_moved_truenet_radarvolt_20261018.json`. As origens respondem: o app enjai e o portuga estão online na srv1166087, e o vidracariaperto na clinicas-vps. Caiu só a camada de domínio e DNS.

**Why:** a causa está no Registro.br (motivo do `inactive` não aparece no RDAP) e/ou nas zonas apagadas do Cloudflare; exige acesso ao painel do Registro.br, que só o operador tem.
**How to apply:** não recriar zonas nem mudar NS sem o operador ver o motivo no painel do Registro.br (pode ser pendência do titular, ou um e-mail de alerta). Depois de resolvido lá: recriar a zona na conta certa, usando os IPs de origem conhecidos (enjai e portugaldigital na srv1166087 31.97.173.40; vidracariaperto na clinicas-vps 31.97.162.199), e conferir que o NS bate. Relacionado: [[opengravity-limpeza-20261018]].


**Atualização 18/10/2026:** o operador confirmou que PERDEU esses domínios, então não há o que recuperar. O enjai continua vivo em **enjai.social** (mesmo app na srv1166087), então NÃO desligar. Os apps `portuga` (portugaldigital) e `truenet` na srv1166087 seguem online, com crons a cada 5 min e campanhas de e-mail (portuga), mas só atendem domínios perdidos: o operador decide se desliga. vidracariaperto, radarvolt, sitegratis e postoscombustivel ficam na clinicas-vps (SSH fechado). O monitor `sites_monitorar.txt` foi limpo (enjai.com.br virou enjai.social).

**bitcao.com.br** também foi perdido no mesmo evento (inactive 05/10); o app `bitcao-web` segue online na srv1166087. Em 18/10 apaguei o webhook Asaas do Bitcão (fila interrompida) e tirei o domínio do monitor. **Risco:** quem registrar um domínio perdido passa a receber e-mail enviado para @dominio. O enjai usa `anonimo@enjai.com.br` como placeholder em 2.071 pedidos e tem 3 clientes com e-mail @enjai.com.br. A campanha winback do portuga falha toda vez no Resend (domínio não verificado).

**18/10/2026, mais tarde:** (1) enjai: e-mail-marcador de pedido anônimo (`anonimo@enjai.com.br`) deixou de ser repassado aos gateways PagBank, Mercado Pago e OpenPix (agora vai `cliente@enjai.social`); o texto do `aviso_dominio.mjs` passou a avisar que enjai.com.br não pertence mais à Enjai; deploy via `/root/deploy-enjai.sh` OK (backups `.bak-20261018-1859`). O marcador continua no banco e no código: o app nunca manda e-mail para ele. (2) portuga e truenet APAGADOS da srv1166087 a pedido do operador (dump e código em `MinhasHospedagens/backups/`, confs em `/root/nginx-removidos`). (3) O cron `for s in enjai ...` de limpeza de cache NUNCA funcionou (nome do container saiu vazio). (4) Sem localização nas VPS acessíveis: rblc, postoscombustivel, cineterreiro, figa2023, sitegratis (provavelmente na clinicas-vps, com SSH fechado). O bitcao-web segue online na srv1166087 (apagar só com ordem).

**recibosonline.ia.br** também foi perdido no mesmo evento (NS elsa/grant = conta BYTX). O SiteGrátis foi recriado em sitegratis.qmix.com.br em 18/10 (o app principal); os sites dos usuários dependem do Worker `sitegratis-router` + R2 na conta BYTX, ainda sem solução.
