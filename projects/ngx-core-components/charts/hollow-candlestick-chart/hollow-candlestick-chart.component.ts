import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { niceTicks, scale, fmtNum, CHART_COLORS } from '../shared/chart-utils';

export interface CandlestickItem {
  date: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

@Component({
  selector: 'ngx-hollow-candlestick-chart',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-hollow-candlestick-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
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
            @if (showLabels()) {
              @for (tick of yTicks(); track tick) {
                <text
                  x="-10"
                  [attr.y]="yPos(tick) + 4"
                  class="axis-label y"
                  text-anchor="end"
                >{{ fmtNum(tick) }}</text>
              }
            }

            <!-- X-Axis Labels -->
            @if (showLabels()) {
              @for (item of data(); track $index; let i = $index) {
                @if (shouldShowXLabel(i)) {
                  <text
                    [attr.x]="xPos(i) + candleWidth() / 2"
                    [attr.y]="innerH() + 20"
                    class="axis-label x"
                    text-anchor="middle"
                  >{{ formatDate(item.date) }}</text>
                }
              }
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

            <!-- Hollow Candlesticks -->
            @for (candle of computedCandles(); track $index; let i = $index) {
              <!-- Upper Wick (High to Top of Body) -->
              <line
                [attr.x1]="candle.centerX"
                [attr.y1]="candle.yHigh"
                [attr.x2]="candle.centerX"
                [attr.y2]="candle.yBodyTop"
                [attr.stroke]="candle.color"
                stroke-width="1.5"
              />

              <!-- Lower Wick (Bottom of Body to Low) -->
              <line
                [attr.x1]="candle.centerX"
                [attr.y1]="candle.yBodyBottom"
                [attr.x2]="candle.centerX"
                [attr.y2]="candle.yLow"
                [attr.stroke]="candle.color"
                stroke-width="1.5"
              />

              <!-- Candle Body Rect (Hollow vs Solid) -->
              <rect
                [attr.x]="candle.x"
                [attr.y]="candle.y"
                [attr.width]="candle.width"
                [attr.height]="candle.rectH"
                [attr.fill]="candle.isHollow ? 'none' : candle.color"
                [attr.stroke]="candle.color"
                [attr.stroke-width]="candle.isHollow ? 2 : 1"
                class="candle-rect"
                [class.hovered]="hoveredIndex() === i"
                [style.transform-origin]="candle.centerX + 'px ' + candle.yOpen + 'px'"
                [style.animation-delay]="i * 0.02 + 's'"
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
              <div class="tooltip-direction" [style.color]="t.isUp ? '#10b981' : '#ef4444'">
                <strong>{{ t.direction }}</strong> ({{ t.changePct }})
              </div>
              <div class="tooltip-val" style="font-size: 10px; color: rgba(255, 255, 255, 0.6); margin-bottom: 2px;">
                <span>Type:</span>
                <strong>{{ t.hollowText }}</strong>
              </div>
              <div class="tooltip-val">
                <span>High:</span>
                <strong>{{ fmtNum(t.high) }}</strong>
              </div>
              <div class="tooltip-val" style="color: #60a5fa;">
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
    .ngx-hollow-candlestick-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
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
      transition: fill 0.15s, stroke-width 0.15s, filter 0.15s;
      animation: candleGrow 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .candle-rect.hovered {
      filter: brightness(1.05) drop-shadow(0 4px 8px rgba(0,0,0,0.15));
      stroke-width: 2.5px !important;
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
      min-width: 165px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: left 0.08s ease-out, top 0.08s ease-out;
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

    /* Export styles removed */
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
  `]
})
export class HollowCandlestickChartComponent {
  private readonly exportSvc = inject(ChartExportService);

  readonly PAD_LEFT = 52;
  readonly PAD_TOP = 20;
  readonly PAD_RIGHT = 24;
  readonly PAD_BOTTOM = 36;

  data = input.required<CandlestickItem[]>();
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  showExport = input<boolean>(false);
  colors = input<string[]>(CHART_COLORS);
  bullishColor = input<string>('#10b981');
  bearishColor = input<string>('#ef4444');

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    date: string | Date;
    open: number;
    high: number;
    low: number;
    close: number;
    isUp: boolean;
    direction: string;
    hollowText: string;
    changePct: string;
  } | null>(null);

  containerWidth = signal<number>(600);
  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  private container = viewChild<ElementRef>('container');

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          // Subtract padding
          this.containerWidth.set(width - 32);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  innerW = computed(() => Math.max(200, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  innerH = computed(() => Math.max(100, this.height() - this.PAD_TOP - this.PAD_BOTTOM));

  yMin = computed(() => {
    const items = this.data();
    if (items.length === 0) return 0;
    const lows = items.map(d => d.low);
    const minVal = Math.min(...lows);
    return minVal * 0.99; // 1% safety margin
  });

  yMax = computed(() => {
    const items = this.data();
    if (items.length === 0) return 100;
    const highs = items.map(d => d.high);
    const maxVal = Math.max(...highs);
    return maxVal * 1.01; // 1% safety margin
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  xPos(index: number): number {
    const count = this.data().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.15; // padding
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

      // Color (compare close to previous close)
      let isUp = true;
      if (idx > 0) {
        isUp = item.close >= items[idx - 1].close;
      }
      const color = isUp ? this.bullishColor() : this.bearishColor();

      // Hollow/Solid (compare close to open of current day)
      const isHollow = item.close >= item.open;

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
        yBodyTop: y,
        yBodyBottom: y + rectH,
        color,
        isUp,
        isHollow,
        raw: item
      };
    });
  });

  shouldShowXLabel(index: number): boolean {
    const count = this.data().length;
    if (count <= 10) return true;
    if (count <= 25) return index % 2 === 0;
    if (count <= 50) return index % 5 === 0;
    return index % 10 === 0;
  }

  onCandleHover(event: MouseEvent, item: CandlestickItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    const items = this.data();
    let isUp = true;
    let changePct = '0.00%';
    if (index > 0) {
      const prev = items[index - 1];
      isUp = item.close >= prev.close;
      const change = item.close - prev.close;
      changePct = ((change / prev.close) * 100).toFixed(2) + '%';
    } else {
      isUp = item.close >= item.open;
      const change = item.close - item.open;
      changePct = ((change / item.open) * 100).toFixed(2) + '%';
    }

    const direction = isUp ? 'Up vs Yesterday' : 'Down vs Yesterday';
    const isHollow = item.close >= item.open;
    const hollowText = isHollow ? 'Hollow (Bullish Day)' : 'Solid (Bearish Day)';

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      isUp,
      direction,
      hollowText,
      changePct
    });
  }

  formatDate(d: string | Date): string {
    if (d instanceof Date) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return String(d);
  }

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToCsv(): void {
    const items = this.data();
    if (!items.length) return;
    const headers = ['Date', 'Open', 'High', 'Low', 'Close'];
    const rows = items.map(item => [this.formatDate(item.date), item.open, item.high, item.low, item.close]);
    this.exportSvc.downloadCsv(headers, rows, 'hollow-candlestick-data.csv');
  }

  exportToJson(): void {
    const items = this.data();
    if (!items.length) return;
    this.exportSvc.downloadJson(items, 'hollow-candlestick-data.json');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'hollow-candlestick-chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Hollow Candlestick Chart', 'hollow-candlestick-chart.pdf');
  }

  readonly fmtNum = fmtNum;
}
