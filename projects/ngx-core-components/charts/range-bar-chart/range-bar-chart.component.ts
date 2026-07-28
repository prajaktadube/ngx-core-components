import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, inject, DestroyRef, TemplateRef, output
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent, type ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, niceTicks, scale, generateUniqueId, fmtNum } from '../shared/chart-utils';

export interface RangeBarItem {
  label: string;
  start: number;
  end: number;
  color?: string;
  category?: string;
}

@Component({
  selector: 'ngx-range-bar-chart',
  standalone: true,
  imports: [ChartExportMenuComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-range-bar-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      @if (showLegend()) {
        <div class="chart-legend">
          @for (c of categories(); track c; let i = $index) {
            @if (c) {
              <span class="legend-item">
                <span class="legend-dot" [style.background]="colors()[i % colors().length]"></span>
                {{ c }}
              </span>
            }
          }
        </div>
      }

      <div class="chart-body">
        <svg #svgEl [attr.width]="'100%'" [attr.height]="calculatedHeight()" class="chart-svg">
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            
            <!-- X axis grid and ticks -->
            @for (tick of xTicks(); track tick) {
              <g [attr.transform]="'translate(' + xPos(tick) + ', 0)'">
                @if (showGrid()) {
                  <line [attr.y1]="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-grid,#ebedf0)" stroke-dasharray="3,3"/>
                }
                <text [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">
                  {{ labelFormatter() ? labelFormatter()!(tick) : fmtNum(tick) }}
                </text>
              </g>
            }

            <!-- Y axis items and bars -->
            @for (layout of layoutData(); track layout.id; let i = $index) {
              @if (layout.isHeader) {
                <text
                  x="-8"
                  [attr.y]="layout.y + barHeight() / 2"
                  class="category-header"
                  text-anchor="end"
                  dominant-baseline="middle"
                >{{ layout.label }}</text>
                <line x1="0" [attr.x2]="innerW()" [attr.y1]="layout.y + barHeight()/2" [attr.y2]="layout.y + barHeight()/2" stroke="var(--ngx-chart-grid,#ebedf0)" stroke-dasharray="2,2"/>
              } @else {
                <!-- Label -->
                @if (showLabels()) {
                  <text
                    x="-8"
                    [attr.y]="layout.y + barHeight() / 2"
                    class="item-label"
                    text-anchor="end"
                    dominant-baseline="middle"
                  >{{ layout.label }}</text>
                }
                
                <!-- Bar -->
                <rect
                  [attr.x]="layout.x"
                  [attr.y]="layout.y"
                  [attr.width]="layout.w"
                  [attr.height]="barHeight()"
                  [attr.fill]="layout.color"
                  [attr.rx]="4"
                  [attr.ry]="4"
                  class="range-bar"
                  (mouseenter)="onMouseEnter($event, layout.item)"
                  (click)="onBarClick(layout.item)"
                />
              }
            }

            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)"/>
          </g>
        </svg>
      </div>

      <!-- Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"></ng-container>
          } @else {
            <div class="tt-cat">{{ t.item.label }}</div>
            <div class="tt-row">
              <span class="tt-lbl">Start:</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.item.start) : fmtNum(t.item.start) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-lbl">End:</span>
              <span class="tt-val">{{ labelFormatter() ? labelFormatter()!(t.item.end) : fmtNum(t.item.end) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-lbl">Duration:</span>
              <span class="tt-val">{{ fmtNum(t.item.end - t.item.start) }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .ngx-range-bar-chart { position: relative; background: var(--ngx-chart-bg, #fff); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; z-index: 2; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; }
    .legend-dot { width: 12px; height: 12px; border-radius: 2px; display: inline-block; }
    
    .chart-body { overflow-x: auto; overflow-y: hidden; }
    .chart-svg { display: block; min-width: 100%; }
    
    .axis-label { font-size: 11px; fill: var(--ngx-chart-axis-text,#6c757d); user-select: none; font-weight: 500; }
    .category-header { font-size: 12px; fill: var(--ngx-chart-axis-text,#334155); font-weight: 700; user-select: none; }
    .item-label { font-size: 11.5px; fill: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; user-select: none; }
    
    .range-bar { cursor: pointer; transition: filter 0.2s, opacity 0.2s; opacity: 0.9; }
    .range-bar:hover { opacity: 1; filter: brightness(1.1); stroke: rgba(0,0,0,0.1); stroke-width: 1; }

    .chart-tooltip {
      position: fixed; pointer-events: none; transform: translate(-50%, -100%) translateY(-12px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px;
      border-radius: 8px; font-size: 12px; min-width: 160px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 100;
    }
    .tt-cat { font-weight: 700; margin-bottom: 8px; font-size: 12.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 6px; color: #38bdf8; }
    .tt-row { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
    .tt-lbl { color: rgba(248, 250, 252, 0.8); }
    .tt-val { font-weight: 700; font-family: monospace; }
  `]
})
export class RangeBarChartComponent {
  readonly instanceId = generateUniqueId('range');
  private readonly exportSvc = inject(ChartExportService);

  data = input<RangeBarItem[]>([]);
  height = input<number>(300);
  barHeight = input<number>(24);
  barGap = input<number>(8);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  showLegend = input<boolean>(false);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  labelFormatter = input<((v: number) => string) | undefined>(undefined);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  barClick = output<{ label: string; start: number; end: number }>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(600);

  tooltip = signal<{ x: number; y: number; item: RangeBarItem } | null>(null);

  PAD_LEFT = 120;
  PAD_TOP = 16;
  PAD_RIGHT = 32;
  PAD_BOTTOM = 32;

  innerW = computed(() => Math.max(0, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  
  categories = computed(() => {
    const cats = new Set<string>();
    this.data().forEach(d => { if (d.category) cats.add(d.category); });
    return Array.from(cats);
  });

  xRange = computed(() => {
    const d = this.data();
    if (!d.length) return { min: 0, max: 100 };
    const min = Math.min(...d.map(i => i.start));
    const max = Math.max(...d.map(i => i.end));
    return { min, max: max === min ? max + 1 : max };
  });

  xTicks = computed(() => niceTicks(this.xRange().min, this.xRange().max, 5));

  layoutData = computed(() => {
    const raw = this.data();
    const grps = new Map<string, RangeBarItem[]>();
    const order: string[] = [];
    
    raw.forEach(d => {
      const c = d.category || '';
      if (!grps.has(c)) {
        grps.set(c, []);
        order.push(c);
      }
      grps.get(c)!.push(d);
    });

    const layout: any[] = [];
    let currentY = 0;
    const { min, max } = this.xRange();
    const w = this.innerW();

    order.forEach((cat, catIdx) => {
      if (cat) {
        layout.push({ id: `header-${cat}`, isHeader: true, label: cat, y: currentY });
        currentY += this.barHeight() + this.barGap();
      }
      
      const items = grps.get(cat)!;
      items.forEach((item, iIdx) => {
        const x = scale(item.start, min, max, 0, w);
        const endX = scale(item.end, min, max, 0, w);
        const color = item.color || this.colors()[catIdx % this.colors().length];
        
        layout.push({
          id: `item-${cat}-${iIdx}-${item.label}`,
          isHeader: false,
          label: item.label,
          y: currentY,
          x,
          w: Math.max(2, endX - x),
          color,
          item
        });
        currentY += this.barHeight() + this.barGap();
      });
      
      // Extra gap after group
      if (catIdx < order.length - 1) {
        currentY += this.barGap();
      }
    });

    return layout;
  });

  innerH = computed(() => {
    const l = this.layoutData();
    if (!l.length) return 100;
    const last = l[l.length - 1];
    return last.y + this.barHeight();
  });

  calculatedHeight = computed(() => this.innerH() + this.PAD_TOP + this.PAD_BOTTOM);

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) this.containerWidth.set(width);
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  xPos(v: number): number {
    return scale(v, this.xRange().min, this.xRange().max, 0, this.innerW());
  }

  onMouseEnter(event: MouseEvent, item: RangeBarItem): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX,
      y: event.clientY,
      item
    });
  }

  onMouseLeave(): void {
    this.tooltip.set(null);
  }

  onBarClick(item: RangeBarItem): void {
    this.barClick.emit({ label: item.label, start: item.start, end: item.end });
  }

  onExport(type: ExportFormat): void {
    if (type === 'svg') this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'range-bar-chart.svg');
    else if (type === 'pdf') this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Range Bar Chart', 'range-bar-chart.pdf');
    else {
      if (type === 'csv') {
        const rows = this.data().map(d => [d.category || '', d.label, d.start, d.end]);
        this.exportSvc.downloadCsv(['Category', 'Label', 'Start', 'End'], rows, 'range-bar-chart.csv');
      }
      else if (type === 'json') this.exportSvc.downloadJson(this.data(), 'range-bar-chart.json');
    }
  }

  fmtNum = fmtNum;
}
