"""Publicador: entrega a materia no receptor do portal de destino.

Mesma rota que a plataforma de conteudo ja usa, de proposito:
    POST https://<dominio>/wp-json/<ns>/artigos
    header X-API-KEY: <chave do site>

Tres armadilhas do receptor, todas tratadas aqui:

1. GUARDA DE EXCLUSIVIDADE DE SLUG. O primeiro portal que recebe um slug vira
   dono dele; qualquer outro que mande o mesmo slug recebe HTTP 201 com
   status "skipped" e NADA e publicado. Ou seja: o caminho de erro se disfarca
   de sucesso. Aqui isso e tratado como falha logica, e nao como entrega: uma
   nova tentativa com slug diferenciado, e se ainda assim for pulado, fica
   registrado como `skipped` (metrica de rampa), nunca como publicado.

2. exigeImagem. Sem `image_base64`, o artigo entra como RASCUNHO e nunca vai ao
   ar. Materia sem imagem nem sai daqui.

3. REBUILD DE INDICES. Cada publicacao dispara releitura de todos os artigos do
   portal. Por isso o throttle e por INSTANCIA do Portal Engine, nao global:
   portais em maquinas diferentes publicam em paralelo, portais na mesma
   maquina esperam a vez.
"""
from __future__ import annotations

import datetime as dt
import json
import logging
import random
import re
import threading
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

import httpx

from . import config, db, notificacao, verificacao

log = logging.getLogger("motor.publish")

_ultima_por_instancia = defaultdict(float)
_trava = threading.Lock()


def _esperar_instancia(instancia):
    """Throttle de 30 a 60 s por instancia do Portal Engine."""
    base = config.throttle_seg()
    while True:
        with _trava:
            agora = time.monotonic()
            ultimo = _ultima_por_instancia[instancia]
            espera = random.uniform(base * 0.7, base * 1.35)
            if agora - ultimo >= espera:
                _ultima_por_instancia[instancia] = agora
                return
            falta = espera - (agora - ultimo)
        time.sleep(min(falta, 15.0))


def _slug_variante(slug, tentativa):
    """Diferencia o slug sem sujar com hash: acrescenta uma palavra util."""
    sufixos = ["entenda", "veja-o-que-se-sabe", "confira"]
    s = sufixos[(tentativa - 1) % len(sufixos)]
    return "{}-{}".format(slug, s)


def _autor_para_receptor(m, site):
    """O campo `author` significa coisa DIFERENTE em cada receptor.

    Portal Engine: string com o nome, que vira a assinatura.
    WordPress: o plugin faz `intval($params['author'])`. Mandar um nome da
    intval 0, que e falsy, e o plugin entao escolhe SOZINHO o primeiro
    administrador do site, sem erro nenhum. Ou seja: nome em receptor
    WordPress nao falha, assina errado em silencio, e pode cair justamente
    num autor bloqueado. Ali tem que ir o ID numerico do usuario.
    """
    nome = m.get("autor")
    if site.get("receptor") != "wordpress":
        return nome
    for a in site.get("equipe") or []:
        if a.get("nome") == nome and a.get("wp_id"):
            return int(a["wp_id"])
    log.error("[%s] autor %r sem wp_id na equipe: o WordPress escolheria um "
              "admin qualquer. Publicacao abortada.", site["slug"], nome)
    return None


def _payload(m, site):
    corpo = {
        "title": m["titulo"],
        "slug": m["slug"],
        "content": m["corpo_html"],
        "excerpt": m["dek"],
        "subtitle": m["dek"],
        "meta_title": m["meta_title"],
        "meta_description": m["meta_description"],
        "categories": [m["categoria"]],
        "status": "publish",
        "author": _autor_para_receptor(m, site),
    }
    if m.get("imagem_b64"):
        corpo["image_base64"] = m["imagem_b64"]
        corpo["image_alt"] = m.get("imagem_alt") or m["titulo"]
        corpo["image_title"] = m["titulo"]
        corpo["image_caption"] = ""
    if site.get("tags_padrao"):
        corpo["tags"] = site["tags_padrao"]
    return corpo


