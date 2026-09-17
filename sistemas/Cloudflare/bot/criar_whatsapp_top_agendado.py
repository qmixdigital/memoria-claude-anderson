"""
Cria redirects cross-domain em todas as zonas do funnel para
https://cliquex.click/whatsapp-top e envia mensagem ao chat autorizado.
Usado com `at` para agendamento.
"""
import json
import os
import sys
import requests
import cf_operations as cf

DIR = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.path.join(DIR, "config.json"), encoding="utf-8"))
TOKEN = cfg["bot_token"]
CHATS = cfg["authorized_chats"]

DEST = "https://cliquex.click/whatsapp-top"


def send(chat_id, text):
    try:
        requests.post(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=30,
        )
    except Exception as e:
        print(f"send erro: {e}", file=sys.stderr)


def main():
    for chat in CHATS:
        send(chat, f"⏰ *Agendamento disparado*\n\nCriando redirects → `{DEST}`…")

    try:
        ok, falhas, _ = cf.criar_redirect(DEST, preservar_path=False)
        for chat in CHATS:
            send(
                chat,
                f"✅ *Agendamento concluído*\n\n"
                f"🎯 Destino: `{DEST}`\n"
                f"✅ {ok} redirects criados\n"
                + (f"❌ {falhas} falhas\n" if falhas else ""),
            )
    except Exception as e:
        for chat in CHATS:
            send(chat, f"❌ *Erro no agendamento*\n\n{e}")


if __name__ == "__main__":
    main()
