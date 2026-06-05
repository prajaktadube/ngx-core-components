import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { niceTicks, scale, fmtNum } from '../shared/chart-utils';

export interface WaterfallItem {
  label: string;
  value: number;
  isTotal?: boolean;
}

@Component({
  selector: 'ngx-waterfall-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-waterfall-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="yPos(tick)"
                  [attr.y2]="yPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis Labels -->
            @for (tick of yTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="yPos(tick) + 4"
                class="axis-label y"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }

            <!-- X-Axis Labels -->
            @for (bar of computedBars(); track $index; let i = $index) {
              <text
                [attr.x]="bar.x + bar.width / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ bar.label }}</text>
            }

            <!-- Connecting dashed lines between columns -->
            @for (bar of computedBars(); track $index; let i = $index) {
              @if (i < computedBars().length - 1) {
                <line
                  [attr.x1]="bar.x + bar.width"
                  [attr.x2]="computedBars()[i+1].x"
                  [attr.y1]="bar.connectY"
                  [attr.y2]="bar.connectY"
                  stroke="var(--ngx-chart-axis, #ced4da)"
                  stroke-dasharray="3,3"
                  stroke-width="1.5"
                />
              }
            }

            <!-- Bars -->
            @for (bar of computedBars(); track $index; let i = $index) {
              <rect
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.width"
                [attr.height]="bar.rectH"
                [attr.fill]="bar.color"
                [attr.rx]="3"
                class="waterfall-bar"
                [class.hovered]="hoveredIndex() === i"
                (mouseenter)="onBarHover($event, bar, i)"
              />
              @if (showLabels() && bar.rectH > 14) {
                <text
                  [attr.x]="bar.x + bar.width / 2"
                  [attr.y]="bar.y + (bar.rectH / 2) + 4"
                  text-anchor="middle"
                  class="bar-value-label"
                >
                  {{ bar.value > 0 ? '+' : '' }}{{ fmtNum(bar.value) }}
                </text>
              }
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ t.label }}</div>
            <div class="tooltip-body">
              <div class="tooltip-val">Change: <strong [style.color]="t.color">{{ t.value > 0 ? '+' : '' }}{{ fmtNum(t.value) }}</strong></div>
              <div class="tooltip-val">Running Balance: <strong>{{ fmtNum(t.balance) }}</strong></div>
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
    }
    .ngx-waterfall-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      fill: #64748b;
      font-weight: 500;
    }
    .waterfall-bar {
      cursor: pointer;
      transition: opacity 0.2s, filter 0.2s;
    }
    .waterfall-bar.hovered {
      opacity: 0.9;
      filter: brightness(1.08) drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .bar-value-label {
      font-size: 9px;
      fill: #ffffff;
      font-weight: 600;
      pointer-events: none;
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 130px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  `]
})
export class WaterfallChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<WaterfallItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);

  // Styling properties
  positiveColor = input<string>('#10b981'); // Emerald
  negativeColor = input<string>('#ef4444'); // Rose/Red
  totalColor = input<string>('#64748b');    // Slate

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    value: number;
    balance: number;
    color: string;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Compute intermediate running balances and waterfall metrics
  processedData = computed(() => {
    const raw = this.data();
    let balance = 0;
    return raw.map(item => {
      const start = balance;
      if (item.isTotal) {
        // If it's explicitly designated as a Total, the column represents the current total
        // but wait: does it reset or just display the accumulated balance? It displays the balance!
        const val = balance;
        return {
          label: item.label,
          value: val,
          start: 0,
          end: val,
          isTotal: true,
          runningBalance: val
        };
      } else {
        balance += item.value;
        return {
          label: item.label,
          value: item.value,
          start: start,
          end: balance,
          isTotal: false,
          runningBalance: balance
        };
      }
    });
  });

  // Bounds
  yMin = computed(() => {
    const vals = [0, ...this.processedData().map(d => d.end), ...this.processedData().map(d => d.start)];
    return Math.min(...vals) < 0 ? Math.min(...vals) * 1.1 : 0;
  });

  yMax = computed(() => {
    const vals = [0, ...this.processedData().map(d => d.end), ...this.processedData().map(d => d.start)];
    return Math.max(...vals) * 1.1;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Scale functions
  xPos(index: number, count: number): number {
    const step = this.innerW() / count;
    return index * step + step * 0.15; // 15% margin
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  barWidth(count: number): number {
    return (this.innerW() / count) * 0.7; // 70% width
  }

  computedBars = computed(() => {
    const items = this.processedData();
    const count = items.length;
    if (count === 0) return [];
    const width = this.barWidth(count);

    return items.map((item, idx) => {
      const x = this.xPos(idx, count);
      const yStart = this.yPos(item.start);
      const yEnd = this.yPos(item.end);

      const y = Math.min(yStart, yEnd);
      const rectH = Math.max(2, Math.abs(yStart - yEnd));

      let color = this.totalColor();
      if (!item.isTotal) {
        color = item.value >= 0 ? this.positiveColor() : this.negativeColor();
      }

      // Connect line is drawn from the end value of this item
      const connectY = yEnd;

      return {
        x,
        y,
        rectH,
        width,
        color,
        connectY,
        label: item.label,
        value: item.value,
        balance: item.runningBalance,
        isTotal: item.isTotal
      };
    });
  });

  onBarHover(event: MouseEvent, bar: any, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: bar.label,
      value: bar.value,
      balance: bar.balance,
      color: bar.color
    });
  }

  readonly fmtNum = fmtNum;
}
