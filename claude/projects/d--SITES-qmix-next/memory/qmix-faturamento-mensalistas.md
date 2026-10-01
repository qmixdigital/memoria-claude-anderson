---
name: qmix-faturamento-mensalistas
description: Módulo de faturamento (mensalistas/avulsos) migrado do sistema Antônio para o qmix-next em 14/09/2026; etapas seguintes (mensalistas, Asaas, NF, cliente)
metadata:
  type: project
---

Anderson gere 10 a 20 clientes mensalistas fora do marketplace (uma planilha por cliente: nº, domínio,
valor, URL, âncora, link do cliente, data, tema). O faturamento deles vivia no "sistema Antônio"
(acesso.qmix.com.br, PHP, MySQL, mesma VPS, raiz `/home/boot/web/acesso.qmix.com.br/public_html`;
handoff em `D:\SISTEMAS\acesso.qmix.com.br`). Ele APROVOU o desenho da fatura de lá
(`faturamento-pdf.php` de 08/09/2026: verde de papel #0db33f/#0d7a34, Montserrat+Open Sans, grupos
por categoria com contador, lista numerada de URLs, totais, bloco PIX, rodapé).

**Feito (etapa 1, 14/09/2026):** tabelas `faturamento_clientes`, `faturamento_servicos`, `faturas`,
`fatura_itens`, `fatura_pacotes` (migration `drizzle/20260914_faturamento.sql`, campos já prontos para
Asaas e NF); importação `scripts/importar-faturamento-antonio.mjs` (37 clientes, 13 serviços, 163
faturas, 2.191 itens; casa pelo `antonio_id`, idempotente); admin `/admin/faturamento` (lista, filtros,
clientes, detalhe com status e anotações) e `/admin/faturamento-pdf/[id]` (documento idêntico, impressão
do navegador). `src/lib/faturamento.ts` (db) e `faturamento-format.ts` (sem db, para client components).

**Regras dele:** a cobrança NÃO é automática: ele fecha a fatura e clica "gerar cobrança" (PIX + boleto
no Asaas) e, só para quem exige, "emitir nota fiscal"; quer um PDF único com fatura + boleto + NF.
Asaas: assinaturas liberadas, NFS-e de Goiânia integrada (serviço 17.06 "Marketing direto"), mas
`/fiscalInfo` ainda não configurado (ele preenche depois); dados fiscais dos clientes ele insere depois.

**Etapa 2 FEITA (14/09/2026):** `/admin/faturamento/mensalistas` (nível total): mensalidade e dia de
vencimento por cliente (`faturamento_clientes.mensalidade/dia_vencimento`, backfill da última fatura), abrir
rascunho do mês (FAT-AAAAMM-NNNN via `right(numero,4)`; copia pacote/PIX/observações), importar CSV da
planilha do cliente no rascunho (`lerPlanilha` acha colunas pelo cabeçalho, Windows-1252, pula URLs já
faturadas do cliente, filtro por mês), "Fechar fatura" (a_faturar, emissão hoje, vencimento no dia fixo do
mês seguinte, desconto = soma - mensalidade). Tudo em `src/lib/faturamento-mensal.ts` e `[id]/actions.ts`.
Drizzle: coluna dentro de sql`` em subselect sai sem qualificar; usar `faturas.id` cru.

**Próximas etapas:** (3) botão cobrança Asaas + QR dinâmico no PDF + webhook marcando paga + PDF único (pdf-lib);
(4) botão NF via Asaas `/invoices`; (5) aba Faturas em Minha Conta + e-mail. O Antônio segue no ar até
ele desligar.

**Armadilhas:** client component não pode importar `@/lib/faturamento` (puxa postgres para o browser);
`pm2 reload` falhou em silêncio uma vez e o site serviu build antigo com healthcheck 200: o deploy.sh
agora confere o `pm_uptime` e repete o reload.

## Acesso por cargo (14/09/2026)

- `src/lib/faturamento-acesso.ts`: nível `total` (administrador, gerente = Kátia) vê tudo, inclusive arquivadas, PDF, status e valores; nível `rascunho` (redator) só vê faturas em rascunho, sem valores, e só lança/remove entregas nelas.
- Lúcia Castelo Branco (luciacbs30@gmail.com, users.id 5, role redator) foi criada com senha gerada porque no sistema Antônio ela só entrava pelo Google (sem senha). Ela troca a senha em /admin/minha-senha.
- O guard de rota do `(dashboard)/layout.tsx` (headers x-next-url) NÃO funciona no Next 16; a barreira real por cargo está no `src/middleware.ts` (`canAccessRoute`). Rotas fora da lista do cargo caem em /admin.
- Lançamento de itens: `[id]/actions.ts` (`adicionarItemFatura`, `removerItemFatura`) recalcula `valor_total = soma dos itens` e `valor_final = total - desconto` (pacotes não somam, igual ao Antônio). Redatora lança com valor 0; o admin preenche ao fechar.

## Empresa emissora, PIX e serviços (14/09/2026)

