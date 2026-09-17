"""Contador de gasto, corte automatico e alertas de credito.

Tres mecanismos distintos, que respondem a perguntas diferentes:

  TETO       projeta o mes pelo ritmo ate aqui. Se passar do teto em reais,
             PAUSA a geracao e alerta. Protege o orcamento.

  DEGRAUS    a cada ~US$ 5 de gasto acumulado no mes POR PROVEDOR, manda um
             e-mail. Como as APIs sao abastecidas em credito pre-pago, este e
             o aviso de "hora de abastecer", e nao um aviso de orcamento. Um
             e-mail por degrau, sem repetir se o ciclo rodar de novo.

  CREDITO    quando uma chamada falha por credito insuficiente ou erro de
             autenticacao, alerta na hora. Este e o unico sinal confiavel de
             que o credito acabou ANTES do degrau seguinte avisar, porque o
             gasto que nao aconteceu nao aparece na conta.

E nunca deixa de registrar por nao saber o preco de um modelo: nesse caso marca
preco_conhecido=false e alerta a parte, porque gasto invisivel e pior que gasto
alto.
"""
from __future__ import annotations

import calendar
import datetime as dt
import logging
import smtplib
from email.message import EmailMessage

from . import config, db
from .precos import (PrecoDesconhecido, custo_embedding, custo_imagem,
                     custo_tokens, provedor_de)

log = logging.getLogger("motor.budget")

CHAVE_PAUSA = "pausa_orcamento"
CHAVE_DEGRAUS = "degraus_alertados"
CHAVE_CREDITO = "ultimo_alerta_credito"
TZ = dt.timezone(dt.timedelta(hours=-3))  # America/Sao_Paulo

DEGRAU_USD = 5.0
# Se o credito acabar, TODA chamada passa a falhar. Sem esta janela o motor
# mandaria um e-mail por chamada. Um por provedor por hora basta para avisar.
JANELA_ALERTA_CREDITO_MIN = 60


def hoje():
    return dt.datetime.now(TZ).date()


def agora():
    return dt.datetime.now(TZ)


# ------------------------------------------------------------------ registro

def registrar(componente, provedor=None, modelo=None, tokens_in=0,
              tokens_out=0, cache_read=0, cache_write=0, unidades=0,
              batch=False, usd=None):
    """Registra um gasto, reavalia o teto e os degraus. Devolve o USD."""
    provedor = provedor or provedor_de(modelo)
    conhecido = True
    if usd is None:
        try:
            if componente == "embedding":
                usd = custo_embedding(modelo, tokens_in)
            elif componente == "imagem":
                usd = custo_imagem(modelo, unidades or 1)
            else:
                usd = custo_tokens(modelo, tokens_in, tokens_out,
                                   cache_read, cache_write, batch=batch)
        except PrecoDesconhecido:
            usd, conhecido = 0.0, False
            log.warning(
                "PRECO DESCONHECIDO para %s/%s: tokens registrados, custo NAO "
                "contabilizado. Preencher em precos.py.", provedor, modelo)

    db.exec1(
        "INSERT INTO gasto (dia, componente, provedor, modelo, tokens_in, "
        "tokens_out, cache_read, cache_write, unidades, usd, preco_conhecido) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        (hoje(), componente, provedor, modelo, tokens_in, tokens_out,
         cache_read, cache_write, unidades, usd, conhecido),
    )
    avaliar_teto()
    verificar_degraus()
    return usd


# -------------------------------------------------------------------- resumos

