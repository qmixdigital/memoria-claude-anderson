---
name: cliquex-empilhando-ponto
description: www.empilhando.com.br = 11º diretório Teste IPTV ("Ponto de Teste", claro frio papel/azul/lima, tom "roteiro em etapas"); LIVE em 2026-10-10 na conta Aluguel Sites BOL; host canônico www; fonte em D:/SITES/empilhando-ponto
metadata:
  type: project
---

**Host canônico: www.empilhando.com.br** (site antigo usava www, confirmado no Wayback; apex 301 → www). 11º diretório
Teste IPTV, marca "Ponto de Teste", publicado em 2026-10-10. Conta Cloudflare "Aluguel Sites BOL"
(37b5f07b227c4fd026187d2e86b32d0e, token master), projeto Pages `empilhando`, zona 69f254d7eb78fe06eed4cf7ed9361649.
Mesma estrutura do Farol ([[cliquex-museudalampada-farol]]) e do procrie ([[cliquex-procrie-metrica]]): ranking estático
dos 25 clientes reais ([[cliquex-provedores-clientes]]), 111 páginas de silo → home, sitemap 114 URLs, IndexNow,
playbook de segurança ([[cliquex-seguranca-playbook]]).

**Anti-footprint deste site:** tema claro frio (papel #f3f5f8, azul #143d6b, lima #c9f25c usado como marca-texto no `em`),
fontes Bricolage Grotesque + Figtree self-hosted, fundo pontilhado, hero com "ficha do roteiro" (5 etapas numeradas) e
foto em faixa larga abaixo, faixa de números em lima, ranking em linhas com quadrado de cor por nota, seção "roteiro"
em linha do tempo vertical, "ficha que decide" com checkboxes, tabela Horário nobre/Acervo/Resolução/Nota.
Conteúdo do silo com tom "roteiro em etapas" (preparar, pedir, abrir, anotar, decidir). Rating schema 4.8 / 8736.
H1 já saiu como "Teste IPTV Grátis Automático" (padrão que o usuário pediu nos 2 sites anteriores).

**Fonte:** D:/SITES/empilhando-ponto (emp_build.py → emp_finalize.py → emp_cf.py deploy; README explica). Scripts derivados
dos do Farol por `emp_derive.py`; o próximo diretório pode derivar destes.

**Gotchas:** nó de texto solto dentro de `<li>` em grid vira coluna estreita (envolver em `<span>`); `.hero .c` em grid
também pega o `.c.banda` (precisa `display:block`). Cadeia de tons já usada na rede: medição (procrie), erros e
armadilhas (Farol), roteiro em etapas (empilhando): escolher outro tom no próximo.
