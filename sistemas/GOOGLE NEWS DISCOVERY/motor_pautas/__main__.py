"""Ponto de entrada: laco do motor, ou um comando avulso.

  python -m motor_pautas                  laco 24/7 (e o que o systemd roda)
  python -m motor_pautas init-db          cria o esquema
  python -m motor_pautas coletar          uma passada de coleta
  python -m motor_pautas agrupar          uma passada de dedupe
  python -m motor_pautas grade            gera a grade da semana
  python -m motor_pautas gerar            monta e envia o lote
  python -m motor_pautas colher           colhe lotes terminados
  python -m motor_pautas publicar         publica os slots vencidos
  python -m motor_pautas status           panorama em JSON
  python -m motor_pautas teste-cego [n]   roda o teste cego
  python -m motor_pautas revelar RODADA   revela o mapa codigo -> modelo
  python -m motor_pautas resumo           manda o resumo do dia no Telegram
  python -m motor_pautas retomar          tira a pausa por orcamento
  python -m motor_pautas portais-pausados lista os portais pausados
  python -m motor_pautas retomar-portal X  retoma um portal pausado
  python -m motor_pautas testar-telegram  manda um alerta de teste (canal ativo)
  python -m motor_pautas chat-id          descobre o chat_id do bot
  python -m motor_pautas testar-email     alternativa por SMTP, se habilitada
  python -m motor_pautas testar-chaves    valida as chaves e o id do modelo
"""
from __future__ import annotations

import datetime as dt
import json
import logging
import sys
import time

from . import (blindtest, budget, collect, config, db, dedupe, extract,
               generate, notificacao, publish, schedule, status,
               verificacao)

log = logging.getLogger("motor")

TZ = dt.timezone(dt.timedelta(hours=-3))


def configurar_log():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-7s %(name)-16s %(message)s",
        stream=sys.stdout)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def ciclo_coleta():
    collect.coletar_tudo()
    collect.decodificar_pendentes()
    extract.extrair_pendentes()
    dedupe.agrupar()


def laco():
    """Laco principal. Cada tarefa tem sua propria cadencia."""
    status.servir_em_thread()
    db.init()

    proximo = {"coleta": 0.0, "grade": 0.0, "gerar": 0.0,
               "colher": 0.0, "publicar": 0.0, "poda": 0.0, "cego": 0.0}
    intervalo_coleta = config.intervalo_coleta() * 60

    log.info("motor iniciado | %d portais | %d artigos/semana/portal",
             len(config.sites()), config.artigos_por_semana())

    while True:
        agora = time.monotonic()
        try:
            if agora >= proximo["coleta"]:
                ciclo_coleta()
                proximo["coleta"] = agora + intervalo_coleta

            if agora >= proximo["grade"]:
                schedule.gerar_grade()
                schedule.gerar_grade(  # ja deixa a semana seguinte montada
                    schedule.semana_de() + dt.timedelta(days=7))
                proximo["grade"] = agora + 3600

            if agora >= proximo["gerar"]:
                if budget.pode_gerar():
                    generate.enviar()
                else:
                    log.warning("geracao pausada: %s",
                                budget.motivo_pausa().get("motivo"))
                proximo["gerar"] = agora + 3600 * 6

            if agora >= proximo["colher"]:
                generate.colher()
                proximo["colher"] = agora + 900

            if agora >= proximo["publicar"]:
                publish.rodada()
                proximo["publicar"] = agora + 300

            if notificacao.hora_de_resumir():
                notificacao.enviar_resumo()

            # Teste cego: 4 modelos na mesma pauta, ate juntar o alvo.
            # Vai de 2 em 2 por dia de proposito: espalha o custo e nao
            # concorre com a producao pelo mesmo lote.
            if agora >= proximo["cego"]:
                if config.teste_cego_ativo() and budget.pode_gerar():
                    feitas = blindtest.pautas_comparadas()
                    if feitas < config.teste_cego_alvo():
                        blindtest.rodar(n_pautas=2)
                    else:
                        log.info("teste cego completo: %d pautas", feitas)
                proximo["cego"] = agora + 3600 * 12

            if agora >= proximo["poda"]:
                collect.limpar_antigos()
                proximo["poda"] = agora + 3600 * 24

        except Exception:
            log.exception("erro no ciclo, seguindo")

        time.sleep(30)


