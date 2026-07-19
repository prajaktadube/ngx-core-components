import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef, TemplateRef, output
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, ChartSeries, niceTicks, scale, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-bar-chart',
  standalone: true,
  imports: [ChartExportMenuComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-bar-chart"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="seriesColor(i)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }

      <!-- SVG Chart -->
      <svg
        #svgEl
        [attr.width]="'100%'"
        [attr.height]="chartHeight()"
        class="chart-svg"
      >
        <defs>
          @for (s of series(); track s.name; let i = $index) {
            <linearGradient [attr.id]="'bar-grad-' + i" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="seriesColor(i)" stop-opacity="1"/>
              <stop offset="100%" [attr.stop-color]="seriesColor(i)" stop-opacity="0.75"/>
            </linearGradient>
          }
        </defs>
        <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">

          <!-- Y axis grid lines + labels -->
          @for (tick of yTicks(); track tick) {
            <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
              @if (showGrid()) {
                <line
                  [attr.x1]="0" [attr.x2]="innerW()"
                  stroke="var(--ngx-chart-grid, #ebedf0)" stroke-dasharray="3,3"
                />
              }
              <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ labelFormatter() ? labelFormatter()!(tick) : fmtNum(tick) }}</text>
            </g>
          }

          <!-- Reference Lines -->
          @for (ref of referenceLines(); track ref.label) {
            <g [attr.transform]="'translate(0,' + yPos(ref.value) + ')'">
              <line
                [attr.x1]="0" [attr.x2]="innerW()"
                [attr.stroke]="ref.color || '#ef4444'"
                [attr.stroke-dasharray]="ref.strokeDasharray || '4,4'"
                stroke-width="1.5"
              />
              <text
                [attr.x]="innerW() - 4"
                y="-6"
                class="reference-line-label"
                text-anchor="end"
                [attr.fill]="ref.color || '#ef4444'"
              >
                {{ ref.label }}: {{ labelFormatter() ? labelFormatter()!(ref.value) : fmtNum(ref.value) }}
              </text>
            </g>
          }

          <!-- Column Highlight Ruler (Enterprise interactive UX) -->
          @if (activeColumnIndex() !== null) {
            <rect
              [attr.x]="colStartX(activeColumnIndex()!)"
              [attr.y]="0"
              [attr.width]="groupW()"
              [attr.height]="innerH()"
              class="column-ruler"
            />
          }

          <!-- X axis category labels -->
          @for (cat of categories(); track cat; let i = $index) {
            <text
              [attr.x]="catMidX(i)"
              [attr.y]="innerH() + 16"
              class="axis-label"
              text-anchor="middle"
            >{{ cat }}</text>
          }

          <!-- Bars -->
          @for (s of series(); track s.name; let si = $index) {
            @for (v of s.data; track $index; let ci = $index) {
              @if (v !== null && v !== undefined) {
                <rect
                  [attr.x]="barX(ci, si)"
                  [attr.y]="barY(v)"
                  [attr.width]="singleBarWidth()"
                  [attr.height]="barH(v)"
                  [attr.fill]="s.color ? s.color : 'url(#bar-grad-' + si + ')'"
                  [attr.rx]="4"
                  class="bar-rect"
                  (click)="onBarClick(ci, si, v)"
                />
                @if (showLabels() && animateState()) {
                  <text
                    [attr.x]="barX(ci, si) + singleBarWidth() / 2"
                    [attr.y]="barY(v) - 4"
                    class="bar-label"
                    text-anchor="middle"
                  >{{ labelFormatter() ? labelFormatter()!(v) : fmtNum(v) }}</text>
                }
              }
            }
          }

          <!-- Axes -->
          <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
        </g>
      </svg>

      <!-- Advanced Grouped Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container
              *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"
            ></ng-container>
          } @else {
            <div class="tt-cat">{{ t.cat }}</div>
            @for (row of t.rows; track row.name) {
              <div class="tt-row">
                <span class="tt-dot" [style.background]="row.color"></span>
                <span class="tt-name">{{ row.name }}</span>
                <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(row.value) : fmtNum(row.value) }}</span>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    .ngx-bar-chart { position: relative; background: var(--ngx-chart-bg, #fff); font-family: inherit; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text, #6c757d); font-weight: 500; }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
    .chart-svg { display: block; overflow: visible; }
    .axis-label { font-size: 11px; fill: var(--ngx-chart-axis-text, #6c757d); user-select: none; font-weight: 500; }
    .column-ruler { fill: rgba(99, 102, 241, 0.03); stroke: rgba(99, 102, 241, 0.08); stroke-width: 1; rx: 6; ry: 6; pointer-events: none; transition: x 0.15s cubic-bezier(0.16, 1, 0.3, 1), width 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
    
    .reference-line-label { font-size: 10px; font-weight: 700; user-select: none; }

    .bar-rect {
      cursor: pointer;
      transition: y 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s, stroke-width 0.15s;
      stroke: #fff;
      stroke-width: 0.5;
    }
    .bar-rect:hover {
      fill-opacity: 0.9;
      stroke-width: 1.5;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08));
    }
    .bar-label { font-size: 11px; fill: var(--ngx-chart-axis-text, #6c757d); pointer-events: none; font-weight: 600; }
    
    /* Premium Glassmorphic Tooltip */
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
    .tt-cat { font-weight: 700; margin-bottom: 8px; font-size: 12.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 6px; color: #38bdf8; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tt-name { color: rgba(248, 250, 252, 0.8); flex: 1; }
    .tt-val { font-weight: 700; font-family: monospace; }

    /* Export styles */
    `]
})
export class BarChartComponent {
  private readonly exportSvc = inject(ChartExportService);
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 12;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(false);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  referenceLines = input<{ value: number; label: string; color?: string; strokeDasharray?: string }[]>([]);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  barClick = output<{ category: string; value: number; seriesName: string }>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  animateState = signal(false);
  activeColumnIndex = signal<number | null>(null);
  containerWidth = signal<number>(600);

  tooltip = signal<{ x: number; y: number; cat: string; rows: { name: string; value: number; color: string }[] } | null>(null);

  chartHeight = computed(() => this.height());
  innerW = computed(() => this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.chartHeight() - this.PAD_TOP - this.PAD_BOTTOM);

  private allValues = computed(() => this.series().flatMap(s => s.data.filter(v => v != null)));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          this.containerWidth.set(width);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
    // Start growth load animations
    setTimeout(() => this.animateState.set(true), 50);
  }

  yPos(v: number): number {
    return scale(v, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  barY(v: number): number {
    if (!this.animateState()) return this.yPos(0);
    return Math.min(this.yPos(0), this.yPos(v));
  }

  barH(v: number): number {
    if (!this.animateState()) return 0;
    return Math.abs(this.yPos(0) - this.yPos(v));
  }

  groupW = computed(() => this.categories().length > 0 ? this.innerW() / this.categories().length : 0);
  
  singleBarWidth = computed(() => {
    const n = this.series().length || 1;
    return Math.max(4, (this.groupW() - 8) / n);
  });

  catMidX(i: number): number { return i * this.groupW() + this.groupW() / 2; }
  
  barX(ci: number, si: number): number {
    const n = this.series().length;
    const gx = ci * this.groupW() + 4;
    return gx + si * this.singleBarWidth();
  }

  colStartX(i: number): number {
    return i * this.groupW();
  }

  seriesColor(i: number): string { return this.colors()[i % this.colors().length]; }
  barColor(si: number, s: ChartSeries): string { return s.color || this.seriesColor(si); }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.categories();
    if (cats.length === 0) return;

    // Determine hover category column index
    const idx = Math.floor(mx / this.groupW());
    const ci = Math.max(0, Math.min(cats.length - 1, idx));

    this.activeColumnIndex.set(ci);

    const rows = this.series().map((s, si) => ({
      name: s.name,
      value: s.data[ci] ?? 0,
      color: this.barColor(si, s),
    }));

    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      rows
    });
  }

  onBarClick(ci: number, si: number, v: number): void {
    const s = this.series()[si];
    const cats = this.categories();
    this.barClick.emit({
      category: cats[ci] ?? '',
      value: v,
      seriesName: s?.name ?? ''
    });
  }

  onMouseLeave(): void {
    this.activeColumnIndex.set(null);
    this.tooltip.set(null);
  }

    onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;
    const data = cats.map((cat, ci) => {
      const entry: Record<string, any> = { category: cat };
      sers.forEach(s => {
        if (s.data[ci] !== undefined && s.data[ci] !== null) {
          entry[s.name] = s.data[ci];
        }
      });
      return entry;
    });
    this.exportSvc.downloadJson(data, 'bar-chart-data.json');
  }

  exportToCsv(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;
    const headers = ['Category', ...sers.map(s => s.name)];
    const rows: (string | number)[][] = cats.map((cat, ci) => [cat, ...sers.map(s => s.data[ci] ?? '')]);
    this.exportSvc.downloadCsv(headers, rows, 'bar-chart-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }


  readonly fmtNum = fmtNum;
}
