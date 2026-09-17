# Destinos: onde o conteúdo é publicado

Levantamento de 17/08/2026. Três famílias de destino, com fontes de verdade
diferentes para endpoint e chave.

---

## 1. Fonte de verdade de cada família

| Família | Onde estão endpoint e chave |
|---|---|
| WordPress | Tabela `wp_sites` da plataforma (chave **cifrada**, decifrar com `<<REMOVIDO>>`). Cópia em texto: `destinos-wordpress-antonio.csv`, nesta pasta |
| portal-engine | `/opt/portal-engine/sites.json` no servidor do portal (chave em texto) |
| Next (diretórios) | Variável `QMIX_API_KEY` no `.env` de cada app + rota própria |

⚠️ A chave que o app usa tem que ser igual ao que `decryptApiKey()` devolve, e
não ao texto cifrado guardado no banco. Confusão entre os dois já causou 401 em
produção.

---

## 2. WordPress — 111 destinos

Arquivo completo nesta pasta: **`destinos-wordpress-antonio.csv`**, com as
colunas `domain, siteurl, new_namespace, endpoint_url, api_key, loader_file`.

Padrão do endpoint: `https://<domínio>/wp-json/<ns>/v1/artigos`, com namespace
único por site (`qzms-api`, `arfa-api`, `emfc-api`, `dd4c-api`…). O namespace
aleatório é proposital: evita pegada de rede detectável entre os sites.

Exemplos:

```
clickinfohub.com     https://clickinfohub.com/wp-json/qzms-api/v1/artigos
folhaum.com          https://www.folhaum.com/wp-json/arfa-api/v1/artigos
sabedoriaglobal.com.br  https://sabedoriaglobal.com.br/wp-json/emfc-api/v1/artigos
curiosododia.com.br  https://curiosododia.com.br/wp-json/dd4c-api/v1/artigos
```

O receptor é o mu-plugin `qmix-receiver.php`, instalado em
`wp-content/mu-plugins/`. Template de referência:
`D:\SISTEMAS\MinhasHospedagens\antonio-recovery\qmix-receiver-template.php`.

---

## 3. portal-engine — 54 portais em 3 servidores

Sites estáticos servidos por Node, sem PHP e sem banco.

### clinicas-vps · `31.97.162.199` · `ssh clinicas-vps` · 34 portais
agencianacionaldenoticias.com, agoranoticias.net, barranews.com.br,
boxnoticias.net, clickinfohub.com, dataroomus.com, editaldeconcurso.net,
gpnoticias.com, jornalacapital.com, jornalconceito.com, jornalimigrantes.com,
jornalistanofato.com, manacultura.com, maragoginoticias.com, mgnoticias.net,
nodiario.com, noticias9.com, noticiasagoras.com, noticiasdasemana.com,
noticiasdiarios.com, noticiasdodia.net, noticiasdojogo.com, noticiasubuntu.com,
ocontraditorio.com, olharmoderno.com, portalr5.com, professortic.com,
r10noticias.com, riachonoticias.net, rsnoticias.net, rumourisnews.com,
semtedio.com, tempusnoticias.com, topsulnoticias.com

### srv1166087 · `31.97.173.40` · `ssh hostinger-vps-srv1166087` · 13 portais
diariodatv.com, diariodegoiania.com, diariodobrejo.com, edenoticias.com,
entrenoticia.com, folhaum.com, gdsnoticias.com, jornaldiario.net,
medicodasmaos.com.br, projetob.net, romanceseleituras.com, todossomosgeek.com,
teste.local (portal de teste)

### opengravity · `77.37.69.175` · `ssh opengravity` · 7 portais
girodasnoticias.com, jornaldebarcelos.com, nerddahora.com, noticiasgoias.com,
osertaoenoticia.com, portalnoticiasbh.com, wtw19.com.br

Para extrair endpoint e chave de todos de um servidor:

```bash
ssh <servidor> 'python3 -c "
import json
c=json.load(open(\"/opt/portal-engine/sites.json\"))
for s in (c[\"sites\"] if isinstance(c,dict) else c):
    print(s[\"slug\"], s[\"domain\"], s[\"ns\"], s[\"apikey\"], sep=\"|\")
"'
```

Diferença de versão entre servidores: o motor da clinicas-vps é o mais novo e
emite `FAQPage` no schema; os de srv1166087 e opengravity são anteriores e
emitem apenas `NewsArticle` e `BreadcrumbList`. Não é defeito de conteúdo.

---

## 4. Next (diretórios)

Aplicações de diretório, uma rota por app, imagem baixada por URL.
Exemplo conhecido: **setorenergetico.com.br** → `POST /api/qmix/noticias`
(PM2 id 22, `/var/www/setorenergetico`, porta 3015, no opengravity).

Outros diretórios da mesma família: cirurgiacoracao, cirurgiadacatarata,
cirurgiadecancer, medicinageriatrica, desentupidora.pro, geladeirastop,
arcondicionadotop, bitcao, masterjuris, encontreleiloes.

⚠️ Esses diretórios **ficam fora das operações de backlink e de varredura de
link da rede**, por decisão do operador. Eles recebem conteúdo, não links.

⚠️ Os 6 diretórios Next **não receberam** o suporte a `subtitle` e
`meta_description` que as 89 instalações WordPress e o portal-engine ganharam em
14/08/2026, porque exigiria migração de schema.

---

## 5. Como conferir a saúde de todos de uma vez

Script pronto, usado em 17/08/2026 para varrer os 54 portais do engine:

```bash
python3 - <<'PY'
import json, subprocess
cfg = json.load(open("/opt/portal-engine/sites.json"))
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126 Safari/537.36"
for s in (cfg["sites"] if isinstance(cfg, dict) else cfg):
    url = f"https://{s['domain']}/{s['ns']}/artigos"
    out = subprocess.run(["curl","-s","-m","25","-o","/dev/null","-w","%{http_code}",
        "-X","POST",url,"-H","Content-Type: application/json",
        "-H",f"x-api-key: {s['apikey']}","-A",UA,"-d","{}"],
        capture_output=True, text=True).stdout
    print(f"{s['slug']:26} {out}  {'OK' if out=='400' else 'VERIFICAR'}")
PY
```

Resultado esperado: **400 em todos**. Qualquer outro código está explicado na
tabela do fim de `ENVIO-DE-CONTEUDO.md`.
