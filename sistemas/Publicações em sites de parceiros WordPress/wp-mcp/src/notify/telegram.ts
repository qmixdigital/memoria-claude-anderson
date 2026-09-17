// Notificacao no Telegram a cada publicacao. Fire-and-forget: nunca quebra o
// fluxo de publicacao se o Telegram falhar.
const TOKEN = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
const CHAT_ID = (process.env.TELEGRAM_CHAT_ID ?? "").trim();

export function telegramAtivo(): boolean {
  return TOKEN !== "" && CHAT_ID !== "";
}

function esc(s: string): string {
  // HTML parse mode: escapar apenas < > &
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface NotificacaoPost {
  portalNome: string;
  titulo: string;
  status: string;
  link: string;
  linkEdicao: string;
  usuario?: string;
  acao: "criado" | "atualizado";
}

export async function notificarPublicacao(n: NotificacaoPost): Promise<void> {
  if (!telegramAtivo()) return;
  try {
    // Sufixo de status so quando NAO for publicacao ao vivo, para diferenciar
    // rascunho/agendado. Publicado ao vivo nao leva sufixo (o caso normal).
    const statusTag =
      n.status === "publish"
        ? ""
        : n.status === "future"
          ? " (agendado 🕒)"
          : n.status === "draft"
            ? " (rascunho 📝)"
            : ` (${n.status})`;

    const verbo = n.acao === "atualizado" ? "atualizou" : "publicou";

    // Cabecalho com identidade propria do MCP (robo + "MCP"), distinto das
    // notificacoes do outro sistema ("<nome> publicou em ...").
    const linhas = [
      `🤖 <b>MCP</b> ${verbo} em <b>${esc(n.portalNome)}</b>${statusTag}`,
      `${esc(n.titulo)}`,
      `🔗 ${esc(n.link)}`,
      `✏️ <a href="${esc(n.linkEdicao)}">editar</a>`,
    ];
    if (n.usuario) linhas.push(`· por ${esc(n.usuario)}`);

    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: linhas.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
  } catch (e) {
    console.error("Falha ao notificar Telegram:", e instanceof Error ? e.message : e);
  }
}
