/** Executa fn sobre items com no máximo `concurrency` em paralelo. */
export async function pMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      const item = items[i];
      if (item !== undefined) {
        results[i] = await fn(item, i);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length || 1) },
    worker,
  );
  await Promise.all(workers);
  return results;
}
