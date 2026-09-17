'use client';

import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SeriesPoint {
  date: string;
  close: number;
  volume: number | null;
  ma21?: number | null;
  ma200?: number | null;
}

interface Period {
  key: string;
  label: string;
  range: string;
  interval: string;
}

const PERIODS: Period[] = [
  { key: '1mo', label: '1M', range: '1mo', interval: '1d' },
  { key: '3mo', label: '3M', range: '3mo', interval: '1d' },
  { key: '6mo', label: '6M', range: '6mo', interval: '1d' },
  { key: '1y', label: '1A', range: '1y', interval: '1d' },
  { key: '5y', label: '5A', range: '5y', interval: '1wk' },
];

function addMovingAverages(series: SeriesPoint[]): SeriesPoint[] {
  return series.map((p, i) => {
    let ma21: number | null = null;
    let ma200: number | null = null;
    if (i >= 20) {
      let sum = 0;
      for (let k = i - 20; k <= i; k++) sum += series[k]!.close;
      ma21 = sum / 21;
    }
    if (i >= 199) {
      let sum = 0;
      for (let k = i - 199; k <= i; k++) sum += series[k]!.close;
      ma200 = sum / 200;
    }
    return { ...p, ma21, ma200 };
  });
}

function fmtNum(v: number, decimals = 2) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

function fmtVol(v: number | null) {
  if (v === null) return '—';
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(dt);
}

interface Props {
  symbol: string;
  currency: 'BRL' | 'USD';
  defaultPeriod?: string;
}

export function MacroPriceChart({ symbol, currency, defaultPeriod = '1y' }: Props) {
  const initial = PERIODS.find((p) => p.key === defaultPeriod) ?? PERIODS[3]!;
  const [period, setPeriod] = useState<Period>(initial);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/quotes/yahoo?symbol=${encodeURIComponent(symbol)}&range=${period.range}&interval=${period.interval}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data.series)) {
          setSeries(addMovingAverages(data.series));
        } else {
          setSeries([]);
        }
      })
      .catch(() => setSeries([]))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [symbol, period]);

  const first = series[0]?.close;
  const last = series[series.length - 1]?.close;
  const periodChangePct = first && last ? ((last - first) / first) * 100 : null;
  const periodChangeColor =
    periodChangePct === null
      ? 'var(--text-muted)'
      : periodChangePct >= 0
        ? 'var(--primary-hex)'
        : '#ff6b6b';

  const isLargeNumber = first !== undefined && first > 1000;
  const decimals = isLargeNumber ? 0 : currency === 'USD' && first !== undefined && first < 10 ? 4 : 2;
  const currencyPrefix = currency === 'BRL' ? 'R$' : 'US$';

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border-hex)',
        borderRadius: 'var(--radius)',
        padding: '20px 22px',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontFamily: 'Montserrat, sans-serif' }}>
            Cotação histórica · {period.label}
          </h2>
          {periodChangePct !== null && first !== undefined && last !== undefined && (
            <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Variação no período: </span>
              <strong style={{ color: periodChangeColor, fontVariantNumeric: 'tabular-nums' }}>
                {periodChangePct > 0 ? '+' : ''}{periodChangePct.toFixed(2)}%
              </strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontVariantNumeric: 'tabular-nums' }}>
                {currencyPrefix} {fmtNum(first, decimals)} → {currencyPrefix} {fmtNum(last, decimals)}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 14px',
                background: period.key === p.key ? 'var(--primary-hex)' : 'transparent',
                color: period.key === p.key ? 'var(--primary-fg)' : 'var(--text-secondary)',
                border: `1px solid ${period.key === p.key ? 'var(--primary-hex)' : 'var(--border-hex)'}`,
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '380px' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Carregando…
          </div>
        ) : series.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Sem dados de cotação para este período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#8899aa' }}
                tickFormatter={fmtDate}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#8899aa' }}
                tickFormatter={(v) => fmtNum(Number(v), decimals)}
                width={80}
              />
              <YAxis
                yAxisId="vol"
                orientation="left"
                tick={{ fontSize: 10, fill: '#8899aa' }}
                tickFormatter={(v) => fmtVol(Number(v))}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  background: '#0a111c',
                  border: '1px solid #00ff6633',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  padding: '6px 10px',
                }}
                labelStyle={{ color: '#8899aa' }}
                labelFormatter={fmtDate}
                formatter={(v: number, name: string) => {
                  if (name === 'Volume') return [fmtVol(v), 'Volume'];
                  return [`${currencyPrefix} ${fmtNum(v, decimals)}`, 'Fechamento'];
                }}
              />
              <Bar yAxisId="vol" dataKey="volume" name="Volume" fill="#ffffff14" opacity={0.6} />
              <Line yAxisId="price" type="monotone" dataKey="close" name="Fechamento" stroke="#00ff66" dot={false} strokeWidth={2} />
              <Line yAxisId="price" type="monotone" dataKey="ma21" name="MA21" stroke="#fbbf24" dot={false} strokeWidth={1} strokeDasharray="4 2" connectNulls />
              <Line yAxisId="price" type="monotone" dataKey="ma200" name="MA200" stroke="#ff6b6b" dot={false} strokeWidth={1} strokeDasharray="6 3" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
