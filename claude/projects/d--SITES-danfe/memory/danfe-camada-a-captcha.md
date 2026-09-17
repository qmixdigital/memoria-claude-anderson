---
name: danfe-camada-a-captcha
description: Projeto danfe-platform — descobertas do spike da Camada A (captcha/proxy SEFAZ)
metadata: 
  node_type: memory
  type: project
  originSessionId: c1138f6b-88c5-4ef8-b27b-418633899c6b
---

Projeto `d:\SITES\danfe` (danfe-platform): SaaS de consulta DANFE/NF-e. Spike da Camada A (consulta de resumo no portal nacional `nfe.fazenda.gov.br`) rodado em jun/2026 com 2Captcha + proxy.

Descobertas verificadas (gastos ~US$0,02 em solves):
- A página real é `consultaRecaptcha.aspx` (a `consultaResumo.aspx` faz 2 redirects de handshake de cookie ASP.NET). Coletor precisa seguir redirects com cookie jar.
- Campos do form: chave = `<<REMOVIDO>>`; botão = `ctl00$ContentPlaceHolder1$btnConsultarHCaptcha` (value "Continuar"); token em `h-captcha-response`. hCaptcha PADRÃO (sem rqdata/enterprise), sitekey `<<REMOVIDO>>`.
- O portal usa cadeia TLS ICP-Brasil → fora do CA bundle padrão; precisa de CA ICP-Brasil ou `rejectUnauthorized:false` (flag `SEFAZ_TLS_INSECURE`).
- **IPRoyal residencial BLOQUEIA domínios .gov.br** (403, server=null) na política de uso. Descartado. Provável que Bright Data/Oxylabs/Smartproxy também bloqueiem gov.
- **IP-binding NÃO é a causa da recusa do captcha**: montado proxy próprio (tinyproxy na VPS BR srv1166087/31.97.173.40); logs provaram que solve do 2Captcha (IP 138.201.188.166) E nosso POST saíram pelo mesmo IP da VPS, e mesmo assim "Falha na validação do Captcha".
- **Gargalo real = confiabilidade do solver hCaptcha**: token do 2Captcha é recusado pelo hCaptcha da SEFAZ (qualidade/score ou expiração); solve via proxy leva 90-180s com timeouts frequentes.

Infra deixada na VPS srv1166087 (alias ssh `hostinger-vps-srv1166087`, HestiaCP): tinyproxy na porta 8888 (auth danfe / senha em /root/.danfe_proxy_pass), regra de firewall Hestia #11 ACCEPT 8888. É um proxy autenticado exposto numa box de produção (mail+sites) — liability de segurança; restringir por IP ou remover quando não estiver testando.

CapSolver TESTADO (jun/2026): **não suporta mais hCaptcha** (erro "We don't support this service" até no demo oficial; lista de task types não tem hCaptcha). Chave CapSolver CAP-397... e chave 2captcha 5dfdf... têm saldo parado (~US$6 e ~US$3). IPRoyal ~US$13 parado.

Placar dos solvers de hCaptcha pra SEFAZ: 2Captcha resolve mas token recusado (qualidade/score); CapSolver abandonou hCaptcha. Conclusão prática: Camada A (consulta de nota arbitrária via portal) NÃO é viável com solver comum hoje — exatamente o risco "zona cinzenta/best-effort" que o blueprint §2/§14 previu.

Próximos passos em aberto: (a) teste de controle com token resolvido manualmente no browser (separa qualidade-do-token de erro-de-POST, custo zero) — mas POST/campo/submit já provados corretos, então baixa chance de mudar o veredito; (b) tentar CapMonster (baixa confiança, mesma qualidade de farm); (c) RECOMENDADO: pivotar pro defensável — DANFE grátis (packages/danfe já funciona) + SEO programático + Camada C (certificado do cliente). Próximo passo de produto = apps/web (Fase 1): gerador de DANFE grátis + validação, que move tráfego/AdSense e não depende de captcha.
