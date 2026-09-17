# sejanoticia.com

**Ainda em WordPress.** Apesar de constar na lista de convertidos, a conferencia
mostrou WordPress ativo servindo o dominio: o HTML entregue traz referencias a
`wp-content`, existe `wp-config.php` na pasta e o `wp-cli` responde normalmente.

## Onde vive

| | |
|---|---|
| Servidor | Hostinger Cloud Professional (VPS1) |
| IP de origem | `92.113.35.186` |
| Acesso | `ssh hostinger-vps1` |
| Frente | Cloudflare, proxied |
| Tamanho em disco | 1,0 GB |
| Banco | `u651115354_sp80v` |

## WordPress

| | |
|---|---|
| Versao | 7.0.4 |
| Posts publicados | **2964** |
| Tema ativo | `daybreak-folio` |
| Plugins ativos | litespeed-cache, wp-seopress, xml-sitemap-feed |
| Permalink | `/%postname%/` |
| `category_base` | `categoria` |

## Para converter

O permalink e `/%postname%/`, que e o formato que a conversao preserva sem
perder backlink. O `category_base` e `categoria` e tem que ser copiado LITERAL, com
a mesma caixa, senao toda URL de editoria quebra.

A conversao segue o mesmo caminho dos 30: inventario pela REST API, poda por
trafego e backlink, importacao pelo endpoint do motor, esteira de correcao,
blocos de 410 no nginx e virada de DNS na Cloudflare. O runbook esta em
`D:\PORTAIS\CONVERSAO-TOTAL.md`.

Antes de comecar, confirmar o namespace da API no ar: o CSV do Antonio errou o
namespace em 13 dos 20 dominios do lote anterior, e so a verificacao ao vivo pega.
