'use client';

import { useState, useTransition } from 'react';
import { refreshPlatform } from '@/app/actions/refresh-platform';

export function RefreshPlatformButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const click = () => {
    startTransition(async () => {
      const r = await refreshPlatform();
      setStatus(r.ok ? { ok: true, msg: r.message ?? 'OK' } : { ok: false, msg: r.error ?? 'erro' });
      setTimeout(() => setStatus(null), 8000);
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={click}
        disabled={isPending}
        title="Atualiza as cotações de toda a carteira e watchlist"
        style={{
          background: 'transparent',
          border: '1px solid var(--border-accent)',
          color: 'var(--primary-hex)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.78rem',
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          cursor: isPending ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.15s',
        }}
      >
        <span style={{
          display: 'inline-block',
          animation: isPending ? 'spin 1s linear infinite' : 'none',
        }}>
          ↻
        </span>
        {isPending ? 'Atualizando…' : 'Atualizar tudo'}
      </button>
      {status && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 200,
            minWidth: '320px',
            maxWidth: '420px',
            padding: '12px 16px',
            background: 'var(--bg-alt)',
            border: `1px solid ${status.ok ? 'var(--border-accent)' : '#ff6b6b40'}`,
            borderRadius: 'var(--radius)',
            color: status.ok ? 'var(--primary-hex)' : '#ff6b6b',
            fontSize: '0.82rem',
            boxShadow: 'var(--shadow), var(--glow)',
          }}
        >
          {status.ok ? '✓ ' : '✗ '}
          {status.msg}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
