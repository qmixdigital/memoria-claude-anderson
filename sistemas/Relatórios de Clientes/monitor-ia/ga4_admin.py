#!/usr/bin/env python3
"""
Administração em massa das propriedades do GA4 da rede QMIX.

Diagnostica e corrige, em todas as contas visíveis pela conta de serviço, o
problema que trava a medição de leads: o evento de contato dispara, mas não
está marcado como evento-chave, então o GA4 não o conta como conversão.

Uso:
  python ga4_admin.py --diagnostico
      Tabela: quais propriedades disparam evento de contato, quais já têm
      evento-chave e quais estão pendentes. Não altera nada.

  python ga4_admin.py --marcar generate_lead
      Simulação: mostra o que faria. NÃO grava.

  python ga4_admin.py --marcar generate_lead --aplicar
      Grava de verdade, só nas propriedades onde o evento realmente dispara.

  python ga4_admin.py --marcar generate_lead --aplicar --todas
      Grava mesmo onde o evento ainda não disparou (útil antes de instalar
      o rastreio, para a propriedade já estar pronta).
"""

import argparse
import json
import os
import sys

from googleapiclient.discovery import build

from google_dados import ESCOPO_GA4, EVENTOS_CONTATO, PASTA_PADRAO, _credencial

BASE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(BASE, "config.json")

# Escrever exige escopo de edicao; leitura sozinha devolve 403 no create.
ESCOPO_EDIT = ["https://www.googleapis.com/auth/analytics.edit"]

# O visitante CONCLUIU o contato. Isto sim e conversao.
EVENTOS_CONVERSAO = ("generate_lead", "form_submit", "whatsapp_click",
                     "click_to_call", "contato_enviado", "agendamento",
                     "lead_", "_wa", "wa_click", "telefone_click")

# O visitante apenas COMECOU. Marcar como conversao infla o numero e engana o
# cliente: form_start dispara quando a pessoa toca no primeiro campo e vai
# embora sem enviar nada. Numa das contas sao 1373 inicios para 220 envios.
EVENTOS_INTENCAO = ("form_start", "form_view", "scroll", "view_")


def classificar(nome):
    baixo = nome.lower()
    if any(m in baixo for m in EVENTOS_INTENCAO):
        return "intencao"
    if any(m in baixo for m in EVENTOS_CONVERSAO):
        return "conversao"
    return "outro"


def carregar_config():
    if not os.path.exists(CONFIG):
        return {}
    with open(CONFIG, encoding="utf-8") as f:
        return json.load(f)


def credenciais(cfg, arquivo, escopos):
    return _credencial(cfg, arquivo, escopos)


def propriedades(admin):
    """[(id, nome da conta, nome da propriedade)] de tudo que a conta enxerga."""
    saida = []
    for c in admin.accountSummaries().list(pageSize=200).execute().get(
            "accountSummaries", []):
        for p in c.get("propertySummaries", []):
            saida.append((p["property"], c.get("displayName", "?"),
                          p.get("displayName", "?")))
    return saida


def eventos_de_contato(dados, prop, dias=30):
    """Eventos de contato que dispararam na propriedade, com a contagem."""
    try:
        r = dados.properties().runReport(property=prop, body={
            "dateRanges": [{"startDate": f"{dias}daysAgo", "endDate": "yesterday"}],
            "dimensions": [{"name": "eventName"}],
            "metrics": [{"name": "eventCount"}],
            "limit": 100,
        }).execute()
    except Exception:
        return {}
    achados = {}
    for linha in r.get("rows", []):
        nome = linha["dimensionValues"][0]["value"]
        if any(m in nome.lower() for m in EVENTOS_CONTATO):
            achados[nome] = int(float(linha["metricValues"][0]["value"]))
    return achados


