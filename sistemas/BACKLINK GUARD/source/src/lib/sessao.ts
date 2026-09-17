import { cookies } from "next/headers";
import { SESSION_COOKIE, readToken, type Sessao } from "@/lib/auth";

// Quem está usando a ferramenta agora, do lado do servidor.
//
// IMPORTANTE: esconder um botão na interface NÃO é permissão. Toda ação
// sensível precisa chamar `exigirAdmin()` dentro da própria Server Action —
// Server Actions são endpoints HTTP e podem ser chamadas direto, sem passar
// pela tela.

export async function sessaoAtual(): Promise<Sessao | null> {
  const store = await cookies();
  return readToken(store.get(SESSION_COOKIE)?.value);
}

export async function ehAdmin(): Promise<boolean> {
  return (await sessaoAtual())?.role === "admin";
}

/**
 * Barra a ação quando quem chamou não é admin. Lança — a Server Action morre
 * antes de tocar no banco ou gastar crédito.
 */
export async function exigirAdmin(oQue: string): Promise<void> {
  if (await ehAdmin()) return;
  throw new Error(
    `Sem permissão para ${oQue}. Esta ação é restrita ao administrador.`,
  );
}
