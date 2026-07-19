import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, niceTicks, scale, fmtNum } from '../shared/chart-utils';

export interface ColumnRangePoint {
  category: string;
  low: number;
  high: number;
}

export interface ColumnRangeSeries {
  name: string;
  data: ColumnRangePoint[];
  color?: string;
}

@Component({
  selector: 'ngx-column-range-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-column-range-chart" (mouseleave)="onMouseLeave()">
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
      @if (showLegend() && series().length > 0) {
        <div class="chart-legend" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
          @for (s of series(); track s.name; let i = $index) {
            <div class="legend-item">
              <span class="legend-rect" [style.background]="seriesColor(i, s)"></span>
              <span class="legend-label">{{ s.name }}</span>
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

            <!-- X Axis Labels -->
            @for (cat of inferredCategories(); track cat; let i = $index) {
              <text
                [attr.x]="bandXCenter(i)"
                [attr.y]="innerH() + 16"
                text-anchor="middle"
                class="axis-label"
              >
                {{ cat }}
              </text>
            }

            <!-- Columns -->
            @for (s of series(); track s.name; let si = $index) {
              @for (d of s.data; track $index; let ci = $index) {
                @if (isValidPoint(d)) {
                  <rect
                    [attr.x]="barX(ci, si)"
                    [attr.y]="barY(d)"
                    [attr.width]="barWidth()"
                    [attr.height]="barHeight(d)"
                    [attr.fill]="seriesColor(si, s)"
                    rx="4"
                    ry="4"
                    class="column-rect"
                    [class.dimmed]="hoveredSeriesIndex() !== null && (hoveredSeriesIndex() !== si || hoveredCategoryIndex() !== ci)"
                    [class.highlighted]="hoveredSeriesIndex() === si && hoveredCategoryIndex() === ci"
                    (mouseenter)="onColumnHover(ci, si, d, $event)"
                    (mousemove)="onColumnMouseMove($event)"
                  />
                  <!-- Optional Labels on top/bottom of columns -->
                  @if (showLabels() && hoveredCategoryIndex() === ci && hoveredSeriesIndex() === si) {
                    <text
                      [attr.x]="barX(ci, si) + barWidth() / 2"
                      [attr.y]="barY(d) - 6"
                      text-anchor="middle"
                      class="label-text"
                    >
                      {{ fmtNum(d.high) }}
                    </text>
                    <text
                      [attr.x]="barX(ci, si) + barWidth() / 2"
                      [attr.y]="barY(d) + barHeight(d) + 12"
                      text-anchor="middle"
                      class="label-text"
                    >
                      {{ fmtNum(d.low) }}
                    </text>
                  }
                }
              }
            }

            <!-- Axis Line -->
            <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" class="axis-line" />
            <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
          </g>
        </svg>
      </div>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.category }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="t.color"></span>
            <span class="tt-name">{{ t.seriesName }}</span>
          </div>
          <div class="tt-row detail-row">
            <span class="tt-sub-label">High:</span>
            <span class="tt-val">{{ fmtNum(t.high) }}</span>
          </div>
          <div class="tt-row detail-row">
            <span class="tt-sub-label">Low:</span>
            <span class="tt-val">{{ fmtNum(t.low) }}</span>
          </div>
          <div class="tt-row detail-row range-row">
            <span class="tt-sub-label">Range Depth:</span>
            <span class="tt-val highlight">{{ fmtNum(t.high - t.low) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-column-range-chart {
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
    .axis-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--text-secondary, #94a3b8);
      user-select: none;
    }
    .label-text {
      font-size: 9px;
      fill: var(--text-primary, #1e293b);
      font-weight: bold;
      pointer-events: none;
    }
    .column-rect {
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.2s ease, fill-opacity 0.2s ease;
    }
    .column-rect.dimmed {
      opacity: 0.35;
    }
    .column-rect.highlighted {
      opacity: 1;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.12));
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
      min-width: 150px;
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
      color: rgba(248, 250, 252, 0.95);
      font-weight: 600;
      flex: 1;
    }
    .detail-row {
      padding-left: 16px;
      font-size: 11px;
    }
    .tt-sub-label {
      color: rgba(248, 250, 252, 0.65);
      flex: 1;
    }
    .tt-val {
      font-weight: 600;
      font-family: monospace;
    }
    .tt-val.highlight {
      color: #38bdf8;
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
export class ColumnRangeChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 15;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ColumnRangeSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  showLabels = input<boolean>(false);

  containerWidth = signal<number>(600);
  hoveredSeriesIndex = signal<number | null>(null);
  hoveredCategoryIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  exportMenuOpen = signal(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  innerW = computed(() => Math.max(10, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  innerH = computed(() => Math.max(10, this.height() - this.PAD_TOP - this.PAD_BOTTOM));

  inferredCategories = computed(() => {
    const cats = this.categories();
    if (cats.length > 0) return cats;
    const s = this.series();
    if (s.length === 0) return [];
    return s[0].data.map(d => d.category);
  });

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

  // Find min/max values for scale calculation
  private allValues = computed(() => this.series().flatMap(s => s.data.flatMap(d => [d.low, d.high])));
  
  private yMin = computed(() => {
    const vals = this.allValues();
    if (vals.length === 0) return 0;
    const min = Math.min(...vals);
    return min < 0 ? min * 1.1 : min * 0.95;
  });

  private yMax = computed(() => {
    const vals = this.allValues();
    if (vals.length === 0) return 100;
    const max = Math.max(...vals);
    return max < 0 ? max * 0.95 : max * 1.05;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  yPos(v: number): number {
    const ticks = this.yTicks();
    return scale(v, ticks[0], ticks[ticks.length - 1], this.innerH(), 0);
  }

  // Ordinal Band Scales logic
  bandW = computed(() => {
    const numCats = this.inferredCategories().length || 1;
    return this.innerW() / numCats;
  });

  groupW = computed(() => {
    return this.bandW() * 0.85; // 85% of band is used for series grouping
  });

  barWidth = computed(() => {
    const numSeries = this.series().length || 1;
    return this.groupW() / numSeries;
  });

  bandXCenter(i: number): number {
    return (i + 0.5) * this.bandW();
  }

  barX(i: number, si: number): number {
    const bandCenter = this.bandXCenter(i);
    const offset = -this.groupW() / 2 + si * this.barWidth();
    return bandCenter + offset + (this.barWidth() * 0.05); // center offset and keep padding
  }

  barY(d: ColumnRangePoint): number {
    const yL = this.yPos(d.low);
    const yH = this.yPos(d.high);
    return Math.min(yL, yH);
  }

  barHeight(d: ColumnRangePoint): number {
    const yL = this.yPos(d.low);
    const yH = this.yPos(d.high);
    return Math.max(1, Math.abs(yL - yH));
  }

  isValidPoint(d: ColumnRangePoint): boolean {
    return d !== null && d.low !== undefined && d.high !== undefined;
  }

  seriesColor(i: number, s: ColumnRangeSeries): string {
    return s.color || this.colors()[i % this.colors().length];
  }

  onColumnHover(ci: number, si: number, d: ColumnRangePoint, event: MouseEvent) {
    this.hoveredCategoryIndex.set(ci);
    this.hoveredSeriesIndex.set(si);
    const s = this.series()[si];
    this.tooltip.set({
      category: d.category,
      seriesName: s.name,
      low: d.low,
      high: d.high,
      color: this.seriesColor(si, s)
    });
  }

  onColumnMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-column-range-chart');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.tooltipX.set(event.clientX - rect.left);
      this.tooltipY.set(event.clientY - rect.top);
    }
  }

  onMouseLeave() {
    this.hoveredCategoryIndex.set(null);
    this.hoveredSeriesIndex.set(null);
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
    const cats = this.inferredCategories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    const data = cats.map((cat, ci) => {
      const entry: Record<string, any> = { category: cat };
      sers.forEach(s => {
        const point = s.data.find(d => d.category === cat);
        if (point) {
          entry[`${s.name}_low`] = point.low;
          entry[`${s.name}_high`] = point.high;
        }
      });
      return entry;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'column-range-chart.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToCsv(): void {
    const cats = this.inferredCategories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    let headers = ['Category'];
    sers.forEach(s => {
      headers.push(`"${s.name} Low"`, `"${s.name} High"`);
    });
    let csv = headers.join(',') + '\n';

    cats.forEach(cat => {
      const row = [`"${cat}"`];
      sers.forEach(s => {
        const point = s.data.find(d => d.category === cat);
        row.push(point ? String(point.low) : '', point ? String(point.high) : '');
      });
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'column-range-chart.csv');
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
    link.setAttribute('download', 'column-range-chart.svg');
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
        <title>Column Range Chart Export</title>
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
          <div class="title">Column Range Chart Analytics</div>
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
