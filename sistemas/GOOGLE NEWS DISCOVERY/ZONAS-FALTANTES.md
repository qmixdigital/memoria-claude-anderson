# Zonas Cloudflare faltantes — ENCERRADA

> **STATUS: RESOLVIDA em 20/08/2026.** De 72 faltantes para **1**.
>
> A adoção do `.token_master` (token de **usuário**, 78 contas, 473 zonas,
> achado em `D:\SISTEMAS\Cloudflare\.token_master`) destravou **71 dos 72**
> domínios de uma vez. As quatro regenerações de token planejadas
> (conta7, conta13, conta17, conta18) foram **canceladas**, e `conta11` e
> `conta25` ficaram explicadas: tokens antigos com TTL expirado, sem nada mais
> a conferir.
>
> Cobertura final: **112 de 113**.
>
> **Fora de alcance, definitivo: `incast.com.br`.** Está na Cloudflare (par de
> NS `daphne,everton`) mas em conta de terceiro, fora das 78 que o master
> enxerga. Não é candidato ao piloto e não bloqueia nada. Se um dia for
> preciso, o caminho é pedir acesso à conta de quem administra o domínio.
>
> O procedimento de criação de token abaixo continua válido e vale manter: é a
> referência para o dia em que um token por conta for necessário de novo, e é
> onde está registrada a armadilha do escopo que originou tudo isto.

---

# Zonas Cloudflare faltantes no contas.json

Gerado em 20/08/2026 por `scripts/auditar_zonas_cf.py`.

## Resumo

| | |
|---|---|
| Domínios da rede catalogados | 113 |
| Visíveis nas 34 contas | 41 |
| **Faltantes** | **72** |
| Faltantes que estão na Cloudflare | 72 (todos) |
| Em contas que já temos (escopo do token) | 8 |
| Em contas ainda não mapeadas | 64 (no máximo 37 contas) |

Fontes cruzadas: `qmix_endpoints_atual.csv`, `rede-publicacao-allowlist.txt` e as fichas por domínio das três instâncias do portal-engine. Normalizado para o apex (`www.` removido) e sem domínios temporários de hospedagem.

## Método: o par de NS agrupa, mas não aponta a conta sozinho

Validado em **346 zonas de 30 contas**: nenhum par de nameservers apareceu em duas contas diferentes. Então domínios que compartilham o par estão na mesma conta, e descobrir a conta de **um** deles resolve o grupo inteiro.

O contrário não vale: 18 das 30 contas têm mais de um par. Os pares abaixo são um **teto** do número de contas, não o número.

## 1. Já estão em contas que temos: é escopo do token, não conta nova

O par de NS bate com uma conta do `contas.json`, mas o token não enxerga a zona. Provavelmente token com escopo de zona específica em vez de conta inteira. **Regerar o token com `Zone:Read` no nível da conta resolve estes sem procurar nada.**

| Par de NS | Conta | Domínios |
|---|---|---|
| `javon,paloma` | **conta13** | gdsnoticias.com, mundodasnoticias.net, noticiasgoias.com, osertaoenoticia.com, pneusemgoiania.com.br, pontonaturalbrasil.com.br |
| `lisa,yisroel` | **conta17** | oiempreendedores.com.br |
| `cleo,eva` | **conta18** | sabedoriaglobal.com.br |

### Permissão exata a pedir na criação do token

O erro não foi a permissão, foi o **escopo do recurso**. Um token criado com
"Specific zone" enxerga só aquela zona: as outras da mesma conta somem do
`GET /zones` e o domínio aparece como "não encontrado em nenhuma conta", que é
exatamente o sintoma dos 8 domínios acima.

No painel: **My Profile → API Tokens → Create Token → Create Custom Token**

**Permissions** (três linhas):

| Tipo | Recurso | Nível | Para quê |
|---|---|---|---|
| Zone | Zone | **Read** | listar as zonas da conta (`auditar_zonas_cf.py`) |
| Zone | Zone WAF | **Edit** | ler e gravar as regras custom (`cloudflare_skip_motor.py`) |
| Zone | Zone Settings | **Edit** | Bot Fight Mode, security level e afins |

**Zone Resources** — é aqui que estava o erro:

> `Include` → **All zones from an account** → *(escolher a conta)*

**Não** usar `Include → Specific zone`. Com "All zones from an account", zona
nova criada depois entra sozinha no escopo, e não é preciso refazer o token a
cada domínio novo.

