#!/usr/bin/env python3
"""
Relatorio unico do cliente: Visibilidade em IA + Search Console + Analytics.

Uso:
  python relatorio.py                 # todos os clientes, ultimos 30 dias
  python relatorio.py --cliente id    # so um cliente
  python relatorio.py --dias 30       # janela do relatorio
  python relatorio.py --sem-google    # pula Search Console e GA4 (offline)
  python relatorio.py --exemplo       # exemplo com dados ficticios
"""

import argparse
import base64
import html
import json
import os
import sqlite3
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from urllib.parse import quote_plus

from monitor import compilar_padrao, normalizar_com_mapa

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, "monitor.db")
CONFIG = os.path.join(BASE, "config.json")
SAIDA = os.path.join(BASE, "resultados")
MARCA = os.path.join(BASE, "marca")


def embutir(arquivo, mime):
    """Imagem como data URI, para o HTML viajar sozinho por e-mail."""
    caminho = os.path.join(MARCA, arquivo)
    if not os.path.exists(caminho):
        return None
    with open(caminho, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


LOGO = embutir("logomarca-qmix.webp", "image/webp")
FAVICON = embutir("favicon-qmix.png", "image/png")

# Selos das fontes de dado. SVG inline nas cores do Google, para o medico
# reconhecer de onde veio cada secao sem precisar ler a legenda.
SELO_GSC = """<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
<circle cx="10.5" cy="10.5" r="6.6" fill="none" stroke="#4285F4" stroke-width="2.1"/>
<path d="M15.4 15.4 L21 21" stroke="#4285F4" stroke-width="2.4" stroke-linecap="round"/>
<rect x="7.6" y="10.4" width="1.7" height="3.4" fill="#EA4335"/>
<rect x="10.2" y="8.2" width="1.7" height="5.6" fill="#FBBC04"/>
<rect x="12.8" y="6.4" width="1.7" height="7.4" fill="#34A853"/></svg>"""

SELO_GA4 = """<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
<rect x="3.4" y="13.4" width="4.3" height="7.2" rx="2.1" fill="#F9AB00"/>
<rect x="9.9" y="8.6" width="4.3" height="12" rx="2.1" fill="#E37400"/>
<rect x="16.4" y="3.4" width="4.3" height="17.2" rx="2.1" fill="#E37400"/></svg>"""

# Ícones das ferramentas e redes, em SVG inline nas cores de cada marca.
# Onde o símbolo é simples e fiel, desenhamos a forma; onde seria uma imitação
# ruim do logotipo, usamos um selo com a inicial. Assim nada fica "quase igual".
def _selo(cor, letra, claro="#fff"):
    return (f'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
            f'<rect width="24" height="24" rx="6" fill="{cor}"/>'
            f'<text x="12" y="17" text-anchor="middle" fill="{claro}" '
            f'font-family="Segoe UI,Arial,sans-serif" font-size="13" '
            f'font-weight="700">{letra}</text></svg>')


ICONES = {
    # --- inteligência artificial ---
    "ChatGPT": ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
                '<rect width="24" height="24" rx="6" fill="#10A37F"/>'
                '<path d="M6.6 8.4h10.8v6.2h-5.1l-3.2 2.5v-2.5H6.6z" fill="#fff"/>'
                '</svg>'),
    "Claude": ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
               '<g stroke="#D97757" stroke-width="1.9" stroke-linecap="round">'
               '<path d="M12 3.6v5"/><path d="M12 15.4v5"/><path d="M3.6 12h5"/>'
               '<path d="M15.4 12h5"/><path d="M6.1 6.1l3.5 3.5"/>'
               '<path d="M14.4 14.4l3.5 3.5"/><path d="M17.9 6.1l-3.5 3.5"/>'
               '<path d="M9.6 14.4l-3.5 3.5"/></g></svg>'),
    "Gemini": ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
               '<path d="M12 1.8c.7 5.6 4.6 9.5 10.2 10.2-5.6.7-9.5 4.6-10.2 10.2'
               '-.7-5.6-4.6-9.5-10.2-10.2C7.4 11.3 11.3 7.4 12 1.8z" '
               'fill="#4285F4"/></svg>'),
    "Perplexity": _selo("#20808D", "P"),
    "Microsoft Copilot": _selo("#0078D4", "C"),
    "Google AI Overview": ('<svg viewBox="0 0 24 24" width="18" height="18" '
                           'aria-hidden="true"><path d="M12 2.6c.6 4.7 3.9 8 8.6 8.6'
                           '-4.7.6-8 3.9-8.6 8.6-.6-4.7-3.9-8-8.6-8.6C8.1 10.5 '
                           '11.4 7.3 12 2.6z" fill="#EA4335"/></svg>'),
    # --- redes sociais ---
    "Instagram": ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
                  '<rect x="3" y="3" width="18" height="18" rx="5.4" fill="none" '
                  'stroke="#E4405F" stroke-width="2"/><circle cx="12" cy="12" r="4.1" '
                  'fill="none" stroke="#E4405F" stroke-width="2"/>'
                  '<circle cx="17.3" cy="6.7" r="1.35" fill="#E4405F"/></svg>'),
    "Facebook": _selo("#1877F2", "f"),
    "YouTube": ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
                '<rect x="1.8" y="5.2" width="20.4" height="13.6" rx="4" fill="#FF0000"/>'
                '<path d="M10.2 8.9l5.6 3.1-5.6 3.1z" fill="#fff"/></svg>'),
    "LinkedIn": _selo("#0A66C2", "in"),
    "X (Twitter)": _selo("#14181b", "X"),
    "Pinterest": _selo("#E60023", "P"),
    "TikTok": _selo("#010101", "t"),
    "Claude (site)": _selo("#D97757", "C"),
    # --- genéricos ---
    "Acesso direto": ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
                      '<circle cx="12" cy="12" r="8.6" fill="none" stroke="#7d90a4" '
                      'stroke-width="1.9"/><path d="M3.6 12h16.8M12 3.4c4.4 4.6 4.4 12.6 0 17.2'
                      'M12 3.4c-4.4 4.6-4.4 12.6 0 17.2" fill="none" stroke="#7d90a4" '
                      'stroke-width="1.5"/></svg>'),
}

ICONE_LINK = ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
              '<path d="M10.2 13.8a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.3 1.3" '
              'fill="none" stroke="#7d90a4" stroke-width="1.9" stroke-linecap="round"/>'
              '<path d="M13.8 10.2a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.3-1.3" '
              'fill="none" stroke="#7d90a4" stroke-width="1.9" stroke-linecap="round"/></svg>')

ICONE_BUSCA = ('<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
               '<circle cx="10.6" cy="10.6" r="6.4" fill="none" stroke="#7d90a4" '
               'stroke-width="2"/><path d="M15.3 15.3L20.6 20.6" stroke="#7d90a4" '
               'stroke-width="2.3" stroke-linecap="round"/></svg>')


def icone(nome, padrao=None):
    if nome in ICONES:
        return ICONES[nome]
    # Variacoes da mesma rede ("Instagram (live)", "Anúncios Meta (...)")
    # usam o icone da rede base.
    for base in ("Instagram", "Facebook"):
        if nome.startswith(base) or "Meta" in nome and base == "Facebook":
            return ICONES.get(base, padrao if padrao is not None else ICONE_LINK)
    return padrao if padrao is not None else ICONE_LINK


NOMES = {
    "openai": "ChatGPT",
    "anthropic": "Claude",
    "gemini": "Gemini",
    "perplexity": "Perplexity",
    "google_ai_overview": "Google AI Overview",
}

# O GA4 nomeia evento em código. O cliente lê "generate_lead" e não entende
# que aquilo é o botão de contato dele sendo clicado.
EVENTOS_PT = {
    "generate_lead": "Clique no botão de contato",
    "form_submit": "Formulário enviado",
    "form_start": "Formulário iniciado",
    "whatsapp": "Clique no WhatsApp",
    "whatsapp_click": "Clique no WhatsApp",
    "wa_click": "Clique no WhatsApp",
    "telefone_click": "Clique no telefone",
    "contato_enviado": "Contato enviado",
    "clique_whatsapp": "Clique no WhatsApp",
    "clique_telefone": "Clique no telefone",
    "click_to_call": "Clique para ligar",
    "add_to_cart": "Produto adicionado ao carrinho",
    "begin_checkout": "Compra iniciada",
    "add_shipping_info": "Frete informado",
    "add_payment_info": "Pagamento informado",
    "purchase": "Compra concluída",
    "sign_up": "Cadastro criado",
    "cta_cirurgia_wa": "Clique no botão de cirurgia (WhatsApp)",
    "video_start": "Vídeo iniciado",
    "video_progress": "Vídeo assistido em parte",
    "video_complete": "Vídeo assistido até o fim",
}


def nome_evento(bruto):
    """Nome do evento em português, sem código técnico."""
    chave = str(bruto).strip()
    if chave in EVENTOS_PT:
        return EVENTOS_PT[chave]
    if chave.lower().startswith("cliques para o whatsapp"):
        return "Cliques para o WhatsApp (medição automática)"
    return chave.replace("_", " ").capitalize()


CANAIS = {
    "Organic Search": "Busca orgânica",
    "Direct": "Direto",
    "Organic Social": "Redes sociais",
    "Paid Search": "Busca paga",
    "Referral": "Indicação de sites",
    "Unassigned": "Não classificado",
    "Email": "E-mail",
    "AI Assistant": "Assistente de IA",
    "Organic Video": "Vídeo orgânico",
    # Campanhas que o Google entrega em várias redes ao mesmo tempo, como
    # Performance Max. Ele não informa qual rede trouxe o clique, por isso
    # a origem chega como "(data not available)".
    "Cross-network": "Anúncios do Google (multicanal)",
    "Paid Shopping": "Anúncios de produto (Shopping)",
    "Organic Shopping": "Vitrine de produtos (não paga)",
    "Paid Social": "Redes sociais pagas",
    "Paid Video": "Vídeo pago",
    "Paid Other": "Outras mídias pagas",
    "Display": "Banners de display",
    "Affiliates": "Afiliados",
    "Audio": "Áudio",
    "SMS": "SMS",
    "Mobile Push Notifications": "Notificações no celular",
    "Push Notifications": "Notificações push",
}

