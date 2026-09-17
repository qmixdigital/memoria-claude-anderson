# Cloudflare — credenciais e ferramentas da rede

## ⚠️ `.token_master` é a chave de maior poder da operação

O arquivo `.token_master` (mesmo valor de `CF_USER_TOKEN` no `.env`) é um token
de **usuário**, não de conta. Medido em 20/08/2026:

| | |
|---|---|
| Contas visíveis | **78** |
| Zonas visíveis | **473** |
| Permissões | Zone:Read, **Zone WAF:Edit**, Zone Settings, Bot Management |

Uma única chave com **escrita em WAF em 473 zonas**. É mais poder que qualquer
outro segredo desta operação, incluindo as senhas de VPS: com ela dá para
derrubar ou expor a rede inteira em minutos.

### Em caso de suspeita de vazamento: ROTACIONAR IMEDIATAMENTE

1. `dash.cloudflare.com` → **My Profile → API Tokens**
2. localizar o token e **Roll** (gera valor novo, invalida o antigo na hora) ou
   **Delete** se for recriar do zero
3. atualizar `.token_master` e `CF_USER_TOKEN` no `.env`
4. atualizar a entrada `master` em `contas.json`:
   ```bash
   cd "D:/SISTEMAS/GOOGLE NEWS DISCOVERY"
   python scripts/registrar_token.py --conta master --token <NOVO> --gravar
   ```
5. auditar o que foi feito com a chave vazada: **Audit Logs** de cada conta
   afetada, filtrando por `Firewall Rules` e `Rulesets` no período

Não há como limitar o estrago depois: o token não tem filtro de IP nem TTL.
Rotacionar é a única contenção.

### Arquivos com segredo nesta pasta

| Arquivo | Conteúdo | ACL |
|---|---|---|
| `.token_master` | o token de usuário | restrito ao usuário (`icacls /inheritance:r`) |
| `contas.json` | 34 tokens por conta **+ o master** | restrito ao usuário |
| `.env` | `CF_USER_TOKEN` (vivo), chaves R2 | restrito ao usuário |

`CF_API_TOKEN` e `CF_API_TOKEN_TESTE` no `.env` estão **expirados** desde antes
de 20/08/2026 (`Invalid API Token`, conferido pela API). Ficaram comentados e
marcados, não apagados, para preservar o histórico de qual conta usavam. Não
perca tempo testando os dois.

## 📌 Melhoria registrada, sem prazo: voltar ao menor privilégio

**Decisão de 20/08/2026:** adotar o master venceu por praticidade — ele
destravou 71 domínios que estavam invisíveis, com um comando, e cancelou a
regeneração de 4 tokens. A concentração de risco foi aceita conscientemente.

**Quando a operação estabilizar, avaliar o desenho de menor privilégio:**

- recriar o master como token **somente leitura**, para auditoria
  (`auditar_zonas_cf.py`, inventário, diagnóstico)
- voltar aos **tokens por conta** para qualquer operação de **escrita**
  (`cloudflare_skip_motor.py`, mudança de WAF, settings)

Isso reduz a superfície: a chave de uso diário deixa de poder alterar nada, e a
de escrita fica com alcance de uma conta por vez. O custo é manter 34 tokens
válidos em vez de um, que foi exatamente o problema que levou ao master.

Sem prazo. Reavaliar quando o motor de pautas estiver em regime e a rampa dos
150 portais tiver terminado.

## Cobertura hoje

| | |
|---|---|
| Domínios da rede catalogados | 113 |
| Cobertos (via master) | **112** |
| Fora de alcance | 1 — `incast.com.br`, conta de terceiro |

Auditoria: `GOOGLE NEWS DISCOVERY/scripts/auditar_zonas_cf.py`
Relatórios: `ZONAS-COBERTAS.md`, `ZONAS-FALTANTES.md` na mesma pasta.

## Permissão a pedir ao criar token novo

Se algum dia precisar de token por conta de novo, o procedimento e a armadilha
do escopo estão em `GOOGLE NEWS DISCOVERY/ZONAS-FALTANTES.md`. Resumo:
`Zone:Read` + `Zone WAF:Edit` + `Zone Settings:Edit`, e **Zone Resources =
`Include → All zones from an account`**, nunca `Specific zone`. TTL em branco.

Conferir antes de usar:
```bash
python "D:/SISTEMAS/GOOGLE NEWS DISCOVERY/scripts/registrar_token.py" \
  --conta <nome> --token <TOKEN>
```
