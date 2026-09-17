'use client';

import { useState, useTransition } from 'react';
import { importWatchlist, type ImportResult } from '@/app/actions/watchlist';

interface PreviewRow {
  ticker: string;
  quantity: number | null;
  avgPrice: number | null;
  alreadyInWatchlist: boolean;
}

export function ImportWatchlistButton() {
  const [open, setOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setPreview(null);
    setError(null);
    setSuccess(null);
    setPasted('');
  };

  const submit = (formData: FormData, dryRun: boolean) => {
    formData.set('dryRun', dryRun ? '1' : '0');
    if (pasted) formData.set('pasted', pasted);
    startTransition(async () => {
      const result: ImportResult = await importWatchlist(formData);
      if (result.error) {
        setError(result.error);
        setPreview(null);
      } else if (dryRun) {
        setError(null);
        setPreview(result.preview ?? []);
      } else {
        setError(null);
        setPreview(null);
        setSuccess(result.message ?? 'Importado');
        setTimeout(() => {
          setOpen(false);
          reset();
        }, 2500);
      }
    });
  };

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
        📥 Importar carteira
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 200,
      }}
      onClick={() => { setOpen(false); reset(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-alt)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow), var(--glow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px', fontFamily: 'Montserrat, sans-serif' }}>
              📥 Importar carteira
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              XLSX da B3 (Posição em Custódia) ou TSV/CSV simples
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setOpen(false); reset(); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem' }}
          >
            ✕
          </button>
        </div>

        <details style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--primary-hex)' }}>Como obter o XLSX da B3?</summary>
          <ol style={{ margin: '10px 0 0 16px', padding: 0, lineHeight: 1.7 }}>
            <li>Acesse <a href="https://www.investidor.b3.com.br" target="_blank" rel="noopener">investidor.b3.com.br</a> com seu CPF e senha</li>
            <li>Menu <strong>Extrato</strong> → <strong>Posição em Custódia</strong></li>
            <li>Selecione a data de referência → <strong>Exportar XLSX</strong></li>
            <li>Faça upload do arquivo aqui — só ticker e quantidade serão importados (B3 não disponibiliza preço médio)</li>
          </ol>
          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong>Alternativa:</strong> cole abaixo um TSV/CSV no formato <code>TICKER;QTD;PRECO_MEDIO</code> (uma por linha). Ex: <code>PETR4;100;28,50</code>
          </p>
        </details>

        {!preview && (
          <form
            action={(formData) => submit(formData, true)}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
                Arquivo (XLSX, CSV, TSV)
              </label>
              <input
                type="file"
                name="file"
                accept=".xlsx,.xls,.csv,.tsv,.txt"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--card)',
                  border: '1px solid var(--border-hex)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground-hex)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>— OU —</div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
                Colar conteúdo (TSV/CSV)
              </label>
              <textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder="PETR4;100;28,50&#10;VALE3;50;65,30&#10;TEND3;200&#10;..."
                rows={6}
                style={{
                  width: '100%',
                  background: 'var(--card)',
                  border: '1px solid var(--border-hex)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground-hex)',
                  padding: '10px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
              style={{ alignSelf: 'flex-start' }}
            >
              {isPending ? 'Analisando…' : '🔍 Pré-visualizar'}
            </button>
          </form>
        )}

        {error && (
          <div style={{
            marginTop: '14px',
            padding: '12px 14px',
            background: '#ff6b6b1a',
            border: '1px solid #ff6b6b40',
            borderRadius: 'var(--radius)',
            color: '#ff6b6b',
            fontSize: '0.85rem',
          }}>
            ✗ {error}
          </div>
        )}

        {success && (
          <div style={{
            marginTop: '14px',
            padding: '12px 14px',
            background: '#00ff661a',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius)',
            color: 'var(--primary-hex)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}>
            ✓ {success}
          </div>
        )}

        {preview && preview.length > 0 && !success && (
          <>
            <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--primary-hex)' }}>{preview.length}</strong> ticker(s) detectados ·{' '}
              {preview.filter((p) => !p.alreadyInWatchlist).length} novos ·{' '}
              {preview.filter((p) => p.alreadyInWatchlist).length} já na watchlist
            </div>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid var(--border-hex)',
              borderRadius: 'var(--radius)',
              background: 'var(--card)',
              marginBottom: '14px',
            }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Qtd</th>
                    <th>Preço médio</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p) => (
                    <tr key={p.ticker}>
                      <td style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{p.ticker}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {p.quantity !== null ? p.quantity.toLocaleString('pt-BR') : '—'}
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {p.avgPrice !== null ? `R$ ${p.avgPrice.toFixed(2)}` : '—'}
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>
                        {p.alreadyInWatchlist
                          ? <span style={{ color: 'var(--text-muted)' }}>★ já existe (atualizar preço)</span>
                          : <span style={{ color: 'var(--primary-hex)', fontWeight: 600 }}>+ novo</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-hex)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius)',
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <form
                action={(fd) => {
                  const transferred = new FormData();
                  // re-attach file from original form if possible
                  const fileInput = document.querySelector<HTMLInputElement>('input[type=file][name=file]');
                  if (fileInput?.files?.[0]) transferred.set('file', fileInput.files[0]);
                  if (pasted) transferred.set('pasted', pasted);
                  void fd; // unused — we built our own
                  submit(transferred, false);
                }}
              >
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                >
                  {isPending ? 'Importando…' : `✓ Confirmar import (${preview.length})`}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
