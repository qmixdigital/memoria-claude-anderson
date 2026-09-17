---
name: pendencia-links-quebrados
description: Auditoria de links da rede: o que ja foi corrigido em 28/08/2026 e o que ainda falta conferir
metadata:
  type: project
---

Auditoria de link interno e externo nos portais convertidos para Portal Engine.
Concluida em **28/08/2026** nas tres instancias (opengravity, hostinger-vps-srv1166087,
clinicas-vps). Metodo: ler o HTML servido e conferir cada destino interno contra
o disco, sem rede. Exato e rapido.

## Ja corrigido

**1. 280 links internos escritos sem `https://`**, em 48 portais. O href saia
como `<a href="dominio-do-proprio-portal.com">texto ancora</a>`, sem esquema,
entao o navegador resolvia como caminho RELATIVO e virava
`/categoria/slug-do-artigo/dominio.com`, que e 404. Eram links para a HOME com
texto ancora de keyword, ou seja, a estrategia de linkagem interna inteira
apontando para o vazio. Corrigido para `href="/"`. Backup em
`/root/backup-links-<timestamp>` em cada instancia.

**2. Cerca de 740 links internos apontando para caminho que nao existe.** Dois
subtipos, tratados diferente:
- o alvo EXISTE em outro caminho (link sem o prefixo de categoria, ou URL
  `/category/x/` do WordPress que a conversao renomeou) -> reapontado
- o alvo sumiu de vez (pagina apagada na conversao) -> link desembrulhado,
  mantendo o texto ancora, porque link 404 vale menos que texto puro

Backup em `/root/backup-int-<timestamp>`.

**Nenhum link para dominio de terceiro foi tocado.** A varredura confirmou zero
ocorrencias de link externo sem esquema, entao nenhum backlink vendido entrou na
correcao. Ver [[sem-link-externo-no-corpo]].

## Ainda falta

- **Paginas que nunca foram criadas, referenciadas por link.** No qmixdigital
  sobraram 42 links para 6 destinos que nao existem, entre eles
  `/comprar-backlinks` (5 links), que e pagina COMERCIAL da venda de backlink,
  e cinco ferramentas citadas nos cards de "ferramentas relacionadas"
  (contador-de-caracteres, minificar-json, gerador-de-headlines,
  maiuscula-e-minuscula, gerador-de-url-amigavel). NAO foram removidos de
  proposito: sao intencao declarada, e a decisao de criar a pagina ou tirar o
  card e do Anderson.
- **`desentupidoras.pro` (plural) nao resolve DNS: dominio morto, com 82 links
  externos apontando para ele.** O `desentupidora.pro` (singular) responde 200.
  Ou e erro de digitacao, ou o dominio expirou. `drluizteixeirajunior.com.br`
  resolve mas a home da 404, com 6 links. NENHUM foi tocado: link externo pode
  ser backlink vendido. Ver [[sem-link-externo-no-corpo]].
- Ao conferir link externo por HTTP, separar bloqueio de bot de link morto: 403
  de mayoclinic, OLX, pixbet e escavador funcionam para o usuario. So conta como
  quebrado o que da erro de conexao, DNS, 404 ou 410.

**Why:** ele vende backlink, entao link externo nunca se remove sem conferir se
foi vendido. Link interno quebrado, ao contrario, so custa autoridade e pode ser
corrigido em lote sem risco.

**How to apply:** os scripts ficam em `/tmp/audita_links.py` (auditoria),
`/tmp/fix_links.py` (href sem esquema) e `/tmp/fix_int2.py` (reaponta e
desembrulha) em cada instancia. Todos rodam em simulacao por padrao e so
alteram com `--aplicar`. Depois de aplicar, reconstruir com
`rebuildIndexes(cfg, site)` para todos os sites. Ver tambem
[[title-cortado-mata-ctr]].
