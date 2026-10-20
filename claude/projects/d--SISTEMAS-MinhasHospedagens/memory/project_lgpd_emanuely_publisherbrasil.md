---
name: lgpd-emanuely-publisherbrasil
description: Pedido LGPD de remoção da ficha Emanuely Oliveira Moreira (CNPJ 46410720000126) do diretório de editoras do publisherbrasil; como foi bloqueada sem ter o projeto-fonte
metadata:
  type: project
---

Em 19/10/2026 atendido pedido LGPD (recebido 16/10 pelo formulário editoras.publisherbrasil). O diretório /editoras/ do publisherbrasil.com.br é servido por um Worker de assets estáticos `publisherbrasil-editoras` (conta Publisherbrasil@outlook.com, aee94c57...), cujo projeto-fonte NÃO está em D:/SITES, D:/PORTAIS, D:/GitHub nem nas 3 VPS (procurado, não achar de novo). Solução sem o fonte: (1) regra de redirect da zona (301 para /editoras/) para a ficha emanuely-oliveira-moreira-46410720000126; (2) Worker `lgpd-lencois-paulista` na rota publisherbrasil.com.br/editoras/sp/lencois-paulista/* servindo a página da cidade com o card dela removido, JSON-LD renumerado e contador 9→8.

**Why:** titular pediu remoção de dados do CNPJ; prazo LGPD.
**How to apply:** se o fonte do diretório for localizado ou regenerado, remover o CNPJ lá, depois apagar a regra de redirect e o Worker/rota `lgpd-lencois-paulista` (senão a página da cidade fica congelada). Ainda sem resposta ao titular (emanuelyom@gmail.com): confirmar a remoção por e-mail é com o operador. Contador da página do estado /editoras/sp/ ainda mostra 14 para Lençóis (inclui outros tipos, não identifica a pessoa).
