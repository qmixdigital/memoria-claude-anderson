---
name: reference-hostinger-consutec
description: Hospedagem compartilhada Hostinger do grupo Consutec, cliente novo fora da rede QMIX, alias SSH consutec
metadata:
  type: reference
---

Cliente novo cadastrado em 25/08/2026. Hospedagem **compartilhada** Hostinger
(nao e VPS), 4 sites WordPress de um mesmo grupo industrial.

    ssh consutec        # 85.31.229.67:65002, user u689374768
                        # chave DEDICADA ~/.ssh/id_ed25519_consutec

Sites em `/home/u689374768/domains/<dominio>/public_html`:
acaidoceu.com.br, biofiltros.com.br, consutec.ind.br, rotaambiental.com.br.
Nenhum atras de Cloudflare (Server: hcdn, CDN da propria Hostinger).

**NAO faz parte da rede de publicacoes QMIX**: nao incluir em backlink,
pruning, AdSense em massa nem instalacao de mu-plugin da rede, mesma regra de
[[feedback-sites-clientes-rede]].

Chave propria em vez de reaproveitar a da rede, por causa de
[[reference-senha-ssh-hostinger-texto-puro]].

Achados da primeira varredura e pendencias em
`D:\SISTEMAS\MinhasHospedagens\Hostinger Consutec\ACESSO.md`. O mais grave:
acaidoceu.com.br esta fora do ar desde 28/01/2025 por SSL expirado, e dois
`create_autologin_*.php` de 2023 dao sessao de admin a quem abrir a URL.
Falta tambem a blindagem de PHP em uploads/languages de
[[reference-blindagem-php-uploads-languages]].
