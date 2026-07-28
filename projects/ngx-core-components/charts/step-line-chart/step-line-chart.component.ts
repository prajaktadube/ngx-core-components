import { Component, ChangeDetectionStrategy, input, computed, signal, ElementRef, viewChild, inject, DestroyRef, TemplateRef, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent, ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, ChartSeries, niceTicks, scale, fmtNum, generateUniqueId } from '../shared/chart-utils';

@Component({
  selector: 'ngx-step-line-chart',
  standalone: true,
  imports: [ChartExportMenuComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-step-line-chart" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item"><span class="legend-line" [style.background]="seriesColor(i, s)"></span>{{ s.name }}</span>
          }
        </div>
      }
      <svg #svgEl [attr.width]="'100%'" [attr.height]="chartHeight()" class="chart-svg">
        <defs>
          @for (s of series(); track s.name; let i = $index) {
            <linearGradient [attr.id]="instanceId + '-area-grad-' + i" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.3"/>
              <stop offset="100%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.02"/>
            </linearGradient>
          }
        </defs>
        <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
          @for (tick of yTicks(); track tick) {
            <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
              @if (showGrid()) { <line [attr.x1]="0" [attr.x2]="innerW()" stroke="var(--ngx-chart-grid,#ebedf0)" stroke-dasharray="3,3"/> }
              <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ labelFormatter() ? labelFormatter()!(tick) : fmtNum(tick) }}</text>
            </g>
          }
          @for (ref of referenceLines(); track ref.label) {
            <g [attr.transform]="'translate(0,' + yPos(ref.value) + ')'">
              <line [attr.x1]="0" [attr.x2]="innerW()" [attr.stroke]="ref.color || '#ef4444'" [attr.stroke-dasharray]="'4,4'"/>
            </g>
          }
          @for (cat of categories(); track cat; let i = $index) {
            <text [attr.x]="xPos(i)" [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">{{ cat }}</text>
          }
          @for (s of series(); track s.name; let si = $index) {
            @if (showArea()) {
              <path [attr.d]="areaPath(s)" [attr.fill]="'url(#' + instanceId + '-area-grad-' + si + ')'" stroke="none" class="area-path"/>
            }
            <path [attr.d]="linePath(s)" [attr.stroke]="seriesColor(si, s)" fill="none" stroke-width="2.5" class="line-path"/>
            @if (showMarkers()) {
              @for (v of s.data; track $index; let ci = $index) {
                <circle [attr.cx]="xPos(ci)" [attr.cy]="yPos(v)" [attr.r]="activeCategoryIndex() === ci ? 6 : 4"
                  [attr.fill]="seriesColor(si, s)" class="marker-dot" stroke="#fff" stroke-width="2" (click)="pointClick.emit({category: categories()[ci], value: v, seriesName: s.name})" />
                @if (showLabels()) {
                  <text [attr.x]="xPos(ci)" [attr.y]="yPos(v) - 8" class="line-label" text-anchor="middle">{{ labelFormatter() ? labelFormatter()!(v) : fmtNum(v) }}</text>
                }
              }
            }
          }
          @if (crosshair(); as ch) {
            <line [attr.x1]="ch.x" [attr.x2]="ch.x" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)" stroke-dasharray="4,3" class="chart-crosshair"/>
          }
          <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)"/>
          <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)"/>
        </g>
      </svg>
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) { <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"></ng-container> }
          @else {
            <div class="tt-cat">{{ t.cat }}</div>
            @for (row of t.rows; track row.name) {
              <div class="tt-row"><span class="tt-dot" [style.background]="row.color"></span><span class="tt-name">{{ row.name }}</span><span class="tt-val">{{ labelFormatter() ? labelFormatter()!(row.value) : fmtNum(row.value) }}</span></div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .ngx-step-line-chart { position: relative; background: var(--ngx-chart-bg, #fff); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; }
    .legend-line { width: 18px; height: 4px; border-radius: 2px; display: inline-block; }
    .chart-svg { display: block; overflow: visible; }
    .axis-label { font-size: 11px; fill: var(--ngx-chart-axis-text,#6c757d); user-select: none; font-weight: 500; }
    .line-label { font-size: 11px; fill: var(--ngx-chart-axis-text,#6c757d); pointer-events: none; font-weight: 600; }
    .marker-dot { cursor: pointer; transition: r 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
    .line-path { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: lineDraw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .area-path { animation: areaFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
    @keyframes lineDraw { from { stroke-dashoffset: 2000; } to { stroke-dashoffset: 0; } }
    @keyframes areaFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px;
      border-radius: 10px; font-size: 12px; min-width: 150px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); z-index: 100;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat { font-weight: 700; margin-bottom: 8px; font-size: 12.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 6px; color: #38bdf8; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; }
    .tt-name { color: rgba(248, 250, 252, 0.8); flex: 1; }
    .tt-val { font-weight: 700; font-family: monospace; }
  `]
})
export class StepLineChartComponent {
  readonly instanceId = generateUniqueId('chart');
  private readonly exportSvc = inject(ChartExportService);

  readonly PAD_LEFT = 48; readonly PAD_TOP = 12; readonly PAD_RIGHT = 16; readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  stepMode = input<'before' | 'after' | 'middle'>('after');
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(false);
  showMarkers = input<boolean>(true);
  showArea = input<boolean>(false);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  referenceLines = input<{ value: number; label: string; color?: string; }[]>([]);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  pointClick = output<{ category: string; value: number; seriesName: string }>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(600);
  crosshair = signal<{ x: number } | null>(null);
  activeCategoryIndex = signal<number | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; rows: {name:string;value:number;color:string}[] } | null>(null);

  chartHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  innerH = computed(() => Math.max(10, this.chartHeight() - this.PAD_TOP - this.PAD_BOTTOM));

  private allValues = computed(() => this.series().flatMap(s => s.data));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || !entries.length) return;
        const width = entries[0].contentRect.width;
        if (width > 0) this.containerWidth.set(width);
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  yPos(v: number): number { return scale(v, this.yMin(), this.yMax(), this.innerH(), 0); }
  xPos(i: number): number {
    const n = this.categories().length;
    return n <= 1 ? this.innerW() / 2 : scale(i, 0, n - 1, 0, this.innerW());
  }

  seriesColor(i: number, s: ChartSeries): string { return s.color || this.colors()[i % this.colors().length]; }

  stepPath(points: [number, number][]): string {
    if (points.length < 2) return '';
    const mode = this.stepMode();
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      if (mode === 'after') {
        d += ` L ${curr[0]} ${prev[1]} L ${curr[0]} ${curr[1]}`;
      } else if (mode === 'before') {
        d += ` L ${prev[0]} ${curr[1]} L ${curr[0]} ${curr[1]}`;
      } else {
        const midX = (prev[0] + curr[0]) / 2;
        d += ` L ${midX} ${prev[1]} L ${midX} ${curr[1]} L ${curr[0]} ${curr[1]}`;
      }
    }
    return d;
  }

  linePath(s: ChartSeries): string {
    return this.stepPath(s.data.map((v, i) => [this.xPos(i), this.yPos(v)]));
  }

  areaPath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    if (pts.length < 2) return '';
    const line = this.stepPath(pts);
    return line + ` L ${pts[pts.length - 1][0]} ${this.innerH()} L ${pts[0][0]} ${this.innerH()} Z`;
  }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.categories();
    if (!cats.length) return;
    const idx = Math.round(scale(mx, 0, this.innerW(), 0, cats.length - 1));
    const ci = Math.max(0, Math.min(cats.length - 1, idx));
    this.crosshair.set({ x: this.xPos(ci) });
    this.activeCategoryIndex.set(ci);
    const rows = this.series().map((s, si) => ({
      name: s.name, value: s.data[ci] ?? 0, color: this.seriesColor(si, s),
    }));
    this.tooltip.set({ x: event.clientX - rect.left, y: event.clientY - rect.top, cat: cats[ci], rows });
  }

  onMouseLeave(): void {
    this.crosshair.set(null); this.activeCategoryIndex.set(null); this.tooltip.set(null);
  }

  onExport(type: ExportFormat): void {
    if (type === 'svg') this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'step-line-chart.svg');
    else if (type === 'pdf') this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Step Line Chart', 'step-line-chart.pdf');
  }

  readonly fmtNum = fmtNum;
}
