"""Painel de status na porta 3400, em 127.0.0.1.

Mostra o gasto acumulado do mes por componente, a projecao contra o teto, o
estado da pausa por orcamento, as metricas de rampa e a fila do pipeline.

Sem dependencia de framework: http.server da propria biblioteca padrao. O
painel nao escreve nada, exceto o par de rotas de pausa e retomada.
"""
from __future__ import annotations

import json
import logging
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import budget, config, db, dedupe, publish

log = logging.getLogger("motor.status")


def panorama():
    fila = db.q(
        "SELECT estado, COUNT(*) AS n FROM artigos_fonte GROUP BY estado") or []
    fatos = db.q(
        "SELECT COUNT(*) FILTER (WHERE pronto AND NOT encerrado) AS prontos, "
        "COUNT(*) AS total FROM fatos", um=True) or {}
    agenda = db.q(
        "SELECT estado, COUNT(*) AS n FROM agenda "
        "WHERE slot > now() - interval '7 days' GROUP BY estado") or []
    materias = db.q(
        "SELECT estado, COUNT(*) AS n FROM materias GROUP BY estado") or []
    lotes = db.q(
        "SELECT batch_id, modelo, n_pedidos, estado, criado_em FROM lotes "
        "ORDER BY criado_em DESC LIMIT 5") or []

    return {
        "orcamento": budget.resumo_mes(),
        "pipeline": {
            "fontes_por_estado": {l["estado"]: l["n"] for l in fila},
            "fatos_prontos": fatos.get("prontos", 0),
            "fatos_total": fatos.get("total", 0),
            "agenda_7d": {l["estado"]: l["n"] for l in agenda},
            "materias": {l["estado"]: l["n"] for l in materias},
        },
        "rampa": publish.metricas(7),
        "arbitro": dedupe.metricas_arbitro(),
        "lotes_recentes": [
            {"batch_id": l["batch_id"], "modelo": l["modelo"],
             "pedidos": l["n_pedidos"], "estado": l["estado"],
             "criado_em": l["criado_em"].isoformat()} for l in lotes],
        "config": {
            "portais_ativos": len(config.sites()),
            "modelo_geracao": config.modelo_geracao(),
            "modelo_mecanico": config.modelo_mecanico(),
            "artigos_por_semana_por_portal": config.artigos_por_semana(),
            "teste_cego_ativo": config.teste_cego_ativo(),
        },
        "ultimo_alerta": db.estado_get("ultimo_alerta"),
    }


