# Converter notebookx, arcondicionadotop e ebookcult-dir para estático

Escrito em 18/10/2026 para outro modelo executar. **Ler inteiro antes de começar.**

O operador autorizou: converter os três para estático e podar o que for
necessário, porque os sites não têm tráfego. A análise, as listas e os testes já
foram feitos. Falta executar.

- Acesso: alias SSH `opengravity` (root).
- Relatório final: 3 a 4 linhas, com o que foi feito e o resultado.

---

## ESTADO ATUAL: CONCLUÍDO em 18/10/2026

Os três diretórios foram convertidos e os apps desligados. **Não há mais nada
a executar deste runbook**, exceto o item "Pendências" abaixo.

| Etapa | notebookx | arcondicionadotop | ebookcult-dir |
|---|---|---|---|
| Congelado | ✅ 4.119 páginas | ✅ 320 páginas | ✅ 25.301 páginas |
| Destino | Cloudflare Pages (`notebookx`) | Cloudflare Pages (`arcondicionadotop`) | `/srv/static/ebookcult-dir` via gateway `og-ingresso` |
| DNS | ✅ CNAME → `notebookx.pages.dev` | ✅ CNAME → `arcondicionadotop.pages.dev` | n/a (já era Pages) |
| Validação em produção | ✅ 595/595 URLs vivas em 200 | ✅ 320/320 | ✅ 160 sorteadas em 200 |
| App, banco, pastas, upstream, cron, logrotate | ✅ removidos | ✅ removidos (+ webhook Asaas) | ✅ removidos |

Resultado na opengravity: disco 55% (44 GB livres), 9 apps online (eram 18 no
início), RAM com ~5 GB disponíveis.

Guardado em `D:/SISTEMAS/MinhasHospedagens/backups/`: dumps
`notebookx-final-`, `arcondicionadotop-final-`, `ebookcult_dir-final-` (todos
`20261018.sql.gz`), códigos `notebookx-arcondicionadotop-codigo-20261018.tgz`
(895 MB, com os uploads originais) e `ebookcult-dir-codigo-20261018.tgz`, e
`mysql-orfaos-20261018.tar`. DNS anterior em
`D:/SISTEMAS/cloudflare/dns_backup_notebookx_arc_ebc_20261018.json`.
Scripts aposentados em `opengravity:/root/scripts-aposentados-20261018/`.

### Pendências (decisão do operador, nada a fazer sem ordem)
- **`dev.notebookx.com.br`:** o registro A ainda aponta para 77.37.69.175 na zona
  do notebookx, sem nada servindo. Apagar o registro com OK do operador.
- **`staging-arcondicionado.qmixdigital.com.br`:** idem, na zona qmixdigital.com.br.
- **Reivindicações do notebookx:** 8 pedidos pendentes (jun a set/2026); nome e
  e-mail estão em `notebookx-final-20261018.sql.gz`, tabela `claim_requests`.
- **jan/2027:** rodar `gsc_keep.py ebookcult.com.br` e decidir se o diretório fica.
- **Bancos MySQL `qmix_*`:** 9 são blogs de clientes; não apagar.

### Como o ebookcult REALMENTE é servido (descoberto nesta execução)
O DNS é CNAME para o Pages; um middleware do Pages manda as pastas do diretório
para **`og-ingresso.qmix.com.br`** (`/etc/nginx/conf.d/ingresso-og.conf`) com o
cabeçalho `X-Portal-Host`. O `portal-ebookcult.conf` não recebe esse tráfego. O
mesmo gateway atende desassossegada e revistadeducao (continuam dinâmicos). O
`ebc_ingresso_estatico.py` + correções fizeram o gateway servir
`/srv/static/ebookcult-dir` **só quando `X-Portal-Host == ebookcult.com.br`**.
Armadilha: o `nginx.conf` tem `error_page 410 /error/410.html`, que virava 404;
o gateway tem `error_page 410 @gone`. A pasta `ebookcult-dir-upstream.conf`
**fica** (o map do gateway ainda cita `ebookcult_dir_backend`). O
`sitemap-diretorio.xml` é o próprio urlset (o middleware só encaminha esse
nome; um índice apontando para `-1.xml` daria 404).

