# Como conferir domínios pela API da Moz (QMIX)

Guia de uso da conta Moz API da QMIX para medir DA, spam score e domínios que linkam. Vale para
conferir um domínio solto, uma lista (CSV) ou a fila de domínios do Registro.br que o site
qmix.com.br importa em "Análise de Domínios". Atualizado em 09/10/2026.

## 1. O que existe e onde

| Item | Onde |
|---|---|
| Conta Moz | id 18000665, plano Growth Medium: **120.000 linhas por mês**, reset mensal (dia 31), overage ligado (US$ 20 a cada 10.000 linhas extras) |
| Credenciais | **só na VPS**, em `/var/www/qmix-next/.env`: `MOZ_ACCESS_ID`, `MOZ_SECRET_KEY`, `MOZ_API_TOKEN`, `MOZ_DATA_TOKEN`. Não há cópia em `C:\Users\User\Documents\APIs\` |
| Scripts prontos | `D:\SITES\qmix-next\qmix-next\scripts\` (cópia local) e `/var/www/qmix-next/scripts/` (onde rodam): `verificar-moz.mjs`, `coletar-linking.mjs`, `atualizar-da-produtos-moz.mjs`, `moz-update-all.mjs`, `spam-dominio.mjs`, `importar-registrobr.mjs` |
| Código da plataforma | `src/lib/moz-autoridade.ts` (Links API v2, usado por Análise de Domínios) e `src/lib/moz.ts` |
| Acesso à VPS | `ssh hostinger-vps-srv1166087` (no Claude Code, com o sandbox de rede desligado) |

O token é o mesmo para as duas APIs: `base64("ACCESS_ID:SECRET_KEY")`.

| API | Endpoint | Cabeçalho | Para quê |
|---|---|---|---|
| Data API v3 | `POST https://api.moz.com/jsonrpc` (JSON-RPC 2.0) | `x-moz-token: <token>` | cota, métricas de site em lote (50 por chamada) |
| Links API v2 | `POST https://lsapi.seomoz.com/v2/<método>` | `Authorization: Basic <token>` | `url_metrics` (DA/PA/spam) e `linking_root_domains` (quem linka) |

## 2. Regra de ouro: cota antes de tudo

Cada domínio consultado gasta **1 linha**; cada domínio de origem devolvido em `linking_root_domains`
gasta **1 linha**. A cota do mês só se vê pela Data API (`quota.lookup`, não gasta linha). O
`usage_data` da v2 mostra o acumulado da vida da conta, não serve.

```bash
ssh hostinger-vps-srv1166087 'cd /var/www/qmix-next && export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && set -a && . ./.env && set +a && node scripts/verificar-moz.mjs --cota'
```

Saída: `allotted` (120000), `used` (gasto no mês), `period_reset` (timestamp do reset). O `used`
atualiza uma vez por dia, então ao rodar lotes grandes some você mesmo o que já pediu.

**Regra do Anderson (14/09/2026): lote grande (milhares de domínios) só com autorização dele.**
A fila do Registro.br costuma ter mais domínios do que a cota do mês.

## 3. Conferir um domínio ou uma lista pequena

O jeito mais simples é pela VPS, com o script e a flag `--dominios`:

```bash
ssh hostinger-vps-srv1166087 'cd /var/www/qmix-next && export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && set -a && . ./.env && set +a && node scripts/verificar-moz.mjs --dominios exemplo.com.br,outro.com.br'
```

Para chamar a API na mão (um lote de até 50 domínios, Data API v3):

```bash
# na VPS, dentro de /var/www/qmix-next, com o .env carregado
curl -s https://api.moz.com/jsonrpc \
  -H "x-moz-token: $MOZ_DATA_TOKEN" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"a1b2c3d4e5f6a1b2c3d4e5f6x","method":"data.site.metrics.fetch.multiple","params":{"data":{"site_queries":[{"query":"exemplo.com.br","scope":"domain"},{"query":"outro.com.br","scope":"domain"}]}}}'
```

