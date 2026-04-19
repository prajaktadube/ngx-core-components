// Shared chart utilities and constants

export const CHART_COLORS = [
  '#4a90d9', '#ff6358', '#27ae60', '#f39c12', '#8e44ad',
  '#1abc9c', '#e74c3c', '#3498db', '#2ecc71', '#e67e22',
];

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/** Map a value [min..max] → [rangeMin..rangeMax] */
export function scale(value: number, min: number, max: number, rangeMin: number, rangeMax: number): number {
  if (max === min) return rangeMin;
  return rangeMin + ((value - min) / (max - min)) * (rangeMax - rangeMin);
}

/** Compute nice axis ticks for a range */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const range = max - min;
  const step = niceStep(range / count);
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.01; v += step) {
    ticks.push(parseFloat(v.toFixed(10)));
  }
  return ticks;
}

function niceStep(step: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(step)));
  const frac = step / mag;
  if (frac < 1.5) return mag;
  if (frac < 3) return 2 * mag;
  if (frac < 7) return 5 * mag;
  return 10 * mag;
}

/** Smooth bezier path through points */
export function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev[0] + curr[0]) / 2;
    d += ` C ${cpx} ${prev[1]}, ${cpx} ${curr[1]}, ${curr[0]} ${curr[1]}`;
  }
  return d;
}

/** Format number for display */
export function fmtNum(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}
