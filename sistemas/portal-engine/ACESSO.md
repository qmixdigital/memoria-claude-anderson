# ACESSO.md — Infraestrutura, credenciais e setup em máquina nova

> **Para quem vai assumir o projeto.** Este arquivo reúne tudo que a outra máquina precisa para
> acessar a hospedagem e operar o motor. Leia junto com **[LEIA-PRIMEIRO.md](./LEIA-PRIMEIRO.md)** (visão geral)
> e **[CLAUDE.md](./CLAUDE.md)** (runbook completo de operação).

> ⚠️ **SEGREDOS:** este projeto contém chaves sensíveis (API keys em `sites.json`, chave de e-mail,
> chave de geração de imagem) e depende de uma **chave SSH de root**. Trate a pasta como confidencial.
> NÃO suba para repositório público. Se algum segredo vazar, **rotacione** (gere novo) imediatamente.

---

## 1. Pré-requisitos da máquina nova

| Item | Versão / observação |
|---|---|
| **Terminal com OpenSSH** | Windows: **Git Bash** (recomendado) ou WSL. Mac/Linux: nativo. |
| **Node.js** | **18+** (o motor e os scripts usam `fetch` global; a VPS roda Node 18.19). |
| **Cliente SSH** | `ssh`, `scp` (vem com OpenSSH). |
| **Claude Code** (opcional, recomendado) | A pasta tem `CLAUDE.md` como runbook; o agente opera tudo via SSH. |
| **Editor** | VS Code (a pasta é a superfície de edição do código). |

Não precisa instalar ImageMagick/Node na máquina local para operar — **o processamento roda na VPS**.
A máquina local só edita arquivos e dispara comandos via SSH.

---

## 2. Acesso SSH à VPS (Hostinger)

A VPS é onde **tudo roda**. Dados de conexão:

| Campo | Valor |
|---|---|
| **Alias SSH** | `hostinger-vps-srv1166087` |
| **IP / HostName** | `31.97.173.40` |
| **Usuário** | `root` |
| **Porta** | `22` |
| **Chave (IdentityFile)** | `<<REMOVIDO>>` |

### 2.1 Configurar o `~/.ssh/config` na máquina nova

Adicione este bloco em `~/.ssh/config` (crie o arquivo se não existir):

```
Host hostinger-vps-srv1166087
    HostName 31.97.173.40
    User root
    Port 22
    IdentityFile <<REMOVIDO>>
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
```

### 2.2 A chave privada (transferir COM SEGURANÇA — fora desta pasta)

A chave **não vem dentro desta pasta** de propósito (se a pasta vazar, o root vaza junto). Duas opções:

**Opção A (recomendada, mais segura) — o novo dev gera a própria chave:**
1. Na máquina nova: `ssh-keygen -t ed25519 -f <<REMOVIDO>> -C "dev-novo"`
2. O **dono atual** adiciona a chave pública nova ao servidor (a partir de uma máquina que já acessa):
   ```bash
   cat <<REMOVIDO>>.pub | ssh hostinger-vps-srv1166087 "cat >> ~/.ssh/authorized_keys"
   ```
   (ou cola o conteúdo do `.pub` novo em `/root/.ssh/authorized_keys` da VPS)
3. Pronto: a máquina nova passa a acessar com a própria chave. Para revogar depois, basta remover a linha.

**Opção B (rápida) — copiar a chave existente:**
- Transfira o arquivo `<<REMOVIDO>>` (a privada) da máquina atual para `~/.ssh/` da máquina nova
  por um canal seguro (pendrive, gerenciador de senhas, mensagem criptografada — **nunca** por e-mail comum).
- Ajuste a permissão: `chmod 600 <<REMOVIDO>>`
- ⚠️ Essa chave dá **root** na VPS. Se vazar, gere outra e troque a `authorized_keys`.

### 2.3 Testar a conexão

```bash
ssh hostinger-vps-srv1166087 "echo OK; node -v; systemctl is-active portal-engine"
```
Esperado: `OK`, a versão do Node e `active`. (O warning `post-quantum / store now decrypt later` é inofensivo, ignore.)

---

## 3. O que existe na VPS (recap)

| Caminho | Conteúdo |
|---|---|
| `/opt/portal-engine` | **Código do motor** (dono: usuário `portais`). É o que esta pasta espelha. |
| `/srv/portais/<slug>/data` | JSON bruto de cada artigo (fonte para rebuild). |
| `/srv/portais/<slug>/public` | HTML estático servido pelo Nginx. |
| `/etc/ssl/portais/<dominio>/` | Certificados Origin (`origin.pem`/`origin.key`). |
| systemd `portal-engine` | Receptor Node em `127.0.0.1:8791` (recebe do Antônio + formulário de contato). |
| `/etc/nginx/conf.d/portal-<slug>.conf` | vhost de cada portal. |

