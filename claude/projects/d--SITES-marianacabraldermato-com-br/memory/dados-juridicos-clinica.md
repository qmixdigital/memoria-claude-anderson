---
name: dados-juridicos-clinica
description: "CNPJ, razão social e endereço oficial da clínica da Dra. Mariana Cabral, e o CEP inválido que o site usava"
metadata:
  type: project
---

Dados da pessoa jurídica, conferidos na Receita Federal via Serasa em 08/09/2026 e
implantados no rodapé e em JSON-LD (`mu-plugins/mc-empresa.php`, emitido em todas as
páginas):

- Razão social: **Mariana Cabral Dermatologia e Laser Ltda** (nome fantasia MCDL)
- **CNPJ 39.597.139/0001-08**, situação ativa, fundada em **28/10/2020**
- CNAE principal 8610-1/01; secundários 8630-5/01 e 8630-5/03
- Endereço: Av. T-10, Qd. 102, nº 208, Ed. New Times Square, Salas 2601 a 2605,
  **Setor Bueno**, Goiânia-GO, **CEP 74223-060**
- Telefone +55 62 3609-1900; responsável técnica CRM-GO 18691 / RQE 9360

**O CEP que o site usava, 74810-300, não existe.** O ViaCEP devolve erro para ele. Ele
estava no JSON-LD de 17 páginas e no rodapé, e foi trocado pelo 74223-060, que é o
registrado na Receita e confere com a Avenida T-10 no Setor Bueno.

**Why:** endereço divergente entre site, Google Meu Negócio e registro oficial derruba
o SEO local, e um CEP inexistente é o pior caso: nenhuma fonte externa consegue casar
a ficha do negócio.

**How to apply:** ao mexer em endereço ou telefone deste site, alterar nos três lugares
de uma vez, senão a consistência quebra: `mc-footer.php` (texto visível e link do
mapa), `mc-empresa.php` (JSON-LD sitewide) e o bloco `Physician` que está no conteúdo
das páginas. **Falta ainda o horário de funcionamento**, que não está documentado em
lugar nenhum e por isso ficou fora do `openingHoursSpecification`. Ver
[[equipamentos-da-clinica]].