def main():
    configurar_log()
    args = sys.argv[1:]
    if not args:
        return laco()

    cmd = args[0]
    if cmd == "init-db":
        db.init()
        print("esquema criado")
    elif cmd == "coletar":
        print(json.dumps(dict(zip(("novos", "vistos"),
                                  collect.coletar_tudo()))))
        print(json.dumps(dict(zip(("decod_ok", "decod_falha"),
                                  collect.decodificar_pendentes()))))
        print(json.dumps(dict(zip(("extr_ok", "extr_falha"),
                                  extract.extrair_pendentes()))))
    elif cmd == "agrupar":
        print(json.dumps(dict(zip(("fatos_novos", "anexadas"),
                                  dedupe.agrupar()))))
    elif cmd == "grade":
        print(json.dumps({"slots_criados": schedule.gerar_grade()}))
    elif cmd == "gerar":
        print(json.dumps({"batch_id": generate.enviar()}))
    elif cmd == "colher":
        print(json.dumps({"materias": generate.colher()}))
    elif cmd == "publicar":
        print(json.dumps(publish.rodada()))
    elif cmd == "status":
        print(json.dumps(status.panorama(), ensure_ascii=False, indent=2,
                         default=str))
    elif cmd == "teste-cego":
        n = int(args[1]) if len(args) > 1 else 10
        print(json.dumps(blindtest.rodar(n), ensure_ascii=False, indent=2))
    elif cmd == "revelar":
        print(json.dumps(blindtest.revelar(args[1]), ensure_ascii=False,
                         indent=2, default=str))
        print(json.dumps(blindtest.custo_medido(args[1]), ensure_ascii=False,
                         indent=2, default=str))
    elif cmd == "retomar":
        budget.retomar()
        print("pausa removida")
    elif cmd == "portais-pausados":
        p = verificacao.pausados()
        if not p:
            print("nenhum portal pausado")
        for slug, motivo in p.items():
            print("  {:<22} {}".format(slug, motivo))
    elif cmd == "retomar-portal":
        if len(args) < 2:
            print("uso: retomar-portal <slug>")
            return 1
        print("retomado" if verificacao.retomar_portal(args[1])
              else "esse portal nao estava pausado")
    elif cmd == "resumo":
        dia = None
        if len(args) > 1:
            dia = dt.date.fromisoformat(args[1])
        ok, msg = notificacao.enviar_resumo(dia, forcar=True)
        print(("resumo enviado" if ok else "nao enviado") + ": " + msg)
        return 0 if ok else 1
    elif cmd == "testar-telegram":
        ok, msg = budget.testar_telegram()
        print(("telegram OK: " if ok else "FALHOU: ") + msg)
        return 0 if ok else 1
    elif cmd == "chat-id":
        chats, msg = budget.telegram_descobrir_chat_id()
        if not chats:
            print(msg)
            return 1
        print("chats que ja falaram com o bot:")
        for c in chats:
            print("  chat_id={}  {}  ({})".format(
                c["chat_id"], c["nome"], c["tipo"]))
        print("\npor em TELEGRAM_CHAT_ID no config/motor-pautas.env")
    elif cmd == "testar-email":
        ok = budget.testar_email()
        print("e-mail enviado" if ok else
              "FALHOU: confira SMTP_HOST/SMTP_USER/SMTP_PASS no "
              "config/motor-pautas.env (o erro exato saiu no log acima)")
        return 0 if ok else 1
    elif cmd == "testar-chaves":
        from .providers import anthropic_p as ap
        from .providers import openai_p as op
        from .providers import runware as rw
        ok, info = ap.validar_chave()
        print("anthropic : {}".format(
            "OK, {} modelos visiveis".format(len(info)) if ok
            else "FALHOU: " + str(info)[:200]))
        if ok:
            for alvo in (config.modelo_geracao(), config.modelo_mecanico()):
                # models.list devolve o id DATADO de alguns modelos
                # (claude-haiku-4-5-20251001) enquanto o alias segue valido na
                # chamada. Comparar literalmente da alarme falso, entao casa
                # por prefixo e, na duvida, confirma com uma chamada real de
                # 4 tokens.
                visivel = any(i == alvo or i.startswith(alvo + "-")
                              for i in info)
                if visivel:
                    print("            {} confirmado".format(alvo))
                    continue
                try:
                    ap.chamar(alvo, ap.bloco_system("Responda: ok",
                                                    cachear=False),
                              [{"role": "user", "content": "ok"}],
                              max_tokens=8)
                    print("            {} confirmado (por chamada real; o "
                          "endpoint de modelos nao lista o alias)".format(alvo))
                except Exception as e:
                    print("            {} INDISPONIVEL: {}".format(
                        alvo, str(e)[:140]))
        if op.disponivel():
            existe, msg = op.validar_modelo(avisar=False)
            print("openai    : {} ({})".format(
                "OK" if existe else "DIVERGENTE", msg[:160]))
        else:
            print("openai    : sem OPENAI_API_KEY "
                  "(embeddings caem no fallback e o dedupe fragmenta)")
        print("runware   : {}".format(
            "chave presente" if config.env("RUNWARE_API_KEY")
            else "SEM CHAVE: toda materia ficaria como rascunho"))
        canal = config.env("MP_CANAL_ALERTA", "telegram")
        tok = config.env("TELEGRAM_BOT_TOKEN")
        chat = config.env("TELEGRAM_CHAT_ID")
        print("alertas   : canal={} | telegram token={} chat_id={}".format(
            canal, "sim" if tok else "AUSENTE",
            chat or "AUSENTE (rodar: chat-id)"))
        print("smtp      : {} (alternativa, so com MP_CANAL_ALERTA=smtp|ambos)"
              .format("configurado" if config.env("SMTP_HOST")
                      else "nao configurado"))
    else:
        print(__doc__)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
