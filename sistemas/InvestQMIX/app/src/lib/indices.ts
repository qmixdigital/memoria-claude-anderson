// Mapeamento dos índices/criptos exibidos no dashboard.
// O slug é a chave de URL (limpa pra SEO); symbol é o que vai pro Yahoo.

export interface IndexConfig {
  slug: string;
  symbol: string;
  label: string;
  category: 'index' | 'fx' | 'crypto';
  currency: 'BRL' | 'USD';
  description: string;
}

export const INDICES: IndexConfig[] = [
  {
    slug: 'ibovespa',
    symbol: '^BVSP',
    label: 'Ibovespa',
    category: 'index',
    currency: 'BRL',
    description:
      'Índice de referência do mercado de ações brasileiro. Mede a performance ponderada das ~85 empresas mais negociadas e líquidas listadas na B3.',
  },
  {
    slug: 'usdbrl',
    symbol: 'USDBRL=X',
    label: 'Dólar (USD/BRL)',
    category: 'fx',
    currency: 'BRL',
    description:
      'Taxa de câmbio comercial do dólar americano contra o real. Cotação spot do mercado de câmbio (sem IOF).',
  },
  {
    slug: 'small-caps',
    symbol: 'SMAL11.SA',
    label: 'Small Caps (SMAL11)',
    category: 'index',
    currency: 'BRL',
    description:
      'ETF iShares que replica o índice SMLL da B3 — ações de empresas brasileiras de pequena capitalização. Proxy comum pro segmento.',
  },
  {
    slug: 'bitcoin',
    symbol: 'BTC-USD',
    label: 'Bitcoin (USD)',
    category: 'crypto',
    currency: 'USD',
    description:
      'Cotação do Bitcoin em dólar. Maior criptomoeda por capitalização de mercado, frequentemente usada como reserva de valor digital.',
  },
  {
    slug: 'ethereum',
    symbol: 'ETH-USD',
    label: 'Ethereum (USD)',
    category: 'crypto',
    currency: 'USD',
    description:
      'Cotação do Ether em dólar. Segunda maior cripto por capitalização e principal blockchain de smart contracts e DeFi.',
  },
  {
    slug: 'solana',
    symbol: 'SOL-USD',
    label: 'Solana (USD)',
    category: 'crypto',
    currency: 'USD',
    description:
      'Cotação do SOL em dólar. Blockchain de alta performance focada em throughput e baixo custo por transação.',
  },
];

export function findBySlug(slug: string): IndexConfig | undefined {
  return INDICES.find((i) => i.slug === slug);
}

export function findBySymbol(symbol: string): IndexConfig | undefined {
  return INDICES.find((i) => i.symbol === symbol);
}
