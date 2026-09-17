# Ingestão e Curadoria Durável

Padrões validados em `casasderecuperacao` (Next.js + Drizzle + Postgres, `scripts/ingest/`).

## Pipeline

- `00-prepare.mjs` — cria tabelas de staging (`stg_estab`, `municipios_ref`, `rf_municipios`), semeia estados, carrega municípios IBGE + Receita.
- `10-<fonte>.mjs`, `20-<fonte>.mjs` — leem os arquivos brutos (zip/CSV) por streaming e populam o staging. Guardar o dataset em `/root/<projeto>-data`.
- `30-merge.mjs` — resolve cidade (IBGE por código ou nome+UF), deduplica, aplica filtro de tema, grava `clinics`, reaplica curadoria.

**O merge faz `TRUNCATE clinics RESTART IDENTITY CASCADE` e reconstrói tudo.** Por isso qualquer curadoria manual precisa de blocklist/overrides (abaixo). Rodar sempre em diff antes de aplicar; registrar versão/data do dataset.

## Carga longa numa máquina compartilhada

Uma carga de base pública leva horas e roda ao lado de outros sites. As cinco
regras abaixo saíram de erros cometidos: cada uma custou tempo real.

**1. A trava de disco vai DEPOIS do download, não antes.** Medir espaço livre
antes de baixar não serve: aprova a partida e o disco enche no meio. Uma camada
de 4,5 GB comprimidos precisa de outro tanto para extrair; o Postgres passou a
devolver `ENOSPC`, o Next parou de gravar cache de ISR e o sitemap começou a
responder 504. Meça quando o tamanho já é conhecido:

```bash
ZIP_MB=$(du -m "$Z" | cut -f1)
LIVRE_MB=$(df -BM --output=avail / | tail -1 | tr -dc '0-9')
if [ $((ZIP_MB * 3)) -gt "$LIVRE_MB" ]; then
  echo "  PULANDO $UF: ${ZIP_MB} MB e so ha ${LIVRE_MB} MB livres"
  rm -f "$Z"; exit 2      # 2 = nao insista
fi
```

**2. Código de saída próprio para "não cabe".** Se o laço de retry não souber
distinguir "não cabe" de "captcha errado", ele rebaixa os mesmos gigabytes cento
e vinte vezes. `exit 1` = tente de novo; `exit 2` = pule este item.

**3. Caminho absoluto, resolvido no arranque.** Um deploy troca o diretório da
release por baixo do processo em execução, e o `cwd` antigo vira inode
desvinculado: o script perde o irmão de pasta na metade e passa a acusar erro de
captcha quando o erro é outro. `AQUI=$(cd "$(dirname "$0")" && pwd -P)` no topo,
e chame tudo por `$AQUI/...`. O sintoma é `getcwd: cannot access parent
directories` no log.

**4. `flock` em toda carga e em todo cron.** Sem ele é fácil lançar a mesma
ingestão três vezes (foi o que aconteceu) e ver a carga da máquina ir a 20.
`flock -n` para não empilhar; `flock` bloqueante quando você QUER esperar a
carga terminar para rodar outra coisa.

**5. Não rode as verificações junto com a carga.** O rastreador de links e o
verificador de texto disputam a mesma máquina, o site fica lento e o rastreador
reporta como quebrado o que só estava devagar. Encadeie com `flock` bloqueante
no mesmo cadeado da ingestão.

### Depois da carga: a tabela fica metade vazia

Nao e opcional e nao e cosmetico. Cada `UPDATE` cria uma versao nova da linha; o
Postgres reaproveita o espaco liberado mas **nunca o devolve ao disco**. Depois
de uma campanha de carga, medido com `pgstattuple_approx`: arquivo de 9,99 GB,
dado util de 4,87 GB, **50% preso**. O site era o maior consumidor da maquina
(17 GB contra 6,3 do segundo colocado) e metade disso era ar.

```sql
CREATE EXTENSION IF NOT EXISTS pgstattuple;   -- precisa de superusuario
SELECT * FROM pgstattuple_approx('fichas');   -- veja approx_free_percent
```

Reconstrua com **`pg_repack`**, nunca com `VACUUM FULL`: o `VACUUM FULL` toma
lock exclusivo e derruba o site pelos minutos da operacao; o `pg_repack` copia
em paralelo, captura mudancas por gatilho e so trava em instantes.

