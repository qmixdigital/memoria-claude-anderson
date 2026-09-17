#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Drip de backlinks: gera artigo ORIGINAL (DeepSeek) sobre trânsito/auto, injeta 1
link contextual para a home do Concar (âncora rotativa) e publica num site da rede
QMIX via /artigos (sistema Antônio). Uso e regras: ver PLANO.md.

  export DEEPSEEK_API_KEY="sk-..."
  python enviar_backlink.py --limit 5 --dry-run
  python enviar_backlink.py --limit 5 --offset 0
"""
import argparse, csv, json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(HERE, "..", "qmix_endpoints_atual.csv")
LOG_PATH = os.path.join(HERE, "enviados.log")
TARGET = "https://www.concar.com.br/"

# Sites fora do escopo (link de placa fica artificial) — filtra por substring no domínio.
EXCLUI = ("saude", "cirurgia", "ortope", "medic", "planomedico", "geriatric",
          "educac", "professor", "filmesseries", "ebookcult", "topsaude")

ANCORAS = [
    "consulta de placa", "consulta de placa do carro", "consultar a placa do veículo",
    "consulta veicular pela placa", "consulta de placa completa", "consultar placa online",
    "consulta de placa de veículos", "consultar placa de carro", "consulta da placa do automóvel",
    "consulta de placa rápida", "consulta veicular por placa", "consulta de placa com débitos e leilão",
]
TOPICOS = [
    "cuidados ao comprar um carro usado e como evitar golpes",
    "o que verificar antes de transferir um veículo",
    "como funciona o IPVA e o licenciamento anual",
    "principais golpes na compra e venda de carros",
    "gravame e alienação fiduciária: o que o comprador precisa saber",
    "como saber se um carro tem histórico de leilão ou sinistro",
    "multas e débitos: como regularizar antes de vender o carro",
    "documentação do veículo: ATPV-e e transferência de propriedade",
    "dicas para vender seu carro com segurança e mais rápido",
    "placa Mercosul x placa antiga: o que muda para o motorista",
]
FRASES = [
    '<p>Antes de fechar negócio em um usado, vale fazer uma <a href="{u}">{a}</a> para checar débitos, leilão e gravame do veículo.</p>',
    '<p>Uma dica útil para quem vai comprar: faça uma <a href="{u}">{a}</a> e confira a situação do carro com dados oficiais.</p>',
    '<p>Para evitar surpresas, especialistas recomendam uma <a href="{u}">{a}</a> antes de assinar qualquer contrato.</p>',
    '<p>Quem vai comprar ou vender pode recorrer a uma <a href="{u}">{a}</a> para ver multas, débitos e restrições do veículo.</p>',
    '<p>Vale lembrar: uma <a href="{u}">{a}</a> revela pendências que o anúncio costuma omitir.</p>',
]

def gerar_artigo(topico):
    key = os.environ.get("DEEPSEEK_API_KEY")
    if not key:
        sys.exit("ERRO: defina DEEPSEEK_API_KEY no ambiente.")
    sys_p = ("Você é redator pt-BR. Escreva um artigo ORIGINAL, informativo e neutro sobre o tema, "
             "com acentuação correta. 4 a 6 parágrafos em HTML (<p>, e <h2> para 1 subtítulo). "
             'Responda SOMENTE JSON: {"title":"","html":""}. Sem markdown, sem imagens.')
    body = json.dumps({
        "model": "deepseek-chat",
        "messages": [{"role": "system", "content": sys_p},
                     {"role": "user", "content": f"Tema: {topico}. Público: motoristas brasileiros."}],
        "temperature": 0.8, "max_tokens": 1500, "response_format": {"type": "json_object"},
    }).encode("utf-8")
    req = urllib.request.Request("https://api.deepseek.com/chat/completions", data=body,
                                 headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.loads(r.read())
    d = json.loads(data["choices"][0]["message"]["content"])
    return d.get("title", "").strip(), d.get("html", "").strip()

def publicar(endpoint, api_key, title, html, dry):
    if dry:
        return "(dry-run)"
    body = json.dumps({"title": title, "content": html, "status": "publish"}).encode("utf-8")
    req = urllib.request.Request(endpoint, data=body,
                                 headers={"Content-Type": "application/json", "X-API-KEY": api_key})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return f"OK {r.status}"
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read()[:120].decode('utf-8','ignore')}"
    except Exception as e:
        return f"ERRO: {e}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=5)
    ap.add_argument("--offset", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    feitos = set()
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH, encoding="utf-8") as f:
            feitos = {l.split("\t")[0] for l in f if l.strip()}

    with open(CSV_PATH, encoding="utf-8") as f:
        linhas = [r for r in csv.DictReader(f)]
    alvos = [r for r in linhas
             if not any(x in r["domain"].lower() for x in EXCLUI)
             and r["domain"] not in feitos]
    alvos = alvos[args.offset: args.offset + args.limit]
    if not alvos:
        print("Nada a fazer (todos já enviados ou filtrados).")
        return

    base = len(feitos)  # avança âncora/frase entre execuções (regra: máx 2× cada âncora)
    for i, r in enumerate(alvos):
        n = base + i
        anc = ANCORAS[n % len(ANCORAS)]
        topico = TOPICOS[n % len(TOPICOS)]
        frase = FRASES[n % len(FRASES)].format(u=TARGET, a=anc)
        print(f"\n[{r['domain']}] tema='{topico[:40]}...' âncora='{anc}'")
        try:
            title, html = (f"[teste] {topico}", "<p>conteúdo</p>") if args.dry_run else gerar_artigo(topico)
        except Exception as e:
            print(f"  falha DeepSeek: {e}"); continue
        # injeta o link após o 1º parágrafo (contextual, não no fim)
        corte = html.find("</p>")
        html = (html[:corte+4] + "\n" + frase + "\n" + html[corte+4:]) if corte != -1 else (html + "\n" + frase)
        res = publicar(r["endpoint_url"], r["api_key"], title, html, args.dry_run)
        print(f"  -> {res}")
        if not args.dry_run and res.startswith("OK"):
            with open(LOG_PATH, "a", encoding="utf-8") as lg:
                lg.write(f"{r['domain']}\t{anc}\t{res}\n")
            time.sleep(3)  # respiro entre sites

if __name__ == "__main__":
    main()
