---
name: jsonld-armadilhas-medicas
description: "Referência @id não resolve entre <script> separados, MedicalSpecialty não tem Orthopedic nem Orthopedics (é Musculoskeletal) e MedicalClinic não aceita campo de documento"
metadata:
  node_type: memory
  type: reference
  originSessionId: ada82c56-8b44-4e1c-855b-85dd32df4222
  modified: 2026-09-28T12:02:37.072Z
---

Três erros de JSON-LD que o Search Console acusou no ombrogoiania em
27/09/2026 e que valem para qualquer site médico da rede. Os três passam no
`json.loads`, aparecem no HTML e não dão sinal nenhum no navegador.

**1. Referência por `@id` não atravessa `<script>`.** Cada bloco
`application/ld+json` é um documento separado. Um `"mainEntity": {"@id":
"...#medico"}` num script e o nó `#medico` em outro script da mesma página
deixa a referência pendurada, e o Google responde *"o tipo de objeto do campo
mainEntity não é válido"*. Quem referencia e quem é referenciado precisam ir
no mesmo `@graph`.

Vale conferir com este lint, que pega o caso em qualquer página:

```python
# dentro de cada <script>: todo {"@id": X} sozinho precisa achar
# um nó com @id == X e @type definido no MESMO script
```

**2. `Orthopedic` e `Orthopedics` não existem no enum `MedicalSpecialty`.**
O vocabulário tem 44 valores e o de ortopedia é **`Musculoskeletal`**. Não há
valor para medicina esportiva: o que não couber vai para `knowsAbout`, que
aceita texto livre. A lista autoritativa sai de
`https://schema.org/version/latest/schemaorg-current-https.jsonld`, filtrando
os nós cujo `@type` é `MedicalSpecialty`. O validador só reclama de
`specialty`; em `medicalSpecialty` ele às vezes cala, mas o valor continua
errado.

**3. `MedicalClinic`, `Physician` e afins são lugar/organização, não
`CreativeWork`.** `inLanguage`, `lastReviewed`, `datePublished`,
`dateModified`, `abstract` e `speakable` neles saem como `UNKNOWN_FIELD`.
Esses campos descrevem a PÁGINA e pedem um nó `MedicalWebPage` à parte, com
`about` apontando para o consultório, os dois no mesmo `@graph`.

**Como validar sem publicar:** `POST https://validator.schema.org/validate`
com `html=<pagina inteira>` em form-urlencoded; a resposta vem com o prefixo
`)]}'` na frente do JSON. Ele limita requisição por minuto, então espaçar em
5 a 10 segundos e checar uma página de cada tipo, não todas.

**Why:** o JSON-LD é válido como JSON e inválido como schema, então só o
Search Console avisa, semanas depois, e o rich result já ficou de fora esse
tempo todo.

**How to apply:** rodar o lint das três classes antes de publicar mudança de
schema. Ver [[trafego-concentrado-no-blog]] para o contexto do site.
