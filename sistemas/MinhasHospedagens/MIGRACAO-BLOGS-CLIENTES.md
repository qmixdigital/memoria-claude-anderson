# Migração dos Blogs de Clientes — PENDENTE (fazer depois)

> Decidido em 2026-06-22: **adiar** a migração. Documentado para retomar.
> ⚠️ **MÉTODO CORRETO = mover o WordPress COMPLETO (WP→WP).** NÃO converter para portal-engine.

## O que é (e o que NÃO é)

São **5 blogs WordPress de clientes** (médicos/profissionais) hoje no **opengravity** que o dono quer mover para o **srv1166087.hstgr.cloud**, **continuando WordPress** (arquivos + banco + tema + plugins + wp-admin).

- ✅ **Mover o WordPress inteiro, intacto** (WP→WP). Cliente continua gerenciando pelo wp-admin.
- ❌ **NÃO** transformar em portal-engine / site de conteúdo estático. (Em 2026-06-22 comecei errado por aí, convertendo p/ portal-engine — foi desfeito por inteiro. Não repetir esse erro.)
- Como o **domínio não muda**, é movimentação limpa: **não precisa reescrever URLs**; só mover arquivos + banco e ajustar credenciais de DB no `wp-config.php`.

## Inventário (origem: opengravity, HestiaCP user `qmix`, `/home/qmix/web/<dominio>/public_html`)

| Blog (domínio) | Posts | Pages | Tamanho | Nicho | Permalink |
|---|---|---|---|---|---|
| blog.ombrogoiania.com.br | 218 | 1 | 178M | Ortopedia (ombro) | /%postname%/ |
| blog.drthiagotredicci.com.br | 185 | 3 | 175M | Cirurgia digestiva | /%postname%/ |
| blog.drtiagobernardes.com.br | 127 | 2 | 339M | Ortopedia (quadril/coluna) | /%postname%/ |
| blog.camilafarias.com.br | 72 | 4 | 320M | Endocrinologia | /%postname%/ |
| blog.nutricionista.digital | 29 | 2 | 365M | Nutrição | /%postname%/ |

Total ~1,4GB de arquivos + bancos. REST API acessível em todos (peritodicas.com NÃO entra — **não é blog**, o dono confirmou).

## Destino (srv1166087) — pronto para WordPress

HestiaCP **SIM** · MariaDB **ativa** · PHP **8.3** · Apache **ativo** · disco **291G livres** · IP de cutover **31.97.173.40**.
Usuários HestiaCP existentes: `boot` (plataforma Antônio — NÃO misturar), `qmix2`, `user`.
**PENDÊNCIA DE DECISÃO:** hospedar na conta `qmix2` existente ou criar conta nova (ex.: `qmixblogs`)? (não definido)

## Cloudflare — cada blog está numa CONTA separada

Tokens na pasta `D:\SISTEMAS\Cloudflare` (contas.json) + alguns enviados no chat 2026-06-22. Permissão necessária p/ cutover: `Zone › DNS › Edit` + `Zone › Zone › Read`.

| Blog | Account ID (CF) | Zone ID | Token |
|---|---|---|---|
| nutricionista.digital | 2ff4c5d06407622c756c5b57c46924a5 | 35864400965d655bbc4fe802cb2e4aa1 | contas.json → conta23 (`cfat_SAdZ…`) |
| drthiagotredicci.com.br | 862514f37ef20f4575c631621a1dd750 | 0bb4d69d99b4eb3bb98dd6cde6247cf4 | contas.json → conta16 (`cfat_s35I…`) |
| ombrogoiania.com.br | b7827330baf3a3a92f02972b89523639 | 273d1aeb06ffda98885f0879303a11e5 | `<<REMOVIDO>>` |
| drtiagobernardes.com.br | f5e8c0bf0ca55ddb3d1b80711dd23b8b | 33fbc91ab385e29bd5c2f1294110b776 | `<<REMOVIDO>>` |
| camilafarias.com.br | 4fbcec751a6a97c33b2a8d6ce2b5fac5 | (consultar) | `<<REMOVIDO>>` |

(Os 5 tokens foram validados em 2026-06-22, exceto a zona da camila que ficou sem consultar. Se algum expirar, regenerar no dashboard da conta CF correspondente.)

## Runbook por blog (WP→WP)

1. **Backup** do blog no opengravity (HestiaCP `v-backup-user qmix` ou export manual de arquivos+DB) — rede de segurança.
2. No **srv1166087/HestiaCP**: criar web domain + database para `blog.<dominio>` (na conta definida).
3. `rsync` de `/home/qmix/web/<dominio>/public_html` (opengravity → srv1166087).
4. Dump do DB no opengravity (`wp db export`) → import no srv1166087.
5. Ajustar `wp-config.php` no destino (DB name/user/pass/host). **Sem search-replace de URL** (domínio igual).
6. **Testar pela origem** (WP antigo ainda no ar): `curl -H "Host: blog.<dominio>" http://31.97.173.40/` (ou via /etc/hosts local).
7. **Cutover DNS** no Cloudflare: A `@`/`blog` → `31.97.173.40` (proxied), usando o token do blog. SSL Full/Flexible conforme o vhost.
8. Validar no ar (wp-admin, posts, imagens) → **descomissionar** o WP antigo no opengravity.

## Armadilhas a lembrar
- NÃO converter p/ portal-engine (erro de 2026-06-22).
- Conferir `/etc/hosts` do srv1166087 (armadilha conhecida — ver PRUNING/portal-engine docs) caso algum domínio resolva errado localmente.
- Cada blog é conta Cloudflare separada → usar o token certo por domínio.
- São sites de CLIENTES — manter wp-admin/tema/plugins; backup antes de mexer.
