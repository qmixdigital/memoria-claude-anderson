import type { Metadata, Viewport } from "next";
import { Open_Sans, Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { logoutAction } from "./login/actions";
import { sessaoAtual } from "@/lib/sessao";

// Fontes da identidade QMIX: Open Sans (corpo) + Montserrat (display/títulos).
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BacklinkGuard — QMIX",
  description:
    "Monitoramento de backlinks: artigo publicado, link do cliente presente e indexação no Google.",
};

// Barra do navegador na cor de fundo QMIX.
export const viewport: Viewport = {
  themeColor: "#050a0f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessao = await sessaoAtual();
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className={`${openSans.variable} ${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[#050a0f]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-6 h-16">
            <a href="/" className="group flex items-center gap-3">
              {/* Logo branca oficial da QMIX */}
              <img
                src="/images/logomarca-qmix-branca.webp"
                alt="QMIX Digital"
                width={132}
                height={34}
                className="h-8 w-auto"
              />
              <span className="hidden sm:flex flex-col leading-none border-l border-white/10 pl-3">
                <span className="font-display text-[15px] font-bold tracking-tight text-[#e7f1ff]">
                  BacklinkGuard
                </span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00ff66]">
                  Monitor de Backlinks
                </span>
              </span>
            </a>
            <nav className="ml-6 hidden items-center gap-1 sm:flex">
              <a
                href="/"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#8899aa] transition hover:bg-white/[0.06] hover:text-[#e7f1ff]"
              >
                Painel
              </a>
              <a
                href="/dominios"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#8899aa] transition hover:bg-white/[0.06] hover:text-[#e7f1ff]"
              >
                Domínios
              </a>
              <a
                href="/custos"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#8899aa] transition hover:bg-white/[0.06] hover:text-[#e7f1ff]"
              >
                Custos
              </a>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {sessao && (
                <span className="hidden text-xs text-[#8899aa] sm:inline">
                  {sessao.name}
                  {sessao.role !== "admin" && (
                    <span className="ml-1 rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      auxiliar
                    </span>
                  )}
                </span>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs font-medium text-[#8899aa] transition hover:border-[#00ff66]/40 hover:text-[#e7f1ff]"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] flex-1 px-6 py-5">
          {children}
        </main>
        <footer className="border-t border-[rgba(255,255,255,0.05)] py-5 text-center text-xs text-[#8899aa]">
          BacklinkGuard · monitoramento de backlinks ·{" "}
          <span className="text-[#00ff66]">QMIX Digital</span>
        </footer>
      </body>
    </html>
  );
}
