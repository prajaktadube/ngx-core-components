import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { CommonModule } from '@angular/common';
import { niceTicks, scale, fmtNum } from '../shared/chart-utils';

export interface BoxPlotItem {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

@Component({
  selector: 'ngx-box-plot-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-box-plot-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
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
            <linearGradient id="boxplot-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.32" />
              <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0.08" />
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
                [attr.x]="xPos(i) + boxWidth() / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ item.label }}</text>
            }

            <!-- Box Plot Elements -->
            @for (box of computedBoxes(); track $index; let i = $index) {
              <!-- Whiskers (Vertical Lines) -->
              <line
                [attr.centerX]="box.centerX"
                [attr.x1]="box.centerX"
                [attr.x2]="box.centerX"
                [attr.y1]="box.yMin"
                [attr.y2]="box.yMax"
                [attr.stroke]="color()"
                stroke-width="1.5"
                class="whisker-line"
              />

              <!-- Whisker Caps (Horizontal Lines) -->
              <line
                [attr.x1]="box.centerX - capWidth() / 2"
                [attr.x2]="box.centerX + capWidth() / 2"
                [attr.y1]="box.yMin"
                [attr.y2]="box.yMin"
                [attr.stroke]="color()"
                stroke-width="1.5"
                class="whisker-line"
              />
              <line
                [attr.x1]="box.centerX - capWidth() / 2"
                [attr.x2]="box.centerX + capWidth() / 2"
                [attr.y1]="box.yMax"
                [attr.y2]="box.yMax"
                [attr.stroke]="color()"
                stroke-width="1.5"
                class="whisker-line"
              />

              <!-- Interquartile Box -->
              <rect
                [attr.x]="box.x"
                [attr.y]="box.yQ3"
                [attr.width]="box.width"
                [attr.height]="box.boxHeight"
                fill="url(#boxplot-grad)"
                [attr.stroke]="color()"
                stroke-width="2"
                [attr.rx]="4"
                class="boxplot-rect"
                [class.hovered]="hoveredIndex() === i"
                [style.transform-origin]="box.centerX + 'px ' + box.yMedian + 'px'"
                [style.animation-delay]="i * 0.05 + 's'"
                (mouseenter)="onBoxHover($event, box.raw, i)"
                (mousemove)="onBoxHover($event, box.raw, i)"
              />

              <!-- Median line -->
              <line
                [attr.x1]="box.x"
                [attr.x2]="box.x + box.width"
                [attr.y1]="box.yMedian"
                [attr.y2]="box.yMedian"
                [attr.stroke]="color()"
                stroke-width="2.5"
                class="median-line"
              />

              <!-- Outliers (plotted as circles) -->
              @for (outlier of box.outlierPoints; track $index) {
                <circle
                  [attr.cx]="box.centerX"
                  [attr.cy]="outlier.y"
                  [attr.r]="3.5"
                  [attr.fill]="outlierColor()"
                  [attr.stroke]="'#ffffff'"
                  stroke-width="1.2"
                  class="outlier-dot"
                  [style.transform-origin]="box.centerX + 'px ' + outlier.y + 'px'"
                  (mouseenter)="onOutlierHover($event, box.raw.label, outlier.value)"
                  (mousemove)="onOutlierHover($event, box.raw.label, outlier.value)"
                />
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
              @if (t.isOutlier) {
                <div class="tooltip-val">
                  <span>Outlier:</span>
                  <strong>{{ fmtNum(t.outlierVal!) }}</strong>
                </div>
              } @else {
                <div class="tooltip-val">
                  <span>Maximum:</span>
                  <strong>{{ fmtNum(t.max) }}</strong>
                </div>
                <div class="tooltip-val">
                  <span>Third Quartile (Q3):</span>
                  <strong>{{ fmtNum(t.q3) }}</strong>
                </div>
                <div class="tooltip-val" style="color: #38bdf8;">
                  <span>Median:</span>
                  <strong>{{ fmtNum(t.median) }}</strong>
                </div>
                <div class="tooltip-val">
                  <span>First Quartile (Q1):</span>
                  <strong>{{ fmtNum(t.q1) }}</strong>
                </div>
                <div class="tooltip-val">
                  <span>Minimum:</span>
                  <strong>{{ fmtNum(t.min) }}</strong>
                </div>
              }
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
    .ngx-box-plot-chart {
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

    @keyframes boxPlotGrow {
      from { transform: scaleY(0); opacity: 0; }
      to { transform: scaleY(1); opacity: 1; }
    }

    .boxplot-rect {
      cursor: pointer;
      transition: opacity 0.2s, fill 0.2s, stroke-width 0.2s, filter 0.2s;
      animation: boxPlotGrow 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .boxplot-rect:hover, .boxplot-rect.hovered {
      filter: brightness(1.05) drop-shadow(0 4px 8px rgba(0,0,0,0.15));
      stroke-width: 2.5px;
    }

    @keyframes whiskerFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .whisker-line, .median-line {
      animation: whiskerFade 0.6s ease-out 0.2s both;
    }

    @keyframes outlierPop {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .outlier-dot {
      cursor: crosshair;
      transition: r 0.2s cubic-bezier(0.16, 1, 0.3, 1), fill 0.2s;
      animation: outlierPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
    }
    .outlier-dot:hover {
      r: 5.5px;
      fill: #ef4444;
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
      font-size: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      color: #38bdf8;
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
export class BoxPlotChartComponent {
  private readonly exportSvc = inject(ChartExportService);
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<BoxPlotItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  showExport = input<boolean>(false);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  // Styles
  color = input<string>('#4f46e5'); // Primary Indigo
  fillColor = input<string>('rgba(79, 70, 229, 0.12)'); // Translucent primary
  outlierColor = input<string>('#ef4444'); // Red/Rose

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    isOutlier: boolean;
    outlierVal?: number;
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

  // Range and Ticks bounds calculation
  yMin = computed(() => {
    const items = this.data();
    if (items.length === 0) return 0;
    const allVals = items.flatMap(item => [
      item.min,
      ...(item.outliers || [])
    ]);
    const minVal = Math.min(...allVals);
    return minVal < 0 ? minVal * 1.15 : minVal * 0.85;
  });

  yMax = computed(() => {
    const items = this.data();
    if (items.length === 0) return 100;
    const allVals = items.flatMap(item => [
      item.max,
      ...(item.outliers || [])
    ]);
    return Math.max(...allVals) * 1.15;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Box positions
  xPos(index: number): number {
    const count = this.data().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.2;
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  boxWidth(): number {
    const count = this.data().length || 1;
    return (this.innerW() / count) * 0.6;
  }

  capWidth(): number {
    return this.boxWidth() * 0.45;
  }

  computedBoxes = computed(() => {
    const items = this.data();
    const count = items.length;
    if (count === 0) return [];
    const width = this.boxWidth();

    return items.map((item, idx) => {
      const x = this.xPos(idx);
      const centerX = x + width / 2;

      const yMin = this.yPos(item.min);
      const yQ1 = this.yPos(item.q1);
      const yMedian = this.yPos(item.median);
      const yQ3 = this.yPos(item.q3);
      const yMax = this.yPos(item.max);

      const boxHeight = Math.abs(yQ1 - yQ3);

      const outlierPoints = (item.outliers || []).map(val => ({
        value: val,
        y: this.yPos(val)
      }));

      return {
        x,
        centerX,
        width,
        yMin,
        yQ1,
        yMedian,
        yQ3,
        yMax,
        boxHeight,
        outlierPoints,
        raw: item
      };
    });
  });

  onBoxHover(event: MouseEvent, item: BoxPlotItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: item.label,
      min: item.min,
      q1: item.q1,
      median: item.median,
      q3: item.q3,
      max: item.max,
      isOutlier: false
    });
  }

  onOutlierHover(event: MouseEvent, label: string, outlierVal: number) {
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: `${label} outlier`,
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      isOutlier: true,
      outlierVal
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

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const headers = ['Label', 'Min', 'Q1', 'Median', 'Q3', 'Max'];
    const rows = data.map(d => [d.label, d.min, d.q1, d.median, d.q3, d.max]);
    this.exportSvc.downloadCsv(headers, rows, 'box-plot-data.csv');
  }

  exportToJson(): void {
    const data = this.data();
    this.exportSvc.downloadJson(data, 'box-plot-data.json');
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
    link.setAttribute('download', 'box-plot-chart.svg');
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
        <title>Box Plot Chart Export</title>
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
          <div class="title">Box Plot Chart Analytics</div>
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