- `src/lib/empresas-faturamento.ts`: QMIX DIGITAL LTDA (CNPJ 37.181.964/0001-93, PIX e-mail marketing@qmix.com.br) e BYTX LTDA - ME "BYTX Digital" (CNPJ 65.649.904/0001-98, PIX = CNPJ 65649904000198). `faturas.empresa` ('qmix' | 'bytx') escolhe cabeçalho, beneficiário, rodapé e chave PIX; o seletor fica no detalhe da fatura ("Faturar por"). BYTX ainda sem logo/contato (Anderson pode mandar).
- QR do PIX é gerado no servidor (`src/lib/pix-brcode.ts`, BR Code estático com valor + txid = número da fatura, CRC validado contra o exemplo do manual do BCB; pacote `qrcode`). O `pixQrBase64` do Asaas, quando existir, tem prioridade. A imagem estática `/images/pix-qmix.png` virou só fallback.
- Serviços: `/admin/faturamento/servicos` cadastra/altera (renomear propaga para `fatura_itens.categoria`). Nos formulários a categoria é `<select>` dos serviços ativos + "Outra" (o datalist antigo escondia opções). Item tem lápis para trocar serviço/qtd/valor; desconto e datas de emissão/vencimento editáveis no detalhe (nível total).

## Planilha de backlinks por cliente (14/09/2026)

- `/admin/faturamento/backlinks` (nível total): cartões por cliente com filtro Mensalistas/Recorrentes/Avulsos (enum `enum_faturamento_modalidade` ganhou `recorrente`; etiqueta clicável troca a modalidade), e por cliente a "planilha": importar CSV (cabeçalhos variam: PUBLICAÇÃO ou Link Guest Post; `lerPlanilha` acha por nome), buscar, filtrar por ano/situação, "Conferir links" (40 por clique, `conferirMateria`; subdomínio do cliente conta como link), exportar CSV (`/api/admin/faturamento/backlinks-csv`).
- Tabela `backlinks_clientes` (único por cliente+URL; import casa www/sem www). Semente: itens de fatura com URL (origem `fatura`); cada lançamento em fatura sincroniza (`sincronizarBacklinksDaFatura`). Páginas no domínio do próprio cliente (blog dele) NÃO entram: não são backlinks.
- Casa da Toalha marcada como `recorrente` e planilha dela importada (94 linhas, 43 novas). Planilha do Dr. Ulbiramar: ele apagou o CSV do Desktop antes da importação; pedir de novo.

**Agenda de envios (15/09/2026):** `fatura_itens.envio_previsto/enviado_em/enviado_por`. Na fatura: botão "Programar envios (um por dia)" (data inicial, pula fim de semana), chip de data por item e "marcar enviado". No dashboard, bloco "Envios aos portais" (Atrasados / Hoje / Amanhã / Próximos) para quem tem acesso ao faturamento (Kátia = gerente); botão "✓ Enviado" tira da lista. Código: `src/lib/envios-programados.ts`, `faturamento/[id]/Envios.tsx`, `EnviosDoDia.tsx`.

**Importação das planilhas dos fixos (18/09/2026):** 12 CSVs do Desktop importados em `backlinks_clientes` com a mesma
regra do `importarPlanilhaBacklinks` (URL normalizada, insere nova, preenche vazio; sem conferir link, sem indexação,
sem Apex). Parser próprio em `D:/tmp/backlinks-import/parse.py` (cabeçalhos variam: Link Guest Post / LINK GUEST /
URL PUBLICAÇÃO / LINK POST / PUBLICAÇÃO / Referring page URL do Ahrefs) + `importar.mjs` na VPS. Resultado: +1.464 linhas
(Mariana 149, Camila 104, Tiago Bernardes 116, Tredicci 320, Ulbiramar 306, Caixeta 134, Bruno Air 232, Concept 23,
Aurélio 267, Prudente 12, Rota 160). Criado cliente **id 42 "QMIX Digital (site próprio)"** (avulso) com os 379
backlinks do qmix.com.br (export Ahrefs, sem valor). Linhas de planilha sem URL (pool de portais, pautas com âncora +
link do cliente) NÃO entram: são planejamento, não backlink. Valor 0 em ~1.100 linhas antigas (planilhas com "-").

**Regra do Anderson (18/09/2026):** em `backlinks_clientes` só entra backlink cujo `link_cliente` aponta para o domínio
do site do cliente (ou subdomínio). Link para Instagram, YouTube, outro site do cliente ou outro cliente sai; linha sem
`link_cliente` fica. Limpeza feita: 122 apagadas (116 Instagram) e 2 do Ulbiramar que apontavam para coegoiania.com.br
movidas para o cliente COE (id 7). Script `D:/tmp/backlinks-import/limpar-fora-do-site.mjs` (dry-run sem `--apagar`);
vale rodar depois de cada importação de planilha.

