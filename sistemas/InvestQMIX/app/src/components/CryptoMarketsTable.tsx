'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { SortableTable, type SortableColumn } from './SortableTable';

interface CoinRow {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number | null;
  price_change_percentage_30d_in_currency: number | null;
  sparkline_in_7d: { price: number[] };
  ath: number;
  ath_change_percentage: number;
}

function fmtBRL(v: number) {
  if (v >= 1_000) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
  if (v >= 1) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(v);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 4, maximumFractionDigits: 8 }).format(v);
}
function fmtCompact(v: number | null) {
  if (v === null || v === 0) return '—';
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(2)} bi`;
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2)} mi`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)} k`;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}
function fmtPct(v: number | null) {
  if (v === null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}
function pctClass(v: number | null) {
  if (v === null) return 'fin-neutral';
  if (v > 0) return 'fin-pos';
  if (v < 0) return 'fin-neg';
  return 'fin-neutral';
}

export function CryptoMarketsTable() {
  const [coins, setCoins] = useState<CoinRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/crypto/markets')
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data.coins)) setCoins(data.coins);
        else setError(data.error ?? 'erro');
      })
      .catch((e) => setError(String(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }, [coins, search]);

  const columns: SortableColumn<CoinRow>[] = [
    {
      key: 'rank',
      label: '#',
      sortValue: (c) => c.market_cap_rank,
      width: '50px',
      align: 'center',
      render: (c) => (
        <span style={{ fontFamily: 'var(--font-montserrat), Montserrat', fontWeight: 700, fontSize: '0.78rem', color: c.market_cap_rank <= 3 ? '#fbbf24' : 'var(--text-muted)' }}>
          {c.market_cap_rank}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Moeda',
      sortValue: (c) => c.name,
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image
            src={c.image}
            alt={c.name}
            width={28}
            height={28}
            style={{ borderRadius: '50%' }}
            unoptimized
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-montserrat), Montserrat', fontSize: '0.88rem' }}>
              {c.name}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {c.symbol}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Preço',
      sortValue: (c) => c.current_price,
      align: 'right',
      width: '130px',
      render: (c) => (
        <span className="fin-num" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {fmtBRL(c.current_price)}
        </span>
      ),
    },
    {
      key: 'change24h',
      label: '24h',
      sortValue: (c) => c.price_change_percentage_24h,
      align: 'right',
      width: '90px',
      render: (c) => (
        <span className={`fin-num ${pctClass(c.price_change_percentage_24h)}`} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {fmtPct(c.price_change_percentage_24h)}
        </span>
      ),
    },
    {
      key: 'change7d',
      label: '7d',
      sortValue: (c) => c.price_change_percentage_7d_in_currency,
      align: 'right',
      width: '90px',
      render: (c) => (
        <span className={`fin-num ${pctClass(c.price_change_percentage_7d_in_currency)}`} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {fmtPct(c.price_change_percentage_7d_in_currency)}
        </span>
      ),
    },
    {
      key: 'change30d',
      label: '30d',
      sortValue: (c) => c.price_change_percentage_30d_in_currency,
      align: 'right',
      width: '90px',
      render: (c) => (
        <span className={`fin-num ${pctClass(c.price_change_percentage_30d_in_currency)}`} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {fmtPct(c.price_change_percentage_30d_in_currency)}
        </span>
      ),
    },
    {
      key: 'sparkline',
      label: '7 dias',
      sortable: false,
      align: 'center',
      width: '120px',
      render: (c) => {
        const data = (c.sparkline_in_7d?.price ?? []).map((p, i) => ({ i, p }));
        if (data.length === 0) return <span>—</span>;
        const first = data[0]?.p ?? 0;
        const last = data[data.length - 1]?.p ?? 0;
        const positive = last >= first;
        return (
          <div style={{ width: '100%', height: '32px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
                <Line
                  type="monotone"
                  dataKey="p"
                  stroke={positive ? '#00ff66' : '#ff6b6b'}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      },
    },
    {
      key: 'marketCap',
      label: 'Market Cap',
      sortValue: (c) => c.market_cap,
      align: 'right',
      width: '130px',
      render: (c) => (
        <span className="fin-num" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {fmtCompact(c.market_cap)}
        </span>
      ),
    },
    {
      key: 'volume',
      label: 'Volume 24h',
      sortValue: (c) => c.total_volume,
      align: 'right',
      width: '120px',
      render: (c) => (
        <span className="fin-num" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {fmtCompact(c.total_volume)}
        </span>
      ),
    },
    {
      key: 'ath',
      label: 'ATH',
      sortValue: (c) => c.ath_change_percentage,
      align: 'right',
      width: '130px',
      render: (c) => (
        <div className="cell-stack" style={{ alignItems: 'flex-end' }}>
          <span className="fin-num primary">{fmtBRL(c.ath)}</span>
          <span className={`fin-num secondary ${pctClass(c.ath_change_percentage)}`}>
            {fmtPct(c.ath_change_percentage)}
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou símbolo (BTC, ETH…)"
          style={{ flex: 1, minWidth: '240px', padding: '10px 14px', fontSize: '0.9rem' }}
        />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {filtered.length} de {coins.length} · CoinGecko · cache 2 min
        </span>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando top 30…</div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ff6b6b' }}>Erro: {error}</div>
        ) : (
          <SortableTable<CoinRow>
            columns={columns}
            rows={filtered}
            rowKey={(c) => c.id}
            defaultSort={{ key: 'rank', dir: 'asc' }}
            emptyText="Nenhuma moeda encontrada"
          />
        )}
      </div>
    </>
  );
}
