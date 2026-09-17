# REGRA #0 — duas zonas sem skip do Googlebot

> **STATUS: CORREÇÃO APLICADA em 20/08/2026.**
> Resta a **verificação**, que só o tempo dá. Ver a última seção.

Achado em 20/08/2026 durante a simulação da skip rule do `gnd-motor`. Correção
de rede, independente do piloto do motor.

Portal de notícias sem bypass garantido do Googlebot é risco de indexação, que
é o ativo da rede. A REGRA #0 do `vps-security-hardening/SKILL.md` diz que a 1ª
regra WAF custom de toda zona indexável tem que ser o `skip` de verified bot.

## Zonas afetadas

| Zona | Conta | Regras | Skip na posição 1 | Cobre `cf.client.bot`? |
|---|---|---|---|---|
| `blogse.com.br` | conta31 | 5 (limite Free) | `[WP] Bypass para Admin e Ads` | **não** |
| `azulmagazine.com.br` | conta32 | 5 (limite Free) | `[WP] Bypass para Admin e Ads` | **não** |

As duas têm exatamente a mesma estrutura de 5 regras:

| # | Ação | Descrição | Tamanho da expressão |
|---|---|---|---|
| 1 | `skip` | [WP] Bypass para Admin e Ads | 391 |
| 2 | `block` | [WP] Bloqueio de Ameaças Comuns | 689 |
| 3 | `managed_challenge` | [WP] Desafio em Páginas Sensíveis | 314 |
| 4 | `block` | Exploting Fix | 2.247 |
| 5 | `block` | Method fix | 3.467 |

## Risco hoje: latente, não ativo

Medido nas duas zonas:

| | blogse | azulmagazine |
|---|---|---|
| `security_level` | medium | essentially_off |
| Bot Fight Mode | **off** | **off** |
| Browser Integrity Check | on | on |
| Home com UA de Googlebot | HTTP 200 | HTTP 200 |

O Googlebot passa hoje. O risco materializa quando alguém **subir o
`security_level` para `high`/`under_attack`** (que é o que o playbook manda
fazer sob ataque) ou **ligar o Bot Fight Mode** — exatamente o momento em que
ninguém vai lembrar dessas duas zonas.

> Ressalva do teste: mandar UA de Googlebot de um IP qualquer **não** é verified
> bot. O teste prova que a zona não bloqueia por UA, não prova que
> `cf.client.bot` casa. A prova real é a cobertura de URL no Search Console.

## Proposta: nenhuma regra precisa ser sacrificada

**Opção A, fundir as regras de `block`, não cabe.** A soma das expressões das
três dá 6.413 caracteres, contra o limite de 4.096 por expressão. Mesmo fundindo
só a 4 com a 5 dá 5.719, ainda estoura. Fundir a 2 com a 4 caberia (2.941), mas
é sacrifício desnecessário diante da opção B.

**Opção B, recomendada: estender o `skip` da posição 1 com `or (cf.client.bot)`.**

- expressão vai de 391 para 410 caracteres, folgadíssimo
- **zero vagas consumidas**, nenhuma regra sacrificada
- é literalmente o procedimento já registrado no SKILL.md para o caso de 5
  regras: *"Se já tem 5 e uma é `skip` (ex: WordPress '[WP] Bypass Admin'),
  ESTENDER essa (add `or (cf.client.bot)` na expressão + os phases/products
  acima) em vez de criar 6ª."*

### A decisão que sobra: somar ou não `products`

A regra 1 hoje tem `phases: [http_ratelimit, http_request_firewall_managed,
http_request_sbfm]` e **`products: null`**.

| | Googlebot ganha | Googlebot NÃO ganha |
|---|---|---|
| **Sem somar products** (mínima intervenção) | pula rate-limit, WAF gerenciado e Super Bot Fight Mode | `securityLevel`, `bic`, `waf`, `uaBlock`, `hot`, `zoneLockdown` |
| **Somando products** (SKILL.md) | pula tudo, inclusive `securityLevel` sob ataque | — |

Aqui o cálculo é **oposto** ao que decidimos para o IP do motor. Para o motor,
somar `products` alargaria o bypass do WordPress sem ganho proporcional. Para o
Googlebot, `securityLevel` é justamente o que vai derrubá-lo no dia em que a
zona for para `high`/`under_attack` — que é o cenário inteiro do risco.

**Recomendo somar os products nas duas zonas.** O alargamento atinge os mesmos
matches de sempre (wp-admin logado, hosts de anúncio do Google), e o custo
disso é muito menor que perder indexação sob ataque.

