import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { niceTicks, scale, fmtNum, CHART_COLORS } from '../shared/chart-utils';

export interface CandlestickItem {
  date: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface HeikinAshiCalculatedItem {
  date: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  original: CandlestickItem;
}

@Component({
  selector: 'ngx-heikin-ashi-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-heikin-ashi-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">📤 Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">📊 Export JSON</button>
                <button (click)="onExport('csv')">📄 Export CSV</button>
                <button (click)="onExport('svg')">🖼️ Export SVG</button>
                <button (click)="onExport('pdf')">📕 Export PDF</button>
              </div>
            }
          </div>
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
            <linearGradient id="ha-bullish-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="bullishColor()" />
              <stop offset="100%" [attr.stop-color]="bullishColor()" stop-opacity="0.8" />
            </linearGradient>
            <linearGradient id="ha-bearish-grad" x1="0" y1="0" x2="0" y2="1">
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
              @for (item of heikinAshiData(); track $index; let i = $index) {
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

            <!-- Heikin-Ashi Candles -->
            @for (candle of computedCandles(); track $index; let i = $index) {
              <!-- Wick Line (High to Low) -->
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
                [attr.fill]="candle.isBullish ? 'url(#ha-bullish-grad)' : 'url(#ha-bearish-grad)'"
                [attr.stroke]="candle.color"
                stroke-width="1"
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
              <div class="tooltip-direction" [style.color]="t.isBullish ? '#10b981' : '#ef4444'">
                <strong>{{ t.isBullish ? 'Bullish Trend' : 'Bearish Trend' }}</strong>
              </div>
              <!-- Tabular Tooltip for comparisons -->
              <div class="tooltip-columns">
                <div class="tooltip-col">
                  <div class="col-title">Original</div>
                  <div class="tooltip-val"><span>O:</span> <strong>{{ fmtNum(t.orig.open) }}</strong></div>
                  <div class="tooltip-val"><span>H:</span> <strong>{{ fmtNum(t.orig.high) }}</strong></div>
                  <div class="tooltip-val"><span>L:</span> <strong>{{ fmtNum(t.orig.low) }}</strong></div>
                  <div class="tooltip-val"><span>C:</span> <strong>{{ fmtNum(t.orig.close) }}</strong></div>
                </div>
                <div class="tooltip-col bordered">
                  <div class="col-title" style="color: #38bdf8;">Heikin-Ashi</div>
                  <div class="tooltip-val"><span>O:</span> <strong>{{ fmtNum(t.ha.open) }}</strong></div>
                  <div class="tooltip-val"><span>H:</span> <strong>{{ fmtNum(t.ha.high) }}</strong></div>
                  <div class="tooltip-val"><span>L:</span> <strong>{{ fmtNum(t.ha.low) }}</strong></div>
                  <div class="tooltip-val"><span>C:</span> <strong>{{ fmtNum(t.ha.close) }}</strong></div>
                </div>
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
    .ngx-heikin-ashi-chart {
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
      transition: fill 0.15s, opacity 0.15s, stroke-width 0.15s, filter 0.15s;
      animation: candleGrow 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .candle-rect.hovered {
      filter: brightness(1.05) drop-shadow(0 4px 10px rgba(0,0,0,0.18));
      stroke-width: 1.5px;
    }
    .crosshair-line {
      pointer-events: none;
    }

    /* Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.94));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 11px;
      z-index: 100;
      min-width: 210px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: left 0.08s ease-out, top 0.08s ease-out;
    }
    .tooltip-header {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      color: #38bdf8;
    }
    .tooltip-direction {
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .tooltip-columns {
      display: flex;
      gap: 12px;
    }
    .tooltip-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .tooltip-col.bordered {
      border-left: 1px solid rgba(255, 255, 255, 0.15);
      padding-left: 12px;
    }
    .col-title {
      font-weight: 600;
      font-size: 9.5px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .tooltip-val {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      color: rgba(248, 250, 252, 0.85);
    }
    .tooltip-val span {
      color: rgba(255, 255, 255, 0.55);
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
      font-weight: 700;
    }

    /* Export styles */
    .chart-export-menu {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 50;
    }
    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .export-trigger:hover {
      background: #fff;
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 120px;
      z-index: 60;
    }
    .export-dropdown button {
      background: none;
      border: none;
      padding: 6px 10px;
      font-size: 11px;
      text-align: left;
      cursor: pointer;
      color: #343a40;
      border-radius: 4px;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: var(--primary-color, #4f46e5);
    }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
  `]
})
export class HeikinAshiChartComponent {
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

  exportMenuOpen = signal(false);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    date: string | Date;
    isBullish: boolean;
    orig: CandlestickItem;
    ha: { open: number; high: number; low: number; close: number };
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

  // Compute Heikin-Ashi series
  heikinAshiData = computed<HeikinAshiCalculatedItem[]>(() => {
    const raw = this.data();
    if (raw.length === 0) return [];
    const ha: HeikinAshiCalculatedItem[] = [];

    // First item
    const item0 = raw[0];
    const haClose0 = (item0.open + item0.high + item0.low + item0.close) / 4;
    const haOpen0 = (item0.open + item0.close) / 2;
    const haHigh0 = Math.max(item0.high, haOpen0, haClose0);
    const haLow0 = Math.min(item0.low, haOpen0, haClose0);

    ha.push({
      date: item0.date,
      open: haOpen0,
      high: haHigh0,
      low: haLow0,
      close: haClose0,
      original: item0
    });

    // Subsequent items
    for (let i = 1; i < raw.length; i++) {
      const item = raw[i];
      const prev = ha[i - 1];

      const haClose = (item.open + item.high + item.low + item.close) / 4;
      const haOpen = (prev.open + prev.close) / 2;
      const haHigh = Math.max(item.high, haOpen, haClose);
      const haLow = Math.min(item.low, haOpen, haClose);

      ha.push({
        date: item.date,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
        original: item
      });
    }

    return ha;
  });

  yMin = computed(() => {
    const items = this.heikinAshiData();
    if (items.length === 0) return 0;
    const lows = items.map(d => d.low);
    const minVal = Math.min(...lows);
    return minVal * 0.99; // 1% safety margin
  });

  yMax = computed(() => {
    const items = this.heikinAshiData();
    if (items.length === 0) return 100;
    const highs = items.map(d => d.high);
    const maxVal = Math.max(...highs);
    return maxVal * 1.01; // 1% safety margin
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  xPos(index: number): number {
    const count = this.heikinAshiData().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.15; // padding
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  candleWidth(): number {
    const count = this.heikinAshiData().length || 1;
    return (this.innerW() / count) * 0.7; // 70% width
  }

  computedCandles = computed(() => {
    const items = this.heikinAshiData();
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

  shouldShowXLabel(index: number): boolean {
    const count = this.heikinAshiData().length;
    if (count <= 10) return true;
    if (count <= 25) return index % 2 === 0;
    if (count <= 50) return index % 5 === 0;
    return index % 10 === 0;
  }

  onCandleHover(event: MouseEvent, item: HeikinAshiCalculatedItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      date: item.date,
      isBullish: item.close >= item.open,
      orig: item.original,
      ha: { open: item.open, high: item.high, low: item.low, close: item.close }
    });
  }

  formatDate(d: string | Date): string {
    if (d instanceof Date) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return String(d);
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  @HostListener('document:click')
  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  onExport(type: 'json' | 'csv' | 'svg' | 'pdf'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToCsv(): void {
    const items = this.heikinAshiData();
    if (!items.length) return;
    let csv = 'Date,Orig_Open,Orig_High,Orig_Low,Orig_Close,HA_Open,HA_High,HA_Low,HA_Close\n';
    items.forEach(item => {
      csv += `"${this.formatDate(item.date)}",${item.original.open},${item.original.high},${item.original.low},${item.original.close},${item.open.toFixed(4)},${item.high.toFixed(4)},${item.low.toFixed(4)},${item.close.toFixed(4)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'heikin-ashi-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const blob = new Blob([JSON.stringify(this.heikinAshiData(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'heikin-ashi-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToSvg(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'heikin-ashi-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg || typeof window === 'undefined' || typeof document === 'undefined') return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker prevented printing. Please allow pop-ups for this site.');
      return;
    }

    const svgHtml = svg.outerHTML;
    const printTemplate = `
      <html>
      <head>
        <title>Heikin-Ashi Chart Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          .chart-container { display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #ffffff; width: 90%; }
          svg { width: 100%; height: auto; }
          .axis-label { font-size: 11px; fill: #6c757d; font-weight: 500; }
          @media print {
            body { padding: 0; }
            .chart-container { border: none; padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Heikin-Ashi Chart Analytics</div>
          <div class="date">${new Date().toLocaleString()}</div>
        </div>
        <div class="chart-container">
          ${svgHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printTemplate);
    printWindow.document.close();
  }

  readonly fmtNum = fmtNum;
}
