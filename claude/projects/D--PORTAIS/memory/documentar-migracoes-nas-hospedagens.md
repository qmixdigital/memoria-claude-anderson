---
name: documentar-migracoes-nas-hospedagens
description: Regra permanente do Anderson - toda migração de tecnologia ou hospedagem precisa ser documentada em D:\SISTEMAS\MinhasHospedagens
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T19:53:41.047Z
---

**Sempre que um site mudar de tecnologia ou de hospedagem, atualizar
`D:\SISTEMAS\MinhasHospedagens` no mesmo trabalho.** Não é passo opcional nem
"depois": faz parte da migração.

O que atualizar, nesta ordem:

1. **`SITES-MIGRADOS.md` na raiz** — índice criado em 15/08/2026. É o primeiro
   arquivo que qualquer um deve ler ao trabalhar nessa pasta. Tem a tabela
   "era / virou / onde está agora / quando / ficha".
2. **Ficha do site**, uma por domínio, na pasta do servidor de destino
   (ex.: `clinicas-vps/boxnoticias.net.md`). Formato: onde está hoje, onde ficava
   antes, o que foi feito, estado atual, cuidados.
3. **README da hospedagem de origem** — tirar o domínio da lista corrida, corrigir
   a contagem, marcar a linha da tabela como migrado e apontar para a ficha.

**Why:** o Anderson trabalha nessa pasta com IA. Se a documentação disser que o
site é WordPress numa hospedagem que ele já não ocupa, a IA vai procurar wp-admin,
wp-cli e banco que não existem, e perder tempo ou quebrar coisa.

**How to apply:** deixar explícito na ficha o que **deixou de existir**, não só o
que passou a existir. A frase que resolve é "não procure wp-admin, wp-cli ou banco:
não existem". Ver [[conversao-total]] e [[boxnoticias-poda-por-trafego]].
