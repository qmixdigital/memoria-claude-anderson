// Configuracao central lida do ambiente. Falha cedo se algo essencial faltar.

function req(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }
  return v.trim();
}

export const config = {
  port: Number(process.env.PORT ?? 3100),
  publicUrl: (process.env.PUBLIC_URL ?? "http://localhost:3100").replace(/\/$/, ""),
  masterKey: req("MASTER_KEY"),
  imageMaxMb: Number(process.env.IMAGE_MAX_MB ?? 8),
  rateLimitPostsHora: Number(process.env.RATE_LIMIT_POSTS_HORA ?? 10),
  // OAUTH_USERS=anderson:senha1,katia:senha2
  oauthUsers: parseUsers(process.env.OAUTH_USERS ?? ""),
};

function parseUsers(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const par of raw.split(",")) {
    const t = par.trim();
    if (!t) continue;
    const i = t.indexOf(":");
    if (i < 0) continue;
    const user = t.slice(0, i).trim();
    const pass = t.slice(i + 1).trim();
    if (user && pass) map.set(user, pass);
  }
  return map;
}