def entregar(materia_id):
    """Publica uma materia. Devolve o dicionario de resultado."""
    m = db.q("SELECT * FROM materias WHERE id=%s", (materia_id,), um=True)
    if not m:
        return {"status": "erro", "erro": "materia inexistente"}
    site = config.site(m["site_slug"])
    cred = config.credencial(m["site_slug"])
    if not site or not cred:
        return {"status": "erro", "erro": "sem config ou credencial"}
    if not m.get("imagem_b64"):
        return {"status": "erro",
                "erro": "sem imagem: o receptor gravaria como rascunho"}
    if _autor_para_receptor(m, site) is None:
        return {"status": "erro",
                "erro": "autor sem wp_id para receptor WordPress"}

    instancia = site.get("instancia", "desconhecida")
    resultado = {"status": "erro", "erro": "nao tentado"}

    for tentativa in range(1, 3):
        _esperar_instancia(instancia)
        corpo = _payload(m, site)
        if tentativa > 1:
            corpo["slug"] = _slug_variante(m["slug"], tentativa - 1)
        try:
            r = httpx.post(cred["endpoint"], timeout=90,
                           headers={"Content-Type": "application/json",
                                    "X-API-KEY": cred["api_key"]},
                           json=corpo)
        except Exception as e:
            resultado = {"status": "erro", "erro": "rede: {}".format(e),
                         "http": None}
            continue

        try:
            dados = r.json()
        except Exception:
            dados = {"corpo_bruto": r.text[:400]}

        if r.status_code == 401:
            resultado = {"status": "erro", "http": 401, "resposta": dados,
                         "erro": "X-API-KEY recusada"}
            break  # nao adianta repetir com a mesma chave
        if r.status_code >= 400:
            resultado = {"status": "erro", "http": r.status_code,
                         "resposta": dados,
                         "erro": "http {}".format(r.status_code)}
            continue

        # 201 com status skipped: o slug pertence a outro portal
        if str(dados.get("status", "")).lower() == "skipped":
            log.warning("[%s] slug %r pulado pela guarda de exclusividade "
                        "(tentativa %d)", m["site_slug"], corpo["slug"],
                        tentativa)
            resultado = {"status": "skipped", "http": r.status_code,
                         "resposta": dados,
                         "erro": "slug ja pertence a outro portal"}
            continue

        resultado = {"status": "publicado", "http": r.status_code,
                     "resposta": dados, "slug": dados.get("slug"),
                     "url": dados.get("url") or dados.get("link")}
        break

    db.exec1(
        "INSERT INTO publicacoes (fato_guid, site_slug, materia_id, slug, url, "
        "status, http_code, resposta, tentativas, erro, publicado_em) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
        "ON CONFLICT (fato_guid, site_slug) DO UPDATE SET "
        "status=EXCLUDED.status, http_code=EXCLUDED.http_code, "
        "resposta=EXCLUDED.resposta, erro=EXCLUDED.erro, "
        "tentativas=publicacoes.tentativas+1, "
        "publicado_em=EXCLUDED.publicado_em",
        (m["fato_guid"], m["site_slug"], m["id"],
         resultado.get("slug") or m["slug"], resultado.get("url"),
         resultado["status"], resultado.get("http"),
         json.dumps(resultado.get("resposta", {}), ensure_ascii=False,
                    default=str),
         1, resultado.get("erro"),
         dt.datetime.now(dt.timezone.utc)
         if resultado["status"] == "publicado" else None))

    db.exec1("UPDATE materias SET estado=%s WHERE id=%s",
             ("publicada" if resultado["status"] == "publicado"
              else resultado["status"], m["id"]))
    try:
        verificacao.conferir_se_primeira(site, m, resultado)
    except Exception as e:  # conferencia nunca derruba a publicacao
        log.warning("falha na conferencia da 1a publicacao: %s", e)
    try:
        notificacao.notificar_publicacao(site, m, resultado)
    except Exception as e:  # aviso nunca pode derrubar a publicacao
        log.warning("falha ao notificar publicacao: %s", e)
    return resultado


def rodada():
    """Publica todos os slots vencidos. Instancias em paralelo, throttle dentro."""
    slots = db.q(
        "SELECT a.id AS agenda_id, a.site_slug, m.id AS materia_id "
        "FROM agenda a JOIN materias m ON m.agenda_id=a.id "
        "WHERE a.estado='gerado' AND m.estado='pronta' AND a.slot <= now() "
        "ORDER BY a.slot ASC LIMIT 200") or []
    if not slots:
        return {"publicados": 0, "skipped": 0, "erros": 0}

    def tarefa(s):
        res = entregar(s["materia_id"])
        db.exec1("UPDATE agenda SET estado=%s WHERE id=%s",
                 ("publicado" if res["status"] == "publicado" else "falhou",
                  s["agenda_id"]))
        return res["status"]

    # uma thread por instancia distinta: o throttle interno faz o resto
    instancias = {(config.site(s["site_slug"]) or {}).get("instancia", "x")
                  for s in slots}
    with ThreadPoolExecutor(max_workers=max(1, len(instancias))) as ex:
        estados = list(ex.map(tarefa, slots))

    r = {"publicados": estados.count("publicado"),
         "skipped": estados.count("skipped"),
         "erros": sum(1 for e in estados if e not in ("publicado", "skipped"))}
    log.info("rodada de publicacao: %s", r)
    return r


def metricas(dias=7):
    """Metricas de rampa: taxa de skipped e de falha de publicacao."""
    r = db.q(
        "SELECT status, COUNT(*) AS n FROM publicacoes "
        "WHERE criado_em > now() - (%s || ' days')::interval "
        "GROUP BY status", (str(dias),)) or []
    total = sum(x["n"] for x in r) or 1
    por = {x["status"]: x["n"] for x in r}
    return {
        "janela_dias": dias,
        "total": sum(x["n"] for x in r),
        "por_status": por,
        "taxa_skipped": round(por.get("skipped", 0) / total * 100, 2),
        "taxa_erro": round(por.get("erro", 0) / total * 100, 2),
    }
