import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef, output
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, ChartDataPoint, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-polar-area-chart',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-polar-area-chart">
      <!-- Toolbar with Export option -->
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="tooltip.set(null)">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <div class="chart-body">
        <svg
          #svgEl
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + height() + ' ' + height()"
          [attr.width]="height()"
          [attr.height]="height()"
        >
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'">
            <!-- Concentric Grid Lines -->
            @for (level of gridLevels(); track level) {
              <circle
                cx="0"
                cy="0"
                [attr.r]="level.radius"
                fill="none"
                stroke="var(--ngx-chart-grid, #ebedf0)"
                stroke-width="1"
                stroke-dasharray="3,3"
              />
              @if (showLabels()) {
                <text
                  x="4"
                  [attr.y]="-level.radius + 12"
                  class="grid-label"
                >{{ formatNumber(level.value) }}</text>
              }
            }

            <!-- Chart Slices -->
            @for (slice of slices(); track slice.index) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="'#fff'"
                stroke-width="1.5"
                fill-opacity="0.8"
                class="polar-slice"
                [class.hovered]="hovered() === slice.index"
                [style.transform]="hovered() === slice.index ? 'scale(1.04)' : 'scale(1)'"
                (mouseenter)="hovered.set(slice.index); onSliceHover($event, slice)"
                (mouseleave)="hovered.set(-1); tooltip.set(null)"
                (click)="onSliceClick(slice)"
              />
              
              <!-- Value Labels inside/at edge of slices -->
              @if (showLabels() && slice.value > 0) {
                <text
                  [attr.x]="labelX(slice)"
                  [attr.y]="labelY(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                >{{ formatNumber(slice.value) }}</text>
              }
            }
          </g>
        </svg>

        @if (showLegend()) {
          <div class="chart-legend">
            @for (slice of slices(); track slice.index) {
              <div class="legend-item" (mouseenter)="hovered.set(slice.index)" (mouseleave)="hovered.set(-1)">
                <span class="legend-dot" [style.background]="slice.color"></span>
                <span class="legend-label">{{ slice.label }}</span>
                <span class="legend-val">{{ formatNumber(slice.value) }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <span class="tt-dot" [style.background]="t.color"></span>
          <strong>{{ t.label }}</strong>: {{ formatNumber(t.value) }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    .ngx-polar-area-chart {
      position: relative;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
      overflow: hidden;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
    }
    .chart-body {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .chart-svg {
      display: block;
      max-width: 100%;
      height: auto;
      min-width: 0;
      animation: polarGrow 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
      transform-origin: center;
    }

    @keyframes polarGrow {
      from { transform: scale(0.6) rotate(-45deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }

    .polar-slice {
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s;
      transform-origin: 0px 0px;
    }
    .polar-slice:hover {
      fill-opacity: 0.95;
    }
    .slice-label {
      font-size: 10px;
      fill: #fff;
      font-weight: 700;
      pointer-events: none;
      user-select: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .grid-label {
      font-size: 9px;
      fill: var(--ngx-chart-axis-text, #94a3b8);
      pointer-events: none;
      user-select: none;
    }
    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
      min-width: 140px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 8px;
      transition: all 0.15s;
    }
    .legend-item:hover {
      background: var(--ngx-chart-grid, #f1f3f5);
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      flex: 1;
      color: var(--ngx-chart-axis-text, #6c757d);
      font-weight: 550;
    }
    .legend-val {
      font-weight: 700;
      color: var(--ngx-chart-text, #212529);
    }

    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      min-width: 120px;
      box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: left 0.1s ease-out, top 0.1s ease-out;
      font-family: inherit;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }


  `]
})
export class PolarAreaChartComponent {
  private readonly exportSvc = inject(ChartExportService);
  data = input<ChartDataPoint[]>([]);
  height = input<number>(280);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  sliceClick = output<ChartDataPoint>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');


  hovered = signal(-1);
  tooltip = signal<{x:number;y:number;label:string;value:number;color:string}|null>(null);

  svgSize = computed(() => this.height());
  cx = computed(() => this.svgSize() / 2);
  cy = computed(() => this.svgSize() / 2);
  maxRadius = computed(() => this.svgSize() / 2 - 25);

  private maxValue = computed(() => {
    const vals = this.data().map(d => d.value);
    return Math.max(1, ...vals);
  });

  gridLevels = computed(() => {
    const maxVal = this.maxValue();
    const maxR = this.maxRadius();
    return [
      { value: maxVal * 0.25, radius: maxR * 0.25 },
      { value: maxVal * 0.5, radius: maxR * 0.5 },
      { value: maxVal * 0.75, radius: maxR * 0.75 },
      { value: maxVal, radius: maxR }
    ];
  });

  slices = computed(() => {
    const d = this.data();
    if (!d.length) return [];
    const maxVal = this.maxValue();
    const maxR = this.maxRadius();
    const angleStep = (2 * Math.PI) / d.length;

    let currentAngle = -Math.PI / 2;

    return d.map((item, i) => {
      const start = currentAngle;
      const end = currentAngle + angleStep;
      const mid = start + angleStep / 2;

      // Radius is proportional to the value
      const r = maxVal > 0 ? (item.value / maxVal) * maxR : 0;

      // Draw SVG arc path
      const x1 = Math.cos(start) * r;
      const y1 = Math.sin(start) * r;
      const x2 = Math.cos(end) * r;
      const y2 = Math.sin(end) * r;
      const largeArc = angleStep > Math.PI ? 1 : 0;
      const path = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      currentAngle = end;

      return {
        index: i,
        label: item.label,
        value: item.value,
        color: item.color || this.colors()[i % this.colors().length],
        path,
        midAngle: mid,
        radius: r
      };
    });
  });

  labelX(s: {midAngle:number; radius:number}): number {
    return Math.cos(s.midAngle) * s.radius * 0.7;
  }

  labelY(s: {midAngle:number; radius:number}): number {
    return Math.sin(s.midAngle) * s.radius * 0.7;
  }

  onSliceHover(event: MouseEvent, slice: {label:string;value:number;color:string}): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-polar-area-chart') as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: slice.label,
      value: slice.value,
      color: slice.color
    });
  }

  onSliceClick(slice: {label:string;value:number;color?:string}) {
    this.sliceClick.emit({ label: slice.label, value: slice.value, color: slice.color });
  }

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    this.exportSvc.downloadJson(this.data(), 'polar-area-chart-data.json');
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const headers = ['Label', 'Value'];
    const rows = data.map(d => [d.label, d.value]);
    this.exportSvc.downloadCsv(headers, rows, 'polar-area-chart-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