def resumo_mes(ref=None):
    """Gasto do mes corrente, total e por componente, com projecao."""
    ref = ref or hoje()
    inicio = ref.replace(day=1)
    dias_mes = calendar.monthrange(ref.year, ref.month)[1]
    dia_atual = ref.day

    linhas = db.q(
        "SELECT componente, SUM(usd)::numeric AS usd, SUM(tokens_in) AS tin, "
        "SUM(tokens_out) AS tout, SUM(unidades) AS un, "
        "bool_and(preco_conhecido) AS ok "
        "FROM gasto WHERE dia >= %s AND dia <= %s "
        "GROUP BY componente ORDER BY 2 DESC",
        (inicio, ref),
    ) or []

    por_comp = {
        l["componente"]: {
            "usd": round(float(l["usd"] or 0), 4),
            "tokens_in": int(l["tin"] or 0),
            "tokens_out": int(l["tout"] or 0),
            "unidades": int(l["un"] or 0),
            "preco_conhecido": bool(l["ok"]),
        }
        for l in linhas
    }
    total = sum(v["usd"] for v in por_comp.values())
    projecao = (total / dia_atual) * dias_mes if dia_atual else total

    teto_brl = config.teto_mensal_brl()
    cambio = config.cambio_usd_brl()
    teto_usd = (teto_brl / cambio) if cambio else None

    return {
        "mes": ref.strftime("%Y-%m"),
        "dia_do_mes": dia_atual,
        "dias_no_mes": dias_mes,
        "total_usd": round(total, 4),
        "projecao_mes_usd": round(projecao, 2),
        "por_componente": por_comp,
        "por_provedor": resumo_por_provedor(ref),
        "teto_brl": teto_brl,
        "cambio_usd_brl": cambio or None,
        "teto_usd": round(teto_usd, 2) if teto_usd else None,
        "percentual_do_teto": (round(projecao / teto_usd * 100, 1)
                               if teto_usd else None),
        "pausado": pausado(),
    }


def resumo_por_provedor(ref=None):
    """Gasto do mes por provedor. Base dos degraus de abastecimento."""
    ref = ref or hoje()
    inicio = ref.replace(day=1)
    linhas = db.q(
        "SELECT COALESCE(provedor,'desconhecido') AS provedor, "
        "SUM(usd)::numeric AS usd FROM gasto "
        "WHERE dia >= %s AND dia <= %s GROUP BY 1 ORDER BY 2 DESC",
        (inicio, ref)) or []
    return {l["provedor"]: round(float(l["usd"] or 0), 4) for l in linhas}


def _detalhe_provedor(provedor, ref=None):
    """Quebra por componente dentro de um provedor, para o corpo do e-mail."""
    ref = ref or hoje()
    inicio = ref.replace(day=1)
    linhas = db.q(
        "SELECT componente, modelo, SUM(usd)::numeric AS usd, "
        "SUM(tokens_in) AS tin, SUM(tokens_out) AS tout, SUM(unidades) AS un "
        "FROM gasto WHERE provedor=%s AND dia >= %s AND dia <= %s "
        "GROUP BY 1,2 ORDER BY 3 DESC", (provedor, inicio, ref)) or []
    return [{"componente": l["componente"], "modelo": l["modelo"],
             "usd": round(float(l["usd"] or 0), 4),
             "tokens_in": int(l["tin"] or 0),
             "tokens_out": int(l["tout"] or 0),
             "unidades": int(l["un"] or 0)} for l in linhas]


# --------------------------------------------------------------------- pausa

def pausado():
    e = db.estado_get(CHAVE_PAUSA)
    return bool(e and e.get("ativo"))


def motivo_pausa():
    return db.estado_get(CHAVE_PAUSA) or {}


def pausar(motivo, detalhe=None, avisar=True):
    if pausado():
        return False
    db.estado_set(CHAVE_PAUSA, {
        "ativo": True, "motivo": motivo, "detalhe": detalhe,
        "desde": agora().isoformat(),
    })
    log.error("GERACAO PAUSADA: %s | %s", motivo, detalhe)
    if avisar:
        alertar("[MOTOR PAUSADO] " + motivo, detalhe or "", urgente=True)
    return True


def retomar():
    db.estado_set(CHAVE_PAUSA, {"ativo": False})
    log.warning("geracao retomada manualmente")
    return True


