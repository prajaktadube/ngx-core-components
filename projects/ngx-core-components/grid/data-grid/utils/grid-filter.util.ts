import { FilterCondition, FilterExpression, GridFilterState } from '../models';

/** Evaluate a single filter condition against a row */
export function evaluateCondition<T extends Record<string, unknown>>(row: T, condition: FilterCondition): boolean {
  const { field, type, value } = condition;
  const cellValue = row[field];

  // Handle empty checks first
  if (type === 'isEmpty') return cellValue === null || cellValue === undefined || cellValue === '';
  if (type === 'isNotEmpty') return cellValue !== null && cellValue !== undefined && cellValue !== '';

  if (cellValue === null || cellValue === undefined) return false;

  const normalizeStr = (v: unknown) => String(v).toLowerCase();

  switch (type) {
    case 'contains':
      return normalizeStr(cellValue).includes(normalizeStr(value));
    case 'eq':
      return cellValue === value || normalizeStr(cellValue) === normalizeStr(value);
    case 'neq':
      return cellValue !== value && normalizeStr(cellValue) !== normalizeStr(value);
    case 'startsWith':
      return normalizeStr(cellValue).startsWith(normalizeStr(value));
    case 'endsWith':
      return normalizeStr(cellValue).endsWith(normalizeStr(value));
    case 'gt':
      return Number(cellValue) > Number(value);
    case 'gte':
      return Number(cellValue) >= Number(value);
    case 'lt':
      return Number(cellValue) < Number(value);
    case 'lte':
      return Number(cellValue) <= Number(value);
    case 'between': {
      const val = Number(cellValue);
      if (condition.valueTo !== undefined) {
        return val >= Number(value) && val <= Number(condition.valueTo);
      }
      if (Array.isArray(value) && value.length === 2) {
        return val >= Number(value[0]) && val <= Number(value[1]);
      }
      return false;
    }
    case 'in': {
      if (Array.isArray(value)) {
        return value.some(v => v === cellValue || normalizeStr(v) === normalizeStr(cellValue));
      }
      return false;
    }
    case 'before': {
      const dateCell = cellValue instanceof Date ? cellValue : new Date(cellValue as string);
      const dateVal = value instanceof Date ? value : new Date(value as string);
      return dateCell.getTime() < dateVal.getTime();
    }
    case 'after': {
      const dateCell = cellValue instanceof Date ? cellValue : new Date(cellValue as string);
      const dateVal = value instanceof Date ? value : new Date(value as string);
      return dateCell.getTime() > dateVal.getTime();
    }
    case 'isTrue':
      return cellValue === true || normalizeStr(cellValue) === 'true';
    case 'isFalse':
      return cellValue === false || normalizeStr(cellValue) === 'false';
    default:
      return false;
  }
}

/** Recursively evaluate a filter expression tree (AND/OR groups) */
export function evaluateExpression<T extends Record<string, unknown>>(row: T, expression: FilterExpression): boolean {
  if (!expression.conditions || expression.conditions.length === 0) return true;

  if (expression.operator === 'AND') {
    return expression.conditions.every((item: FilterCondition | FilterExpression) => {
      if ('operator' in item && 'conditions' in item) {
        return evaluateExpression(row, item as FilterExpression);
      }
      return evaluateCondition(row, item as FilterCondition);
    });
  } else {
    return expression.conditions.some((item: FilterCondition | FilterExpression) => {
      if ('operator' in item && 'conditions' in item) {
        return evaluateExpression(row, item as FilterExpression);
      }
      return evaluateCondition(row, item as FilterCondition);
    });
  }
}

/** Apply legacy GridFilterState[] filters (backward-compatible) */
export function applyLegacyFilters<T extends Record<string, unknown>>(data: T[], filters: GridFilterState[]): T[] {
  if (!filters || filters.length === 0) return data;

  return data.filter(row => {
    return filters.every(filter => {
      const condition: FilterCondition = {
        field: filter.field,
        type: (filter.operator as FilterCondition['type']) || 'contains',
        value: filter.value
      };
      return evaluateCondition(row, condition);
    });
  });
}

/** Apply a FilterExpression tree to a dataset */
export function applyFilterExpression<T extends Record<string, unknown>>(data: T[], expression: FilterExpression | null): T[] {
  if (!expression) return data;
  return data.filter(row => evaluateExpression(row, expression));
}

/** Apply global text search across all fields */
export function applyGlobalSearch<T extends Record<string, unknown>>(data: T[], searchText: string, fields?: string[]): T[] {
  if (!searchText) return data;
  const searchLower = searchText.toLowerCase();

  return data.filter(row => {
    const keys = fields || Object.keys(row);
    return keys.some(key => {
      const val = row[key];
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(searchLower);
    });
  });
}
