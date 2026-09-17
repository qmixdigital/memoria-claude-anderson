---
name: Hostinger Renato Rochegger
description: VPS Hostinger do Renato Rochegger (autônomo da rede QMIX) hospeda sites SMM (seguidoresbrasil.com.br, seguidores.digital, comprarlikes.com.br, impulsionagram.com). Acesso SSH via alias renato-novo. Documentação completa em D:\SISTEMAS\MinhasHospedagens\Hostinger Renato\ACESSO.md
type: reference
originSessionId: 65d9e9f5-c35a-47c6-83e9-345a1f04d04f
---
VPS Hostinger contratado pelo Renato Rochegger, hospeda apps SMM proprietários (plugin Smmloja/Upgram em WordPress). Servidor autônomo — não faz parte da rede QMIX, não roda Antonio.

**Acesso rápido:**
- SSH: `ssh renato-novo` (alias já configurado, IP 31.97.20.252, user root, identity id_ed25519_renato)
- Painel CloudPanel: https://31.97.20.252:8443/
- Sites: seguidoresbrasil.com.br, seguidores.digital, comprarlikes.com.br, impulsionagram.com

**Documentação completa:** `D:\SISTEMAS\MinhasHospedagens\Hostinger Renato\ACESSO.md` — contém document roots por site, pools PHP-FPM (portas 18001-18004), DB credentials, prefixo `Seg_Br_` do Action Scheduler, histórico de incidentes e mitigações em produção.

**Quando consultar:** qualquer pedido envolvendo seguidoresbrasil.com.br, seguidores.digital, comprarlikes.com.br, impulsionagram.com, plugin Smmloja/Upgram, "VPS do Renato", "hospedagem do Renato", "Hostinger Renato Rochegger", ou diagnóstico em qualquer um desses 4 sites.

⚠️ **NEM TODO site "do Renato" está nessa VPS.** `sejapopular.com` (marca "Seja Popular", painel de revenda SMM) NÃO está na renato-novo — é um **Perfect Panel** (SaaS, CSS vem de `storage.perfectcdn.com`, NÃO é WordPress) hospedado em **OVH 152.228.155.73**, sem SSH/arquivos que eu acesse. Logo/marca de um Perfect Panel se troca pelo **admin do painel** (Configurações → Aparência/Tema), não por arquivos. Provedor upstream desses painéis = Agencia Popular/JustAnotherPanel. Logo criada p/ Seja Popular (conceito barras de crescimento, Poppins ExtraBold, gradiente rede-social) em `D:\SISTEMAS\MinhasHospedagens\Hostinger Renato\logo-sejapopular\`.
