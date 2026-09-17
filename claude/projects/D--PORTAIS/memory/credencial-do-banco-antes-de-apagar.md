---
name: credencial-do-banco-antes-de-apagar
description: "Apagar o public_html leva o wp-config.php junto, e sem ele o banco fica órfão: guardar DB_NAME, DB_USER e DB_PASSWORD antes"
metadata:
  node_type: memory
  type: feedback
---

Ao desligar o WordPress de origem, a ordem importa. Apagar o `public_html` leva o
`wp-config.php` junto, e **a senha do banco vai com ele**. O banco continua de pé
na hospedagem, sem nada apontando para ele, e derrubá-lo passa a exigir o painel.

Aconteceu no cameracotidiana em 22/08/2026: o banco `u400588174_N3L85` ficou
órfão. É a mesma pendência já registrada em
[[boxnoticias-poda-por-trafego]], e é assim que ela nasce.

**How to apply:** antes de qualquer `rm -rf`, guardar as três constantes num
arquivo à parte, junto do dump:

```bash
php -r '$c=file_get_contents("wp-config.php");
foreach (["DB_NAME","DB_USER","DB_PASSWORD","DB_HOST"] as $k) {
  preg_match("/".$k."[^,]*,\s*.([^\x27\"]+)/", $c, $m); echo $k."=".$m[1].PHP_EOL; }'
```

Guardar também o `wp-config.php` inteiro no pacote de backup.

Detalhes que custaram tentativas nessa hospedagem:

- `wp db export` sai com **exit 255 e nenhuma mensagem**. Usar `mysqldump` direto.
- `mysqldump --defaults-file=<(...)` falha com *Could not open required defaults
  file: /dev/fd/63*: substituição de processo não serve, o cliente quer arquivo de
  verdade. Escrever um `.my.cnf` com `chmod 600`, usar
  `--defaults-extra-file=`, e apagar depois.

Derrubar o banco continua exigindo confirmação do Anderson: `DROP` está na lista
de operações que não são autônomas.
