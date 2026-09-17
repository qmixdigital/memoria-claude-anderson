---
name: certificado-de-origem-e-cloudflare-origin-ca
description: A rede não usa certbot; o certificado de origem é Cloudflare Origin CA, emitido pela API, e a clinicas-vps nem tem certbot instalado
metadata:
  node_type: memory
  type: project
---

O runbook de conversão manda emitir o certificado da origem com
`certbot certonly --webroot`. **Na clinicas-vps não existe certbot**, e
`/etc/letsencrypt/live/` está vazio. O comando falha com `command not found`
justo no momento em que o site já foi virado.

O padrão real da rede são **certificados Cloudflare Origin CA**: 15 anos de
validade, emitidos pela API, guardados em `/etc/ssl/portais/<domínio>/origin.pem`
e `origin.key`. Em 01/09/2026 eram 37 domínios nesse formato só naquela máquina.

Vantagem sobre o Let's Encrypt aqui: **não precisa que o DNS já aponte para a
origem**, então o certificado pode ser emitido **antes** da virada, e a zona não
precisa do afrouxamento de `strict` para `full`. O impasse do HTTP-01 some.

```bash
openssl req -new -newkey rsa:2048 -nodes -keyout origin.key -out /tmp/d.csr -subj "/CN=$DOM"
curl -X POST "https://api.cloudflare.com/client/v4/certificates" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data "{\"hostnames\":[\"$DOM\",\"*.$DOM\"],\"requested_validity\":5475,\"request_type\":\"origin-rsa\",\"csr\":$CSR_EM_JSON}"
```

O token de conta do `contas.json` basta. O certificado só é aceito pela
Cloudflare: acessar a origem direto pelo IP dá aviso de certificado, o que é
esperado e até desejável.

⚠️ **Ordem que funciona sem tirar o site do ar:** emitir o Origin CA, subir o
bloco 443 com ele, `nginx -t` pelo **exit code**, recarregar, só então virar o
registro A, e por último pôr a zona em `strict`. Ver [[virada-dns-cloudflare-strict]],
que descreve o caminho do certbot e continua valendo nas máquinas que o têm.
