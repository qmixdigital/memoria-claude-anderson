---
name: arch-x-agoranoticias
description: A arquitetura X passou a ser usada pelo agoranoticias, e o widget de WhatsApp que denuncia domínio de IPTV
metadata:
  type: project
---

**A letra X está em uso.** Arquiteturas A até X ocupadas; a próxima livre é a
**Y**. A X é do `agoranoticias.net`: violeta-tinta com âmbar, Syne no display e
Spectral no corpo, cabeçalho de dois andares, manchete deitada 5/7, editoria em
cartão grande mais pilha, e o trilho do artigo à **esquerda**.

Fonte única: `d:\PORTAIS\AGORANOTICIAS\infra\arch-X.js`, com
`deploy-arch-X.js` ao lado. Ver [[arch-local-e-fonte-unica]].

## O widget de WhatsApp entrega a rede de IPTV

Classificar domínio contando menções a IPTV na home quase falhou aqui: **23
domínios marcaram exatamente 3**, e o corte de 8 do runbook os trataria como
limpos. Os três casos eram sempre o mesmo widget de WhatsApp, com o **mesmo
número (`5598935000865`)** e a mesma frase "Gostaria de um teste de IPTV
gratuito".

**Regra nova:** domínio com qualquer menção a IPTV na home é funil de IPTV. Site
real marca **zero**, não três. Patamar idêntico repetido em muitos domínios é
assinatura de template compartilhado, então vale olhar o trecho que casou antes
de decidir. Foram 34 de 64 domínios, contra 10 pelo critério antigo.

Relacionado: [[iptv-tres-vetores]], [[conversao-total]],
[[classes-css-nao-podem-repetir]]
