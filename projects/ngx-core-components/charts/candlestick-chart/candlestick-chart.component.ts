import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { niceTicks, scale, fmtNum } from '../shared/chart-utils';

export interface CandlestickItem {
  date: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

@Component({
  selector: 'ngx-candlestick-chart',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-candlestick-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <div class="chart-svg-container" #container>
        <svg
          #svgEl
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <defs>
            <linearGradient id="candle-bullish-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="bullishColor()" />
              <stop offset="100%" [attr.stop-color]="bullishColor()" stop-opacity="0.8" />
            </linearGradient>
            <linearGradient id="candle-bearish-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="bearishColor()" />
              <stop offset="100%" [attr.stop-color]="bearishColor()" stop-opacity="0.8" />
            </linearGradient>
          </defs>

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
            @for (item of data(); track $index; let i = $index) {
              <text
                [attr.x]="xPos(i) + candleWidth() / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ formatDate(item.date) }}</text>
            }

            <!-- Active Crosshair -->
            @if (hoveredIndex() !== null) {
              @if (computedCandles()[hoveredIndex()!]; as candle) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="candle.yClose"
                  [attr.y2]="candle.yClose"
                  stroke="rgba(100, 116, 139, 0.25)"
                  stroke-width="1.2"
                  stroke-dasharray="3,3"
                  class="crosshair-line"
                />
                <line
                  [attr.x1]="candle.centerX"
                  [attr.x2]="candle.centerX"
                  [attr.y1]="0"
                  [attr.y2]="innerH()"
                  stroke="rgba(100, 116, 139, 0.25)"
                  stroke-width="1.2"
                  stroke-dasharray="3,3"
                  class="crosshair-line"
                />
              }
            }

            <!-- Candles -->
            @for (candle of computedCandles(); track $index; let i = $index) {
              <!-- Whisker/Wick Line (High to Low) -->
              <line
                [attr.x1]="candle.centerX"
                [attr.x2]="candle.centerX"
                [attr.y1]="candle.yHigh"
                [attr.y2]="candle.yLow"
                [attr.stroke]="candle.color"
                stroke-width="1.5"
                class="candle-wick"
              />

              <!-- Candle Body Rect (Open to Close) -->
              <rect
                [attr.x]="candle.x"
                [attr.y]="candle.y"
                [attr.width]="candle.width"
                [attr.height]="candle.rectH"
                [attr.fill]="candle.isBullish ? 'url(#candle-bullish-grad)' : 'url(#candle-bearish-grad)'"
                [attr.stroke]="candle.color"
                stroke-width="1"
                class="candle-rect"
                [class.hovered]="hoveredIndex() === i"
                [style.transform-origin]="candle.centerX + 'px ' + candle.yOpen + 'px'"
                [style.animation-delay]="i * 0.03 + 's'"
                (mouseenter)="onCandleHover($event, candle.raw, i)"
                (mousemove)="onCandleHover($event, candle.raw, i)"
              />
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ formatDate(t.date) }}</div>
            <div class="tooltip-body">
              <div class="tooltip-direction" [style.color]="t.direction === 'Bullish' ? '#10b981' : '#ef4444'">
                <strong>{{ t.direction }}</strong> ({{ t.changePct }})
              </div>
              <div class="tooltip-val">
                <span>High:</span>
                <strong>{{ fmtNum(t.high) }}</strong>
              </div>
              <div class="tooltip-val">
                <span>Open:</span>
                <strong>{{ fmtNum(t.open) }}</strong>
              </div>
              <div class="tooltip-val" style="color: #38bdf8;">
                <span>Close:</span>
                <strong>{{ fmtNum(t.close) }}</strong>
              </div>
              <div class="tooltip-val">
                <span>Low:</span>
                <strong>{{ fmtNum(t.low) }}</strong>
              </div>
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
    .ngx-candlestick-chart {
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

    @keyframes candleGrow {
      from { transform: scaleY(0); opacity: 0; }
      to { transform: scaleY(1); opacity: 1; }
    }

    .candle-rect {
      cursor: pointer;
      transition: fill 0.15s, opacity 0.15s, stroke-width 0.15s, filter 0.15s;
      animation: candleGrow 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .candle-rect.hovered {
      filter: brightness(1.05) drop-shadow(0 4px 10px rgba(0,0,0,0.18));
      stroke-width: 1.5px;
    }

    @keyframes wickFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .candle-wick {
      animation: wickFade 0.6s ease-out 0.2s both;
    }

    .crosshair-line {
      pointer-events: none;
    }

    /* Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 11px;
      z-index: 100;
      min-width: 155px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tooltip-header {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      color: #38bdf8;
    }
    .tooltip-direction {
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tooltip-val {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      color: rgba(248, 250, 252, 0.85);
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
      font-weight: 700;
    }

    /* Export styles */
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
  `]
})
export class CandlestickChartComponent {
  private readonly exportSvc = inject(ChartExportService);
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<CandlestickItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  // Bullish/Bearish colors
  bullishColor = input<string>('#10b981'); // Emerald/Green
  bearishColor = input<string>('#ef4444');  // Rose/Red

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    date: string | Date;
    open: number;
    high: number;
    low: number;
    close: number;
    direction: 'Bullish' | 'Bearish';
    changePct: string;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          // Trigger compute width changes
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Range bounds calculation
  yMin = computed(() => {
    const items = this.data();
    if (items.length === 0) return 0;
    const lows = items.map(d => d.low);
    return Math.min(...lows) * 0.98; // 2% padding below
  });

  yMax = computed(() => {
    const items = this.data();
    if (items.length === 0) return 100;
    const highs = items.map(d => d.high);
    return Math.max(...highs) * 1.02; // 2% padding above
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Category scaling positions
  xPos(index: number): number {
    const count = this.data().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.15;
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  candleWidth(): number {
    const count = this.data().length || 1;
    return (this.innerW() / count) * 0.7; // 70% width
  }

  computedCandles = computed(() => {
    const items = this.data();
    const count = items.length;
    if (count === 0) return [];
    const width = this.candleWidth();

    return items.map((item, idx) => {
      const x = this.xPos(idx);
      const centerX = x + width / 2;

      const yOpen = this.yPos(item.open);
      const yClose = this.yPos(item.close);
      const yHigh = this.yPos(item.high);
      const yLow = this.yPos(item.low);

      const y = Math.min(yOpen, yClose);
      const rectH = Math.max(2, Math.abs(yOpen - yClose));

      const isBullish = item.close >= item.open;
      const color = isBullish ? this.bullishColor() : this.bearishColor();

      return {
        x,
        centerX,
        width,
        yHigh,
        yLow,
        yOpen,
        yClose,
        y,
        rectH,
        color,
        isBullish,
        raw: item
      };
    });
  });

  onCandleHover(event: MouseEvent, item: CandlestickItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    const isBullish = item.close >= item.open;
    const change = item.close - item.open;
    const changePct = ((change / item.open) * 100).toFixed(2) + '%';

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      direction: isBullish ? 'Bullish' : 'Bearish',
      changePct
    });
  }

  formatDate(d: string | Date): string {
    if (d instanceof Date) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return d;
  }

    onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    this.exportSvc.downloadJson(this.data(), 'candlestick-data.json');
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const headers = ['Date', 'Open', 'High', 'Low', 'Close'];
    const rows: (string | number)[][] = data.map(d => [d.date instanceof Date ? d.date.toISOString() : d.date, d.open, d.high, d.low, d.close]);
    this.exportSvc.downloadCsv(headers, rows, 'candlestick-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }


  readonly fmtNum = fmtNum;
}
