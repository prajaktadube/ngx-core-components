import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, ChartSeries, niceTicks, scale, fmtNum } from '../shared/chart-utils';

@Component({
  selector: 'ngx-combo-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-combo-chart" [class.dark]="theme() === 'dark'">
      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of barSeries(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot bar" [style.background]="barSeriesColor(i)"></span>
              {{ s.name }} (Bar)
            </span>
          }
          @for (s of lineSeries(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-line" [style.border-color]="lineSeriesColor(i)"></span>
              <span class="legend-dot marker" [style.background]="lineSeriesColor(i)"></span>
              {{ s.name }} (Line)
            </span>
          }
        </div>
      }

      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
          (mouseleave)="onMouseLeave()"
        >
          <defs>
            @for (s of barSeries(); track s.name; let si = $index) {
              <linearGradient [id]="'combo-bar-grad-' + si" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="s.color || barSeriesColor(si)" stop-opacity="1"/>
                <stop offset="100%" [attr.stop-color]="s.color || barSeriesColor(si)" stop-opacity="0.75"/>
              </linearGradient>
            }
          </defs>

          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines -->
            @if (showGrid()) {
              @for (tick of leftYTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="leftYPos(tick)"
                  [attr.y2]="leftYPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis (Left) - Bars -->
            @for (tick of leftYTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="leftYPos(tick) + 4"
                class="axis-label left"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.transform]="'rotate(-90) translate(' + (-innerH()/2) + ', -36)'"
              class="axis-title left"
              text-anchor="middle"
            >{{ barYTitle() }}</text>

            <!-- Y-Axis (Right) - Lines -->
            @for (tick of rightYTicks(); track tick) {
              <text
                [attr.x]="innerW() + 10"
                [attr.y]="rightYPos(tick) + 4"
                class="axis-label right"
                text-anchor="start"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.transform]="'rotate(90) translate(' + (innerH()/2) + ', ' + (-innerW() - 36) + ')'"
              class="axis-title right"
              text-anchor="middle"
            >{{ lineYTitle() }}</text>

            <!-- X-Axis Labels -->
            @for (cat of categories(); track cat; let i = $index) {
              <text
                [attr.x]="catMidX(i)"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ cat }}</text>
            }

            <!-- Active Category Column Highlight -->
            @if (activeCategoryIndex() !== null) {
              <rect
                [attr.x]="activeCategoryIndex()! * groupW() + 2"
                [attr.y]="0"
                [attr.width]="groupW() - 4"
                [attr.height]="innerH()"
                class="column-highlight"
              />
            }

            <!-- Bars (Left Y-Axis Scale) -->
            @for (s of barSeries(); track s.name; let si = $index) {
              @for (v of s.data; track $index; let ci = $index) {
                @if (v !== null && v !== undefined) {
                  <rect
                    [attr.x]="barX(ci, si)"
                    [attr.y]="barY(v)"
                    [attr.width]="singleBarWidth()"
                    [attr.height]="barH(v)"
                    [attr.fill]="s.color ? s.color : 'url(#combo-bar-grad-' + si + ')'"
                    [attr.rx]="4"
                    class="bar-rect"
                  />
                }
              }
            }

            <!-- Lines (Right Y-Axis Scale) -->
            @for (s of lineSeries(); track s.name; let si = $index) {
              <!-- Draw Line Path -->
              <path
                [attr.d]="linePath(s)"
                fill="none"
                [attr.stroke]="s.color || lineSeriesColor(si)"
                stroke-width="3"
                stroke-linecap="round"
                class="line-path"
              />
              <!-- Draw Markers -->
              @for (v of s.data; track $index; let ci = $index) {
                @if (v !== null && v !== undefined) {
                  <circle
                    [attr.cx]="catMidX(ci)"
                    [attr.cy]="rightYPos(v)"
                    [attr.r]="activeCategoryIndex() === ci ? 6.5 : 4"
                    [attr.fill]="'#ffffff'"
                    [attr.stroke]="s.color || lineSeriesColor(si)"
                    [attr.stroke-width]="activeCategoryIndex() === ci ? 3 : 2.5"
                    class="line-marker"
                    [style.transform-origin]="catMidX(ci) + 'px ' + rightYPos(v) + 'px'"
                  />
                }
              }
            }

            <!-- Invisible Hover Interactive Hitboxes -->
            @for (cat of categories(); track cat; let i = $index) {
              <rect
                [attr.x]="i * groupW()"
                [attr.y]="0"
                [attr.width]="groupW()"
                [attr.height]="innerH()"
                fill="transparent"
                class="hitbox"
                (mousemove)="onMouseMove($event, i)"
              />
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line [attr.x1]="innerW()" [attr.x2]="innerW()" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Dynamic Combined Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tt-cat">{{ t.category }}</div>
            <div class="tt-body">
              @for (item of t.items; track item.name) {
                <div class="tt-row">
                  <span class="tt-dot" [style.background]="item.color" [class.line-dot]="item.type === 'line'"></span>
                  <span class="tt-name">{{ item.name }}</span>
                  <span class="tt-val">{{ fmtNum(item.value) }}{{ item.suffix || '' }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-combo-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: background-color 0.3s;
    }
    .ngx-combo-chart.dark {
      background: rgba(30, 32, 48, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: transparent;
      --ngx-chart-grid: rgba(255, 255, 255, 0.06);
      --ngx-chart-axis: rgba(255, 255, 255, 0.12);
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
    }
    .dark .legend-item {
      color: #94a3b8;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .legend-dot.bar {
      border-radius: 2px;
    }
    .legend-line {
      width: 14px;
      border-bottom: 2px solid;
      display: inline-block;
    }
    .legend-dot.marker {
      margin-left: -12px;
      width: 6px;
      height: 6px;
      border: 1.5px solid #ffffff;
    }
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      fill: #64748b;
      font-weight: 500;
    }
    .dark .axis-label {
      fill: #94a3b8;
    }
    .axis-title {
      font-size: 11px;
      font-weight: 600;
      fill: #475569;
      letter-spacing: 0.5px;
    }
    .dark .axis-title {
      fill: #cbd5e1;
    }
    .column-highlight {
      fill: rgba(59, 130, 246, 0.04);
      pointer-events: none;
      rx: 6;
      ry: 6;
      animation: fadeIn 0.12s ease-out;
    }
    .dark .column-highlight {
      fill: rgba(255, 255, 255, 0.03);
    }
    .bar-rect {
      transition: y 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                  height 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                  fill-opacity 0.15s,
                  stroke-width 0.15s;
      stroke: #ffffff;
      stroke-width: 0.5;
      cursor: pointer;
    }
    .bar-rect:hover {
      fill-opacity: 0.9;
      stroke-width: 1.5;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08));
    }

    @keyframes drawLine {
      from { stroke-dashoffset: 1200; }
      to { stroke-dashoffset: 0; }
    }

    .line-path {
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: drawLine 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: stroke 0.2s;
    }

    @keyframes markerFade {
      from { opacity: 0; transform: scale(0); }
      to { opacity: 1; transform: scale(1); }
    }

    .line-marker {
      cursor: pointer;
      transition: r 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.2s;
      animation: markerFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
    }
    .hitbox {
      cursor: crosshair;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
      min-width: 150px;
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
    .tt-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
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
    .tt-dot.line-dot {
      border: 1.5px solid #ffffff;
      box-sizing: border-box;
      width: 9px;
      height: 9px;
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
export class ComboChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 16;
  PAD_RIGHT = 52;
  PAD_BOTTOM = 36;

  barSeries = input<ChartSeries[]>([]);
  lineSeries = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);
  barYTitle = input<string>('Volume');
  lineYTitle = input<string>('Percentage');

  activeCategoryIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    category: string;
    items: Array<{ name: string; value: number; color: string; type: 'bar' | 'line'; suffix?: string }>;
  } | null>(null);

  animateState = signal(false);

  private container = viewChild<ElementRef>('container');

  constructor() {
    setTimeout(() => this.animateState.set(true), 50);
  }

  // Dimension Calculations
  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Left Y-Axis Calculations (Bar values)
  private leftValues = computed(() => this.barSeries().flatMap(s => s.data.filter(v => v !== null)));
  private leftMin = computed(() => Math.min(0, ...this.leftValues()));
  private leftMax = computed(() => Math.max(1, ...this.leftValues()));
  leftYTicks = computed(() => niceTicks(this.leftMin(), this.leftMax(), 5));

  leftYPos(v: number): number {
    return scale(v, this.leftMin(), this.leftMax(), this.innerH(), 0);
  }
  
  barY(v: number): number {
    if (!this.animateState()) return this.leftYPos(0);
    return Math.min(this.leftYPos(0), this.leftYPos(v));
  }
  
  barH(v: number): number {
    if (!this.animateState()) return 0;
    return Math.abs(this.leftYPos(0) - this.leftYPos(v));
  }

  // Right Y-Axis Calculations (Line values)
  private rightValues = computed(() => this.lineSeries().flatMap(s => s.data.filter(v => v !== null)));
  private rightMin = computed(() => Math.min(0, ...this.rightValues()));
  private rightMax = computed(() => Math.max(100, ...this.rightValues()));
  rightYTicks = computed(() => niceTicks(this.rightMin(), this.rightMax(), 5));

  rightYPos(v: number): number {
    return scale(v, this.rightMin(), this.rightMax(), this.innerH(), 0);
  }

  // Layout positioning
  groupW = computed(() => this.categories().length > 0 ? this.innerW() / this.categories().length : 0);
  singleBarWidth = computed(() => {
    const numSeries = this.barSeries().length || 1;
    return Math.max(4, (this.groupW() - 12) / numSeries);
  });

  catMidX(i: number): number {
    return i * this.groupW() + this.groupW() / 2;
  }

  barX(ci: number, si: number): number {
    const numSeries = this.barSeries().length;
    const groupStartX = ci * this.groupW() + 6;
    return groupStartX + si * this.singleBarWidth();
  }

  barSeriesColor(si: number): string {
    return this.colors()[si % this.colors().length];
  }

  lineSeriesColor(si: number): string {
    // Avoid color collision by shifting indices
    const offset = this.barSeries().length || 0;
    return this.colors()[(si + offset) % this.colors().length];
  }

  // Line paths generator
  linePath(series: ChartSeries): string {
    const pts = series.data.map((v, ci) => {
      if (v === null || v === undefined) return null;
      return [this.catMidX(ci), this.rightYPos(v)] as [number, number];
    }).filter((p): p is [number, number] => p !== null);

    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i][0]} ${pts[i][1]}`;
    }
    return d;
  }

  onMouseMove(event: MouseEvent, index: number) {
    this.activeCategoryIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    const catName = this.categories()[index] || `Category ${index + 1}`;
    const items: any[] = [];

    // Bars info
    this.barSeries().forEach((s, si) => {
      const val = s.data[index];
      if (val !== undefined && val !== null) {
        items.push({
          name: s.name,
          value: val,
          color: s.color || this.barSeriesColor(si),
          type: 'bar'
        });
      }
    });

    // Lines info
    this.lineSeries().forEach((s, si) => {
      const val = s.data[index];
      if (val !== undefined && val !== null) {
        items.push({
          name: s.name,
          value: val,
          color: s.color || this.lineSeriesColor(si),
          type: 'line',
          suffix: '%'
        });
      }
    });

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      category: catName,
      items
    });
  }

  onMouseLeave() {
    this.activeCategoryIndex.set(null);
    this.tooltip.set(null);
  }

  readonly fmtNum = fmtNum;
}
