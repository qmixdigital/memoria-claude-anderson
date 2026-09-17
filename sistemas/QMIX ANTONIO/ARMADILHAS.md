# Armadilhas e incidentes conhecidos

Cada item aqui já parou publicação em produção. A ordem é de frequência.

---

## 1. Permissão de arquivo trava o motor (resolvido em 17/08/2026)

**Sintoma:** o receptor do portal-engine responde `500` com
`EACCES: permission denied, open '/srv/portais/<portal>/public/.../index.html.tmp'`.
O artigo é gravado em `data/` mas o site nunca é reconstruído.

**Causa:** algum script rodado como `root` reescreveu arquivos dentro de
`public/`, e o processo do motor roda como o usuário `portais`.

**Diagnóstico:**
```bash
for d in /srv/portais/*/; do
  n=$(find "$d/public" -not -user portais 2>/dev/null | wc -l)
  [ "$n" -gt 0 ] && echo "$(basename $d): $n arquivos"
done
```

**Correção:**
```bash
chown -R portais:portais /srv/portais/*/public /srv/portais/*/data
```

Em 17/08/2026 isso afetava **41 portais** nos três servidores e vinha de
16/08. Toda entrega do Antônio para esses portais falhava em silêncio.

---

## 2. Redirecionamento apex → www mata o POST (resolvido em 17/08/2026)

**Sintoma:** endpoint responde `301` no domínio raiz e o artigo nunca chega.

