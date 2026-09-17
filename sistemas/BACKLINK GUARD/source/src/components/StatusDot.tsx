/**
 * Semáforo de um check.
 *
 * Três estados, e o terceiro NÃO é "não":
 *   true  -> Sim      (verde)
 *   false -> Não      (vermelho)
 *   null  -> Conferir (âmbar) — não foi possível verificar / não consultamos
 *
 * O null era cinza claro com um traço: sumia na tela e não dizia o que fazer.
 * Virou âmbar com "Conferir" porque é um convite à ação sem afirmar nada falso.
 * Pintar de vermelho diria "não indexado" quando ninguém chegou a perguntar ao
 * Google — foi esse tipo de afirmação sem base que zerou o painel antes.
 */
export function StatusDot({
  value,
  label,
  origem,
  inaplicavel,
}: {
  value: boolean | null | undefined;
  label: string;
  /** "manual" desenha a marca de conferido à mão */
  origem?: "auto" | "manual";
  /** a pergunta perdeu o sentido (ex.: artigo apagado) — cinza, não âmbar */
  inaplicavel?: boolean;
}) {
  if (inaplicavel) {
    return (
      <span
        title={`${label} — o artigo foi removido, então a pergunta não se aplica.`}
        className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100/70 px-2 py-0.5 text-xs font-semibold text-neutral-500 ring-1 ring-inset ring-neutral-400/20 dark:bg-white/[0.04] dark:text-neutral-400"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
        —
      </span>
    );
  }
  const cfg =
    value === true
      ? {
          dot: "bg-emerald-500",
          ring: "ring-emerald-500/30",
          text: "text-emerald-700 dark:text-emerald-300",
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          label: "Sim",
        }
      : value === false
        ? {
            dot: "bg-rose-500",
            ring: "ring-rose-500/30",
            text: "text-rose-700 dark:text-rose-300",
            bg: "bg-rose-50 dark:bg-rose-500/10",
            label: "Não",
          }
        : {
            dot: "bg-amber-500",
            ring: "ring-amber-500/30",
            text: "text-amber-700 dark:text-amber-300",
            bg: "bg-amber-50 dark:bg-amber-500/10",
            label: "Conferir",
          };

  const titulo =
    origem === "manual"
      ? `${label} — conferido manualmente por você`
      : value === null || value === undefined
        ? `${label} — não deu para verificar automaticamente. Confira e ajuste.`
        : label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${cfg.bg} ${cfg.ring} ${cfg.text}`}
      title={titulo}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {origem === "manual" && <span aria-hidden>✎</span>}
    </span>
  );
}
