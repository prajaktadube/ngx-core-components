import { Injectable, signal } from '@angular/core';

export interface TooltipRow {
  name: string;
  value: number | string;
  color: string;
  formattedValue?: string;
}

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  rows: TooltipRow[];
  pinned?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChartTooltipService {
  readonly state = signal<TooltipState | null>(null);

  show(x: number, y: number, title: string, rows: TooltipRow[]): void {
    if (this.state()?.pinned) return;
    this.state.set({ visible: true, x, y, title, rows });
  }

  hide(): void {
    if (this.state()?.pinned) return;
    this.state.set(null);
  }

  togglePin(): void {
    const curr = this.state();
    if (!curr) return;
    this.state.set({ ...curr, pinned: !curr.pinned });
  }

  /** Compute flip position if tooltip hits viewport right/bottom bounds */
  getAdjustedPosition(x: number, y: number, containerW: number, containerH: number, tooltipW = 160, tooltipH = 100): { left: number; top: number } {
    let left = x;
    let top = y - 10;
    if (left + tooltipW / 2 > containerW) left = containerW - tooltipW / 2 - 8;
    if (left - tooltipW / 2 < 0) left = tooltipW / 2 + 8;
    if (top - tooltipH < 0) top = y + 20; // flip below
    return { left, top };
  }
}
