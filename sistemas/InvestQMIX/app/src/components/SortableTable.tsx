'use client';

import { useMemo, useState, type ReactNode } from 'react';

export interface SortableColumn<T> {
  key: string;
  label: string;
  // sortValue: returns the comparable value for sorting (string | number | null)
  sortValue?: (row: T) => string | number | null | undefined;
  // render: returns the JSX to display in the cell
  render: (row: T) => ReactNode;
  // footer: aggregation/total cell for this column
  footer?: (rows: T[]) => ReactNode;
  // optional cell style + alignment
  align?: 'left' | 'right' | 'center';
  width?: string;
  sortable?: boolean; // default true if sortValue provided
  className?: string;
}

interface Props<T> {
  columns: SortableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  emptyText?: string;
}

export function SortableTable<T>({ columns, rows, rowKey, defaultSort, emptyText }: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(
    defaultSort ?? null
  );

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col || !col.sortValue) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    const arr = [...rows];
    arr.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      // null/undefined: empurra pra final independente da direção
      const aNil = av === null || av === undefined;
      const bNil = bv === null || bv === undefined;
      if (aNil && bNil) return 0;
      if (aNil) return 1;
      if (bNil) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv), 'pt-BR') * dir;
    });
    return arr;
  }, [rows, sort, columns]);

  const click = (key: string, sortable: boolean) => {
    if (!sortable) return;
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' };
      if (prev.dir === 'desc') return { key, dir: 'asc' };
      return null; // 3rd click clears
    });
  };

  if (rows.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {emptyText ?? 'Nenhum registro'}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            {columns.map((c) => {
              const sortable = c.sortable !== false && c.sortValue !== undefined;
              const active = sort?.key === c.key;
              const arrow = active ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '';
              return (
                <th
                  key={c.key}
                  onClick={() => click(c.key, sortable)}
                  className={c.className}
                  style={{
                    cursor: sortable ? 'pointer' : 'default',
                    textAlign: c.align ?? 'left',
                    width: c.width,
                    color: active ? 'var(--primary-hex)' : undefined,
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  title={sortable ? 'Clique pra ordenar' : undefined}
                >
                  {c.label}
                  {sortable && <span style={{ opacity: active ? 1 : 0.35, fontSize: '0.85em', marginLeft: '4px' }}>{arrow || '↕'}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{ textAlign: c.align ?? 'left' }}
                  className={c.className}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {columns.some((c) => c.footer) && (
          <tfoot>
            <tr style={{ background: 'var(--card-hover)', borderTop: '2px solid var(--border-accent)' }}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    textAlign: c.align ?? 'left',
                    fontWeight: 700,
                    padding: '12px 14px',
                    color: 'var(--foreground-hex)',
                  }}
                >
                  {c.footer ? c.footer(rows) : null}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
