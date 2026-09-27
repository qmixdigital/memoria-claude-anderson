---
name: faixa-equipe-korpem-rodape
description: Faixa "Equipe Körpem" no rodapé dos 7 sites da rede Körpem (6 médicos + clínica): estrutura, política de nofollow e o que trocar quando novos sites nascerem
metadata:
  type: project
---

Definido com o Anderson em 20/09/2026. Entre as colunas do rodapé e a linha de copyright, `nav.foot-net` com a lista da equipe, em todas as páginas.

- Sites de médico: título "Equipe Körpem Ortopedia e Saúde"; clínica (`https://korpem.com.br/`) **dofollow** (relação real, a clínica é o hub); colegas com `rel="nofollow noopener"`; exclui o próprio médico.
- Site da clínica: título "Conheça os sites de nossos especialistas" (o Anderson vetou "Nossos especialistas" porque a aba Corpo Clínico já lista os médicos); lista SÓ quem tem site, dofollow, sem link para os demais até nascerem. Hoje: Henrique e Eduardo.
- Ordem: Guilherme Gontijo (coluna), Henrique Cembranelli (mão e punho, www.henriquecembranelli.com), Eduardo Cembranelli (pé e tornozelo, dreduardocembranelli.com sem www), João Lopo (quadril), Gabriel Mendes Miura (joelho), Bernardo Catão Queiroz (ombro e cotovelo). Os quatro sem site apontam para `korpem.com.br/dr-<slug>` até terem domínio: trocar nos 3 sites quando nascerem (script `foot_net.py` da sessão fazia isso; a lista TEAM está lá).
- Sites existentes: henriquecembranelli.com (este chat), dreduardocembranelli.com (outro chat, avisado no CLAUDE.md), korpem.com.br (repo qmixdigital/korpem.com.br, preview korpem-preview).

**Why:** 7 domínios na mesma hospedagem linkando entre si sitewide e dofollow parece rede de links; hub dofollow + colegas nofollow mantém o sinal legítimo e evita o padrão.
**How to apply:** ao criar o site de um novo médico da Körpem, incluir a faixa igual e atualizar o link dele nos outros seis. Ver [[credito-qmix-rodape]] e [[projeto-henriquecembranelli]].

**TEMPORÁRIO (20/09/2026):** todos os links entre os 3 sites apontam para os previews `*-preview.pages.dev` para o Anderson navegar entre as versões novas; reverter para os domínios reais na virada de DNS (nota nos README/CLAUDE.md de cada repo).