> **Regras de ouro** (detalhadas no CLAUDE.md): reiniciar o serviço após editar `src/`; nunca rodar
> comandos como root em `/srv/portais` (use `runuser -u portais -- ...`); transferir arquivos com
> `cat local | ssh host "cat > remoto"` (scp falha nesta VPS).

---

## 4. Cloudflare (DNS + SSL) — gerenciado pelo dono

Os domínios ficam no Cloudflare (proxy laranja, SSL Full). **A conta é do dono.** Para criar um portal novo
ou converter um site, é preciso mexer no DNS (apontar A `@` e `www` → `31.97.173.40`). Combine com o dono:
- ele dá acesso à conta Cloudflare, **ou**
- ele mesmo faz o passo de DNS/SSL quando você avisar.

(Sem Cloudflare configurado, o portal não fica acessível por HTTPS público.)

---

## 5. Sistema Antônio (plataforma de conteúdo da QMIX)

- Painel: `https://acesso.qmix.com.br/wp-sites` (atrás do Cloudflare — só o dono acessa hoje).
- É onde se cadastra cada portal: **Domínio**, **Endpoint URL** (`https://<dominio>/<slug>-api/v1/artigos`),
  **X-API-KEY** (gerada pelo `newsite.sh`), **Autor** e **Categoria** (IDs numéricos).
- O Antônio faz **POST** dos artigos nesse endpoint; o motor publica o HTML. Formato e quirks: ver CLAUDE.md.
- As chaves X-API-KEY de cada portal estão em **[SITES.md](./SITES.md)** e no `sites.json`.

---

## 6. Chaves de API (segredos que viajam com o projeto)

| Serviço | Onde está | Para quê |
|---|---|---|
| **X-API-KEY por portal** | `sites.json` (campo `apikey`) e SITES.md | autentica o POST do Antônio em cada portal |
| **Resend** (envio de e-mail) | `sites.json` (campo `resendKey`, top-level) | formulário de contato → e-mail. Remetente `marketing@qmix.com.br` (domínio verificado no Resend). |
| **IndexNow** (por portal) | `sites.json` (campo `indexnowKey`) | ping a buscadores ao publicar |
| **Runware** (geração de imagem por IA) | **abaixo** ⬇️ | criar imagens WebP para conteúdo de teste/layout |

### Runware (gerar imagens para conteúdo)

Chave: `<<REMOVIDO>>` — endpoint `https://api.runware.ai/v1`.

```bash
curl -s -X POST "https://api.runware.ai/v1" \
  -H "Content-Type: application/json" -H "Authorization: Bearer <<REMOVIDO>>" \
  -d '[{"taskType":"imageInference","taskUUID":"<uuid>","positivePrompt":"DESCRIÇÃO EM INGLÊS, professional, high quality, no text","width":1216,"height":640,"numberResults":1,"outputFormat":"WEBP","model":"runware:100@1"}]'
```
- **Dimensões devem ser múltiplas de 64** (ex.: 1216×640, 1024×576). 1200×630 **falha**.
- Prompt em inglês + "no text". Resposta traz `data[].imageURL`.
- O motor reotimiza qualquer imagem para WebP ≤1000px ao receber (ver CLAUDE.md → Imagens).

> 🔒 Todas as chaves acima são compartilhadas. Se a pasta for exposta, **rotacione** as que puder
> (gerar nova no painel do serviço) e atualize `sites.json` + VPS.

---

## 7. Manter o `sites.json` sincronizado

A **fonte da verdade da config é o `/opt/portal-engine/sites.json` da VPS**. O `sites.json` local é cópia.
Depois de qualquer mudança feita direto na VPS (ou pelo `newsite.sh`), ressincronize:

```bash
ssh hostinger-vps-srv1166087 "cat /opt/portal-engine/sites.json" > sites.json
```

E o contrário (subir uma mudança local) — transferir e o receptor recarrega sozinho (fs.watch):

```bash
cat sites.json | ssh hostinger-vps-srv1166087 "cat > /opt/portal-engine/sites.json && chown portais:portais /opt/portal-engine/sites.json"
```

---

## 8. Primeiros comandos úteis (sanity check da máquina nova)

```bash
# 1. conexão + serviço
ssh hostinger-vps-srv1166087 "systemctl is-active portal-engine; curl -s http://127.0.0.1:8791/_health"
# 2. portais no ar
for d in romanceseleituras.com www.projetob.net todossomosgeek.com jornaldiario.net; do
  echo -n "$d "; curl -s -o /dev/null -w "%{http_code}\n" "https://$d/"; done
# 3. contagem de artigos por portal
ssh hostinger-vps-srv1166087 'for s in romanceseleituras projetob todossomosgeek jornaldiario; do echo -n "$s: "; ls /srv/portais/$s/data/*.json 2>/dev/null | wc -l; done'
```

Tudo respondendo `active` / `200` → máquina nova pronta para operar.
