---
name: gsc-conta-de-servico
description: Conta de servico seoqmix tem acesso total (siteFullUser) a propriedade de dominio sc-domain:cirurgiadojoelhogoiania.com no Search Console; script pronto em _migracao/gsc.py
metadata:
  type: reference
---

`seoqmix@seoqmix.iam.gserviceaccount.com` (chave em `C:\Users\User\Documents\APIs\seoqmix-024e9465e9d9.json`)
e **siteFullUser** da propriedade de dominio `sc-domain:cirurgiadojoelhogoiania.com`, que cobre apex,
www e blog. Da para listar/enviar/remover sitemaps e inspecionar URLs pela API.

Cliente pronto: `d:\GitHub\joelho-gh\_migracao\gsc.py` (`sites`, `sitemaps`, `submit`, `delete`, `inspect`).
`google-auth` ja esta instalado no Python local.

Em 17/09/2026: sitemap novo (554 URLs) enviado e lido sem erro; 18 sitemaps obsoletos do blog
removidos (14 eram URLs erradas com erro desde out/2025). "Solicitar indexacao" nao existe na API,
so na interface.

**How to apply:** para outros sites, rodar `python gsc.py sites` e ver se a conta foi adicionada
como usuario na propriedade; se nao aparecer, o Anderson precisa adicionar pela interface.
