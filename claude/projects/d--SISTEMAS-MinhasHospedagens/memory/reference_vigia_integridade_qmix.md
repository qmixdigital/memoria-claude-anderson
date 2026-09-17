---
name: reference_vigia_integridade_qmix
description: "Vigia de integridade da rede: /opt/qmix-integrity/scan.sh no opengravity varre as 3 hospedagens por SSH a cada 6h e alerta no Telegram só o que é novo. Complementa (não substitui) o /opt/security-monitor."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

**`/opt/qmix-integrity/scan.sh`** no **opengravity**. Cron `17 */6 * * *`. Log: `/opt/qmix-integrity/scan.log`, estado em `estado/{vps1,anderson-gna,qmix}.visto`.

**Por que existe:** o euvo ficou 3 meses invadido sem ninguém ver. O Wordfence não pegou porque estava em Basic (ver [[reference_wordfence_basic_vs_extended]]), e **61% da rede (52 de 85 sites) nem tem Wordfence**.

**Arquitetura, e o motivo dela:** roda **do opengravity**, entrando por SSH. Não é detalhe — as hospedagens foram invadidas com vetor desconhecido, então (a) token do Telegram nelas seria entregar credencial a quem já provou plantar arquivo, e (b) script local o invasor vê e desliga o cron. Daqui, as hospedagens não guardam segredo nenhum e nem sabem que estão sendo auditadas. Token lido do `/opt/opengravity/.env` em runtime, **nunca hardcoded**.

**Chave:** `/root/.ssh/id_ed25519_qmix_integrity`, autorizada nas 3 com `restrict,no-port-forwarding,no-agent-forwarding,no-X11-forwarding`. Aliases `qi-vps1` / `qi-anderson` / `qi-qmix`.

**O que procura** (assinaturas dos ataques REAIS: euvo + advdobrasil):
`PHP-EM-LANGUAGES` (vetor do backdoor do euvo) · `INDEX-GIGANTE` (>100KB fora do core = pasta sombreando slug) · `GSC-PLANTADO` (google*.html em subpasta) · `KIT-CLOAKING` (wp-clone/wp-user/index1.php) · `C2-CONHECIDO` (gas-lagi, pafisusterslot, ib2.txt, nuvo77) · `DROPPER` (eval + fetch remoto) · `PHP-EM-UPLOADS` (**com hash md5**).

⚠️ **O hash não é luxo:** sem ele o vigia só olha caminho, e quem sobrescrevesse um dos 38 `index.php` de plugin já conhecidos passaria invisível.

**Só alerta o NOVO.** Sem isso vira ruído diário e em duas semanas ninguém lê. Linha de base de 15/07/2026: **rede limpa** (0 backdoor, 0 cloaking, 0 C2); os 38 achados são stubs `<?php // Silence is golden` / `header(403)` de plugin, todos ≤99 bytes, verificados um a um por hash.

**Testado com isca:** plantei um backdoor falso em `languages/` e um PHP em uploads → pegou os dois, e o do languages disparou **dois** detectores (PHP-EM-LANGUAGES + DROPPER). Iscas removidas. Leva ~44s para as 3 hospedagens.

**JÁ EXISTIA `/opt/security-monitor/`** (modos `integrity|admins|malware`), rodando e cobrindo as mesmas 3 hospedagens. **Não é duplicata:** ele procura outras assinaturas (imgmini.php, dir `ug8`, `is_google_bot`, `index-old.php`, `eval(base64_decode`, php >50k em uploads) e **não** cobre `wp-content/languages` nem os C2 do euvo. Os dois se complementam. Era ele que tinha a senha em texto puro — ver [[reference_senha_ssh_hostinger_texto_puro]].

**Ajustar whitelist** (falsos positivos de plugin legítimo já mapeados): `aios/firewall-rules/settings.php`, `wpallexport/functions.php`, `wpallimport/functions.php`, `wph/environment.php`, `tg-demo-pack/tg-demo-config.php`, `*.l10n.php`.

⚠️ Editar o script **local e transferir**: heredoc por ssh corrompe o PHP/bash, e Python no Windows grava CRLF que o bash remoto rejeita (`$'do\r'`) — usar `write_bytes` com `\n`.
