'use client';

import { useState, useTransition } from 'react';
import { addPurchase } from '@/app/actions/watchlist';

interface Props {
  ticker: string;
  currentQty: number | null;
  currentAvg: number | null;
}

export function AddPurchaseButton({ ticker, currentQty, currentAvg }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(null);
  const [qty, setQty] = useState('');
  const [mode, setMode] = useState<'unit' | 'total'>('total');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalValue, setTotalValue] = useState('');

  const close = () => {
    setOpen(false);
    setQty('');
    setUnitPrice('');
    setTotalValue('');
    setStatus(null);
  };

  const submit = () => {
    const qtyN = Number.parseInt(qty.replace(/\D/g, ''), 10);
    if (!Number.isFinite(qtyN) || qtyN <= 0) {
      setStatus({ ok: false, msg: 'Informe a quantidade' });
      return;
    }

    let priceUnit: number;
    if (mode === 'unit') {
      const cleaned = unitPrice.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
      priceUnit = Number.parseFloat(cleaned);
    } else {
      const cleanedTotal = totalValue.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
      const totalN = Number.parseFloat(cleanedTotal);
      if (!Number.isFinite(totalN) || totalN <= 0) {
        setStatus({ ok: false, msg: 'Informe o valor total pago' });
        return;
      }
      priceUnit = totalN / qtyN;
    }

    if (!Number.isFinite(priceUnit) || priceUnit <= 0) {
      setStatus({ ok: false, msg: 'Preço unitário inválido' });
      return;
    }

    const fd = new FormData();
    fd.set('ticker', ticker);
    fd.set('quantity', String(qtyN));
    fd.set('price', priceUnit.toFixed(4).replace('.', ','));

    startTransition(async () => {
      const r = await addPurchase(fd);
      if (r.error) {
        setStatus({ ok: false, msg: r.error });
      } else {
        setStatus({ ok: true, msg: r.message ?? 'OK' });
        setTimeout(() => close(), 2500);
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Registrar compra adicional de ${ticker}`}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--primary-hex)',
          cursor: 'pointer',
          padding: '2px 6px',
          fontSize: '0.95rem',
          fontWeight: 700,
        }}
      >
        ➕
      </button>
    );
  }

  // Posição preview se preço informado
  const qtyN = Number.parseInt(qty.replace(/\D/g, ''), 10);
  const priceN = mode === 'unit'
    ? Number.parseFloat(unitPrice.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''))
    : (Number.parseFloat(totalValue.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) / qtyN);
  const previewValid = Number.isFinite(qtyN) && qtyN > 0 && Number.isFinite(priceN) && priceN > 0;
  const newQty = previewValid ? (currentQty ?? 0) + qtyN : null;
  const newAvg = previewValid && newQty
    ? ((currentQty ?? 0) * (currentAvg ?? 0) + qtyN * priceN) / newQty
    : null;

  return (
    <div
      onClick={close}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 200, backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-alt)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius)',
          padding: '20px 22px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: 'var(--shadow), var(--glow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-montserrat), Montserrat' }}>
              ➕ Comprar {ticker}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Posição atual: {currentQty ?? 0} cotas {currentAvg ? `· médio R$ ${currentAvg.toFixed(2)}` : ''}
            </p>
          </div>
          <button onClick={close} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Quantidade comprada
            </label>
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="2000"
              inputMode="numeric"
              autoFocus
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setMode('total')}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: mode === 'total' ? 'var(--primary-hex)' : 'transparent',
                color: mode === 'total' ? 'var(--primary-fg)' : 'var(--text-secondary)',
                border: '1px solid var(--border-hex)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Valor total
            </button>
            <button
              type="button"
              onClick={() => setMode('unit')}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: mode === 'unit' ? 'var(--primary-hex)' : 'transparent',
                color: mode === 'unit' ? 'var(--primary-fg)' : 'var(--text-secondary)',
                border: '1px solid var(--border-hex)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Preço unitário
            </button>
          </div>

          {mode === 'total' ? (
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Valor total pago (R$)
              </label>
              <input
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                placeholder="43.238,00"
                inputMode="decimal"
                style={{ width: '100%' }}
              />
              {Number.isFinite(qtyN) && qtyN > 0 && Number.isFinite(priceN) && priceN > 0 && (
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Preço unitário: R$ {priceN.toFixed(4)}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Preço unitário (R$)
              </label>
              <input
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="21,62"
                inputMode="decimal"
                style={{ width: '100%' }}
              />
              {Number.isFinite(qtyN) && qtyN > 0 && Number.isFinite(priceN) && priceN > 0 && (
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Valor total: R$ {(qtyN * priceN).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Preview do resultado */}
          {previewValid && newQty && newAvg && (
            <div style={{ background: '#00ff661a', border: '1px solid var(--border-accent)', borderRadius: '6px', padding: '10px 12px', fontSize: '0.82rem' }}>
              <strong style={{ color: 'var(--primary-hex)' }}>Após a compra:</strong>
              <div style={{ marginTop: '4px', fontFamily: 'var(--font-mono), monospace' }}>
                {newQty.toLocaleString('pt-BR')} cotas · preço médio R$ {newAvg.toFixed(4)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={close} style={{ background: 'transparent', border: '1px solid var(--border-hex)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem' }}>
              Cancelar
            </button>
            <button onClick={submit} disabled={isPending || !previewValid} className="btn-primary">
              {isPending ? '…' : '✓ Confirmar compra'}
            </button>
          </div>

          {status && (
            <div style={{
              padding: '10px 12px',
              background: status.ok ? '#00ff661a' : '#ff6b6b1a',
              border: `1px solid ${status.ok ? '#00ff6633' : '#ff6b6b40'}`,
              color: status.ok ? 'var(--primary-hex)' : '#ff6b6b',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}>
              {status.ok ? '✓ ' : '✗ '}{status.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