## Comando

```bash
cd "D:/SISTEMAS/GOOGLE NEWS DISCOVERY"
# o script do motor já sabe estender skip existente; para o Googlebot é o mesmo
# padrão, trocando a expressão e usando --unir-escopo:
#   EXPRESSAO = "(cf.client.bot)"
#   DESCRICAO = "ALLOW verified search bots (Googlebot/Bing) - nunca bloquear"
```

Validar depois: cobertura de URL no Search Console das duas propriedades, e
`curl -A "Googlebot" https://DOMINIO/` continuando 200.

## Pendência irmã, achada no mesmo trabalho

O token da **conta31** e da **conta32** leem as configurações da zona
normalmente. Já o token da **conta7** não: `security_level` e `bot_management`
voltam sem permissão nas 6 zonas dela (`jornalistanofato.com`,
`nerddahora.com`, `ocontraditorio.com`, `olharmoderno.com`, `professortic.com`,
`semtedio.com`).

É o mesmo problema de escopo dos tokens de `conta13`, `conta17` e `conta18`:
regenerar com as três permissões e `All zones from an account`, conforme
`GOOGLE NEWS DISCOVERY/ZONAS-FALTANTES.md`. **conta7 vira o quarto token da
lista de regeneração.**

## Observação lateral, relevante para o motor

**Bot Fight Mode está desligado nas 18 zonas onde o token consegue ler** (das 24
candidatas ao piloto; nas 6 da conta7 não dá para saber). Ou seja, a skip rule
do `gnd-motor` é **precaução para o futuro, não correção de bloqueio atual** —
ela não é pré-requisito para a rampa começar, ainda que continue certa de ter.


---

# Correção aplicada (20/08/2026)

Opção B com `products` somados, nas duas zonas, conforme aprovado.

```
python scripts/cloudflare_skip_motor.py   --dominios blogse.com.br,azulmagazine.com.br --googlebot --aplicar
```

O modo `--googlebot` foi acrescentado ao script do motor em vez de virar
ferramenta nova: mesma mecânica de estender o `skip` da posição 1, trocando
expressão e descrição, e implicando `--unir-escopo`.

## O que mudou

Regra 1 (`[WP] Bypass para Admin e Ads`), nas duas zonas:

| | antes | depois |
|---|---|---|
| Expressão | 391 chars | **412 chars**, terminando em `or (cf.client.bot)` |
| `phases` | `http_ratelimit`, `http_request_firewall_managed`, `http_request_sbfm` | inalterado |
| `products` | **`null`** | `bic`, `hot`, `rateLimit`, `securityLevel`, `uaBlock`, `waf`, `zoneLockdown` |
| Total de regras | 5 | **5** (nenhuma vaga consumida) |

## Verificação feita na hora

- **Diff contra o backup**: regras 2 a 5 **byte a byte idênticas** nas duas
  zonas. Só a regra 1 mudou, e só nos dois campos previstos.
- Backup do estado anterior:
  `GOOGLE NEWS DISCOVERY/backup-waf-regra0-20260820.json`
- Home com UA de Googlebot: **200** nas duas
- Home com UA de navegador: **200** nas duas
- `/wp-login.php`: **403** nas duas, ou seja, o `managed_challenge` da regra 3
  continua ativo e o endurecimento do WordPress não foi afrouxado

## ⚠️ PENDÊNCIA DE VERIFICAÇÃO — a única coisa que ficou aberta

**Os testes acima não provam que `cf.client.bot` casa.** Mandar UA de Googlebot
de um IP qualquer não é verified bot: a Cloudflare valida o bot por IP de
origem, não por user-agent. O 200 prova apenas que a zona não bloqueia por UA,
que já era verdade antes da correção.

**A prova real é a cobertura de URL no Search Console** das duas propriedades
nas próximas semanas:

| O que olhar | Sinal bom | Sinal ruim |
|---|---|---|
| Cobertura / Páginas | indexadas estáveis ou subindo | queda de indexadas |
| Rastreamento (Estatísticas) | respostas 200 dominantes | aparecimento de 403 |
| Erros de servidor / Bloqueado | zero | qualquer volume |

Prazo de reavaliação: **meados de setembro de 2026**. Se aparecer 403 nas
estatísticas de rastreamento, a hipótese a testar primeiro é `products` não ter
efeito nessa regra por algum motivo de precedência, e aí o caminho é regra
própria de `skip` com `(cf.client.bot)`, o que exige abrir vaga fundindo a
regra 2 com a 4 (2.941 chars, cabe no limite de 4.096).
