import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CHART_COLORS, ChartSeries, niceTicks, scale, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-bar-chart">
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
        [attr.width]="'100%'"
        [attr.height]="chartHeight()"
        class="chart-svg"
        (mousemove)="onMouseMove($event)"
        (mouseleave)="tooltip.set(null)"
      >
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
              <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
            </g>
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
                  [attr.fill]="barColor(si, s)"
                  [attr.rx]="3"
                  class="bar-rect"
                  (mouseenter)="onBarHover($event, s.name, categories()[ci], v)"
                />
                @if (showLabels()) {
                  <text
                    [attr.x]="barX(ci, si) + singleBarWidth() / 2"
                    [attr.y]="barY(v) - 4"
                    class="bar-label"
                    text-anchor="middle"
                  >{{ fmtNum(v) }}</text>
                }
              }
            }
          }

          <!-- Axes -->
          <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
        </g>
      </svg>

      <!-- Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <strong>{{ t.cat }}</strong><br/>
          {{ t.series }}: {{ fmtNum(t.value) }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-bar-chart { position: relative; background: var(--ngx-chart-bg, #fff); font-family: inherit; }
    .chart-legend { display: flex; gap: 16px; padding: 0 0 8px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text, #6c757d); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .chart-svg { display: block; overflow: visible; }
    .axis-label { font-size: 11px; fill: var(--ngx-chart-axis-text, #6c757d); }
    .bar-rect { cursor: pointer; transition: opacity 0.15s; }
    .bar-rect:hover { opacity: 0.8; }
    .bar-label { font-size: 11px; fill: var(--ngx-chart-axis-text, #6c757d); }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%);
      background: var(--ngx-chart-tooltip-bg, #343a40); color: #fff; padding: 6px 10px;
      border-radius: 4px; font-size: 12px; white-space: nowrap; margin-top: -8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
  `]
})
export class BarChartComponent {
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

  tooltip = signal<{ x: number; y: number; cat: string; series: string; value: number } | null>(null);

  chartHeight = computed(() => this.height());

  private svgEl = viewChild<ElementRef>('svgEl');

  innerW = computed(() => 600 - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.chartHeight() - this.PAD_TOP - this.PAD_BOTTOM);

  private allValues = computed(() => this.series().flatMap(s => s.data.filter(v => v != null)));

  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  yPos(v: number): number {
    return scale(v, this.yMin(), this.yMax(), this.innerH(), 0);
  }
  barY(v: number): number { return Math.min(this.yPos(0), this.yPos(v)); }
  barH(v: number): number { return Math.abs(this.yPos(0) - this.yPos(v)); }

  private groupW = computed(() => this.categories().length > 0 ? this.innerW() / this.categories().length : 0);
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

  seriesColor(i: number): string { return this.colors()[i % this.colors().length]; }
  barColor(si: number, s: ChartSeries): string { return s.color || this.seriesColor(si); }

  onBarHover(event: MouseEvent, seriesName: string, cat: string, value: number): void {
    const rect = (event.target as SVGElement).closest('.ngx-bar-chart')!.getBoundingClientRect();
    const el = (event.target as SVGElement).closest('.ngx-bar-chart') as HTMLElement;
    const elRect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - elRect.left,
      y: event.clientY - elRect.top,
      cat, series: seriesName, value,
    });
  }

  onMouseMove(event: MouseEvent): void {}

  readonly fmtNum = fmtNum;
}
