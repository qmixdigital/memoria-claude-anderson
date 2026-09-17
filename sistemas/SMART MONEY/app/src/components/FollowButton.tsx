'use client';

import { useState, useTransition } from 'react';
import { followTicker, unfollowTicker } from '@/app/actions/watchlist-follow';

interface Props {
  ticker: string;
  initialFollowing: boolean;
}

export function FollowButton({ ticker, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const fd = new FormData();
    fd.set('ticker', ticker);
    const action = following ? unfollowTicker : followTicker;
    const next = !following;
    setFollowing(next); // optimistic
    startTransition(async () => {
      const r = await action(fd);
      if (!r.ok) {
        setFollowing(!next); // revert
        if (r.error) alert(r.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        fontSize: '0.82rem',
        fontWeight: 600,
        fontFamily: 'var(--font-montserrat), Montserrat',
        background: following ? 'var(--card)' : 'transparent',
        color: following ? 'var(--primary-hex)' : 'var(--text-secondary)',
        border: `1px solid ${following ? 'var(--primary-hex)' : 'var(--border-hex)'}`,
        borderRadius: '8px',
        cursor: isPending ? 'wait' : 'pointer',
        opacity: isPending ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
      aria-pressed={following}
    >
      <span style={{ fontSize: '0.95rem' }}>{following ? '★' : '☆'}</span>
      {following ? 'Acompanhando' : 'Acompanhar'}
    </button>
  );
}
