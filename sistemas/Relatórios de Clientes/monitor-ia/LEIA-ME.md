# Relatório de Presença Digital — QMIX Digital

Gera **um único relatório HTML por cliente**, reunindo três fontes:

| Seção | Fonte | O que responde |
|---|---|---|
| 01 Visibilidade em IA | ChatGPT, Claude, Gemini, Perplexity (com busca na web) | Você aparece quando o paciente pergunta a uma IA? Em que posição? |
| 02 Desempenho no Google | Search Console | Quantos cliques, quais termos, quais páginas |
| 03 Audiência do site | Google Analytics 4 | Quantas pessoas, por onde chegaram, quantas vieram de IA |

O destaque da seção 01 é a **lista na ordem exata que a IA entregou**, com o nome do
cliente grifado dentro dela, para ele enxergar de imediato onde está entre os
concorrentes. O nome também sai grifado dentro do trecho citado.

## 1. Instalar

```bash
pip install -r requirements.txt
cp config.example.json config.json
```

## 2. Chaves e credenciais

**IAs** (variáveis de ambiente, só as que for usar):

```bash
export OPENAI_API_KEY="sk-proj-..."     # platform.openai.com
export ANTHROPIC_API_KEY="sk-ant-..."   # console.anthropic.com
export GEMINI_API_KEY="..."             # aistudio.google.com
export PERPLEXITY_API_KEY="pplx-..."    # perplexity.ai/settings/api
export SERPER_API_KEY="..."             # serper.dev, só para o AI Overview
```

**Google** (contas de serviço, arquivos JSON em `pasta_credenciais`): cada conta
precisa de acesso concedido **por propriedade**, no painel:

- Search Console: adicionar o `client_email` da conta como usuário da propriedade
- GA4: adicionar o `client_email` com papel Leitor **na propriedade**, não só na conta

Para ver o que cada conta de serviço já enxerga hoje:

```bash
python google_dados.py --listar
```

## 3. Configurar o cliente

```jsonc
{
  "pasta_credenciais": "C:/Users/User/Documents/APIs",
  "concorrentes": [ /* lista global, ver abaixo */ ],
  "clientes": [{
    "id": "dr-exemplo",
    "nome": "Dr. Fulano de Tal",
    "apelidos": ["Fulano de Tal", "drfulano.com.br"],
    "prompts": ["Quem é o melhor ortopedista de joelho em Goiânia?"],
    "concorrentes": [ /* opcional, sobrepõe a lista global */ ],
    "google": {
      "search_console": { "site": "sc-domain:exemplo.com.br",
                          "credencial": "conta-sa.json" },
      "ga4":            { "propriedade": "378259356",
                          "credencial": "outra-conta-sa.json" }
    }
  }]
}
```

**Como levantar os concorrentes:** rode a primeira vez com `"concorrentes": []`.
As respostas revelam quem disputa o espaço. Coloque esses nomes no config e rode
`reanalisar.py`, que recalcula tudo **sem gastar API**.

## 4. Rodar

```bash
python monitor.py                 # consulta as IAs, em paralelo
python monitor.py --cliente id    # só um cliente
python reanalisar.py              # recalcula posições sobre respostas já salvas (custo zero)
python relatorio.py               # relatório único em resultados/
python relatorio.py --dias 7      # janela menor
python relatorio.py --sem-google   # pula Search Console e GA4
python relatorio.py --exemplo      # exemplo com dados fictícios
```

## 5. Automatizar (cron, ex.: toda segunda às 8h)

```
0 8 * * 1 cd /caminho/monitor-ia && python3 monitor.py && python3 relatorio.py
```

Se nenhum relatório for gerado, o `relatorio.py` sai com código 1 e o cron avisa.

## Observações de implementação

- **Busca na web ligada em todos os provedores.** Sem isso o modelo responde de
  memória e o dado não representa o que o paciente vê.
- **Falhas não somem.** Erro de API vira linha com `erro` preenchido e aparece como
  aviso de cobertura no relatório, em vez de inflar o percentual em silêncio.
- **Retry com backoff** em 429 e 5xx. O 401 falha rápido, sem retry.
- **Detecção de nome** por regex presa a limite de palavra, tolerante a acento e
  pontuação: `Ciclana` não casa dentro de `draciclana`.
- **Search Console** fecha os dados com ~3 dias de atraso, o GA4 com ~1 dia. As janelas
  já compensam isso, e o período real sai impresso no relatório.
- **Modelos:** confira em `config.json`. O Gemini aposenta modelos com frequência;
  se der 404, liste os disponíveis com a API e atualize o campo `modelo`.
- **Privacidade:** `config.json`, `monitor.db` e `resultados/` estão no `.gitignore`.
  São nomes de clientes reais, respostas completas e dados de tráfego.

## Custo

Cerca de US$ 0,05 por pergunta no ChatGPT com busca, e mais no Claude, porque os
resultados da busca entram como tokens de entrada (~17 mil por consulta). Search
Console e GA4 são gratuitos. O `monitor.py` imprime o custo estimado ao fim de cada
rodada, e o `reanalisar.py` custa zero.
