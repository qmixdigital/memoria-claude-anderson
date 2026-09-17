# Pulso de Redirects Funnel — Guia Operacional

Documento de referência para qualquer sessão nova (Claude Code, outra IDE, outro
agente). Descreve **onde** as coisas rodam, **como** agendar um pulso, e as
armadilhas que já custaram tempo.

Última atualização: **14/08/2026**.

---

## 1. Arquitetura em uma frase

Todos os pulsos de redirect rodam **dentro da VPS `opengravity`**, no diretório
`/opt/cf-bot/`, agendados com `at` one-shot. A máquina Windows do Anderson serve
apenas para **editar a lista de domínios** e disparar comandos via SSH.

> **NUNCA** usar o Agendador de Tarefas do Windows nem rodar os scripts a partir
> do PC local. Isso depende do PC ligado e não é o padrão da rede. Em 10/08/2026
> foi removida uma tarefa órfã `CF_PulseUndo_20260719` que era resquício disso.

Acesso: `ssh opengravity` (alias já configurado no `~/.ssh/config`).

---

## 2. Fuso horário — a conta que mais gera erro

A VPS roda em **UTC**. São Paulo é **UTC-3**, sem horário de verão.

**Ao agendar, sempre somar +3h ao horário de SP.**

| Horário SP | Comando `at` (UTC) |
|-----------|--------------------|
| 02:00 | `at 05:00` |
| 05:00 | `at 08:00` |
| 06:00 | `at 09:00` |
| 18:00 | `at 21:00` |
| 22:00 | `at 01:00` **do dia seguinte** |
| 23:00 | `at 02:00` **do dia seguinte** |

Formato de data do `at`: **`MM/DD/YYYY`** (americano).

Atenção ao virar o dia: um pulso que termina às 22:00 SP de sexta é agendado
como `at 01:00 08/15/2026` (sábado em UTC).

**Sempre confira a data/hora atual antes de agendar** — as sessões costumam
retomar horas ou dias depois:

```bash
ssh opengravity 'TZ=America/Sao_Paulo date "+SP: %a %F %H:%M"; date -u "+UTC: %F %H:%M"'
```

---

## 3. A lista de domínios (origens)

| Onde | Caminho | Papel |
|------|---------|-------|
| Windows | `d:\SISTEMAS\Cloudflare\lista de domínios para redirecionamentos.txt` | cópia que o Anderson edita |
| VPS | `/opt/cf-bot/dominios_funnel.txt` | **é esta que os scripts leem** |

Formato: um domínio por linha, **apex sem `www.`**, ordem alfabética, sem
comentários e sem linha em branco. Cada linha vira uma zona Cloudflare.

**Estado atual: 219 domínios.**

### Sincronizar depois de editar (obrigatório)

Editar só o arquivo do Windows **não tem efeito nenhum**. É preciso subir:

```bash
# backup na VPS
ssh opengravity 'cp /opt/cf-bot/dominios_funnel.txt /opt/cf-bot/dominios_funnel.txt.bak-YYYYMMDD'
# subir
ssh opengravity "cat > /opt/cf-bot/dominios_funnel.txt" < "d:/SISTEMAS/Cloudflare/lista de domínios para redirecionamentos.txt"
# conferir que ficaram idênticos
ssh opengravity 'md5sum /opt/cf-bot/dominios_funnel.txt'
md5sum "d:/SISTEMAS/Cloudflare/lista de domínios para redirecionamentos.txt"
```

### Ao ADICIONAR domínio

Zona que não existe em nenhuma conta do `contas.json` é **ignorada em silêncio**
por `_localizar_zonas()` — entra na lista e nunca recebe regra. Sempre validar:

```bash
ssh opengravity 'cd /opt/cf-bot && /usr/bin/python3 -c "
import cf_operations as cf
z = cf._localizar_zonas()
print(len(z), \"de\", len(cf.LISTA_FUNNEL))
print(sorted(set(cf.LISTA_FUNNEL) - set(z)) or \"nenhuma faltando\")
"'
```

