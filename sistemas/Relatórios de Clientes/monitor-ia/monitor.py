#!/usr/bin/env python3
"""
Monitor de Visibilidade em IA - QMIX Digital

Pergunta as IAs (ChatGPT, Claude, Gemini, Perplexity e, opcionalmente, o
AI Overview do Google) o que um cliente final perguntaria, e registra:

  - se o cliente foi citado
  - em que POSICAO ele aparece entre os nomes citados
  - quais concorrentes apareceram junto
  - quais SITES a IA usou como fonte da resposta
  - custo da rodada

Uso:
  python monitor.py                  # todos os clientes
  python monitor.py --cliente id     # so um cliente
  python monitor.py --workers 8      # paralelismo (padrao 6)
"""

import argparse
import json
import os
import re
import sqlite3
import sys
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, "monitor.db")
CONFIG = os.path.join(BASE, "config.json")

CHAVES = {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "perplexity": "PERPLEXITY_API_KEY",
    "google_ai_overview": "SERPER_API_KEY",
}

# Pasta onde ficam as credenciais. Mesma do google_dados.py, para a chave de
# API viver junto dos JSON de conta de servico em vez de espalhada em variavel
# de ambiente, que se perde na troca de maquina.
PASTA_CHAVES = os.path.join(os.path.expanduser("~"), "Documents", "APIs")

_cache_chaves = {}


def chave(nome_env, obrigatoria=True):
    """Le a chave de API. Variavel de ambiente primeiro, arquivo depois.

    O arquivo pode se chamar de varios jeitos (serper.txt, serper.dev.txt,
    serper.key...), entao a busca e pelo prefixo do provedor, sem exigir um
    nome exato. Guarda o valor em cache para nao reler a cada chamada.
    """
    if nome_env in _cache_chaves:
        return _cache_chaves[nome_env]

    valor = os.environ.get(nome_env)
    if not valor:
        prefixo = nome_env.lower().split("_")[0]          # SERPER_API_KEY -> serper
        try:
            candidatos = sorted(os.listdir(PASTA_CHAVES))
        except OSError:
            candidatos = []
        for arquivo in candidatos:
            if arquivo.lower().endswith(".json"):          # conta de servico, nao e chave
                continue
            if not arquivo.lower().startswith(prefixo):
                continue
            caminho = os.path.join(PASTA_CHAVES, arquivo)
            try:
                # utf-8-sig porque o Bloco de Notas do Windows grava BOM
                with open(caminho, encoding="utf-8-sig") as f:
                    valor = f.read().strip()
            except OSError:
                continue
            if valor:
                break

    if not valor and obrigatoria:
        raise RuntimeError(
            "Chave %s nao encontrada. Defina a variavel de ambiente ou crie o "
            "arquivo %s\\%s.txt com a chave dentro."
            % (nome_env, PASTA_CHAVES, nome_env.lower().split("_")[0]))

    _cache_chaves[nome_env] = valor
    return valor


# ---------------------------------------------------------------- texto

def normalizar_com_mapa(texto):
    """Minusculas e sem acento, guardando o indice de origem de cada caractere.

    O mapa e necessario porque a normalizacao pode mudar o tamanho da string
    (ligaduras, simbolos compostos). Sem ele, o trecho citado sai deslocado.
    """
    saida, mapa = [], []
    for i, ch in enumerate(texto):
        for c in unicodedata.normalize("NFKD", ch.lower()):
            if unicodedata.combining(c):
                continue
            saida.append(c)
            mapa.append(i)
    return "".join(saida), mapa


def compilar_padrao(termo):
    """Regex tolerante a pontuacao e espaco, presa a limite de palavra.

    'Dr. Fulano de Tal' casa com 'Dr Fulano de Tal'.
    'Ciclana' NAO casa dentro de 'draciclana' (evita falso positivo).
    """
    base, _ = normalizar_com_mapa(termo)
    partes = [re.escape(p) for p in re.split(r"[^a-z0-9]+", base) if p]
    if not partes:
        return None
    corpo = r"[^a-z0-9]{0,3}".join(partes)
    return re.compile(rf"(?<![a-z0-9]){corpo}(?![a-z0-9])")