---

## 0. Já decidido. Não refazer, não questionar

| Site | Hoje | Fica | Por quê | Destino |
|---|---|---|---|---|
| **notebookx.com.br** | 250 mil fichas, ~3 mil cidades, blog | **4.143 páginas**: blog, institucionais e as páginas de `/empresas/` **com impressão** no Google em 16 meses (977 fichas, cerca de 2.260 cidades) | O diretório quase não tem impressão | **Cloudflare Pages** |
| **arcondicionadotop.com** | 147 mil fichas, 9.423 páginas locais (`/instalacao-`, `/higienizacao-`, `/manutencao-ar-condicionado-<cidade>/`), blog | **325 páginas**: blog, marcas, categorias e institucionais. **Zero** ficha ou página de cidade teve impressão; o tráfego todo vem dos artigos | Diretório sem tráfego | **Cloudflare Pages** |
| **ebookcult-dir** (seção de livrarias do ebookcult.com.br) | 25.301 páginas | **Todas** | Criado em 02/09/2026, só 6 semanas. Zero impressões ainda é normal; reavaliar em jan/2027 | **nginx na opengravity**, porque divide o domínio com o portal-engine |

As listas estão em `listas/congelar_{nbx,arc,ebc}.txt`, já filtradas pelo Search
Console (exportações em `listas/gsc_*.txt`). **Usar essas listas como estão.**

O que deixa de existir nos três: painel, login, cadastro, reivindicação, preços,
busca, newsletter, comentários, contato e checkout. O `mirror_next.py`:
- remove os `<form>`;
- remove os links para essas rotas;
- **troca por texto puro todo link para página podada** e todo filtro
  `?seg=...`, para não sobrar link quebrado. Testado na home e numa página de
  cidade do notebookx: zero link para página podada.

### Asaas: investigado, não bloqueia
A conta é uma só, a da QMIX DIGITAL LTDA. O webhook vale para a conta inteira,
então a tabela `payment_events` do arcondicionadotop tem eventos de todos os
produtos e **não é receita do diretório**. Na fase 4 é preciso **apagar o
webhook do arcondicionadotop**. Notebookx e ebookcult-dir não têm webhook.

---

## ⚠️ Armadilhas já encontradas nesta máquina e neste Windows

1. **Git Bash converte argumento que começa com `/`.** Um `'^/empresas/'` vira
   caminho do Windows e quebra a regex sem dar erro. Rodar
   `export MSYS_NO_PATHCONV=1` antes de qualquer comando com regex ou caminho
   remoto.
2. **`tar` no Windows lê `D:` como host remoto.** Usar `tar --force-local`.
3. **Hestia:** `v-delete-web-domain` não está no PATH; usar
   `/usr/local/hestia/bin/v-delete-web-domain`. Ele deixa symlink quebrado em
   `/etc/nginx/conf.d/domains/`, que derruba o `nginx -t`. Depois de remover
   um domínio, rodar `find /etc/nginx/conf.d -xtype l -delete`.
4. **Nunca `systemctl reload nginx` sem `nginx -t` OK antes.** Se o teste
   falhar, corrigir; o nginx segue servindo com a config antiga.
5. **Cloudflare:** os tokens por conta não têm permissão de Pages; usar o
   token `master` de `D:/SISTEMAS/cloudflare/contas.json`. Logo depois de
   anexar o domínio, um 522 isolado é propagação: esperar 1 minuto e testar de
   novo.
6. **Mudança de DNS exige confirmação do operador** (CLAUDE.md, e o sistema de
   permissões bloqueia). Preparar tudo, testar no `*.pages.dev` e então
   **pedir**: "Posso trocar o DNS de X para o Pages?".
7. **Chaves `.env`:** algumas guardam `\$aact...` com a barra. Para usar a chave,
   trocar `\$` por `$`.
8. **Não editar `.py` com `sed` nem com Python inline que contenha `\b`.** Já
   virou backspace invisível uma vez e quebrou a regex. Usar a ferramenta Edit.