CSS = """
/* Paleta QMIX Digital (qmix.com.br): navy #03101e, verde neon #00ff66,
   ambar #ffaa00, frios #c7d5e5 / #8899aa / #556677.
   O neon so entra sobre fundo escuro; em fundo claro usamos o verde legivel. */
:root{
  --papel:#f2f7fc; --carta:#ffffff;
  --tinta:#03101e; --tinta2:#556677; --tinta3:#8899aa;
  --regua:rgba(3,16,30,.14); --regua2:rgba(3,16,30,.07);
  --neon:#00ff66; --alta:#046b39; --alta-fraca:#e2f9ec;
  --baixa:#c02646; --baixa-fraca:#fdeaee; --ambar:#ffaa00;
  --barra:#7d90a4; --grafo:#046b39;
  --ia-openai:#046b39; --ia-anthropic:#b06f00; --ia-gemini:#c02646;
  --ia-perplexity:#3f5468; --ia-overview:#6b7a8c;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--papel); color:var(--tinta);
  font-family:'IBM Plex Sans','Segoe UI',system-ui,sans-serif;
  font-size:15px; line-height:1.6; font-feature-settings:'kern' 1;
}
.folha{max-width:1080px; margin:0 auto; padding:0 28px}
.mono{font-family:'IBM Plex Mono',ui-monospace,'Cascadia Mono',monospace}
.num{font-variant-numeric:tabular-nums lining-nums}

/* ---------- capa ---------- */
.capa{
  background:var(--tinta); color:var(--papel); padding:52px 0 44px;
  background-image:radial-gradient(circle at 88% 6%, rgba(0,255,102,.30), transparent 48%);
}
.selo{font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:var(--neon)}
.capa h1{
  font-family:Fraunces,Georgia,'Times New Roman',serif;
  font-weight:600; font-size:clamp(30px,5vw,50px); line-height:1.06;
  margin:14px 0 10px; letter-spacing:-.015em;
}
.capa .sub{color:#c7d5e5; font-size:14px; margin:0}
.destaques{
  display:grid; gap:1px; background:rgba(255,255,255,.14); margin-top:38px;
  grid-template-columns:repeat(auto-fit,minmax(190px,1fr));
  border:1px solid rgba(255,255,255,.14);
}
.destaques div{background:var(--tinta); padding:20px 22px}
.destaques .v{font-size:31px; font-weight:600; line-height:1.1;
              letter-spacing:-.02em; color:var(--neon)}
.destaques .r{font-size:12px; color:#8899aa; margin-top:6px; line-height:1.45}

/* ---------- secoes ---------- */
section{padding:52px 0 8px; border-top:1px solid var(--regua)}
section:first-of-type{border-top:0}
.cab{display:flex; align-items:baseline; gap:16px; margin-bottom:6px}
.cab .idx{font-size:12px; color:var(--alta); letter-spacing:.14em}
.cab h2{
  font-family:Fraunces,Georgia,serif; font-weight:600;
  font-size:clamp(22px,3.2vw,30px); margin:0; letter-spacing:-.01em;
}
.linhafina{color:var(--tinta2); font-size:14px; margin:0 0 26px; max-width:65ch}
h3{font-size:13px; letter-spacing:.1em; text-transform:uppercase;
   color:var(--tinta2); margin:36px 0 14px; font-weight:600}
/* Um nivel abaixo do h3: o h3 e rotulo de secao, em caixa alta e esmaecido;
   o h4 e subtitulo dentro dela, entao vem em caixa normal e tinta cheia. */
h4{font-size:15px; color:var(--tinta); margin:28px 0 8px; font-weight:600;
   letter-spacing:0; text-transform:none}
h4 + .linhafina{margin-bottom:16px}

/* ---------- indicadores ---------- */
.kpis{display:grid; gap:14px; grid-template-columns:repeat(auto-fit,minmax(178px,1fr))}
.kpi{background:var(--carta); border:1px solid var(--regua2); border-radius:3px;
     padding:18px 20px 16px; box-shadow:0 1px 0 rgba(3,16,30,.04)}
.kpi .v{font-size:30px; font-weight:600; letter-spacing:-.025em; line-height:1.12}
.kpi .r{font-size:12.5px; color:var(--tinta2); margin-top:5px; line-height:1.4}
.chip{display:inline-block; font-size:11.5px; font-weight:600; margin-top:9px;
      padding:2px 8px; border-radius:2px; letter-spacing:.01em}
.chip.sobe{background:var(--alta-fraca); color:var(--alta)}
.chip.desce{background:var(--baixa-fraca); color:var(--baixa)}
.chip.igual{background:rgba(3,16,30,.05); color:var(--tinta2)}

/* ---------- ranking: o coracao do relatorio ---------- */
.perg{background:var(--carta); border:1px solid var(--regua2); border-radius:3px;
      padding:22px 24px 18px; margin-bottom:16px}
.perg .q{font-family:Fraunces,Georgia,serif; font-size:18px; font-weight:500;
         line-height:1.35; margin:0 0 4px}
.perg .meta{font-size:12px; color:var(--tinta3); margin:0 0 16px}
.rank{list-style:none; margin:0; padding:0; counter-reset:r}
.rank li{
  display:grid; grid-template-columns:34px 1fr; align-items:baseline; gap:12px;
  padding:9px 12px 9px 10px; border-radius:3px; font-size:14.5px;
  border-left:3px solid transparent;
}
.rank li + li{border-top:1px solid var(--regua2)}
.rank .pos{font-size:12px; color:var(--tinta3); letter-spacing:.02em}
.rank li.voce{
  background:var(--alta-fraca); border-left-color:var(--alta);
  border-top-color:transparent; font-weight:600;
}
.rank li.voce .pos{color:var(--alta)}
.rank li.voce .marca{
  font-size:10.5px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--alta); margin-left:10px; font-weight:600; white-space:nowrap;
}
.selo-ia{display:inline-flex; align-items:center; gap:8px; padding:6px 13px 6px 9px;
   border-radius:3px; font-size:12.5px; font-weight:700; letter-spacing:.06em;
   text-transform:uppercase; color:var(--ia-overview); background:var(--carta);
   border:1.5px solid currentColor}
.selo-ia svg{flex:0 0 auto}
.ia-openai .selo-ia{color:var(--ia-openai)}
.ia-anthropic .selo-ia{color:var(--ia-anthropic)}
.ia-gemini .selo-ia{color:var(--ia-gemini)}
.ia-perplexity .selo-ia{color:var(--ia-perplexity)}
.barra.com-ico .nome{display:flex; align-items:center; gap:9px}
.barra .ico{flex:0 0 auto; display:inline-flex; line-height:0}
.perg{border-top:3px solid var(--ia-overview)}
.perg.ia-openai{border-top-color:var(--ia-openai)}
.perg.ia-anthropic{border-top-color:var(--ia-anthropic)}
.perg.ia-gemini{border-top-color:var(--ia-gemini)}
.perg.ia-perplexity{border-top-color:var(--ia-perplexity)}
.topo-perg{display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:14px}
.topo-perg .meta{margin:0; font-size:12.5px; color:var(--tinta2)}
a{color:var(--alta); text-decoration:none; border-bottom:1px solid rgba(4,107,57,.3)}
a:hover{border-bottom-color:var(--alta); background:var(--alta-fraca)}
a:focus-visible{outline:2px solid var(--alta); outline-offset:2px}
.tab a, .barra a{color:var(--tinta); border-bottom-color:rgba(3,16,30,.18)}
.tab a:hover, .barra a:hover{color:var(--alta); border-bottom-color:var(--alta)}
.ausente{padding:12px 14px; background:rgba(3,16,30,.04); border-radius:3px;
         font-size:14px; color:var(--tinta2)}
.citacao mark{background:rgba(4,107,57,.15); color:var(--alta);
                font-weight:600; padding:1px 3px; border-radius:2px}
.citacao{margin:14px 0 0; padding:12px 16px; border-left:2px solid var(--regua);
         color:var(--tinta2); font-size:13.5px; font-style:italic}

/* ---------- barras ---------- */
.barras{background:var(--carta); border:1px solid var(--regua2);
        border-radius:3px; padding:22px 24px}
.barra{display:grid; grid-template-columns:minmax(150px,240px) 1fr 66px;
       align-items:center; gap:14px; padding:7px 0; font-size:14px}
.barra + .barra{border-top:1px solid var(--regua2)}
.barra .nome{overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.trilho{background:rgba(3,16,30,.07); height:9px; border-radius:1px}
.enche{background:var(--barra); height:9px; border-radius:1px; display:block}
.barra.voce .nome{font-weight:600; color:var(--alta)}
.barra.voce .enche{background:var(--alta)}
.barra .val{text-align:right; font-size:13px; color:var(--tinta2)}

/* ---------- grafico ---------- */
.grafico{background:var(--carta); border:1px solid var(--regua2);
         border-radius:3px; padding:22px 24px 14px}
.grafico svg{display:block; width:100%; height:auto}
.eixo{display:flex; justify-content:space-between; font-size:11.5px;
      color:var(--tinta3); margin-top:8px}

/* ---------- tabelas ---------- */
.tabwrap{overflow-x:auto}
.tab{width:100%; border-collapse:collapse; background:var(--carta);
     border:1px solid var(--regua2); border-radius:3px}
.tab caption{text-align:left; font-size:12.5px; color:var(--tinta3);
             padding:0 0 10px}
.tab th{text-align:left; font-size:11px; letter-spacing:.1em; text-transform:uppercase;
        color:var(--tinta2); font-weight:600; padding:13px 16px; border:0;
        background:transparent; border-bottom:1px solid var(--regua)}
.tab td{padding:12px 16px; border:0; border-top:1px solid var(--regua2);
        font-size:14px; vertical-align:top; background:transparent}
.tab td.n, .tab th.n{text-align:right; white-space:nowrap}
.tab tbody tr:first-child td{border-top:0}
.sim{color:var(--alta); font-weight:600}
.chave-nao{color:var(--baixa); font-weight:600}
.nao{color:var(--tinta3)}

.explica{background:#eef6ff; border:1px solid #cfe2f7; border-left:4px solid #3f5468;
   border-radius:3px; padding:16px 20px; margin:0 0 24px; font-size:13.5px;
   color:var(--tinta2); line-height:1.62}
.explica strong{color:var(--tinta); display:block; margin-bottom:5px; font-size:13px;
   letter-spacing:.03em; text-transform:uppercase}
.explica em{font-style:normal; font-weight:600; color:var(--tinta)}
.subtotal{display:flex; align-items:baseline; gap:10px; margin:0 0 12px}
.subtotal .n{font-size:26px; font-weight:600; letter-spacing:-.02em; color:var(--alta)}
.subtotal .t{font-size:13.5px; color:var(--tinta2)}
.fonte-dado{display:inline-flex; align-items:center; gap:8px; padding:6px 13px 6px 9px;
   background:var(--carta); border:1px solid var(--regua); border-radius:3px;
   font-size:12.5px; font-weight:600; color:var(--tinta); margin-bottom:16px}
.fonte-dado svg{flex:0 0 auto}
.artigos{background:var(--carta); border:1px solid var(--regua2); border-radius:3px;
   padding:6px 24px 12px}
.artigo{padding:14px 0; border-top:1px solid var(--regua2)}
.artigo:first-child{border-top:0}
.artigo .cab-f{display:flex; align-items:baseline; justify-content:space-between;
   gap:14px; margin-bottom:2px}
.artigo .dom{font-weight:600; font-size:14.5px}
.artigo .vezes{font-size:12.5px; color:var(--tinta3); white-space:nowrap}
.artigo.voce .dom a{color:var(--alta)}
.artigo.voce .enche{background:var(--alta)}
.seu-site{display:inline-block; margin-left:8px; padding:1px 7px; border-radius:3px;
   background:var(--alta); color:#fff; font-size:10.5px; font-weight:600;
   letter-spacing:.05em; text-transform:uppercase; vertical-align:middle}
.artigo .trilho{margin:7px 0 9px}
.artigo ul{list-style:none; margin:0; padding:0}
.artigo li{font-size:13px; line-height:1.5; padding:3px 0 3px 15px; position:relative;
   overflow-wrap:anywhere}
.artigo li::before{content:"↗"; position:absolute; left:0; color:var(--tinta3);
   font-size:11px; top:5px}
.assinatura{display:flex; align-items:center; gap:26px; flex-wrap:wrap;
   padding:24px 26px; background:var(--tinta); border-radius:3px; margin-top:20px}
.assinatura img{display:block; height:36px; width:auto; flex:0 0 auto}
.texto-marca{flex:1 1 300px; min-width:0}
.assinatura p{margin:0; color:#c7d5e5}
.assinatura .chamada{font-family:Fraunces,Georgia,serif; font-size:19px;
   line-height:1.25; color:#fff; letter-spacing:-.01em}
.assinatura .promessa{font-size:13.5px; line-height:1.55; margin-top:5px;
   max-width:52ch}
.assinatura .creditos{font-size:12px; color:#8899aa; margin-top:11px}
/* Especificidade acima de ".rodape strong", que é escuro e vem depois. */
.rodape .assinatura strong{color:var(--neon); font-weight:600}
@media (max-width:640px){
  .assinatura{flex-direction:column; align-items:flex-start; gap:16px;
              padding:22px 20px}
  /* Em coluna, o eixo principal vira o vertical: sem zerar isto, o
     flex-basis de 300px passa a valer como ALTURA e estica a caixa. */
  .texto-marca{flex:0 0 auto; width:100%}
  .assinatura .promessa{max-width:none}
}
.assinatura a{color:var(--neon); border-bottom-color:rgba(0,255,102,.4)}
.assinatura a:hover{background:transparent; border-bottom-color:var(--neon)}
.marca-texto{font-family:Fraunces,Georgia,serif; font-size:22px; color:var(--neon)}
.video .cab .idx{font-size:15px}
.quadro{position:relative; aspect-ratio:16/9; background:var(--tinta);
   border-radius:3px; overflow:hidden; border:1px solid var(--regua2)}
.quadro iframe{position:absolute; inset:0; width:100%; height:100%; border:0}
/* O iframe já traz a própria proporção: forçar 16/9 por cima distorce. */
.quadro.livre{aspect-ratio:auto; overflow:visible; background:transparent;
   border:0; border-radius:0}
.quadro.livre iframe{position:static; inset:auto; height:auto;
   border-radius:3px; border:1px solid var(--regua2)}
.fora{font-size:13px; color:var(--tinta2); margin:10px 0 0}
.transcricao{margin-top:14px; background:var(--carta); border:1px solid var(--regua2);
   border-radius:3px}
.transcricao summary{cursor:pointer; padding:14px 20px; font-size:13.5px;
   font-weight:600; color:var(--alta); list-style:none}
.transcricao summary::-webkit-details-marker{display:none}
.transcricao summary::before{content:"+ "; font-weight:700}
.transcricao[open] summary::before{content:"− "}
.transcricao summary:hover{background:var(--alta-fraca)}
.transcricao > div{padding:2px 20px 18px; border-top:1px solid var(--regua2)}
.transcricao p{margin:12px 0 0; font-size:14px; line-height:1.65; color:var(--tinta2)}
@media print{ .video .quadro{display:none} .transcricao[open] summary{display:none} }
.recos{display:grid; gap:14px; grid-template-columns:repeat(auto-fit,minmax(310px,1fr))}
.reco{background:var(--carta); border:1px solid var(--regua2); border-radius:3px;
   padding:18px 22px 20px; border-top:3px solid var(--tinta3)}
.reco.p-alta{border-top-color:var(--baixa)}
.reco.p-media{border-top-color:var(--ambar)}
.reco.p-baixa{border-top-color:var(--tinta3)}
.reco-topo{display:flex; align-items:baseline; justify-content:space-between;
   gap:12px; margin-bottom:8px}
.reco h3{margin:0; font-family:Fraunces,Georgia,serif; font-size:17px;
   text-transform:none; letter-spacing:0; color:var(--tinta); font-weight:600}
.reco .prio{font-size:10px; letter-spacing:.12em; text-transform:uppercase;
   font-weight:700; color:var(--tinta3); white-space:nowrap}
.reco.p-alta .prio{color:var(--baixa)}
.reco.p-media .prio{color:#8a6100}
.reco .achado{margin:0 0 12px; font-size:13.5px; line-height:1.6;
   color:var(--tinta2); padding-bottom:12px; border-bottom:1px solid var(--regua2)}
.acoes{list-style:none; margin:0; padding:0}
.acoes li{position:relative; padding:7px 0 7px 20px; font-size:14px; line-height:1.5}
.acoes li::before{content:"→"; position:absolute; left:0; color:var(--alta);
   font-weight:700}
.grupo{background:var(--carta); border:1px solid var(--regua2); border-radius:3px;
   padding:20px 24px 12px; margin-bottom:16px; border-left:3px solid var(--alta)}
.grupo-cab{display:flex; align-items:baseline; justify-content:space-between; gap:12px}
.grupo h3{margin:0; font-family:Fraunces,Georgia,serif; font-size:18px; font-weight:600;
   text-transform:none; letter-spacing:0; color:var(--tinta)}
.grupo .quantos{font-size:11px; letter-spacing:.1em; text-transform:uppercase;
   color:var(--tinta3); white-space:nowrap}
.grupo .objetivo{margin:6px 0 4px; font-size:13.5px; line-height:1.6;
   color:var(--tinta2); max-width:70ch}
.pautas{list-style:none; margin:0; padding:0}
.pauta-item{padding:14px 0; border-top:1px solid var(--regua2)}
.pauta-item .pt{margin:0 0 8px; font-size:15px; line-height:1.45; font-weight:600}
.tags{display:flex; flex-wrap:wrap; gap:7px}
.tag{font-size:11.5px; line-height:1.5; padding:3px 9px; border-radius:2px;
   background:rgba(3,16,30,.05); color:var(--tinta2); overflow-wrap:anywhere}
.tag b{font-weight:600; color:var(--tinta3); text-transform:uppercase;
   letter-spacing:.06em; font-size:10px; margin-right:3px}
.tag.alvo{background:var(--alta-fraca); color:var(--alta); font-weight:600}
.feito{list-style:none; margin:0; padding:0}
.feito li{padding:11px 0 11px 26px; position:relative; font-size:14.5px;
   border-top:1px solid var(--regua2)}
.feito li:first-child{border-top:0}
.feito li::before{content:"✓"; position:absolute; left:0; top:11px;
   color:var(--alta); font-weight:700}
.ganho{color:var(--alta); font-weight:600; white-space:nowrap}
.nota{background:rgba(3,16,30,.04); border-left:3px solid var(--tinta3);
      padding:14px 18px; font-size:13.5px; color:var(--tinta2); border-radius:2px;
      margin-top:18px}
.nota.alerta{background:var(--baixa-fraca); border-left-color:var(--baixa);
             color:#7a3220}
.rodape{border-top:1px solid var(--regua); margin-top:56px; padding:26px 0 40px;
        font-size:12.5px; color:var(--tinta3)}
.rodape strong{color:var(--tinta2)}

@media (max-width:640px){
  .folha{padding:0 18px}
  .capa{padding:38px 0 32px}
  section{padding:38px 0 4px}
  .barra{grid-template-columns:1fr; gap:5px; padding:11px 0}
  .barra .val{text-align:left}
  .rank li{grid-template-columns:28px 1fr; gap:8px}
  .rank li.voce .marca{display:block; margin:2px 0 0}
  .tabwrap{overflow:visible}
  .tab{border:0; background:transparent}
  .tab caption{display:none}
  .tab thead{position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0)}
  .tab, .tab tbody, .tab tr, .tab th, .tab td{display:block; width:auto}
  .tab tbody tr{background:var(--carta); border:1px solid var(--regua2);
                border-radius:3px; padding:6px 18px 16px; margin-bottom:12px}
  .tab tbody td{border:0; background:transparent; padding:13px 0 0; text-align:left}
  .tab td.n{text-align:left}
  .tab tbody td::before{content:attr(data-rotulo); display:block; font-weight:600;
                        font-size:10.5px; letter-spacing:.09em; text-transform:uppercase;
                        color:var(--tinta3); margin-bottom:2px}
}
@media print{
  body{background:#fff}
  .assinatura{background:var(--tinta); -webkit-print-color-adjust:exact;
              print-color-adjust:exact}
  .capa{background:#fff; color:var(--tinta); border-bottom:2px solid var(--tinta)}
  .capa .selo,.capa .sub,.destaques .r{color:var(--tinta2)}
  .destaques{background:var(--regua); border-color:var(--regua)}
  .destaques div{background:#fff}
  section{break-inside:avoid; page-break-inside:avoid}
  .perg,.kpi,.barras,.grafico{break-inside:avoid}
}
"""