def localizar(texto_norm, termos):
    """(posicao da 1a mencao, total de mencoes, termo que casou)."""
    pos, total, achado = None, 0, None
    for termo in termos:
        padrao = compilar_padrao(termo)
        if padrao is None:
            continue
        casos = list(padrao.finditer(texto_norm))
        if not casos:
            continue
        total += len(casos)
        if pos is None or casos[0].start() < pos:
            pos, achado = casos[0].start(), termo
    return pos, total, achado


def termos_de(entidade):
    """Aceita string simples ou objeto {nome, apelidos}."""
    if isinstance(entidade, str):
        return entidade, [entidade]
    nome = entidade["nome"]
    return nome, [nome] + list(entidade.get("apelidos", []))


def analisar(resposta, cliente, concorrentes):
    """Detecta mencao, posicao no ranking e concorrentes citados."""
    norm, mapa = normalizar_com_mapa(resposta)
    _, termos_cliente = termos_de(cliente)
    pos, ocorrencias, achado = localizar(norm, termos_cliente)

    citados = []
    for rival in concorrentes:
        nome, termos = termos_de(rival)
        p, q, _ = localizar(norm, termos)
        if p is not None:
            citados.append({"nome": nome, "posicao_texto": p, "ocorrencias": q})

    # Sequencia na ordem exata em que a IA apresentou os nomes, com o cliente
    # marcado dentro dela. E o que permite mostrar "voce e o 2o desta lista".
    nome_cliente, _ = termos_de(cliente)
    entradas = [{"nome": c["nome"], "voce": False, "pos": c["posicao_texto"]}
                for c in citados]
    if pos is not None:
        entradas.append({"nome": nome_cliente, "voce": True, "pos": pos})
    entradas.sort(key=lambda e: e["pos"])
    sequencia = [{"nome": e["nome"], "voce": e["voce"]} for e in entradas]

    colocacao = next((i + 1 for i, e in enumerate(sequencia) if e["voce"]), None)

    trecho = None
    if pos is not None and mapa:
        ini_orig = mapa[pos]
        fim_orig = mapa[min(pos + 260, len(mapa) - 1)]
        trecho = resposta[max(0, ini_orig - 130):fim_orig].strip()

    return {
        "mencionado": pos is not None,
        "posicao": colocacao,
        "total_citados": len(sequencia),
        "ocorrencias": ocorrencias,
        "termo_encontrado": achado,
        "trecho": trecho,
        "sequencia": sequencia,
        "concorrentes": [e["nome"] for e in sequencia if not e["voce"]],
    }


def dominio(url):
    if not url:
        return None
    try:
        host = urlparse(str(url)).netloc.lower()
    except ValueError:
        return None
    host = host.split(":")[0]
    if host.startswith("www."):
        host = host[4:]
    return host or None


def urls_do_texto(texto):
    """URLs completas citadas no corpo da resposta.

    Guardamos a URL inteira, e nao so o dominio, para o relatorio poder
    apontar direto para o artigo que a IA leu.
    """
    achados = re.findall(r"https?://[^\s\)\]\"'<>]+", texto or "")
    return [limpar_url(u) for u in achados]


def resolver_redirect(url, titulo=""):
    """Segue o redirecionador do Gemini até a URL real do artigo.

    Se não resolver, cai no domínio que vem no título, que já é melhor do que
    mostrar 'vertexaisearch.cloud.google.com' no relatório do cliente.
    """
    try:
        r = requests.head(url, allow_redirects=True, timeout=15)
        if r.url and "vertexaisearch" not in r.url:
            return r.url
    except requests.RequestException:
        pass
    t = str(titulo).strip().lower()
    return f"https://{t}" if "." in t and " " not in t else None


def limpar_url(url):
    """Tira parametro de rastreio que a propria IA acrescenta."""
    u = str(url).rstrip(").,;")
    for marca in ("?utm_source=", "&utm_source=", "?utm_medium=", "&utm_medium="):
        if marca in u:
            u = u.split(marca)[0]
    return u


# ---------------------------------------------------------------- HTTP

