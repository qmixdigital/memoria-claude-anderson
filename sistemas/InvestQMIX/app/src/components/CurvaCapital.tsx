import type { PontoCurva } from '@/lib/queries/simulador';

/**
 * Curva de capital em SVG puro, sem biblioteca de grafico.
 *
 * Duas faixas empilhadas: patrimonio em cima e drawdown embaixo. O drawdown
 * merece espaco proprio porque e a metrica que diz se a estrategia era
 * suportavel de viver — na curva de patrimonio ele fica escondido.
 */
export function CurvaCapital({
  pontos,
  altura = 180,
}: {
  pontos: PontoCurva[];
  altura?: number;
}) {
  if (pontos.length < 2) {
    return (
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '12px 0' }}>
        Sem curva registrada para esta rodada.
      </div>
    );
  }

  const L = 1000; // largura do viewBox; o SVG escala sozinho
  const alturaDd = Math.round(altura * 0.35);
  const valores = pontos.map((p) => p.patrimonio);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const span = max - min || 1;
  const maxDd = Math.max(...pontos.map((p) => p.drawdownPct), 0.01);

  const x = (i: number) => (i / (pontos.length - 1)) * L;
  const y = (v: number) => altura - ((v - min) / span) * (altura - 8) - 4;
  const yDd = (v: number) => (v / maxDd) * (alturaDd - 6);

  const linha = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.patrimonio).toFixed(1)}`).join(' ');
  const area = `${linha} L${L},${altura} L0,${altura} Z`;
  const areaDd = `M0,0 ${pontos.map((p, i) => `L${x(i).toFixed(1)},${yDd(p.drawdownPct).toFixed(1)}`).join(' ')} L${L},0 Z`;

  const inicial = pontos[0]!.patrimonio;
  const final = pontos.at(-1)!.patrimonio;
  const positivo = final >= inicial;
  const cor = positivo ? 'var(--primary-hex)' : '#ef4444';

  return (
    <div>
      <svg
        viewBox={`0 0 ${L} ${altura}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: `${altura}px`, display: 'block' }}
        role="img"
        aria-label={`Curva de capital de ${pontos[0]!.data} a ${pontos.at(-1)!.data}`}
      >
        {/* linha do capital inicial: acima dela e lucro, abaixo e prejuizo */}
        <line
          x1="0" x2={L} y1={y(inicial)} y2={y(inicial)}
          stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="6 6" opacity="0.5"
        />
        <path d={area} fill={cor} opacity="0.12" />
        <path d={linha} fill="none" stroke={cor} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>

      <svg
        viewBox={`0 0 ${L} ${alturaDd}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: `${alturaDd}px`, display: 'block', marginTop: '2px' }}
        role="img"
        aria-label={`Drawdown, máximo de ${maxDd.toFixed(2)}%`}
      >
        <path d={areaDd} fill="#ef4444" opacity="0.22" />
      </svg>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          marginTop: '4px',
        }}
      >
        <span>{pontos[0]!.data}</span>
        <span>queda máxima {maxDd.toFixed(1)}%</span>
        <span>{pontos.at(-1)!.data}</span>
      </div>
    </div>
  );
}
