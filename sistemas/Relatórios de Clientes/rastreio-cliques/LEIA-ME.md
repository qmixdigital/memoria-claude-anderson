# Rastreio de cliques de contato — rede QMIX

Mede quantos pacientes clicam para falar com o médico. Sem isso, o relatório
mostra visitas e para por aí, sem responder a única pergunta que o cliente
realmente faz: **quantas pessoas me procuraram?**

## O problema que motivou isto

Auditoria no GA4 do Dr. Ulbiramar (propriedade 378259356), em 30 dias:

| Evento | Vezes | Marcado como conversão |
|---|---|---|
| cta_cirurgia_wa | 18 | Não |
| generate_lead | 18 | Não |

Três defeitos:

1. **Só um botão é rastreado.** A home tem 8 links de WhatsApp e 1 de telefone.
   Apenas o CTA de cirurgia dispara evento. Os outros 8 são invisíveis.
2. **Contagem dobrada.** O mesmo clique dispara dois eventos, então somar dá 36
   quando o real é 18. O relatório já compensa isso usando o maior valor em vez
   da soma, mas a origem do problema é a instrumentação.
3. **Nada marcado como evento-chave.** O GA4 não conta como conversão, não
   calcula taxa nos relatórios nativos e não alimenta o Google Ads.

## Solução

Um único ouvinte delegado no `document` captura todo clique de WhatsApp,
telefone e e-mail do site, incluindo botões criados depois pelo React.

**Um único evento**, `generate_lead`, que é o nome recomendado pelo Google. O
que distingue um botão do outro vai nos parâmetros, nunca no nome:

| Parâmetro | Valores | Para que serve |
|---|---|---|
| `metodo` | whatsapp, telefone, email | Por onde o paciente preferiu falar |
| `local` | hero, cabecalho, rodape, botao_flutuante, faq, formulario | Qual CTA converte |
| `texto_botao` | texto ou aria-label do link | Qual chamada funciona |
| `pagina` | caminho da URL | Qual página gera contato |

## Instalar

**HTML estático:** copie `rastreio.js` para `/js/` e adicione antes de `</body>`:

```html
<script src="/js/rastreio.js" defer></script>
```

**Next.js (App Router):** copie para `public/js/` e no `layout.tsx`:

```tsx
<Script src="/js/rastreio.js" strategy="afterInteractive" />
```

**WordPress:** enfileire no `functions.php` do child theme:

```php
wp_enqueue_script('rastreio-qmix', get_stylesheet_directory_uri() . '/js/rastreio.js', [], null, true);
```

Nenhum botão precisa ser alterado. Para nomear um CTA específico, opcionalmente:

```html
<div data-rastreio-local="cta_pos_depoimentos"> ... </div>
```

## Instalar também no blog

O blog é onde o paciente chega pelo Google e pela IA, então é lá que a maior
parte do contato começa. Levantamento em `blog.cirurgiadojoelhogoiania.com`:

| Verificação | Situação |
|---|---|
| GA4 instalado | Sim, `G-78ZBT9EC66` |
| É a mesma propriedade do site? | **Sim**, mesmo fluxo de dados da propriedade 378259356 |
| Sessão se mantém do blog para o site? | Sim, são subdomínios do mesmo domínio, o cookie do GA4 é compartilhado |
| Links de WhatsApp nos artigos | **4 por artigo, nenhum rastreado** |
| Links de WhatsApp na home do blog | **Nenhum** |

Duas conclusões: o tráfego do blog **já está** contabilizado no relatório, e os
4 botões por artigo são contato perdido na medição. A home do blog não tem
nenhum CTA, o que é oportunidade aberta.

Instalação no WordPress, no `functions.php` do child theme:

```php
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_script(
        'rastreio-qmix',
        get_stylesheet_directory_uri() . '/js/rastreio.js',
        [], null, true
    );
});
```

Como blog e site dividem o mesmo fluxo de dados, o parâmetro `pagina` já
distingue a origem do clique, e nenhuma configuração de domínio cruzado é
necessária.

## Marcar como evento-chave no GA4 (obrigatório)

Sem este passo o evento é registrado mas não vira conversão.

Situação atual da propriedade 378259356, verificada pela Admin API: **o único
evento-chave é `purchase`**, que não se aplica a consultório médico. O
`generate_lead` não está marcado.

**Pelo painel**, dois cliques:

1. GA4 → Administrador → **Eventos**
2. Localize `generate_lead`
3. Ligue **Marcar como evento-chave**

**Por API, que é o caminho normal hoje:** a conta de serviço
`enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` tem permissão de
escrita nas propriedades da rede, então dá para marcar evento-chave e criar
dimensão personalizada por script, sem abrir painel. Use `ga4_admin.py --auto`
para ver o que falta em todas as contas e `--auto --aplicar` para gravar.