---

## FASE 1: congelar (na opengravity)

```
export MSYS_NO_PATHCONV=1
cd D:/SISTEMAS/MinhasHospedagens/Opengravity/estatico-diretorios
ssh opengravity 'mkdir -p /root/estatico'
scp mirror_next.py listas/congelar_*.txt opengravity:/root/estatico/
```
Rodar em `tmux` ou `nohup`, porque o ebookcult leva horas. Se cair, repetir o
mesmo comando: ele pula o que já foi gravado.
```
cd /root/estatico
nohup python3 mirror_next.py --dominio notebookx.com.br --porta 3025 --lista congelar_nbx.txt \
  --saida /srv/static/notebookx.com.br --podavel '^/empresas/' > nbx.log 2>&1 &
nohup python3 mirror_next.py --dominio arcondicionadotop.com --porta 3035 --lista congelar_arc.txt \
  --saida /srv/static/arcondicionadotop.com \
  --podavel '^/(empresas/|(instalacao|higienizacao|manutencao)-ar-condicionado-)' > arc.log 2>&1 &
```
O ebookcult só depois que os dois terminarem, para não pesar no servidor:
```
nohup python3 mirror_next.py --dominio ebookcult.com.br --porta 3050 --lista congelar_ebc.txt \
  --saida /srv/static/ebookcult-dir --sitemap-nome sitemap-diretorio > ebc.log 2>&1 &
```
O ebookcult não leva `--podavel`, porque não poda nada.

**Conferência de cada site** (o resumo no fim do `.log` traz `{'ok', 'erro'}`; se
os erros passarem de 1% da lista, olhar o log antes de seguir):
```
cd /srv/static/<site>; find . -name index.html | wc -l; du -sh .
grep -rl "_next/image" --include=index.html . | wc -l     # tem que dar 0
grep -rlE 'href="/(painel|login|cadastrar|precos)/' --include=index.html . | wc -l   # tem que dar 0
```

---

## FASE 2: notebookx e arcondicionadotop → Cloudflare Pages

Mesmo procedimento do tendenciasmarketing, que foi feito e validado em
18/10/2026. Para cada um:

1. **Baixar:**
   ```
   ssh opengravity "tar czf - -C /srv/static notebookx.com.br" > D:/tmp/nbx.tgz
   cd D:/tmp && tar --force-local -xzf nbx.tgz
   ```
2. **Conta da zona:** com o token master, `GET /zones?name=notebookx.com.br`
   → `result[0].account.id` e `result[0].id`. Listar os registros DNS e
   **guardar o JSON** (para reverter).
3. **Criar o projeto e publicar:**
   - `POST /accounts/{acc}/pages/projects` com `{"name":"notebookx","production_branch":"main"}`.
   - `CLOUDFLARE_API_TOKEN=<master> CLOUDFLARE_ACCOUNT_ID=<acc> npx --yes wrangler@3.114.0 pages deploy notebookx.com.br --project-name notebookx --branch main --commit-dirty=true`
   - Projeto do ar-condicionado: `arcondicionadotop`.
4. **Testar no `https://<projeto>.pages.dev`:**
   - todas as URLs da lista com `xargs -P 8 curl -s -o /dev/null -w '%{http_code} %{url}\n'`, com o domínio trocado pelo `pages.dev`: 100% devem dar 200;
   - `/sitemap.xml`, `/robots.txt` e `/ads.txt` (este, se existir hoje no site);
   - uma ficha podada, que deve dar 404 com a página de erro do site.
5. **Pedir confirmação ao operador para trocar o DNS** (armadilha 6). Com o OK:
   - `POST /accounts/{acc}/pages/projects/<projeto>/domains` para o apex e para o www;
   - trocar os registros A do apex e do www por **CNAME proxied → `<projeto>.pages.dev`**;
   - **não mexer** em MX, TXT e outros registros;
   - em `D:/SISTEMAS/cloudflare`, rodar `python -I cf_www_apex.py <dominio>`.
