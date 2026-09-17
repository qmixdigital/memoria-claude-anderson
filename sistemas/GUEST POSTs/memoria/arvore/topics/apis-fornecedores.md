---
name: apis-fornecedores
description: Plataformas e fornecedores de API que o Anderson quer ter à mão na hora de criar ferramentas (APIBrasil, apis.io, RapidAPI)
sources: [chat]
aliases: [APIBrasil, apis.io, RapidAPI, fornecedores de API, catálogo de APIs]
---

- [stated] Anderson pediu para manter essas plataformas memorizadas e indicá-las sempre que for criar ferramenta, projeto ou integração nova
- [stated] Instalou o MCP do apis.io no VS Code

## APIBrasil (a mais relevante para os projetos brasileiros)
- [stated] Gateway único: https://gateway.apibrasil.io/api/v2 ; documentação aberta em https://doc.apibrasil.io (toda página tem versão .md, cada API tem OpenAPI 3.1 em /openapi.json, tem llms-full.txt e busca em /busca.md?q=termo)
- [stated] 175 APIs no mesmo token. Chamadas são POST com JSON
- [stated] Autenticação: `Authorization: Bearer` em tudo. Header `DeviceToken` só nas APIs cobradas por plano, que hoje são só as de WhatsApp
- [stated] `"homolog": true` no corpo roda em sandbox com a forma real da resposta e sem cobrança. CPF de teste: 00000000000
- [stated] Armadilha: erro pode voltar com HTTP 200. Checar `error === false` antes de ler `data`. A resposta traz balance, tax e valor_consulta
- [stated] Tem SDK oficial em Node/TS, Python, PHP, Go, Rust, Ruby, Java, C#, Elixir, Flutter e outras, e servidor MCP próprio com guia para VS Code, Cursor, Zed e Claude Desktop
- [stated] Categorias: Análise de Crédito (33), Segurança Veicular (29), Antifraude (20), CRLV (15), Consulta CNPJ (13), Comunicação (11), Precificação Veicular (10), Busca e Cobrança (9), Certidões (8), Consultas Assíncronas (6), Relatórios Whitelabel (5), Serviços Digitais (4), Conselhos Profissionais (3), entre outras
- [stated] Preços de referência por consulta (podem mudar, conferir no catálogo): API CNPJ R$ 0,04 ; CEP com IBGE R$ 0,04 ; CPF Lite R$ 0,12 ; CPF Receita Federal e Dados Cadastrais R$ 0,34 ; CPF Search R$ 0,45 ; CRM, CRO e CRBM R$ 0,40 ; CPF Óbito R$ 0,58 ; Antecedentes Criminais R$ 0,79 ; Protesto Nacional R$ 1,72 ; Quod Score R$ 7,50 ; SCR Bacen R$ 7,80
- [stated] Relatórios Whitelabel prontos em PDF: CPF Relatório R$ 0,45 ; Veicular Relatório R$ 0,14
- [stated] WhatsApp: oficial Meta Cloud API R$ 399,90/mês, modo Coexistence R$ 129,90/mês. Motores não oficiais (Baileys R$ 12,90, WhatsMeow R$ 19,90, WPP R$ 21,90) são WhatsApp Web automatizado e arriscam banimento de número, não usar em nome de cliente. SMS avulso R$ 0,10
- [stated] Alternativa direta à Procob no projeto da [[plataforma-consultas]]. Recomendação em aberto: usar APIBrasil como fornecedor inicial com camada de adaptador para poder trocar de fornecedor depois
- [stated] Cuidados: várias APIs estão só em homologação e não funcionam em produção ; APIs parecidas têm preços muito diferentes porque vêm de fornecedores diferentes, comparar em homologação antes de escolher ; é intermediário de bureaus (Quod, SPC, Boa Vista, SCPC, Serasa), não bureau direto ; consulta de dado pessoal exige base legal, finalidade registrada, termo do consultante e log de consultas por causa da LGPD e da fiscalização da ANPD

## apis.io
- [stated] Catálogo de descoberta, não marketplace. Não vende acesso nem gera chave, indexa mais de 27 mil provedores, 133 mil APIs e 2.600 servidores MCP
- [stated] REST aberto e somente leitura em https://apis.io/api/v1 ; MCP em https://apis.io/mcp ; skills em https://apis.io/skills/<nome>/SKILL.md
- [stated] Skills que valem: find-api, fetch-api-spec, integrate-provider. Serve para achar a API certa e puxar o OpenAPI real em vez do modelo chutar endpoint
- [stated] Catálogo é enviesado para fornecedores americanos. Para dado brasileiro não serve, usar APIBrasil ou BrasilAPI
- [stated] A página Model Visibility deles mede o que Claude, ChatGPT e Gemini dizem sobre cada provedor, com pergunta fechada, duas rodadas (com busca e de memória), três modelos nunca agregados e "não sei" contado à parte. Metodologia a copiar no serviço de [[monitor-ia]] da QMIX

## RapidAPI (Rapid)
- [stated] Marketplace com gateway, chave única e billing próprio. Comprado pela Nokia em novembro de 2024, marketplace público segue ativo
- [stated] Boa parte do catálogo são scrapers não oficiais mantidos por indivíduos, que quebram e somem. Usar só para prototipagem, migrar para o fornecedor direto quando virar produto de cliente pago

## Regra geral
- [stated] Para CNPJ e CEP existem alternativas gratuitas e estáveis (BrasilAPI, ReceitaWS) que valem mais que wrapper pago quando o volume é pequeno
- [stated] Para SERP e SEO, preferir DataForSEO ou Serper direto em vez dos wrappers do RapidAPI
