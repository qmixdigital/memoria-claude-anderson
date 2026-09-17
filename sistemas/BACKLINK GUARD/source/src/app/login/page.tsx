import type { Metadata } from "next";
import { loginAction } from "./actions";

export const metadata: Metadata = { title: "Entrar — BacklinkGuard" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050a0f] bg-[radial-gradient(48rem_34rem_at_50%_-10%,rgba(0,255,102,0.12),transparent_60%)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/images/logomarca-qmix-branca.webp"
            alt="QMIX Digital"
            width={150}
            height={38}
            className="mb-4 h-10 w-auto"
          />
          <h1 className="font-display text-xl font-bold text-[#e7f1ff]">BacklinkGuard</h1>
          <p className="mt-1 text-sm text-[#8899aa]">Monitor de Backlinks · QMIX Digital</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Acesso restrito
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-200">
            Entre com seu usuário e senha.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300">
              {error === "rate"
                ? "Muitas tentativas. Aguarde alguns minutos e tente de novo."
                : "Usuário ou senha incorretos. Tente novamente."}
            </div>
          )}

          <form action={loginAction} className="mt-5 space-y-4">
            <input type="hidden" name="next" value={next ?? "/"} />
            <div>
              <label
                htmlFor="usuario"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200"
              >
                Usuário
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                placeholder="seu.usuario"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-[#03101e] shadow-sm transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/40"
            >
              Entrar
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Ferramenta interna de monitoramento de backlinks
        </p>
      </div>
    </div>
  );
}
