import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, inject, DestroyRef, TemplateRef, output
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent, type ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, generateUniqueId, fmtNum } from '../shared/chart-utils';

export interface PyramidItem {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'ngx-pyramid-chart',
  standalone: true,
  imports: [ChartExportMenuComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-pyramid-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      @if (showLegend()) {
        <div class="chart-legend">
          @for (item of data(); track item.label; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="item.color || colors()[i % colors().length]"></span>
              {{ item.label }}
            </span>
          }
        </div>
      }

      <div class="chart-body">
        <svg #svgEl [attr.width]="'100%'" [attr.height]="height()" class="chart-svg">
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            @for (seg of segments(); track seg.label; let i = $index) {
              <g
                class="pyramid-segment"
                (mouseenter)="onMouseEnter($event, seg)"
                (click)="onSegmentClick(seg)"
                [class.active]="activeSeg() === seg.label"
              >
                <polygon
                  [attr.points]="seg.points"
                  [attr.fill]="seg.color"
                  stroke="var(--ngx-chart-bg, #fff)"
                  stroke-width="2"
                  class="seg-polygon"
                />
                @if (showLabels()) {
                  <text
                    [attr.x]="centerX()"
                    [attr.y]="seg.midY"
                    class="seg-label"
                    text-anchor="middle"
                    dominant-baseline="middle"
                  >
                    {{ seg.label }} {{ showValues() ? '(' + fmtNum(seg.value) + ')' : '' }}
                  </text>
                }
              </g>
            }
          </g>
        </svg>
      </div>

      <!-- Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { $implicit: t }"></ng-container>
          } @else {
            <div class="tt-row">
              <span class="tt-dot" [style.background]="t.color"></span>
              <span class="tt-name">{{ t.label }}</span>
              <span class="tt-val">{{ fmtNum(t.value) }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .ngx-pyramid-chart { position: relative; background: var(--ngx-chart-bg, #fff); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; z-index: 2; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; justify-content: center; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
    .chart-body { position: relative; }
    .chart-svg { display: block; overflow: visible; }
    
    .pyramid-segment { cursor: pointer; }
    .seg-polygon { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s; transform-origin: center; }
    .pyramid-segment:hover .seg-polygon { opacity: 0.9; transform: scaleX(1.02); }
    .pyramid-segment.active .seg-polygon { transform: scaleX(1.02); }
    
    .seg-label { font-size: 12px; fill: #fff; font-weight: 600; pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }

    .chart-tooltip {
      position: fixed; pointer-events: none; transform: translate(-50%, -100%) translateY(-12px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px;
      border-radius: 8px; font-size: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 100;
    }
    .tt-row { display: flex; align-items: center; gap: 8px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
    .tt-name { color: rgba(248, 250, 252, 0.9); font-weight: 500; }
    .tt-val { font-weight: 700; font-family: monospace; margin-left: 4px; }
  `]
})
export class PyramidChartComponent {
  readonly instanceId = generateUniqueId('pyramid');
  private readonly exportSvc = inject(ChartExportService);

  data = input<PyramidItem[]>([]);
  height = input<number>(300);
  mode = input<'pyramid' | 'inverted'>('pyramid');
  showLabels = input<boolean>(true);
  showLegend = input<boolean>(true);
  showValues = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  segmentClick = output<{ label: string; value: number }>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(400);

  tooltip = signal<{ x: number; y: number; label: string; value: number; color: string } | null>(null);
  activeSeg = signal<string | null>(null);

  PAD_LEFT = 16;
  PAD_RIGHT = 16;
  PAD_TOP = 16;
  PAD_BOTTOM = 16;

  innerW = computed(() => Math.max(0, this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT));
  innerH = computed(() => Math.max(0, this.height() - this.PAD_TOP - this.PAD_BOTTOM));
  centerX = computed(() => this.innerW() / 2);

  segments = computed(() => {
    const rawData = this.data();
    if (!rawData.length) return [];
    
    const total = rawData.reduce((sum, d) => sum + d.value, 0);
    const mode = this.mode();
    const w = this.innerW();
    const h = this.innerH();
    const cx = this.centerX();
    
    let currentY = 0;
    
    return rawData.map((d, i) => {
      const segH = (d.value / total) * h;
      const y0 = currentY;
      const y1 = currentY + segH;
      
      let w0, w1;
      
      if (mode === 'pyramid') {
        w0 = (y0 / h) * w;
        w1 = (y1 / h) * w;
      } else {
        w0 = ((h - y0) / h) * w;
        w1 = ((h - y1) / h) * w;
      }
      
      // Points for trapezoid
      const p1 = `${cx - w0/2},${y0}`;
      const p2 = `${cx + w0/2},${y0}`;
      const p3 = `${cx + w1/2},${y1}`;
      const p4 = `${cx - w1/2},${y1}`;
      
      const color = d.color || this.colors()[i % this.colors().length];
      
      currentY = y1;
      
      return {
        ...d,
        color,
        points: `${p1} ${p2} ${p3} ${p4}`,
        midY: y0 + segH / 2
      };
    });
  });

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

  onMouseEnter(event: MouseEvent, seg: any): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.activeSeg.set(seg.label);
    this.tooltip.set({
      x: event.clientX,
      y: event.clientY,
      label: seg.label,
      value: seg.value,
      color: seg.color
    });
  }

  onMouseLeave(): void {
    this.tooltip.set(null);
    this.activeSeg.set(null);
  }

  onSegmentClick(seg: any): void {
    this.segmentClick.emit({ label: seg.label, value: seg.value });
  }

  onExport(type: ExportFormat): void {
    if (type === 'svg') this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'pyramid-chart.svg');
    else if (type === 'pdf') this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Pyramid Chart', 'pyramid-chart.pdf');
    else {
      const rows = this.data().map(d => [d.label, d.value]);
      if (type === 'csv') this.exportSvc.downloadCsv(['Label', 'Value'], rows, 'pyramid-chart.csv');
      else if (type === 'json') this.exportSvc.downloadJson(this.data(), 'pyramid-chart.json');
    }
  }

  fmtNum = fmtNum;
}
