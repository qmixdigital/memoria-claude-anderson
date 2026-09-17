---
name: reference_personas_autor_avatar_rede
description: "Personas de autor são compartilhadas entre sites da rede (mesmo nome, IDs diferentes); avatar é o plugin simple-local-avatars e as páginas de autor são bloqueadas de propósito"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-17T09:23:10.049Z
---

As assinaturas dos portais são **personas reaproveitadas entre sites**. "Cristina Leroy Silva" é user ID 9 em `sabedoriaglobal.com.br` (login `cristina@lero@`), `saberdefato.com.br` (login `AustinCampbell`) e `divirto.com.br` (login `cristina@lero@`), sempre com o mesmo nome exibido. O login não diz nada sobre a persona, procurar sempre por `display_name`.

**Avatar** é o plugin `simple-local-avatars` (ativo em vários sites, faltando em outros, como o saberdefato até 17/08/2026). Aplicar por wp-cli:

```bash
AID=$(wp --path=$P media import foto.webp --title="Nome" --alt="Nome, autora do portal" --porcelain)
wp --path=$P eval "\$u=wp_get_attachment_url($AID); \$m=array('media_id'=>$AID,'full'=>\$u,'blog_id'=>get_current_blog_id());
foreach(array(32,48,64,96,128,192) as \$s){\$i=wp_get_attachment_image_src($AID,array(\$s,\$s)); \$m[\$s]=\$i?\$i[0]:\$u;}
update_user_meta(9,'simple_local_avatar',\$m);"
```

**Não estranhar a página de autor dando 301 ou 404:** o plugin `author-privacy` bloqueia o arquivo de autor de propósito (`/author/<slug>/` responde 301 nos sites da anderson e 404 no sabedoriaglobal). A conferência do avatar tem que ser feita em um **post assinado pela persona**, não na página de autor.

Fotos das personas não estão versionadas em lugar nenhum: em 17/08/2026 varri as 3 hospedagens e as pastas locais e não havia nenhum arquivo com o nome delas. Quem tem as fotos é o operador. Guardei a da Cristina em `D:\SISTEMAS\MinhasHospedagens\guest-posts-vagaautomatica\cristina-leroy-silva.webp`.

Relacionado: [[reference_receptor_antonio_kses_origem]].