def post_json(url, *, timeout=180, **kw):
    """POST com backoff exponencial em 429 e 5xx."""
    ultimo = None
    for tentativa in range(4):
        try:
            r = requests.post(url, timeout=timeout, **kw)
            if r.status_code in (408, 409, 425, 429, 500, 502, 503, 504):
                ultimo = f"HTTP {r.status_code}: {r.text[:300]}"
                # 429 tem dois significados. Excesso de velocidade passa com
                # espera; cota esgotada nao passa nunca, e insistir custa quase
                # um minuto por consulta. Nesse caso falha na hora.
                if r.status_code == 429 and any(
                        m in r.text.lower()
                        for m in ("exceeded your current quota", "billing",
                                  "resource_exhausted", "quota_exceeded")):
                    raise RuntimeError(f"cota esgotada: {r.text[:200]}")
                time.sleep(min(2 ** tentativa * 3, 45))
                continue
            if r.status_code >= 400:
                raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
            return r.json()
        except requests.RequestException as e:
            ultimo = str(e)
            time.sleep(min(2 ** tentativa * 3, 45))
    raise RuntimeError(ultimo or "falha desconhecida")


# ------------------------------------------------------------ provedores
# Todo provedor devolve:
#   {"texto": str, "fontes": [dominio], "entrada": int, "saida": int}

def consultar_openai(prompt, conf):
    """Responses API com web search: aproxima da experiencia real do ChatGPT."""
    corpo = {
        "model": conf["modelo"],
        "input": prompt,
        "tools": [{"type": "web_search"}],
        "max_output_tokens": conf.get("max_tokens", 2000),
    }
    cab = {"Authorization": f"Bearer {chave('OPENAI_API_KEY')}"}
    try:
        d = post_json("https://api.openai.com/v1/responses", headers=cab, json=corpo)
    except RuntimeError as e:
        if "web_search" not in str(e):
            raise
        # Contas e modelos antigos ainda expoem a ferramenta com nome de preview.
        corpo["tools"] = [{"type": "web_search_preview"}]
        d = post_json("https://api.openai.com/v1/responses", headers=cab, json=corpo)

    partes, fontes = [], []
    for item in d.get("output", []):
        for bloco in item.get("content", []) or []:
            if bloco.get("type") in ("output_text", "text"):
                partes.append(bloco.get("text", ""))
            for an in bloco.get("annotations", []) or []:
                if an.get("url"):
                    fontes.append(an["url"])
    uso = d.get("usage", {})
    return {
        "texto": "\n".join(partes).strip(),
        "fontes": [limpar_url(u) for u in fontes],
        "entrada": uso.get("input_tokens", 0),
        "saida": uso.get("output_tokens", 0),
    }


def consultar_anthropic(prompt, conf):
    from anthropic import Anthropic

    cliente = Anthropic(max_retries=3, timeout=300.0)
    tipos = [conf.get("ferramenta_busca", "web_search_20260209"), "web_search_20250305"]
    ultimo_erro = None

    for tipo in tipos:
        args = {
            "model": conf["modelo"],
            "max_tokens": conf.get("max_tokens", 2000),
            "tools": [{"type": tipo, "name": "web_search", "max_uses": 5}],
        }
        if conf.get("esforco"):
            args["output_config"] = {"effort": conf["esforco"]}

        mensagens = [{"role": "user", "content": prompt}]
        partes, fontes, entrada, saida = [], [], 0, 0
        try:
            for _ in range(3):  # continua enquanto a busca pausar o turno
                try:
                    resp = cliente.messages.create(messages=mensagens, **args)
                except TypeError:
                    args.pop("output_config", None)  # SDK antigo, sem output_config
                    resp = cliente.messages.create(messages=mensagens, **args)

                if getattr(resp, "stop_reason", None) == "refusal":
                    raise RuntimeError("recusa do modelo (stop_reason=refusal)")

                uso = getattr(resp, "usage", None)
                entrada += getattr(uso, "input_tokens", 0) or 0
                saida += getattr(uso, "output_tokens", 0) or 0

                for bloco in resp.content:
                    tipo_bloco = getattr(bloco, "type", "")
                    if tipo_bloco == "text":
                        partes.append(bloco.text)
                    elif tipo_bloco == "web_search_tool_result":
                        # Em caso de erro o content vem como objeto, nao lista.
                        itens = getattr(bloco, "content", None)
                        if isinstance(itens, list):
                            for achado in itens:
                                if getattr(achado, "url", None):
                                    fontes.append(achado.url)

                if getattr(resp, "stop_reason", None) != "pause_turn":
                    break
                mensagens = mensagens + [{"role": "assistant", "content": resp.content}]

            return {
                "texto": "\n".join(partes).strip(),
                "fontes": [limpar_url(u) for u in fontes],
                "entrada": entrada,
                "saida": saida,
            }
        except Exception as e:
            # Ferramenta indisponivel neste modelo: tenta a variante basica.
            ultimo_erro = e
            if "web_search" not in str(e) and "tool" not in str(e).lower():
                raise
    raise RuntimeError(str(ultimo_erro))


