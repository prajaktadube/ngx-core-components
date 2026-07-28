import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, inject, DestroyRef, TemplateRef, output
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent, type ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, ChartDataPoint, generateUniqueId, fmtNum } from '../shared/chart-utils';

export interface DonutRing {
  name: string;
  data: ChartDataPoint[];
}

@Component({
  selector: 'ngx-nested-donut-chart',
  standalone: true,
  imports: [ChartExportMenuComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-nested-donut-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      @if (showLegend()) {
        <div class="chart-legend">
          @for (c of allCategories(); track c; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="colors()[i % colors().length]"></span>
              {{ c }}
            </span>
          }
        </div>
      }

      <div class="chart-body">
        <svg #svgEl [attr.width]="'100%'" [attr.height]="height()" class="chart-svg">
          <g [attr.transform]="'translate(' + centerX() + ',' + centerY() + ')'">
            @for (ring of ringData(); track ring.name; let rIdx = $index) {
              @for (slice of ring.slices; track slice.label; let sIdx = $index) {
                <path
                  [attr.d]="getArcPath(slice.startAngle, slice.endAngle, slice.innerRadius, slice.outerRadius + (activeSlice()?.ring === ring.name && activeSlice()?.label === slice.label ? 4 : 0))"
                  [attr.fill]="slice.color"
                  [attr.stroke]="'var(--ngx-chart-bg, #fff)'"
                  stroke-width="2"
                  class="arc-path"
                  (mouseenter)="onMouseEnter($event, ring.name, slice)"
                  (click)="onSliceClick(ring.name, slice)"
                />
              }
            }

            @if (centerTitle() || centerValue()) {
              <text text-anchor="middle" class="center-text">
                @if (centerTitle()) {
                  <tspan x="0" dy="-4" class="center-title">{{ centerTitle() }}</tspan>
                }
                @if (centerValue()) {
                  <tspan x="0" [attr.dy]="centerTitle() ? 20 : 8" class="center-value">{{ centerValue() }}</tspan>
                }
              </text>
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
            <div class="tt-ring">{{ t.ring }}</div>
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
    .ngx-nested-donut-chart { position: relative; background: var(--ngx-chart-bg, #fff); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; z-index: 2; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; justify-content: center; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .chart-body { position: relative; }
    .chart-svg { display: block; overflow: visible; }
    .arc-path { transition: d 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s; cursor: pointer; }
    .arc-path:hover { opacity: 0.9; }
    
    .center-title { font-size: 12px; fill: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; }
    .center-value { font-size: 24px; fill: var(--ngx-chart-axis-text,#334155); font-weight: 700; }
    
    @keyframes arcDraw {
      from { stroke-dasharray: 0 2000; }
      to { stroke-dasharray: 2000 0; }
    }

    .chart-tooltip {
      position: fixed; pointer-events: none; transform: translate(-50%, -100%) translateY(-12px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px;
      border-radius: 10px; font-size: 12px; min-width: 130px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.1s cubic-bezier(0.16, 1, 0.3, 1), top 0.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-ring { font-weight: 700; margin-bottom: 6px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .tt-row { display: flex; align-items: center; gap: 8px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tt-name { color: rgba(248, 250, 252, 0.9); flex: 1; font-weight: 500; }
    .tt-val { font-weight: 700; font-family: monospace; }
  `]
})
export class NestedDonutChartComponent {
  readonly instanceId = generateUniqueId('ndonut');
  private readonly exportSvc = inject(ChartExportService);

  rings = input<DonutRing[]>([]);
  height = input<number>(300);
  ringWidth = input<number>(30);
  ringGap = input<number>(8);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);
  centerTitle = input<string>('');
  centerValue = input<string>('');
  tooltipTemplate = input<TemplateRef<any> | null>(null);

  sliceClick = output<{ ring: string; label: string; value: number }>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(400);

  tooltip = signal<{ x: number; y: number; ring: string; label: string; value: number; color: string } | null>(null);
  activeSlice = signal<{ ring: string; label: string } | null>(null);

  centerX = computed(() => this.containerWidth() / 2);
  centerY = computed(() => this.height() / 2);

  allCategories = computed(() => {
    const cats = new Set<string>();
    this.rings().forEach(r => r.data.forEach(d => cats.add(d.label)));
    return Array.from(cats);
  });

  ringData = computed(() => {
    const rings = this.rings();
    const width = this.ringWidth();
    const gap = this.ringGap();
    const catList = this.allCategories();
    
    // Outermost ring starts at maxRadius
    const maxRadius = Math.min(this.containerWidth(), this.height()) / 2 - 16;
    
    return rings.map((ring, rIdx) => {
      const total = ring.data.reduce((sum, d) => sum + d.value, 0);
      let currentAngle = 0;
      
      const outerR = maxRadius - (rIdx * (width + gap));
      const innerR = outerR - width;
      
      const slices = ring.data.map(d => {
        const angle = (d.value / (total || 1)) * 360;
        const colorIdx = catList.indexOf(d.label);
        const slice = {
          label: d.label,
          value: d.value,
          startAngle: currentAngle,
          endAngle: currentAngle + angle,
          innerRadius: innerR,
          outerRadius: outerR,
          color: d.color || this.colors()[colorIdx % this.colors().length]
        };
        currentAngle += angle;
        return slice;
      });
      
      return { name: ring.name, slices };
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

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  getArcPath(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number): string {
    // If it's a full circle
    if (endAngle - startAngle === 360) {
      endAngle -= 0.01;
    }
    
    const start = this.polarToCartesian(0, 0, outerRadius, endAngle);
    const end = this.polarToCartesian(0, 0, outerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const innerStart = this.polarToCartesian(0, 0, innerRadius, endAngle);
    const innerEnd = this.polarToCartesian(0, 0, innerRadius, startAngle);

    return [
      "M", start.x, start.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  }

  onMouseEnter(event: MouseEvent, ringName: string, slice: any): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.activeSlice.set({ ring: ringName, label: slice.label });
    this.tooltip.set({
      x: event.clientX,
      y: event.clientY,
      ring: ringName,
      label: slice.label,
      value: slice.value,
      color: slice.color
    });
  }

  onMouseLeave(): void {
    this.tooltip.set(null);
    this.activeSlice.set(null);
  }

  onSliceClick(ring: string, slice: any): void {
    this.sliceClick.emit({ ring, label: slice.label, value: slice.value });
  }

  onExport(type: ExportFormat): void {
    if (type === 'svg') this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'nested-donut.svg');
    else if (type === 'pdf') this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Nested Donut Chart', 'nested-donut.pdf');
    else {
      const data = this.rings().flatMap(r => r.data.map(d => ({ ring: r.name, label: d.label, value: d.value })));
      if (type === 'json') this.exportSvc.downloadJson(data, 'nested-donut.json');
      else {
        const rows = data.map(d => [d.ring, d.label, d.value]);
        this.exportSvc.downloadCsv(['Ring', 'Label', 'Value'], rows, 'nested-donut.csv');
      }
    }
  }

  fmtNum = fmtNum;
}