**Causa:** regra de redirecionamento na Cloudflare ("Redirecionar da raiz para
WWW"). Um `301` transforma `POST` em `GET` em boa parte dos clientes.

**Correção,** na regra da zona, acrescentando exceção à expressão:
```
(http.request.full_uri wildcard r"https://DOMINIO/*") and not http.request.uri.path contains "/artigos"
```

⚠️ O operador `matches` exige plano Business; em zona gratuita use `contains`.

Afetou professortic.com, olharmoderno.com e projetob.net. Alternativa sem mexer
na Cloudflare: cadastrar o endpoint com `www.` no `wp_sites`.

---

## 3. `wp_kses_post` apaga o schema do artigo

**Sintoma:** post publicado com 201, texto perfeito, e **nenhum** `itemprop`
ou bloco `<script type="application/ld+json">` no HTML final.

**Causa:** o receptor WordPress sanitiza o conteúdo com `wp_kses_post()`.

**Solução:** para artigo que precisa de FAQ marcada, publicar por wp-cli com
`--user=<ID de administrador>`. Sem o `--user`, o kses roda igual. O ID 1
costuma não existir nesses sites: descubra com
`wp user list --role=administrator --field=ID`.

---

## 4. Guarda de deduplicação devolve 201 sem publicar

**Sintoma:** resposta `201` com URL, mas a página responde `404`.

**Causa:** outro portal da rede já é dono daquele slug. O registro fica em
`/srv/portais/_dedup/owners.json`, com mais de 5.200 slugs.

**Como detectar:** olhe o campo `status` da resposta, não só o HTTP.
`status: skipped` significa descartado.

**Como evitar:** conferir o slug antes de publicar.
```bash
ssh clinicas-vps 'python3 -c "
import json; o=json.load(open(\"/srv/portais/_dedup/owners.json\"))
print([k for k in o if \"SEU-SLUG\" in k] or \"LIVRE\")
"'
```

---

## 5. Origem bloqueada em alguns receptores WordPress

**Sintoma:** `403 {"code":"forbidden_origin","message":"Origem nao autorizada."}`
mesmo com a chave correta.

Visto em `sabedoriaglobal.com.br`. O receptor daquele site tem allowlist de
origem. Se o Antônio tentar publicar de um IP fora dela, falha sempre. Publicar
por wp-cli funciona.

---

## 6. Cache da Cloudflare mascara o resultado

Depois de publicar ou corrigir um artigo, a borda pode continuar servindo a
versão antiga por bastante tempo, inclusive com parâmetro de query.

**Sempre valide na origem**, e não pelo domínio público:
```bash
ssh <servidor> 'python3 -c "
import re
h=open(\"/srv/portais/<portal>/public/<slug>/index.html\",encoding=\"utf-8\").read()
t=re.sub(r\"<[^>]+>\",\" \",h); print(len(t.split()),\"palavras\")
"'
```

---

## 7. MySQL cai no meio do download da imagem

**Sintoma:** cron morre com exit 255 e `MySQL server has gone away`.

**Causa:** a conexão expira enquanto a imagem é baixada, e a query seguinte
morre. Até 15/08/2026 o teste `isMysqlAlive()` vinha **depois** de
`getWpEndpointUrl()`, então o fatal acontecia antes do remédio. Foram 68 quedas
de cron. Hoje a reconexão acontece antes da primeira query.

---

## 8. Diferença de resposta entre WordPress e Next

WordPress devolve `post_id`; Next devolve `id`, às vezes UUID. O
`article-transfer` já aceita os dois (`$result['post_id'] ?? $result['id']`),
mas a coluna `wp_post_id` é `int` e não guarda UUID. O envio funciona; o
registro do id remoto, não.

---

## 9. Watchdog do PM2 no srv1166087

Aplicações Next daquele servidor já ficaram dias fora do ar porque um deploy
deixava o app como `stopped` e nada recuperava. Existe
`/opt/pm2-watchdog.sh` em cron de 2 em 2 minutos. Se um destino Next parar de
receber, confira o watchdog e o estado do PM2 antes de suspeitar do Antônio.

---

---

## 11. Slug novo colidindo com artigo podado (resolvido em 28/08/2026)

**Sintoma:** o motor loga `publicado`, o JSON existe em `data/`, o `index.html`
existe em `public/`, o receptor devolve `201` com URL e o Telegram anuncia. A URL
responde **410 Gone** desde o primeiro segundo.

**Causa:** a lista de 410 da conversao (`/etc/nginx/gone/<portal>.conf`) e uma
fotografia tirada no dia da poda. A plataforma continua publicando depois. Quando
o slug novo coincide com um slug podado, o `location ~ ... { return 410; }` do
Nginx ganha do arquivo em disco, porque a regra casa antes de o Nginx tentar
servir o arquivo.

Aconteceu no advivo com
`o-que-e-generative-engine-optimization-tudo-sobre-a-nova-sigla-do-marketing`,
podado em 22/08 e republicado em 28/08. **Nao adianta procurar no `receiver.js`:**
ele fez tudo certo.

**Correcao (na raiz):** o 410 passou a ser condicional nos 33 `gone/*.conf` da
opengravity, 8.951 regras. So responde Gone se a pagina nao existir no disco:

```nginx
location ~ "^/(?:[a-z0-9-]+/)?(slug1|slug2)/?$" {
    try_files $uri $uri/ $uri/index.html =410;
}
```

⚠️ Ao conferir, use o formato de URL que aquela lista exige. Metade tem a editoria
opcional (`^/(?:[a-z0-9-]+/)?`) e a outra metade a exige (`^/[a-z0-9-]+/(`).
Testar `/slug/` na raiz de uma lista do segundo tipo devolve 404 e parece
regressao, nao e.

---

## 12. A plataforma nao conferia se a pagina existia (resolvido em 28/08/2026)

O `201` do destino nunca provou que a pagina existe. Duas armadilhas desta lista
(a 4 e a 11) produzem exatamente isso: resposta de sucesso e pagina morta.

Agora existe uma camada de conferencia, toda **posterior ao envio** e que **nunca
reenvia** (reenviar criaria duplicata, ou voltaria como `skipped` pela dedup):

| Peca | Papel |
|---|---|
| `includes/verifica-publicacao.php` | funcao `verificarUrlPublicada()`: GET com furo de cache, segue redirecionamento. Veredito `existe` / `sumiu` / `inconclusivo` |
| `cron-verifica-publicadas.php` | a cada 10 min, confere as publicacoes das 3 filas dos ultimos 3 dias e alerta no @qmixdigital_bot o que responder 404/410 |
| `cron-alert-publicacoes-editores.php` | passou a segurar o anuncio de link morto no canal dos parceiros |
| `seo_articles.wp_post_url`, `news_items.wp_post_url` | colunas novas: sem elas so havia o `wp_post_id` e nao havia o que conferir |

**So 404 e 410 geram alerta.** 403, 5xx e timeout viram `inconclusivo` e sao
apenas registrados: podem ser WAF, origem ocupada ou rede, e alertar neles
ensinaria a ignorar o alerta.

Registro em `qmix_publicacao_verificada` (fila, article_id, code, veredito,
tentativas, alertado). Desiste depois de 12 tentativas.

---

## 10. Checklist rápido quando "o Antônio parou de publicar"

1. `GET /_health` do receptor do engine responde? (`{ok:true, sites:N}`)
2. Endpoint do destino devolve **400** com corpo vazio e chave certa?
3. `find /srv/portais/*/public -not -user portais | wc -l` retorna zero?
4. `cron_logs` e `logs/transfer-debug.log` mostram tentativa recente?
5. A entrega está caindo em `status: skipped` por dedup?
6. A resposta é 301/308 por redirecionamento de domínio?
7. O artigo existe em `data/` mas não em `public/`? Então é rebuild travado.
8. A URL anunciada responde **410**? Então o slug bateu na lista de poda
   (item 11), e não em falha do motor.