FONTES_HEAD = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Fraunces:opsz,wght@9..144,500;9..144,600&'
    'family=IBM+Plex+Mono:<<REMOVIDO>>;500&'
    'family=IBM+Plex+Sans:<<REMOVIDO>>;500;600&display=swap">'
)


# ------------------------------------------------------------------ formato

def esc(v):
    return html.escape(str(v if v is not None else ""), quote=True)


def num(v):
    """Milhar com ponto, no padrao brasileiro."""
    try:
        return f"{int(round(float(v))):,}".replace(",", ".")
    except (TypeError, ValueError):
        return "0"


def pct(parte, total):
    return round(100 * parte / total) if total else 0


def duracao(segundos):
    s = int(segundos or 0)
    return f"{s // 60}min {s % 60:02d}s" if s >= 60 else f"{s}s"


def chip(valor, sufixo="%", invertido=False, rotulo="vs. período anterior"):
    """Selo de variacao. invertido=True quando cair e bom (posicao no Google)."""
    if valor is None:
        return '<span class="chip igual">sem base anterior</span>'
    if valor == 0:
        return f'<span class="chip igual">estável {esc(rotulo)}</span>'
    bom = (valor < 0) if invertido else (valor > 0)
    seta = "▲" if valor > 0 else "▼"
    sinal = "+" if valor > 0 else ""
    classe = "sobe" if bom else "desce"
    return (f'<span class="chip {classe}">{seta} {sinal}{valor}{sufixo} '
            f'{esc(rotulo)}</span>')


def limpar_markdown(texto):
    """A IA responde em markdown com links. Sem limpar, a citacao mostra
    asteriscos crus e pode comecar no meio de uma URL cortada."""
    t = texto or ""
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)      # [texto](url) vira texto
    t = re.sub(r"\(?https?://\S+\)?", "", t)            # url solta
    t = re.sub(r"[*_`#>]+", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"^(?:\S*[/:?=]\S*\s*)+", "", t)         # sobra de url no inicio
    t = re.sub(r"\s*\S*[/:?=]\S*$", "", t)              # e no fim
    return re.sub(r"^[^0-9A-Za-zÀ-ÿ]+", "", t).strip()


def realcar(texto, termos):
    """Escapa a citacao e grifa dentro dela o nome do cliente."""
    limpo = limpar_markdown(texto)
    if not limpo:
        return ""
    norm, mapa = normalizar_com_mapa(limpo)
    melhor = None
    for termo in termos:
        padrao = compilar_padrao(termo)
        if padrao is None:
            continue
        achado = padrao.search(norm)
        if achado and (melhor is None or achado.start() < melhor[0]):
            melhor = (achado.start(), achado.end())
    if melhor is None or not mapa:
        return esc(limpo)
    ini = mapa[melhor[0]]
    fim = mapa[melhor[1]] if melhor[1] < len(mapa) else len(limpo)
    return (esc(limpo[:ini]) + "<mark>" + esc(limpo[ini:fim])
            + "</mark>" + esc(limpo[fim:]))


def decimal(v, sufixo=""):
    """Numero com virgula, no padrao brasileiro."""
    return f"{v}{sufixo}".replace(".", ",") if v is not None else ""


def kpi(valor, rotulo, selo=""):
    return (f'<div class="kpi"><div class="v num">{valor}</div>'
            f'<div class="r">{rotulo}</div>{selo}</div>')


# O GA4 grava a origem em código: "ig" é o Instagram, "l.facebook.com" é um
# encurtador do Facebook. O médico não tem como saber disso, então traduzimos
# e somamos as variações de uma mesma rede numa linha só.
REDES = [
    (("ig", "instagram.com", "l.instagram.com", "lm.instagram.com",
      "instagram"), "Instagram", "https://instagram.com"),
    (("facebook.com", "m.facebook.com", "l.facebook.com", "lm.facebook.com",
      "fb", "facebook"), "Facebook", "https://facebook.com"),
    # Anuncio da Meta chega com origem "meta" e nao diz em qual rede rodou.
    (("meta", "meta ads", "facebook_ads", "fb_ads"),
     "Anúncios Meta (Instagram e Facebook)", "https://business.facebook.com"),
    (("instagram live", "live instagram", "ig live", "instagram_live"),
     "Instagram (live)", "https://instagram.com"),
    (("youtube.com", "m.youtube.com", "youtu.be"), "YouTube", "https://youtube.com"),
    (("linkedin.com", "lnkd.in"), "LinkedIn", "https://linkedin.com"),
    (("t.co", "twitter.com", "x.com"), "X (Twitter)", "https://x.com"),
    (("pinterest.com", "br.pinterest.com"), "Pinterest", "https://pinterest.com"),
    (("tiktok.com", "vt.tiktok.com"), "TikTok", "https://tiktok.com"),
    (("chatgpt.com", "chat.openai.com", "openai.com"), "ChatGPT",
     "https://chatgpt.com"),
    (("gemini.google.com", "bard.google.com"), "Gemini",
     "https://gemini.google.com"),
    (("copilot.com", "copilot.microsoft.com"), "Microsoft Copilot",
     "https://copilot.microsoft.com"),
    (("perplexity", "perplexity.ai"), "Perplexity", "https://perplexity.ai"),
    (("claude.ai",), "Claude", "https://claude.ai"),
    (("(direct)", "(none)"), "Acesso direto", None),
]


# O GA4 devolve o estado em inglês e sem acento ("State of Sao Paulo"), e usa
# códigos próprios quando não consegue identificar. Nada disso pode chegar ao
# cliente cru: ele lê "(not set)" e acha que é erro do relatório.
CODIGOS_GA4 = {
    "(not set)": "Não identificado",
    "(none)": "Não identificado",
    "(other)": "Outros",
    "(direct)": "Acesso direto",
    "(not provided)": "Não informado",
    "(data not available)": "Rede não informada pelo Google",
    "(cross-network)": "Campanha multicanal",
}

ESTADOS = {
    "sao paulo": "São Paulo", "rio de janeiro": "Rio de Janeiro",
    "minas gerais": "Minas Gerais", "bahia": "Bahia", "parana": "Paraná",
    "rio grande do sul": "Rio Grande do Sul", "pernambuco": "Pernambuco",
    "ceara": "Ceará", "para": "Pará", "santa catarina": "Santa Catarina",
    "goias": "Goiás", "maranhao": "Maranhão", "espirito santo": "Espírito Santo",
    "paraiba": "Paraíba", "amazonas": "Amazonas", "mato grosso": "Mato Grosso",
    "mato grosso do sul": "Mato Grosso do Sul", "rio grande do norte": "Rio Grande do Norte",
    "piaui": "Piauí", "alagoas": "Alagoas", "sergipe": "Sergipe",
    "tocantins": "Tocantins", "rondonia": "Rondônia", "acre": "Acre",
    "amapa": "Amapá", "roraima": "Roraima",
    "federal district": "Distrito Federal", "distrito federal": "Distrito Federal",
}


def traduzir_regiao(nome):
    """Nome de estado ou cidade em português, sem código técnico do GA4."""
    bruto = str(nome).strip()
    if bruto.lower() in CODIGOS_GA4:
        return CODIGOS_GA4[bruto.lower()]
    limpo = re.sub(r"^State of\s+", "", bruto, flags=re.I).strip()
    chave, _ = normalizar_com_mapa(limpo)
    return ESTADOS.get(chave, limpo)


