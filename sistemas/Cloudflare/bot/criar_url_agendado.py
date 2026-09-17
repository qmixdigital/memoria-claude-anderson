"""
Cria redirects em todas as zonas do funnel para uma URL passada via argv.
Uso: python3 criar_url_agendado.py https://exemplo.com/
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
    if len(sys.argv) < 2:
        print("Uso: python3 criar_url_agendado.py <URL>", file=sys.stderr)
        sys.exit(1)
    dest = sys.argv[1]

    for chat in CHATS:
        send(chat, f"⏰ *Agendamento disparado*\n\nCriando redirects → `{dest}`…")

    try:
        ok, falhas, _ = cf.criar_redirect(dest, preservar_path=False)
        for chat in CHATS:
            send(
                chat,
                f"✅ *Agendamento concluído*\n\n"
                f"🎯 Destino: `{dest}`\n"
                f"✅ {ok} redirects criados\n"
                + (f"❌ {falhas} falhas\n" if falhas else ""),
            )
    except Exception as e:
        for chat in CHATS:
            send(chat, f"❌ *Erro no agendamento*\n\n{e}")


if __name__ == "__main__":
    main()
