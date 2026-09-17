# Cross-link audit + cleanup — rede skill (9 portais)
**Data:** 2026-05-02
**Operador:** Anderson via skill wp-news-portal-fullsetup
**Modo:** `--remove --replacement=text` (strip <a>, mantém anchor text)
**post_modified:** PRESERVADO (regra 14c)

## Total
- 9 portais auditados
- 39 posts mutados
- 41 links removidos
- Backup automático em postmeta `oie_link_removed_<timestamp>` por post (reversível)

## Por portal

| Portal | Posts | Links removidos |
|---|---|---|
| adonline.com.br | 3 | 3 |
| advivo.com.br | 5 | 5 |
| cameracotidiana.com.br | 7 | 7 |
| ebookcult.com.br | 5 | 5 |
| incast.com.br | 7 | 7 |
| folhadonoroeste.com.br | 3 | 3 |
| oiempreendedores.com.br | 2 | 3 |
| viajenodetalhe.com.br | 2 | 2 |
| revistadeducao.com.br | 5 | 6 |
| **TOTAL** | **39** | **41** |

## Reversao (se necessario)
Cada post tem o original em `wp_postmeta` com key `oie_link_removed_<unix_ts>`. Restaurar:
```php
$ts = get_post_meta($id, 'oie_link_removed_TIMESTAMP', true);
$wpdb->update($wpdb->posts, ['post_content' => $ts], ['ID' => $id]);
clean_post_cache($id);
```