def traduzir_origem(origem):
    """(nome legível, url) para uma origem do GA4."""
    bruto = str(origem).strip().lower()
    if bruto in CODIGOS_GA4:
        return CODIGOS_GA4[bruto], None
    for chaves, nome, url in REDES:
        if bruto in chaves:
            return nome, url
    return origem, ("https://" + origem if "." in origem and " " not in origem
                    else None)


def agrupar_origens(itens):
    """Soma as variações da mesma rede numa linha só, já com nome legível."""
    soma, enderecos = Counter(), {}
    for i in itens:
        nome, url = traduzir_origem(i["origem"])
        soma[nome] += i["sessoes"]
        enderecos.setdefault(nome, url)
    return [(nome, qtd, enderecos.get(nome)) for nome, qtd in soma.most_common()]


def dominio_de(fonte):
    """Aceita URL completa ou domínio solto, devolve só o domínio."""
    f = str(fonte)
    if "://" in f:
        f = f.split("://", 1)[1]
    f = f.split("/")[0].split("?")[0].lower()
    return f[4:] if f.startswith("www.") else f


def bloco_fontes(linhas, dominio=None):
    """Domínios citados pela IA, com o link direto do artigo que ela leu.

    O domínio do próprio cliente vai para o topo e ganha o selo "seu site":
    a IA pode ler o artigo dele sem escrever o nome na resposta, e isso é
    resultado que o cliente precisa enxergar.
    """
    meu = dominio_de(dominio) if dominio else None
    vezes, artigos = Counter(), {}
    for r in linhas:
        for fonte in set(dominio_de(f) for f in r["fontes"]):
            vezes[fonte] += 1
        for fonte in r["fontes"]:
            d = dominio_de(fonte)
            artigos.setdefault(d, set())
            if "://" in str(fonte) and str(fonte).rstrip("/") != f"https://{d}":
                artigos[d].add(str(fonte))

    if not vezes:
        return '<div class="ausente">Nenhuma fonte identificada no período.</div>'

    maior = vezes.most_common(1)[0][1] or 1
    ordem = vezes.most_common(10)
    if meu and meu in vezes and meu not in [d for d, _ in ordem]:
        ordem = ordem[:9] + [(meu, vezes[meu])]
    ordem.sort(key=lambda x: (x[0] != meu, -x[1]))
    saida = ""
    for dom, qtd in ordem:
        largura = max(4, round(100 * qtd / maior))
        classe = "artigo voce" if dom == meu else "artigo"
        selo = '<span class="seu-site">seu site</span>' if dom == meu else ""
        lista = ""
        for url in sorted(artigos.get(dom, []))[:4]:
            caminho = url.split("://", 1)[-1]
            if caminho.lower().startswith("www."):
                caminho = caminho[4:]
            caminho = caminho[len(dom):] if caminho.lower().startswith(dom) else caminho
            rotulo = (caminho.strip("/") or "página inicial")
            lista += f"<li>{link(url, rotulo)}</li>"
        if not lista:
            lista = f'<li>{link("https://" + dom, "página inicial")}</li>'
        saida += (f'<div class="{classe}"><div class="cab-f">'
                  f'<span class="dom">{link("https://" + dom, dom)}{selo}</span>'
                  f'<span class="vezes num">{qtd}x citado</span></div>'
                  f'<span class="trilho" style="display:block"><span class="enche" '
                  f'style="width:{largura}%"></span></span><ul>{lista}</ul></div>')
    return f'<div class="artigos">{saida}</div>'


def link(url, texto):
    """Link em nova aba. Sem URL válida, devolve apenas o texto escapado."""
    if not url or not str(url).startswith(("http://", "https://")):
        return esc(texto)
    return f'<a href="{esc(url)}" target="_blank" rel="noopener">{esc(texto)}</a>'


def busca_google(termo):
    return "https://www.google.com/search?q=" + quote_plus(str(termo))


def barras(itens, destaque=None, formato=num, icone_padrao=None):
    """itens: [(nome, valor)] ou [(nome, valor, url)].

    Com icone_padrao definido, cada linha ganha o ícone da marca. Assim dá
    para achar o Instagram na lista sem ler item por item.
    """
    if not itens:
        return '<div class="ausente">Sem dados no período.</div>'
    itens = [(i[0], i[1], i[2] if len(i) > 2 else None) for i in itens]
    maior = max(v for _, v, _ in itens) or 1
    linhas = ""
    for nome, valor, url in itens:
        cls = "barra voce" if nome == destaque else "barra"
        rotulo = link(url, nome) if url else esc(nome)
        if icone_padrao is not None:
            rotulo = f'<span class="ico">{icone(nome, icone_padrao)}</span>{rotulo}'
            cls += " com-ico"
        linhas += (f'<div class="{cls}"><span class="nome">{rotulo}</span>'
                   f'<span class="trilho"><span class="enche" '
                   f'style="width:{max(1, round(100 * valor / maior))}%"></span></span>'
                   f'<span class="val num">{formato(valor)}</span></div>')
    return f'<div class="barras">{linhas}</div>'


def grafico_evolucao(historico):
    """Barras da taxa de citação em IA ao longo do tempo, com a posição média.

    Uma medição só não é evolução, então avisamos em vez de fingir tendência.
    """
    if not historico:
        return ""
    if len(historico) < 2:
        h = historico[0]
        return (f'<div class="nota">Esta é a primeira medição registrada '
                f'({esc(h["rotulo"])}). A partir da próxima rodada este bloco '
                f'passa a mostrar a evolução mês a mês.</div>')

    L, A, pad = 1000, 230, 34
    n = len(historico)
    larg = L / n
    barras_svg, marcas = "", ""
    for i, h in enumerate(historico):
        altura = (h["taxa"] / 100) * (A - pad * 2)
        x = i * larg + larg * 0.22
        w = larg * 0.56
        y = A - pad - altura
        barras_svg += (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" '
                       f'height="{max(2, altura):.1f}" rx="3" fill="#046b39"/>'
                       f'<text x="{x + w / 2:.1f}" y="{y - 7:.1f}" '
                       f'text-anchor="middle" font-size="34" fill="#03101e" '
                       f'font-weight="600">{h["taxa"]}%</text>')
        marcas += (f'<text x="{x + w / 2:.1f}" y="{A - 7}" text-anchor="middle" '
                   f'font-size="27" fill="#8899aa">{esc(h["rotulo"])}</text>')
    return f"""<div class="grafico">
<svg viewBox="0 0 {L} {A}" role="img"
     aria-label="Percentual de respostas de IA que citaram o cliente, por período">
  <line x1="0" y1="{A - pad}" x2="{L}" y2="{A - pad}" stroke="rgba(3,16,30,.14)"/>
  {barras_svg}{marcas}
</svg></div>"""


def grafico_linha(serie, chave="cliques"):
    """Area chart em SVG puro, sem biblioteca."""
    pontos = [p[chave] for p in serie]
    if len(pontos) < 2:
        return '<div class="ausente">Série diária indisponível no período.</div>'
    L, A, pad = 1000, 220, 8
    teto = max(pontos) or 1
    passo = L / (len(pontos) - 1)
    coords = [(i * passo, A - pad - (v / teto) * (A - 2 * pad))
              for i, v in enumerate(pontos)]
    linha = " ".join(f"{x:.1f},{y:.1f}" for x, y in coords)
    area = f"0,{A} {linha} {L},{A}"
    return f"""<div class="grafico">
<svg viewBox="0 0 {L} {A}" preserveAspectRatio="none" role="img"
     aria-label="Cliques por dia no período">
  <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#046b39" stop-opacity=".22"/>
    <stop offset="1" stop-color="#046b39" stop-opacity="0"/>
  </linearGradient></defs>
  <polygon points="{area}" fill="url(#g)"/>
  <polyline points="{linha}" fill="none" stroke="#046b39"
            stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
</svg>
<div class="eixo"><span>{esc(serie[0]['data'])}</span>
<span class="num">pico de {num(teto)} cliques/dia</span>
<span>{esc(serie[-1]['data'])}</span></div>
</div>"""


# -------------------------------------------------------- bloco 01: IA

def resumir_ia(linhas):
    citadas = [r for r in linhas if r["mencionado"]]
    posicoes = [r["posicao"] for r in citadas if r["posicao"]]
    return {
        "total": len(linhas), "citacoes": len(citadas),
        "taxa": pct(len(citadas), len(linhas)),
        "media": round(sum(posicoes) / len(posicoes), 1) if posicoes else None,
        "primeiros": sum(1 for p in posicoes if p == 1),
    }


def bloco_rankings(linhas, termos_cliente):
    """A sequencia exata que a IA entregou, com o cliente destacado."""
    saida = ""
    for r in sorted(linhas, key=lambda x: (x["prompt"], x["provedor"])):
        ia = NOMES.get(r["provedor"], r["provedor"])
        if r["sequencia"]:
            itens = ""
            for i, e in enumerate(r["sequencia"], 1):
                marca = ('<span class="marca">você está aqui</span>'
                         if e["voce"] else "")
                itens += (f'<li class="{"voce" if e["voce"] else ""}">'
                          f'<span class="pos mono num">{i:02d}</span>'
                          f'<span>{esc(e["nome"])}{marca}</span></li>')
            lista = f'<ol class="rank">{itens}</ol>'
        else:
            lista = ('<div class="ausente">Nenhum profissional da lista monitorada '
                     'apareceu nesta resposta.</div>')

        if r["mencionado"]:
            meta = (f'Você foi citado em <strong>{r["posicao"]}º lugar</strong> '
                    f'de {r["total_citados"]} nomes')
        else:
            meta = "Você não foi citado nesta resposta"

        trecho = (f'<p class="citacao">“...{realcar(r["trecho"], termos_cliente)}...”</p>'
                  if r["trecho"] else "")
        saida += (f'<article class="perg ia-{esc(r["provedor"])}">'
                  f'<p class="q">{esc(r["prompt"])}</p>'
                  f'<div class="topo-perg">'
                  f'<span class="selo-ia">{icone(ia, ICONE_LINK)}{esc(ia)}</span>'
                  f'<p class="meta">{meta}</p></div>{lista}{trecho}</article>')
    return saida


def bloco_ia(linhas, anteriores, falhas, nome_cliente, termos_cliente,
             historico=None, dominio=None):
    if not linhas:
        return ""
    a = resumir_ia(linhas)
    b = resumir_ia(anteriores) if anteriores else None

    delta_taxa = (a["taxa"] - b["taxa"]) if b else None
    delta_pos = (round(a["media"] - b["media"], 1)
                 if b and a["media"] and b["media"] else None)

    cartoes = kpi(f'{a["taxa"]}%', "Respostas em que você foi citado",
                  chip(delta_taxa, sufixo=" pp"))
    cartoes += kpi(decimal(a["media"], "º") if a["media"] else "não citado",
                   "Posição média na lista da IA",
                   chip(delta_pos, sufixo=" posições", invertido=True))
    cartoes += kpi(a["primeiros"], f'Vezes em 1º lugar, de {a["total"]} consultas')
    cartoes += kpi(len({r["provedor"] for r in linhas}), "Ferramentas de IA consultadas")

    # concorrentes por frequencia de aparicao
    contagem = Counter()
    for r in linhas:
        for rival in r["concorrentes"]:
            contagem[rival] += 1
    share = [(nome_cliente, a["citacoes"])] + contagem.most_common(8)
    share.sort(key=lambda x: -x[1])

    aviso = ""
    if falhas:
        aviso = (f'<div class="nota alerta"><strong>Cobertura do período:</strong> '
                 f'{falhas} de {falhas + a["total"]} consultas não puderam ser '
                 f'concluídas e ficaram fora dos percentuais acima.</div>')

    return f"""<section>
  <div class="cab"><span class="idx mono">01</span><h2>Visibilidade em Inteligência Artificial</h2></div>
  <p class="linhafina">Perguntamos às IAs exatamente o que o seu público pergunta antes
     de escolher, e registramos em que posição o seu nome aparece na resposta.</p>
  <div class="kpis">{cartoes}</div>{aviso}

  <h3>Evolução da sua presença nas IAs</h3>
  <p class="linhafina">Percentual de respostas que citaram o seu nome, por data de
     medição.</p>
  {grafico_evolucao(historico or [])}

  <h3>A lista que a IA entregou, na ordem</h3>
  {bloco_rankings(linhas, termos_cliente)}

  <h3>Frequência de aparição: você e os concorrentes</h3>
  {barras(share, destaque=nome_cliente, formato=lambda v: f"{v}x")}

  <h3>De onde a IA tirou a resposta</h3>
  <p class="linhafina">Os artigos que a IA leu para montar a resposta. Clique para
     abrir e ver exatamente o que ela encontrou sobre você e sobre os concorrentes.
     Estar presente nestas páginas é o caminho mais direto para ser recomendado.</p>
  {bloco_fontes(linhas, dominio)}
</section>"""


# -------------------------------------------------------- bloco 02: GSC

