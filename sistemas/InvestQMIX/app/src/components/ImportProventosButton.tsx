'use client';

import { useState, useTransition } from 'react';
import { importProventos, type ProventosImportResult } from '@/app/actions/proventos';

export function ImportProventosButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'transparent',
          border: '1px solid var(--border-accent)',
          color: 'var(--primary-hex)',
          borderRadius: 'var(--radius)',
          padding: '8px 14px',
          fontSize: '0.82rem',
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          cursor: 'pointer',
        }}
      >
        📥 Importar XLSX da B3
      </button>
    );
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200 }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius)', padding: '24px', width: '100%', maxWidth: '560px',
          boxShadow: 'var(--shadow), var(--glow)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
              📥 Importar proventos
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Calendário de Eventos da B3 (XLSX)
            </p>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <details style={{ marginBottom: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--primary-hex)' }}>Como obter</summary>
          <ol style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
            <li><a href="https://www.investidor.b3.com.br" target="_blank" rel="noopener">investidor.b3.com.br</a></li>
            <li>Menu <strong>Eventos</strong> → <strong>Calendário de Eventos</strong></li>
            <li>Botão <strong>Exportar XLSX</strong></li>
          </ol>
        </details>

        <form
          action={(fd) =>
            startTransition(async () => {
              fd.set('dryRun', '0');
              const r: ProventosImportResult = await importProventos(fd);
              setStatus(r.error
                ? { ok: false, msg: r.error }
                : { ok: true, msg: `${r.inserted ?? 0} novo(s), ${r.skipped ?? 0} já existiam` });
              if (!r.error) setTimeout(() => { setOpen(false); setStatus(null); }, 2500);
            })
          }
        >
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls"
            required
            style={{ width: '100%', padding: '10px', background: 'var(--card)',
              border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)',
              color: 'var(--foreground-hex)', fontSize: '0.85rem', marginBottom: '12px' }}
          />
          <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%' }}>
            {isPending ? 'Importando…' : '✓ Importar'}
          </button>
        </form>

        {status && (
          <div style={{ marginTop: '12px', padding: '10px 14px',
            background: status.ok ? '#00ff661a' : '#ff6b6b1a',
            border: `1px solid ${status.ok ? '#00ff6633' : '#ff6b6b40'}`,
            borderRadius: 'var(--radius)', color: status.ok ? 'var(--primary-hex)' : '#ff6b6b',
            fontSize: '0.85rem' }}>
            {status.ok ? '✓ ' : '✗ '}{status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
