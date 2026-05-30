import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, ChartSeries, niceTicks, scale, smoothPath, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-area-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-area-chart" (mousemove)="onMouseMove($event)" (mouseleave)="crosshair.set(null)">
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="seriesColor(i, s)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }
      
      <div class="chart-svg-wrap">
        <svg [attr.width]="'100%'" [attr.height]="height()" class="chart-svg">
          <defs>
            @for (s of series(); track s.name; let i = $index) {
              <linearGradient [attr.id]="'area-gradient-' + i" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.45"/>
                <stop offset="100%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.02"/>
              </linearGradient>
            }
          </defs>
          
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Gridlines -->
            @for (tick of yTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                @if (showGrid()) {
                  <line [attr.x1]="0" [attr.x2]="innerW()" stroke="var(--ngx-chart-grid, #e2e8f0)" stroke-dasharray="3,3"/>
                }
                <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
              </g>
            }

            <!-- X Axis Categories -->
            @for (cat of categories(); track cat; let i = $index) {
              <text [attr.x]="xPos(i)" [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">{{ cat }}</text>
            }

            <!-- Area & Line Paths -->
            @for (s of series(); track s.name; let si = $index) {
              <!-- Area Fill -->
              <path
                [attr.d]="areaPath(s)"
                [attr.fill]="'url(#area-gradient-' + si + ')'"
                stroke="none"
              />
              
              <!-- Border Line -->
              <path
                [attr.d]="linePath(s)"
                [attr.stroke]="seriesColor(si, s)"
                fill="none"
                stroke-width="3"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              
              <!-- Hover Markers -->
              @if (showMarkers()) {
                @for (v of s.data; track $index; let ci = $index) {
                  <circle
                    [attr.cx]="xPos(ci)"
                    [attr.cy]="yPos(v)"
                    r="4"
                    [attr.fill]="seriesColor(si, s)"
                    stroke="#ffffff"
                    stroke-width="2"
                    class="marker-dot"
                  />
                }
              }
            }

            <!-- Vertical Crosshair -->
            @if (crosshair(); as ch) {
              <line [attr.x1]="ch.x" [attr.x2]="ch.x" y1="0" [attr.y2]="innerH()"
                stroke="var(--primary-color, #4f46e5)" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4,4"/>
            }

            <!-- Axis Lines -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
          </g>
        </svg>

        <!-- Hover Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tt-cat">{{ t.cat }}</div>
            @for (row of t.rows; track row.name) {
              <div class="tt-row">
                <span class="tt-dot" [style.background]="row.color"></span>
                <span class="tt-name">{{ row.name }}</span>
                <strong class="tt-val">{{ fmtNum(row.value) }}</strong>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-area-chart {
      position: relative;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      padding: 0 0 12px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      font-weight: 500;
    }
    .legend-dot {
      width: 12px;
      height: 4px;
      border-radius: 2px;
      display: inline-block;
    }
    .chart-svg-wrap {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
      cursor: crosshair;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--text-secondary, #94a3b8);
    }
    .marker-dot {
      transition: r 0.1s ease;
    }
    .marker-dot:hover {
      r: 6px;
    }
    
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, #0f172a);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 10;
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 4px;
      color: #ffffff;
    }
    .tt-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tt-name {
      font-size: 11px;
      color: #cbd5e1;
    }
    .tt-val {
      margin-left: auto;
      font-weight: 700;
    }
  `]
})
export class AreaChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 12;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  showGrid = input<boolean>(true);
  showMarkers = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);

  crosshair = signal<{ x: number } | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; rows: { name: string; value: number; color: string }[] } | null>(null);

  innerW = computed(() => 600 - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  private allValues = computed(() => this.series().flatMap(s => s.data));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  yPos(v: number): number { return scale(v, this.yMin(), this.yMax(), this.innerH(), 0); }
  xPos(i: number): number {
    const n = this.categories().length;
    return n <= 1 ? this.innerW() / 2 : scale(i, 0, n - 1, 0, this.innerW());
  }

  seriesColor(i: number, s: ChartSeries): string {
    return s.color || this.colors()[i % this.colors().length];
  }

  linePath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    return smoothPath(pts);
  }

  areaPath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return line + ` L ${last[0]} ${this.innerH()} L ${first[0]} ${this.innerH()} Z`;
  }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.categories();
    if (cats.length === 0) return;
    const idx = Math.round(scale(mx, 0, this.innerW(), 0, cats.length - 1));
    const ci = Math.max(0, Math.min(cats.length - 1, idx));
    this.crosshair.set({ x: this.xPos(ci) });
    const rows = this.series().map((s, si) => ({
      name: s.name,
      value: s.data[ci] ?? 0,
      color: this.seriesColor(si, s),
    }));
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      rows,
    });
  }

  readonly fmtNum = fmtNum;
}