def bloco_pauta(grupos):
    """Pauta de publicação em portais, agrupada por formato.

    Cada formato tem função própria: lista alimenta a IA, marca no título
    constrói entidade, utilitário move posição. Misturar os três num monte só
    faria o cliente publicar tudo do mesmo jeito e perder os três efeitos.
    """
    if not grupos:
        return ""
    saida = ""
    for g in grupos:
        itens = ""
        for i in g.get("itens", []):
            destino = i.get("destino", "")
            ancora = i.get("ancora", "")
            alvo = i.get("alvo", "")
            etiquetas = ""
            if destino:
                etiquetas += (f'<span class="tag"><b>link para</b> '
                              f'{esc(destino)}</span>')
            if ancora:
                etiquetas += (f'<span class="tag"><b>âncora</b> '
                              f'{esc(ancora)}</span>')
            if alvo:
                etiquetas += f'<span class="tag alvo">{esc(alvo)}</span>'
            itens += (f'<li class="pauta-item"><p class="pt">{esc(i["titulo"])}</p>'
                      f'<div class="tags">{etiquetas}</div></li>')
        saida += (f'<div class="grupo"><div class="grupo-cab">'
                  f'<h3>{esc(g["formato"])}</h3>'
                  f'<span class="quantos">{len(g.get("itens", []))} pautas</span></div>'
                  f'<p class="objetivo">{esc(g.get("objetivo", ""))}</p>'
                  f'<ul class="pautas">{itens}</ul></div>')
    return f"""<section>
  <div class="cab"><span class="idx mono">✎</span><h2>Sugestões de conteúdo para portais</h2></div>
  <p class="linhafina">Pauta para publicação em portais de notícia, montada a partir dos
     termos em que o site já tem posição e das páginas que mais vendem. Cada formato
     cumpre uma função diferente, e é a combinação dos três que funciona.</p>
  {saida}
  <div class="nota"><strong>Disciplina de link.</strong> No máximo dois links por
    matéria, nunca dois para o mesmo destino, e sem repetir a mesma âncora mais de duas
    vezes em toda a rede. Link demais na mesma página não soma: o Google conta apenas o
    primeiro para cada destino.</div>
</section>"""


def bloco_recomendacoes(temas):
    """Diagnóstico de entrada, usado só nos clientes novos.

    Cada tema traz o achado (o que os dados mostram) e a ação (o que fazer).
    Separar os dois evita o relatório virar lista de opinião sem lastro.
    """
    if not temas:
        return ""
    cartoes = ""
    for t in temas:
        prio = (t.get("prioridade") or "media").lower()
        acoes = "".join(f"<li>{esc(a)}</li>" for a in t.get("acoes", []))
        achado = (f'<p class="achado">{esc(t["achado"])}</p>'
                  if t.get("achado") else "")
        cartoes += (
            f'<article class="reco p-{esc(prio)}">'
            f'<div class="reco-topo"><h3>{esc(t["tema"])}</h3>'
            f'<span class="prio">{esc(prio)}</span></div>'
            f'{achado}<ul class="acoes">{acoes}</ul></article>')
    return f"""<section>
  <div class="cab"><span class="idx mono">◆</span><h2>Diagnóstico e plano de melhorias</h2></div>
  <p class="linhafina">Levantamento feito na entrada do projeto, cruzando o que o site
     entrega hoje com o que os dados do Google e das IAs mostram. Cada ponto traz o que
     encontramos e o que propomos fazer.</p>
  <div class="recos">{cartoes}</div>
</section>"""


def bloco_video(v):
    """Mensagem em vídeo, com transcrição recolhida.

    Aceita no config, por ordem de preferência:
      "youtube": "ID"           usa youtube-nocookie, sem cookie de rastreio
      "vimeo":   "ID"
      "incorporar": "<iframe…>" código colado inteiro, para outra plataforma
    Mais "titulo", "url" (link de escape) e "transcricao" (texto ou lista).
    """
    if not v:
        return ""

    quadro, escape = "", v.get("url", "")
    if v.get("youtube"):
        vid = str(v["youtube"]).strip()
        escape = escape or f"https://youtu.be/{vid}"
        quadro = (f'<iframe src="https://www.youtube-nocookie.com/embed/{esc(vid)}"'
                  f' title="{esc(v.get("titulo", "Mensagem em vídeo"))}"'
                  f' loading="lazy" allowfullscreen'
                  f' allow="accelerometer; encrypted-media; picture-in-picture"'
                  f' referrerpolicy="strict-origin-when-cross-origin"></iframe>')
    elif v.get("vimeo"):
        vid = str(v["vimeo"]).strip()
        escape = escape or f"https://vimeo.com/{vid}"
        quadro = (f'<iframe src="https://player.vimeo.com/video/{esc(vid)}"'
                  f' title="{esc(v.get("titulo", "Mensagem em vídeo"))}"'
                  f' loading="lazy" allowfullscreen></iframe>')
    elif v.get("incorporar"):
        # Código colado pelo operador, não vem de fora: entra como está. E vai
        # num contêiner livre, porque o iframe já traz a própria proporção;
        # forçar 16/9 por cima distorceria um vídeo de outro formato.
        return _secao_video(v, v["incorporar"], escape, livre=True)
    if not quadro:
        return ""
    return _secao_video(v, quadro, escape)


def _secao_video(v, quadro, escape, livre=False):

    # Alguns leitores de e-mail bloqueiam iframe. O link garante o acesso.
    alternativa = ""
    if escape:
        alternativa = (f'<p class="fora">Se o vídeo não abrir aqui, '
                       f'{link(escape, "assista por este link")}.</p>')

    transcricao = v.get("transcricao")
    bloco_txt = ""
    if transcricao:
        paragrafos = (transcricao if isinstance(transcricao, list)
                      else str(transcricao).split("\n\n"))
        corpo = "".join(f"<p>{esc(p.strip())}</p>" for p in paragrafos if p.strip())
        bloco_txt = (f'<details class="transcricao"><summary>Prefere ler? '
                     f'Abrir a transcrição</summary><div>{corpo}</div></details>')

    titulo = v.get("titulo") or "Vídeo relatório do que foi feito"
    # Sem "descricao" no config, nada é impresso: o título basta.
    descricao = v.get("descricao", "")
    return f"""<section class="video">
  <div class="cab"><span class="idx mono">▶</span><h2>{esc(titulo)}</h2></div>
  {f'<p class="linhafina">{esc(descricao)}</p>' if descricao else ''}
  <div class="quadro{" livre" if livre else ""}">{quadro}</div>
  {alternativa}{bloco_txt}
</section>"""


def bloco_trabalho(itens):
    """O que a agência fez no período. Sem isto o cliente lê resultado e não
    associa a ninguém, que é o problema de quem precisa justificar honorário."""
    if not itens:
        return ""
    lista = "".join(f"<li>{esc(i)}</li>" for i in itens)
    return f"""<section>
  <div class="cab"><span class="idx mono">00</span><h2>O que fizemos neste período</h2></div>
  <p class="linhafina">Ações executadas pela QMIX Digital nos últimos 30 dias.</p>
  <div class="painel"><ul class="feito">{lista}</ul></div>
</section>"""


def bloco_posicoes(d):
    """Posição das palavras-chave acompanhadas, vindas do SERPRobot.

    Complementa o Search Console, não repete: lá aparece o termo que traz
    volume, quase sempre informativo e nacional; aqui o termo comercial e
    local que foi escolhido para acompanhar, que é o que traz cliente.
    """
    if not d or not d.get("termos"):
        return ""
    import serprobot
    r = serprobot.resumir(d)

    cartoes = kpi(r["primeiro"], "Palavras em 1º lugar no Google")
    cartoes += kpi(r["top3"], f'No top 3, de {r["total"]} acompanhadas')
    cartoes += kpi(r["top10"], "Na primeira página")
    selo_sobe = (f'<span class="chip sobe">▲ {r["subiram"]} subiram</span>'
                 if r["subiram"] else "")
    cartoes += kpi(r["subiram"] - r["cairam"] if r["subiram"] or r["cairam"] else 0,
                   "Saldo de posições no período",
                   selo_sobe or '<span class="chip igual">sem movimento</span>')

    linhas = ""
    for t in d["termos"][:20]:
        if t["posicao"]:
            pos = f'{t["posicao"]}º'
            if t["variacao"] is None or t["variacao"] == 0:
                mov = '<span class="nao">manteve</span>'
            elif t["variacao"] < 0:
                mov = (f'<span class="sim">▲ subiu {abs(t["variacao"])} '
                       f'{"posição" if abs(t["variacao"]) == 1 else "posições"}</span>')
            else:
                mov = (f'<span class="chave-nao">▼ caiu {t["variacao"]} '
                       f'{"posição" if t["variacao"] == 1 else "posições"}</span>')
        else:
            pos, mov = '<span class="nao">fora do alcance</span>', ""
        pagina = link(t["url"], t["url"].split("//")[-1].split("/", 1)[-1] or "/") \
            if t["url"] else '<span class="nao">nenhuma</span>'
        linhas += (f'<tr><td data-rotulo="Palavra-chave">{esc(t["termo"])}</td>'
                   f'<td class="n num" data-rotulo="Posição hoje">{pos}</td>'
                   f'<td data-rotulo="No período">{mov}</td>'
                   f'<td data-rotulo="Página que aparece">{pagina}</td></tr>')

    return f"""<section>
  <div class="cab"><span class="idx mono">02</span><h2>Posições acompanhadas no Google</h2></div>
  <div class="fonte-dado">{SELO_GSC} Monitoramento de posição · {esc(d.get('periodo', ''))}</div>
  <p class="linhafina">Palavras-chave que acompanhamos posição por posição, medidas
     várias vezes por semana. São os termos de intenção de contratação, diferentes dos
     da próxima seção, que mostra tudo o que traz visita ao site.</p>
  <div class="kpis">{cartoes}</div>

  <h3>Palavra por palavra</h3>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Posição atual e movimento desde a primeira medição do período.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Palavra-chave</th><th scope="col" class="n">Posição hoje</th>
      <th scope="col">No período</th><th scope="col">Página que aparece</th>
    </tr></thead><tbody role="rowgroup">{linhas}</tbody>
  </table></div>
</section>"""