### Ao REMOVER domínio (armadilha séria)

O `desfazer_agendado.py` só limpa domínios **que estão na lista**. Se o domínio
tiver redirect ativo no momento em que sai da lista, a regra vira **órfã** e o
site fica fora do ar para sempre.

**Ordem correta:** apagar a regra do domínio → depois tirar da lista.

---

## 4. Contas Cloudflare

`/opt/cf-bot/contas.json` — **30 contas** (`principal`, `teste`, `conta3` a
`conta27`, `aluguel8`, `aluguel9`, `aluguel10`).

As três `aluguel*` foram adicionadas em 05/08/2026 porque 6 domínios viviam em
contas que o bot não enxergava. Elas usam o **`CF_USER_TOKEN`** (token de usuário
amplo, guardado em `d:\SISTEMAS\Cloudflare\.env`), que enxerga todas as contas.

> Nunca imprimir token em mensagem ou log.

---

## 5. Scripts em `/opt/cf-bot/`

### Núcleo

| Arquivo | O que faz |
|---------|-----------|
| `cf_operations.py` | biblioteca base: `status()`, `criar_redirect()`, `desfazer()`, `ativar()`, `desativar()`, `_localizar_zonas()`, `_get_cross_domain_rules()` |
| `desfazer_agendado.py` | apaga **todas** as regras cross-domain das zonas da lista |
| `criar_url_agendado.py <URL>` | manda **todos** os domínios para uma URL única |
| `criar_dividirN_agendado.py` | divide os domínios entre N URLs, round-robin (`i % N`) |

Interpretador: **`/usr/bin/python3`** (é o que tem `requests`).
Sempre `cd /opt/cf-bot` antes, senão o `import cf_operations` falha.
Log: **`/var/log/cf-bot-agendado.log`**.

Os scripts também mandam resumo por **Telegram** (config em `config.json`) —
é de lá que vem a mensagem "✅ Agendamento concluído / N redirects criados".

### Regra de ouro do `cf_operations`

Só mexe em regras **cross-domain** (destino é outro domínio). Regras internas
(apex↔www, path-rewrite, WAF) são preservadas. É por isso que `criexp.com.br` e
`ticketson.com.br` mantêm o 301 próprio de apex→www mesmo durante um pulso — o
visitante passa por ele e só então cai no destino.

### Anti-loop (só nos `dividirN`)

Domínio da lista que também é destino não vira origem — fica no ar. O
`criar_url_agendado.py` **não tem anti-loop**: manda as 219 zonas para a URL,
sem exceção.

### Scripts arquivados

`/opt/cf-bot/arquivo-20260806/` guarda 12 `dividirN` antigos (11, 16, 17, 20b,
22, 23, 27, 27b, 35, 35b, 36, 38) mais backups. Eles listavam como **destino** os
35 domínios que hoje são **origem** — reaproveitar qualquer um deles faria o
anti-loop excluir até 35 domínios sem avisar.

> **Não reaproveitar script antigo.** Gere um novo com os destinos do momento.

---

## 6. Receita: criar um `dividirN` novo

Clone o `dividirN` mais recente e troque só o bloco `URLS`. Rode o gerador **na
VPS** (heredoc por `ssh`), nunca com aspas escapadas em `python -c` — quebra.

