'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { removeFromWatchlist, refreshTicker } from '@/app/actions/watchlist';

export function WatchlistRowActions({ ticker }: { ticker: string }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Link
        href={`/alertas?ticker=${ticker}`}
        title={`Criar alerta de preço para ${ticker}`}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          padding: '2px 6px',
          fontSize: '0.95rem',
          textDecoration: 'none',
        }}
      >
        🎯
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const fd = new FormData();
            fd.set('ticker', ticker);
            const r = await refreshTicker(fd);
            setMsg(r.ok ? { ok: true, text: '✓ Enfileirado' } : { ok: false, text: r.error ?? 'erro' });
            setTimeout(() => setMsg(null), 4000);
          })
        }
        style={{
          background: 'var(--card-hover)',
          border: '1px solid var(--border-accent)',
          color: 'var(--primary-hex)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {isPending ? '…' : '↻ Atualizar'}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm(`Remover ${ticker} da watchlist?`)) return;
          startTransition(async () => {
            const fd = new FormData();
            fd.set('ticker', ticker);
            await removeFromWatchlist(fd);
          });
        }}
        style={{
          background: 'transparent',
          border: '1px solid var(--border-hex)',
          color: 'var(--text-muted)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '0.75rem',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
      {msg && (
        <span
          style={{
            fontSize: '0.7rem',
            color: msg.ok ? 'var(--primary-hex)' : '#ff6b6b',
          }}
        >
          {msg.text}
        </span>
      )}
    </div>
  );
}
