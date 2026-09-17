---
name: reference-alerta-disco-telegram
description: Agente de alerta de disco por Telegram instalado nas 5 VPS ativas, roda local em cada uma e nao depende de servidor central
metadata:
  type: reference
---

Instalado em 26/08/2026, depois do incidente em que a clinicas-vps chegou a
100% e derrubou 7 sites ([[reference-clinicas-vps-disco-isr]]).

    /usr/local/bin/qmix-disk-alert.sh     # o agente
    /etc/qmix-disk-alert.env              # token + chat + nome da VPS (chmod 600)
    /var/lib/qmix-disk-alert.state        # faixa atual + timestamp
    cron: */30 * * * *

Roda **em cada VPS**, nao num servidor central: se o opengravity cair, as
outras continuam avisando. Bot `@qmixdigital_bot`, credenciais lidas de
`/opt/opengravity/.env` na instalacao.

Faixas: 80% atencao, 90% alerta, 95% critico, e um aviso de normalizacao ao
voltar abaixo de 80%. So manda quando a **faixa muda** ou depois de 12h na
mesma faixa, senao vira ruido diario e ninguem le. Em alerta e critico a
mensagem ja traz os 5 maiores diretorios, para nao precisar entrar no servidor.

**VPS cobertas (5):** opengravity, srv1166087, clinicas-vps, renato-novo,
gnd-motor. Fora: `cliquex` (timeout, VPS zerada, ver
[[reference-vps-cliquex-zerada]]) e `cliquex-new` (host key mudou).

**As hospedagens compartilhadas ficam de fora**: o limite la e quota, nao disco
de sistema, e a Hostinger bloqueia crontab de usuario
([[reference-wpcron-centralizado-opengravity]]). Para cobri-las seria preciso
um checador por SSH a partir do opengravity, no molde do
[[reference-vigia-integridade-qmix]].

Estado na instalacao: opengravity ja em **81%**, unica que disparou aviso.
