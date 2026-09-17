# Conexão — VPS Hostinger (ferramentasqmix@gmail.com)

Esta conta possui 2 VPS.

---

## VPS 1 — OpenGravity (srv1000825)

| Campo | Valor |
|-------|-------|
| **Host** | `77.37.69.175` |
| **Porta** | `22` |
| **Usuário** | `root` |
| **Senha** | `<<REMOVIDO>>` |
| **Passphrase chave SSH** | `ftUAjG0Hl6pCvmYA@z4O` |
| **Painel** | HestiaCP (https://77.37.69.175:8083) |

### Comando de conexão

```bash
ssh root@77.37.69.175
```

Ou com alias (se configurado em `~/.ssh/config`):
```bash
ssh opengravity
```

### Configurar alias SSH no notebook

Adicionar ao arquivo `~/.ssh/config` (C:\Users\SeuUser\.ssh\config):

```
Host opengravity
    HostName 77.37.69.175
    User root
    IdentityFile ~/.ssh/id_ed25519_vps
```

### Diretório dos sites (usuário qmix no HestiaCP)

```bash
ls /home/qmix/web/
```

Cada site fica em: `/home/qmix/web/<dominio>/public_html/`

### Sites nesta VPS (22)

blog.coegoiania.com.br, coegoiania.com.br, cirurgiadecolunagoiania.com.br, blog.drbrunoair.com.br, drbrunoair.com.br, blog.ombrogoiania.com.br, blog.qmix.com.br, blog.nutricionista.digital, nutricionista.digital, blog.clinicasrecuperacaosaopaulo.com, clinicasrecuperacaosaopaulo.com, drtiagobernardes.com.br, camilafarias.com.br, blog.camilafarias.com.br, blog.drtiagobernardes.com.br, blog.cirurgiadojoelhogoiania.com, blog.drthiagotredicci.com.br, peritodicas.com, tendenciasmarketing.news, cirurgiadojoelhogoiania.com, revistamsaude.com.br

### Serviços rodando (PM2)

```bash
pm2 list
pm2 logs <nome-app>
```

---

## VPS 2 — Clínicas SP (srv984283)

| Campo | Valor |
|-------|-------|
| **Host** | `31.97.162.199` |
| **Porta SSH** | `22` (bloqueada pelo ISP — ver alternativas abaixo) |
| **Usuário** | `root` |
| **Painel** | HestiaCP (https://31.97.162.199:8083) |

### ⚠️ SSH bloqueado

A porta 22 está bloqueada pelo ISP local. Alternativas:

**Opção 1 — Terminal web do HestiaCP:**
Acesse https://31.97.162.199:8083 → Terminal

**Opção 2 — Terminal do painel Hostinger:**
hPanel → VPS → Terminal

**Opção 3 — SSH temporário na porta 80 (derruba nginx):**
```bash
# No terminal web do Hostinger:
sed -i '1i Port 80' /etc/ssh/sshd_config && systemctl stop nginx && systemctl restart ssh

# Conectar do seu PC:
ssh -p 80 root@31.97.162.199

# Após terminar, restaurar:
sed -i '/^Port 80$/d' /etc/ssh/sshd_config && systemctl restart ssh
systemctl stop apache2; sleep 1; systemctl start nginx; sleep 1; systemctl start apache2 2>/dev/null
```

### Sites nesta VPS

consultaplacabrasil.com, news.consultaplacabrasil.com, clinicasrecuperacaosaopaulo.com