def bloco_gsc(d, idx_gsc="02"):
    if not d:
        return ""
    a, v = d["atual"], d["variacao"]
    cartoes = kpi(num(a["cliques"]), "Cliques vindos do Google", chip(v["cliques"]))
    cartoes += kpi(num(a["impressoes"]), "Vezes que o site apareceu", chip(v["impressoes"]))
    cartoes += kpi(f'{a["ctr"]}%'.replace(".", ","), "Taxa de clique (CTR)")
    cartoes += kpi(f'{a["posicao"]}º'.replace(".", ","), "Posição média no Google",
                   chip(d["delta_posicao"], sufixo=" posições", invertido=True))

    # O termo abre a busca no Google, para o cliente conferir a posição na hora.
    consultas = "".join(
        f'<tr><td data-rotulo="Termo pesquisado">'
        f'{link(busca_google(q["termo"]), q["termo"])}</td>'
        f'<td class="n num" data-rotulo="Cliques">{num(q["cliques"])}</td>'
        f'<td class="n num" data-rotulo="Impressões">{num(q["impressoes"])}</td>'
        f'<td class="n num" data-rotulo="Posição">{str(q["posicao"]).replace(".", ",")}º</td></tr>'
        for q in d["consultas"])

    paginas = "".join(
        f'<tr><td data-rotulo="Página">'
        f'{link(p["url"], p["url"].replace("https://", "").rstrip("/") or "/")}</td>'
        f'<td class="n num" data-rotulo="Cliques">{num(p["cliques"])}</td>'
        f'<td class="n num" data-rotulo="Posição">{str(p["posicao"]).replace(".", ",")}º</td></tr>'
        for p in d["paginas"])

    # CTR medio de quem esta no topo 3 e ~12%. A diferenca entre o clique de
    # hoje e esse patamar e o que se ganha subindo o termo.
    opo = d.get("oportunidades", [])
    if opo:
        linhas_opo = ""
        ganho_total = 0
        for o in opo[:12]:
            potencial = max(0, round(o["impressoes"] * 0.12) - o["cliques"])
            ganho_total += potencial
            linhas_opo += (
                f'<tr><td data-rotulo="Termo pesquisado">'
                f'{link(busca_google(o["termo"]), o["termo"])}</td>'
                f'<td class="n num" data-rotulo="Posição hoje">'
                f'{str(o["posicao"]).replace(".", ",")}º</td>'
                f'<td class="n num" data-rotulo="Pessoas que viram">'
                f'{num(o["impressoes"])}</td>'
                f'<td class="n num" data-rotulo="Cliques hoje">{num(o["cliques"])}</td>'
                f'<td class="n" data-rotulo="Ganho estimado no topo 3">'
                f'<span class="ganho">+{num(potencial)}</span></td></tr>')
        oportunidades = f"""
  <h3>Onde está o maior ganho possível</h3>
  <p class="linhafina">Termos em que o site já aparece na primeira ou segunda página,
     mas fora do topo. Como a posição já existe, subir alguns lugares é o caminho mais
     curto para mais visitas. São <strong>{len(opo)} termos nesta situação</strong>;
     abaixo os 12 de maior alcance.</p>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Estimativa de ganho considerando a taxa de clique média de quem ocupa
      as três primeiras posições.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Termo pesquisado</th>
      <th scope="col" class="n">Posição hoje</th>
      <th scope="col" class="n">Pessoas que viram</th>
      <th scope="col" class="n">Cliques hoje</th>
      <th scope="col" class="n">Ganho no topo 3</th>
    </tr></thead><tbody role="rowgroup">{linhas_opo}</tbody>
  </table></div>
  <div class="nota">Levando estes 12 termos para as três primeiras posições, a
    estimativa é de <strong>+{num(ganho_total)} visitas por mês</strong>.</div>"""
    else:
        oportunidades = ""

    return f"""<section>
  <div class="cab"><span class="idx mono">{idx_gsc}</span><h2>Desempenho na busca do Google</h2></div>
  <div class="fonte-dado">{SELO_GSC} Google Search Console</div>
  <p class="linhafina">Propriedade {esc(d['site'].replace('sc-domain:', ''))},
     período de {esc(d['periodo'])}.</p>
  <div class="explica">
    <strong>O que esta seção mede</strong>
    Apenas quem chegou <em>pela busca do Google</em>. Se a pessoa pesquisou no Google e
    clicou no seu site, ela está contada aqui. Quem entrou pelo Instagram, por um link
    em outro site, pelo ChatGPT ou digitando o endereço direto <em>não aparece</em> nesta
    seção. Por isso os números daqui são menores que os da próxima seção: a busca do
    Google é uma das portas de entrada, não todas.
  </div>
  <div class="kpis">{cartoes}</div>

  <h3>Cliques por dia</h3>
  {grafico_linha(d["serie"])}

  <h3>O que as pessoas pesquisaram para chegar até você</h3>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Termos com mais cliques no período.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Termo pesquisado</th><th scope="col" class="n">Cliques</th>
      <th scope="col" class="n">Impressões</th><th scope="col" class="n">Posição</th>
    </tr></thead><tbody role="rowgroup">{consultas}</tbody>
  </table></div>

  {oportunidades}

  <h3>Páginas que mais receberam visitas</h3>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Páginas com mais cliques vindos da busca.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Página</th><th scope="col" class="n">Cliques</th>
      <th scope="col" class="n">Posição</th>
    </tr></thead><tbody role="rowgroup">{paginas}</tbody>
  </table></div>
</section>"""


# O rastreio grava o lugar do botao em codigo. Aqui vira nome que o cliente
# entende, porque "cta_final" nao diz nada para um medico.
LOCAIS_PT = {
    "hero": "Topo da página",
    "sidebar": "Caixa lateral de agendamento",
    "cta_final": "Chamada no fim da página",
    "cta_meio": "Chamada no meio do conteúdo",
    "barra_mobile": "Barra fixa no celular",
    "botao_flutuante": "Botão flutuante",
    "cta_artigo": "Chamada no fim do artigo do blog",
    "cabecalho": "Menu do topo",
    "rodape": "Rodapé",
    "pagina_contato": "Página de contato",
    "locais_atendimento": "Locais de atendimento",
    "pagina_legal": "Páginas de política e termos",
    "pagina_404": "Página de erro 404",
    "conteudo": "Corpo do conteúdo",
    "formulario": "Formulário",
    "faq": "Perguntas frequentes",
    "cta_post": "Chamada no fim do artigo",
    "autor": "Caixa do autor",
    "agendar": "Seção de agendamento",
    "contato": "Seção de contato",
    "especialidades": "Lista de especialidades",
    "sobre": "Seção sobre",
    "depoimentos": "Depoimentos",
    "locais": "Locais de atendimento",
    "relacionados": "Artigos relacionados",
}

METODOS_PT = {"whatsapp": "WhatsApp", "telefone": "Telefone", "email": "E-mail"}


def bloco_contato_detalhe(det):
    """Anatomia do contato: por onde, de qual página, em qual botão, vindo de onde.

    Só aparece quando há dado. As dimensões personalizadas do GA4 não são
    retroativas, então um período anterior à criação delas vem vazio, e é
    melhor omitir a seção do que publicar quatro tabelas zeradas.
    """
    if not det:
        return ""
    metodo = det.get("metodo") or []
    local = det.get("local") or []
    botao = det.get("botao") or []
    paginas = det.get("paginas") or []
    canais = det.get("canais") or []
    if not (metodo or local or botao):
        return ""

    total = sum(x["contagem"] for x in metodo) or det.get("total", 0)
    cartoes = kpi(num(total), "Contatos no período")
    for m in metodo:
        cartoes += kpi(num(m["contagem"]),
                       "Pelo " + METODOS_PT.get(m["nome"], m["nome"]))

    def bloco(titulo, linhafina, itens, rotulo, formato=None):
        if not itens:
            return ""
        return (f'\n  <h4>{titulo}</h4>\n'
                f'  <p class="linhafina">{linhafina}</p>\n  '
                + barras([(rotulo(i["nome"]), i["contagem"]) for i in itens[:10]],
                         formato=formato or (lambda x: f"{num(x)} contatos")))

    partes = bloco(
        "Qual botão o paciente usou",
        "Mostra qual chamada do site realmente converte, e qual está ocupando "
        "espaço sem trazer contato.",
        local, lambda n: LOCAIS_PT.get(n, n.replace("_", " ").capitalize()))

    partes += bloco(
        "De qual página o paciente chamou",
        "A página que gera contato é a que merece mais conteúdo e mais links. "
        "A que traz visita e não gera contato é a que precisa de um CTA melhor.",
        paginas, lambda n: n if n != "/" else "/ (página inicial)")

    partes += bloco(
        "De onde veio quem entrou em contato",
        "Não é o canal que traz mais visita, é o que traz mais paciente. "
        "Costumam ser canais diferentes.",
        canais, lambda n: CANAIS.get(n, n))

    tabela_botao = ""
    if botao:
        linhas = "".join(
            f'<tr><td data-rotulo="Texto do botão">{esc(b["nome"])}</td>'
            f'<td class="n num" data-rotulo="Contatos">{num(b["contagem"])}</td></tr>'
            for b in botao[:12])
        tabela_botao = f"""
  <h4>Qual texto de botão funciona</h4>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Texto exato do botão clicado, do mais para o menos usado.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Texto do botão</th><th scope="col" class="n">Contatos</th>
    </tr></thead><tbody role="rowgroup">{linhas}</tbody>
  </table></div>"""

    return f"""
  <h3>Anatomia dos contatos</h3>
  <p class="linhafina">Onde o paciente clicou, de qual página saiu e por qual
     caminho chegou até o site antes de chamar.</p>
  <div class="kpis">{cartoes}</div>{partes}{tabela_botao}"""


REDES_PT = {
    "instagram": "Instagram", "youtube": "YouTube", "facebook": "Facebook",
    "doctoralia": "Doctoralia", "google_maps": "Google Maps", "google_perfil": "Perfil no Google",
    "linkedin": "LinkedIn", "tiktok": "TikTok",
}

LEITURA_PT = {"25": "Leu um quarto", "50": "Leu metade", "75": "Leu três quartos", "100": "Leu até o fim"}
COMPARTILHAR_PT = {"whatsapp": "Pelo WhatsApp", "copiar_link": "Copiando o link",
                   "facebook": "No Facebook", "email": "Por e-mail"}


def bloco_engajamento(eng):
    """Onde o visitante clicou, qual chamada funcionou, o que perguntou e até onde leu.

    Só aparece quando há dado. Vem dos eventos do engajamento.js da rede; um
    site sem o script simplesmente não mostra o bloco.
    """
    if not eng:
        return ""
    social = eng.get("social") or []
    cta = eng.get("cta") or []
    faq = eng.get("faq") or []
    leitura = eng.get("leitura") or []
    buscas = eng.get("buscas") or []
    saidas = eng.get("saidas") or []
    compartilhar = eng.get("compartilhar") or []
    if not (social or cta or faq or leitura or buscas or compartilhar):
        return ""

    def rotulo_local(n):
        return LOCAIS_PT.get(n, n.replace("_", " ").capitalize())

    cartoes = ""
    if social:
        cartoes += kpi(num(eng.get("total_social", 0)), "Cliques em redes e perfis")
    if cta:
        cartoes += kpi(num(eng.get("total_cta", 0)), "Cliques em chamadas do site")
    if faq:
        cartoes += kpi(num(eng.get("total_faq", 0)), "Perguntas abertas no FAQ")
    if buscas:
        cartoes += kpi(num(eng.get("total_buscas", 0)), "Buscas feitas no site")
    if compartilhar:
        cartoes += kpi(num(eng.get("total_compartilhar", 0)), "Artigos compartilhados")
    if leitura:
        inicio = next((x["contagem"] for x in leitura if x["nome"] == "25"), 0)
        fim = next((x["contagem"] for x in leitura if x["nome"] == "100"), 0)
        if inicio:
            cartoes += kpi(f"{round(100 * fim / inicio)}%", "Dos que começaram a ler, foram até o fim")

    partes = ""
    if social:
        partes += (
            "\n  <h4>Para onde o visitante saiu do site</h4>\n"
            '  <p class="linhafina">Cliques em redes sociais e perfis externos. Mostra qual '
            "canal o visitante quer conhecer antes de decidir.</p>\n  "
            + barras([(REDES_PT.get(s["nome"], s["nome"]), s["contagem"]) for s in social],
                     formato=lambda x: f"{num(x)} cliques", icone_padrao=ICONE_BUSCA))
    if eng.get("social_local"):
        partes += (
            "\n  <h4>De qual parte da página saíram esses cliques</h4>\n  "
            + barras([(rotulo_local(s["nome"]), s["contagem"]) for s in eng["social_local"]],
                     formato=lambda x: f"{num(x)} cliques"))
    if cta:
        partes += (
            "\n  <h4>Quais chamadas do site foram clicadas</h4>\n"
            '  <p class="linhafina">Botões que levam a outra parte do site, sem ser contato '
            "direto. Indicam o que chamou atenção no caminho até o contato.</p>\n  "
            + barras([(c["nome"], c["contagem"]) for c in cta],
                     formato=lambda x: f"{num(x)} cliques"))
    if leitura:
        partes += (
            "\n  <h4>Até onde as pessoas leem os artigos</h4>\n"
            '  <p class="linhafina">Quatro marcos ao longo do texto. A queda entre um marco e '
            "o seguinte mostra onde o leitor desiste.</p>\n  "
            + barras([(LEITURA_PT.get(l["nome"], l["nome"]), l["contagem"]) for l in leitura],
                     formato=lambda x: f"{num(x)} leitores"))
    if faq:
        linhas = "".join(
            f'<tr><td data-rotulo="Pergunta">{esc(f["nome"])}</td>'
            f'<td class="n num" data-rotulo="Aberturas">{num(f["contagem"])}</td></tr>'
            for f in faq[:12])
        partes += f"""
  <h4>Perguntas mais abertas no FAQ</h4>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Perguntas frequentes que os visitantes abriram, da mais para a menos aberta.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Pergunta</th><th scope="col" class="n">Aberturas</th>
    </tr></thead><tbody role="rowgroup">{linhas}</tbody>
  </table></div>"""
    if buscas:
        linhas = "".join(
            f'<tr><td data-rotulo="Termo">{esc(b["nome"])}</td>'
            f'<td class="n num" data-rotulo="Buscas">{num(b["contagem"])}</td></tr>'
            for b in buscas[:12])
        partes += f"""
  <h4>O que as pessoas buscaram dentro do site</h4>
  <p class="linhafina">Termo digitado na busca interna. Quando um termo se repete e não
     tem página própria, é conteúdo que falta.</p>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Termos usados na busca interna do site.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Termo</th><th scope="col" class="n">Buscas</th>
    </tr></thead><tbody role="rowgroup">{linhas}</tbody>
  </table></div>"""
    if compartilhar:
        partes += (
            "\n  <h4>Artigos compartilhados pelos leitores</h4>\n"
            '  <p class="linhafina">Cliques no botão de compartilhar do artigo. Quem compartilha '
            "leva o conteúdo para outra pessoa, que é a melhor indicação possível.</p>\n  "
            + barras([(COMPARTILHAR_PT.get(c["nome"], c["nome"]), c["contagem"]) for c in compartilhar],
                     formato=lambda x: f"{num(x)} vezes"))
        if eng.get("compartilhar_paginas"):
            partes += ("\n  <h4>Quais artigos foram compartilhados</h4>\n  "
                       + barras([(c["nome"], c["contagem"]) for c in eng["compartilhar_paginas"]],
                                formato=lambda x: f"{num(x)} vezes"))
    if saidas:
        partes += (
            "\n  <h4>Outros sites para onde o visitante clicou</h4>\n"
            '  <p class="linhafina">Links externos clicados, sem contar WhatsApp e redes sociais.</p>\n  '
            + barras([(s["nome"], s["contagem"]) for s in saidas],
                     formato=lambda x: f"{num(x)} cliques"))

    return f"""
  <h3>Engajamento no site</h3>
  <p class="linhafina">O que o visitante fez além de ler: onde clicou, o que abriu e
     até onde foi no texto.</p>
  <div class="kpis">{cartoes}</div>{partes}"""