def chaves_de(admin, prop):
    try:
        return {k["eventName"] for k in admin.properties().keyEvents()
                .list(parent=prop).execute().get("keyEvents", [])}
    except Exception as e:
        return {"__erro__": str(e)[:80]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--diagnostico", action="store_true",
                    help="tabela de situação, sem alterar nada")
    ap.add_argument("--marcar", metavar="EVENTO",
                    help="evento a marcar como evento-chave")
    ap.add_argument("--aplicar", action="store_true",
                    help="grava de verdade (sem isto, apenas simula)")
    ap.add_argument("--todas", action="store_true",
                    help="marca mesmo onde o evento ainda não disparou")
    ap.add_argument("--auto", action="store_true",
                    help="marca, em cada propriedade, os eventos de conversão "
                         "que ela realmente dispara (ignora form_start e afins)")
    ap.add_argument("--credencial",
                    help="arquivo da conta de serviço (padrão: o do config)")
    args = ap.parse_args()

    if not args.diagnostico and not args.marcar and not args.auto:
        ap.print_help()
        return

    cfg = carregar_config()
    arquivo = args.credencial
    if not arquivo:
        for c in cfg.get("clientes", []):
            ga4 = (c.get("google") or {}).get("ga4")
            if ga4:
                arquivo = ga4["credencial"]
                break
    if not arquivo:
        sys.exit("Informe a credencial com --credencial (nenhuma no config.json).")

    # Escrever precisa dos DOIS escopos: o de edicao para criar o evento-chave
    # e o de leitura para a API de dados dizer quais eventos disparam.
    escopos = (ESCOPO_EDIT + ESCOPO_GA4) if (args.marcar or args.auto) else ESCOPO_GA4
    cred = credenciais(cfg, arquivo, escopos)
    admin = build("analyticsadmin", "v1beta", credentials=cred, cache_discovery=False)
    dados = build("analyticsdata", "v1beta", credentials=cred, cache_discovery=False)

    lista = propriedades(admin)
    print(f"{len(lista)} propriedades visíveis com {os.path.basename(arquivo)}\n")

    pendentes, prontas, sem_evento, erros = [], [], [], []
    for prop, conta, nome in lista:
        contato = eventos_de_contato(dados, prop)
        chaves = chaves_de(admin, prop)
        if "__erro__" in chaves:
            erros.append((nome, chaves["__erro__"]))
            continue

        rotulo = f"{nome[:38]:40} {prop.split('/')[-1]:>10}"
        conversoes = {k: v for k, v in contato.items()
                      if classificar(k) == "conversao"}
        intencao = {k: v for k, v in contato.items()
                    if classificar(k) == "intencao"}

        if args.auto:
            # Cada propriedade tem os seus proprios eventos. Marcar um nome
            # fixo em todas criaria evento-chave que nunca dispara.
            faltando = {k: v for k, v in conversoes.items() if k not in chaves}
        else:
            alvo = args.marcar or "generate_lead"
            faltando = ({alvo: contato[alvo]}
                        if alvo not in chaves and contato.get(alvo) else {})

        if faltando:
            pendentes.append((prop, nome, faltando))
            estado = "PENDENTE: " + ", ".join(f"{k} ({v})"
                                              for k, v in faltando.items())
        elif conversoes:
            prontas.append(rotulo)
            estado = "ok, conversão já marcada"
        else:
            sem_evento.append((prop, nome))
            estado = "não dispara evento de conversão"
        print(f"  {rotulo}  {estado}")
        if intencao:
            print("       ignorado, não é conversão: " +
                  ", ".join(f"{k}={v}" for k, v in sorted(intencao.items())))

    print(f"\nresumo: {len(prontas)} prontas | {len(pendentes)} pendentes | "
          f"{len(sem_evento)} sem o evento | {len(erros)} com erro")
    for nome, e in erros:
        print(f"  erro em {nome}: {e}")

    if args.diagnostico or not (args.marcar or args.auto):
        return

    alvos = list(pendentes)
    if args.todas and args.marcar:
        alvos += [(p, n, {args.marcar: 0}) for p, n in sem_evento]
    if not alvos:
        print("\nNada a marcar.")
        return

    total_eventos = sum(len(f) for _, _, f in alvos)
    if not args.aplicar:
        print(f"\nSIMULAÇÃO. Marcaria {total_eventos} eventos em "
              f"{len(alvos)} propriedades:")
        for _, nome, faltando in alvos:
            print(f"  {nome[:44]:46} {', '.join(faltando)}")
        print("\nRepita com --aplicar para gravar.")
        return

    print(f"\nMarcando {total_eventos} eventos em {len(alvos)} propriedades...")
    ok = 0
    for prop, nome, faltando in alvos:
        for evento in faltando:
            try:
                admin.properties().keyEvents().create(
                    parent=prop,
                    body={"eventName": evento,
                          "countingMethod": "ONCE_PER_SESSION"}).execute()
                print(f"  ok      {nome[:38]:40} {evento}")
                ok += 1
            except Exception as e:
                print(f"  FALHOU  {nome[:38]:40} {evento}: {str(e)[:90]}")
    print(f"\n{ok} de {total_eventos} marcados. "
          f"Pode levar até 24h para refletir nos relatórios nativos do GA4.")


if __name__ == "__main__":
    main()
