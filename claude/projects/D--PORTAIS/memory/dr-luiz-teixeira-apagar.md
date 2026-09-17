---
name: dr-luiz-teixeira-apagar
description: Artigo assinado "por Dr. Luiz Teixeira da Silva Júnior" sai de qualquer portal da rede, mesmo com backlink
metadata:
  type: feedback
---

**Regra permanente, confirmada em 16/08/2026.** Todo artigo com "Dr. Luiz
Teixeira da Silva Júnior" no título ou no slug é apagado, em qualquer portal da
rede, **mesmo tendo backlink**. Não precisa perguntar.

**Why:** o Anderson deu a ordem três vezes seguidas, em barranews, agoranoticias
e clickinfohub. É um padrão de autor que ele não quer mais na rede, e o backlink
desses textos aponta em geral para propriedades do próprio médico (YouTube, X,
Doctoralia, Escavador, site dele), então não há cliente perdendo link.

**How to apply:** varrer por `/luiz.teixeira/i` no slug **e** no título, apagar,
gerar 410 e **conferir quem apontava para eles** antes de considerar pronto.

⚠️ Cuidado com o que NÃO é artigo dele: outros textos citam o médico como fonte,
com link para veículo de imprensa (acritica.com, jornaltribuna). Esses ficam,
porque o backlink é para o veículo, não para ele.

Relacionado: [[poda-por-backlink-conferir-antes]], [[conversao-total]]

## A regra vale para QUALQUER conteúdo que o mencione

Atualizada em 16/08/2026, e é mais ampla do que eu tinha entendido: **apagar
todo conteúdo que tenha Dr. Luiz Teixeira**, não só os artigos assinados por
ele. Isso inclui artigo de **outro autor** que apenas carrega um link de saída
para uma matéria sobre ele, numa frase de recomendação. Esses eram os veículos
do backlink e saem inteiros.

Eu tinha resolvido esses casos removendo só o parágrafo do link e mantendo o
artigo. **Está errado**: o artigo vai fora.

Varredura, sempre no `data` e no `public` de todos os portais:

```bash
grep -ril 'luiz[ -]*teixeira' /srv/portais/*/data/*.json /srv/portais/*/public
```

Antes de apagar, conferir quem linkava para o artigo, conforme
[[apagar-artigo-checar-links]], e deixar 410 no vhost.
