"""Teste cego de modelos.

Dez pautas, quatro modelos, mesmas fontes e mesmo perfil de voz. Cada saida
recebe um codigo de quatro caracteres e o julgamento e feito sem saber qual
modelo escreveu qual texto. O mapa codigo -> modelo fica no banco e so e
revelado quando o julgamento e registrado.

Estas materias NAO vao para portal nenhum: sao geradas em paralelo a producao,
que segue 100% em Sonnet.

O provedor secundario e isolado: se `gpt-5.6-luna` nao existir ou a chave nao
estiver posta, aquele codigo registra o erro e os outros tres seguem. Uma
rodada nunca cai inteira por causa de um provedor.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import logging
import random
import string

from . import budget, config, db, dedupe, prompts
from .providers import anthropic_p as ap
from .providers import openai_p as op

log = logging.getLogger("motor.blindtest")

MODELOS = [
    ("anthropic", "claude-sonnet-5"),
    ("anthropic", "claude-opus-5"),
    ("anthropic", "claude-haiku-4-5"),
    ("openai", None),  # resolvido em tempo de execucao, ver op.modelo_padrao()
]


def _codigo(rodada, provedor, modelo, fato_guid):
    """Codigo curto, estavel e sem pista do modelo no proprio codigo."""
    semente = "{}|{}|{}|{}".format(rodada, provedor, modelo, fato_guid)
    h = hashlib.sha256(semente.encode()).hexdigest()
    alfabeto = string.ascii_uppercase + string.digits
    n = int(h[:12], 16)
    saida = ""
    for _ in range(4):
        saida += alfabeto[n % len(alfabeto)]
        n //= len(alfabeto)
    return saida


def _gerar_um(provedor, modelo, site, fato, fontes, rodada):
    codigo = _codigo(rodada, provedor, modelo, str(fato["guid"]))
    perfil = prompts.perfil_do_site(site)
    usuario = prompts.mensagem_fontes(fato["titulo_representativo"], fontes)
    titulo = corpo = erro = None
    uso = {"in": 0, "out": 0, "cache_read": 0, "cache_write": 0}

    try:
        if provedor == "anthropic":
            msg = ap.chamar(
                modelo,
                [{"type": "text", "text": prompts.REGRAS,
                  "cache_control": {"type": "ephemeral"}},
                 {"type": "text", "text": perfil}],
                [{"role": "user", "content": usuario}],
                # schema=None obrigatorio: com output_config o modelo
                # devolve JSON e o parse_blocos nao acha marcador
                # nenhum. Foi o que zerou o teste cego dos 3 modelos da
                # Anthropic nas primeiras rodadas.
                max_tokens=4000, schema=None,
                thinking=config.thinking_geracao())
            dados = prompts.parse_blocos(ap.texto_de(msg))
            uso = ap.uso(msg)
        else:
            texto, uso = op.chamar(
                modelo, prompts.REGRAS + "\n\n" + perfil, usuario,
                max_tokens=4000)
            dados = prompts.parse_blocos(texto)
        titulo = dados.get("titulo")
        corpo = dados.get("corpo_html")
    except Exception as e:
        erro = "{}: {}".format(type(e).__name__, e)
        log.error("teste cego %s (%s/%s) falhou: %s", codigo, provedor,
                  modelo, erro)

    usd = budget.registrar(
        "teste_cego", provedor=provedor, modelo=modelo,
        tokens_in=uso["in"], tokens_out=uso["out"],
        cache_read=uso["cache_read"], cache_write=uso["cache_write"])

    db.exec1(
        "INSERT INTO teste_cego (rodada, fato_guid, site_slug, codigo, "
        "provedor, modelo, titulo, corpo_html, tokens_in, tokens_out, usd, "
        "erro) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
        "ON CONFLICT (codigo) DO NOTHING",
        (rodada, str(fato["guid"]), site["slug"], codigo, provedor, modelo,
         titulo, corpo, uso["in"], uso["out"], usd, erro))
    return codigo, erro


def rodar(n_pautas=10, rodada=None, site_slug=None):
    """Gera n_pautas x 4 modelos. Devolve o resumo da rodada."""
    rodada = rodada or dt.datetime.now().strftime("R%Y%m%d")
    sites = config.sites()
    if site_slug:
        sites = [s for s in sites if s["slug"] == site_slug]
    if not sites:
        return {"erro": "nenhum portal configurado"}

    prontos = dedupe.fatos_prontos(limite=n_pautas * 3)
    if len(prontos) < n_pautas:
        log.warning("so ha %d fatos prontos, pedidos %d", len(prontos),
                    n_pautas)
    escolhidos = prontos[:n_pautas]

    resumo = {"rodada": rodada, "pautas": 0, "saidas": 0, "erros": 0}
    for i, fato in enumerate(escolhidos):
        site = sites[i % len(sites)]
        fontes = dedupe.fontes_do_fato(fato["id"])
        if len(fontes) < config.min_dominios():
            continue
        resumo["pautas"] += 1
        for provedor, modelo in MODELOS:
            if provedor == "openai":
                if not op.disponivel():
                    log.warning("OPENAI_API_KEY ausente: pulando o quarto "
                                "modelo desta pauta")
                    continue
                modelo = op.modelo_padrao()
            _, erro = _gerar_um(provedor, modelo, site, fato, fontes, rodada)
            resumo["saidas"] += 1
            resumo["erros"] += 1 if erro else 0
    log.info("teste cego %s: %s", rodada, resumo)
    return resumo


def pautas_comparadas():
    """Quantas pautas ja tem saida dos modelos, sem erro."""
    r = db.q("SELECT COUNT(DISTINCT fato_guid) AS n FROM teste_cego "
             "WHERE erro IS NULL", um=True)
    return int((r or {}).get("n") or 0)


def para_julgar(rodada):
    """Saidas embaralhadas, sem revelar o modelo. E o que voce le."""
    linhas = db.q(
        "SELECT codigo, site_slug, titulo, corpo_html, erro FROM teste_cego "
        "WHERE rodada=%s AND erro IS NULL ORDER BY fato_guid, codigo",
        (rodada,)) or []
    r = random.Random(rodada)
    r.shuffle(linhas)
    return linhas


def revelar(rodada):
    """Mapa codigo -> modelo, com custo real medido por saida."""
    return db.q(
        "SELECT codigo, provedor, modelo, tokens_in, tokens_out, usd, erro "
        "FROM teste_cego WHERE rodada=%s ORDER BY modelo, codigo",
        (rodada,)) or []


def custo_medido(rodada):
    """Custo real por materia de cada modelo, medido e nao estimado."""
    return db.q(
        "SELECT modelo, COUNT(*) AS n, "
        "ROUND(AVG(tokens_in)) AS media_in, ROUND(AVG(tokens_out)) AS media_out, "
        "ROUND(AVG(usd)::numeric, 5) AS usd_por_materia, "
        "ROUND((AVG(usd) * 1950)::numeric, 2) AS projecao_1950_mes "
        "FROM teste_cego WHERE rodada=%s AND erro IS NULL GROUP BY modelo "
        "ORDER BY 5", (rodada,)) or []