```bash
apt-get install -y postgresql-16-repack
sudo -u postgres psql -d BASE -c 'CREATE EXTENSION IF NOT EXISTS pg_repack'
sudo -u postgres pg_repack -d BASE -t public.fichas --no-kill-backend --wait-timeout=300
```

8,5 milhoes de linhas levaram 4 minutos, com o site respondendo 200 o tempo
todo. Os indices tambem incham: cairam de 3.832 para 1.235 MB na mesma
operacao. Precisa de espaco livre igual ao tamanho FINAL (nao ao atual).

**Isso volta a cada campanha.** O repack e passo final de ingestao grande, nao
conserto unico. E confira a integridade depois (contagens antes x depois), que e
o minimo depois de reconstruir uma tabela.

**Indice que so a ingestao usa nao deve viver o ano inteiro.** Um GIST de
geometria custava 1,08 GB e nenhuma consulta do site o usava: procure
`ST_Intersects`/`ST_DWithin` no codigo de runtime antes de assumir. Se so a
ingestao usa, ela cria (`CREATE INDEX CONCURRENTLY`) e derruba no fim.

**Teto de tempo por consulta:** se voce puser `statement_timeout` no papel do
banco para proteger o site (e deve), a ingestao precisa de isencao. Para `psql`
e `ogr2ogr`, `PGOPTIONS='-c statement_timeout=0'`. **O Prisma nao le PGOPTIONS**
(driver proprio): a isencao vai na URL de conexao do cliente da ingestao.

### Fonte com captcha

Quando a fonte pública tem captcha próprio (SICAR, por exemplo), o caminho é OCR
em laço, não filtro perfeito. **Não gaste a noite afinando o pré-processamento
sem gabarito**: baixe seis captchas, leia você mesmo (você enxerga imagem) e
teste as variantes contra essa resposta. Num caso real, dezesseis combinações de
escala, limiar, margem de cor e fechamento morfológico **não acertaram um
sequer** — a leitura mais próxima saiu `R5KIS` para `R5kJ5`.

Como cada tentativa é independente, insistir resolve o que o filtro não resolve:
120 tentativas por item transformam 2% de acerto em 91% de chance. Uma
requisição por vez, com 4 segundos de intervalo, que é mais devagar do que uma
pessoa clicando depressa. Cada rodada deve tentar **só o que ainda falta**, para
não rebaixar o que já entrou.

Armadilha do PNG: captcha com canal alfa e texto preto some se você compor sobre
preto. Componha sobre branco antes de qualquer filtro, senão você fica olhando
para uma imagem onde só o risco aparece e conclui a coisa errada.

## Filtro de tema (no 30-merge, antes de montar as fichas)

Guardar TUDO por um `NICHE_RE` que protege o que é do nicho. Exemplo (saúde/recuperação):

