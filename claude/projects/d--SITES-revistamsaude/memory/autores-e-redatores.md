---
name: autores-e-redatores
description: Quem assina as matérias por tema (ordem do Anderson de 18/09/2026), fichas criadas, regras de convênio de cada autor e regra do link mais forte (site do autor primeiro)
metadata:
  type: project
---

Ordem do Anderson em 18/09/2026 para a produção de conteúdo novo:

| Tema | Autor (slug da ficha) | Site (primeiro link do corpo) | Regra de atendimento |
|---|---|---|---|
| Nutrição | Juliana Borges (`juliana-borges`, CRN1-18734, criada em 18/09) | nutricionista.digital/goiania | SÓ particular, presencial e online. Não atende Unimed, Ipasgo nem nenhum plano |
| Endocrinologia, medicamentos para emagrecer | Dra. Camila Farias (`dra-camila-farias`, CRM-GO 20030, criada em 18/09) | camilafarias.com.br | SÓ particular |
| Aparelho digestivo, colonoscopia | Dr. Thiago Tredicci (`dr-thiago-tredicci`, CRM-GO 12828, criada em 18/09) | drthiagotredicci.com.br | Atende Unimed, Ipasgo, Bradesco, Itaú, SulAmérica, MAS mediante agenda e plano ativo (escrever a ressalva) |
| Mão e punho | Dr. Henrique Bufaiçal (`dr-henrique-bufaical`) | drhenriquebufaical.com.br | convênio e particular |
| Ombro | Dr. Thiago Caixeta (`dr-thiago-barbosa-caixeta`) | ombrogoiania.com.br | confirmar no consultório |
| Joelho | Dr. Ulbiramar Correia (`dr-ulbiramar-correia-da-silva-filho`) | cirurgiadojoelhogoiania.com | confirmar no consultório |
| Todo o resto | Tiago Brito, diretor da revista (`tiago-brito`, especialidade `editorial`, criada em 18/09) | sem site; primeiro link = especialidade ou ficha do diretório | |

**Regra do link mais forte (skill seo-aeo-best-practices):** o primeiro `<a>` do corpo é o mais importante. Nas matérias desses autores, o primeiro link é o site externo do autor com âncora de keyword ("nutricionista em Goiânia", "endocrinologista em Goiânia"), depois a ficha no diretório.

**Why:** os sites são clientes da QMIX; a revista é fonte de backlink editorial. Não mexer em conteúdo antigo: muitos médicos publicam no portal (ordem de 18/09).

**How to apply:** `especialidade` ganhou o valor `editorial` (enum alterado como superusuário postgres, opção no Profissionais.ts e labels nas 3 telas). Briefings com campo `autor` em `plano/briefings_lote3.json`; REGRAS.md seção "Lote 3". Ver [[conteudo-publicado-2026-09-11]] e [[importar-materia-markdown]].

**Lote 3 publicado em 18/09/2026 (18 matérias novas, todas validadas, datas em 2025, fora da home):** rybelsus-preco-doses-3-7-14mg e dulaglutida (Camila Farias); nutricionista-esportiva, melhor-suplemento-para-memoria, alimentos-com-alta-carga-de-frutose (Juliana Borges); preparo-para-colonoscopia-de-tarde (Tredicci); tendinite-na-mao, tenossinovite-de-quervain (Bufaiçal); ortopedista-de-ombro-em-goiania, tratamento-manguito-rotador-goiania (Caixeta); lesao-do-lca-joelho (Ulbiramar); pessario-para-prolapso-uterino, iconic-clinica-goiania (odontologia, não plástica), biorressonancia-capilar, nutricionista-infantil, medico-integrativo, carie-infantil, exercicios-apos-abdominoplastia (Tiago Brito). Primeiro link do corpo = site do autor quando existe. A Iconic é clínica odontológica do Dr. Marcos Fernando (CRO/GO 7.124).

**Lentidão relatada em 18/09:** TTFB 120 ms e PSI 96, mas a VPS opengravity está sem memória (4 GB de swap, 17% de steal) e cada `next build` do deploy consome 1,2 GB, jogando os sites para o swap por minutos. Mitigações: ISR das matérias de 60 s para 300 s; Cloudflare security_level de high para medium. Recomendação dada: mais memória na VPS ou mover apps; agrupar deploys.

**18/09/2026, noite:** foto da Juliana Borges aplicada (media 957, `juliana-borges.webp`, 800x800, enviada pelo Anderson). Bio da ficha conferida contra nutricionista.digital: PUC Goiás, CRN1-18734, bicampeã brasileira wellness 2018/2019, @julianaborgez, Terra Office Av. C-4 931 sala 2104. As 3 matérias dela estão em conformidade (primeiro link = site dela, "somente particular" nos três textos, CFN 656/2020 citada, sem marca de suplemento). Template corrigido no mesmo dia: ficha usa schema Person+jobTitle para não médicos (Dentist para odontologia), title da ficha = "Nome, Especialidade em Cidade | Mais Saúde", rótulo com acento na assinatura (mapa único em `src/lib/especialidadeLabels.ts`).

**18/09/2026, noite (2):** foto do Dr. Thiago Tredicci aplicada (media 958, `dr-thiago-tredicci.webp`, enviada pelo Anderson; antes a ficha usava a-pharmaceutica.webp, media 837, agora sem uso). Ficha conferida contra drthiagotredicci.com.br: CRM-GO 12828, RQE 8168 e 8626, 15+ anos, 3000+ cirurgias, Órion Business Setor Marista, Unimed/Ipasgo/Bradesco/Itaú/SulAmérica mediante confirmação, @thiagotredicci, e-mail thiagomtredicci@gmail.com adicionado. Matéria preparo-para-colonoscopia-de-tarde em conformidade (primeiro link = site dele, ressalva de agenda e plano ativo escrita, SOBED 2023 como fonte, receita do serviço prevalece).

**Links de entrada do lote 3 (18/09/2026, noite):** 51 links em texto âncora de 44 matérias antigas para as 18 novas (cada nova recebe 2 a 4). Fontes escolhidas só entre matérias do mesmo autor ou sem autor vinculado (não se mexeu em texto assinado por outro médico). Backup do conteúdo anterior em `materias_bak_links_20260918`. Scripts no scratchpad: `inbound.mjs` (conta entradas), `cand.mjs` (candidatas por afinidade), `aplicar-links-18.mjs` (insere frase + link num parágrafo do meio, longe de outros links e fora do FAQ; env PLANO, MINW, MINPOS, SAIDA).
