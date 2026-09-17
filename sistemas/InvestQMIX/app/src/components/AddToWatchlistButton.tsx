'use client';

import { useState, useTransition } from 'react';
import { addToWatchlist } from '@/app/actions/watchlist';

interface Props {
  ticker: string;
  alreadyInWatchlist: boolean;
}

export function AddToWatchlistButton({ ticker, alreadyInWatchlist }: Props) {
  const [added, setAdded] = useState(alreadyInWatchlist);
  const [isPending, startTransition] = useTransition();

  if (added) {
    return (
      <span
        style={{
          fontSize: '0.7rem',
          color: 'var(--primary-hex)',
          fontWeight: 600,
        }}
      >
        ★ na watchlist
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const fd = new FormData();
          fd.set('ticker', ticker);
          const r = await addToWatchlist(fd);
          if (r.ok) setAdded(true);
        })
      }
      style={{
        background: 'transparent',
        border: '1px solid var(--border-accent)',
        color: 'var(--primary-hex)',
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '0.72rem',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {isPending ? '…' : '+ Watchlist'}
    </button>
  );
}
