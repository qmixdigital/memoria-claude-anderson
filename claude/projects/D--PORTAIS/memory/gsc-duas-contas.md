---
name: gsc-duas-contas
description: "As propriedades da rede estão divididas entre duas contas Google no Search Console (u/8 e u/9), e a conta de serviço já lê todas"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-29T20:20:49.472Z
---

O Search Console da rede está repartido em **duas contas Google**, e entrar na
errada mostra a propriedade como inexistente:

- **u/9**: editaldeconcurso.net, girodasnoticias.com, manacultura.com,
  noticiasagoras.com, noticiasubuntu.com
- **u/8**: diariodegoiania.com, diariodobrejo.com, edenoticias.com, folhaum.com,
  gdsnoticias.com, jornaldebarcelos.com, jornaldiario.net, noticiasgoias.com,
  osertaoenoticia.com, portalnoticiasbh.com, projetob.net, romanceseleituras.com,
  todossomosgeek.com

O número da conta fica registrado na ficha de cada portal, em
`d:\PORTAIS\<NOME>\README.md`, seção "Search Console".

**São DUAS contas de serviço, e nenhuma cobre a rede inteira.** Descoberto em
29/08/2026, ao procurar o advivo: a `enjai` lista **89** propriedades, a
`backlinkguard` lista **88**, e `advivo.com.br` só existe na segunda. Quando uma
propriedade parecer inexistente, tentar a outra chave antes de concluir que falta
acesso. As duas chaves ficam em `C:\Users\User\Documents\APIs\`:

| conta | arquivo da chave | e-mail da conta de serviço |
|---|---|---|
| enjai | `enjai-493011-5bc78ff8f355.json` | `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` |
| backlinkguard | `backlinkguard-google-sa.json` | `backlinkguard@backlinkguard.iam.gserviceaccount.com` |

Para leitura por API não precisa escolher conta de usuário: a conta de serviço
`enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` (chave em
`C:\Users\User\Documents\APIs\enjai-493011-5bc78ff8f355.json`) já tem acesso às **68
propriedades**, incluindo todas as 18 acima. Conferi antes de pedir acesso e não
precisei pedir nada.

Sem esse dado a poda por tráfego seria no escuro: é ele que diz qual página
apareceu na busca e qual nunca apareceu. Ver [[palavras-chave-e-entrega]] e
[[poda-por-backlink-conferir-antes]].
