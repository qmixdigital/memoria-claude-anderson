# CONVERSAO-WORDPRESS.md — Converter um site WordPress para este motor

> Guia para migrar um portal **WordPress** (da rede do próprio dono) para o **portal-engine**
> (HTML estático). É uma migração **1:1 do mesmo conteúdo do mesmo dono** trocando de plataforma —
> **não** é "copiar site de terceiro" (isso seria conteúdo duplicado e penalizado).
> Pré-leitura: [ACESSO.md](./ACESSO.md) (infra) e [CLAUDE.md](./CLAUDE.md) (runbook).

## O que "converter" significa nesta rede

O site WP de hoje recebe conteúdo do **Sistema Antônio** e serve via WordPress. Converter = trocar a
camada de publicação por este motor, **sem perder conteúdo nem URLs**:

1. **Provisionar** o portal no motor (gera endpoint + X-API-KEY + identidade anti-fingerprint).
2. **Migrar o histórico** de posts do WP para o motor (script `import-wp.js`, preservando datas e imagens).
3. **Repontar o Antônio** para o endpoint do portal novo (conteúdo novo passa a fluir pro motor).
4. **Preservar URLs** com 301 (regra absoluta da rede: URL indexada nunca se perde).
5. **Cutover de DNS** no Cloudflare (domínio passa a apontar pra `31.97.173.40`).
6. **Descomissionar** o WordPress.

> ⚠️ **Estrutura de URL muda.** O motor usa `/<categoria>/<slug>/`. Muitos WP usam `/%postname%/`
> (sem categoria). Por isso o passo 4 (301) é **obrigatório** — o `import-wp.js` já gera o mapa pronto.

---

## Pré-requisitos

- Acesso de **leitura à WP REST API** do site origem: abra `https://SITE/wp-json/wp/v2/posts?per_page=1`
  no navegador. Se voltar JSON, está ok. Se 401/404, a REST está bloqueada — habilite ou exporte por outro meio.
- Acesso à **infra** (SSH na VPS) — ver ACESSO.md.
- Acesso ao **Cloudflare** do domínio (ou o dono faz o DNS).
- Node 18+ na máquina local (para rodar o `import-wp.js`).

---

## Passo a passo

### 1. Inventariar o WP origem
```bash
# quantos posts, quantas páginas
curl -s "https://SITE/wp-json/wp/v2/posts?per_page=1" -D - -o /dev/null | grep -i x-wp-total
# categorias existentes (para o mapeamento)
curl -s "https://SITE/wp-json/wp/v2/categories?per_page=100" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>JSON.parse(s).forEach(c=>console.log(c.id,c.slug,c.name)))'
```
Anote a estrutura de permalink atual (ex.: `https://SITE/titulo-do-post/`).

### 2. Provisionar o portal novo
Use o mesmo domínio do site (ele será reaproveitado no cutover). Veja CLAUDE.md → "Criar um portal novo".
```bash
ssh hostinger-vps-srv1166087 "bash /opt/portal-engine/newsite.sh <slug> <dominio> '<Nome do Portal>'"
```
Guarde o **Endpoint** e a **X-API-KEY** que o script imprime. O `newsite.sh` já roda o fingerprint roll
(arquétipo + paleta + fontes + classes + tokens divergentes dos vizinhos).

> Enquanto o DNS ainda aponta pro WP, teste o portal novo pela **origem** (Host header):
> `curl -sk --resolve <dominio>:443:31.97.173.40 https://<dominio>/`

### 3. Mapear categorias
O `import-wp.js` envia a **categoria pelo nome** (o motor aceita string direto). Se quiser renomear/uniformizar,
passe `--cat-map`. Ex.: o WP tem "Actualidade" e "Vida"; você quer "Notícias" e "Entretenimento":
```
--cat-map='{"Actualidade":"Notícias","Vida":"Entretenimento"}'
```
Categorias não mapeadas entram com o nome original do WP. Sem categoria → `defaultCategory` do portal.

