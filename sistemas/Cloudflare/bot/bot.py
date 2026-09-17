"""
Bot Telegram para gerenciar redirects Cloudflare em massa.

Mexe APENAS em regras cross-domain (preserva raiz<->www, WAF, paths internos).
Autenticação por chat_id (whitelist em config.json).

Comandos:
  /start            - help
  /status           - quantos domínios estão redirecionando e pra onde
  /destino <url>    - redireciona TODOS para a URL
  /whatsapp         - atalho WhatsApp pré-formatado
  /desativar        - desativa regras (mantém configurações)
  /ativar           - reativa regras desativadas
  /desfazer         - DELETA todas as regras cross-domain
  /aleatorio N <url>- sorteia N domínios e redireciona para URL
"""
import json
import logging
import os
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

import cf_operations as cf

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(message)s",
    level=logging.INFO,
)
log = logging.getLogger(__name__)

DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG = json.load(open(os.path.join(DIR, "config.json"), encoding="utf-8"))
BOT_TOKEN = CONFIG["bot_token"]
AUTHORIZED_CHATS = set(CONFIG.get("authorized_chats", []))

WHATSAPP_DEFAULT = (
    "https://api.whatsapp.com/send/?phone=5511925206392"
    "&text=estava+no+site+e+gostaria+de+mais+informa%C3%A7%C3%B5es"
    "&type=phone_number&app_absent=0"
)


def _autorizado(update: Update) -> bool:
    chat_id = update.effective_chat.id
    if chat_id in AUTHORIZED_CHATS:
        return True
    log.warning(f"Acesso negado para chat_id={chat_id}")
    return False


async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    msg = (
        "🤖 *Bot Cloudflare Redirects*\n\n"
        "Comandos disponíveis:\n\n"
        "📊 `/status` — quantos domínios estão redirecionando agora\n\n"
        "🎯 `/destino <url>` — redireciona TODOS para a URL\n"
        "    Ex: `/destino https://exemplo.com/`\n\n"
        "📱 `/whatsapp` — atalho para WhatsApp pré-formatado\n\n"
        "⏸ `/desativar` — pausa as regras (mantém config)\n"
        "▶️ `/ativar` — reativa regras pausadas\n"
        "🗑 `/desfazer` — DELETA todas as regras\n\n"
        "🎲 `/aleatorio <N> <url>` — sorteia N domínios e redireciona\n"
        "    Ex: `/aleatorio 30 https://exemplo.com/`\n\n"
        "⚠️ Só mexe em redirects de domínio inteiro.\n"
        "✅ Regras raiz↔www, paths internos e WAF NÃO são tocadas."
    )
    await update.message.reply_text(msg, parse_mode="Markdown")


async def cmd_status(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    await update.message.reply_text("🔍 Verificando…")
    try:
        ativos, destinos, total = cf.status()
        if ativos == 0:
            await update.message.reply_text(
                f"💤 Nenhum redirect cross-domain ativo.\nTotal na lista: *{total}* domínios.",
                parse_mode="Markdown",
            )
            return
        msg = f"📊 *Status atual*\n\n"
        msg += f"✅ {ativos} de {total} domínios redirecionando\n\n*Destinos:*\n"
        for dest, qty in sorted(destinos.items(), key=lambda x: -x[1]):
            msg += f"  • `{dest}` — {qty}\n"
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"❌ Erro: {e}")


async def cmd_destino(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    if not ctx.args:
        await update.message.reply_text("Uso: `/destino https://exemplo.com/`", parse_mode="Markdown")
        return
    url = ctx.args[0]
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    await update.message.reply_text(f"🔄 Criando redirects para `{url}`…", parse_mode="Markdown")
    try:
        ok, falhas, lista_falhas = cf.criar_redirect(url, preservar_path=True)
        msg = f"✅ {ok} redirects criados\n"
        if falhas:
            msg += f"❌ {falhas} falhas"
        await update.message.reply_text(msg)
    except Exception as e:
        await update.message.reply_text(f"❌ Erro: {e}")


async def cmd_whatsapp(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    await update.message.reply_text("📱 Redirecionando todos para WhatsApp…")
    try:
        ok, falhas, _ = cf.criar_redirect(WHATSAPP_DEFAULT, preservar_path=False)
        msg = f"✅ {ok} redirects → WhatsApp"
        if falhas:
            msg += f"\n❌ {falhas} falhas"
        await update.message.reply_text(msg)
    except Exception as e:
        await update.message.reply_text(f"❌ Erro: {e}")


async def cmd_desativar(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    await update.message.reply_text("⏸ Desativando regras cross-domain…")
    try:
        qty = cf.desativar()
        await update.message.reply_text(f"⏸ {qty} regras desativadas. Use /ativar para retomar.")
    except Exception as e:
        await update.message.reply_text(f"❌ Erro: {e}")


async def cmd_ativar(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    await update.message.reply_text("▶️ Reativando regras…")
    try:
        qty = cf.ativar()
        await update.message.reply_text(f"▶️ {qty} regras reativadas.")
    except Exception as e:
        await update.message.reply_text(f"❌ Erro: {e}")


async def cmd_desfazer(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    await update.message.reply_text("🗑 Deletando regras cross-domain…")
    try:
        qty = cf.desfazer()
        await update.message.reply_text(f"🗑 {qty} regras deletadas. Domínios livres.")
    except Exception as e:
        await update.message.reply_text(f"❌ Erro: {e}")


async def cmd_aleatorio(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    if len(ctx.args) < 2:
        await update.message.reply_text("Uso: `/aleatorio 30 https://exemplo.com/`", parse_mode="Markdown")
        return
    try:
        qty = int(ctx.args[0])
    except ValueError:
        await update.message.reply_text("Quantidade inválida.")
        return
    url = ctx.args[1]
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    await update.message.reply_text(f"🎲 Sorteando {qty} → `{url}`…", parse_mode="Markdown")
    try:
        ok, falhas = cf.criar_aleatorio(qty, url)
        msg = f"🎲 {ok} redirects criados aleatoriamente"
        if falhas:
            msg += f"\n❌ {falhas} falhas"
        await update.message.reply_text(msg)
    except Exception as e:
        await update.message.reply_text(f"❌ Erro: {e}")


async def cmd_unknown(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not _autorizado(update):
        return
    await update.message.reply_text("Comando não reconhecido. Use /start para ver os comandos.")


def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_start))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(CommandHandler("destino", cmd_destino))
    app.add_handler(CommandHandler("whatsapp", cmd_whatsapp))
    app.add_handler(CommandHandler("desativar", cmd_desativar))
    app.add_handler(CommandHandler("ativar", cmd_ativar))
    app.add_handler(CommandHandler("desfazer", cmd_desfazer))
    app.add_handler(CommandHandler("aleatorio", cmd_aleatorio))
    app.add_handler(MessageHandler(filters.COMMAND, cmd_unknown))
    log.info("Bot iniciado. Aguardando comandos…")
    app.run_polling()


if __name__ == "__main__":
    main()