Deixe `Client IP Address Filtering` e `TTL` em branco: token com TTL expira e
volta como `Invalid access token`, que é provavelmente o que aconteceu com
`conta11` e `conta25`.

Conferir depois de criar, trocando `<TOKEN>`:

```bash
curl -s -H "Authorization: Bearer <TOKEN>"   "https://api.cloudflare.com/client/v4/user/tokens/verify" | jq .success
curl -s -H "Authorization: Bearer <TOKEN>"   "https://api.cloudflare.com/client/v4/zones?per_page=50" | jq '.result_info.total_count'
```

O segundo comando tem que devolver o total de zonas da conta, não `1`.

## 2. Contas fora do contas.json

64 domínios em até 37 contas. Localize **um** domínio de cada grupo no painel da Cloudflare e o grupo todo vem junto.

| Par de NS | Qtd | Domínios |
|---|---|---|
| `bowen,kara` | 8 | agencianacionaldenoticias.com, boxnoticias.net, editaldeconcurso.net, exquisito.com.br, girodasnoticias.com, manacultura.com, noticiasagoras.com, noticiasubuntu.com |
| `joan,leland` | 5 | gazetaretina.com, jornaldabahia.net, jornaldebarcelos.com, jornalsaosimao.com, umjornal.com |
| `alexandra,dakota` | 4 | agoranoticias.net, edenoticias.com, noticiasdodia.net, tempusnoticias.com |
| `coco,kai` | 4 | mgnoticias.net, noticiasdojogo.com, riachonoticias.net, rsnoticias.net |
| `jule,ned` | 4 | jornaldiario.net, projetob.net, romanceseleituras.com, todossomosgeek.com |
| `olga,rob` | 4 | gazetaalerta.com, gazetadoconsumidor.com, tribunainformativa.com, tribunalpopular.org |
| `hank,jillian` | 3 | entrenoticia.com, nodiario.com, noticiasdasemana.com |
| `arya,mitch` | 2 | noticias9.com, r10noticias.com |
| `doug,sandy` | 2 | cirurgiadecancer.com.br, institutoortopedico.com.br |
| `aiden,raquel` | 1 | diariopernambucano.com.br |
| `alec,daphne` | 1 | saudevitalidade.com.br |
| `alec,dorthy` | 1 | opopularjornal.com.br |
| `alec,jacqueline` | 1 | revistatopsaude.com.br |
| `alex,ariadne` | 1 | saudicas.com.br |
| `alexandra,weston` | 1 | saudeemalta.net.br |
| `arushi,roan` | 1 | viajenodetalhe.com.br |
| `beau,lola` | 1 | planomedicosaude.com.br |
| `ben,chelsea` | 1 | divirto.com.br |
| `benedict,sloan` | 1 | folhadonoroeste.com.br |
| `blakely,hank` | 1 | revistadeducao.com.br |
| `clarissa,peter` | 1 | ortopedistadeombro.com.br |
| `coco,leonidas` | 1 | advivo.com.br |
| `coen,harlee` | 1 | universoneo.com.br |
| `colette,marty` | 1 | matogrossosaude.com.br |
| `dante,etta` | 1 | saudeacessivel.com.br |
| `daphne,everton` | 1 | incast.com.br |
| `desiree,justin` | 1 | saberdefato.com.br |
| `gwen,lex` | 1 | df8.com.br |
| `harlee,noah` | 1 | jornaldobairroalto.com.br |
| `harlee,thomas` | 1 | folhar.com.br |
| `igor,serena` | 1 | revistarumo.com.br |
| `julissa,rajeev` | 1 | ebookcult.com.br |
| `kayleigh,lex` | 1 | cameracotidiana.com.br |
| `kia,rustam` | 1 | curiosododia.com.br |
| `leland,malavika` | 1 | cirurgiadacatarata.com.br |
| `lloyd,sue` | 1 | medicodasmaos.com.br |
| `malcolm,ophelia` | 1 | medicinageriatrica.com.br |

## 3. Dois tokens inválidos

`conta11` e `conta25` retornam **Invalid access token**. Além delas, `conta12` e `conta14` respondem com sucesso mas **zero zonas** (conta vazia ou token sem escopo). Vale conferir as quatro no mesmo trabalho.

## 4. Prioridade para o piloto

Os 15 do piloto saem preferencialmente dos **41 já cobertos**, para a skip rule não travar a rampa. Se algum portal essencial estiver na lista acima, o caminho mais curto é o grupo do item 1: são 3 tokens a regerar, não 3 contas a procurar.
