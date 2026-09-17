---
name: registro-de-donos-de-slug
description: "O motor barra slug já usado em outro portal e ainda assim devolve HTTP 201, o que faz a publicação parecer bem-sucedida"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-17T08:40:05.404Z
---

O portal-engine mantém um registro de donos de slug em toda a rede e recusa publicar
um slug que já pertença a outro portal. A recusa é silenciosa do lado do cliente:
a API responde **HTTP 201 com `success:true` e a URL montada**, exatamente como numa
publicação real. Nada é gravado em `data/` nem em `public/`, e a página fica 404.

A única evidência é o log do motor:

```
journalctl -u portal-engine --since "5 min ago" --no-pager | grep -E "publicado|pulado/dup|sem mudanca"
# [noticiasdodia] pulado/dup (dono: mgnoticias): como-molhar-um-bolo
```

**Como aplicar:** não confiar no 201. Antes de escrever, conferir os slugs contra o
registro real, reconstruído a partir dos servidores e não a partir de cópia local:

```js
// em clinicas-vps, gera /tmp/owners.json com os ~2.800 slugs da instância
const cfg = JSON.parse(fs.readFileSync("/opt/portal-engine/sites.json", "utf8"));
for (const s of (Array.isArray(cfg) ? cfg : cfg.sites))
  for (const f of fs.readdirSync(cfg.sitesRoot + "/" + s.slug + "/data"))
    owners[f.slice(0, -5)] = s.slug;
```

O `owners_atual.json` do scratchpad envelhece dentro da mesma sessão, porque cada
lote publicado acrescenta 10 slugs. Regerar a cada domínio novo, não a cada dia.
Mesma lição de [[archs-local-desatualizado]]: cópia local da rede é sempre suspeita.

Se um slug for barrado depois da publicação do lote, não basta trocar o artigo:
os links internos dos irmãos que apontavam para ele viram 404 e precisam ser
reapontados e republicados, como em [[apagar-artigo-checar-links]].

**O registro é por instância, não pela rede toda.** `dedupPath()` aponta para
`<sitesRoot>/_dedup/owners.json`, e cada servidor tem o seu. Em 18/08/2026:
`opengravity` e `clinicas-vps` têm o arquivo; a **hostinger-vps-srv1166087 não tem**,
ou seja, a guarda nunca foi acionada lá e slug repetido entre portais dessa máquina
passa sem aviso nenhum. Nessa instância a conferência é manual, contra
`ls /srv/portais/*/data/*.json`. Ver [[tres-instancias-do-motor]].

Consequência prática: um slug usado em portal da clinicas-vps continua livre na
hostinger e na opengravity, e isso é intencional, porque
[[palavras-chave-e-entrega]] permite reusar a mesma palavra-chave em domínio
diferente.