O `id` do JSON-RPC precisa ter 24 caracteres ou mais, senão a API recusa. A resposta traz, por site,
`domain_authority`, `page_authority`, `spam_score` e contagens de links e domínios de origem.

Pela Links API v2 (o que a tela Análise de Domínios usa):

```bash
curl -s https://lsapi.seomoz.com/v2/url_metrics \
  -H "Authorization: Basic $MOZ_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"targets":["exemplo.com.br","outro.com.br"]}'
```

Campos úteis: `domain_authority`, `page_authority`, `spam_score`, `root_domains_to_root_domain`
(domínios que linkam), `external_pages_to_root_domain`.

## 4. Fila do Registro.br (Análise de Domínios do site)

1. **Importar o lote do mês:** `node scripts/importar-registrobr.mjs` (lê a lista do Registro.br e grava em
   `dominios_rb` com status `novo`). Na entrada ele já descarta sufixos de autoridade falsa e categorias
   restritas (ver seção 6).
2. **Ver a cota** (seção 2) e pedir autorização se o lote passar de alguns milhares.
3. **Medir DA em lote:**

```bash
node scripts/verificar-moz.mjs --total 2000 --periodo 10/2026            # 2.000 domínios 'novo' do mês, em lotes de 50
node scripts/verificar-moz.mjs --total 2000 --periodo 10/2026 --ordem rand
node scripts/verificar-moz.mjs --total 500 --lote 25 --pausa 2000       # lotes menores com pausa (se a API reclamar)
```

   Ritmo medido: cerca de 2.000 domínios por minuto. Rodar com `nohup ... > /tmp/verificar-moz-MMYYYY.log &`
   quando for grande, para a sessão SSH não derrubar o processo.
4. **Quem linka para os bons (gov/edu):** só para os já indexados e com DA relevante, porque cada
   domínio de origem devolvido gasta 1 linha:

```bash
node scripts/coletar-linking.mjs --indexados --periodo 10/2026 --limite 20 --reserva 800
```

   Grava em `dominios_rb_linking` e marca `gov_links` no domínio; a coluna Gov/Edu aparece nas abas do site.
   `--reserva` para de consumir quando a cota restante chega nesse número.
5. **Atualizar o DA dos portais do marketplace:** `node scripts/atualizar-da-produtos-moz.mjs` (1 linha por portal
   ativo; conferir a cota antes).

## 5. Como ler os números

- **DA (Domain Authority)**, 0 a 100, comparativo: serve para ordenar candidatos, não é "nota" absoluta.
  Domínio novo sem links fica em 1. Acima de 30 em domínio expirado quase sempre vem de histórico de links,
  e aí vale olhar o spam score e quem linka.
- **Spam score**, 0 a 100 (%): acima de 30 pede cuidado; acima de 60, descartar.
- **Linking root domains**: quantidade e qualidade dos domínios que apontam. Dois links de .gov.br valem mais
  que cem de diretórios.
- Sempre conferir no navegador se o domínio tem conteúdo no ar e no Google (`site:dominio`) antes de decidir.

## 6. Armadilhas conhecidas

- **Sufixos com DA falso:** a Moz não reconhece vários segundos níveis do .br como sufixo público e dá a todos
  os domínios o DA do sufixo: app.br 79, dev.br 75, tec.br 57, ong.br 52, ia.br 48, seg.br 44, log.br 41,
  api.br 33, social.br 32, des.br, xyz.br e cidades (curitiba.br, riopreto.br, manaus.br, maringa.br,
  campinagrande.br, bib.br). Lista em `scripts/spam-dominio.mjs` (`TLDS_FALSA_AUTORIDADE`). Um DA 79 em
  `qualquercoisa.app.br` não é do domínio.
- **Categorias restritas do Registro.br** (org.br só para entidade sem fins lucrativos; adv, med, eng, arq, jor,
  psc, vet, odo, bio, ntr, not; coop, g12, gov, mil, psi, am, fm): não dá para registrar livremente, então nem
  conferir. `TLDS_RESTRITOS` no mesmo script. eco.br e far.br são livres.
