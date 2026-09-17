---
name: airporttown-dados-divergentes
description: O site original do Airport Town se contradiz sobre metragens de mini galpões e escritórios; escolhas adotadas no site novo aguardam confirmação do cliente.
metadata:
  type: project
---

O WordPress original de airporttown.com.br publica metragens diferentes para o
mesmo produto em páginas diferentes. Conferido em 04/09/2026.

- **Mini galpões**: a página da categoria diz 40 m² a 300 m²; a página do AT2 diz
  40 m² a 400 m²; o AT6 diz "a partir de 150 m²". No site novo adotei **40 a 400 m²**.
- **Escritórios**: a página da categoria diz 30 m² a 400 m²; o AT2 diz 12 m² a 300 m²;
  o AT3 diz 30 m² a 400 m². No site novo adotei **12 a 400 m²** (união do que o
  próprio cliente publica, entrada mais baixa favorece o anúncio).
- **AT4**: a ficha diz ABL 11.000 m², mas o texto diz nave de "aproximadamente
  10.000 m²". Mantive os dois, como no original.
- **Lajes corporativas**: o original lista os empreendimentos como "AT2" e
  "AT3 - Atown Pq. Novo Mundo". Parque Novo Mundo é o **AT5**, não o AT3. Corrigi
  para AT2 e AT5 no site novo.

**Why:** são dados comerciais; publicar o número errado gera lead fora do perfil e
desgasta a corretagem. Não dá para resolver por inferência, só o cliente sabe.

**How to apply:** perguntar ao cliente qual metragem vale antes de trocar o DNS.
Até lá, manter as escolhas acima. Ver [[airporttown-redesign]].

## Entidade jurídica (confirmado em 04/09/2026)

O CNPJ **27.773.327/0001-52** é do *Fundo de Investimento Imobiliário - Airport
Town - FII*, não de uma operadora. Consta ativo desde **13/03/2017**, CNAE
6470-1/03, endereço registrado na Av. Pres. Juscelino Kubitschek, 1726, 19º
andar, Vila Nova Conceição, São Paulo.

- Esse endereço é o do **administrador do fundo**, não do parque. O `address` do
  schema continua em Guarulhos, e assim deve permanecer: trocar quebraria o NAP
  e o SEO local.
- **13/03/2017 é a data do fundo**, não necessariamente a da marca (uma busca
  não confirmada sugere 2003). Confirmar com o cliente antes de divulgar.
- Perfil no Google Empresas existe: CID `2675456165601328721`, coordenadas
  -23.4585832, -46.483329.