### 4. Importar o conteúdo histórico
**Sempre teste antes** com `--dry-run --limit=3`:
```bash
node scripts/import-wp.js --source=https://SITE --dry-run --limit=3 \
  --cat-map='{"Actualidade":"Notícias"}'
```
Conferiu título/categoria/data/imagem? Importa tudo:
```bash
node scripts/import-wp.js \
  --source=https://SITE \
  --endpoint=https://<dominio>/<slug>-api/v1/artigos \
  --key=<X-API-KEY> \
  --cat-map='{"Actualidade":"Notícias"}' \
  --delay=400 \
  --redirects=redirects-<slug>.txt
```
- Preserva a **data original** de cada post (ordenação e SEO).
- Baixa a **imagem destacada** e manda pro motor (que converte pra WebP ≤1000px).
- É **idempotente** (dedupe por slug) — pode rodar de novo sem duplicar.
- Gera **`redirects-<slug>.txt`** com pares `URL_antiga<TAB>URL_nova` para o passo 5.
- Autoria: por padrão vira o nome do portal (convenção da rede). Use `--keep-authors` para manter os autores do WP.

### 5. Preservar URLs (301) — OBRIGATÓRIO
Pegue o `redirects-<slug>.txt` gerado e transforme em `map` do Nginx no vhost do portal.

```bash
# gerar o bloco de map a partir do arquivo de redirects
awk -F'\t' '{print "    \""$1"\" \""$2"\";"}' redirects-<slug>.txt > map-<slug>.txt
```
No vhost (`/etc/nginx/conf.d/portal-<slug>.conf`), **antes** do bloco `server`, adicione:
```nginx
map $request_uri $oldredir {
    default "";
    include /etc/nginx/conf.d/portal-<slug>.redirects.map;  # cole aqui o conteúdo de map-<slug>.txt
}
```
E dentro do `server { ... }`, no topo do `location /`:
```nginx
    if ($oldredir != "") { return 301 $oldredir; }
```
Depois: `ssh hostinger-vps-srv1166087 "nginx -t && systemctl reload nginx"` (nunca `restart`).

> Se o WP já usava `/<categoria>/<slug>/` igual ao motor e os slugs batem, o mapa sai vazio (nada a redirecionar).
> Na dúvida, **sempre** aplique o mapa — ele só age nas URLs que realmente mudaram.

### 6. Repontar o Antônio
No painel do Antônio (ver ACESSO.md), troque o **Endpoint URL** daquele site para o do portal novo
(`https://<dominio>/<slug>-api/v1/artigos`) e a **X-API-KEY** para a nova. A partir daí o conteúdo novo
publica no motor. (O endpoint WP antigo deixa de ser usado.)

> ⚠️ **CRÍTICO — `/etc/hosts` do servidor do Antônio (a armadilha que travou entrenoticia+diariodegoiania em 2026-06-17).**
> A plataforma do Antônio (`acesso.qmix.com.br`, app PHP em `/home/boot/web/acesso.qmix.com.br/public_html` no **mesmo srv1166087**) costuma ter, no **`/etc/hosts` do servidor**, uma entrada FIXA apontando o domínio para o **servidor WordPress ANTIGO** (ex.: `92.113.35.186 <dominio> www.<dominio>`). Isso foi criado quando o site era WP.
> **Se essa entrada não for removida, a transferência do Antônio resolve o domínio pro WP velho e dá `HTTP 404` ("para WordPress")** — mesmo com endpoint/chave corretos. De fora (Cloudflare) o site funciona, mas a plataforma local NÃO entrega. Sintoma no cron-log: `HTTP: 404 | para WordPress`, e **zero POST** no log do receptor do portal.
> **Faça:**
> ```bash
> ssh hostinger-vps-srv1166087
> cp /etc/hosts /etc/hosts.bak-$(date +%Y%m%d)
> grep <dominio> /etc/hosts          # ver se existe entrada pro IP do WP antigo (ex.: 92.113.35.186)
> # comentar/remover a linha do dominio migrado:
> sed -i -E 's/^([0-9.]+[[:space:]]+<dominio>.*)$/# MIGRADO portal-engine - \1/' /etc/hosts
> getent hosts <dominio>             # deve resolver via Cloudflare (IP 2606:4700... ou 104.x/172.x), NÃO o IP do WP
> ```
> **Validar:** `cd /home/boot/web/acesso.qmix.com.br/public_html && runuser -u boot -- php article-transfer.php ASC` deve dar **"Artigo enviado com sucesso"** (não 404).
> (Confirme também no `wp_sites`: `endpoint_url` = `https://<dominio>/<slug>-api/v1/artigos` e `api_key` ativa. O receptor é WP-compatível: autentica pela X-API-KEY e aceita qualquer path terminando em `/v1/artigos`.)