def consultar_gemini(prompt, conf):
    # Inline como nos demais provedores: atribuir a uma variavel chamada
    # "chave" sombreava a funcao chave() e quebrava a propria chamada.
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{conf['modelo']}:generateContent?key={chave('GEMINI_API_KEY')}")
    d = post_json(url, json={
        "contents": [{"parts": [{"text": prompt}]}],
        "tools": [{"google_search": {}}],
        "generationConfig": {"maxOutputTokens": conf.get("max_tokens", 2000)},
    })
    cands = d.get("candidates", [])
    if not cands:
        return {"texto": "", "fontes": [], "entrada": 0, "saida": 0}

    texto = "\n".join(p.get("text", "")
                      for p in cands[0].get("content", {}).get("parts", []))

    # O Gemini nao devolve a URL do artigo: devolve um redirecionador do
    # vertexaisearch, inutil no relatorio. O dominio real vem no title, e a
    # URL final sai resolvendo o redirect.
    brutas = []
    for ch in cands[0].get("groundingMetadata", {}).get("groundingChunks", []) or []:
        web = ch.get("web", {})
        if web.get("uri"):
            brutas.append((web["uri"], web.get("title", "")))

    fontes = []
    if brutas:
        with ThreadPoolExecutor(max_workers=6) as pool:
            fontes = [f for f in pool.map(lambda p: resolver_redirect(*p), brutas) if f]

    uso = d.get("usageMetadata", {})
    entrada = uso.get("promptTokenCount", 0)
    # O raciocinio (thoughtsTokenCount) e cobrado como saida, mas nao entra em
    # candidatesTokenCount. O total menos a entrada captura tudo.
    saida = uso.get("totalTokenCount", 0) - entrada
    if saida <= 0:
        saida = (uso.get("candidatesTokenCount", 0)
                 + uso.get("thoughtsTokenCount", 0))

    return {
        "texto": texto.strip(),
        "fontes": [limpar_url(f) for f in fontes if f],
        "entrada": entrada,
        "saida": max(0, saida),
    }


def consultar_perplexity(prompt, conf):
    d = post_json(
        "https://api.perplexity.ai/chat/completions",
        headers={"Authorization": f"Bearer {chave('PERPLEXITY_API_KEY')}"},
        json={"model": conf["modelo"],
              "messages": [{"role": "user", "content": prompt}],
              "max_tokens": conf.get("max_tokens", 2000)})
    texto = d["choices"][0]["message"]["content"]
    brutas = d.get("citations") or [r.get("url") for r in d.get("search_results", []) or []]
    uso = d.get("usage", {})
    return {
        "texto": texto,
        "fontes": [limpar_url(u) for u in brutas if u],
        "entrada": uso.get("prompt_tokens", 0),
        "saida": uso.get("completion_tokens", 0),
    }


