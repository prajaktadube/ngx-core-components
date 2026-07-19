import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, HostListener, viewChild
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, niceTicks, scale, fmtNum } from '../shared/chart-utils';

export interface AreaRangeDataPoint {
  category: string;
  low: number;
  high: number;
}

export interface AreaRangeSeries {
  name: string;
  data: AreaRangeDataPoint[];
  color?: string;
}

@Component({
  selector: 'ngx-area-range-chart',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-area-range-chart" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="seriesColor(i, s)"></span>
              {{ s.name }} (Range)
            </span>
          }
        </div>
      }
      
      <div class="chart-svg-wrap">
        <svg #svgEl [attr.width]="'100%'" [attr.height]="height()" class="chart-svg">
          <defs>
            @for (s of series(); track s.name; let i = $index) {
              <linearGradient [attr.id]="'range-gradient-' + i" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.4"/>
                <stop offset="100%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.05"/>
              </linearGradient>
            }
          </defs>
          
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Gridlines -->
            @for (tick of yTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                @if (showGrid()) {
                  <line [attr.x1]="0" [attr.x2]="innerW()" stroke="var(--ngx-chart-grid, #e2e8f0)" stroke-dasharray="3,3"/>
                }
                <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
              </g>
            }

            <!-- X Axis Categories -->
            @for (cat of inferredCategories(); track cat; let i = $index) {
              <text [attr.x]="xPos(i)" [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">{{ cat }}</text>
            }

            <!-- Range Shaded Areas and Boundaries -->
            @for (s of series(); track s.name; let si = $index) {
              <!-- Area Fill -->
              <path
                [attr.d]="areaPath(s)"
                [attr.fill]="'url(#range-gradient-' + si + ')'"
                stroke="none"
                class="area-path"
              />
              
              <!-- High Boundary Line -->
              <path
                [attr.d]="highLinePath(s)"
                [attr.stroke]="seriesColor(si, s)"
                fill="none"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
                class="line-path high-boundary"
              />

              <!-- Low Boundary Line -->
              <path
                [attr.d]="lowLinePath(s)"
                [attr.stroke]="seriesColor(si, s)"
                fill="none"
                stroke-width="1.5"
                stroke-dasharray="3,3"
                stroke-linejoin="round"
                stroke-linecap="round"
                class="line-path low-boundary"
              />
              
              <!-- Hover Markers (dots on high and low bounds) -->
              @if (showMarkers() && animateState()) {
                @for (d of s.data; track $index; let ci = $index) {
                  <!-- High Dot -->
                  <circle
                    [attr.cx]="xPos(ci)"
                    [attr.cy]="yPos(d.high)"
                    [attr.r]="activeCategoryIndex() === ci ? 5 : 3.5"
                    [attr.fill]="seriesColor(si, s)"
                    [attr.stroke]="'#fff'"
                    [attr.stroke-width]="activeCategoryIndex() === ci ? 2 : 1.5"
                    class="marker-dot"
                  />
                  <!-- Low Dot -->
                  <circle
                    [attr.cx]="xPos(ci)"
                    [attr.cy]="yPos(d.low)"
                    [attr.r]="activeCategoryIndex() === ci ? 5 : 3.5"
                    [attr.fill]="seriesColor(si, s)"
                    [attr.stroke]="'#fff'"
                    [attr.stroke-width]="activeCategoryIndex() === ci ? 2 : 1.5"
                    class="marker-dot"
                  />
                  <!-- Optional Labels -->
                  @if (showLabels() && activeCategoryIndex() === ci) {
                    <text [attr.x]="xPos(ci)" [attr.y]="yPos(d.high) - 8" class="label-text" text-anchor="middle">{{ fmtNum(d.high) }}</text>
                    <text [attr.x]="xPos(ci)" [attr.y]="yPos(d.low) + 14" class="label-text" text-anchor="middle">{{ fmtNum(d.low) }}</text>
                  }
                }
              }
            }

            <!-- Vertical Crosshair -->
            @if (crosshair(); as ch) {
              <line [attr.x1]="ch.x" [attr.x2]="ch.x" y1="0" [attr.y2]="innerH()"
                stroke="var(--primary-color, #4f46e5)" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4,4"/>
            }

            <!-- Axis Lines -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
          </g>
        </svg>
      </div>

      <!-- Hover Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-cat">{{ t.cat }}</div>
          @for (row of t.rows; track row.name) {
            <div class="tt-row header-row">
              <span class="tt-dot" [style.background]="row.color"></span>
              <strong class="tt-name">{{ row.name }}</strong>
            </div>
            <div class="tt-row detail-row">
              <span class="tt-sub-label">High:</span>
              <span class="tt-val">{{ fmtNum(row.high) }}</span>
            </div>
            <div class="tt-row detail-row">
              <span class="tt-sub-label">Low:</span>
              <span class="tt-val">{{ fmtNum(row.low) }}</span>
            </div>
            <div class="tt-row detail-row range-row">
              <span class="tt-sub-label">Range:</span>
              <span class="tt-val highlight">{{ fmtNum(row.high - row.low) }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-area-range-chart {
      position: relative;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      padding: 0 0 12px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      font-weight: 500;
    }
    .legend-dot {
      width: 12px;
      height: 6px;
      border-radius: 2px;
      display: inline-block;
      opacity: 0.7;
    }
    .chart-svg-wrap {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
      cursor: crosshair;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--text-secondary, #94a3b8);
    }
    .label-text {
      font-size: 9px;
      fill: var(--text-primary, #1e293b);
      font-weight: bold;
      pointer-events: none;
    }
    
    @keyframes lineDraw {
      from { stroke-dashoffset: 1200; }
      to { stroke-dashoffset: 0; }
    }
    .line-path {
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: lineDraw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes areaFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .area-path {
      animation: areaFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
    }

    .marker-dot {
      animation: areaFadeIn 0.5s ease 0.8s both;
      transition: r 0.15s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.15s;
    }
    
    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-8px);
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
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 8px;
      font-size: 12.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 6px;
      color: #38bdf8;
    }
    .tt-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    .header-row {
      margin-top: 8px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 6px;
    }
    .header-row:first-of-type {
      margin-top: 0;
      border-top: none;
      padding-top: 0;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tt-name {
      color: rgba(248, 250, 252, 0.95);
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

    /* Export styles */
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
  `]
})
export class AreaRangeChartComponent {
  private readonly exportSvc = inject(ChartExportService);
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 15;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<AreaRangeSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showMarkers = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  showLabels = input<boolean>(false);
  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  crosshair = signal<{ x: number } | null>(null);
  activeCategoryIndex = signal<number | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; rows: { name: string; low: number; high: number; color: string }[] } | null>(null);
  containerWidth = signal<number>(600);

  innerW = computed(() => Math.max(10, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  innerH = computed(() => Math.max(10, this.height() - this.PAD_TOP - this.PAD_BOTTOM));

  inferredCategories = computed(() => {
    const cats = this.categories();
    if (cats.length > 0) return cats;
    const s = this.series();
    if (s.length === 0) return [];
    return s[0].data.map(d => d.category);
  });

  animateState = signal(false);

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
    setTimeout(() => this.animateState.set(true), 50);
  }

  private allLowHighValues = computed(() => this.series().flatMap(s => s.data.flatMap(d => [d.low, d.high])));
  private yMin = computed(() => {
    const vals = this.allLowHighValues();
    if (vals.length === 0) return 0;
    const min = Math.min(...vals);
    return min < 0 ? min * 1.1 : min * 0.95;
  });
  private yMax = computed(() => {
    const vals = this.allLowHighValues();
    if (vals.length === 0) return 100;
    const max = Math.max(...vals);
    return max < 0 ? max * 0.95 : max * 1.05;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  yPos(v: number): number {
    const ticks = this.yTicks();
    return scale(v, ticks[0], ticks[ticks.length - 1], this.innerH(), 0);
  }

  xPos(i: number): number {
    const n = this.inferredCategories().length;
    return n <= 1 ? this.innerW() / 2 : scale(i, 0, n - 1, 0, this.innerW());
  }

  seriesColor(i: number, s: AreaRangeSeries): string {
    return s.color || this.colors()[i % this.colors().length];
  }

  highLinePath(s: AreaRangeSeries): string {
    if (s.data.length === 0) return '';
    return 'M ' + s.data.map((d, i) => `${this.xPos(i)} ${this.yPos(d.high)}`).join(' L ');
  }

  lowLinePath(s: AreaRangeSeries): string {
    if (s.data.length === 0) return '';
    return 'M ' + s.data.map((d, i) => `${this.xPos(i)} ${this.yPos(d.low)}`).join(' L ');
  }

  areaPath(s: AreaRangeSeries): string {
    const data = s.data;
    if (data.length === 0) return '';
    const highPts = data.map((d, i) => `${this.xPos(i)} ${this.yPos(d.high)}`);
    const lowPts = [...data].reverse().map((d, i) => `${this.xPos(data.length - 1 - i)} ${this.yPos(d.low)}`);
    return `M ${highPts.join(' L ')} L ${lowPts.join(' L ')} Z`;
  }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.inferredCategories();
    if (cats.length === 0) return;
    const idx = Math.round(scale(mx, 0, this.innerW(), 0, cats.length - 1));
    const ci = Math.max(0, Math.min(cats.length - 1, idx));
    this.crosshair.set({ x: this.xPos(ci) });
    this.activeCategoryIndex.set(ci);

    const rows = this.series().map((s, si) => {
      const point = s.data[ci];
      return {
        name: s.name,
        low: point ? point.low : 0,
        high: point ? point.high : 0,
        color: this.seriesColor(si, s)
      };
    });

    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      rows
    });
  }

  onMouseLeave(): void {
    this.crosshair.set(null);
    this.activeCategoryIndex.set(null);
    this.tooltip.set(null);
  }

    onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    this.exportSvc.downloadJson(this.series(), 'area-range-data.json');
  }

  exportToCsv(): void {
    const sers = this.series();
    if (!sers.length) return;
    const headers = ['Series', 'Category', 'Low', 'High'];
    const rows: (string | number)[][] = [];
    sers.forEach(s => {
      s.data.forEach(d => {
        rows.push([s.name, d.category, d.low, d.high]);
      });
    });
    this.exportSvc.downloadCsv(headers, rows, 'area-range-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }


  readonly fmtNum = fmtNum;
}
