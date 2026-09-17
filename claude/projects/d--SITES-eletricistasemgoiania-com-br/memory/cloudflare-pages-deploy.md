---
name: cloudflare-pages-deploy
description: Onde o site eletricistasemgoiania.com.br vive na Cloudflare (conta, zona, projeto Pages, repo GitHub) e como o deploy acontece
metadata:
  type: project
---

O site eletricistasemgoiania.com.br e um HTML estatico hospedado no **Cloudflare Pages**.

- Conta Cloudflare: "QMIX Backups", account_id 862514f37ef20f4575c631621a1dd750 (entrada `conta16` em d:/SISTEMAS/Cloudflare/contas.json; o token `master` tambem enxerga)
- Zona: d450b6618402ee41e35e06c4a4c4cbc7, DNS apex e www em CNAME proxied para eletricista-goiania.pages.dev; www e dominio custom do projeto e tem Redirect Rule www -> apex na zona (criado em 11/09/2026 com autorizacao do Anderson)
- Projeto Pages: `eletricista-goiania`, fonte GitHub qmixdigital/eletricista-goiania, branch main, build_command vazio, destination_dir `public`
- Deploy: basta commit + push na main; o Pages builda sozinho
- Em 11/09/2026 o repo local foi movido de d:/GitHub/eletricista-goiania para d:/SITES/eletricistasemgoiania.com.br (as pastas antigas foram apagadas). Sobrou um backup antigo em C:/Users/User/Documents/GitHub/eletricista-goiania.zip (out/2025)

**Why:** o Anderson pediu para consolidar tudo nessa pasta para ajustar e fazer deploy.
**How to apply:** editar em `public/`, commitar e dar push; conferir o deploy via API Pages com o token master.
