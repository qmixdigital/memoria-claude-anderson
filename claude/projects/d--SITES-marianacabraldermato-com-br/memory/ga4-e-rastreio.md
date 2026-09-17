---
name: ga4-e-rastreio
description: "Property GA4, chave de acesso e o esquema de eventos do site da Dra. Mariana (WhatsApp e vídeo)"
metadata:
  type: reference
---

Medição do site marianacabraldermato.com.br, montada em 08/09/2026.

- GA4 **G-MLFHFRC852**, property **497957627** ("Dra. Mariana Cabral", conta SEO Clientes)
- GTM GTM-K957KCH8 carrega só a conversão do Google Ads AW-11559895530; a tag GA4 **não**
  está no container, o gtag.js é carregado direto por `mu-plugins/mc-tracking.php`
- Ambos sobem na **primeira interação do usuário**, não no page load, para não pesar o LCP

**Chave de leitura e escrita:** `C:\Users\User\Documents\APIs\enjai-493011-5bc78ff8f355.json`
(`enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com`). Enxerga as ~90 properties da
conta SEO Clientes e **tem permissão de escrita** com o escopo `analytics.edit`: criei
dimensões personalizadas e eventos principais por ela. `runRealtimeReport` da Data API é
o único jeito de conferir um evento novo sem esperar 24h.

**Eventos** (`mu-plugins/mc-eventos.php`, v2.0, substituiu o mc-video-track.php):

| evento | quando | parâmetros |
|---|---|---|
| `clique_whatsapp` | qualquer link de WhatsApp da página | origem, texto_botao, link_destino |
| `clique_telefone` | links `tel:` | idem |
| `clique_instagram` | links do Instagram | idem |
| `visualizacao_video` | play em vídeo com `controls` | video_title, video_url, video_provider, video_duration |
| `progresso_video` | 25%, 50%, 75% | idem + video_percent |
| `video_completo` | fim do vídeo | idem |

`origem` vale cabecalho, conteudo, rodape, barra_mobile, botao_flutuante ou menu_mobile.
Registrados como dimensão personalizada de escopo EVENT: `origem`, `texto_botao`,
`video_title`, `video_percent`, `video_provider`. Eventos principais: `clique_whatsapp`,
`clique_telefone`, `visualizacao_video`.

**Nomes em português de propósito:** o GA4 mostra o nome cru do evento, não existe apelido
de exibição, e quem lê o relatório é o cliente.

**Why:** `videoTitle` e `videoPercent` **não são dimensões nativas** da Data API, apesar de
o GA4 usar esses nomes na medição aprimorada do YouTube. Sem registrar, o evento aparece na
contagem mas não dá para saber qual vídeo nem de onde veio o clique.

**How to apply:** só medir vídeo com atributo `controls`; os outros 49 do site são mudos,
em loop e partem sozinhos, e contá-los inflaria a métrica. O `mc-cta.php` continua
disparando `generate_lead` e `cta_click` nos dois botões fixos: **não remover**, porque a
conversão do Google Ads pode depender disso. Ver [[dados-juridicos-clinica]].