def consultar_google_ai_overview(prompt, conf):
    """AI Overview do Google, via Serper.dev.

    Melhor esforco: o Google nao expoe o AI Overview por API oficial e o
    formato do intermediario muda. Sem bloco de IA, cai no answerBox.
    """
    d = post_json("https://google.serper.dev/search",
                  headers={"X-API-KEY": chave('SERPER_API_KEY'),
                           "Content-Type": "application/json"},
                  json={"q": prompt, "gl": conf.get("pais", "br"),
                        "hl": conf.get("idioma", "pt-br")})

    bloco = d.get("aiOverview") or d.get("answerBox") or {}
    if isinstance(bloco, list):
        bloco = bloco[0] if bloco else {}
    texto = " ".join(str(bloco.get(k, "")) for k in
                     ("answer", "snippet", "content", "text", "description")).strip()

    fontes = []
    for ref in (bloco.get("references") or bloco.get("sources") or []):
        alvo = (ref.get("link") or ref.get("url")) if isinstance(ref, dict) else ref
        if alvo:
            fontes.append(dominio(alvo))
    if not fontes:
        fontes = [dominio(r.get("link")) for r in d.get("organic", [])[:5]]

    if not texto:
        raise RuntimeError("nenhum AI Overview retornado para esta pergunta")
    return {"texto": texto, "fontes": [limpar_url(f) for f in fontes if f], "entrada": 0, "saida": 0}


PROVEDORES = {
    "openai": consultar_openai,
    "anthropic": consultar_anthropic,
    "gemini": consultar_gemini,
    "perplexity": consultar_perplexity,
    "google_ai_overview": consultar_google_ai_overview,
}


def custo(conf, entrada, saida):
    preco_entrada, preco_saida = conf.get("preco_entrada"), conf.get("preco_saida")
    if preco_entrada is None or preco_saida is None:
        return None
    return round(entrada / 1_000_000 * preco_entrada
                 + saida / 1_000_000 * preco_saida, 6)


# ---------------------------------------------------------------- banco

ESQUEMA = """
CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rodada TEXT NOT NULL,
    data_hora TEXT NOT NULL,
    cliente_id TEXT NOT NULL,
    cliente_nome TEXT NOT NULL,
    provedor TEXT NOT NULL,
    modelo TEXT NOT NULL,
    prompt TEXT NOT NULL,
    mencionado INTEGER NOT NULL,
    posicao INTEGER,
    total_citados INTEGER,
    ocorrencias INTEGER,
    termo_encontrado TEXT,
    trecho TEXT,
    concorrentes TEXT,
    sequencia TEXT,
    fontes TEXT,
    tokens_entrada INTEGER,
    tokens_saida INTEGER,
    custo_usd REAL,
    resposta_completa TEXT,
    erro TEXT
);
CREATE INDEX IF NOT EXISTS idx_cliente_data ON consultas(cliente_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_rodada ON consultas(rodada);
"""


def abrir_banco():
    con = sqlite3.connect(DB)
    con.executescript(ESQUEMA)
    # Migracao de bancos criados antes da coluna sequencia existir.
    existentes = {c[1] for c in con.execute("PRAGMA table_info(consultas)")}
    if "sequencia" not in existentes:
        con.execute("ALTER TABLE consultas ADD COLUMN sequencia TEXT")
    con.commit()
    return con


def validar(cfg):
    erros = []
    for i, c in enumerate(cfg.get("clientes", [])):
        onde = c.get("id") or f"cliente #{i + 1}"
        for campo in ("id", "nome", "prompts"):
            if not c.get(campo):
                erros.append(f"{onde}: campo '{campo}' ausente ou vazio")
    if not cfg.get("clientes"):
        erros.append("nenhum cliente definido")
    if erros:
        sys.exit("Erros no config.json:\n  " + "\n  ".join(erros))


# -------------------------------------------------------------- execucao

