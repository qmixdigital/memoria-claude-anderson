/**
 * Baixa a carteira em CSV. É um link comum (não botão com ação) porque o
 * download vem de uma rota que devolve o arquivo com Content-Disposition —
 * ver src/app/export/route.ts.
 */
export function ExportarCsv({ href, rotulo }: { href: string; rotulo: string }) {
  return (
    <a
      href={href}
      title="Baixar a lista completa com o resultado dos 3 checks (abre no Excel)"
      className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M12 3v12" />
        <path d="m7 12 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      {rotulo}
    </a>
  );
}
