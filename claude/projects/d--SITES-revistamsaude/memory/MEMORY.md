# Memória — Revista Mais Saúde

- [Sempre commitar](sempre-commitar.md) — autorização permanente: commit + push sem perguntar, direto na master

- [Deploy workflow](deploy-workflow.md) — VPS opengravity, sem git pull, transfer via tar+base64, build só na VPS
- [ISR revalidate nas fichas](isr-revalidate-fichas.md) — generateStaticParams sem revalidate = página congelada, edição do admin não aparece
- [Editar conteúdo de matéria](editar-conteudo-materia.md) — conteúdo é Lexical JSON no Postgres; editar via script pg + revalidar (headings/links/SEO)
- [Publicar matéria via SQL](publicar-materia-via-sql.md) — API local do Payload não carrega na VPS; criar matéria + imagem com pg + sharp
- [Categoria vs cidade](categoria-vs-cidade.md) — /categoria/[slug] serve dois campos; mudar `categoria` não tira a matéria da listagem da cidade
- [SEO titles e checagens](seo-titles-e-checagens.md) — title = metaTitle<=47 + ' | Mais Saúde'; mojibake/travessão: regex certa e heredoc via base64
- [Pendências SEO set/2026](pendencias-seo-2026-09.md) — 6 itens da análise de 11/09 deixados para depois (profissionais no corpo, relacionadas reais, tags, H1, needrestart)
- [Importar matéria via Markdown](importar-materia-markdown.md) — fluxo preferido: conteudo/*.md + imagem, `scripts/subir-md.py`; rota /api/importar-md; guia com prompt para IA em docs/
- [GSC: migração de abril/2026 zerou os pilares](gsc-migracao-abril-2026.md) — 3 artigos perdidos, 10 pilares a zero desde a migração; convênio (Unimed) é o maior cluster
- [28 matérias publicadas em 11/09/2026](conteudo-publicado-2026-09-11.md) — perdidas recriadas, pilares reescritos, novas com data de 2025 fora da home; fluxo agentes + validador
- [Acesso ao GSC da COE e clientes](gsc-coe-acesso.md) — contas de serviço do app de indexação na VPS enxergam coegoiania e outros ortopedistas; COE teve spam de invasão
- [Relatório GSC 18/09/2026](gsc-relatorio-2026-09-18.md) — 14 pautas novas e 7 reescritas em docs/relatorio-gsc-2026-09-18.md; impressões dobraram após as 48 matérias
- [Autores e redatores](autores-e-redatores.md) — quem assina cada tema (Juliana Borges nutrição, Camila Farias endocrino, Tredicci digestivo, Bufaiçal/Caixeta/Ulbiramar ortopedia, Tiago Brito o resto); site do autor é o primeiro link
- [IndexNow e Bing](indexnow-bing.md) — chaves e endpoints para submeter URLs e sitemap ao Bing, IndexNow e Google
- [Matéria assinada = primeira pessoa](materia-assinada-primeira-pessoa.md) — texto na voz do médico; link forte para a página de serviço do site dele; site nofollow na assinatura (correção forte do Anderson, 21/09)
- [Loop 301/308 em /api/media](nginx-api-media-loop.md) — campo Foto do painel travado e upload falhando; bloco de cache do nginx tem de ser /api/media/file/
