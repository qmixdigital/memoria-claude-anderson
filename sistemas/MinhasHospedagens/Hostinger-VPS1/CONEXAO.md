# Conexão — Hostinger Cloud Professional (VPS1)

## Dados de acesso SSH

| Campo | Valor |
|-------|-------|
| **Host** | `92.113.35.186` |
| **Porta** | `65002` |
| **Usuário** | `u651115354` |
| **Senha** | `<<REMOVIDO>>` |

## Comando de conexão

```bash
ssh -p 65002 u651115354@92.113.35.186
```

## Diretório dos sites

```bash
cd ~/domains
ls
```

Cada site fica em: `~/domains/<dominio>/public_html/`

## WP-CLI (dentro de cada site)

```bash
cd ~/domains/DOMINIO.COM/public_html
wp option get siteurl --allow-root
wp user list --role=administrator --allow-root
wp plugin list --allow-root
```

## Sites nesta conta (47)

advdobrasil.com.br, blog.advdobrasil.com.br, carretaspresidente.com.br, clickinfohub.com, comprarvisualizacoes.com, dataroomus.com, desentupidora.pro, diariodatv.com, diariodegoiania.com, diariodobrejo.com, edenoticias.com, energiaeficiente.com.br, entrenoticia.com, euvo.com.br, ferronoticias.net, filmeseseriesnovas.com, folhaum.com, gdsnoticias.com, gpnoticias.com, jornalacapital.com, jornaldinamico.com, jornalexpresso.net, jornalimigrantes.com, jrnoticias.com, maragoginoticias.com, matogrossosaude.com.br, mgnoticias.net, mundodasnoticias.net, nodiario.com, noticias9.com, noticiasdasemana.com, noticiasdiarios.com, noticiasdodia.net, noticiasdojogo.com, noticiasgoias.com, osertaoenoticia.com, pael.com.br, portalnoticiasbh.com, portalr5.com, qmiximoveis.com.br, r10noticias.com, riachonoticias.net, rsnoticias.net, rumourisnews.com, sejanoticia.com, topsulnoticias.com, tratamentodor.com.br