```bash
ssh opengravity 'cat > /tmp/gerar.py' <<'PYEOF'
import re
src = open("/opt/cf-bot/criar_dividir12_agendado.py", encoding="utf-8").read()
URLS = [
    "https://exemplo.com/materia-1",
    "https://outro.com.br/materia-2",
]
bloco = "URLS = [\n" + "".join('    "%s",\n' % u for u in URLS) + "]"
novo, n = re.subn(r"URLS = \[.*?\n\]", bloco, src, count=1, flags=re.S)
assert n == 1, "bloco URLS nao encontrado"
open("/opt/cf-bot/criar_dividir2_agendado.py", "w", encoding="utf-8").write(novo)
print("gerado com", len(URLS), "URLs")
PYEOF
ssh opengravity '/usr/bin/python3 /tmp/gerar.py && rm -f /tmp/gerar.py \
  && /usr/bin/python3 -m py_compile /opt/cf-bot/criar_dividir2_agendado.py && echo "SINTAXE OK"'
```

Percent-encoding (`%C3%A7`) sobrevive a esse fluxo — já validado com URLs do MSN.

### Simular ANTES de agendar (sem aplicar nada)

```bash
ssh opengravity 'cd /opt/cf-bot && /usr/bin/python3 -c "
import importlib.util, sys, collections
spec = importlib.util.spec_from_file_location(\"d\", \"/opt/cf-bot/criar_dividir2_agendado.py\")
m = importlib.util.module_from_spec(spec); sys.modules[\"d\"]=m; spec.loader.exec_module(m)
import cf_operations as cf
dest = {m.norm(u) for u in m.URLS}
src = [d for d in cf.LISTA_FUNNEL if d not in dest and d not in getattr(m, \"EXCLUIR\", set())]
g = [[] for _ in m.URLS]
for i,d in enumerate(src): g[i % len(m.URLS)].append(d)
print(\"origens:\", len(src), \"| destinos:\", len(m.URLS), \"| soma:\", sum(len(x) for x in g))
c = collections.Counter()
for gr,u in zip(g, m.URLS): c[m.norm(u)] += len(gr)
for k,v in c.most_common(): print(f\"   {v:>3} -> {k}\")
"'
```

### Excluir domínios de uma rodada específica

O `criar_dividir7_agendado.py` tem o padrão: constante `EXCLUIR = {...}` e a
linha `sources = [d for d in cf.LISTA_FUNNEL if d not in dest_domains and d not in EXCLUIR]`.

---

## 7. Agendar o pulso

```bash
APPLY="cd /opt/cf-bot && /usr/bin/python3 criar_dividir2_agendado.py >> /var/log/cf-bot-agendado.log 2>&1"
UNDO="cd /opt/cf-bot && /usr/bin/python3 desfazer_agendado.py >> /var/log/cf-bot-agendado.log 2>&1"

echo "$APPLY" | ssh opengravity 'at 05:00 08/15/2026'   # 02:00 SP
echo "$UNDO"  | ssh opengravity 'at 09:00 08/15/2026'   # 06:00 SP
```

O aviso `warning: commands will be executed using /bin/sh` é normal.

### Aplicar AGORA (sem agendar)

O SSH fica preso enquanto o script roda (~3-8 min para 219 zonas). Use `setsid
nohup` e depois espere:

```bash
ssh opengravity 'cd /opt/cf-bot && setsid nohup /usr/bin/python3 criar_url_agendado.py https://destino/ \
  >> /var/log/cf-bot-agendado.log 2>&1 < /dev/null & echo iniciado'

# esperar terminar — note o [_] para o pgrep não casar consigo mesmo
ssh opengravity 'while pgrep -f "criar_url[_]agendado" >/dev/null; do sleep 15; done; echo concluido'
```

> **Armadilha:** `pgrep -f criar_url_agendado` casa com a **própria linha de
> comando do watcher** e o loop nunca termina. O truque `criar_url[_]agendado`
> resolve.

### Listar a fila com horário de SP

