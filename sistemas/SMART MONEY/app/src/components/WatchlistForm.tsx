'use client';

import { useState, useTransition } from 'react';
import { addToWatchlist } from '@/app/actions/watchlist';

export function WatchlistForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(null);

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-alt)',
    border: '1px solid var(--border-hex)',
    borderRadius: 'var(--radius)',
    color: 'var(--foreground-hex)',
    padding: '10px 14px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  };

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await addToWatchlist(formData);
          if (result.error) setStatus({ ok: false, msg: result.error });
          else {
            setStatus({ ok: true, msg: result.message ?? 'Adicionado' });
            const form = document.getElementById('watchlist-form') as HTMLFormElement | null;
            form?.reset();
          }
          setTimeout(() => setStatus(null), 5000);
        })
      }
      id="watchlist-form"
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 160px 1fr auto',
        gap: '10px',
        alignItems: 'flex-start',
      }}
    >
      <input
        name="ticker"
        placeholder="Ticker (PETR4)"
        required
        maxLength={6}
        style={{ ...inputStyle, textTransform: 'uppercase' }}
      />
      <input
        name="purchasePrice"
        placeholder="Preço compra (R$)"
        inputMode="decimal"
        title="Opcional — se não informado, fica em branco"
        style={inputStyle}
      />
      <input
        name="notes"
        placeholder="Anotação (opcional) — ex: tese long, alvo R$ 35"
        maxLength={500}
        style={inputStyle}
      />
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
        style={{ minWidth: '140px' }}
      >
        {isPending ? 'Adicionando…' : '+ Adicionar'}
      </button>
      {status && (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            background: status.ok ? '#00ff661a' : '#ff6b6b1a',
            border: `1px solid ${status.ok ? '#00ff6633' : '#ff6b6b40'}`,
            color: status.ok ? 'var(--primary-hex)' : '#ff6b6b',
            fontSize: '0.85rem',
          }}
        >
          {status.ok ? '✓ ' : '✗ '}
          {status.msg}
        </div>
      )}
    </form>
  );
}
