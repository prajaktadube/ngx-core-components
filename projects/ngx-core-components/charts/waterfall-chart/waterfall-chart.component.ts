import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener
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
            <linearGradient id="waterfall-pos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="positiveColor()" stop-opacity="1"/>
              <stop offset="100%" [attr.stop-color]="positiveColor()" stop-opacity="0.75"/>
            </linearGradient>
            <linearGradient id="waterfall-neg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="negativeColor()" stop-opacity="1"/>
              <stop offset="100%" [attr.stop-color]="negativeColor()" stop-opacity="0.75"/>
            </linearGradient>
            <linearGradient id="waterfall-tot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="totalColor()" stop-opacity="1"/>
              <stop offset="100%" [attr.stop-color]="totalColor()" stop-opacity="0.75"/>
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
                [attr.fill]="bar.fill"
                [attr.rx]="4"
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
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
      margin-bottom: 12px;
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
      font-weight: 550;
    }
    .waterfall-bar {
      cursor: pointer;
      transition: opacity 0.2s, filter 0.2s, stroke-width 0.2s;
      stroke: #fff;
      stroke-width: 0.5;
    }
    .waterfall-bar.hovered {
      opacity: 0.95;
      stroke-width: 1.5;
      filter: brightness(1.04) drop-shadow(0 4px 8px rgba(0,0,0,0.12));
    }
    .bar-value-label {
      font-size: 9px;
      fill: #ffffff;
      font-weight: 600;
      pointer-events: none;
    }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px;
      border-radius: 10px; font-size: 12px; min-width: 150px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 6px;
      margin-bottom: 8px;
      color: #38bdf8;
      font-size: 12.5px;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .tooltip-val {
      color: rgba(248, 250, 252, 0.8);
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }

    /* Export Trigger & Dropdown */
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
      color: #4f46e5;
      border-color: #4f46e5;
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
      font-family: inherit;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: #4f46e5;
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
  showExport = input<boolean>(false);

  hoveredIndex = signal<number | null>(null);
  exportMenuOpen = signal(false);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    value: number;
    balance: number;
    color: string;
  } | null>(null);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
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

      let fill = 'url(#waterfall-tot)';
      let color = this.totalColor();
      if (!item.isTotal) {
        fill = item.value >= 0 ? 'url(#waterfall-pos)' : 'url(#waterfall-neg)';
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
        fill,
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

  exportToJson(): void {
    const data = this.data();
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'waterfall-chart.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Value,Is Total\n';
    data.forEach(d => {
      csv += `"${d.label || ''}",${d.value},${d.isTotal ? 'true' : 'false'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'waterfall-chart.csv');
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
    if (!source.match(/^<svg[^>]+xmlns\:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'waterfall-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Chart Export</title>
          <style>
            body {
              margin: 20px;
              font-family: system-ui, sans-serif;
              text-align: center;
            }
            .print-container {
              display: inline-block;
              margin: 0 auto;
            }
            svg {
              width: 100%;
              height: auto;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${svgString}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  readonly fmtNum = fmtNum;
}
