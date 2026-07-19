import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { ChartExportService } from '../shared/chart-export.service';
import { ChartExportMenuComponent } from '../shared/chart-export-menu.component';
import type { ExportFormat } from '../shared/chart-export-menu.component';
import { CHART_COLORS, ChartDataPoint, fmtNum, niceTicks, scale } from '../shared/chart-utils';

@Component({
  selector: 'ngx-lollipop-chart',
  standalone: true,
  imports: [ChartExportMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-lollipop-chart" (mouseleave)="onMouseLeave()">
      <div class="chart-header" (mousemove)="$event.stopPropagation()" (mouseleave)="onMouseLeave()">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <ngx-chart-export-menu (exportClicked)="onExport($event)" />
        }
      </div>

      <svg
        #svgEl
        class="lollipop-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <!-- Grid Lines (Horizontal Orientation: vertical lines; Vertical Orientation: horizontal lines) -->
          @if (showGrid()) {
            @if (orientation() === 'horizontal') {
              @for (tick of xTicks(); track tick) {
                <line
                  [attr.x1]="xPos(tick)"
                  [attr.x2]="xPos(tick)"
                  [attr.y1]="0"
                  [attr.y2]="innerH()"
                  class="grid-line"
                />
              }
            } @else {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="yPos(tick)"
                  [attr.y2]="yPos(tick)"
                  class="grid-line"
                />
              }
            }
          }

          <!-- Lollipops -->
          @for (item of computedItems(); track item.label; let i = $index) {
            <g
              class="lollipop-row"
              [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i"
              [class.highlighted]="hoveredIndex() === i"
              (mouseenter)="onItemHover(i, $event)"
              (mousemove)="onItemMouseMove($event)"
            >
              <!-- Row backdrop for easier hover -->
              @if (orientation() === 'horizontal') {
                <rect
                  [attr.x]="-margin().left"
                  [attr.y]="item.coord - itemSpacing() / 2"
                  [attr.width]="containerWidth()"
                  [attr.height]="itemSpacing()"
                  fill="transparent"
                  style="cursor: pointer;"
                />
              } @else {
                <rect
                  [attr.x]="item.coord - itemSpacing() / 2"
                  [attr.y]="-margin().top"
                  [attr.width]="itemSpacing()"
                  [attr.height]="svgHeight()"
                  fill="transparent"
                  style="cursor: pointer;"
                />
              }

              <!-- Stem Line -->
              @if (orientation() === 'horizontal') {
                <line
                  [attr.x1]="0"
                  [attr.x2]="xPos(item.value)"
                  [attr.y1]="item.coord"
                  [attr.y2]="item.coord"
                  [attr.stroke]="item.color"
                  stroke-width="2"
                  class="lollipop-stem"
                />
              } @else {
                <line
                  [attr.x1]="item.coord"
                  [attr.x2]="item.coord"
                  [attr.y1]="innerH()"
                  [attr.y2]="yPos(item.value)"
                  [attr.stroke]="item.color"
                  stroke-width="2"
                  class="lollipop-stem"
                />
              }

              <!-- Candy Dot -->
              @if (orientation() === 'horizontal') {
                <circle
                  [attr.cx]="xPos(item.value)"
                  [attr.cy]="item.coord"
                  [attr.r]="hoveredIndex() === i ? dotRadius() + 2 : dotRadius()"
                  [attr.fill]="item.color"
                  class="lollipop-candy"
                />
              } @else {
                <circle
                  [attr.cx]="item.coord"
                  [attr.cy]="yPos(item.value)"
                  [attr.r]="hoveredIndex() === i ? dotRadius() + 2 : dotRadius()"
                  [attr.fill]="item.color"
                  class="lollipop-candy"
                />
              }
            </g>
          }

          <!-- Y Axis (Left) / X Axis (Bottom) -->
          @if (orientation() === 'horizontal') {
            <!-- Left Y Axis for Horizontal -->
            <g class="y-axis">
              <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
              @if (showLabels()) {
                @for (item of computedItems(); track item.label) {
                  <text
                    [attr.x]="-10"
                    [attr.y]="item.coord"
                    text-anchor="end"
                    dominant-baseline="middle"
                    class="axis-label"
                  >
                    {{ item.label }}
                  </text>
                }
              }
            </g>

            <!-- Bottom X Axis for Horizontal -->
            <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
              <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
              @for (tick of xTicks(); track tick) {
                <g [attr.transform]="'translate(' + xPos(tick) + ',0)'">
                  <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="4" class="tick-line" />
                  <text [attr.y]="16" text-anchor="middle" class="tick-label">
                    {{ formatNumber(tick) }}
                  </text>
                </g>
              }
            </g>
          } @else {
            <!-- Left Y Axis for Vertical -->
            <g class="y-axis">
              <line [attr.x1]="0" [attr.x2]="0" [attr.y1]="0" [attr.y2]="innerH()" class="axis-line" />
              @for (tick of yTicks(); track tick) {
                <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                  <line [attr.x1]="-4" [attr.x2]="0" [attr.y1]="0" [attr.y2]="0" class="tick-line" />
                  <text [attr.x]="-8" text-anchor="end" dominant-baseline="middle" class="tick-label">
                    {{ formatNumber(tick) }}
                  </text>
                </g>
              }
            </g>

            <!-- Bottom X Axis for Vertical -->
            <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
              <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="0" [attr.y2]="0" class="axis-line" />
              @if (showLabels()) {
                @for (item of computedItems(); track item.label) {
                  <text
                    [attr.x]="item.coord"
                    [attr.y]="16"
                    text-anchor="middle"
                    class="axis-label"
                  >
                    {{ item.label }}
                  </text>
                }
              }
            </g>
          }
        </g>
      </svg>

      <!-- Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
          <div class="tt-cat">{{ t.label }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="t.color"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ formatNumber(t.value) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-lollipop-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      position: relative;
      width: 100%;
    }
    .lollipop-svg {
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
    .tick-line {
      stroke: var(--ngx-chart-axis, #cbd5e1);
      stroke-width: 1.5;
    }
    .tick-label, .axis-label {
      font-size: 11px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
    .lollipop-stem {
      opacity: 0.75;
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
    }
    .lollipop-candy {
      transition: r 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.2s ease;
      stroke: var(--ngx-chart-bg, #ffffff);
      stroke-width: 1.5;
      cursor: pointer;
    }
    .lollipop-row {
      transition: opacity 0.2s ease;
    }
    .lollipop-row.dimmed {
      opacity: 0.3;
    }
    .lollipop-row.highlighted .lollipop-stem {
      stroke-width: 3.5;
      opacity: 1;
    }
    .lollipop-row.highlighted .lollipop-candy {
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.15));
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
      min-width: 140px;
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

    /* Header styles */
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      min-height: 24px;
      position: relative;
    }
  `]
})
export class LollipopChartComponent {
  private readonly exportSvc = inject(ChartExportService);

  data = input<ChartDataPoint[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  colors = input<string[]>(CHART_COLORS);
  dotRadius = input<number>(8);
  showExport = input<boolean>(false);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  margin = computed(() => {
    const isHoriz = this.orientation() === 'horizontal';
    return {
      top: 20,
      right: 30,
      bottom: 40,
      left: this.showLabels() ? (isHoriz ? 80 : 40) : 20
    };
  });

  svgHeight = computed(() => this.height());
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.svgHeight() - this.margin().top - this.margin().bottom));

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
  }

  // Domain range calculations
  maxVal = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 100;
    return Math.max(...raw.map(d => d.value), 0);
  });

  ticks = computed(() => {
    const max = this.maxVal();
    return niceTicks(0, max, 5);
  });

  xTicks = computed(() => {
    return this.orientation() === 'horizontal' ? this.ticks() : [];
  });

  yTicks = computed(() => {
    return this.orientation() === 'vertical' ? this.ticks() : [];
  });

  domainMax = computed(() => {
    const t = this.ticks();
    return t[t.length - 1] || 100;
  });

  xPos(val: number): number {
    return scale(val, 0, this.domainMax(), 0, this.innerW());
  }

  yPos(val: number): number {
    // Invert for SVG y coordinate mapping
    return scale(val, 0, this.domainMax(), this.innerH(), 0);
  }

  itemSpacing = computed(() => {
    const count = this.data().length || 1;
    const axisLength = this.orientation() === 'horizontal' ? this.innerH() : this.innerW();
    return axisLength / count;
  });

  computedItems = computed(() => {
    const raw = this.data();
    const spacing = this.itemSpacing();
    const palette = this.colors();

    return raw.map((item, idx) => {
      const coord = spacing * idx + spacing / 2;
      const color = item.color || palette[idx % palette.length];

      return {
        ...item,
        coord,
        color
      };
    });
  });

  onItemHover(idx: number, event: MouseEvent) {
    this.hoveredIndex.set(idx);
    const item = this.computedItems()[idx];
    if (item) {
      this.tooltip.set(item);
    }
  }

  onItemMouseMove(event: MouseEvent) {
    const el = event.currentTarget as SVGElement;
    const container = el.closest('.ngx-lollipop-chart');
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
    const data = this.data();
    if (!data.length) return;
    this.exportSvc.downloadJson(data, 'lollipop-chart-data.json');
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    const headers = ['Label', 'Value'];
    const rows = data.map(d => [d.label || '', d.value]);
    this.exportSvc.downloadCsv(headers, rows, 'lollipop-chart-data.csv');
  }

  exportToSvg(): void {
    this.exportSvc.downloadSvg(this.svgEl()?.nativeElement, 'lollipop-chart.svg');
  }

  exportToPdf(): void {
    this.exportSvc.downloadPdf(this.svgEl()?.nativeElement, 'Lollipop Chart', 'lollipop-chart.pdf');
  }

  formatNumber(v: number): string {
    return fmtNum(v);
  }
}