HTML = """<!doctype html><meta charset="utf-8">
<title>Motor de Pautas</title>
<style>
:root{--bg:#fbf9f5;--ink:#1a1714;--line:#e7e1d6;--pri:#b4232a;--ok:#1d7a4c}
*{box-sizing:border-box}
body{margin:0;padding:28px;background:var(--bg);color:var(--ink);
font:15px/1.55 ui-sans-serif,system-ui,-apple-system,sans-serif}
h1{font-size:20px;margin:0 0 4px}
p.sub{margin:0 0 24px;color:#6b6259;font-size:13px}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(290px,1fr))}
.c{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px}
.c h2{font-size:12px;letter-spacing:.06em;text-transform:uppercase;
margin:0 0 12px;color:#6b6259;font-weight:600}
table{width:100%;border-collapse:collapse;font-size:14px}
td{padding:5px 0;border-bottom:1px solid #f0ece4}
td:last-child{text-align:right;font-variant-numeric:tabular-nums}
tr:last-child td{border-bottom:0}
.big{font-size:30px;font-weight:700;font-variant-numeric:tabular-nums}
.bar{height:8px;background:#efeae1;border-radius:99px;overflow:hidden;margin:10px 0 6px}
.bar>i{display:block;height:100%;background:var(--ok)}
.alerta{background:#fdf1f1;border-color:#e9c5c5;color:#8a1f24}
.pausado{color:var(--pri);font-weight:700}
@media(prefers-color-scheme:dark){
:root{--bg:#16140f;--ink:#f0ece4;--line:#2e2a24}
.c{background:#1e1b16}td{border-color:#2a2620}.bar>i{background:#3fa06a}
.alerta{background:#2a1616;border-color:#5a2b2b;color:#f2b8b8}}
</style>
<h1>Motor de Pautas</h1>
<p class="sub">Google News Discovery · atualiza a cada 20 s</p>
<div id="app" class="grid">carregando…</div>
<script>
const n=x=>x==null?"—":x;
const money=x=>x==null?"—":"US$ "+Number(x).toFixed(2);
function tab(o){return "<table>"+Object.entries(o||{}).map(
 ([k,v])=>"<tr><td>"+k+"</td><td>"+n(v)+"</td></tr>").join("")+"</table>";}
async function tick(){
 const d=await (await fetch("/api")).json();
 const o=d.orcamento, pct=o.percentual_do_teto||0;
 const comp={}; for(const[k,v] of Object.entries(o.por_componente||{}))
   comp[k]=money(v.usd)+(v.preco_conhecido?"":" ⚠");
 let h="";
 h+='<div class="c"><h2>Gasto do mês '+o.mes+'</h2>'
  +'<div class="big">'+money(o.total_usd)+'</div>'
  +'<div class="bar"><i style="width:'+Math.min(pct,100)+'%"></i></div>'
  +'<table><tr><td>projeção do mês</td><td>'+money(o.projecao_mes_usd)+'</td></tr>'
  +'<tr><td>teto</td><td>'+money(o.teto_usd)+' (R$ '+o.teto_brl+')</td></tr>'
  +'<tr><td>do teto</td><td>'+(pct?pct+"%":"—")+'</td></tr>'
  +'<tr><td>dia</td><td>'+o.dia_do_mes+'/'+o.dias_no_mes+'</td></tr></table>'
  +(o.pausado?'<p class="pausado">GERAÇÃO PAUSADA POR ORÇAMENTO</p>':'')+'</div>';
 h+='<div class="c"><h2>Por componente</h2>'+tab(comp)+'</div>';
 const prov={}; for(const[k,v] of Object.entries(o.por_provedor||{}))
   prov[k]=money(v)+"  (degrau US$ "+(Math.floor(v/5)*5)+")";
 h+='<div class="c"><h2>Por provedor · crédito pré-pago</h2>'+tab(prov)
  +'<p style="font-size:12px;color:#6b6259;margin:10px 0 0">'
  +'Alerta por e-mail a cada US$ 5 acumulados em cada provedor.</p></div>';
 h+='<div class="c"><h2>Árbitro do dedupe</h2>'
  +'<table><tr><td>chamadas</td><td>'+d.arbitro.chamadas+'</td></tr>'
  +'<tr><td>confirmou</td><td>'+d.arbitro.confirmou+'</td></tr>'
  +'<tr><td>taxa de confirmação</td><td>'
  +(d.arbitro.taxa_confirmacao==null?"—":d.arbitro.taxa_confirmacao+"%")+'</td></tr>'
  +'</table><p style="font-size:12px;color:#6b6259;margin:10px 0 0">'
  +'Acima de 90% significa que a peneira pode decidir sozinha em mais casos '
  +'(alvo de otimização da fase 2).</p></div>';
 h+='<div class="c"><h2>Pipeline</h2>'+tab(d.pipeline.fontes_por_estado)
  +'<table><tr><td>fatos prontos</td><td>'+d.pipeline.fatos_prontos+'</td></tr>'
  +'<tr><td>fatos total</td><td>'+d.pipeline.fatos_total+'</td></tr></table></div>';
 h+='<div class="c"><h2>Agenda 7 dias</h2>'+tab(d.pipeline.agenda_7d)
  +'<h2 style="margin-top:14px">Matérias</h2>'+tab(d.pipeline.materias)+'</div>';
 h+='<div class="c"><h2>Rampa (7 dias)</h2>'
  +'<table><tr><td>publicações</td><td>'+d.rampa.total+'</td></tr>'
  +'<tr><td>taxa de skipped</td><td>'+d.rampa.taxa_skipped+'%</td></tr>'
  +'<tr><td>taxa de erro</td><td>'+d.rampa.taxa_erro+'%</td></tr></table>'
  +tab(d.rampa.por_status)+'</div>';
 h+='<div class="c"><h2>Configuração</h2>'+tab(d.config)+'</div>';
 if(d.ultimo_alerta) h+='<div class="c alerta"><h2>Último alerta</h2><b>'
  +d.ultimo_alerta.assunto+'</b><p>'+d.ultimo_alerta.corpo+'</p><small>'
  +d.ultimo_alerta.quando+'</small></div>';
 document.getElementById("app").innerHTML=h;
}
tick(); setInterval(tick,20000);
</script>
"""


class Handler(BaseHTTPRequestHandler):
    def _responder(self, code, corpo, tipo="application/json; charset=utf-8"):
        dados = corpo.encode("utf-8") if isinstance(corpo, str) else corpo
        self.send_response(code)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        rota = self.path.split("?")[0]
        try:
            if rota in ("/", "/index.html"):
                return self._responder(200, HTML, "text/html; charset=utf-8")
            if rota == "/api":
                return self._responder(
                    200, json.dumps(panorama(), ensure_ascii=False,
                                    default=str))
            if rota == "/health":
                return self._responder(200, json.dumps({"ok": True}))
            if rota == "/orcamento":
                return self._responder(
                    200, json.dumps(budget.resumo_mes(), ensure_ascii=False,
                                    default=str))
            return self._responder(404, json.dumps({"erro": "rota"}))
        except Exception as e:
            log.exception("painel falhou")
            return self._responder(500, json.dumps({"erro": str(e)}))

    def do_POST(self):
        rota = self.path.split("?")[0]
        if rota == "/pausar":
            budget.pausar("pausa manual pelo painel")
            return self._responder(200, json.dumps({"pausado": True}))
        if rota == "/retomar":
            budget.retomar()
            return self._responder(200, json.dumps({"pausado": False}))
        return self._responder(404, json.dumps({"erro": "rota"}))

    def log_message(self, *a):
        pass  # nao poluir o journal com uma linha por requisicao do painel


def servir_em_thread():
    porta = config.porta_painel()
    srv = ThreadingHTTPServer(("127.0.0.1", porta), Handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True,
                         name="painel")
    t.start()
    log.info("painel em http://127.0.0.1:%d", porta)
    return srv
