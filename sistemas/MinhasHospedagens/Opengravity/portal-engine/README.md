# Motor (portal-engine) — cópia de 28/08/2026

Cópia fiel de `/opt/portal-engine/` deste servidor, feita em 28/08/2026.

## Por que esta pasta existe

A única cópia local do motor era `scripts/portal-engine-opengravity/render.js`,
de **26/07/2026, com 53.633 bytes**. Os servidores rodavam entre 118 KB e 140 KB.
Ou seja, um mês inteiro de correções existia **só na máquina**, sem cópia fora
dela, e um disco perdido levaria tudo junto.

O risco não é só o de perder. É o de **reverter sem perceber**: o deploy de
arquitetura lê o `archs.js` local e sobrescreve o do servidor. Com o local
desatualizado, o próximo deploy apaga tudo o que foi corrigido no servidor, e
nada acusa o problema até alguém abrir a página.

## Regra

Antes de qualquer deploy de arquitetura, **puxar do servidor para cá**, editar
aqui e mandar de volta. Nunca o contrário.

## Arquivos

| arquivo | o que é |
|---|---|
| `render.js` | montagem da página, schema, anti-footprint, auto-linkagem |
| `archs.js` | as arquiteturas visuais e o CSS de cada uma |
| `receiver.js` | recebimento de conteúdo da plataforma do Antônio |
| `tokens.js` | paletas, fontes e medidas |
| `sites.json` | configuração de cada portal. **Contém apikey**, não subir para repositório público |
