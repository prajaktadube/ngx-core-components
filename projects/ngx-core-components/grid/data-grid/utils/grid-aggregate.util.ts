import { GridStatusBarAggregates } from '../models';

export type AggregateFunction = 'sum' | 'avg' | 'count' | 'min' | 'max';

/** Compute a single aggregate across a numeric field */
export function computeAggregate<T extends Record<string, unknown>>(data: T[], field: string, fn: AggregateFunction): number | string {
  if (!data || data.length === 0) return 0;
  
  const values = data.map(item => {
    const val = item[field];
    return typeof val === 'number' ? val : Number(val);
  }).filter(val => !isNaN(val));

  if (fn === 'count') return data.length;
  
  if (values.length === 0) return 0;

  switch (fn) {
    case 'sum':
      return values.reduce((acc, curr) => acc + curr, 0);
    case 'avg':
      return values.reduce((acc, curr) => acc + curr, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return 0;
  }
}

/** Compute all aggregates for a set of values (for status bar) */
export function computeStatusBarAggregates(values: unknown[]): GridStatusBarAggregates {
  const numericValues = values
    .map(v => typeof v === 'number' ? v : Number(v))
    .filter(v => !isNaN(v));

  const count = values.length;
  if (numericValues.length === 0) {
    return { sum: 0, average: 0, count, min: 0, max: 0 };
  }

  const sum = numericValues.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  return { sum, average: avg, count, min, max };
}

/** Compute group-level aggregates for all aggregatable columns */
export function computeGroupAggregates<T extends Record<string, unknown>>(
  items: T[], 
  aggregateDefs: { field: string; fn: AggregateFunction }[]
): Record<string, number | string> {
  const result: Record<string, number | string> = {};
  
  for (const def of aggregateDefs) {
    result[def.field] = computeAggregate(items, def.field, def.fn);
  }
  
  return result;
}

/** Format aggregate value for display (respects locale) */
export function formatAggregateValue(value: number | string, fn: AggregateFunction): string {
  const numVal = typeof value === 'string' ? Number(value) : value;
  if (isNaN(numVal)) return String(value);

  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fn === 'avg' ? 2 : (fn === 'count' ? 0 : 2)
  });
  
  return formatter.format(numVal);
}
