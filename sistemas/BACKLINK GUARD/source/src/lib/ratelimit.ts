// Rate limit em memória (por processo). Suficiente pra frear brute-force de login
// numa ferramenta interna — não é um limitador distribuído.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Registra uma tentativa para `key`. Retorna se ainda está dentro do limite e,
 * se não, quanto falta (ms) pra liberar.
 */
export function hit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number; remaining: number } {
  const now = Date.now();

  // limpeza preguiçosa de buckets expirados (evita crescer sem limite)
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0, remaining: limit - 1 };
  }
  b.count += 1;
  if (b.count > limit) {
    return { ok: false, retryAfterMs: b.resetAt - now, remaining: 0 };
  }
  return { ok: true, retryAfterMs: 0, remaining: limit - b.count };
}

/** Zera o contador (chamar após login bem-sucedido). */
export function reset(key: string): void {
  buckets.delete(key);
}
