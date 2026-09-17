'use client';

import { useState, useTransition } from 'react';
import { refreshAllWatchlist } from '@/app/actions/watchlist';

export function RefreshAllButton({ count }: { count: number }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (count === 0) return null;

  const refreshFree = () => {
    startTransition(async () => {
      const r = await refreshAllWatchlist();
      setMsg(r.ok ? { ok: true, text: r.message ?? 'OK' } : { ok: false, text: r.error ?? 'erro' });
      setTimeout(() => setMsg(null), 6000);
    });
  };

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        type="button"
        disabled={isPending}
        onClick={refreshFree}
        title="Busca cotação atual no Yahoo Finance. Gratuito."
        className="btn-primary"
      >
        {isPending ? '⏳ Atualizando…' : `↻ Atualizar cotações (${count})`}
      </button>
      {msg && (
        <span
          style={{
            fontSize: '0.82rem',
            color: msg.ok ? 'var(--primary-hex)' : '#ff6b6b',
            fontWeight: 600,
            flexBasis: '100%',
          }}
        >
          {msg.ok ? '✓ ' : '✗ '}{msg.text}
        </span>
      )}
    </div>
  );
}
