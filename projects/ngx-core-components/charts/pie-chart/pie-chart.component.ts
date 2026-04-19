import {
  Component, ChangeDetectionStrategy, input, computed, signal
} from '@angular/core';
import { CHART_COLORS, ChartDataPoint, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-pie-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-pie-chart">
      <div class="chart-body">
        <svg class="chart-svg" [attr.width]="svgSize()" [attr.height]="svgSize()">
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'">
            @for (slice of slices(); track slice.index) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="'#fff'"
                stroke-width="2"
                class="pie-slice"
                [class.hovered]="hovered() === slice.index"
                (mouseenter)="hovered.set(slice.index); onSliceHover($event, slice)"
                (mouseleave)="hovered.set(-1); tooltip.set(null)"
              />
              @if (showLabels() && slice.midAngle !== null) {
                <text
                  [attr.x]="labelX(slice)"
                  [attr.y]="labelY(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                >{{ slice.pct }}%</text>
              }
            }
            <!-- Donut hole -->
            @if (mode() === 'donut') {
              <circle [attr.r]="holeR()" fill="var(--ngx-chart-bg,#fff)"/>
              <text class="donut-center-text" text-anchor="middle" dy="-8">{{ centerTitle() }}</text>
              <text class="donut-center-value" text-anchor="middle" dy="14">{{ centerValue() }}</text>
            }
          </g>
        </svg>

        @if (showLegend()) {
          <div class="chart-legend">
            @for (slice of slices(); track slice.index) {
              <div class="legend-item" (mouseenter)="hovered.set(slice.index)" (mouseleave)="hovered.set(-1)">
                <span class="legend-dot" [style.background]="slice.color"></span>
                <span class="legend-label">{{ slice.label }}</span>
                <span class="legend-pct">{{ slice.pct }}%</span>
              </div>
            }
          </div>
        }
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <span class="tt-dot" [style.background]="t.color"></span>
          <strong>{{ t.label }}</strong>: {{ fmtNum(t.value) }} ({{ t.pct }}%)
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-pie-chart { position: relative; background: var(--ngx-chart-bg, #fff); font-family: inherit; }
    .chart-body { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .chart-svg { display: block; overflow: visible; flex-shrink: 0; }
    .pie-slice { cursor: pointer; transition: transform 0.15s, opacity 0.15s; transform-origin: center; }
    .pie-slice.hovered { transform: scale(1.03); opacity: 0.9; }
    .slice-label { font-size: 11px; fill: #fff; font-weight: 600; pointer-events: none; }
    .donut-center-text { font-size: 12px; fill: var(--ngx-chart-axis-text,#6c757d); }
    .donut-center-value { font-size: 20px; font-weight: 700; fill: var(--ngx-chart-text,#212529); }
    .chart-legend { display: flex; flex-direction: column; gap: 6px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; padding: 2px 4px; border-radius: 3px; }
    .legend-item:hover { background: var(--ngx-chart-grid,#f1f3f5); }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .legend-label { flex: 1; color: var(--ngx-chart-axis-text,#6c757d); }
    .legend-pct { font-weight: 600; color: var(--ngx-chart-text,#212529); }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg,#343a40); color: #fff;
      padding: 6px 10px; border-radius: 4px; font-size: 12px; white-space: nowrap;
      display: flex; align-items: center; gap: 6px;
    }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; }
  `]
})
export class PieChartComponent {
  data = input<ChartDataPoint[]>([]);
  mode = input<'pie' | 'donut'>('pie');
  donutHoleSize = input<number>(0.55);
  height = input<number>(240);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  centerTitle = input<string>('Total');
  colors$ = this.colors;

  hovered = signal(-1);
  tooltip = signal<{x:number;y:number;label:string;value:number;pct:number;color:string}|null>(null);

  svgSize = computed(() => this.height());
  cx = computed(() => this.svgSize() / 2);
  cy = computed(() => this.svgSize() / 2);
  radius = computed(() => this.svgSize() / 2 - 10);
  holeR = computed(() => this.radius() * this.donutHoleSize());

  centerValue = computed(() => {
    const total = this.data().reduce((s, d) => s + d.value, 0);
    return fmtNum(total);
  });

  slices = computed(() => {
    const d = this.data();
    const total = d.reduce((s, x) => s + x.value, 0) || 1;
    let start = -Math.PI / 2;
    return d.map((item, i) => {
      const frac = item.value / total;
      const angle = frac * Math.PI * 2;
      const end = start + angle;
      const mid = start + angle / 2;
      const r = this.radius();
      const path = this.arcPath(start, end, r);
      start = end;
      return {
        index: i,
        label: item.label,
        value: item.value,
        pct: Math.round(frac * 100),
        color: item.color || this.colors()[i % this.colors().length],
        path,
        midAngle: mid,
      };
    });
  });

  private arcPath(startAngle: number, endAngle: number, r: number): string {
    const x1 = Math.cos(startAngle) * r;
    const y1 = Math.sin(startAngle) * r;
    const x2 = Math.cos(endAngle) * r;
    const y2 = Math.sin(endAngle) * r;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  labelX(s: {midAngle:number}): number { return Math.cos(s.midAngle) * this.radius() * 0.7; }
  labelY(s: {midAngle:number}): number { return Math.sin(s.midAngle) * this.radius() * 0.7; }

  onSliceHover(event: MouseEvent, slice: {label:string;value:number;pct:number;color:string}): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-pie-chart') as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      ...slice,
    });
  }

  readonly fmtNum = fmtNum;
}