```bash
ssh opengravity '/usr/bin/python3 -c "
import subprocess, datetime, zoneinfo
sp = zoneinfo.ZoneInfo(\"America/Sao_Paulo\")
out = subprocess.run([\"atq\"], capture_output=True, text=True).stdout
L=[]
for l in out.strip().splitlines():
    jid, resto = l.split(chr(9),1)
    dt = datetime.datetime.strptime(resto.rsplit(\" a \",1)[0].strip(), \"%a %b %d %H:%M:%S %Y\").replace(tzinfo=datetime.timezone.utc).astimezone(sp)
    c = subprocess.run([\"at\",\"-c\",jid], capture_output=True, text=True).stdout
    acao=[w for w in c.split() if w.endswith(\".py\")]
    L.append((dt,jid,acao[0] if acao else \"?\"))
for dt,jid,a in sorted(L): print(f\"{jid:>4} | {dt:%a %d/%m %H:%M} SP | {a}\")
print(\"(fila vazia)\" if not L else \"\")
"'
```

Cancelar: `ssh opengravity 'atrm 274 275'`.
Trocar o conteúdo de um job = `atrm` do antigo + `at` novo (não dá para editar).

---

## 8. Verificar o resultado

### Estado ao vivo

```bash
ssh opengravity 'cd /opt/cf-bot && /usr/bin/python3 -c "
import cf_operations as cf
a,d,t = cf.status()
print(\"ativas:\", a, \"| destinos:\", d, \"| lista:\", t)
"'
```

Retorna `(regras_ativas, {dominio_destino: quantidade}, total_zonas)`.
Depois de um `desfazer`, o esperado é `0 | {} | 219`.

### Teste HTTP — **sempre com User-Agent de navegador**

As zonas têm WAF que bloqueia requisição sem UA. `curl` puro devolve **403** e dá
falso negativo:

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" -m 20 -A "$UA" "https://abble.com.br/"
```

### Descobrir quais zonas falharam

O `criar_url_agendado.py` reporta só a contagem. Para achar os nomes:

```bash
ssh opengravity 'cd /opt/cf-bot && /usr/bin/python3 -c "
import cf_operations as cf
from concurrent.futures import ThreadPoolExecutor, as_completed
z = cf._localizar_zonas(); sem=[]
def check(d):
    conta, zid = z[d]
    rs, regras = cf._get_cross_domain_rules(d, conta, zid)
    return d, len(regras)
with ThreadPoolExecutor(max_workers=cf.WORKERS) as ex:
    for f in as_completed([ex.submit(check,d) for d in z]):
        d,n = f.result()
        if n == 0: sem.append(d)