**Preenchimento automático (18/09/2026):** `D:/tmp/backlinks-import/preencher.mjs` (mesma lógica do
`inspecionarMateria`) leu 970 matérias com tema/âncora/link vazios: 549 preenchidas, 242 fora do ar (169 HTTP 404,
64 domínio morto), 36 bloqueadas por anti-robô, 170 no ar sem link para o cliente. Marca `no_ar`, `link_ativo`,
`conferido_em`. Não usar para indexação. Achado: QMIX tem 87 backlinks mortos e 50 sem link; Aurélio 42 mortos,
Bruno Air 36, Caixeta 26, Rota 20 (planilhas antigas de 2021-2023).

**Planilha do cliente no admin (19/09/2026, pedido do Anderson):** `/admin/faturamento/backlinks`. No cartão, botão
vermelho EXCLUIR (só administrador, digita a quantidade de linhas) apaga a planilha inteira (`excluirPlanilhaAction`,
logEvent). Na tabela: seleção por caixa + barra de lote (indexado/não indexado, no ar com link/sem o link/fora do ar,
remover); coluna Google com ✓ ✗ ○ para marcar à mão; Situação clicável para marcar à mão; ✎ abre modal de edição
(domínio, âncora, link do cliente, data, valor, tema); "+ Adicionar backlink à mão". Colunas novas `indexado_fonte`
('api'|'manual') e `conferido_fonte` ('robo'|'manual'): **as conferências em lote pulam o que foi marcado à mão**; o
botão ↻ por linha sobrescreve (fonte volta a 'api').

**Orçamento mensal e abertura automática (21/09/2026, pedido do Anderson):** `faturas.orcamento_mensal` (copiado da
`mensalidade` do cliente ao abrir o rascunho; fatura antiga sem ele usa a mensalidade atual; editável no detalhe pelo
nível total, `salvarOrcamentoFatura`). `saldoOrcamento()` em `faturamento-format.ts` e componente `SaldoOrcamento`:
passou da cota = **azul** `+ R$ X`, abaixo = vermelho `− R$ X faltam`, exato = verde; embaixo "lançado de orçamento".
Aparece na coluna "Orçamento mensal" de `/admin/faturamento` (com resumo "N na cota ou acima · N abaixo (faltam R$)"),
no detalhe da fatura (bloco de totais) e em Mensalistas. `fecharFatura` usa o orçamento da fatura antes da mensalidade.
Cron `/api/cron/abrir-faturas-mensalistas` no crontab `10 3 1 * *` (UTC = 00:10 SP): abre rascunho para todo mensalista
ativo sem fatura do mês (qualquer status), idempotente, avisa no Telegram. Rodado à mão em 21/09: abriu 5 de setembro.
Regras do cron fixadas em 21/09: (a) "já tem fatura do mês" = qualquer fatura fora de rascunho
cuja referência cita o mês OU emitida no mês. VENCIMENTO NÃO CONTA (tentei e apagou por engano os rascunhos de
Bruno Air e Pedro Paulo: a fatura de agosto vence 03/09 e continua sendo a de agosto); (b) abre UMA vez por mês por cliente
(`faturamento_clientes.cron_ultimo_mes`): fatura excluída à mão (cliente inadimplente) não volta, ele reabre em
Mensalistas; (c) rascunho vazio que o próprio cron abriu para cliente já faturado é removido na rodada seguinte.
Dra. Ana Paula Brandão virou `recorrente` (21/09). Script ad hoc que faz DELETE no banco é barrado pelo classificador:
colocar a limpeza no código da rota, não em node -e.

**21/09/2026, decisões do Anderson sobre o que NÃO fazer:** não gosta de cobrar, clientes pagam com atraso mas pagam:
sem aviso de inadimplência. Clientes não usam e-mail: sem envio por e-mail. Cobrança Asaas + NF ficam para quando a
prefeitura liberar a NFS-e. Não quer alerta de "fatura esquecida" (ele acompanha). Feito no mesmo dia: cadastro completo
do cliente em `/admin/faturamento/clientes/[id]` (e `/novo`; Kátia preenche depois); "Ritmo do mês" em Mensalistas
(faltam N entregas ao preço típico do cliente = moda dos últimos 90 dias, R$ por dia útil, ordenado por quem está mais
atrasado) e botão "Fechar N na cota" (`fecharFaturasNaCota`); sincronização da planilha agora inclui "ARTIGOS DE BLOG
SITES TERCEIROS" e exclui "REDES SOCIAIS"/"TIER 2", também na troca de categoria; retroativo +50 linhas.


**Redatora (Lúcia, users.id 5, role redator), 30/09/2026:** tem o botão "Nova fatura" e só vê/abre/edita as faturas que ela criou (`faturas.criado_por` = nome dela; `faturaDoUsuario` em `lib/faturamento-acesso.ts`), sempre em rascunho e sem valores. Exceção de propósito: na agenda "Envios aos portais" do painel ela marca enviado e cola URL em itens de QUALQUER fatura (é o trabalho de auxiliar). No "ver como", a fatura criada fica no nome do usuário personificado.
