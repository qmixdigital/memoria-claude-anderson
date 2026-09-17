import Link from 'next/link';

interface Props {
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  children: React.ReactNode;
}

export function WidgetCard({ title, subtitle, ctaHref, ctaLabel, children }: Props) {
  return (
    <section
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border-hex)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-hex)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              margin: 0,
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {ctaHref && (
          <Link
            href={ctaHref}
            style={{
              fontSize: '0.78rem',
              color: 'var(--primary-hex)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {ctaLabel ?? 'Ver mais →'}
          </Link>
        )}
      </header>
      <div style={{ flex: 1 }}>{children}</div>
    </section>
  );
}

export function pctColor(v: number | null): string {
  if (v === null) return 'var(--text-muted)';
  if (v > 0) return 'var(--primary-hex)';
  if (v < 0) return '#ff6b6b';
  return 'var(--text-secondary)';
}

export function fmtPct(v: number | null): string {
  if (v === null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

export function fmtBRL(v: number | null): string {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(v);
}