6. **Validar em produção:** todas as URLs da lista devem dar 200, sem header
   `x-powered-by: Next.js`, e o www deve responder 301 para o apex.

## FASE 3: ebookcult-dir → nginx estático na opengravity

**Como o tráfego chega (descoberto em 18/10/2026):** o DNS do ebookcult.com.br é
CNAME para `ebookcult.pages.dev` (conta CF "Ebook Cult", `140f1348...`), e uma
Function do Pages encaminha as rotas do diretório (`/livrarias/` etc.) para o
nginx da opengravity. Por isso o nginx continua sendo a origem certa e **não se
mexe no DNS**. Testar sempre por `https://ebookcult.com.br/...`. O token master
não lê essa conta (403), então não dá para inspecionar a Function; basta não
quebrar o contrato: as mesmas rotas, só que respondidas por arquivo.

O `/etc/nginx/conf.d/portal-ebookcult.conf` tem, nas linhas 34 a 50, `location`s
que mandam o diretório para o app com `include /etc/nginx/conf.d/ebookcult-dir-proxy.inc;`.

1. `cp -a /etc/nginx/conf.d/portal-ebookcult.conf /root/portal-ebookcult.conf.bak-AAAAMMDD`
2. Trocar estas linhas por
   `{ root /srv/static/ebookcult-dir; try_files $uri $uri/index.html =404; }`:
   - seções `/livrarias/ /livraria/ /sebos/ /sebo/ /bibliotecas/ /biblioteca/ /editoras/ /editora/`;
   - `/_next/` (só o diretório usa Next nesse domínio);
   - `/og-diretorio/` e `/sitemaps-diretorio/`.
3. `location = /sitemap-diretorio.xml` passa a usar o mesmo `root` (arquivo novo,
   gerado pelo espelhador). Acrescentar
   `location ~ ^/sitemap-diretorio-[0-9]+\.xml$ { root /srv/static/ebookcult-dir; }`.
4. `/api/diretorio/ /painel-diretorio/ /admin-diretorio/ /cadastro-livraria/ /remocao-diretorio/` → `{ return 410; }`.
5. `nginx -t` e só então `systemctl reload nginx`.
6. **Testar:** 30 URLs aleatórias de `congelar_ebc.txt` em
   `https://ebookcult.com.br` devem dar 200; a home e um artigo do portal devem
   continuar 200; `/painel-diretorio/` deve dar 410.
7. Conferir se o `robots.txt` do portal
   (`/srv/portais/ebookcult/public/robots.txt`) lista
   `Sitemap: https://ebookcult.com.br/sitemap-diretorio.xml`. Se não listar,
   acrescentar a linha. Atenção: o portal-engine pode regenerar esse arquivo.
   Verificar se ele vem do `sites.json`; se vier, pôr lá.

---

## FASE 4: desligar os apps (só depois de a fase 2 ou 3 do site validar em produção)

Para cada app (a ordem dos comandos importa):
```
sudo -u postgres pg_dump <db> | gzip > /root/db-backups/<db>-final-AAAAMMDD.sql.gz
pm2 delete <app> ; pm2 delete <app>-b ; pm2 save
sudo -u postgres dropdb <db>
rm -rf /var/www/<pasta> /var/www/<pasta>-shared /var/www/<pasta>-prev
```
Baixar os dumps para `D:/SISTEMAS/MinhasHospedagens/backups/` com `scp` e
conferir com `gzip -t`.

| | app PM2 | db | pasta | upstream | domínios Hestia a remover |
|---|---|---|---|---|---|
| notebookx | `notebookx` | `notebookx` | `notebookx` | `notebookx-upstream.conf` | `notebookx.com.br`, `dev.notebookx.com.br` |
| arcondicionadotop | `arcondicionado-top` | `arcondicionadotop` | `arcondicionadotop.com` | `arcondicionadotop-upstream.conf` | `arcondicionadotop.com`, `staging-arcondicionado.qmixdigital.com.br` |
| ebookcult-dir | `ebookcult-dir` (+`-b`) | `ebookcult_dir` | `ebookcult-dir` | `ebookcult-dir-upstream.conf` | nenhum: o domínio é do portal |