Numa propriedade nova, se vier `403 The caller does not have permission`, é
porque a conta de serviço ainda não foi adicionada ali: basta incluí-la em
Administrador → Acesso à propriedade, com papel de Editor.

Vale por propriedade e leva até 24h para aparecer nos relatórios nativos. O
nosso relatório lê a contagem mesmo antes disso, pela métrica `eventCount`.

## Registrar os parâmetros como dimensões personalizadas

Sem registrar, os parâmetros são coletados mas não podem ser usados para
segmentar dentro do GA4. Em Administrador → **Definições personalizadas** →
Criar dimensão personalizada, escopo **Evento**:

| Nome | Parâmetro |
|---|---|
| Método de contato | `metodo` |
| Local do botão | `local` |
| Texto do botão | `texto_botao` |

Limite de 50 dimensões de escopo de evento por propriedade. Vale a pena
registrar as três: são elas que respondem "qual botão devo mudar".

## Detalhes de implementação

- **Fase de captura** no `addEventListener`, para registrar mesmo se outro
  script chamar `stopPropagation`.
- **Fila com reenvio**: o GA4 destes sites carrega tarde, só após a primeira
  interação. Um clique pode chegar antes do `gtag` existir, então o evento
  fica na fila e é reenviado por até 10 segundos.
- **Guarda contra duplicidade**: `window.__rastreioQmix` impede um segundo
  ouvinte se o script for incluído duas vezes.
- **Sem dado pessoal**: nenhum parâmetro carrega nome, telefone ou e-mail do
  visitante, apenas o texto do botão e o caminho da página.

## Depois de instalar

1. Abra o site com `?debug_mode=true` e confira em GA4 → Administrador →
   **DebugView** se o `generate_lead` chega com os parâmetros preenchidos.
2. Clique em botões de seções diferentes e confirme que `local` muda.
3. **Remova o disparo antigo do `cta_cirurgia_wa`** no código do site, senão a
   contagem dobrada continua.
4. Rode `python relatorio.py` e confira o bloco "Contatos gerados pelo site".

## Engajamento além do contato: `engajamento.js`

Companheiro do `rastreio.js`. Instala-se do mesmo jeito, ao lado dele:

```html
<script src="/js/rastreio.js" defer></script>
<script src="/js/engajamento.js" defer></script>
```

Eventos que envia, todos lidos pelo bloco "Engajamento no site" do relatório:

| Evento | Parâmetros | O que responde |
|---|---|---|
| `social_click` | `rede`, `local`, `texto_botao` | Quantos clicaram no Instagram, YouTube, Doctoralia, Google Maps, e de onde |
| `cta_click` | `texto_botao`, `local` | Quais chamadas do site (que não são contato direto) chamam atenção |
| `faq_open` | `pergunta` | Quais perguntas do FAQ o visitante abre |
| `leitura` | `profundidade` (25, 50, 75, 100) | Até onde o leitor vai nos artigos |
| `video_play` | `titulo_video` | Clique no facade do YouTube (antes do iframe existir) |
| `share` | `method`, `content_type`, `item_id` | Compartilhamento do artigo (botão com `data-rastreio-compartilhar="whatsapp"`, `"copiar_link"`) |

Dimensões personalizadas a registrar na propriedade, escopo evento: `rede`,
`pergunta`, `profundidade`, `method` (além de `metodo`, `local`, `texto_botao`, que o
`rastreio.js` já usa). O `ga4_admin.py` ainda não cria essas três; foi feito
por script na propriedade do Dr. Bruno Air em 17/09/2026.

Instalado em: drbrunoair.com.br (site + blog, 17/09/2026); cirurgiadecolunagoiania.com.br (site + blog, 17/09/2026).

## Consent Mode v2: o GA4 precisa carregar mesmo sem "Aceitar todos"

Achado no Dr. Bruno Air em 17/09/2026: com o GA4 carregando só depois do
aceite de cookies, o relatório via 300 sessões por mês enquanto o Search
Console registrava 5.091 cliques do Google. E o blog WordPress nem tinha o tag.

A forma certa, que a LGPD e a GDPR aceitam: carregar o gtag sempre, com
`gtag('consent', 'default', { analytics_storage: 'denied', ... })` antes dele.
Sem consentimento o GA4 envia pings anônimos, sem cookie e sem identificador;
o aceite faz `gtag('consent', 'update', { analytics_storage: 'granted' })`.
Referência de implementação: `analytics-consent.js` do drbrunoair.com.br.

Ao auditar um cliente novo, comparar sempre **sessões do GA4 × cliques do
Search Console** no mesmo período. Uma razão abaixo de 50% é rastreio
quebrado, não site sem tráfego.