print(\"SEM regra:\", sorted(sem) or \"nenhuma\")
"'
```

---

## 9. Horários padrão

| Janela | Aplicar (SP) | Desfazer (SP) |
|--------|--------------|---------------|
| Madrugada | **02:00** | **06:00** *(era 05:00 até 09/08/2026)* |
| Noite | **18:00** | **22:00** |

Quando o Anderson diz "horário padrão", é a linha da madrugada.

### Como ele costuma pedir

- *"desfazer às 22 horas"* = **às 22:00**, não "daqui a 22 horas". Já houve erro
  nessa leitura em 05/08/2026.
- *"esta madrugada"* = a próxima que ainda não passou — **confirme a data atual
  antes**, porque a sessão pode ter atravessado o dia.
- *"sexta próximo"* = a sexta da semana corrente.

---

## 10. Histórico e casos conhecidos

### Os 35 diretórios de IPTV

Em 05/08/2026 entraram na lista 35 domínios que antes eram **destino** do
`dividir38` (aesupar, cieh, ticketson, jornaldejales, hotec, etc.). Não
performaram como diretórios de teste IPTV e viraram **origem permanente**.

> Não perguntar se devem ser "protegidos". Devem ser redirecionados sempre.

### Domínios removidos

`criexp.com.br` e `mareonline.com.br` saíram da lista em 10/08/2026 (221 → 219).

### Domínios com problema de DNS

| Domínio | Sintoma | Situação |
|---------|---------|----------|
| `zoonews.com.br` | `Could not resolve host` | sem registro DNS; regra é criada mas ninguém chega |
| `sindcoco.com.br` | apex não resolve | só existe CNAME `www` → `sindcoco.pages.dev`; o `www` redireciona certo |

Ambos são anteriores aos pulsos, não causados por eles.

### Falhas transitórias da API

Rajada de 219 requisições paralelas às vezes derruba 1-2 zonas
("217 criados, 2 falhas"). **Não é erro de configuração** — refazer a criação
nas zonas afetadas resolve de primeira. Aconteceu em 12/08/2026 com
`sindcoco.com.br` e `spressosp.com.br`.

### Round-robin é por URL, não por site

68 destinos onde 56 são páginas do mesmo `wtw19.com.br` → esse site fica com 171
dos 219 domínios (78%). Se o objetivo for equilibrar entre **sites**, avisar o
Anderson antes de agendar.

---

## 11. Checklist antes de agendar qualquer pulso

1. `date` na VPS — confirmar dia e hora reais em SP
2. `atq` — ver o que já está agendado e se conflita
3. Testar cada URL de destino (HTTP 200, com UA de navegador)
4. Conferir se algum destino está na lista de origens (viraria anti-loop)
5. Gerar o script novo e `py_compile`
6. **Simular a divisão** e conferir a soma = total de origens
7. Agendar apply e undo, converter +3h para UTC
8. Listar a fila de novo e conferir os horários em SP

---

## 12. Tirar dominio do ar (bloqueio WAF)

Pedido tipo "fazer esses dominios sairem do ar". Scripts em `/opt/cf-bot/`:

```bash
python3 bloquear_waf.py   <dom1> [dom2 ...]   # cria block -> HTTP 403
python3 desbloquear_waf.py <dom1> [dom2 ...]  # restaura o WAF que existia antes
```

### O limite de 5 regras (a armadilha)

A fase `http_request_firewall_custom` aceita **no maximo 5 regras** no plano, e o
pacote do `harden_site.py` ja ocupa as 5 (skip verified bots, AI bots, arquivos
sensiveis, threat>30, sem User-Agent). Acrescentar uma sexta devolve:

```
50001 exceeded the maximum number of rules in the phase
      http_request_firewall_custom: 6 out of 5
```

Por isso o `bloquear_waf.py` **salva o ruleset inteiro** em
`/opt/cf-bot/waf_backup/<dominio>.json` e substitui por uma unica regra de block.
O `desbloquear_waf.py` faz o `PUT` de volta com o JSON salvo, devolvendo as 5
regras de hardening na ordem original, e renomeia o backup para `.restaurado`.

> O `PUT` no endpoint `/rulesets/phases/<fase>/entrypoint` aceita **somente**
> `{"rules": [...]}`. Mandar `name`/`kind`/`phase` junto devolve
> `invalid JSON: unknown field "kind"`.

### Ordem das fases: redirect vence bloqueio

`http_request_dynamic_redirect` roda **antes** de `http_request_firewall_custom`.
Consequencia pratica: dominio bloqueado que tambem esta na lista dos 219 volta a
responder 301 durante um pulso de redirect — o 403 so aparece de novo depois do
`desfazer`. Comprovado em 24/08/2026.

### Propagacao

O 403 nao aparece na hora: leva de ~20s a 1 min. Medir de novo antes de concluir
que o bloqueio falhou (mesmo comportamento das Redirect Rules).

---

## 13. Pulso em domínio bloqueado (sem desbloquear)

**Não precisa desbloquear.** A fase `http_request_dynamic_redirect` roda antes de
`http_request_firewall_custom`, então a Redirect Rule vence o block enquanto
existir. Apagou a regra, o domínio volta sozinho para 403.

Ciclo comprovado em 24/08/2026 no `abble.com.br`:

| Momento | Resposta |
|---------|----------|
| bloqueado, em repouso | `403` |
| com redirect aplicado | `301 -> destino` |
| redirect removido | `403` de novo |

A regra de WAF nunca é tocada — continua na zona o tempo todo.

### Lista de origens

`/opt/cf-bot/dominios_bloqueados.txt`, regerada de `waf_backup/` (um `.json` =
bloqueio ativo; `.restaurado` = voltou ao ar e fica de fora):

```bash
ssh opengravity '/opt/cf-bot/atualizar_lista_bloqueados.sh'
```

### Scripts

Aceitam `@arquivo` (um domínio por linha) além de domínios soltos:

```bash
# destino único
python3 aplicar_avulso.py  <URL> @/opt/cf-bot/dominios_bloqueados.txt

# dividir entre N destinos, round-robin, com anti-loop
python3 dividir_avulso.py  @/opt/cf-bot/dominios_bloqueados.txt URL1 URL2 URL3

# encerrar a janela (volta todo mundo para 403)
python3 desfazer_avulso.py @/opt/cf-bot/dominios_bloqueados.txt
```

### Agendar a janela

```bash
ABRE="cd /opt/cf-bot && /usr/bin/python3 dividir_avulso.py @/opt/cf-bot/dominios_bloqueados.txt URL1 URL2 >> /var/log/cf-bot-agendado.log 2>&1"
FECHA="cd /opt/cf-bot && /usr/bin/python3 desfazer_avulso.py @/opt/cf-bot/dominios_bloqueados.txt >> /var/log/cf-bot-agendado.log 2>&1"

echo "$ABRE"  | ssh opengravity 'at 05:00 09/01/2026'   # 02:00 SP
echo "$FECHA" | ssh opengravity 'at 09:00 09/01/2026'   # 06:00 SP
```

> Diferença para os scripts do funil: `criar_url_agendado.py` e
> `criar_dividirN_agendado.py` leem `dominios_funnel.txt` (219 fixos). Os
> `*_avulso.py` leem qualquer lista, então servem para os 236 bloqueados, para um
> subconjunto, ou para domínio solto.

### Se quiser mesmo desbloquear de verdade

`desbloquear_waf.py` restaura o pacote de hardening original — use só quando o
domínio for voltar ao ar em definitivo, não para abrir janela de redirect.

---

## 14. Monitor + corta-luz do Cloudflare Workers Paid (conta QMIX Backups)

Em 16/09/2026 o Worker `ponte-areas-embargadas` (ponte do diretório
`advdobrasil.com.br/imovel-rural/`, 6,15 milhões de fichas no sitemap) estourou o
Free (100 mil req/dia) e derrubou o site inteiro em 429, inclusive o
`robots.txt`. Causa: Googlebot rastreando o diretório. Conta migrada para
**Workers Paid** (US$ 5/mês, 10 milhões de req por ciclo, excedente US$ 0,30/milhão).
Ciclo renova dia **16** de cada mês.

Regra do Anderson: **nunca pagar excedente**. Prefere reduzir fichas ou
bloquear rastreio a pagar.

### O script

`/opt/cf-bot/monitor_workers.py`, cron **de hora em hora** (`5 * * * *`), token
da `conta16` do `contas.json`, Telegram do cf-bot (chat <<REMOVIDO>>).
Estado em `monitor_workers.state.json`. Log em `/var/log/cf-bot-monitor-workers.log`.

Cada hora ele lê o GraphQL e calcula: consumo de ontem, total do ciclo, ritmo
dos últimos 3 dias, projeção e o teto diário que ainda cabe. **Manda no Telegram
às 09:00 e 21:00 SP**, e a qualquer hora em que o nível mudar.

| Sinal | Condição |
|---|---|
| 🟢 | projeção ≤ 8 M |
| 🟡 | projeção entre 8 e 10 M, ou ontem > 330 k |
| 🔴 | projeção > 10 M, ciclo > 9 M, ou ontem > 450 k |
| 🚫 | corta-luz ativo |

### Corta-luz (a resposta ao "não quero pagar excedente")

A Cloudflare não tem teto de gasto no Workers Paid: passou de 10 M, cobra. Então
o script faz o teto: ao chegar em **9,5 milhões** no ciclo (500 k de margem para
o atraso do analytics), ele **apaga as 8 rotas do Worker** na zona
`advdobrasil.com.br`. Sem rota, requisição nenhuma chega ao Worker e nada é
cobrado. Guarda as rotas no estado e **restaura sozinho** na primeira execução
do ciclo seguinte. Testado ponta a ponta em 16/09/2026: 8 rotas apagadas e
recriadas idênticas (padrão e `fail_open`).

Efeito enquanto o corte está ativo: institucional (Pages) segue no ar;
`/imovel-rural/*` responde **404** do Pages; `robots.txt` volta a ser o do Pages
(desatualizado). O aviso 🔴 chega dias antes, tempo de reduzir fichas ou
rastreio e evitar o corte.

Teste manual: `ssh opengravity 'cd /opt/cf-bot && python3 monitor_workers.py --teste'`
(o `--teste` nunca aciona o corte). Ciclo lido da API de subscriptions com o
primeiro token do `contas.json` que tiver Billing Read; sem nenhum, usa a
âncora do dia 16.

### 17/09/2026: o pico de 665 k não era Google

Primeiro alerta 🔴: 16/09 fechou com 665.789 req e projeção de 11,4 M. O
analytics da zona (amostrado) mostrou quem era:

| Bot | Requisições |
|---|---|
| ClaudeBot (Anthropic) | ~972 k |
| AhrefsBot | ~120 k |
| GPTBot (OpenAI) | ~85 k |
| SemrushBot, RSiteAuditor, DeepSeek, Qwen, Bytespider, Mistral, Meta… | ~30 k |
| **Googlebot** | **fora do top 15** |

Tudo HTML do diretório. Nenhum crawler de busca. Correção, sem tocar no Worker:

1. `ai_bots_protection: block` na zona (API `bot_management`): bloqueia
   ClaudeBot, GPTBot, Bytespider e cia. na borda, **antes** do Worker, então não
   conta na cobrança. Googlebot/Bingbot passam.
2. Bots de SEO (Ahrefs, Semrush, RSiteAuditor, MJ12, DotBot, DataForSeo, BLEXBot,
   PetalBot) anexados por `or http.user_agent contains` à regra WAF já existente
   `[WP] Bloqueio de Ameaças Comuns`. A zona já tinha 6 regras, sem vaga para
   uma nova. Backup das 6 em `waf_advdobrasil_backup_20260917.json`.

Testado: ClaudeBot/GPTBot/Ahrefs/Semrush → 403; Googlebot e navegador → 200.
Regra geral para diretórios grandes atrás de Worker: **bloquear IA e SEO-tools na
borda antes de pagar por requisição deles.**

**Armadilha descoberta em 17/09, de manhã:** a regra `skip` do hardening
(`ALLOW verified search bots`) usava `(cf.client.bot)`, que é **qualquer bot
verificado pela Cloudflare** — e Ahrefs, Semrush e GPTBot são verificados. O
`skip` rodava antes e pulava o WAF inteiro para eles, então a regra de bloqueio
nunca era avaliada. O teste com `curl -A AhrefsBot` deu 403 porque vinha de IP
não verificado; o Ahrefs real passava (104 k em 11 h). Corrigido trocando a
expressão para `(cf.verified_bot_category eq "Search Engine Crawler")`: Google,
Bing, Apple e DuckDuck continuam protegidos; SEO e IA deixam de ser. **Aplicar a
mesma troca em qualquer zona da rede que precise bloquear bot verificado** — com
`cf.client.bot` no skip, nenhum bloqueio de bot verificado funciona.

Resultado: de ~52 k req/h para ~7 k/h logo após o bloqueio de IA, e para
algumas dezenas por minuto depois da correção do skip.