def executar(tarefa):
    cliente, prompt, nome_prov, conf, concorrentes = tarefa
    try:
        r = PROVEDORES[nome_prov](prompt, conf)
        if not r["texto"]:
            raise RuntimeError("resposta vazia")
        det = analisar(r["texto"], cliente, concorrentes)
        fontes = r["fontes"] or urls_do_texto(r["texto"])
        return {
            "cliente": cliente, "prompt": prompt, "provedor": nome_prov,
            "modelo": conf.get("modelo", nome_prov), "erro": None,
            "resposta": r["texto"], "fontes": sorted(set(fontes)),
            "entrada": r["entrada"], "saida": r["saida"],
            "custo": custo(conf, r["entrada"], r["saida"]), **det,
        }
    except Exception as e:
        return {"cliente": cliente, "prompt": prompt, "provedor": nome_prov,
                "modelo": conf.get("modelo", nome_prov), "erro": str(e)[:400]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cliente", help="rodar so um cliente (id)")
    ap.add_argument("--workers", type=int, default=6, help="consultas em paralelo")
    ap.add_argument("--provedor", help="rodar so um provedor (ex.: anthropic). "
                                       "Serve para completar uma IA que falhou, "
                                       "sem repetir as que ja deram certo.")
    args = ap.parse_args()

    if not os.path.exists(CONFIG):
        sys.exit("Crie o config.json (copie de config.example.json).")
    with open(CONFIG, encoding="utf-8") as f:
        cfg = json.load(f)
    validar(cfg)

    clientes = cfg["clientes"]
    if args.cliente:
        clientes = [c for c in clientes if c["id"] == args.cliente]
        if not clientes:
            sys.exit(f"Cliente '{args.cliente}' nao encontrado no config.")

    ativos = {}
    for nome, conf in cfg.get("provedores", {}).items():
        if not conf.get("ativo"):
            continue
        if not chave(CHAVES.get(nome, ""), obrigatoria=False):
            print(f"[pulado] {nome}: variavel {CHAVES.get(nome)} nao definida")
            continue
        ativos[nome] = conf
    if args.provedor:
        ativos = {k: v for k, v in ativos.items() if k == args.provedor}
        if not ativos:
            sys.exit(f"Provedor '{args.provedor}' nao esta ativo ou nao tem chave.")
    if not ativos:
        sys.exit("Nenhum provedor ativo com chave definida.")

    tarefas = [(c, p, nome, conf, c.get("concorrentes", cfg.get("concorrentes", [])))
               for c in clientes for p in c["prompts"] for nome, conf in ativos.items()]

    rodada = datetime.now(timezone.utc).isoformat(timespec="seconds")
    print(f"{len(tarefas)} consultas | {len(ativos)} IAs | {args.workers} em paralelo\n")

    con = abrir_banco()
    total_custo, falhas = 0.0, 0

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for r in pool.map(executar, tarefas):
            agora = datetime.now(timezone.utc).isoformat(timespec="seconds")
            c = r["cliente"]
            if r["erro"]:
                falhas += 1
                print(f"[FALHA] {c['id']} | {r['provedor']} | {r['erro'][:80]}")
                con.execute(
                    "INSERT INTO consultas (rodada, data_hora, cliente_id, cliente_nome,"
                    " provedor, modelo, prompt, mencionado, erro) VALUES (?,?,?,?,?,?,?,0,?)",
                    (rodada, agora, c["id"], c["nome"], r["provedor"], r["modelo"],
                     r["prompt"], r["erro"]))
            else:
                total_custo += r["custo"] or 0
                if r["mencionado"]:
                    status = f"CITADO em {r['posicao']}o de {r['total_citados']}"
                else:
                    status = "nao citado"
                print(f"[ok] {c['id']} | {r['provedor']} | {r['prompt'][:42]}... | {status}")
                con.execute(
                    "INSERT INTO consultas (rodada, data_hora, cliente_id, cliente_nome,"
                    " provedor, modelo, prompt, mencionado, posicao, total_citados,"
                    " ocorrencias, termo_encontrado, trecho, concorrentes, sequencia, fontes,"
                    " tokens_entrada, tokens_saida, custo_usd, resposta_completa, erro)"
                    " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL)",
                    (rodada, agora, c["id"], c["nome"], r["provedor"], r["modelo"],
                     r["prompt"], int(r["mencionado"]), r["posicao"], r["total_citados"],
                     r["ocorrencias"], r["termo_encontrado"], r["trecho"],
                     json.dumps(r["concorrentes"], ensure_ascii=False),
                     json.dumps(r["sequencia"], ensure_ascii=False),
                     json.dumps(r["fontes"], ensure_ascii=False),
                     r["entrada"], r["saida"], r["custo"], r["resposta"]))
            con.commit()

    con.close()
    print(f"\nRodada {rodada}")
    print(f"Falhas: {falhas} de {len(tarefas)} | Custo estimado: US$ {total_custo:.4f}")
    print("Gere o relatorio com: python relatorio.py")


if __name__ == "__main__":
    main()
