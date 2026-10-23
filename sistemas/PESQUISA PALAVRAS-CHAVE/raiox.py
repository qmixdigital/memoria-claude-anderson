#!/usr/bin/env python
"""Raio-X de mercado: pesquisa de palavras-chave e presença em IA com a DataForSEO.

Uso básico:
  python raiox.py "seguro auto" "plano de saúde" --tema-en "car insurance" "health insurance"
  python raiox.py "clínica de estética" --etapas 1 --pais BR
  python raiox.py --saldo
  python raiox.py "advogado trabalhista" --dry-run           (só estima o custo)
  python raiox.py "advogado trabalhista" --so-relatorio       (regera o HTML do dados.json salvo)
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]

from raiox import analise, coleta
from raiox.client import Cliente, ErroApi, TetoExcedido
from raiox.config import PADROES, PAIS_PADRAO, PAISES, PLATAFORMAS_ROTULO, RAIZ, carregar_env
from raiox.relatorio import gerar_html
from raiox.util import slug


def log(msg: str = "") -> None:
    print(msg, flush=True)


def parse_etapas(txt: str) -> set[int]:
    out: set[int] = set()
    for parte in txt.split(","):
        parte = parte.strip()
        if "-" in parte:
            a, b = parte.split("-", 1)
            out.update(range(int(a), int(b) + 1))
        elif parte:
            out.add(int(parte))
    return {e for e in out if 1 <= e <= 6}


def ler_lista(valor: str | None) -> list[str]:
    """Aceita caminho de arquivo (uma por linha) ou lista separada por vírgula."""
    if not valor:
        return []
    p = Path(valor)
    if p.exists():
        return [l.strip() for l in p.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]
    return [x.strip() for x in valor.split(",") if x.strip()]


def ler_perguntas(arquivo: str, temas: dict[str, str]) -> dict[str, list[str]]:
    """Arquivo com perguntas. Linha '# tema' muda o tema; sem cabeçalho, casa pelo texto ou vai para o primeiro tema."""
    por_tema: dict[str, list[str]] = {s: [] for s in temas}
    atual = next(iter(temas))
    for linha in Path(arquivo).read_text(encoding="utf-8").splitlines():
        l = linha.strip()
        if not l:
            continue
        if l.startswith("#"):
            nome = l.lstrip("#").strip().lower()
            atual = next((s for s, r in temas.items() if nome in (s, r.lower())), atual)
            continue
        alvo = atual
        for s, r in temas.items():
            if r.lower() in l.lower():
                alvo = s
                break
        por_tema[alvo].append(l)
    return por_tema


def ler_pares(arquivo: str | None) -> list[list[str]]:
    if not arquivo or not Path(arquivo).exists():
        return []
    pares = []
    for l in Path(arquivo).read_text(encoding="utf-8").splitlines():
        for sep in ("=>", "|", "\t"):
            if sep in l:
                a, b = l.split(sep, 1)
                pares.append([a.strip(), b.strip()])
                break
    return pares


def main() -> int:
    ap = argparse.ArgumentParser(description="Raio-X de mercado com a DataForSEO", formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    ap.add_argument("temas", nargs="*", help="um ou mais temas, ex.: \"seguro auto\" \"plano de saúde\"")
    ap.add_argument("--pais", default=PAIS_PADRAO, choices=sorted(PAISES), help="país da pesquisa. Todos os relatórios são para o Brasil; só mude em caso especial")
    ap.add_argument("--teto", type=float, default=PADROES["teto_usd"], help="teto de gasto em US$ (padrão 3)")
    ap.add_argument("--etapas", default=None, help="etapas a rodar, ex.: 1 | 1,2 | 1-4. Padrão: 1-4 e 6; a etapa 5 (EUA, inglês) entra só com --tema-en")
    ap.add_argument("--saida", help="pasta de saída (padrão saidas/<temas>)")
    ap.add_argument("--tema-en", nargs="*", default=[], help="tema traduzido para o inglês, um por tema, para a etapa 5")
    ap.add_argument("--perguntas", help="arquivo com perguntas para as IAs (etapa 6); sem ele, perguntas padrão")
    ap.add_argument("--marcas", help="arquivo ou lista separada por vírgula com marcas a contar nas respostas")
    ap.add_argument("--pares", help="arquivo 'pergunta em inglês => versão no idioma' para a seção 6")
    ap.add_argument("--titulo", help="título do relatório")
    ap.add_argument("--ias", default="chat_gpt,gemini,claude,perplexity", help="plataformas da etapa 6")
    ap.add_argument("--sem-scraper", action="store_true", help="ChatGPT e Gemini pela API (LLM Responses) em vez dos aplicativos (LLM Scraper)")
    ap.add_argument("--n-kw", type=int, default=PADROES["n_kw"])
    ap.add_argument("--n-ia", type=int, default=PADROES["n_ia"])
    ap.add_argument("--n-serp", type=int, default=PADROES["n_serp"])
    ap.add_argument("--n-modo", type=int, default=PADROES["n_modo"])
    ap.add_argument("--n-perguntas", type=int, default=PADROES["n_perguntas"])
    ap.add_argument("--n-aio-linhas", type=int, default=PADROES["n_aio_linhas"])
    ap.add_argument("--paralelo", type=int, default=4, help="chamadas simultâneas nas etapas 4 e 6")
    ap.add_argument("--dry-run", action="store_true", help="não gasta: só estima o custo de cada etapa")
    ap.add_argument("--so-relatorio", action="store_true", help="só regera o HTML a partir do dados.json da pasta de saída")
    ap.add_argument("--saldo", action="store_true", help="mostra o saldo da conta e sai")
    ap.add_argument("--env", help="caminho de um .env alternativo")
    args = ap.parse_args()

    env = carregar_env(Path(args.env) if args.env else None)
    login, senha = env.get("DATAFORSEO_LOGIN", ""), env.get("DATAFORSEO_PASSWORD", "")

    if args.saldo:
        cli = Cliente(login, senha, RAIZ / ".cache", args.teto)
        s = cli.saldo()
        log(f"Saldo DataForSEO: US$ {s['saldo']}  ({s['status']})")
        return 0

    if not args.temas:
        ap.error("informe pelo menos um tema")

    temas = {slug(t): t.strip() for t in args.temas}
    pais = dict(PAISES[args.pais])
    pais["iso"] = args.pais
    saida = Path(args.saida) if args.saida else RAIZ / "saidas" / "-".join(temas)
    saida.mkdir(parents=True, exist_ok=True)
    arq_dados = saida / "dados.json"
    arq_html = saida / "relatorio.html"

    # ---------------- só relatório
    if args.so_relatorio:
        if not arq_dados.exists():
            log(f"Não achei {arq_dados}")
            return 1
        d = json.loads(arq_dados.read_text(encoding="utf-8"))
        arq_html.write_text(gerar_html(d), encoding="utf-8")
        log(f"Relatório regerado: {arq_html}")
        return 0

    if args.etapas:
        etapas = parse_etapas(args.etapas)
    else:
        etapas = {1, 2, 3, 4, 6} | ({5} if args.tema_en else set())
    if args.dry_run:
        cli = Cliente(login or "x", senha or "x", saida / "raw", args.teto, dry_run=True, log=log)
    else:
        cli = Cliente(login, senha, saida / "raw", args.teto, log=log)
        try:
            s = cli.saldo()
            log(f"Saldo DataForSEO: US$ {s['saldo']}")
            if s["saldo"] is not None and float(s["saldo"]) < 0.05:
                log("Saldo insuficiente. Recarregue a conta antes de continuar.")
                return 1
        except ErroApi as e:
            log(f"Não consegui ler o saldo: {e}")
            return 1

    marcas_extra = ler_lista(args.marcas)
    plataformas = [p.strip() for p in args.ias.split(",") if p.strip() in PLATAFORMAS_ROTULO]
    erros: list[str] = []
    hoje = dt.date.today().isoformat()

    d: dict = {
        "dia": hoje, "titulo": args.titulo, "temas": temas, "pais": pais,
        "config": {"n_kw": args.n_kw, "n_ia": args.n_ia, "n_serp": args.n_serp, "n_modo": args.n_modo, "n_perguntas": args.n_perguntas, "etapas": sorted(etapas)},
        "palavras": {}, "aio_dominios": {}, "aio_perguntas": {}, "chatgpt_en_perguntas": {}, "chatgpt_en_dominios": {},
        "respostas": {}, "pergunta_tema": {}, "marcas": {}, "marcas_por_plataforma": {}, "fontes_ia": {},
        "serp": {}, "modo_ia": {}, "pares": ler_pares(args.pares), "licoes": [], "notas": {}, "erros": erros,
        "gasto_usd": 0.0, "pedidos": 0, "metodo": "",
    }

    def salvar():
        d["gasto_usd"] = round(cli.gasto_total, 4)
        d["gasto_rodada_usd"] = round(cli.gasto, 4)
        d["pedidos"] = cli.pedidos + cli.pedidos_cache
        arq_dados.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")

    def cabe(estimativa: float, nome: str) -> bool:
        if cli.gasto + estimativa > args.teto:
            msg = f"{nome}: estimativa US$ {estimativa:.3f} + gasto US$ {cli.gasto:.3f} passa do teto US$ {args.teto:.2f}. Etapa pulada."
            log("   ! " + msg)
            erros.append(msg)
            return False
        log(f"   custo estimado US$ {estimativa:.3f} (gasto até agora US$ {cli.gasto:.3f})")
        return True

    kws_por_tema: dict[str, list[dict]] = {}
    lexico_api: list[str] = []

    # ---------------- etapa 1
    if 1 in etapas:
        log("\n[1/6] Palavras-chave (DataForSEO Labs keyword_suggestions)")
        if cabe(coleta.custo_e1(args.n_kw) * len(temas), "Etapa 1"):
            for s, t in temas.items():
                try:
                    kws_por_tema[s] = coleta.e1_palavras(cli, t, pais, args.n_kw)
                    log(f"   {t}: {len(kws_por_tema[s])} palavras")
                except (ErroApi, TetoExcedido) as e:
                    erros.append(f"Etapa 1 '{t}': {e}")
                    log(f"   ! {e}")
                    kws_por_tema[s] = []
    else:
        log("\n[1/6] Palavras-chave: etapa não pedida. As etapas 2, 4 e 6 usam listas mínimas sem ela.")

    # ---------------- etapa 2
    vol_ia: dict[str, dict] = {s: {} for s in temas}
    if 2 in etapas and (any(kws_por_tema.values()) or cli.dry_run):
        log("\n[2/6] Volume em IA (AI Keyword Data)")
        if cabe(coleta.custo_e2(args.n_ia) * len(temas), "Etapa 2"):
            for s, t in temas.items():
                lista = [k["kw"] for k in kws_por_tema.get(s, [])[:args.n_ia]]
                if not lista and cli.dry_run:
                    lista = [t] * args.n_ia
                if not lista:
                    continue
                try:
                    vol_ia[s] = coleta.e2_volume_ia(cli, lista, pais, t)
                except (ErroApi, TetoExcedido) as e:
                    erros.append(f"Etapa 2 '{t}': {e}")
                    log(f"   ! {e}")
    elif 2 in etapas:
        log("\n[2/6] Volume em IA: pulada (sem palavras da etapa 1)")

    for s in temas:
        if kws_por_tema.get(s):
            d["palavras"][s] = analise.resumo_palavras(kws_por_tema[s], vol_ia.get(s, {}), args.n_ia)
    salvar()

    # ---------------- etapa 3
    if 3 in etapas:
        log("\n[3/6] Resumo de IA do Google: base LLM Mentions")
        if cabe(coleta.custo_mentions(args.n_aio_linhas, PADROES["n_aio_dominios"]) * len(temas), "Etapa 3"):
            for s, t in temas.items():
                try:
                    r = coleta.llm_mentions(cli, t, "google", pais["location_code"], pais["language_code"], args.n_aio_linhas, PADROES["n_aio_dominios"], f"E3 '{t}'")
                    if r["dominios"]:
                        d["aio_dominios"][t] = r["dominios"]
                    if r["perguntas"]:
                        d["aio_perguntas"][t] = r["perguntas"]
                    lexico_api += r["marcas"]
                    erros += [f"Etapa 3 '{t}' {e}" for e in r["erros"]]
                except TetoExcedido as e:
                    erros.append(f"Etapa 3 '{t}': {e}")
                    log(f"   ! {e}")
            salvar()

    # ---------------- etapa 4
    if 4 in etapas:
        log("\n[4/6] Google de verdade: SERP com resumo de IA e Modo IA")
        buscas: dict[str, list[str]] = {}
        for s, t in temas.items():
            P = d["palavras"].get(s)
            if P:
                buscas[s] = analise.escolher_buscas(kws_por_tema[s], t, args.n_serp, P["perguntas"], pais["language_code"])
            else:
                buscas[s] = [t, f"{t} mais barato", f"melhor {t}", f"quanto custa {t}", f"{t} online", f"{t} vale a pena", f"{t} preço", f"{t} cotação"][:args.n_serp]
        n_serp = sum(len(b) for b in buscas.values())
        n_modo = min(args.n_modo, args.n_serp) * len(temas)
        if cabe(coleta.custo_e4(n_serp, n_modo), "Etapa 4"):
            from concurrent.futures import ThreadPoolExecutor

            def serp_uma(par):
                s, b = par
                try:
                    r = coleta.e4_serp(cli, b, pais)
                    r["tema"] = s
                    return b, r, None
                except (ErroApi, TetoExcedido) as e:
                    return b, None, str(e)

            pares_busca = [(s, b) for s, lst in buscas.items() for b in lst]
            if cli.dry_run:
                for par in pares_busca:
                    serp_uma(par)
            else:
                with ThreadPoolExecutor(max_workers=max(1, args.paralelo)) as ex:
                    for b, r, e in ex.map(serp_uma, pares_busca):
                        if r:
                            d["serp"][b] = r
                        else:
                            erros.append(f"Etapa 4 SERP '{b}': {e}")
                            log(f"   ! {b}: {e}")
            # Modo IA: as buscas "melhor" e "mais barato" (ou as duas primeiras depois da principal)
            for s, lst in buscas.items():
                pref = [b for b in lst if re.search(r"melhor|barat|best|cheap|mejor", b, re.I)]
                alvo = (pref + [b for b in lst[1:] if b not in pref])[:args.n_modo]
                for b in alvo:
                    try:
                        d["modo_ia"][b] = coleta.e4_modo_ia(cli, b, pais)
                    except (ErroApi, TetoExcedido) as e:
                        erros.append(f"Etapa 4 Modo IA '{b}': {e}")
                        log(f"   ! Modo IA {b}: {e}")
            salvar()

    # ---------------- etapa 5
    if 5 in etapas:
        log("\n[5/6] Referência dos EUA: ChatGPT em inglês (LLM Mentions)")
        temas_en = list(args.tema_en)
        if not temas_en:
            msg = "Etapa 5: informe --tema-en \"car insurance\" (um por tema). Etapa pulada."
            log("   ! " + msg)
            erros.append(msg)
        elif cabe(coleta.custo_mentions(args.n_aio_linhas, PADROES["n_aio_dominios"]) * len(temas_en), "Etapa 5"):
            for t_en in temas_en:
                try:
                    r = coleta.llm_mentions(cli, t_en, "chat_gpt", 2840, "en", args.n_aio_linhas, PADROES["n_aio_dominios"], f"E5 '{t_en}'")
                    if r["perguntas"]:
                        d["chatgpt_en_perguntas"][t_en] = r["perguntas"]
                    if r["dominios"]:
                        d["chatgpt_en_dominios"][t_en] = r["dominios"]
                    erros += [f"Etapa 5 '{t_en}' {e}" for e in r["erros"]]
                except TetoExcedido as e:
                    erros.append(f"Etapa 5 '{t_en}': {e}")
                    log(f"   ! {e}")
            salvar()

    # ---------------- etapa 6
    respostas_brutas: dict[str, dict[str, dict]] = {}
    if 6 in etapas:
        log("\n[6/6] Perguntas às IAs: " + ", ".join(PLATAFORMAS_ROTULO[p] for p in plataformas))
        if args.perguntas:
            por_tema = ler_perguntas(args.perguntas, temas)
        else:
            por_tema = {}
            for s, t in temas.items():
                P = d["palavras"].get(s) or {"perguntas": []}
                por_tema[s] = analise.perguntas_padrao(t, pais, P["perguntas"], args.n_perguntas)
        lista_perguntas = []
        for s, lst in por_tema.items():
            for p in lst:
                if p not in d["pergunta_tema"]:
                    d["pergunta_tema"][p] = s
                    lista_perguntas.append(p)
        log(f"   {len(lista_perguntas)} perguntas x {len(plataformas)} IAs")
        for p in lista_perguntas:
            log(f"     - {p}")
        usar_scraper = not args.sem_scraper
        if cabe(coleta.custo_e6(len(lista_perguntas), plataformas, usar_scraper), "Etapa 6"):
            modelos: dict[str, str | None] = {}
            if not cli.dry_run:
                for p in plataformas:
                    if usar_scraper and p in ("chat_gpt", "gemini"):
                        modelos[p] = coleta.escolher_modelo(cli, p, log)  # reserva, caso o app falhe
                    else:
                        modelos[p] = coleta.escolher_modelo(cli, p, log)
                    log(f"   modelo {PLATAFORMAS_ROTULO[p]}: {'aplicativo (LLM Scraper)' if usar_scraper and p in ('chat_gpt','gemini') else modelos[p]}")
            respostas_brutas = coleta.e6_respostas(cli, lista_perguntas, pais, pais["iso"], plataformas, usar_scraper, modelos, log, args.paralelo)
            for p, por_pl in respostas_brutas.items():
                for pl, r in por_pl.items():
                    if r and "erro" in r:
                        erros.append(f"Etapa 6 {pl} '{p}': {r['erro']}")
                    elif r:
                        lexico_api += r.get("marcas_api") or []
            salvar()

    # ---------------- consolidação
    if cli.dry_run:
        log(f"\nEstimativa total: US$ {cli.gasto:.3f} em {cli.pedidos} consultas (teto US$ {args.teto:.2f}). Nada foi gasto.")
        return 0

    lexico = analise.montar_lexico(lexico_api, marcas_extra)
    cons = analise.consolidar_respostas(respostas_brutas, lexico, PLATAFORMAS_ROTULO, d["pergunta_tema"], list(temas))
    d.update(cons)
    for b, m in d["modo_ia"].items():
        m["marcas"] = sorted({x for x in lexico if analise.marca_aparece(x, m.get("texto") or "")}, key=str.lower)
        m.pop("texto", None)
    for b, s in d["serp"].items():
        s.pop("aio_texto", None)
    d["lexico_marcas"] = lexico
    d["licoes"] = analise.licoes(d)
    d["notas"] = analise.notas(d)
    partes = ["Palavras e CPC: base de palavras do Google (DataForSEO Labs)."]
    if any(p.get("vol_ia_total") for p in d["palavras"].values()):
        partes.append("Volume em IA: índice de AI Keyword Data.")
    if d["aio_dominios"]:
        partes.append("Resumo de IA do Google: base LLM Mentions.")
    if d["serp"]:
        partes.append("Google real: SERP com o resumo de IA carregado" + ("; Modo IA pela aba Modo IA do Google." if d["modo_ia"] else "."))
    if d["respostas"]:
        partes.append("Respostas das IAs com busca na web e país definido; cada resposta varia de uma vez para outra. Marcas contadas por nome no texto" + (f" ({len(lexico)} nomes no léxico)." if lexico else "."))
    d["metodo"] = " ".join(partes)
    salvar()
    arq_html.write_text(gerar_html(d), encoding="utf-8")

    log("\n==== Resumo ====")
    for i, l in enumerate(d["licoes"][:5], 1):
        log(f"{i}. {re.sub(r'<[^>]+>', '', l)}")
    log(f"\nGasto nesta rodada: US$ {cli.gasto:.4f} em {cli.pedidos} consultas pagas ({cli.pedidos_cache} vieram do cache, que custaram US$ {cli.gasto_cache:.4f} quando foram feitas).")
    log(f"Custo total dos dados do relatório: US$ {cli.gasto_total:.4f}")
    if erros:
        log(f"Falhas: {len(erros)} (ver dados.json > erros)")
    log(f"Dados: {arq_dados}\nRelatório: {arq_html}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except TetoExcedido as e:
        log(f"\nParado pelo teto de gasto: {e}")
        sys.exit(2)
    except KeyboardInterrupt:
        log("\nInterrompido.")
        sys.exit(130)
