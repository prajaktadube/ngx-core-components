import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-heatmap-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-heatmap-wrapper">
      <div class="ngx-heatmap-container">
        <!-- SVG Grid rendering -->
        <svg
          class="ngx-heatmap-svg"
          [attr.viewBox]="viewBoxString()"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- Y-axis labels -->
          @for (yLabel of yAxisLabels(); track $index) {
            <text
              [attr.x]="leftOffset - 8"
              [attr.y]="getRowY($index) + cellHeight() / 2"
              class="axis-label y-axis-label"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ yLabel }}
            </text>
          }

          <!-- X-axis labels -->
          @for (xLabel of xAxisLabels(); track $index) {
            <text
              [attr.x]="getColX($index) + cellWidth() / 2"
              [attr.y]="topOffset - 8"
              class="axis-label x-axis-label"
              text-anchor="middle"
            >
              {{ xLabel }}
            </text>
          }

          <!-- Heatmap Cells -->
          @for (row of data(); track $index; let rIdx = $index) {
            @for (val of row; track $index; let cIdx = $index) {
              <rect
                [attr.x]="getColX(cIdx)"
                [attr.y]="getRowY(rIdx)"
                [attr.width]="cellWidth() - cellSpacing"
                [attr.height]="cellHeight() - cellSpacing"
                [attr.fill]="getCellColor(val)"
                class="heatmap-cell"
                [style.animation-delay]="(rIdx * 0.03 + cIdx * 0.03) + 's'"
                (mouseenter)="onCellEnter(rIdx, cIdx, val, $event)"
                (mouseleave)="onCellLeave()"
                (click)="onCellClick(rIdx, cIdx, val)"
                rx="3"
                ry="3"
              />
            }
          }
        </svg>

        <!-- Dynamic Tooltip -->
        @if (tooltip().show) {
          <div
            class="heatmap-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tt-cat">{{ tooltip().title }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="getCellColor(tooltip().rawVal)"></span>
              <span class="tt-name">Value</span>
              <span class="tt-val">{{ tooltip().value }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .ngx-heatmap-wrapper {
      width: 100%;
      height: 100%;
      padding: 20px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      position: relative;
    }
    .ngx-heatmap-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .ngx-heatmap-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 700;
      fill: var(--text-secondary, #64748b);
      font-family: inherit;
    }

    @keyframes cellFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .heatmap-cell {
      cursor: pointer;
      transition: fill 0.2s ease, stroke 0.15s ease, filter 0.15s ease;
      stroke: transparent;
      stroke-width: 1px;
      transform-origin: center;
      animation: cellFadeIn 0.4s ease-out both;
    }
    .heatmap-cell:hover {
      filter: brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.18));
      stroke: var(--ngx-chart-hover-stroke, #0f172a);
      stroke-width: 1.5px;
    }

    /* Glassmorphic Tooltip styling */
    .heatmap-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 11px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transform: translate(-50%, -115%);
      min-width: 140px;
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      color: #38bdf8;
    }
    .tt-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tt-name {
      color: rgba(248, 250, 252, 0.8);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
    }
  `]
})
export class HeatmapChartComponent {
  data = input.required<number[][]>();
  xAxisLabels = input<string[]>([]);
  yAxisLabels = input<string[]>([]);
  colorRange = input<string[]>(['#e2e8f0', '#4f46e5']);

  cellClick = output<{ row: number; col: number; value: number }>();

  // Dimensions configuration
  leftOffset = 70;
  topOffset = 30;
  cellSpacing = 3;

  tooltip = signal<{ show: boolean; title: string; value: string; x: number; y: number; rawVal: number }>({
    show: false,
    title: '',
    value: '',
    x: 0,
    y: 0,
    rawVal: 0
  });

  cellWidth = computed(() => {
    const cols = this.data()[0]?.length || 1;
    return Math.max(16, (500 - this.leftOffset) / cols);
  });

  cellHeight = computed(() => {
    const rows = this.data().length || 1;
    return Math.max(16, (250 - this.topOffset) / rows);
  });

  viewBoxString = computed(() => {
    const cols = this.data()[0]?.length || 1;
    const rows = this.data().length || 1;
    const width = this.leftOffset + cols * this.cellWidth() + 10;
    const height = this.topOffset + rows * this.cellHeight() + 10;
    return `0 0 ${width} ${height}`;
  });

  getColX(colIdx: number): number {
    return this.leftOffset + colIdx * this.cellWidth();
  }

  getRowY(rowIdx: number): number {
    return this.topOffset + rowIdx * this.cellHeight();
  }

  getCellColor(val: number): string {
    const values = this.data().flat();
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min;
    const fraction = range === 0 ? 0.5 : (val - min) / range;
    return this.interpolateColor(this.colorRange()[0], this.colorRange()[1], fraction);
  }

  private interpolateColor(color1: string, color2: string, fraction: number): string {
    const hex = (x: string) => {
      const h = x.replace('#', '');
      return h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    };
    const c1 = hex(color1);
    const c2 = hex(color2);

    const r1 = parseInt(c1.substring(0, 2), 16);
    const g1 = parseInt(c1.substring(2, 4), 16);
    const b1 = parseInt(c1.substring(4, 6), 16);

    const r2 = parseInt(c2.substring(0, 2), 16);
    const g2 = parseInt(c2.substring(2, 4), 16);
    const b2 = parseInt(c2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * fraction);
    const g = Math.round(g1 + (g2 - g1) * fraction);
    const b = Math.round(b1 + (b2 - b1) * fraction);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  onCellEnter(rIdx: number, cIdx: number, val: number, event: MouseEvent): void {
    const xLabel = this.xAxisLabels()[cIdx] || `Col ${cIdx + 1}`;
    const yLabel = this.yAxisLabels()[rIdx] || `Row ${rIdx + 1}`;
    const title = `${yLabel} • ${xLabel}`;

    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    const parentRect = (event.currentTarget as SVGRectElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    this.tooltip.set({
      show: true,
      title,
      value: val.toLocaleString(),
      x,
      y,
      rawVal: val
    });
  }

  onCellLeave(): void {
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onCellClick(rIdx: number, cIdx: number, val: number): void {
    this.cellClick.emit({ row: rIdx, col: cIdx, value: val });
  }
}
