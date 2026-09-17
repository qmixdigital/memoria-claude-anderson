"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getPaidIndexationEstimateAction,
  startPaidIndexationAction,
} from "@/app/actions";

export function PaidIndexationButton() {
  const [est, setEst] = useState<{
    count: number;
    usd: number;
    perCheck: number;
    balance: number | null;
  } | null>(null);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  useEffect(() => {
    getPaidIndexationEstimateAction().then(setEst);
  }, []);

  if (!est || est.count === 0) return null;

  const overBalance = est.balance !== null && est.usd > est.balance;

  return (
    <button
      disabled={pending || done}
      onClick={() => {
        const msg =
          `Verificar indexação de ${est.count} backlinks em sites de TERCEIROS via DataForSEO (pago).\n\n` +
          `Preço por consulta: US$ ${est.perCheck.toFixed(3)}\n` +
          `Custo estimado: ~US$ ${est.usd.toFixed(2)}\n` +
          `Saldo atual: US$ ${est.balance?.toFixed(2) ?? "?"}\n\n` +
          (overBalance
            ? "⚠️ O custo estimado é MAIOR que o saldo — vai até o saldo acabar.\n\n"
            : "") +
          "Confirmar e gastar?";
        if (confirm(msg)) {
          start(async () => {
            await startPaidIndexationAction();
            setDone(true);
          });
        }
      }}
      className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-60 dark:text-amber-300"
      title="Consulta paga (DataForSEO) da indexação nos sites de terceiros"
    >
      💲 Indexação terceiros (~US$ {est.usd.toFixed(2)})
    </button>
  );
}