- **Hestia:** `/usr/local/hestia/bin/v-delete-web-domain qmix <dominio> yes`.
  Depois `find /etc/nginx/conf.d -xtype l -delete`, `nginx -t` e reload.
- **Upstream:** antes de apagar, `grep -rl <nome_do_upstream> /etc/nginx`; nada
  pode usá-lo. Apagar também o `ebookcult-dir-proxy.inc`, depois de conferir que
  o `portal-ebookcult.conf` não o inclui mais.
- **Cron:** `crontab -l | grep -vE 'backup-notebookx|backup-arcondicionadotop' | crontab -`.
  Apagar `/usr/local/sbin/backup-notebookx.sh` e `/root/backup-arcondicionadotop.sh`.
- **Logrotate:** tirar `arcondicionadotop-*.log` e `backup-notebookx.log` de
  `/etc/logrotate.d/qmix-hardening`. Depois `logrotate -d /etc/logrotate.conf 2>&1 | grep ^error`
  não pode retornar nada.
- **Webhook Asaas do arcondicionadotop:** usar a chave
  `ASAAS_API_KEY` de `/var/www/consultarimovel-shared/.env` (com `\$`→`$`) e rodar
  `DELETE https://api.asaas.com/v3/webhooks/42f21503-208b-4ee0-ad86-cd3feef0f2f9`
  com o header `access_token`. Conferir com `GET /v3/webhooks`.
- **DNS:** os registros de `dev.notebookx.com.br` e
  `staging-arcondicionado.qmixdigital.com.br` no Cloudflare só saem com
  confirmação do operador.
- O `/opt/pm2-watchdog.sh` lê o `pm2 jlist`; app apagado não volta. Conferir
  com `pm2 ls` 3 minutos depois.

---

## FASE 5: sobras da opengravity (aprovadas na limpeza de 18/10)

1. **Bancos MySQL `qmix_*`: NÃO APAGAR sem ordem do operador.** Investigado em
   18/10: 9 deles não são citados por arquivo nenhum, mas **são blogs de
   clientes**: cirurgiadojoelhogoiania (2 cópias), drhenriquebufaical, drbrunoair,
   cirurgiadecolunagoiania, clinicasrecuperacaosaopaulo, peritodicas (2 cópias) e
   um qmix.com.br. Podem ser a única cópia, pois a migração dos blogs de clientes
   está pendente. Já existe um arquivo de segurança em
   `backups/mysql-orfaos-20261018.tar` (11 MB). Em uso de fato: `qmix_26167`
   (peritodicas, citado no `.env`) e `qmix_67882` (tredicci). Os dois bancos
   `qmix_47034` e `qmix_60948` estão vazios (0 tabelas) e podem sair.
2. **WordPress do peritodicas: NÃO MEXER.** O `.env` do Next
   (`/home/qmix/web/peritodicas.com/shared/.env`) usa o banco `qmix_26167`; o
   `public_html` não é resto.
3. **noticias9 e noticiasdasemana:** os dois são CNAME para o Pages, então os
   vhosts `portal-noticias9.conf` e `portal-noticiasdasemana.conf` são resto
   sem efeito. Não vale mexer (risco maior que o ganho).

## FASE 6: fechamento
- `ssh opengravity 'df -h /; free -m; pm2 ls'`. Esperado: cerca de 1,2 GB de RAM
  liberados (notebookx 520 MB, arcondicionadotop 440 MB, ebookcult 230 MB) e
  cerca de 1 GB de disco. O estático do ebookcult ocupa uns 3 a 4 GB.
- Acrescentar ao `D:/SISTEMAS/MinhasHospedagens/Opengravity/README.md`: o que
  saiu, os projetos Pages criados e onde estão os dumps.
- Avisar o operador das **8 reivindicações de ficha pendentes no notebookx** (de
  junho a setembro, nunca tratadas). Nome e e-mail estão no dump final.
- **Lembrete (jan/2027):** rodar `gsc_keep.py ebookcult.com.br` e decidir se o
  diretório de livrarias fica ou sai.