# -------------------------------------------------------- bloco 03: GA4

def bloco_ga4(d, dominio=None, rastreio_completo=True,
              mostrar_contatos=False, mostrar_video=False, idx_ga4="03",
              texto_geografia=None):
    # Sem leitura propria no config, fica a descricao neutra. Texto
    # interpretativo fixo aqui ja viajou de um cliente para os outros.
    texto_geografia = texto_geografia or (
        "Estados de onde partiram as visitas ao site no período.")
    if not d:
        return ""
    a, v = d["atual"], d["variacao"]
    if not a.get("sessoes"):
        # Medicao recem-instalada: uma nota honesta vale mais que meia duzia
        # de blocos dizendo "sem dados", que dao cara de relatorio quebrado.
        return f"""<section>
  <div class="cab"><span class="idx mono">{idx_ga4}</span><h2>Todas as visitas ao site</h2></div>
  <div class="fonte-dado">{SELO_GA4} Google Analytics 4</div>
  <div class="nota">A medição de audiência foi instalada agora e ainda não acumulou
    dados. A partir do próximo relatório esta seção mostra quantas pessoas visitaram
    o site, por onde chegaram e quais páginas mais interessaram, já com a comparação
    mês a mês.</div>
</section>"""
    cartoes = kpi(num(a["usuarios"]), "Pessoas que visitaram o site", chip(v["usuarios"]))
    cartoes += kpi(num(a["sessoes"]), "Sessões abertas", chip(v["sessoes"]))
    cartoes += kpi(num(a["paginas"]), "Páginas vistas", chip(v["paginas"]))
    cartoes += kpi(duracao(a["duracao"]), "Tempo médio por sessão")

    canais = [(CANAIS.get(c["nome"], traduzir_regiao(c["nome"])), c["sessoes"])
              for c in d["canais"]]

    def recorte(itens, total, titulo, vazio, padrao_icone=ICONE_LINK):
        """Subtotal em destaque + barras da origem, já com nome legível."""
        if not itens:
            return f'<div class="ausente">{vazio}</div>'
        return (f'<div class="subtotal"><span class="n num">{num(total)}</span>'
                f'<span class="t">{titulo}</span></div>'
                + barras(agrupar_origens(itens)[:12],
                         formato=lambda x: f"{num(x)} sessões",
                         icone_padrao=padrao_icone))


    bloco_social = recorte(
        d.get("social", []), d.get("sessoes_social", 0),
        "sessões vieram de redes sociais",
        "Nenhuma visita de rede social no período.", ICONE_LINK)

    bloco_ia_ = recorte(
        d.get("ia", []), d.get("sessoes_ia", 0),
        "sessões vieram de ferramentas de IA",
        "Nenhuma visita identificada como vinda de IA no período.", ICONE_LINK)

    bloco_links = recorte(
        d.get("backlinks", []), d.get("sessoes_backlinks", 0),
        "sessões vieram de links em outros sites",
        "Nenhuma visita por link de outro site no período.", ICONE_LINK)

    buscadores = d.get("buscadores", [])
    if buscadores:
        bloco_busca = f"""
  <h3>Outros buscadores</h3>
  <p class="linhafina">Pessoas que encontraram o site por buscadores que não são o
     Google, como Brave e DuckDuckGo. Aparecem separados dos links porque aqui
     ninguém publicou um link: a pessoa pesquisou.</p>
  {recorte(buscadores, d.get("sessoes_buscadores", 0),
           "sessões vieram de outros buscadores", "", ICONE_BUSCA)}"""
    else:
        bloco_busca = ""

    # O bloco fica pronto e desligado: so entra quando o rastreio de
    # cliques estiver completo no site, senao publica um numero que
    # subestima o trabalho entregue.
    contato = d.get("contato", []) if mostrar_contatos else []
    if contato:
        taxa = round(100 * d["contatos_total"] / a["sessoes"], 2) if a["sessoes"] else 0
        hosts_ev = d.get("contatos_por_host") or {}
        onde = {}
        for host, eventos_host in hosts_ev.items():
            for nome_ev in eventos_host:
                onde[nome_ev] = host
        col_origem = len(hosts_ev) > 1

        def celula_origem(e):
            if not col_origem:
                return ""
            host = onde.get(e["nome"], "")
            rotulo = "Site" if host and not host.startswith("blog.") else "Blog"
            return f'<td data-rotulo="Onde">{esc(rotulo)}</td>' if host else                    '<td data-rotulo="Onde">todo o site</td>'

        linhas_ct = "".join(
            f'<tr><td data-rotulo="Ação do paciente">{esc(nome_evento(e["nome"]))}</td>'
            f'{celula_origem(e)}'
            f'<td class="n num" data-rotulo="Vezes">{num(e["contagem"])}</td>'
            f'<td data-rotulo="Conta como conversão">'
            f'{"Sim" if e["conversoes"] else "<span class=chave-nao>Ainda não</span>"}</td></tr>'
            for e in contato)
        cab_origem = '<th scope="col">Onde</th>' if col_origem else ""
        if rastreio_completo:
            hosts = d.get("contatos_por_host") or {}
            if len(hosts) > 1:
                detalhe = (f'Site e blog são medidos separadamente e somados. '
                           f'Dentro de cada um vale o maior evento, porque um '
                           f'mesmo clique dispara mais de um.')
            else:
                detalhe = ('Um mesmo clique pode disparar mais de um evento, '
                           'então contamos o maior deles em vez de somar.')
            legenda_contato = (f'contatos no período, {str(taxa).replace(".", ",")}% '
                               f'das sessões. {detalhe}')
        else:
            # Divulgar taxa de conversao com rastreio parcial produz um numero
            # que parece pessimo e nao e verdadeiro. Melhor nao publicar a taxa.
            legenda_contato = ('cliques registrados no único botão que hoje está '
                               'medido. O número real de contatos é maior.')
        sem_chave = [e for e in contato if not e["conversoes"]]
        aviso_ct = ""
        if not rastreio_completo:
            aviso_ct = ('<div class="nota alerta"><strong>Leia antes de comparar '
                        'este número.</strong> A medição de contatos foi instalada '
                        'recentemente e hoje cobre apenas um dos botões de contato '
                        'do site. Os demais botões de WhatsApp e o telefone ainda '
                        'não são contabilizados, portanto este valor é um piso, não '
                        'o total de pacientes que procuraram o consultório. A '
                        'cobertura completa entra na próxima atualização do site.</div>')
        elif sem_chave:
            aviso_ct = ('<div class="nota"><strong>O que significa "ainda não" '
                        'na última coluna.</strong> O contato está sendo contado '
                        'normalmente e aparece neste relatório. O que falta é marcá-lo '
                        'como objetivo dentro do Google Analytics, passo que libera o '
                        'cálculo automático de taxa de conversão no painel do Google e '
                        'permite usar essa ação para otimizar campanhas. É um ajuste de '
                        'configuração da conta, não uma perda de dado.</div>')
        bloco_contato = f"""
  <h3>Contatos gerados pelo site</h3>
  <div class="subtotal"><span class="n num">{num(d["contatos_total"])}</span>
    <span class="t">{legenda_contato}</span></div>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Cliques em botões de contato e envios de formulário. A coluna de
      conversão indica se o Google já está usando essa ação como objetivo da conta.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Ação do paciente</th>{cab_origem}
      <th scope="col" class="n">Vezes</th>
      <th scope="col">Conta como conversão</th>
    </tr></thead><tbody role="rowgroup">{linhas_ct}</tbody>
  </table></div>{aviso_ct}"""
    else:
        bloco_contato = ""

    # Os cortes por método, botão, página e canal vêm das dimensões
    # personalizadas. Seguem a mesma trava do bloco acima: sem rastreio
    # publicado, não se publica recorte.
    bloco_contato += (bloco_contato_detalhe(d.get("contato_detalhe"))
                      if mostrar_contatos else "")

    # Vídeo: três eventos do MESMO play, então nunca somar. Cada um responde
    # uma pergunta: quantos deram play, quantos passaram do começo, quantos
    # foram até o fim.
    v = d.get("video") or {}
    if v.get("inicios") or v.get("progresso") or v.get("completos"):
        retencao = (round(100 * v["completos"] / v["inicios"])
                    if v.get("inicios") else 0)
        cartoes_v = kpi(num(v["inicios"]), "Pessoas que deram play")
        cartoes_v += kpi(num(v["progresso"]), "Passaram do começo do vídeo")
        cartoes_v += kpi(num(v["completos"]), "Assistiram até o fim")
        cartoes_v += kpi(f"{retencao}%", "Dos que começaram, terminaram")
        quais = ""
        if v.get("titulos"):
            linhas_v = "".join(
                f'<tr><td data-rotulo="Vídeo">{esc(t["titulo"])}</td>'
                f'<td class="n num" data-rotulo="Interações">{num(t["eventos"])}</td></tr>'
                for t in v["titulos"])
            quais = f"""
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Vídeos assistidos no período.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Vídeo</th><th scope="col" class="n">Interações</th>
    </tr></thead><tbody role="rowgroup">{linhas_v}</tbody>
  </table></div>"""
        bloco_video_ga = f"""
  <h3>Vídeos do site</h3>
  <p class="linhafina">Quem dá play mostra interesse real e passa mais tempo com você
     antes de decidir. Por isso o vídeo costuma converter melhor que o texto.</p>
  <div class="kpis">{cartoes_v}</div>{quais}"""
    elif not mostrar_video:
        bloco_video_ga = ""
    else:
        bloco_video_ga = """
  <h3>Vídeos do site</h3>
  <p class="linhafina">Quem dá play mostra interesse real e passa mais tempo com você
     antes de decidir. Por isso o vídeo costuma converter melhor que o texto.</p>
  <div class="nota">A medição de vídeo foi ativada agora e ainda não acumulou dados
    neste período. A partir do próximo relatório este bloco passa a mostrar quantas
    pessoas deram play, quantas passaram do começo e quantas assistiram até o fim,
    já com a comparação mês a mês.</div>"""

    def url_pagina(caminho):
        if dominio and caminho.startswith("/"):
            return f"https://{dominio}{caminho}"
        return None

    paginas = "".join(
        f'<tr><td data-rotulo="Página">'
        f'{link(url_pagina(p["caminho"]), p["caminho"])}</td>'
        f'<td class="n num" data-rotulo="Visualizações">{num(p["visualizacoes"])}</td></tr>'
        for p in d["paginas"])

    return f"""<section>
  <div class="cab"><span class="idx mono">{idx_ga4}</span><h2>Todas as visitas ao site</h2></div>
  <div class="fonte-dado">{SELO_GA4} Google Analytics 4</div>
  <p class="linhafina">Período de {esc(d['periodo'])}.</p>
  <div class="explica">
    <strong>O que esta seção mede, e por que difere da anterior</strong>
    Aqui entra <em>toda visita ao site, venha de onde vier</em>: busca do Google,
    Instagram, WhatsApp, link publicado em outro site, ChatGPT ou endereço digitado
    direto no navegador. A seção anterior contava só a busca do Google. São medições
    diferentes do mesmo site, e é normal que os números não coincidam.
  </div>
  <div class="kpis">{cartoes}</div>

  <h3>Por onde as pessoas chegaram</h3>
  {barras(canais, formato=lambda x: f"{num(x)} sessões",
          icone_padrao=ICONE_BUSCA)}

  <h3>Redes sociais</h3>
  {bloco_social}

  <h3>Ferramentas de IA</h3>
  <p class="linhafina">É a ponte entre aparecer na resposta da IA, medido na seção 01,
     e receber a visita de fato.</p>
  {bloco_ia_}

  <h3>Links em outros sites que trouxeram visitas</h3>
  <p class="linhafina">Sites que publicaram um link para o seu e geraram acesso.
     São os backlinks que estão funcionando na prática.</p>
  {bloco_links}
{bloco_busca}
{bloco_video_ga}
{bloco_contato}
{bloco_engajamento(d.get('engajamento'))}
  <h3>De onde vêm os visitantes</h3>
  <p class="linhafina">{esc(texto_geografia)}</p>
  {barras([(traduzir_regiao(e["nome"]), e["sessoes"]) for e in d.get("estados", [])[:8]],
          formato=lambda x: f"{num(x)} sessões", icone_padrao=ICONE_BUSCA)}

  <h3>Páginas mais vistas</h3>
  <div class="tabwrap"><table class="tab" role="table">
    <caption>Páginas com mais visualizações no período.</caption>
    <thead role="rowgroup"><tr role="row">
      <th scope="col">Página</th><th scope="col" class="n">Visualizações</th>
    </tr></thead><tbody role="rowgroup">{paginas}</tbody>
  </table></div>
</section>"""


