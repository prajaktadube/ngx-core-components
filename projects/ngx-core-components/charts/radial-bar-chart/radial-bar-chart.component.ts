import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, fmtNum, generateUniqueId } from '../shared/chart-utils';

export interface RadialBarItem {
  label: string;
  value: number;
  max: number;
  color?: string;
}

@Component({
  selector: 'ngx-radial-bar-chart',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-radial-bar-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <div class="chart-layout">
        <!-- SVG Concentric Circles -->
        <div class="radial-visual">
          <svg
            #svgEl
            [attr.width]="height()"
            [attr.height]="height()"
            [attr.viewBox]="'0 0 ' + size() + ' ' + size()"
            class="radial-svg"
          >
            <defs>
              @for (ring of computedRings(); track $index; let i = $index) {
                <linearGradient [attr.id]="instanceId + '-radial-grad-' + i" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" [attr.stop-color]="ring.color" />
                  <stop offset="100%" [attr.stop-color]="ring.color" stop-opacity="0.6" />
                </linearGradient>
              }
            </defs>
            <!-- Rotate group by -90deg so rings start at 12 o'clock -->
            <g [attr.transform]="'translate(' + center() + ',' + center() + ') rotate(-90)'">
              @for (ring of computedRings(); track $index; let i = $index) {
                <!-- Background track ring -->
                <circle
                  cx="0"
                  cy="0"
                  [attr.r]="ring.r"
                  fill="none"
                  [attr.stroke]="ring.color"
                  stroke-opacity="0.08"
                  [attr.stroke-width]="strokeWidth()"
                />

                <!-- Active progress ring -->
                <circle
                  cx="0"
                  cy="0"
                  [attr.r]="ring.r"
                  fill="none"
                  [attr.stroke]="'url(#' + instanceId + '-radial-grad-' + i + ')'"
                  [attr.stroke-width]="hoveredIndex() === i ? strokeWidth() + 3 : strokeWidth()"
                  [attr.stroke-dasharray]="ring.dashArray"
                  [attr.stroke-dashoffset]="animateState() ? 0 : ring.circumference"
                  stroke-linecap="round"
                  class="progress-ring"
                  [class.hovered]="hoveredIndex() === i"
                  (mouseenter)="onRingHover(ring.raw, i)"
                  (mousemove)="onRingMouseMove($event)"
                />
              }
            </g>
          </svg>

          <!-- Inside Center Details (Hover/Selected summary) -->
          <div class="center-content">
            @if (hoveredIndex() !== null) {
              @if (computedRings()[hoveredIndex()!]; as active) {
                <span class="center-label">{{ active.label }}</span>
                <span class="center-value" [style.color]="active.color">
                  {{ active.pct }}%
                </span>
                <span class="center-sublabel">
                  {{ fmtNum(active.value) }} / {{ fmtNum(active.max) }}
                </span>
              }
            } @else if (data().length > 0) {
              <span class="center-label">Average</span>
              <span class="center-value">{{ avgPct() }}%</span>
              <span class="center-sublabel">Completed</span>
            }
          </div>
        </div>

        <!-- Legend / List -->
        @if (showLegend() && data().length > 0) {
          <div class="radial-legend" (mousemove)="$event.stopPropagation()">
            @for (ring of computedRings(); track $index; let i = $index) {
              <div
                class="legend-item"
                [class.active]="hoveredIndex() === i"
                (mouseenter)="hoveredIndex.set(i)"
                (mouseleave)="hoveredIndex.set(null)"
              >
                <span class="legend-color-dot" [style.background]="ring.color"></span>
                <div class="legend-content">
                  <span class="legend-title">{{ ring.label }}</span>
                  <div class="legend-metrics">
                    <span class="metric-value">{{ ring.pct }}%</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip() && hoveredIndex() !== null) {
        <div
          class="chart-tooltip"
          [style.left.px]="tooltipX()"
          [style.top.px]="tooltipY()"
        >
          <div class="tt-cat">{{ tooltip().label }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="tooltip().color"></span>
            <span class="tt-name">Progress</span>
            <span class="tt-val">{{ tooltip().pct }}%</span>
          </div>
          <div class="tt-row">
            <span class="tt-dot" style="background: transparent;"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ fmtNum(tooltip().value) }} / {{ fmtNum(tooltip().max) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-radial-bar-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
      margin-bottom: 12px;
    }
    .chart-layout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .radial-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .radial-svg {
      display: block;
    }
    .progress-ring {
      cursor: pointer;
      transition: stroke-width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                  filter 0.3s ease,
                  opacity 0.2s;
    }
    .progress-ring.hovered {
      filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.15));
    }
    .center-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      text-align: center;
    }
    .center-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .center-value {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.1;
      margin: 2px 0;
    }
    .center-sublabel {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Legend */
    .radial-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 150px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }
    .legend-item:hover, .legend-item.active {
      background: var(--ngx-chart-grid, #f8fafc);
      border-color: var(--ngx-chart-grid, #e2e8f0);
    }
    .legend-color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .legend-title {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .metric-value {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
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
      font-size: 12px;
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
      color: rgba(248, 250, 252, 0.8);
      flex: 1;
    }
    .tt-val {
      font-weight: 700;
      font-family: monospace;
    }


  `]
})
export class RadialBarChartComponent {
  private readonly exportSvc = inject(ChartExportService);
  readonly instanceId = generateUniqueId('chart');
  data = input<RadialBarItem[]>([]);
  height = input<number>(300);
  showLegend = input<boolean>(true);

  // Configuration properties
  strokeWidth = input<number>(10);
  ringGap = input<number>(4);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);


  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);
  animateState = signal<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  size = computed(() => this.height());
  center = computed(() => this.size() / 2);

  constructor() {
    setTimeout(() => this.animateState.set(true), 50);
  }

  // Ring properties
  computedRings = computed(() => {
    const raw = this.data();
    const count = raw.length;
    const centerPt = this.center();
    const ringW = this.strokeWidth();
    const gap = this.ringGap();

    // Start radii calculation from the outside inwards
    // Max radius leaves padding on outside
    const maxRadius = centerPt - ringW - 4;

    return raw.map((item, idx) => {
      // Offset outwards to inwards
      const r = maxRadius - idx * (ringW + gap);
      const pct = Math.min(100, Math.max(0, Math.round((item.value / item.max) * 100)));
      const color = item.color || this.colors()[idx % this.colors().length];

      // Circular arc math
      const C = 2 * Math.PI * r;
      // dasharray structure: "arcLength, circumference"
      const arcLength = (pct / 100) * C;
      const dashArray = `${arcLength}, ${C}`;

      return {
        r,
        pct,
        color,
        dashArray,
        circumference: C,
        label: item.label,
        value: item.value,
        max: item.max,
        raw: item
      };
    });
  });

  // Calculate average percentage of completion
  avgPct = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 0;
    const sum = raw.reduce((acc, curr) => acc + (curr.value / curr.max), 0);
    return Math.round((sum / raw.length) * 100);
  });

  onRingHover(item: RadialBarItem, index: number) {
    this.hoveredIndex.set(index);
    const ring = this.computedRings()[index];
    if (ring) {
      this.tooltip.set(ring);
    }
  }

  onRingMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-radial-bar-chart');
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

  onExport(type: ExportFormat): void {
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
    else if (type === 'pdf') this.exportToPdf();
  }

  exportToJson(): void {
    this.exportSvc.downloadJson(this.data(), 'radial-bar-chart.json');
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const headers = ['Label', 'Value', 'Max'];
    const rows = data.map(d => [d.label || '', d.value, d.max]);
    this.exportSvc.downloadCsv(headers, rows, 'radial-bar-chart.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Chart Export', 'chart.pdf');
  }

  readonly fmtNum = fmtNum;
}
