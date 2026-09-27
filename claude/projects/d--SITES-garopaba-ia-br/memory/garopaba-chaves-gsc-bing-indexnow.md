---
name: garopaba-chaves-gsc-bing-indexnow
description: "Qual service account enxerga o GSC de garopaba.ia.br, chave do IndexNow, código do Bing e a chave SSH que o deploy.sh precisa"
metadata: 
  node_type: memory
  type: project
  originSessionId: fb90e2e5-26f8-4212-93cc-39ac4942664f
  modified: 2026-09-20T19:35:58.624Z
---

garopaba.ia.br (medido em 20/09/2026):

- **GSC pela API**: só a conta **seoqmix** funciona (`GSC_CREDENCIAL=C:/Users/User/<<REMOVIDO>>`, permissão siteFullUser). A backlinkguard lista a propriedade como siteOwner mas recebe 403 em sitemaps, searchAnalytics e inspeção. O `gsc_api.py` da skill google-console-analise diz "nenhuma chave tem acesso" porque testa de outro jeito; ir direto no `gsc.py` da diretorios-do-zero com a seoqmix.
- **Bing Webmaster**: site verificado em 20/09 por `app/public/BingSiteAuth.xml` (código 73706CE0268660E48484AF2A5E9D2730); chave da API em `Documents/APIs/bing-webmaster-tools.txt`.
- **IndexNow**: chave `<<REMOVIDO>>`, arquivo em `app/public/` e cópia em `Documents/APIs/indexnow-garopaba.txt`. Logo depois do deploy o endpoint devolve 403 `SiteVerificationNotCompleted`; um minuto depois aceita (200).
- **Deploy**: a VPS é a clinicas-vps (31.97.162.199) e a chave é `<<REMOVIDO>>`; o script já foi corrigido para esse padrão. Com a `id_ed25519_vps` o sintoma é "Permission denied" seguido de "pacote chegou corrompido" (md5 remoto vazio).

**Why:** perdi tempo tentando 4 chaves de GSC e um deploy inteiro com a chave SSH errada.
**How to apply:** ao mexer em garopaba, começar pela seoqmix no GSC e rodar `scripts/deploy.sh` sem DEPLOY_KEY.
