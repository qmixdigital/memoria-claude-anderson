# Diretório por cima de um site da rede que já existe

**Regra da rede: quando um site nosso vira diretório, o diretório entra por PATH
no próprio domínio, não em subdomínio.** Dois motores, um hostname: o site velho
continua servindo o que sempre serviu, e um app Next responde apenas as rotas do
diretório.

**Por que path e não subdomínio:** o ganho de transformar um site que já existe é
herdar a autoridade que ele já tem. O Google trata subdomínio como site quase
separado, então `diretorio.site.com.br` começa do zero e joga fora exatamente o
motivo de a transformação existir.

Referência viva: **ebookcult.com.br** na OpenGravity. Blog em HTML estático
(Portal Engine, `/srv/portais/ebookcult/public`) e diretório em Next
(`/var/www/ebookcult-dir`, PM2 3050/3051), no mesmo `ebookcult.com.br`.

---

## 1. Antes de montar: medir o que o site JÁ perdeu

**Puxe 12 meses do Search Console do site hospedeiro antes de encostar em
qualquer coisa.** No ebookcult, uma conversão anterior de WP para Portal Engine
tinha podado 2.109 slugs e derrubado o tráfego de 4,5 cliques/dia para 0,1. Das
339 URLs com clique em 12 meses, 230 não respondiam 200 e **229 já estavam mortas
antes** da camada de diretório.

Sem esse levantamento, o diretório leva a culpa por um colapso que já existia.
Com ele, dá para provar zero regressão e ainda achar o que recuperar (três URLs
voltaram com 301 porque o texto vivia em outra editoria).

- [ ] Export de 12 meses do GSC, dimensão `page`.
- [ ] Rodar todas as URLs com clique e separar: responde 200, morreu antes de
      mim, morreu comigo.
- [ ] **Crawl PRÉ das URLs antigas, guardado em arquivo.** É a prova de não
      regressão, e sem ele a discussão vira opinião.

## 1b. O servidor do site aguenta o diretório?

**Abaixo de 80% antes E depois.** O app do diretório não precisa morar no mesmo
servidor do site hospedeiro: o `proxy_pass` do nginx aponta para onde for. Se o
servidor do site está apertado, o app vai para outro e o site nem percebe.

Some antes de decidir: `node_modules` (700 a 850 MB), `.next` (602 MB com ISR,
**6,2 GB se pré-renderizar 23 mil páginas**), banco, e o `-prev` de cada deploy.

E **nunca descompacte a fonte de dados no servidor do site**: filtre no servidor
que tem espaço e transfira só o recorte. O dump da Receita passa de 40 GB
descompactado.

## 2. O corte de rotas

Escolha os prefixos do diretório e **prove que o site hospedeiro não os usa**.
Colisão de `location ^~` com URL viva do blog é o defeito mais caro dessa
montagem, porque o blog some sem erro nenhum.

- [ ] Para cada prefixo candidato, `curl -sI` no site atual: tem que dar 404.
- [ ] Conferir também contra o export do GSC: prefixo que já teve clique não pode
      ser tomado.
- [ ] **Rota administrativa do diretório leva sufixo próprio**, para nunca
      colidir: `/painel-diretorio/`, `/admin-diretorio/`, `/remocao-diretorio/`,
      `/og-diretorio/`, `/sitemaps-diretorio/`.

## 3. nginx: três arquivos, não um

Separar em três evita editar o conf do site a cada mudança do app.

**`<site>-dir-upstream.conf`** (as duas instâncias PM2 do deploy zero-downtime):

```nginx
upstream ebookcult_dir_backend {
    server 127.0.0.1:3050 max_fails=0;
    server 127.0.0.1:3051 max_fails=0;
    keepalive 16;
}
```

**`<site>-dir-proxy.inc`** (o include que todo location usa):

```nginx
proxy_pass http://ebookcult_dir_backend;
proxy_http_version 1.1;
proxy_set_header Connection "";
proxy_set_header Host $host;
# O nginx.conf global tem set_real_ip_from das faixas da Cloudflare e
# real_ip_header CF-Connecting-IP, entao $remote_addr JA e o IP do visitante.
# Os tres abaixo sao REESCRITOS de proposito: se passassem o que o cliente
# mandou, ele trocaria de "IP" a cada requisicao e o rate limit do app nunca
# fecharia. X-Forwarded-Host e limpo pelo mesmo motivo (open redirect).
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header CF-Connecting-IP "";
proxy_set_header X-Forwarded-Host "";
proxy_set_header X-Forwarded-Proto https;
proxy_next_upstream error timeout http_502 http_503 http_504;
proxy_read_timeout 30s;
add_header X-Content-Type-Options nosniff always;
```

**No conf do site**, um `location` por prefixo:

```nginx
location ^~ /livrarias/          { include /etc/nginx/conf.d/ebookcult-dir-proxy.inc; }
location ^~ /livraria/           { include /etc/nginx/conf.d/ebookcult-dir-proxy.inc; }
location ^~ /_next/              { include /etc/nginx/conf.d/ebookcult-dir-proxy.inc; }
location ^~ /api/diretorio/      { include /etc/nginx/conf.d/ebookcult-dir-proxy.inc; }
location = /sitemap-diretorio.xml { include /etc/nginx/conf.d/ebookcult-dir-proxy.inc; }
```

**Quatro coisas que quebram se faltarem:**

- **`/_next/` é obrigatório.** Sem ele o app carrega sem CSS e sem JS, e parece
  um bug de design.
- **Singular E plural.** `/livraria/` e `/livrarias/` são rotas diferentes; a
  ficha costuma ficar no singular e a listagem no plural.
- **Sitemap PRÓPRIO**, `/sitemap-diretorio.xml`, nunca sobrescrevendo o do site.
  Os dois entram no `robots.txt`.
- **`^~`** e não regex: o prefixo tem que ganhar de qualquer `location ~` que o
  site já tenha, senão a regra antiga captura primeiro.

## 4. Backup e prova, sempre

- [ ] `cp conf conf.bak-<motivo>-$(date +%Y%m%d-%H%M%S)` antes de cada edição. O
      ebookcult tem doze desses, e cada um já salvou uma volta.
- [ ] `nginx -t` antes de recarregar.
- [ ] **Crawl PÓS e diff contra o PRÉ.** O critério é diff zero. No ebookcult
      foram 1.210 URLs antigas com zero diferença.
- [ ] Se o site hospedeiro tem motor próprio (Portal Engine), qualquer patch nele
      precisa de backup e de **prova de não regressão nos outros portais que
      compartilham o motor**. No ebookcult foram três patches e quatro portais
      conferidos.

## 5. Deploy

O deploy do app do diretório **não toca no site hospedeiro**: o blog continua
servindo do disco enquanto o Next troca de release. Vale o padrão zero-downtime
da rede (release montada em `-build`, troca atômica, rolagem de uma instância por
vez, trava contra deploy concorrente).

O conf do nginx do site é editado **fora** do deploy, e raramente.
