'use client';

import { useState, useTransition } from 'react';
import { updatePurchasePrice } from '@/app/actions/watchlist';

interface Props {
  ticker: string;
  purchasePrice: number | null;
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v);
}

export function PurchasePriceCell({ ticker, purchasePrice }: Props) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<string>(purchasePrice !== null ? fmt(purchasePrice) : '');
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Clique para editar"
        style={{
          background: 'transparent',
          border: 'none',
          color: purchasePrice !== null ? 'var(--foreground-hex)' : 'var(--text-muted)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.85rem',
          fontVariantNumeric: 'tabular-nums',
          padding: '0',
          textAlign: 'left',
          fontStyle: purchasePrice !== null ? 'normal' : 'italic',
        }}
      >
        {purchasePrice !== null ? `R$ ${fmt(purchasePrice)}` : '— informar'}
      </button>
    );
  }

  const submit = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('ticker', ticker);
      fd.set('purchasePrice', val);
      await updatePurchasePrice(fd);
      setEditing(false);
    });
  };

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') setEditing(false);
        }}
        inputMode="decimal"
        placeholder="0,00"
        style={{
          width: '90px',
          background: 'var(--bg-alt)',
          border: '1px solid var(--border-accent)',
          borderRadius: '4px',
          color: 'var(--foreground-hex)',
          padding: '3px 6px',
          fontSize: '0.8rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        style={{
          background: 'var(--primary-hex)',
          color: 'var(--primary-fg)',
          border: 'none',
          borderRadius: '4px',
          padding: '3px 8px',
          fontSize: '0.7rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        ✓
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        style={{
          background: 'transparent',
          color: 'var(--text-muted)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.8rem',
        }}
      >
        ✕
      </button>
    </div>
  );
}
