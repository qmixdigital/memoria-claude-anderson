---
name: Categorias WP dos sites de hospedagem
description: Arquivo com IDs de categoria WordPress (Saúde/Geral) de todos os sites do projeto MinhasHospedagens — consultar antes de buscar nas APIs
type: reference
---

Lista completa de IDs de categoria WordPress (Saúde com fallback Geral) para os 91 sites do projeto está em:

`d:\SISTEMAS\MinhasHospedagens\categorias-wordpress-sites.txt`

Formato: `dominio | id_categoria` (uma linha por site).

**Quando usar:** sempre que o usuário pedir IDs de categoria de saúde/geral desses sites, ler esse arquivo em vez de consultar `/wp-json/wp/v2/categories` de cada site. Atualizar o arquivo se o usuário pedir nova varredura.
