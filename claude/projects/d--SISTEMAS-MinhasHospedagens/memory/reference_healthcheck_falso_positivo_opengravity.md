---
name: reference_healthcheck_falso_positivo_opengravity
description: "O healthcheck da rede roda dentro do opengravity, então quando esse servidor sofre ele reporta dezenas de sites saudáveis como fora do ar"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-07T16:41:39.918Z
---

O bot de healthcheck da rede vive em `/opt/opengravity`, **dentro do servidor que
ele também monitora**. Quando o opengravity fica sem CPU, o Node dele não completa
as requisições e aborta cada fetch, reportando `This operation was aborted` para
todos os sites da lista, inclusive os que estão perfeitamente no ar em outras
hospedagens.

**Como reconhecer o falso positivo:** dezenas de sites caindo ao mesmo tempo, com
a **mesma mensagem** e o **mesmo tempo decorrido** ("há 29min" em todos). Falha
real quase nunca é simultânea e uniforme assim.

**Antes de agir sobre um alerta em massa, medir de fora.** Um `curl` da máquina
local, com amostra de sites de cada um dos três hosts, separa em segundos o
problema real do ruído:

```bash
for d in girodasnoticias.com romanceseleituras.com barranews.com.br; do
  ( echo "$d $(curl -s -o /dev/null -m 20 -w '%{http_code}' -A 'Mozilla/5.0 Chrome/128' "https://$d/")" ) &
done; wait
```

Em 07/09/2026 esse teste mostrou 8 de 8 sites no ar enquanto o bot acusava 56
fora. O que realmente estava fora eram só os apps Next via PM2 e os blogs
WordPress pesados **do próprio opengravity**, que consomem mais CPU por
requisição; WordPress leve (camilafarias, drtiagobernardes) voltou sozinho.

**Melhoria pendente:** mover o healthcheck para outra máquina, ou ao menos fazê-lo
checar a própria saúde antes de reportar (se o load local está absurdo ou o steal
alto, suprimir o alerta em massa e avisar que o problema é o vigia). Enquanto isso
não for feito, todo alerta de dezenas de sites exige verificação externa.

Ver [[reference_site_healthcheck]], [[reference_hostinger_cpu_limit_steal]].
