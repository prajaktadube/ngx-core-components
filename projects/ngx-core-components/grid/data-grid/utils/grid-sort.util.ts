/**
 * Pure sort comparator functions for the enterprise data grid.
 * Supports multi-column sorting, natural sort, and type-aware comparison.
 */

export type SortDirection = 'asc' | 'desc';

export interface SortDescriptor {
  field: string;
  dir: SortDirection;
}

/** Natural sort comparator — handles mixed alpha-numeric strings (e.g. 'item2' before 'item10') */
export function naturalCompare(a: string, b: string): number {
  const re = /(\d+)|(\D+)/g;
  const ax: Array<[number, string]> = [];
  const bx: Array<[number, string]> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(a))) ax.push([m[1] ? parseInt(m[1], 10) : Infinity, m[2] || '']);
  re.lastIndex = 0;
  while ((m = re.exec(b))) bx.push([m[1] ? parseInt(m[1], 10) : Infinity, m[2] || '']);
  const len = Math.min(ax.length, bx.length);
  for (let i = 0; i < len; i++) {
    const nn = (ax[i][0] as number) - (bx[i][0] as number) || ax[i][1].localeCompare(bx[i][1]);
    if (nn) return nn;
  }
  return ax.length - bx.length;
}

/** Type-aware value comparison: handles string, number, Date, boolean, null/undefined */
export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return naturalCompare(a, b);
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }
  return String(a).localeCompare(String(b));
}

/** Single-field sort */
export function sortByField<T extends Record<string, unknown>>(data: T[], field: string, dir: SortDirection): T[] {
  return [...data].sort((a, b) => {
    const result = compareValues(a[field], b[field]);
    return dir === 'asc' ? result : -result;
  });
}

/** Multi-field sort (ordered priority) */
export function sortByMultipleFields<T extends Record<string, unknown>>(data: T[], descriptors: SortDescriptor[]): T[] {
  if (!descriptors.length) return data;
  return [...data].sort((a, b) => {
    for (const desc of descriptors) {
      const result = compareValues(a[desc.field], b[desc.field]);
      if (result !== 0) return desc.dir === 'asc' ? result : -result;
    }
    return 0;
  });
}
