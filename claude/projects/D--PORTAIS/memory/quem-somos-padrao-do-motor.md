---
name: quem-somos-padrao-do-motor
description: "O campo site.about nunca era preenchido, então dezenas de portais serviam o mesmo Quem Somos palavra por palavra"
metadata:
  node_type: memory
  type: project
---

O motor tem um texto de reserva para a página **Quem Somos**, e ele é idêntico em
todo portal que não preenche o campo:

> "portal de notícias e conteúdos atualizados sobre os assuntos que mais
> interessam aos nossos leitores"

O campo é **`site.about`** no `sites.json`, existe desde sempre e nunca era
preenchido nas conversões, porque o padrão já produz página válida e nada acusa.
É a mesma assinatura de conjunto de [[classes-css-nao-podem-repetir]] e de
[[texto-repetido-na-rede]], num lugar em que o Google procura E-E-A-T.

**Em 22/08/2026 os 16 portais da opengravity ganharam texto próprio.** Faltam
**29 dos 34 da clinicas-vps e 22 dos 28 da hostinger**. Para achar:

```bash
python3 -c "
import json
c=json.load(open('/opt/portal-engine/sites.json'))
print([s['slug'] for s in c['sites'] if not s.get('about')])"
```

⚠️ **Trocar um texto igual por N textos parecidos não resolve nada.** A conferência
que fecha o assunto é mecânica: nenhum trecho de 40 caracteres pode se repetir
entre dois portais, e nenhum título de seção pode ser o mesmo. Rodar isso como
`assert` antes de gravar, porque escrever sete textos "diferentes" na mesma
sessão produz frases repetidas sem que se perceba: aconteceu com "a assinatura de
cada texto leva para a página de quem...", em três dos sete.

Cada texto cita as editorias e as assinaturas **que existem naquele acervo**, e
linka para `/equipe/`, `/politica-editorial/` e `/contato/`.
