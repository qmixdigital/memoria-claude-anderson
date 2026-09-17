'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  ticker: string;
  companyName: string | null;
  class: string;
  isSmallCap: boolean;
  lastQuote: number | null;
  changePct: number | null;
  inPortfolio: boolean;
  inWatchlist: boolean;
}

function fmtBRL(v: number | null) {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(v);
}
function fmtPct(v: number | null) {
  if (v === null) return '';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

export function TickerSearch({ size = 'normal' }: { size?: 'normal' | 'large' }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(Array.isArray(data.results) ? data.results : []);
          setHighlight(0);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Click outside fecha dropdown
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const goTo = (ticker: string) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    router.push(`/ativo/${ticker.toUpperCase()}`);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlight]) goTo(results[highlight].ticker);
      else if (query.trim().match(/^[A-Z0-9]{4,6}$/i)) goTo(query.trim());
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const inputHeight = size === 'large' ? '52px' : '40px';
  const fontSize = size === 'large' ? '1rem' : '0.9rem';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1rem',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Buscar ação por ticker ou nome (PETR4, Bradesco, Vale...)"
          style={{
            width: '100%',
            height: inputHeight,
            paddingLeft: '40px',
            paddingRight: '14px',
            fontSize,
            background: 'var(--card)',
            border: '1px solid var(--border-hex)',
            borderRadius: 'var(--radius)',
            color: 'var(--foreground-hex)',
          }}
        />
      </div>

      {open && (results.length > 0 || loading) && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--bg-alt)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow), var(--glow)',
            zIndex: 200,
            maxHeight: '440px',
            overflowY: 'auto',
          }}
        >
          {loading && results.length === 0 && (
            <div style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Buscando…</div>
          )}
          {results.map((r, i) => {
            const active = i === highlight;
            const positive = r.changePct !== null && r.changePct > 0;
            return (
              <button
                key={r.ticker}
                type="button"
                onClick={() => goTo(r.ticker)}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  display: 'flex',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  background: active ? 'var(--card-hover)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-hex)',
                  cursor: 'pointer',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--foreground-hex)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-montserrat), Montserrat', fontSize: '0.92rem' }}>
                      {r.ticker}
                    </span>
                    {r.isSmallCap && (
                      <span style={{ fontSize: '0.58rem', padding: '1px 5px', background: '#1e3a5f', color: '#7dd3fc', borderRadius: '3px', fontWeight: 700 }}>SC</span>
                    )}
                    {r.inPortfolio && (
                      <span title="Na sua carteira" style={{ fontSize: '0.78rem' }}>💼</span>
                    )}
                    {r.inWatchlist && (
                      <span title="Na sua watchlist" style={{ fontSize: '0.7rem', color: 'var(--primary-hex)' }}>★</span>
                    )}
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{r.class}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.companyName ?? '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fmtBRL(r.lastQuote)}</div>
                  {r.changePct !== null && (
                    <div style={{ fontSize: '0.74rem', color: positive ? 'var(--primary-hex)' : '#ff6b6b' }}>
                      {fmtPct(r.changePct)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {!loading && query.trim() && results.length === 0 && (
            <div style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Nenhum resultado para "{query}". Pressione Enter pra ir direto pra <strong style={{ color: 'var(--primary-hex)' }}>{query.toUpperCase()}</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
