'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { createPriceAlert, deletePriceAlert, toggleAlertActive } from '@/app/actions/price-alerts';
import type { PriceAlertRow } from '@/lib/queries/price-alerts';

function fmtBRL(v: number | null) {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(v);
}
function fmtPct(v: number | null) {
  if (v === null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}
function fmtDateTime(d: Date | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(d));
}

export function PriceAlertsManager({ rows, defaultTicker }: { rows: PriceAlertRow[]; defaultTicker?: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(null);
  const [showForm, setShowForm] = useState(!!defaultTicker);

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const r = await createPriceAlert(formData);
      if (r.error) {
        setStatus({ ok: false, msg: r.error });
      } else {
        setStatus({ ok: true, msg: r.message ?? 'Criado' });
        const form = document.getElementById('alert-form') as HTMLFormElement | null;
        form?.reset();
      }
      setTimeout(() => setStatus(null), 5000);
    });
  };

  const remove = (id: number) => {
    if (!confirm('Deletar este alerta?')) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', String(id));
      await deletePriceAlert(fd);
    });
  };

  const reactivate = (id: number) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', String(id));
      await toggleAlertActive(fd);
    });
  };

  const active = rows.filter((r) => r.active);
  const triggered = rows.filter((r) => !r.active && r.triggeredAt !== null);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1rem', margin: 0, fontFamily: 'var(--font-montserrat), Montserrat', fontWeight: 700 }}>
          Alertas ativos · {active.length}
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            + Novo alerta
          </button>
        )}
      </div>

      {showForm && (
        <form
          id="alert-form"
          action={submit}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius)',
            padding: '16px 18px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow), var(--glow)',
            display: 'grid',
            gridTemplateColumns: '120px 160px 140px 1fr auto auto',
            gap: '10px',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
              Ticker
            </label>
            <input
              name="ticker"
              required
              defaultValue={defaultTicker ?? ''}
              placeholder="PETR4"
              maxLength={6}
              style={{ width: '100%', textTransform: 'uppercase' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
              Tipo
            </label>
            <select name="kind" required defaultValue="target_high" style={{ width: '100%' }}>
              <option value="target_high">🎯 Alvo de venda (≥)</option>
              <option value="stop_loss">🛑 Stop-loss (≤)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
              Preço alvo
            </label>
            <input
              name="targetPrice"
              required
              placeholder="35,00"
              inputMode="decimal"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
              Anotação (opcional)
            </label>
            <input name="notes" placeholder="ex: realizar lucro 30%" maxLength={200} style={{ width: '100%' }} />
          </div>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? '…' : '+ Criar'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            style={{ background: 'transparent', border: '1px solid var(--border-hex)', color: 'var(--text-muted)', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer' }}
          >
            ✕
          </button>
          {status && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '8px 12px',
                background: status.ok ? '#00ff661a' : '#ff6b6b1a',
                border: `1px solid ${status.ok ? '#00ff6633' : '#ff6b6b40'}`,
                color: status.ok ? 'var(--primary-hex)' : '#ff6b6b',
                borderRadius: 'var(--radius)',
                fontSize: '0.85rem',
              }}
            >
              {status.ok ? '✓ ' : '✗ '}
              {status.msg}
            </div>
          )}
        </form>
      )}

      {/* Ativos */}
      {active.length > 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', marginBottom: '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Cotação</th>
                  <th style={{ textAlign: 'right' }}>Alvo</th>
                  <th style={{ textAlign: 'right' }}>Distância</th>
                  <th>Anotação</th>
                  <th>Criado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {active.map((a) => {
                  const isTargetHigh = a.kind === 'target_high';
                  const distance = a.distancePct;
                  // Pra target_high (vender quando subir): distância NEGATIVA = ainda falta. Verde quando perto/passou.
                  // Pra stop_loss (vender quando cair): distância POSITIVA = ainda longe. Vermelho quando perto/passou.
                  const isClose = distance !== null && (
                    (isTargetHigh && distance >= -3) ||
                    (!isTargetHigh && distance <= 3)
                  );
                  return (
                    <tr key={a.id}>
                      <td>
                        <Link href={`/ativo/${a.ticker}`} style={{ fontWeight: 700, fontFamily: 'var(--font-montserrat), Montserrat' }}>
                          {a.ticker}
                        </Link>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: isTargetHigh ? '#00ff661a' : '#ff6b6b1a', color: isTargetHigh ? 'var(--primary-hex)' : '#ff6b6b', borderRadius: '4px', fontWeight: 700 }}>
                          {isTargetHigh ? '🎯 Alvo' : '🛑 Stop'}
                        </span>
                      </td>
                      <td className="fin-num" style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 }}>
                        {fmtBRL(a.currentPrice)}
                        {a.changePct !== null && (
                          <span style={{ display: 'block', fontSize: '0.68rem', color: a.changePct > 0 ? 'var(--primary-hex)' : '#ff6b6b' }}>
                            {fmtPct(a.changePct)}
                          </span>
                        )}
                      </td>
                      <td className="fin-num" style={{ textAlign: 'right', fontSize: '0.88rem', fontWeight: 700 }}>
                        {fmtBRL(a.targetPrice)}
                      </td>
                      <td className="fin-num" style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: isClose ? '#fbbf24' : 'var(--text-secondary)' }}>
                        {fmtPct(distance)}
                        {isClose && <span style={{ display: 'block', fontSize: '0.62rem' }}>⚠️ próximo</span>}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '180px' }}>{a.notes ?? '—'}</td>
                      <td style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{fmtDateTime(a.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => remove(a.id)}
                          style={{ background: 'transparent', border: '1px solid var(--border-hex)', color: 'var(--text-muted)', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px dashed var(--border-hex)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Nenhum alerta ativo. Crie o primeiro acima.
        </div>
      )}

      {/* Histórico (disparados) */}
      {triggered.length > 0 && (
        <>
          <h2 style={{ fontSize: '0.95rem', margin: '0 0 10px', fontFamily: 'var(--font-montserrat), Montserrat', fontWeight: 700, color: 'var(--text-muted)' }}>
            Histórico — disparados ({triggered.length})
          </h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: 'right' }}>Alvo</th>
                    <th style={{ textAlign: 'right' }}>Disparado a</th>
                    <th>Quando</th>
                    <th>Anotação</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {triggered.map((a) => (
                    <tr key={a.id} style={{ opacity: 0.7 }}>
                      <td>
                        <Link href={`/ativo/${a.ticker}`} style={{ fontWeight: 700 }}>{a.ticker}</Link>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: a.kind === 'target_high' ? '#00ff661a' : '#ff6b6b1a', color: a.kind === 'target_high' ? 'var(--primary-hex)' : '#ff6b6b', borderRadius: '4px', fontWeight: 700 }}>
                          {a.kind === 'target_high' ? '🎯 Alvo' : '🛑 Stop'}
                        </span>
                      </td>
                      <td className="fin-num" style={{ textAlign: 'right' }}>{fmtBRL(a.targetPrice)}</td>
                      <td className="fin-num" style={{ textAlign: 'right', fontWeight: 700 }}>{fmtBRL(a.triggeredPrice)}</td>
                      <td style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{fmtDateTime(a.triggeredAt)}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{a.notes ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => reactivate(a.id)}
                          style={{ background: 'transparent', border: '1px solid var(--border-hex)', color: 'var(--text-secondary)', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer' }}
                          title="Reativar este alerta"
                        >
                          ↻
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