- **Cota:** `used` do `quota.lookup` atualiza só uma vez por dia. Em lote, controle pelo seu próprio contador.
- **Trocar credencial:** editar o `.env` da VPS e rodar `pm2 reload qmix-next --update-env`, senão o site segue
  com o token antigo.
- **Chave local:** se quiser rodar daqui sem a VPS, copie `MOZ_ACCESS_ID` e `MOZ_SECRET_KEY` do `.env` da VPS para
  `C:\Users\User\Documents\APIs\moz.txt` no formato `ACCESS_ID:SECRET_KEY` e gere o token com
  `base64` (PowerShell: `[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content moz.txt).Trim()))`).

## 7. Prompt pronto para o Claude Code

Cole isto numa sessão do Claude Code (pasta `D:\SITES\qmix-next`), trocando o que estiver entre colchetes:

```
Conferir domínios na API da Moz. Leia primeiro D:\SISTEMAS\DOMINIOS ANALISE\COMO-CONFERIR-DOMINIOS-NA-MOZ.md.
Domínios: [lista separada por vírgula, ou caminho do CSV com uma coluna "dominio"].
1. Veja a cota do mês com `verificar-moz.mjs --cota` na VPS (hostinger-vps-srv1166087) e me diga quantas linhas
   a consulta vai gastar antes de gastar. Se passar de [500] linhas, pare e espere minha autorização.
2. Descarte antes os sufixos de autoridade falsa e as categorias restritas (TLDS_FALSA_AUTORIDADE e
   TLDS_RESTRITOS em scripts/spam-dominio.mjs).
3. Consulte DA, PA e spam score em lotes de 50 (Data API v3 ou `verificar-moz.mjs --dominios`).
4. Para os que tiverem DA acima de [20] e spam abaixo de [30], busque os domínios que linkam
   (`coletar-linking.mjs --dominios ... --limite 20`) e marque os .gov.br/.edu.br.
5. Entregue uma tabela: domínio | DA | PA | spam | domínios que linkam | gov/edu | observação, ordenada por DA,
   e salve o CSV em D:\SISTEMAS\DOMINIOS ANALISE\resultados\[nome]-[data].csv.
Não envie nada para indexação e não altere o banco do site.
```

## 8. Lista solta (fora da base do site): script independente

Para uma lista avulsa de domínios (que não está em `dominios_rb`), usar o script
`D:\SISTEMAS\DOMINIOS ANALISE\scripts\analisar-lista-moz.mjs`. Ele não toca no banco: lê o `.env` da VPS,
grava um JSON e pode ser retomado (pula o que já tem).

```bash
scp scripts/analisar-lista-moz.mjs resultados/lista.txt hostinger-vps-srv1166087:/tmp/
ssh hostinger-vps-srv1166087 'cd /var/www/qmix-next && export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH && \
  node /tmp/analisar-lista-moz.mjs --lista /tmp/lista.txt --saida /tmp/resultado.json --so-metricas'   # fase 1: 1 linha por domínio
ssh hostinger-vps-srv1166087 '... node /tmp/analisar-lista-moz.mjs --lista /tmp/lista.txt --saida /tmp/resultado.json --min-da 0 --max-ss 100 --limite 20'  # fase 2: até 20 fontes por domínio
scp hostinger-vps-srv1166087:/tmp/resultado.json resultados/
python -I scripts/ranquear.py 40   # ranking + CSV (roda dentro de resultados/, lê resultado-200.json)
```

Custo medido em 09/10/2026: 200 domínios = 200 linhas (fase 1) + 3.711 linhas (fase 2 com 20 fontes).
O `ranquear.py` pesa link gov/edu BR (40 pontos cada, inclui universidades federais em `.br` direto, como ufsm.br
e embrapa.br), gov estrangeiro (10), fonte editorial DA 60+ (8) e DA 45 a 59 (3), descontando spam acima de 30 e
fontes lixo. Fonte lixo = diretórios, encurtadores, hospedagens, e qualquer origem que aponte para 3 ou mais
domínios da mesma lista (padrão de PBN/diretório). Resultado em `resultados/ranking-200-dominios-2026-10-09.csv`.
