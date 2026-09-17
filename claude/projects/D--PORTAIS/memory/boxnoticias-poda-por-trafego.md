---
name: boxnoticias-poda-por-trafego
description: "O boxnoticias foi reduzido a 62 artigos por régua de tráfego do Search Console, e o que ficou pendente na hospedagem antiga"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T19:49:17.263Z
---

Em 15/08/2026, depois da conversão, o Anderson mandou apagar todo conteúdo **sem
link externo e sem tráfego no Search Console**. Como a conversão já tinha zerado
os links externos, a régua virou só tráfego.

Números que decidiram: dos 480 artigos vivos, apenas **52 tinham alguma impressão**
(109 impressões somadas) e **1 tinha clique**. Ele escolheu manter impressão > 0 e
**poupar os 10 artigos de Sonhos**, publicados no mesmo dia e ainda sem histórico.
Resultado: **62 artigos**, 418 apagados, todos em 410.

Regra aprendida: ao podar por tráfego, **poupar explicitamente o conteúdo novo**,
que não teve tempo de aparecer no Google, senão a poda apaga justamente o material
feito para buscar tráfego.

Também vale fazer 410 em **toda URL que o Search Console conhece** e não existe
mais, não só nas que foram apagadas agora. Havia 350 nessa situação, entre elas a
de maior tráfego histórico do site (Mega-Sena, 519 impressões), que respondia 404
por ter sido cortada na poda original de conteúdo efêmero.

## Hospedagem antiga

Os WordPress de `boxnoticias.net` e `agencianacionaldenoticias.com` foram apagados
de `hostinger-anderson-gna` (1,6 GB). **Sobraram 39 domínios na conta**, que são o
resto da rede e não foram tocados.

**Pendência:** os bancos `u400588174_awyvb` e `u400588174_4ho6i` ficaram órfãos.
Apaguei o `wp-config.php` junto com o diretório, então as senhas se perderam e a
remoção tem que ser feita pelo hPanel. Lição: **ler as credenciais do banco antes
de apagar o diretório.**

Ver [[conversao-total]] e [[poda-iptv-no-destino]].
