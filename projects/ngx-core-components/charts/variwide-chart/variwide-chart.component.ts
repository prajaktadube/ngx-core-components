import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, niceTicks, scale, fmtNum } from '../shared/chart-utils';

export interface VariwidePoint {
  label: string;
  y: number;   // Height value (e.g. price, percentage, rate)
  w: number;   // Width value (e.g. quantity, volume, size)
  color?: string;
}

@Component({
  selector: 'ngx-variwide-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-variwide-chart" (mouseleave)="onMouseLeave()">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
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

      <!-- Legend -->
      @if (showLegend() && data().length > 0) {
        <div class="chart-legend" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
          @for (d of data(); track d.label; let i = $index) {
            <div class="legend-item">
              <span class="legend-rect" [style.background]="pointColor(i, d)"></span>
              <span class="legend-label">{{ d.label }} (w: {{ fmtNum(d.w) }})</span>
            </div>
          }
        </div>
      }

      <div class="chart-svg-wrap">
        <svg #svgEl [attr.width]="'100%'" [attr.height]="height()" class="chart-svg">
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines -->
            @for (tick of yTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                @if (showGrid()) {
                  <line [attr.x1]="0" [attr.x2]="innerW()" class="grid-line" stroke-dasharray="3,3" />
                }
                <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
              </g>
            }

            <!-- Variwide Columns -->
            @for (p of computedPoints(); track p.label; let i = $index) {
              <rect
                [attr.x]="p.colX"
                [attr.y]="p.rectY"
                [attr.width]="p.colW"
                [attr.height]="p.colH"
                [attr.fill]="p.color"
                stroke="#ffffff"
                stroke-width="1.5"
                class="variwide-rect"
                [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
                [class.highlighted]="hoveredIndex() === i"
                (mouseenter)="onColumnHover(i, p, $event)"
                (mousemove)="onColumnMouseMove($event)"
              />
              
              <!-- Column Division Gridline -->
              @if (i > 0 && showGrid()) {
                <line
                  [attr.x1]="p.colX"
                  [attr.x2]="p.colX"
                  [attr.y1]="0"
                  [attr.y2]="innerH()"
                  class="column-divider-line"
                  stroke-dasharray="2,2"
                />
              }

              <!-- Centered X Category Label -->
              <text
                [attr.x]="p.colX + p.colW / 2"
                [attr.y]="innerH() + 16"
                text-anchor="middle"
                class="axis-label category-label"
              >
                {{ p.label }}
              </text>

              <!-- Optional labels inside/above columns -->
              @if (showLabels() && hoveredIndex() === i) {
                <text
                  [attr.x]="p.colX + p.colW / 2"
                  [attr.y]="p.rectY - 6"
                  text-anchor="middle"
                  class="label-text"
                >
                  {{ fmtNum(p.y) }}
                </text>
              }
            }

            <!-- Zero Baseline Line -->
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="yPos(0)" [attr.y2]="yPos(0)" class="baseline-line" />
            
            <!-- Border lines -->
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" class="axis-line" />
            <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
          </g>
        </svg>
      </div>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.label }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="t.color"></span>
            <span class="tt-name">Height (Y-Value):</span>
            <span class="tt-val highlight">{{ fmtNum(t.y) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">Width (Weight):</span>
            <span class="tt-val">{{ fmtNum(t.w) }}</span>
          </div>
          <div class="tt-row detail-row range-row">
            <span class="tt-sub-label">Width Share:</span>
            <span class="tt-val">{{ t.pct }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-variwide-chart {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
      position: relative;
      width: 100%;
    }
    .chart-svg-wrap {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .grid-line {
      stroke: var(--ngx-chart-grid, #f1f5f9);
      stroke-width: 1;
    }
    .column-divider-line {
      stroke: var(--ngx-chart-grid, #e2e8f0);
      stroke-width: 1;
      opacity: 0.5;
    }
    .axis-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .baseline-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1;
      stroke-opacity: 0.8;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--text-secondary, #94a3b8);
      user-select: none;
    }
    .category-label {
      font-size: 9.5px;
      fill: var(--text-secondary, #64748b);
    }
    .label-text {
      font-size: 9.5px;
      fill: var(--text-primary, #1e293b);
      font-weight: bold;
      pointer-events: none;
    }
    .variwide-rect {
      cursor: pointer;
      transition: opacity 0.2s ease, fill-opacity 0.2s ease;
    }
    .variwide-rect.dimmed {
      opacity: 0.35;
    }
    .variwide-rect.highlighted {
      opacity: 1;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));
    }
    
    /* Legend */
    .chart-legend {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-rect {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }
    .legend-label {
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      font-weight: 500;
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
      font-size: 11.5px;
      min-width: 160px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 6px;
      font-size: 12.5px;
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
      color: rgba(248, 250, 252, 0.85);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
    }
    .tt-val.highlight {
      color: #38bdf8;
    }
    .detail-row {
      padding-left: 16px;
      font-size: 11px;
    }
    .tt-sub-label {
      color: rgba(248, 250, 252, 0.65);
      flex: 1;
    }
    .range-row {
      border-top: 1px dotted rgba(255, 255, 255, 0.1);
      margin-top: 2px;
      padding-top: 2px;
    }

    /* Export dropdown styles */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
      position: relative;
    }
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
  `]
})
export class VariwideChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 15;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  data = input<VariwidePoint[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  showLabels = input<boolean>(false);

  containerWidth = signal<number>(600);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  innerW = computed(() => Math.max(10, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  innerH = computed(() => Math.max(10, this.height() - this.PAD_TOP - this.PAD_BOTTOM));

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          this.containerWidth.set(width - 40);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  // Width Calculations
  totalWidthVal = computed(() => {
    return this.data().reduce((acc, d) => acc + (d.w || 0), 0) || 1;
  });

  // Height scaling
  private allYValues = computed(() => this.data().map(d => d.y));

  private yMin = computed(() => {
    const vals = this.allYValues();
    if (vals.length === 0) return 0;
    const min = Math.min(...vals);
    return min < 0 ? min * 1.1 : 0;
  });

  private yMax = computed(() => {
    const vals = this.allYValues();
    if (vals.length === 0) return 100;
    const max = Math.max(...vals);
    return max < 0 ? 0 : max * 1.1;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  yPos(v: number): number {
    const ticks = this.yTicks();
    return scale(v, ticks[0], ticks[ticks.length - 1], this.innerH(), 0);
  }

  pointColor(i: number, p: VariwidePoint): string {
    return p.color || this.colors()[i % this.colors().length];
  }

  // Pre-calculate positions and widths of columns
  computedPoints = computed(() => {
    const raw = this.data();
    const totalWVal = this.totalWidthVal();
    const wScale = this.innerW() / totalWVal;
    
    let currentX = 0;
    const yBaseline = this.yPos(0);

    return raw.map((d, i) => {
      const colW = (d.w || 0) * wScale;
      const colX = currentX;
      currentX += colW;

      const yVal = this.yPos(d.y);
      const rectY = Math.min(yBaseline, yVal);
      const colH = Math.max(1, Math.abs(yBaseline - yVal));

      return {
        ...d,
        colX,
        colW,
        rectY,
        colH,
        color: this.pointColor(i, d)
      };
    });
  });

  onColumnHover(idx: number, p: any, event: MouseEvent) {
    this.hoveredIndex.set(idx);
    const totalW = this.totalWidthVal();
    const pct = totalW > 0 ? ((p.w / totalW) * 100).toFixed(1) + '%' : '0%';
    this.tooltip.set({
      label: p.label,
      y: p.y,
      w: p.w,
      pct,
      color: p.color
    });
  }

  onColumnMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-variwide-chart');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredIndex.set(null);
    this.tooltip.set(null);
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
    link.setAttribute('download', 'variwide-chart.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const totalW = this.totalWidthVal();
    
    let csv = 'Label,Height (Y-Value),Width (Weight),Width Share\n';
    data.forEach(d => {
      const pct = totalW > 0 ? ((d.w / totalW) * 100).toFixed(2) + '%' : '0%';
      csv += `"${d.label}",${d.y},${d.w},${pct}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'variwide-chart.csv');
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
    link.setAttribute('download', 'variwide-chart.svg');
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
        <title>Variwide Chart Export</title>
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
          <div class="title">Variwide Chart Analytics</div>
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
