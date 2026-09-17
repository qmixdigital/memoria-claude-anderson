---
name: lgpd-some-em-paleta-escura
description: o botão "Aceitar todos" fica preto sobre preto quando a primária do portal é escura
metadata:
  type: project
---

O banner de LGPD do motor tem **fundo fixo em `#111`** e pintava o botão de
aceitar com `theme.primary`. Em portal de paleta preta (o matogrossosaude usa
`#111111`, que é a cor do logotipo) o botão fica **preto sobre preto**: existe, é
clicável e é invisível.

**Why:** nenhuma auditoria de HTML pega, porque o elemento está lá com o texto
certo. Só a captura de tela mostra. É o mesmo padrão de
[[rodape-com-var-ink-em-paleta-escura]]: cor tirada de um token sem conferir
contra o fundo em que ela vai cair.

**How to apply:** corrigido em 24/08/2026 na opengravity e na
hostinger-vps-srv1166087 (`_lgpd` no `render.js`), onde a cor passa a sair por
contraste com o próprio fundo do banner, caindo para `vivid` e depois para branco
com texto escuro. A **clinicas-vps tem outra implementação** do banner, que já
usa `#fff` fixo, e não tem o defeito. O patch está em
`D:\SISTEMAS\MinhasHospedagens\Opengravity\patch_lgpd.py`.
