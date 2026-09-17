---
name: dominios-vao-em-projetos
description: Regra padrão para adicionar domínios no QMIX Indexation — qualquer URL enviada sem categoria explícita vai em Projetos
metadata:
  type: feedback
---

Quando o user manda apenas uma URL (ou lista de URLs) sem especificar categoria no QMIX Indexation, **adicionar em Projetos** por padrão.

**Why:** o user está gerenciando muitos sites novos e quase todos são projetos internos. Portais/Clientes ele especifica quando precisa. Assumir Projetos evita perguntar toda vez.

**How to apply:**
1. Ler `d:\SISTEMAS\APP INDEXAÇÃO\domains.json`
2. Adicionar dentro do array `domains` da categoria "Projetos"
3. Rodar `bash deploy.sh` no diretório
4. Rodar `ssh opengravity 'cd /var/www/qmix-indexation-api && node domains-sync.js && node generate-status.js'`
5. `git add domains.json && git commit -m "feat: adicionar X em Projetos" && git push`

Remover `www.` do domínio antes de inserir (o filtro `site:` do Google funciona sem prefixo).

Se o user disser explicitamente "portais" ou "clientes", vai nessa categoria.

Ver [[qmix-indexation-arquitetura]] para contexto do projeto.
