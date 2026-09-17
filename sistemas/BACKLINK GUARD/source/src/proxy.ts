import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, readToken } from "@/lib/auth";

// Impede o Cloudflare de cachear páginas autenticadas: no-store + Set-Cookie
// (o CF não cacheia respostas com Set-Cookie, mesmo com "cache everything").
function noStore(res: NextResponse): NextResponse {
  res.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate",
  );
  res.headers.set("CDN-Cache-Control", "no-store");
  res.cookies.set("bg_nc", "1", { path: "/", sameSite: "lax" });
  return res;
}

// Protege todas as rotas: sem sessão válida -> redireciona para /login.
// (No Next 16 o antigo "middleware" chama-se "proxy".)
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await readToken(token)) {
    return noStore(NextResponse.next());
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return noStore(NextResponse.redirect(url));
}

export const config = {
  // Roda em tudo, menos: a própria /login, assets do Next, manifest e estáticos.
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|css|js|woff2?|ttf|webmanifest)$).*)"],
};