### 7. Cutover de DNS (Cloudflare)
- A `@` e `www` → `31.97.173.40`, **proxy laranja (on)**.
- SSL/TLS: **Full** (a origem já serve 443 self-signed) — ou Full strict com Origin Cert (ver CLAUDE.md).
- Propaga em minutos. Se o navegador acusar TLS, é o Universal SSL do CF subindo (aguarde alguns minutos).

### 8. Descomissionar o WordPress
- Confirme tudo no ar (passo "Verificação"). Só então desligue o WP origem.
- Mantenha um **backup** do WP (export/dump) por garantia antes de remover.
- Se o WP estava noutra hospedagem, pode apenas desativá-lo após o DNS apontar pro motor.

---

## Verificação (antes de declarar concluído)
```bash
# portal responde + conteúdo migrado
curl -s -o /dev/null -w "home %{http_code}\n" "https://<dominio>/"
ssh hostinger-vps-srv1166087 'ls /srv/portais/<slug>/data/*.json | wc -l'   # nº de artigos importados
# uma URL antiga do WP deve redirecionar 301 para a nova
curl -s -o /dev/null -w "301? %{http_code} -> %{redirect_url}\n" "https://<dominio>/URL-ANTIGA-DO-WP/"
# sitemap e robots
curl -s "https://<dominio>/sitemap.xml" | head -5
```
Depois: **reenviar o sitemap no Google Search Console** do domínio (o dono já administra).

---

## Checklist de conversão
- [ ] WP REST acessível e inventário feito (nº de posts, categorias, permalink atual)
- [ ] Portal provisionado (`newsite.sh`) + endpoint/X-API-KEY anotados
- [ ] Mapeamento de categorias definido (`--cat-map`)
- [ ] Import testado com `--dry-run` e depois rodado por inteiro
- [ ] Imagens migradas (viraram WebP no motor)
- [ ] Datas originais preservadas
- [ ] **Redirects 301 aplicados no vhost** (`nginx -t` ok)
- [ ] Antônio repontado para o endpoint novo
- [ ] **`/etc/hosts` do srv1166087 limpo** — remover entrada do domínio que aponte pro WP antigo (senão transfer dá 404 "para WordPress"); `getent hosts <dominio>` deve resolver via Cloudflare
- [ ] DNS apontando pro `31.97.173.40` + SSL ok
- [ ] WordPress com backup e descomissionado
- [ ] SITES.md + sites.json + Status do CLAUDE.md atualizados (regra de manutenção)
- [ ] Sitemap reenviado no Search Console

---

## Observações
- **Não é cópia de terceiro:** aqui é o MESMO dono migrando o MESMO conteúdo de plataforma. Por isso a
  migração é 1:1 (texto, imagens, datas, URLs preservadas). A regra de "não duplicar conteúdo" vale para
  copiar sites de outros — não para mover o seu.
- **Limite de tamanho de imagem no POST:** o receptor aceita até 8 MB por requisição e a imagem é capada em
  5 MB. Imagens enormes do WP podem ser ignoradas (o artigo entra sem imagem) — raro, mas confira no log.
- **Conteúdo em inglês / outra língua:** o motor não traduz na importação. Se o WP tiver conteúdo a traduzir,
  trate depois editando o `data/<slug>.json` e rebuildando (ver CLAUDE.md → Gerenciar conteúdo).
