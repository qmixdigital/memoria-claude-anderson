---
name: reference-varredura-links-quebrados-rede
description: Varredura de links quebrados na rede própria (portal-engine e diretórios Next), método do briefing do Jean adaptado, onde estão os dados e o que falta
metadata:
  type: reference
---

Em 03/10/2026 o Anderson mandou aplicar na rede própria o briefing de varredura de links quebrados que o Jean usou nos sites WordPress dele. Regras do briefing que valem aqui: só leitura (nenhuma correção sem ordem dele, caso a caso), visitas a sites externos NUNCA saem do IP dos servidores (rodam do PC dele), GET com User-Agent de navegador, uma conexão por domínio, teto por domínio por rodada, parar no primeiro bloqueio, DNS antes da visita, e todo "quebrado" precisa de segunda rodada 1 ou 2 dias depois.

**Adaptação ao portal-engine** (não há WordPress): corpo dos artigos lido dos JSON em `/srv/portais/*/data`, modelo (cabeçalho, rodapé, lateral) lido de 3 páginas já geradas em `public/` por portal, e os 8 diretórios Next lidos do Postgres. Link interno confere pelo arquivo em `public/`; o nginx escuta no IP público, não em 127.0.0.1, então o `--resolve` usa o IP do `ss -ltn`.

**Tudo em** `D:/PORTAIS/BACKLINKS/varredura-links-quebrados/`: `pe_links_full.js` e `pg_artigos.sh` (extração), `etapa1.py` (contagem), `origem_check.js` (internos), `dns_check.py` (DoH em Cloudflare e Google), `visita.py --site X | --todos` (visitas com memória em `dados/visitas.json`, não revisita em 20 dias), `amostra_publica.py`, `relatorio.py`. Entrega: `VARREDURA-links-quebrados-rede-2026-10-03.xlsx` e `ocorrencias-completas.csv`.

**Números da rodada 1:** 113 sites, 47.230 artigos, 182.737 ocorrências, 59.927 destinos únicos (13.537 externos em 5.077 domínios). Internos: 63 destinos quebrados na origem. Externos: 7.009 OK, 667 quebrados (250 por domínio inexistente, 417 por 404/410), 21 estacionados, 685 para conferir, 3.982 inconclusivos (2.457 adiados pelo teto de 6 por domínio, 172 Amazon/Mercado Livre, o resto bloqueio 403 e tempo esgotado). 315 de 4.093 domínios bloquearam o verificador. Ritmo medido: cerca de 225 visitas por minuto com 12 domínios em paralelo.

**Falta:** segunda rodada de confirmação, novas rodadas para os adiados pelo teto (basta rodar `visita.py --todos` de novo), lote lento de Amazon e Mercado Livre, internos dos diretórios Next. `teste.local` é um portal de teste que está no sites.json da rede.

**Continuação autorizada pelo Anderson em 03/10/2026 ("sim"):**
- Rodadas dos adiados pelo teto: `rodadas.py --intervalo 12 --max 45` iniciado destacado no PC dele em 03/10 (uma rodada a cada 12 min, log em `dados/rodadas.log`, linha FIM ao terminar; gera a planilha do dia no fim).
- Segunda rodada (confirmação): tarefa agendada do Windows `QMIX-varredura-links-confirmacao`, uma vez, em 05/10/2026 09:07, roda `confirma.bat` (`rodadas.py --confirmar`). Revisita só o que está "Quebrado", reconsulta DNS no Quad9 e no resolvedor do sistema, e marca "confirmado em duas rodadas"; a coluna "Rodada anterior" guarda o resultado da primeira. Para remover: `Unregister-ScheduledTask -TaskName QMIX-varredura-links-confirmacao`.
- Depois da confirmação, ler o log, conferir a planilha `VARREDURA-links-quebrados-rede-2026-10-05.xlsx` e entregar os números. Continua só leitura: correção de link só com ordem dele, caso a caso.
