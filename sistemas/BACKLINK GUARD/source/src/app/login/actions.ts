"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  appPassword,
  issueToken,
  sessionCookieOptions,
  timingSafeEqual,
} from "@/lib/auth";
import { autenticar } from "@/lib/usuarios";
import { hit, reset } from "@/lib/ratelimit";

// Máx. 8 tentativas por IP a cada 10 minutos.
const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function loginAction(formData: FormData): Promise<void> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/") || "/";

  const ip = await clientIp();
  const gate = hit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!gate.ok) {
    redirect(`/login?error=rate&next=${encodeURIComponent(next)}`);
  }

  let sessao: { userId: string; role: string; name: string } | null = null;

  if (usuario) {
    const u = await autenticar(usuario, password);
    if (u) sessao = { userId: u.id, role: u.role, name: u.name };
  }

  // Acesso de emergência pela senha do .env, sempre como admin. Existe para não
  // trancar o dono do lado de fora se o banco de usuários falhar.
  //
  // Vale mesmo com algo digitado no campo Usuário: o navegador preenche e-mail
  // ali sozinho, e antes isso derrubava o login sem explicar por quê. Quem sabe
  // a APP_PASSWORD já é administrador — exigir o campo vazio não protegia nada,
  // só criava uma armadilha.
  if (!sessao) {
    const esperada = appPassword();
    if (esperada && timingSafeEqual(password, esperada)) {
      sessao = { userId: "env", role: "admin", name: "Administrador" };
    }
  }

  if (!sessao) {
    // atrasa a resposta de falha pra frear brute-force automatizado
    await new Promise((r) => setTimeout(r, 400));
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  reset(`login:${ip}`); // sucesso: limpa o contador do IP
  const store = await cookies();
  store.set(SESSION_COOKIE, await issueToken(sessao), sessionCookieOptions);

  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