# ------------------------------------------------------------------ pagina

def montar_html(nome, dias, linhas, anteriores, falhas, google, termos=None,
                dominio=None, rastreio_completo=True, mostrar_contatos=False,
                historico=None, trabalho=None, video=None,
                recomendacoes=None, pauta=None, mostrar_video=False,
                posicoes=None, texto_geografia=None):
    termos = termos or [nome]
    a = resumir_ia(linhas) if linhas else None
    gsc, ga4 = google.get("gsc"), google.get("ga4")
    # Sem Search Console (cliente cujo acesso está com outra agência), o
    # domínio precisa vir do config, senão os links das páginas do GA4 somem.
    if not dominio and gsc:
        dominio = gsc["site"].replace("sc-domain:", "").replace("https://", "").strip("/")

    destaques = ""
    if a:
        destaques += (f'<div><div class="v num">{a["taxa"]}%</div>'
                      f'<div class="r">das respostas de IA citaram você</div></div>')
        if a["media"]:
            destaques += (f'<div><div class="v num">{decimal(a["media"], "º")}</div>'
                          f'<div class="r">posição média na lista da IA</div></div>')
    if gsc:
        destaques += (f'<div><div class="v num">{num(gsc["atual"]["cliques"])}</div>'
                      f'<div class="r">cliques vindos do Google</div></div>')
    if ga4:
        destaques += (f'<div><div class="v num">{num(ga4["atual"]["usuarios"])}</div>'
                      f'<div class="r">pessoas visitaram o site</div></div>')

    erros = ""
    if google.get("erros"):
        itens = "".join(f"<li>{esc(e)}</li>" for e in google["erros"])
        erros = (f'<div class="nota alerta"><strong>Dados parciais.</strong> '
                 f'Não foi possível coletar: <ul>{itens}</ul></div>')

    corpo = (bloco_recomendacoes(recomendacoes)
             + bloco_trabalho(trabalho)
             + bloco_ia(linhas, anteriores, falhas, nome, termos, historico, dominio)
             + bloco_posicoes(posicoes)
             + bloco_gsc(gsc, "03" if posicoes else "02")
             + bloco_ga4(ga4, dominio, rastreio_completo, mostrar_contatos,
                         mostrar_video, "04" if posicoes else "03",
                         texto_geografia)
             + bloco_pauta(pauta)
             + bloco_video(video))
    if not corpo:
        corpo = ('<section><div class="ausente">Nenhuma fonte de dados '
                 'disponível para este período.</div></section>')

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
{f'<link rel="icon" href="{FAVICON}">' if FAVICON else ''}
<title>Relatório de Presença Digital · {esc(nome)}</title>
{FONTES_HEAD}
<style>{CSS}</style>
</head>
<body>
<header class="capa"><div class="folha">
  <p class="selo mono">QMIX Digital · Relatório mensal</p>
  <h1>{esc(nome)}</h1>
  <p class="sub">Presença digital nos últimos {dias} dias · Inteligência Artificial,
     Google e audiência do site · Emitido em {datetime.now().strftime('%d/%m/%Y')}</p>
  <div class="destaques">{destaques}</div>
</div></header>

<main class="folha">{erros}{corpo}
  <footer class="rodape">
    <p><strong>Como estes números são apurados.</strong> A seção de Inteligência
       Artificial vem de perguntas reais enviadas às ferramentas de IA com busca na web
       ativada, e a posição é a ordem em que os nomes aparecem na resposta. O desempenho
       no Google vem do Search Console, que fecha os dados com cerca de três dias de
       atraso. A audiência vem do Google Analytics 4.</p>
    <div class="assinatura">
      {f'<img src="{LOGO}" alt="QMIX Digital" width="132" height="34">' if LOGO
       else '<span class="marca-texto">QMIX Digital</span>'}
      <div class="texto-marca">
        <p class="chamada">Agência de <strong>SEO&nbsp;e&nbsp;GEO</strong></p>
        <p class="promessa">Seu site e suas redes na primeira página do Google
           e nas respostas das IAs.</p>
        <p class="creditos">Relatório produzido pela QMIX Digital ·
           <a href="https://qmix.com.br" target="_blank" rel="noopener">qmix.com.br</a></p>
      </div>
    </div>
  </footer>
</main>
</body>
</html>"""


# ------------------------------------------------------------------ dados

def carregar(con, cliente_id, inicio, fim):
    linhas = con.execute(
        "SELECT * FROM consultas WHERE cliente_id = ? AND data_hora >= ?"
        " AND data_hora < ? AND erro IS NULL", (cliente_id, inicio, fim)).fetchall()
    return [{
        "prompt": r["prompt"], "provedor": r["provedor"],
        "mencionado": bool(r["mencionado"]), "posicao": r["posicao"],
        "total_citados": r["total_citados"], "trecho": r["trecho"],
        "concorrentes": json.loads(r["concorrentes"] or "[]"),
        "sequencia": json.loads(r["sequencia"] or "[]"),
        "fontes": json.loads(r["fontes"] or "[]"),
    } for r in linhas]


def carregar_historico(con, cliente_id):
    """Uma linha por dia de medição, para o gráfico de evolução."""
    linhas = con.execute(
        "SELECT substr(data_hora,1,10) AS dia, COUNT(*) AS total,"
        " SUM(mencionado) AS citadas,"
        " AVG(CASE WHEN posicao IS NOT NULL THEN posicao END) AS pos"
        " FROM consultas WHERE cliente_id = ? AND erro IS NULL"
        " GROUP BY dia ORDER BY dia", (cliente_id,)).fetchall()
    saida = []
    for r in linhas[-12:]:
        d = r["dia"]
        saida.append({
            "rotulo": f"{d[8:10]}/{d[5:7]}",
            "total": r["total"], "citadas": r["citadas"] or 0,
            "taxa": round(100 * (r["citadas"] or 0) / r["total"]) if r["total"] else 0,
            "posicao": round(r["pos"], 1) if r["pos"] else None,
        })
    return saida


def gravar(nome_arquivo, conteudo):
    os.makedirs(SAIDA, exist_ok=True)
    caminho = os.path.join(SAIDA, nome_arquivo)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(conteudo)
    print(f"Gerado: {caminho}")


def gerar_exemplo():
    linhas = [
        {"prompt": "Quem é o melhor ortopedista de joelho em Goiânia?",
         "provedor": "openai", "mencionado": True, "posicao": 1, "total_citados": 3,
         "trecho": "o Dr. Fulano de Tal é referência em cirurgia de joelho na região",
         "concorrentes": ["Dr. Beltrano", "Dr. Sicrano"],
         "sequencia": [{"nome": "Dr. Fulano de Tal", "voce": True},
                       {"nome": "Dr. Beltrano", "voce": False},
                       {"nome": "Dr. Sicrano", "voce": False}],
         "fontes": ["doctoralia.com.br", "drfulano.com.br"]},
        {"prompt": "Indique um cirurgião de joelho em Goiânia",
         "provedor": "anthropic", "mencionado": True, "posicao": 2, "total_citados": 3,
         "trecho": "entre os mais recomendados está Fulano de Tal, bem avaliado",
         "concorrentes": ["Dr. Beltrano", "Dr. Sicrano"],
         "sequencia": [{"nome": "Dr. Beltrano", "voce": False},
                       {"nome": "Dr. Fulano de Tal", "voce": True},
                       {"nome": "Dr. Sicrano", "voce": False}],
         "fontes": ["doctoralia.com.br", "em.com.br"]},
    ]
    anteriores = [dict(linhas[0], mencionado=False, posicao=None, sequencia=[])]
    conteudo = montar_html("Dr. Fulano de Tal", 30, linhas, anteriores, 1,
                           {"gsc": None, "ga4": None, "erros": []})
    caminho = os.path.join(BASE, "exemplo-relatorio.html")
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(conteudo)
    print(f"Gerado: {caminho}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cliente")
    ap.add_argument("--dias", type=int, default=30)
    ap.add_argument("--sem-google", action="store_true",
                    help="não consulta Search Console nem GA4")
    ap.add_argument("--exemplo", action="store_true")
    args = ap.parse_args()

    if args.exemplo:
        gerar_exemplo()
        return
    if not os.path.exists(DB):
        raise SystemExit("Banco não encontrado. Rode primeiro: python monitor.py")

    cfg = {}
    if os.path.exists(CONFIG):
        with open(CONFIG, encoding="utf-8") as f:
            cfg = json.load(f)
    por_id = {c["id"]: c for c in cfg.get("clientes", [])}

    agora = datetime.now(timezone.utc)
    inicio = (agora - timedelta(days=args.dias)).isoformat(timespec="seconds")
    inicio_ant = (agora - timedelta(days=args.dias * 2)).isoformat(timespec="seconds")
    fim = agora.isoformat(timespec="seconds")

    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    filtro = "AND cliente_id = ?" if args.cliente else ""
    params = [inicio] + ([args.cliente] if args.cliente else [])
    clientes = con.execute(
        f"SELECT DISTINCT cliente_id, cliente_nome FROM consultas"
        f" WHERE data_hora >= ? {filtro}", params).fetchall()

    # Cliente que so tem Google configurado (sem consulta de IA) tambem vira relatorio.
    vistos = {c["cliente_id"] for c in clientes}
    extras = [(cid, c["nome"]) for cid, c in por_id.items()
              if cid not in vistos and c.get("google")
              and (not args.cliente or cid == args.cliente)]

    alvos = [(c["cliente_id"], c["cliente_nome"]) for c in clientes] + extras
    if not alvos:
        raise SystemExit("Nenhum dado no período. Rode primeiro: python monitor.py")

    try:
        import serprobot
        ranking_serprobot = serprobot.carregar()
    except Exception:
        ranking_serprobot = {}

    gerados = 0
    for cid, cnome in alvos:
        linhas = carregar(con, cid, inicio, fim)
        anteriores = carregar(con, cid, inicio_ant, inicio)
        falhas = con.execute(
            "SELECT COUNT(*) FROM consultas WHERE cliente_id = ? AND data_hora >= ?"
            " AND erro IS NOT NULL", (cid, inicio)).fetchone()[0]

        # Casa a exportacao do SERPRobot pelo dominio que vem no proprio
        # arquivo, entao basta jogar o CSV na pasta, sem configurar nada.
        alvo = por_id.get(cid, {})
        dominio_cli = (alvo.get("dominio")
                       or ((alvo.get("google") or {}).get("search_console") or {})
                       .get("site", ""))
        dominio_cli = (str(dominio_cli).replace("sc-domain:", "")
                       .replace("https://", "").replace("http://", "")
                       .split("/")[0].replace("www.", "").lower())
        posicoes = ranking_serprobot.get(dominio_cli)

        google = {"gsc": None, "ga4": None, "erros": []}
        if not args.sem_google and por_id.get(cid, {}).get("google"):
            import google_dados
            print(f"Coletando Search Console e GA4 de {cnome}...")
            google = google_dados.coletar(cfg, por_id[cid], args.dias)
            for e in google["erros"]:
                print(f"  aviso: {e}")

        if not linhas and not google["gsc"] and not google["ga4"]:
            print(f"[SEM RELATÓRIO] {cnome}: nenhuma fonte de dados no período "
                  f"({falhas} consultas de IA falharam).")
            continue

        dados_cliente = por_id.get(cid, {})
        termos = [cnome] + list(dados_cliente.get("apelidos", []))
        gravar(f"relatorio-{cid}.html",
               montar_html(cnome, args.dias, linhas, anteriores, falhas, google,
                           termos, dados_cliente.get("dominio"),
                           dados_cliente.get("rastreio_completo", True),
                           dados_cliente.get("mostrar_contatos", False),
                           carregar_historico(con, cid),
                           dados_cliente.get("trabalho_realizado"),
                           dados_cliente.get("video"),
                           dados_cliente.get("recomendacoes"),
                           dados_cliente.get("pauta"),
                           dados_cliente.get("mostrar_video", False),
                           posicoes,
                           dados_cliente.get("texto_geografia")))
        gerados += 1

    con.close()
    if not gerados:
        raise SystemExit("Nenhum relatório gerado.")


if __name__ == "__main__":
    main()
