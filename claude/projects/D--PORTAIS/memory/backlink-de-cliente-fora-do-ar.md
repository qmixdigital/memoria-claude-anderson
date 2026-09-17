---
name: backlink-de-cliente-fora-do-ar
description: link de cliente apontando para 404 não se apaga por padrão; o conserto depende de o domínio estar vivo ou morto
metadata:
  node_type: memory
  type: feedback
---

Ordem do Anderson, 22/08/2026: **"backlinks de clientes não podem ficar fora do
ar, tem que resolver isso"**. Link de cliente apontando para lugar nenhum não
entrega autoridade e ainda faz o portal linkar para o vazio.

O conserto **depende do motivo**, e são dois casos opostos:

| situação | o que fazer |
|---|---|
| domínio vivo, URL profunda em 404 | apontar o link para a **home do cliente**: preserva o backlink |
| domínio não resolve mais no DNS | **desembrulhar**: fica o texto, some a tag |

⚠️ **404 de URL profunda nunca vira remoção.** O cliente continua de pé, só mudou
o endereço da página.

⚠️ **403 e 429 não são site fora do ar**, são bloqueio de robô. Muito site
responde 403 a cliente sem `User-Agent` de navegador. Tratar isso como morto
apagaria backlink vivo: eram **361 de 1.168** na varredura da rede.

⚠️ **A prova de morte é o DNS, e não o HTTP**, e precisa de **dois resolvedores**.
Dos 265 que o resolvedor da opengravity deu como mortos, **40 estavam vivos** na
conferência pelo 1.1.1.1: 16 eram SERVFAIL, que é falha de servidor e passageira.
Só sai o que os dois concordam ser NXDOMAIN.

**Números da rede, 22/08/2026:** 6.033 URLs de cliente em 18 portais, 1.168 fora
do ar. Resolvidos **421 reapontados para a home** e **318 desembrulhados**.

**How to apply:** não entram na conta rede social, imprensa, encurtador, fonte de
dado do nicho nem portal da rede, que não são backlink vendido. Ver
[[citacao-contada-como-backlink]] e [[link-cruzado-para-portal-podado]].
