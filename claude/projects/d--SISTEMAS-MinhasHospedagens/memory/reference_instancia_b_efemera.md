---
name: reference-instancia-b-efemera
description: A segunda instancia PM2 virou efemera (so existe durante o deploy) e as armadilhas que apareceram ao migrar 19 pares
metadata:
  type: reference
---

Em 31/08/2026 a rede saiu do modelo "duas instancias PM2 ligadas 24h" para o de
**instancia B efemera**, que sobe no deploy e e desligada no fim. A regra
completa esta no CLAUDE.md; aqui ficam as armadilhas que so aparecem na pratica.

**Feito:** 6 pares no opengravity (1,84 GB, disponivel foi de 1,9 para 3,5 GB) e
13 na clinicas-vps (2,28 GB, de 1,9 para 4,0 GB). As duas estavam com menos de
300 MB livres.

**NAO feito:** os 25 pares do srv1166087. Aquela maquina tem 13 GB livres de 31,
entao nao ha pressao que justifique o risco. Alem disso `enjai` e `portuga`
moram la e estavam no incidente que o operador resolve manualmente.

Scripts em `D:\SISTEMAS\MinhasHospedagens\scripts\`: `migrar_efemero.sh` (migra
um par, com reversao automatica) e `gerar_eco_do_pm2.py` (gera ecosystem a
partir do processo vivo).

**Armadilhas encontradas:**

1. **`grep -r` nao entra em diretorio que e symlink.** `conf.d/domains` e
   symlink, e por isso os upstreams pareciam "configuracao morta que ninguem
   referencia". Usar `nginx -T`, que resolve todos os includes.
2. **Health check tem que ir pelo dominio, com `?nc=`.** O middleware desses
   apps Next devolve 403 para requisicao que nao venha do Cloudflare, entao
   `--resolve` na origem da falso negativo. E sem cache-buster, um HIT da borda
   devolve 200 com o backend quebrado.
3. **Ecosystem mentindo sobre qual app define.** O de `/var/www/skipark` definia
   `enjai` e nao tinha nenhuma entrada de skipark. Cinco apps da clinicas-vps
   nao tinham ecosystem nenhum. Sempre conferir e, se faltar, gerar a partir do
   processo vivo.
4. **Testar que o ecosystem sobe o B ANTES de remover o B.** Senao a falha so
   aparece no meio de um deploy futuro, com a principal ja parada.
5. **`skipark.com.br` responde 301 para `www`**: usar o dominio final no teste.
6. **Nao rodar `pm2 update`** no srv1166087 (86 apps): reinicia o daemon e
   derruba todos. O aviso "In-memory PM2 is out-of-date" polui o `pm2 jlist` e
   quebra o parse de JSON; contornar lendo o `pm2 list`.

Ver tambem [[reference_pm2_opengravity_pattern]] e [[reference_pm2_max_memory]].
