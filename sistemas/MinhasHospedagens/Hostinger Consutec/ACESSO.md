# Hospedagem Hostinger - Grupo Consutec (cliente novo)

Cadastrado em 25/08/2026.

## Acesso SSH

    ssh consutec

Alias configurado em ~/.ssh/config:

    Host consutec
        HostName 85.31.229.67
        User u689374768
        Port 65002
        IdentityFile ~/.ssh/id_ed25519_consutec
        IdentitiesOnly yes
        StrictHostKeyChecking accept-new

Chave DEDICADA a este cliente, nao reaproveitada da rede QMIX. A publica foi
cadastrada pelo cliente no hPanel (Avancado > Acesso SSH).

Comando cru equivalente: ssh -p 65002 u689374768@85.31.229.67

## Dados da conta

- Tipo: hospedagem COMPARTILHADA (nao e VPS)
- IP: 85.31.229.67 (tambem responde em IPv6 2a02:4780:13:1180::2917:630:2)
- Usuario: u689374768
- Porta SSH: 65002
- Raiz dos sites: /home/u689374768/domains/<dominio>/public_html
- Espaco usado: 2,5 GB
- PHP CLI: 8.0.30 | WP-CLI: 2.12.0
- CDN: Hostinger (Server: hcdn). NENHUM dos sites esta atras de Cloudflare.

## Sites

| Dominio | WP | Tema | Posts | Banco | Status |
|---|---|---|---|---|---|
| acaidoceu.com.br | 6.4.10 | hello-elementor | 2 | u689374768_5PiLi | FORA DO AR (SSL expirado) |
| biofiltros.com.br | 6.9.7 | biofiltros-theme | 1 | u689374768_6IguK | no ar |
| consutec.ind.br | 7.1 | neve-child-master | 26 | u689374768_PflVF | no ar |
| rotaambiental.com.br | 7.1 | smart-mag | 74 | u689374768_JbIYE | no ar |

Titles:
- biofiltros.com.br: Bio Filtros e Purificadores, Tratamento de Agua de Poco
- consutec.ind.br: Maquinas Industriais De Sorvete, Picole E Acai
- rotaambiental.com.br: Industria de Equipamentos Para Tratamento de Agua Rota

## ACHADOS DA PRIMEIRA VARREDURA (25/08/2026)

### 1. acaidoceu.com.br esta fora do ar ha 19 meses
Certificado Let's Encrypt expirado em 28/01/2025. O HTTP faz 301 para HTTPS,
e o HTTPS falha, entao o site esta inacessivel por qualquer caminho.
Correcao: hPanel > Seguranca > SSL > emitir/renovar. Se nao emitir, conferir
se o dominio ainda aponta para 85.31.229.67 (aponta, ja verificado).
O WordPress dele tambem esta em 6.4.10, muito atras dos outros.

### 2. Arquivos de auto-login de admin abandonados na raiz
    acaidoceu.com.br/public_html/create_autologin_657da065c083a.php
    consutec.ind.br/public_html/create_autologin_657dbcdbe28f1.php
Ambos de 16/12/2023. Sao os scripts que o hPanel gera para o botao
"Editar site", e dao sessao de administrador para o e-mail chumbado no
arquivo (arletutumania@gmail.com) para quem acessar a URL. Deveriam ter sido
apagados logo apos o uso. RECOMENDACAO: apagar os dois.

### 3. Sem blindagem de PHP em uploads e languages
Falta o .htaccess que nega execucao de PHP por HTTP nessas pastas em 7 das 8
combinacoes (so consutec/uploads tem). E exatamente o vetor do incidente do
euvo.com.br. Aplicar o mesmo .htaccess que a rede QMIX usa desde 16/07/2026.

### 4. Nenhum indicio de invasao
Busca por eval(base64_decode|gzinflate|str_rot13) nao retornou nada.
Os index.php dentro de uploads sao os "silence is golden" padrao de plugins
de backup, inofensivos. monarx-analyzer.php e o agente de seguranca da
propria Hostinger e wordfence-waf.php e do Wordfence, ambos legitimos.
default.php e a pagina padrao da Hostinger, inofensiva.

## Manutencao aplicada em 26/08/2026

- Blindagem de PHP aplicada em wp-content/uploads e wp-content/languages nos
  4 sites (8 de 8 pastas). Teste real: PHP dentro de uploads responde 403,
  imagem .webp continua servindo 200 e os 3 sites no ar seguem em 200.
- Removidos os dois create_autologin_*.php. Copias guardadas no servidor em
  ~/backup-qmix-20260826/ antes da remocao.

## Pendencias

- [ ] Emitir SSL do acaidoceu.com.br e devolver o site ao ar (so pelo hPanel)
- [ ] Atualizar o WordPress do acaidoceu (6.4.10)
- [ ] Decidir se os sites entram no Cloudflare
- [ ] Confirmar com o operador o nome definitivo do cliente e renomear
      alias e pasta se "Consutec" nao for o guarda-chuva correto

## Observacoes

Os 4 dominios parecem ser do mesmo grupo industrial (maquinas de sorvete e
acai, purificadores e equipamentos de tratamento de agua). Nomeei alias e
pasta como "Consutec" por ser o .ind.br do conjunto.

Este cliente NAO faz parte da rede de publicacoes QMIX. Nao incluir em
operacoes de backlink, pruning ou instalacao em massa.
