---
name: reference_wordfence_basic_vs_extended
description: "Wordfence em Basic Protection não vê PHP avulso (só roda depois do WP) — foi por isso que não pegou o backdoor do euvo. Toda a rede está em Basic. .user.ini NÃO funciona na Hostinger; usar php_value no .htaccess."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

**Por que o Wordfence não pegou o backdoor do euvo (abr–jul/2026), e por que isso vale para a rede toda.**

O Wordfence tem dois modos. Em **Basic Protection** o WAF é um **plugin**: só roda **depois** que o WordPress carrega. Um PHP avulso acessado direto por URL (`wp-content/languages/plugins/lib/indexx.php`) **nunca carrega o WP**, logo o Wordfence **nunca é executado**. Ele não falhou — nunca foi chamado. Em **Extended Protection** ele entra por `auto_prepend_file` e roda **antes** do WP, em toda requisição PHP.

**Como detectar:** existe `wordfence-waf.php` na raiz do site?
- não existe → **Basic** (cego para PHP avulso)
- existe → Extended

**Estado da rede (15/07/2026):** euvo, `adonline.com.br` e `azulmagazine.com.br` estavam **todos em Basic**. Provavelmente a rede inteira. Só o **euvo** foi corrigido.

⚠️ **`.user.ini` NÃO FUNCIONA na Hostinger** (LiteSpeed + CloudLinux alt-php): `user_ini.filename` vem **vazio** no SAPI web. É o mecanismo padrão do Wordfence, então o botão "Optimize the Wordfence Firewall" do painel pode não resolver. Conferir com um probe PHP temporário lendo `ini_get('user_ini.filename')` **pela web** (o CLI mostra config diferente e engana).

✅ **O que funciona: `php_value auto_prepend_file "/caminho/wordfence-waf.php"` no `.htaccess`.** Testado e ativo no euvo. Vantagem sobre `.user.ini`: vale na hora, sem os 300s de `user_ini.cache_ttl` — reversão instantânea.

**Receita segura (eu derrubei o euvo por ~2min ignorando a ordem):**
1. Gerar `wordfence-waf.php` (escrever local e transferir; **heredoc pelo ssh corrompe o PHP**).
2. `php -l` no arquivo. **Só avançar se passar.**
3. Testar o arquivo REAL numa **subpasta isolada** com `.htaccess` próprio apontando para ele. Se a subpasta responde 200 e `class_exists('wfWAF')` é true, o arquivo é seguro.
4. **Só então** pôr o `php_value` no `.htaccess` da raiz.
5. Testar; se 500 → tirar a linha **e purgar o LiteSpeed** (ele cacheia o 500 e a home continua caindo mesmo depois da reversão).

**Prova de que funcionou:** probe PHP na raiz devolvendo `WordPress carregou: NAO` + `WAF do Wordfence: ATIVO`.

`wafStatus: 'enabled'` (não learning-mode) já estava certo — o problema era só o modo Basic. Teste de SQLi via `?s=` é **falso negativo**: é só termo de busca, o WP parametriza e o Wordfence não marca.

Relacionado: [[reference_incidente_euvo_backdoor]], [[reference_euvo_redesign_neve]].