```js
const nrm = (s) => (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");

// termo de nicho: protege CAPS, saúde mental, comunidade terapêutica, dependência
const NICHE_RE = /(recupera|reabilit|dependent|quimic|toxico|alcool|droga|caps ad|psicossocial|comunidade terap|fazenda|recanto|renascer|acolhi|restaura|libertar|redenc|amor exigente|resgate|refugio|casa de apoio|terap|missao|projeto vida|reviver|sober|\bcaps\b|saude mental|desafio jovem|obra social|antidrog)/;
const RECOVERY_RE = NICHE_RE; // no merge o guard das camadas 1-2 usa a versão sem "saude mental"

// camada 1: nome claramente fora do tema
const OFFTOPIC_RE = /(\bapae\b|pestalozzi|escola especial|educacao especial|deficient|excepcionais|\bubs\b|ubsf|\bps[fb]\b|\besf\b|posto de saude|unidade basica|unidade de saude|centro de saude|\bupa\b|\bama\b|\bsamu\b|estrategia saude|pronto atend|pronto socorro|policlinic|hospital|maternidade|santa casa|hemocentro|banco de sangue|oncolog|universidade|faculdade|colegio|\bescola\b|creche|ensino fund|instituto federal|ensino e pesquisa|inteligencia artificial|sindicat|cooperativ|unimed|\bsest\b|\bsenat\b|\bsesi\b|\bsesc\b|prefeitura|camara municipal|secretaria|servico social do|federacao|estetic|pilates|salao|barbearia|odontolog|farmacia|drogaria|laboratorio|optica|academia|\bhotel\b|pousada|comercio|industria|supermercad|restaurante|\bbar\b|imobiliar|construtor|advocacia|contabil|petshop|veterinar|clube|banda|teatro|maconic|rotary|lions)/;

// camada 2: CNAE que MANTEMOS (só saúde/assistência + associação genérica); resto = fora
const KEEP_CNAE_RE = /^(86|87|88|9430|9491|9499)/;

// camada 3: nome não-recuperação, protegendo CNAE de comunidade terapêutica
const NONREC_NAME_RE = /(cultural|\barte\b|esportiv|desportiv|\besporte\b|futebol|moradores|comunitaria|\bbairro\b|animais|protecao animal|ambient|ecolog|\brural\b|agricol|pecuar|pescador|folclor|carnaval|\bsamba\b|\bdanca\b|\bbanda\b|filarmonic|motoclube|comerciant|empresarial|lojistas|servidores publicos|aposentados|terceira idade|\bidosos\b|diabetic|\brenal\b|ostomiz|autist|sindrome de down|\bcancer\b|\bcego|surdo|mulheres|feminin|indigen|quilombol|\blgbt|umbanda|candombl|espirita|terreiro|filatel|\btiro\b)/;

// camada 4 (zona cinza): saúde pública, clínica médica geral, psicologia geral
const PUBLIC_HEALTH_RE = /(unidade (municipal |mista |basica |sanitaria |de )?(de )?saude|saude da familia|\besf\b|\bcsf\b|estrategia (de )?saude|centro (municipal |de )?(de )?saude|posto de saude|policlinic|\bcras\b|\bcreas\b|\bupa\b|\bama\b|pronto atend|centro medico|equipe multidisciplinar|\bnasf\b|secretaria (municipal )?de saude|\bcmo\b|centro de referencia)/;
const MEDICAL_GENERAL_RE = /(odontolog|\bodonto\b|oftalmolog|\bdermatolog|cardiolog|cardioclin|ortoped|ginecolog|\bpediatr|fisioterap|nutricion|fonoaudiolog|\blaboratorio\b|radiolog|exames|\bestetic|medicina do trabalho|medicina especializada|assistencia medica|clinica medica|ocupacional|oncolog|nefrolog|urolog|geriatri|hemodialise|clinica de olhos|\bninar\b|medical cent|centro integrado de saude|\bimagem\b|ultrassom|tomografia)/;
const PSYCH_GENERAL_RE = /(psicolog|psicanal|neuropsico|psicoped|psicoterap)/;
```

No loop do merge (após resolver blocklist), pular:

```js
const nmt = nrm(row.name || "");
if (nmt && !RECOVERY_RE.test(nmt)) {
  if (OFFTOPIC_RE.test(nmt)) { offtopic++; continue; }
  const cnaeN = (row.cnae||"").replace(/\D/g,"");
  const badCnae = cnaeN && !KEEP_CNAE_RE.test(cnaeN);
  const treatC = /^(8720|8730|8800|8711|8712)/.test(cnaeN); // comunidade terapêutica: protege do filtro por nome
  if (badCnae || (NONREC_NAME_RE.test(nmt) && !treatC)) { offtopic++; continue; }
}
if (nmt && !NICHE_RE.test(nmt) && (PUBLIC_HEALTH_RE.test(nmt) || MEDICAL_GENERAL_RE.test(nmt) || PSYCH_GENERAL_RE.test(nmt))) { offtopic++; continue; }
```

**Adaptar as regex ao nicho do diretório.** O princípio é o mesmo em qualquer diretório: uma lista do que é do tema (guard) e listas do que é ruído, sempre com dry-run antes.

## Dedup

O merge já dedup por chave `cnpj` (prioridade) ou `cnes` ou `nome+cidade`. Após montar as fichas, um **dedup final por cidade+nome+telefone** colapsa matriz/filial e o mesmo lugar registrado em vários CNES:

```js
const seenNP = new Set(); const dedup = [];
for (const c of clinicRows) {
  const ph = (c.phone||"").replace(/\D/g,"");
  if (ph.length>=8) { const k=`${c.city_id}|${normalize(c.name)}|${ph}`; if (seenNP.has(k)) continue; seenNP.add(k); }
  dedup.push(c);
}
// inserir `dedup` no lugar de clinicRows
```
Duplicata real = mesmo nome+cidade **e mesmo telefone**. Mesmo nome+cidade com CNPJ/telefone diferentes NÃO é dup (clínicas distintas de nome genérico) — não fundir.

## Curadoria durável (tabelas que o merge respeita)

```sql
CREATE TABLE IF NOT EXISTS clinic_blocklist (
  id serial PRIMARY KEY, cnpj varchar(14), cnes varchar(20), name text, reason text, created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS clinic_overrides (
  cnpj varchar(14) PRIMARY KEY, website text, description text, full_description text,
  phone text, whatsapp text, email text, address text, neighborhood text, cep text, updated_at timestamptz DEFAULT now());
```

No início do merge, carregar a blocklist e pular no loop:
```js
const bl = await sql`SELECT cnpj, cnes FROM clinic_blocklist`;
const blCnpj = new Set(bl.map(r=>(r.cnpj||"").replace(/\D/g,"")).filter(Boolean));
const blCnes = new Set(bl.map(r=>String(r.cnes||"").trim()).filter(Boolean));
// no loop:
const cnpjN = (row.cnpj||"").replace(/\D/g,"");
if ((cnpjN && blCnpj.has(cnpjN)) || (row.cnes && blCnes.has(String(row.cnes).trim()))) { blocked++; continue; }
```

Após o insert das fichas, reaplicar overrides por CNPJ:
```js
for (const o of await sql`SELECT * FROM clinic_overrides`) {
  await sql`UPDATE clinics SET
    website=coalesce(${o.website},website), description=coalesce(${o.description},description),
    full_description=coalesce(${o.full_description},full_description), phone=coalesce(${o.phone},phone),
    whatsapp=coalesce(${o.whatsapp},whatsapp), email=coalesce(${o.email},email),
    address=coalesce(${o.address},address), neighborhood=coalesce(${o.neighborhood},neighborhood), cep=coalesce(${o.cep},cep)
    WHERE regexp_replace(coalesce(cnpj,''),'[^0-9]','','g') = ${o.cnpj}`;
}
```

**GOTCHA description vs full_description:** a página de ficha renderiza a descrição como **texto puro** (React escapa). Não colocar HTML (`<p>`, `<strong>`) no `description`/`full_description` da ficha, senão as tags aparecem literais. Só o **blog** renderiza HTML (via dangerouslySetInnerHTML). Guardar isso nos overrides como texto puro.

## Remoção em lote de falsos positivos (sempre dry-run primeiro)

Padrão de script: recomputar o conjunto por heurística, imprimir contagem + amostra, e só com `--delete` remover + blocklist + desativar cidades vazias.

- **Médicos/off-topic** (por nome/CNAE, guardado por NICHE): ver regex acima.
- **Pessoa física (profissional individual):** heurística conservadora com FALSOS POSITIVOS residuais (~7%), então **apresentar CSV e confirmar antes**:
```js
const INST = /(clinica|comunidade|instituto|\bcentro\b|\bcasa\b|associacao|fundacao|fazenda|hospital|unidade|servico|nucleo|espaco|\brede\b|grupo|\blar\b|\bltda\b|\bme\b|eireli|saude|\bmed\b|consultorio|odonto|psico|nutri|fisio|espirita|igreja|projeto|sociedade|posto|caps|\bubs\b|apae|escola|cooperativa|ambulatori|equipe|penitenciari|\bcer\b|\bcta\b|\bsae\b|\baba\b|\bcras\b|especialidad|referencia|municipal|km\b|rodovia|\bii\b|\biii\b|reabilit|terap|recupera|dependent|residencial)/;
const CONNECTOR = /\b(da|de|do|dos|das)\b/;
// candidato = source cnes + type outro + 3-6 palavras + CONNECTOR + !INST + sem dígito
```
Ao remover em lote: **blocklist por CNES/CNPJ** (preciso, não usar regex fuzzy no merge para pessoa física), deletar em batches, `UPDATE cities SET active=false WHERE clinics_count=0`, rebuild, purge.

Pessoa física é dado pessoal (LGPD): pedido do próprio titular = remover sempre.
