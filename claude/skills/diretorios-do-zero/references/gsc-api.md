# Search Console pela API (conta de serviço da QMIX)

O "passo GSC manual" aparecia em toda entrega de diretório como resto que sobra
para o Anderson. A maior parte dele agora é automatizável.

**Ferramenta:** `scripts/gsc.py` (nesta skill).
**Credencial:** `G:/QMIX/Google/seoqmix-service-account.json`, ou `GSC_CREDENCIAL`.
**Identidade:** `seoqmix@seoqmix.iam.gserviceaccount.com` (projeto `seoqmix`).
**Dependência:** PyJWT (`python -m pip install --user pyjwt cryptography`).

## O que ela faz e o que não faz

Testado contra a API, não deduzido da documentação:

| Operação | Estado |
|---|---|
| `sites.list` | funciona |
| `sitemaps.list` | funciona, traz enviadas x indexadas por sitemap |
| `sitemaps.submit` | funciona (204) |
| `urlInspection` | funciona, é a API de inspeção de URL |
| `searchAnalytics.query` | funciona |
| `siteVerification` | **desabilitada** no projeto `seoqmix` |

**A linha que decide o começo do projeto é a última.** Criar e verificar uma
propriedade nova continua sendo manual. Sem a Site Verification API, o fluxo é:

1. O dono abre o Search Console e adiciona a propriedade (prefira `sc-domain:`).
2. O dono adiciona `seoqmix@seoqmix.iam.gserviceaccount.com` como usuário, em
   **Proprietário** ou **Total** (leitura basta para relatório, mas enviar
   sitemap exige escrita).
3. Daí em diante tudo abaixo roda sozinho.

Se o dono habilitar a Site Verification API no projeto, dá para verificar por
DNS TXT sem sair do terminal, já que os domínios estão na Cloudflare e os tokens
estão em `G:\QMIX\Cloudflare\contas.json`. **Enquanto ela estiver desabilitada,
não prometa isso a ninguém**: o erro é 403 com "has not been used in project".

## Comandos

```bash
python gsc.py sites
python gsc.py sitemaps     sc-domain:exemplo.com.br
python gsc.py enviar       sc-domain:exemplo.com.br https://exemplo.com.br/sitemap.xml
python gsc.py inspecionar  sc-domain:exemplo.com.br https://exemplo.com.br/uma-pagina/
python gsc.py consultas    sc-domain:exemplo.com.br 2026-08-01 2026-09-01 query
python gsc.py consultas    sc-domain:exemplo.com.br 2026-08-01 2026-09-01 page
```

## Onde cada um entra no ciclo

**Fase 9 (finalização), Bloco 2.** `enviar` substitui o "enviar o sitemap no
painel". Logo depois, `sitemaps` confirma que o Google **baixou** o arquivo:
`último download: nunca` significa que ele não conseguiu ler, e isso precisa
virar pendência antes de a entrega fechar.

**Fase 9, Bloco 2.** `inspecionar` numa amostra de URLs de cada tipo (uma ficha,
uma listagem de município, uma de estado, um artigo) responde de uma vez a
canônica escolhida pelo Google, o estado do robots e se a página está indexada.
Vale mais que qualquer suposição sobre "deve estar tudo certo".

**Fase 11 / acompanhamento de 7 e 30 dias.** `sitemaps` dá enviadas x indexadas
sem abrir o painel, e é o número que o relatório pede. Um diretório grande com
`indexadas: 0` depois de duas semanas é sinal de thin content, não de paciência.

**Fase 10 (pós-lançamento).** `consultas ... query` traz as keywords reais e
`consultas ... page` diz **qual página** está ranqueando para elas. É o insumo do
loop de GSC descrito na Fase 10: cruzar consulta com página decide entre criar
conteúdo novo e melhorar o que já existe.

## Armadilhas

- **`sc-domain:` e `https://` são propriedades diferentes.** A API não converte
  uma na outra: usar a string errada devolve 403 mesmo com permissão. Rode
  `sites` e copie a string exata.
- **A URL da propriedade vai codificada no caminho.** `sc-domain:x` vira
  `sc-domain%3Ax`. O script já faz isso; se for chamar a API à mão, lembre.
- **Propriedade nova não tem dados.** `searchAnalytics` devolve vazio nos
  primeiros dias, e isso não é erro. Não registre "sem tráfego" como achado
  antes de o Google ter tido tempo de coletar.
- **`indexadas` do sitemap costuma ficar em 0** mesmo em site saudável: o Google
  parou de preencher esse campo com confiabilidade. Use `inspecionar` numa
  amostra para saber de verdade, ou o relatório de páginas no painel.
- A conta é **compartilhada pela rede**. Ela enxerga todas as propriedades onde
  foi adicionada, então confira o alvo antes de enviar sitemap: `enviar` num
  domínio errado cadastra sitemap na propriedade de outro site.

---

## Indexação antes de relevância (ordem do trabalho de SEO)

**O critério de pronto não é "sitemap enviado", é quantas URLs estão
INDEXADAS**, medido com `gsc.py inspecionar`, URL a URL.

Uma sessão inteira foi gasta otimizando H1 contra volume de busca e, quando o
acesso ao Search Console chegou, o estado real era **0 de 23 páginas indexadas**:
7 rastreadas e recusadas, 16 que o Google nunca viu. Enquanto o indexado for
zero, trabalho de palavra-chave não muda resultado nenhum, e a prioridade é
descoberta e autoridade, não H1.

Por isso `gsc.py` é **passo obrigatório da entrega**, não opcional.

**Nome de dimensão:** a dimensão de página chama `page`. Nunca `pagina`.
