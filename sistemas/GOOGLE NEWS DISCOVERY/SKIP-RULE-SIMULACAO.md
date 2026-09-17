# Skip rule da Cloudflare — simulação para o piloto

IP do motor: **62.238.112.87** · gerado em 20/08/2026 · `scripts/cloudflare_skip_motor.py`

**Nada foi alterado.** Executar com `--aplicar` quando a lista dos 15 fechar.

## Resumo

| | |
|---|---|
| Zonas simuladas | 24 |
| Erros | 0 |
| Estender o skip do Google (padrão) | 21 |
| Inserir no topo (cabe no Free) | 1 |
| **Precisam de decisão** | **2** |
| Zonas SEM skip do Googlebot | 2 |

## Verificação de ordem

Em **todas** as zonas o primeiro `skip` está na **posição 1**, sem regra de bloqueio acima. Estender no lugar é seguro: a posição é preservada e o `ruleset: current` faz o request casado pular todo o resto do ruleset.

Conferi também se alguma genérica bloqueia por método. A regra chamada **"Method fix"** (blogse, azulmagazine) **não bloqueia por método** apesar do nome: é lista de assinaturas de ataque (user-agents, payloads hex, sondas RDP/SSTP). O POST do publicador não é afetado por ela.

## Precisam de decisão sua

### `blogse.com.br` e `azulmagazine.com.br`

Únicas duas sem o skip de verified bot. O skip da posição 1 é `[WP] Bypass para Admin e Ads`, com `phases: [http_ratelimit, http_request_firewall_managed, http_request_sbfm]` e **`products: null`**.

Estender essa regra cobre rate-limit, WAF gerenciado e Super Bot Fight Mode, mas **não** cobre `securityLevel`, `bic`, `waf`, `uaBlock`, `hot`, `zoneLockdown`.

Três saídas:

1. **Aceitar a cobertura parcial** — na prática o que importa para publicar por API é rate-limit e WAF gerenciado, que ficam cobertos. É o padrão do script.
2. **`--unir-escopo`** — soma phases e products à regra existente. Cobre tudo, mas **alarga a regra do WordPress para todos os outros casos que ela casa** (wp-admin logado, hosts de anúncio), não só para o nosso IP. Não faço isso em silêncio.
3. **Deixar essas duas fora do piloto** e resolver junto com o item abaixo.

### Essas mesmas duas zonas não têm skip do Googlebot

Achado **pré-existente**, não causado por este trabalho, e mais grave que a questão do motor: viola a REGRA #0 da rede (nunca bloquear o Google). As duas têm 5 regras (limite do Free) e nenhuma cobre `cf.client.bot`. Vale um trabalho à parte para acomodar o skip do Google nelas.

## Plano por zona

| # | Domínio | Conta | Regras | Skip do Google? | Plano |
|---|---|---|---|---|---|
| 1 | `jornalistanofato.com` | conta7 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 2 | `nerddahora.com` | conta7 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 3 | `ocontraditorio.com` | conta7 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 4 | `olharmoderno.com` | conta7 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 5 | `professortic.com` | conta7 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 6 | `semtedio.com` | conta7 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 7 | `desassossegada.com.br` | conta15 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 8 | `ferronoticias.net` | conta15 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 9 | `gpnoticias.com` | conta15 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 10 | `noticiasdiarios.com` | conta15 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 11 | `blogse.com.br` | conta31 | 5 | **NÃO** | estender '[WP] Bypass para Admin e Ads' — **atenção**: essa regra nao cobre bic, hot, rateLimit, securityLevel, uaBlock, waf, zoneLockdown |
| 12 | `clickinfohub.com` | conta31 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 13 | `dataroomus.com` | conta31 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 14 | `portalr5.com` | conta31 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 15 | `rumourisnews.com` | conta31 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 16 | `azulmagazine.com.br` | conta32 | 5 | **NÃO** | estender '[WP] Bypass para Admin e Ads' — **atenção**: essa regra nao cobre bic, hot, rateLimit, securityLevel, uaBlock, waf, zoneLockdown |
| 17 | `jornalconceito.com` | conta32 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 18 | `jornalimigrantes.com` | conta32 | 4 | sim | inserir no topo (4 regras hoje, cabe) |
| 19 | `maragoginoticias.com` | conta32 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 20 | `barranews.com.br` | conta33 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 21 | `jornalacapital.com` | conta33 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 22 | `jornaldinamico.com` | conta33 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 23 | `jrnoticias.com` | conta33 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |
| 24 | `portalnoticiasbh.com` | conta33 | 5 | sim | estender 'ALLOW verified search bots (Googlebot/Bi' |

## Execução, quando a lista fechar

```bash
cd "D:\SISTEMAS\GOOGLE NEWS DISCOVERY"
# editar candidatos_piloto.txt deixando só os 15 escolhidos
python scripts/cloudflare_skip_motor.py --dominios candidatos_piloto.txt          # confere
python scripts/cloudflare_skip_motor.py --dominios candidatos_piloto.txt --aplicar
```

Validar depois, de dentro do motor: o POST com chave inválida tem que continuar dando **401** (resposta do receptor) e não **403** (bloqueio da Cloudflare).

```bash
ssh gnd-motor "curl -s -o /dev/null -w '%{http_code}
' -X POST \
  https://DOMINIO/wp-json/NS/artigos -H 'X-API-KEY: teste' -d '{}'"
```