def avaliar_teto():
    """Pausa a geracao se a projecao do mes passar do teto."""
    r = resumo_mes()
    if r["teto_usd"] is None:
        # sem cambio configurado nao da para comparar com o teto em reais
        return r
    if r["projecao_mes_usd"] > r["teto_usd"] and not r["pausado"]:
        detalhe = (
            "Projecao de fechamento: US$ {:.2f}\n"
            "Teto: US$ {:.2f} (R$ {:.2f} a {:.2f})\n"
            "Gasto ate agora: US$ {:.2f} em {} de {} dias.\n\n"
            "A GERACAO ESTA PAUSADA. A publicacao do que ja foi gerado segue.\n"
            "Para retomar: python -m motor_pautas retomar"
        ).format(r["projecao_mes_usd"], r["teto_usd"], r["teto_brl"],
                 r["cambio_usd_brl"], r["total_usd"], r["dia_do_mes"],
                 r["dias_no_mes"])
        pausar("projecao do mes acima do teto de R$ {:.0f}".format(
            r["teto_brl"]), detalhe)
    return r


def pode_gerar():
    """Portao unico consultado antes de qualquer chamada paga de geracao."""
    return not pausado()


# ------------------------------------------------------- degraus de credito

def verificar_degraus():
    """Um e-mail a cada ~US$ 5 acumulados no mes, por provedor. Sem repetir."""
    ref = hoje()
    mes = ref.strftime("%Y-%m")
    estado = db.estado_get(CHAVE_DEGRAUS, {}) or {}
    do_mes = dict(estado.get(mes, {}))
    mudou = False

    for provedor, total in resumo_por_provedor(ref).items():
        degrau = int(total // DEGRAU_USD)
        if degrau <= int(do_mes.get(provedor, 0)):
            continue
        do_mes[provedor] = degrau
        mudou = True
        _email_degrau(provedor, degrau, total, ref)

    if mudou:
        estado[mes] = do_mes
        # guarda so os dois ultimos meses, o resto e ruido
        for chave in sorted(estado)[:-2]:
            estado.pop(chave, None)
        db.estado_set(CHAVE_DEGRAUS, estado)


def _email_degrau(provedor, degrau, total, ref):
    r = resumo_mes(ref)
    limiar = degrau * DEGRAU_USD
    linhas = [
        "Gasto do motor de pautas passou de US$ {:.0f} no provedor {} "
        "neste mes.".format(limiar, provedor.upper()),
        "",
        "As APIs sao abastecidas em credito pre-pago: este e o aviso para "
        "abastecer antes de o credito acabar.",
        "",
        "=== {} — mes {} (dia {} de {}) ===".format(
            provedor.upper(), r["mes"], r["dia_do_mes"], r["dias_no_mes"]),
        "Acumulado no provedor: US$ {:.2f}".format(total),
        "",
        "Por componente neste provedor:",
    ]
    for d in _detalhe_provedor(provedor, ref):
        linhas.append(
            "  {:<12} {:<24} US$ {:>8.4f}   in={} out={} un={}".format(
                d["componente"], d["modelo"] or "-", d["usd"],
                d["tokens_in"], d["tokens_out"], d["unidades"]))

    linhas += ["", "=== Todos os provedores ==="]
    for p, v in r["por_provedor"].items():
        linhas.append("  {:<12} US$ {:>8.2f}".format(p, v))

    linhas += [
        "",
        "Total do mes:            US$ {:.2f}".format(r["total_usd"]),
        "Projecao de fechamento:  US$ {:.2f}".format(r["projecao_mes_usd"]),
    ]
    if r["teto_usd"]:
        linhas.append(
            "Teto:                    US$ {:.2f} (R$ {:.0f} a {:.2f})  "
            "= {}% do teto".format(r["teto_usd"], r["teto_brl"],
                                   r["cambio_usd_brl"],
                                   r["percentual_do_teto"]))
    else:
        linhas.append("Teto: NAO CONFIGURADO (cambio_usd_brl esta em 0, o "
                      "corte automatico esta desligado)")

    linhas += ["", "Painel: " + config.url_painel()]
    alertar("[Motor de pautas] {} passou de US$ {:.0f} no mes".format(
        provedor.upper(), limiar), "\n".join(linhas))


# -------------------------------------------------- falha de credito ou auth

MARCAS_CREDITO = (
    "insufficient_quota", "insufficient credit", "credit balance is too low",
    "billing", "quota exceeded", "payment required", "exceeded your current "
    "quota", "account is not active",
)
MARCAS_AUTH = (
    "authentication_error", "invalid_api_key", "invalid api key",
    "unauthorized", "permission_error", "invalid x-api-key",
)


def classificar_falha(erro):
    """Devolve 'credito', 'auth' ou None a partir da excecao ou do texto."""
    t = str(erro).lower()
    codigo = getattr(erro, "status_code", None)
    if any(m in t for m in MARCAS_CREDITO) or codigo == 402:
        return "credito"
    if any(m in t for m in MARCAS_AUTH) or codigo == 401:
        return "auth"
    return None


def alertar_falha_credito(provedor, erro, contexto=""):
    """Alerta imediato de credito esgotado ou chave invalida.

    Deduplicado por provedor dentro de uma janela: se o credito acabou, TODA
    chamada falha, e sem isso o motor mandaria um e-mail por chamada.
    """
    tipo = classificar_falha(erro)
    if tipo is None:
        return False

    estado = db.estado_get(CHAVE_CREDITO, {}) or {}
    ultimo = estado.get(provedor)
    if ultimo:
        try:
            quando = dt.datetime.fromisoformat(ultimo)
            idade = (agora() - quando).total_seconds() / 60
            if idade < JANELA_ALERTA_CREDITO_MIN:
                log.warning("falha de %s em %s ja alertada ha %.0f min",
                            tipo, provedor, idade)
                return False
        except ValueError:
            pass

    estado[provedor] = agora().isoformat()
    db.estado_set(CHAVE_CREDITO, estado)

    r = resumo_mes()
    titulo = ("CREDITO ESGOTADO" if tipo == "credito"
              else "FALHA DE AUTENTICACAO")
    corpo = "\n".join([
        "{} no provedor {}.".format(titulo, provedor.upper()),
        "",
        "O motor nao consegue mais chamar esta API. "
        + ("Abastecer o credito agora."
           if tipo == "credito"
           else "Conferir a chave em /opt/motor-pautas/config/motor-pautas.env."),
        "",
        "Erro devolvido pela API:",
        "  " + str(erro)[:600],
        "",
        "Contexto: " + (contexto or "nao informado"),
        "",
        "Gasto registrado neste provedor no mes: US$ {:.2f}".format(
            r["por_provedor"].get(provedor, 0.0)),
        "Total do mes: US$ {:.2f}".format(r["total_usd"]),
        "",
        "ATENCAO: o gasto que NAO aconteceu por falta de credito nao aparece "
        "nesta conta. Por isso este alerta existe: o degrau de US$ 5 nunca "
        "chegaria.",
        "",
        "Painel: " + config.url_painel(),
    ])
    alertar("[URGENTE] {} — {}".format(titulo, provedor.upper()), corpo,
            urgente=True)
    return True


# --------------------------------------------------------------------- envio

def alertar(assunto, corpo, urgente=False):
    """Alerta operacional. Grava sempre; despacha pelo canal configurado.

    Canal ativo e o Telegram. O SMTP continua no codigo como alternativa e so
    e usado se MP_CANAL_ALERTA disser (`smtp` ou `ambos`).
    """
    (log.error if urgente else log.warning)("ALERTA: %s", assunto)
    db.estado_set("ultimo_alerta", {
        "assunto": assunto, "corpo": corpo, "urgente": urgente,
        "quando": agora().isoformat(),
    })

    canal = (config.env("MP_CANAL_ALERTA", "telegram") or "telegram").lower()
    enviado = False
    if canal in ("telegram", "ambos"):
        enviado = _telegram_enviar(assunto, corpo, urgente) or enviado
    if canal in ("smtp", "ambos"):
        enviado = _smtp_enviar(assunto, corpo) or enviado

    if not enviado:
        log.warning("nenhum canal de alerta entregou (canal=%s): "
                    "o alerta ficou so no log e no banco", canal)
    return enviado


# ------------------------------------------------------------------ telegram

API_TELEGRAM = "https://api.telegram.org/bot{}/{}"
LIMITE_TELEGRAM = 4096


def _telegram_enviar(assunto, corpo, urgente=False):
    """sendMessage da Bot API. Texto puro, sem parse_mode.

    Sem markdown de proposito: o corpo do alerta tem cifrao, underline,
    parenteses e barra, e qualquer um deles quebra o parser do Telegram com
    400 "can't parse entities". Texto puro nunca falha por formatacao.
    """
    token = config.env("TELEGRAM_BOT_TOKEN")
    chat = config.env("TELEGRAM_CHAT_ID")
    if not (token and chat):
        return False

    marca = "[!] " if urgente else ""
    texto = "{}{}\n\n{}".format(marca, assunto, corpo)
    if len(texto) > LIMITE_TELEGRAM:
        corte = LIMITE_TELEGRAM - 40
        texto = texto[:corte] + "\n\n[...] truncado, ver o painel"

    try:
        import httpx
        r = httpx.post(API_TELEGRAM.format(token, "sendMessage"), timeout=30,
                       json={"chat_id": chat, "text": texto,
                             "disable_web_page_preview": True})
        d = r.json() if r.headers.get("content-type", "").startswith(
            "application/json") else {}
        if r.status_code == 200 and d.get("ok"):
            log.info("telegram enviado para %s: %s", chat, assunto)
            return True
        log.error("telegram recusou (http %s): %s", r.status_code,
                  str(d or r.text)[:300])
        return False
    except Exception as e:  # alerta nunca pode derrubar o motor
        log.error("falha ao enviar telegram: %s", e)
        return False


def telegram_descobrir_chat_id():
    """Le getUpdates e lista os chats que ja falaram com o bot.

    Passo do runbook: criar o bot no BotFather, mandar qualquer mensagem para
    ele, e rodar isto. O Telegram so entrega o chat_id depois que alguem inicia
    a conversa, entao nao ha como descobrir antes.
    """
    token = config.env("TELEGRAM_BOT_TOKEN")
    if not token:
        return [], "TELEGRAM_BOT_TOKEN nao definido no motor-pautas.env"
    try:
        import httpx
        r = httpx.get(API_TELEGRAM.format(token, "getUpdates"), timeout=30)
        d = r.json()
    except Exception as e:
        return [], "falha ao consultar getUpdates: {}".format(e)

    if not d.get("ok"):
        return [], "getUpdates recusou: {}".format(str(d)[:300])

    vistos, chats = set(), []
    for u in d.get("result", []):
        msg = (u.get("message") or u.get("channel_post")
               or u.get("edited_message") or {})
        c = msg.get("chat") or {}
        if not c.get("id") or c["id"] in vistos:
            continue
        vistos.add(c["id"])
        nome = (c.get("title") or " ".join(
            x for x in (c.get("first_name"), c.get("last_name")) if x)
            or c.get("username") or "sem nome")
        chats.append({"chat_id": c["id"], "tipo": c.get("type"),
                      "nome": nome})
    if not chats:
        return [], ("nenhuma conversa encontrada. Mande qualquer mensagem "
                    "para o bot no Telegram e rode de novo. Atencao: se o "
                    "TELEGRAM_CHAT_ID ja estiver configurado e o motor ja "
                    "tiver rodado, o getUpdates pode ter sido consumido.")
    return chats, "ok"


def testar_telegram():
    """Manda uma mensagem de teste pelo Telegram."""
    if not config.env("TELEGRAM_BOT_TOKEN"):
        return False, "TELEGRAM_BOT_TOKEN nao definido"
    if not config.env("TELEGRAM_CHAT_ID"):
        chats, msg = telegram_descobrir_chat_id()
        if chats:
            return False, ("TELEGRAM_CHAT_ID nao definido. Chats que ja "
                           "falaram com o bot: " + ", ".join(
                               "{} ({}, {})".format(c["chat_id"], c["nome"],
                                                    c["tipo"])
                               for c in chats))
        return False, "TELEGRAM_CHAT_ID nao definido. " + msg

    r = resumo_mes()
    corpo = "\n".join([
        "Teste de alerta do motor de pautas.",
        "",
        "Se voce recebeu isto, os tres gatilhos vao chegar por aqui:",
        "  1. degrau de US$ {:.0f} acumulados por provedor".format(DEGRAU_USD),
        "  2. corte do teto de R$ {:.0f}".format(r["teto_brl"]),
        "  3. credito esgotado ou chave invalida",
        "",
        "Gasto do mes: US$ {:.2f}".format(r["total_usd"]),
        "Teto: " + ("US$ {:.2f} (R$ {:.0f} a {:.2f})".format(
            r["teto_usd"], r["teto_brl"], r["cambio_usd_brl"])
            if r["teto_usd"] else "NAO CONFIGURADO"),
        "",
        "Painel: " + config.url_painel(),
    ])
    ok = _telegram_enviar("[Motor de pautas] teste de alerta", corpo)
    return ok, ("mensagem enviada" if ok
                else "falhou, ver o log acima para o motivo")


def _smtp_enviar(assunto, corpo):
    """SMTP simples. ALTERNATIVA, nao e o canal ativo.

    O canal ativo e o Telegram. Este caminho fica no codigo, funcional, e so e
    usado com MP_CANAL_ALERTA=smtp ou =ambos. Serve Gmail com senha de app,
    Resend SMTP ou qualquer outro: tudo vem do ambiente, entao trocar de
    provedor de envio e trocar variavel, nao mexer em codigo.
    """
    host = config.env("SMTP_HOST")
    para = config.env("ALERTA_EMAIL", "qmixdigital@gmail.com")
    if not (host and para):
        return False

    porta = int(config.env("SMTP_PORT", "587"))
    usuario = config.env("SMTP_USER")
    senha = config.env("SMTP_PASS")
    remetente = config.env("SMTP_FROM") or usuario or para

    msg = EmailMessage()
    msg["Subject"] = assunto
    msg["From"] = remetente
    msg["To"] = para
    msg.set_content(corpo)

    try:
        if porta == 465:
            with smtplib.SMTP_SSL(host, porta, timeout=30) as s:
                if usuario:
                    s.login(usuario, senha)
                s.send_message(msg)
        else:
            with smtplib.SMTP(host, porta, timeout=30) as s:
                s.ehlo()
                s.starttls()
                s.ehlo()
                if usuario:
                    s.login(usuario, senha)
                s.send_message(msg)
        log.info("e-mail enviado para %s: %s", para, assunto)
        return True
    except Exception as e:  # alerta nunca pode derrubar o motor
        log.error("falha ao enviar e-mail (%s:%s): %s", host, porta, e)
        return False


def testar_email():
    """Manda um e-mail de teste. Usado no comando `testar-email`."""
    r = resumo_mes()
    corpo = "\n".join([
        "Teste de alerta do motor de pautas.",
        "",
        "Se voce recebeu isto, os degraus de US$ {:.0f} por provedor e os "
        "alertas urgentes vao chegar.".format(DEGRAU_USD),
        "",
        "Gasto do mes: US$ {:.2f}".format(r["total_usd"]),
        "Teto: " + ("US$ {:.2f} (R$ {:.0f})".format(r["teto_usd"],
                                                    r["teto_brl"])
                    if r["teto_usd"] else "NAO CONFIGURADO"),
        "Painel: " + config.url_painel(),
    ])
    return alertar("[Motor de pautas] teste de alerta", corpo)
